/**
 * build-rulebook.js
 * Project: chronicles-rules
 * Creator: Justin Doyle <jdoyle@jmdoyle.com>
 *
 * Pipeline:
 *   1. Read every recognized data JSON and render the four data-driven chapters
 *      (skills / abilities / spells / knowledges) to temp .md files in the build dir.
 *      - Per-group tables at the top; the name cell of each row links to that
 *        item's description block.
 *      - Description blocks are alphabetical across all groups of the type.
 *      - Description headings are flagged out of the TOC.
 *   2. Concatenate every chapter .md (hand-written + generated) in filename order.
 *   3. Generate a Table of Contents from the headings of the compiled body.
 *      - `[!toc-exclude]` omits a heading; `-recursive` omits its subtree too;
 *        `-children-only` keeps the heading but omits its subtree.
 *      - `[!toc-collapse]` / `[!toc-expand]` set default expansion state in the
 *        nested heading-index JSON (for the HTML/PDF generator). The markdown TOC
 *        itself stays fully expanded.
 *   4. Prepend the TOC to the compiled body.
 *   5. Strip the tags (generator-only instructions) from the output, and write the
 *      nested heading index to <out>.toc.json.
 */
'use strict';

const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ config */

const TIERS = ['primary', 'secondary', 'tertiary'];
const TIER_HEADERS = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

// Per-type rendering config. `kind` selects the table/description layout.
const TYPES = {
    skills:     { word: 'Skills',     groupLabel: 'Skillset', kind: 'skill' },
    abilities:  { word: 'Abilities',  groupLabel: 'Pool',     kind: 'leveled' },
    spells:     { word: 'Spells',     groupLabel: 'School',   kind: 'leveled' },
    knowledges: { word: 'Knowledges', groupLabel: null,       kind: 'plain' },
};

// Which chapter each type renders into. Output filenames sort the generated
// chapters into their place among the hand-written ones.
const CHAPTERS = {
    skills:     { out: '01.04_skills.md',     title: 'Skills' },
    abilities:  { out: '01.05_abilities.md',  title: 'Ability Reference' },
    spells:     { out: '01.06_spells.md',     title: 'Spells' },
    knowledges: { out: '01.07_knowledges.md', title: 'Knowledges' },
};

// A hand-written chapter is any source file matching this. The old hand-written
// TOC is excluded by name (the generated TOC replaces it).
const CHAPTER_FILE_RE = /^\d{2}\.\d{2}_.+\.md$/i;
const DATA_FILE_RE = /\.json$/i;
const DEFAULT_EXCLUDES = ['00.00_toc.md'];

// The glossary is generated last and sorts to the end of the book.
const GLOSSARY_OUT = '08.01_glossary.md';

const HB = '  '; // markdown hard line break (two trailing spaces)

/* --------------------------------------------------------------- utilities */

const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

// Escape free text for a markdown table cell.
const tableCell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ').trim();

// GitHub-style heading slug. NOTE: this must match whatever the rulebook's
// HTML renderer uses for heading ids. If links resolve wrong, this is the one
// function to change.
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // drop punctuation/symbols (keeps a-z 0-9 _ space -)
        .replace(/\s+/g, '-');
}

// Returns a stateful slugger that appends -1, -2, ... to duplicate slugs,
// exactly as GitHub does, in call order.
function makeSlugger() {
    const counts = new Map();
    return (text) => {
        const base = slugify(text);
        const n = counts.get(base) || 0;
        counts.set(base, n + 1);
        return n === 0 ? base : `${base}-${n}`;
    };
}

/* ----------------------------------------------------------- cost helpers  */

// Returns "base", "base+increment", or "" for a single tier.
function costCell(spCosts, tier) {
    const base = spCosts && spCosts.base ? spCosts.base[tier] : undefined;
    if (!has(base)) return '';
    const inc = spCosts && spCosts.increment ? spCosts.increment[tier] : undefined;
    if (!has(inc)) return String(base);
    return `${base}+${inc}`;
}

// "**Primary**: 1+1 **Secondary**: 2+1 **Tertiary**: 3+1", present tiers only.
function metaCostLine(spCosts) {
    return TIERS
        .filter((t) => costCell(spCosts, t) !== '')
        .map((t) => `**${TIER_HEADERS[t]}**: ${costCell(spCosts, t)}`)
        .join(' ');
}

// Full cost line for a skill block. Primary cost of 0 -> "**Cost**: Free".
function costLine(spCosts) {
    const primaryBase = spCosts && spCosts.base ? spCosts.base.primary : undefined;
    if (has(primaryBase) && String(primaryBase).trim() === '0') return '**Cost**: Free';
    const tiers = metaCostLine(spCosts);
    return tiers ? `**Cost**: ${tiers}` : null;
}

// "Alchemy 5, Smithing 5" or "None".
function prereqText(skill) {
    const prereqs = Array.isArray(skill.prereqs) ? skill.prereqs : [];
    if (prereqs.length === 0) return 'None';
    return prereqs.map((p) => `${p.name} ${p.ranks}`).join(', ');
}

/* ------------------------------------------------------- link plumbing     */
//
// Description headings are emitted with a sentinel comment carrying a stable
// key (type|name). Table name cells are emitted as [[XLINK:i]] tokens.
// After the whole book is assembled we walk it once, compute every heading's
// final slug (so duplicate names across chapters get the right -N suffix), map
// each description key to its slug, then resolve the tokens. The sentinels and
// the exclusion tags are stripped from the final output.

// A `†` is appended to displayed names of self-only items. It is presentation
// only: it is never part of `item.name`, so slugs, sorting, dedup, and link keys
// all use the clean name.
const displayName = (item) => `${item.name}${item.selfOnly ? '†' : ''}`;

// Items that share a name within a type are the same thing, so they share one
// description block and one anchor. Keying by (type, name) — not group — makes
// every table row for that name resolve to the single block.
const descKey = (type, name) => `${type}|${name}`;
const descSentinel = (type, name) => `<!--@desc:${descKey(type, name)}-->`;

/* ----------------------------------------------------- table construction  */

function buildTable(type, items, title, linkRefs) {
    const kind = TYPES[type].kind;
    const lines = title ? [`## ${title}`, ''] : [];

    // The name cell becomes a link placeholder pointing at this item's block.
    const nameCell = (item) => {
        const i = linkRefs.length;
        linkRefs.push({ key: descKey(type, item.name), display: tableCell(displayName(item)) });
        return `[[XLINK:${i}]]`;
    };

    let headers;
    let row;
    if (kind === 'plain') { // knowledges: linked-name index, no other columns
        headers = ['Knowledge'];
        row = (s) => [nameCell(s)];
    } else if (kind === 'skill') {
        headers = ['Skill', ...TIERS.map((t) => TIER_HEADERS[t]), 'Description'];
        row = (s) => [nameCell(s), ...TIERS.map((t) => costCell(s.spCosts, t)), tableCell(s.shortDescription)];
    } else if (type === 'abilities') {
        headers = ['Ability', 'Level', 'Duration', 'Verbal'];
        row = (s) => [nameCell(s), tableCell(s.level), tableCell(s.duration), tableCell(s.verbal)];
    } else { // spells
        headers = ['Spell', 'Level', 'Duration', 'Incant'];
        row = (s) => [nameCell(s), tableCell(s.level), tableCell(s.duration), tableCell(s.incant)];
    }

    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`|${'---|'.repeat(headers.length)}`);
    for (const item of items) lines.push(`|${row(item).join('|')}|`);
    lines.push('');
    return lines.join('\n');
}

/* ------------------------------------------------ description construction  */

// One H3 description block for a single item. `groups` is every group the item
// appears in (one block is shared across them). The heading carries the sentinel
// (keyed by clean name) so the assembler can map its slug back to the table link.
function buildBlock(type, item, groups, includeCost) {
    const lines = [];
    lines.push(`### ${displayName(item)}${descSentinel(type, item.name)}`);

    const groupTag = groups.map((g) => `[${g}]`).join(' ');
    const kind = TYPES[type].kind;
    if (kind === 'skill') {
        lines.push(`**${TYPES[type].groupLabel}**: ${groupTag}${HB}`);
        if (includeCost) {
            const cost = costLine(item.spCosts);
            if (cost) lines.push(`${cost}${HB}`);
        }
        lines.push(`**Prerequisites**: ${prereqText(item)}${HB}`);
    } else if (kind === 'leveled') {
        lines.push(`**${TYPES[type].groupLabel}**: ${groupTag}${HB}`);
        if (has(item.level)) lines.push(`**Level**: ${item.level}${HB}`);
        if (has(item.duration)) lines.push(`**Duration**: ${item.duration}${HB}`);
        const call = type === 'spells' ? item.incant : item.verbal;
        const callLabel = type === 'spells' ? 'Incant' : 'Verbal';
        if (has(call)) lines.push(`**${callLabel}**: ${call}${HB}`);
    }
    // kind === 'plain' (knowledges): heading + description only.

    lines.push((item.description || '').trim());
    lines.push('');
    lines.push('---');
    lines.push('');
    return lines.join('\n');
}

/* ---------------------------------------------------------- input resolving */
//
// --src and --data each accept one or more tokens; every token may be a
// directory, a glob, or a plain file. Directory tokens are scanned and filtered
// by the caller's pattern (so a bare chapters/ dir auto-narrows to NN.NN_*.md);
// glob and file tokens are taken as given. Shells also expand unquoted globs
// into multiple file tokens, which is handled too.

const GLOB_CHARS = /[*?[\]{}]/;
const isGlob = (s) => GLOB_CHARS.test(s);
const reEscape = (s) => s.replace(/[.+^${}()|\\]/g, '\\$&');

// Translate one glob path segment to an anchored RegExp (supports * ? [] {}).
function segToRegExp(seg) {
    let re = '^';
    for (let i = 0; i < seg.length; i++) {
        const c = seg[i];
        if (c === '*') re += '[^/]*';
        else if (c === '?') re += '[^/]';
        else if (c === '[') {
            let j = i + 1;
            let cls = '[';
            if (seg[j] === '!' || seg[j] === '^') { cls += '^'; j++; }
            while (j < seg.length && seg[j] !== ']') { cls += seg[j]; j++; }
            re += `${cls}]`;
            i = j;
        } else if (c === '{') {
            let j = i + 1;
            let alts = '';
            while (j < seg.length && seg[j] !== '}') { alts += seg[j] === ',' ? '|' : reEscape(seg[j]); j++; }
            re += `(?:${alts})`;
            i = j;
        } else re += reEscape(c);
    }
    return new RegExp(`${re}$`);
}

// d and every directory beneath it (for the ** segment).
function descendantDirs(d) {
    const out = [d];
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) if (e.isDirectory()) out.push(...descendantDirs(path.join(d, e.name)));
    return out;
}

// Minimal glob, used only when fs.globSync is unavailable (Node < 22).
function globFallback(pattern) {
    const abs = path.resolve(pattern);
    const root = path.parse(abs).root || path.sep;
    const segs = abs.slice(root.length).split(path.sep).filter(Boolean);
    let dirs = [root];
    segs.forEach((seg, idx) => {
        const last = idx === segs.length - 1;
        const next = [];
        for (const d of dirs) {
            if (seg === '**') { next.push(...descendantDirs(d)); continue; }
            if (isGlob(seg)) {
                let entries;
                try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
                const re = segToRegExp(seg);
                for (const e of entries) {
                    if (!re.test(e.name)) continue;
                    const full = path.join(d, e.name);
                    if (last ? e.isFile() : e.isDirectory()) next.push(full);
                }
            } else {
                const full = path.join(d, seg);
                try {
                    const st = fs.statSync(full);
                    if (last ? st.isFile() : st.isDirectory()) next.push(full);
                } catch { /* no match on this branch */ }
            }
        }
        dirs = next;
    });
    return [...new Set(dirs)];
}

function globExpand(pattern) {
    if (typeof fs.globSync === 'function') {
        try {
            return fs.globSync(pattern).filter((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
        } catch (e) {
            console.error(`Warning: glob "${pattern}" failed (${e.message}); using fallback.`);
        }
    }
    return globFallback(pattern);
}

// Resolve --src/--data tokens to a unique, ordered list of files. Every file is
// held to `dirFilter` (the naming convention the assembler relies on) however it
// was specified — directory scan, glob, or shell-expanded list — so the three
// forms behave identically. An explicitly named file that fails the filter is
// reported rather than silently dropped. `label` is the human form for messages.
function resolveInputs(tokens, dirFilter, label) {
    const candidates = []; // { path, explicit }
    for (const token of tokens) {
        let stat = null;
        try { stat = fs.statSync(token); } catch { /* not a literal path */ }
        if (stat && stat.isDirectory()) {
            fs.readdirSync(token).sort(byName).forEach((f) => candidates.push({ path: path.join(token, f), explicit: false }));
        } else if (stat && stat.isFile()) {
            candidates.push({ path: token, explicit: true });
        } else if (isGlob(token)) {
            const matches = globExpand(token).sort(byName);
            if (matches.length === 0) console.error(`Warning: glob "${token}" matched nothing.`);
            matches.forEach((p) => candidates.push({ path: p, explicit: false }));
        } else {
            console.error(`Warning: "${token}" is not a file, directory, or matching glob.`);
        }
    }
    const seen = new Set();
    const out = [];
    for (const { path: p, explicit } of candidates) {
        if (!dirFilter.test(path.basename(p))) {
            if (explicit) console.error(`Warning: ignoring "${p}" (expected ${label}).`);
            continue;
        }
        const abs = path.resolve(p);
        if (seen.has(abs)) continue; // dedup by absolute path, keep first-seen order
        seen.add(abs);
        out.push(p);
    }
    return out;
}

/* ----------------------------------------------------- data file loading   */

// "agility-abilities" -> { type:'abilities', label:'Agility' }
// "knowledges"        -> { type:'knowledges', label:null }
function classifyInput(filePath) {
    const raw = path.basename(filePath, path.extname(filePath));
    const m = raw.match(/^(.*?)-(skills|abilities|spells)$/i);
    if (m) {
        const label = m[1].replace(/[_-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
        return { type: m[2].toLowerCase(), label };
    }
    if (raw.toLowerCase() === 'knowledges') return { type: 'knowledges', label: null };
    return { type: null, label: null };
}

function loadItems(inputPath) {
    let items;
    try {
        items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    } catch (err) {
        console.error(`Error reading/parsing ${inputPath}: ${err.message}`);
        process.exit(1);
    }
    if (!Array.isArray(items)) {
        console.error(`${inputPath}: expected the JSON root to be an array of objects.`);
        process.exit(1);
    }
    const bad = items.findIndex((s) => !s || typeof s.name !== 'string');
    if (bad !== -1) {
        console.error(`${inputPath}: item at index ${bad} is missing a string "name" field.`);
        process.exit(1);
    }
    return items;
}

// Bucket recognized JSON files by type, sorted by basename so group order is
// stable (alphabetical) regardless of how the files were specified.
function collectData(files) {
    const buckets = { skills: [], abilities: [], spells: [], knowledges: [] };
    const sorted = [...files].sort((a, b) => byName(path.basename(a), path.basename(b)));
    for (const full of sorted) {
        const { type, label } = classifyInput(full);
        if (!type) {
            console.error(`Note: skipping ${path.basename(full)} (not a *-{skills,abilities,spells}.json or knowledges.json).`);
            continue;
        }
        buckets[type].push({ label, items: loadItems(full) });
    }
    return buckets;
}

/* --------------------------------------------------- data chapter render   */

// Render one data-driven chapter to markdown (tables with link placeholders +
// alphabetical description blocks). Pushes table link refs onto `linkRefs`.
function renderDataChapter(type, title, groups, opts, linkRefs) {
    const parts = [`# ${title}`, ''];

    if (TYPES[type].kind === 'plain') {
        // knowledges: one merged, name-sorted index table directly under the H1.
        const items = groups.flatMap((g) => g.items);
        const sorted = [...items].sort((a, b) => byName(a.name, b.name));
        parts.push(buildTable(type, sorted, null, linkRefs));
    } else {
        // Tables, one per group, in collection (alphabetical) order.
        for (const { label, items } of groups) {
            const tableItems = opts.sortTables ? [...items].sort((a, b) => byName(a.name, b.name)) : items;
            parts.push(buildTable(type, tableItems, `${label} ${TYPES[type].word}`, linkRefs));
        }
    }

    // One description block per distinct name across all groups of this type.
    // A name shared by several groups (e.g. Parry in Agility + Stamina) yields a
    // single block tagged with every group it belongs to. Identity is asserted
    // by the data; we warn if a later duplicate's content actually differs.
    const blocks = new Map(); // name -> { item, groups: [] }
    for (const { label, items } of groups) {
        for (const item of items) {
            const existing = blocks.get(item.name);
            if (!existing) {
                blocks.set(item.name, { item, groups: [label] });
            } else {
                if (!existing.groups.includes(label)) existing.groups.push(label);
                if (itemSignature(existing.item) !== itemSignature(item)) {
                    console.error(`Warning: ${type} "${item.name}" differs between ${existing.groups.join('/')}; keeping first occurrence.`);
                }
            }
        }
    }

    const uniq = [...blocks.values()].sort((a, b) => byName(a.item.name, b.item.name));
    if (uniq.length) {
        parts.push('---', '');
        for (const { item, groups: gs } of uniq) {
            parts.push(buildBlock(type, item, gs, opts.cost));
        }
    }

    return parts.join('\n');
}

// Content signature used to detect when two same-named items are NOT actually
// identical. Excludes the group field (pool/school/skillset), which legitimately
// differs between the shared copies.
function itemSignature(item) {
    const { pool, school, skillset, group, ...rest } = item;
    return JSON.stringify(rest);
}

/* --------------------------------------------------------- glossary build  */
//
// The glossary is a quick-reference appendix. Spell/ability charts are derived
// straight from the JSON (preserving JSON order). The skill cost tables regroup
// the skillsets editorially, so they are driven by the config below. The Spell
// Incants table is not present in any JSON, so it is appended verbatim as a
// hand-maintained tail.

// Hand-maintained section(s) appended after the generated charts. Not derivable
// from the data.
const GLOSSARY_TAIL = `### Spell Incants
| Incants |
|---|
| _I call upon Nature to..._ |
| _I call upon the spirits to..._ |
| _I command you to..._ |
| _I conjure a..._ |
| _I curse you with..._ |
| _I grant you the gift of..._ |
| _I grant you the power of..._ |
| _I rain destruction about you all!_ |
| _I set your doom upon you_ |
| _I call forth mystic force to..._ |
| _With arcane forces I..._ |
`;

// Glossary cells escape pipe + angle brackets and collapse whitespace.
const gCell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/</g, '\\<').replace(/\s*\n+\s*/g, ' ').trim();
const gItalic = (v) => { const s = gCell(v); return s ? `_${s}_` : ''; };

// Sorted (numeric) list of distinct levels present across the given groups.
function levelsOf(groups) {
    const set = new Set();
    for (const g of groups) for (const it of g.items) if (has(it.level)) set.add(String(it.level));
    return [...set].sort((a, b) => Number(a) - Number(b));
}

// Level x group cross-tab; names within a cell are JSON order, <br>-joined.
function buildGrid(groups, levels) {
    const cols = groups.map((g) => g.label);
    const lines = [`| Level | ${cols.join(' | ')} |`, `|${'---|'.repeat(cols.length + 1)}`];
    for (const lvl of levels) {
        const cells = groups.map((g) =>
            g.items.filter((it) => String(it.level) === lvl).map((it) => gCell(displayName(it))).join('<br>'));
        lines.push(`| ${lvl} |${cells.join('|')}|`);
    }
    return lines.join('\n');
}

// Per-school/pool quick table. `callField` is 'incant' or 'verbal'.
function buildCallTable(group, nameHeader, callHeader, callField, align) {
    const sep = align ? '|---:|---|:---|' : '|---|---|---|';
    const lines = [`| Level | ${nameHeader} | ${callHeader} |`, sep];
    for (const it of group.items) {
        lines.push(`| ${gCell(it.level)} | ${gCell(displayName(it))} | ${gItalic(it[callField])} |`);
    }
    return lines.join('\n');
}

// Cost-only skill table (no description column).
function buildSkillCostTable(items) {
    const lines = ['| Skill | Primary | Secondary | Tertiary |', '|---|---|---|---|'];
    for (const s of items) {
        lines.push(`|${gCell(displayName(s))}|${costCell(s.spCosts, 'primary')}|${costCell(s.spCosts, 'secondary')}|${costCell(s.spCosts, 'tertiary')}|`);
    }
    return lines.join('\n');
}

// One cost table per skillset, in collection order — same grouping as the
// Skills chapter, just without the description column.
function buildGlossarySkills(skillGroups) {
    const out = [];
    for (const { label, items } of skillGroups) {
        if (items.length === 0) continue;
        out.push(`### ${label} Skills`, '', buildSkillCostTable(items), '');
    }
    return out.join('\n');
}

// Assemble the whole glossary chapter from the collected buckets.
function renderGlossary(buckets) {
    const parts = ['# Glossary', '', '## Reference Charts', ''];

    if (buckets.spells.length) {
        parts.push('### Spells', '', buildGrid(buckets.spells, levelsOf(buckets.spells)), '');
        for (const g of buckets.spells) {
            parts.push(`#### ${g.label} Spells`, '', buildCallTable(g, 'Spell', 'Incant', 'incant', true), '');
        }
    }
    if (buckets.abilities.length) {
        parts.push('### Abilities', '', buildGrid(buckets.abilities, levelsOf(buckets.abilities)), '');
        for (const g of buckets.abilities) {
            parts.push(`#### ${g.label} Abilities`, '', buildCallTable(g, 'Ability', 'Verbal', 'verbal', false), '');
        }
    }
    if (buckets.skills.length) {
        parts.push(buildGlossarySkills(buckets.skills));
    }

    parts.push(GLOSSARY_TAIL);
    return parts.join('\n');
}

/* ------------------------------------------------------- chapter assembly  */

// Return the ordered list of { name, text } chapters: the resolved source files
// (minus excludes and minus the names we generate) plus the freshly generated
// data chapters, all sorted by filename.
function assembleChapters(srcFiles, generated, excludes) {
    const generatedNames = new Set([...Object.values(CHAPTERS).map((c) => c.out), GLOSSARY_OUT]);
    const excludeSet = new Set(excludes.map((e) => e.toLowerCase()));

    const handwritten = srcFiles
        .filter((p) => {
            const base = path.basename(p);
            return !excludeSet.has(base.toLowerCase()) && !generatedNames.has(base);
        })
        .map((p) => ({ name: path.basename(p), text: fs.readFileSync(p, 'utf8') }));

    const all = [...handwritten, ...generated];
    all.sort((a, b) => byName(a.name, b.name));
    return all;
}

/* ------------------------------------------------------------- TOC + links */

// Per-heading TOC tags (all stripped from the final output):
//   [!toc-exclude]                 omit this heading
//   [!toc-exclude-recursive]       omit this heading and its whole subtree
//   [!toc-exclude-children-only]   keep this heading, omit its subtree
//   [!toc-collapse]               present, but collapsed by default (subtree hidden)
//   [!toc-expand]                present and expanded; force-opens its ancestors
// "Subtree" = every following heading deeper than this one, until a heading at
// this level or shallower closes the scope.
//
// Block-level placement tag (not a heading tag):
//   [!toc]   marks where the rendered TOC is inserted in the PDF artifact;
//            stripped from the web artifact (web navigation comes from .toc.json).
const TOC_EXCLUDE_SELF = /\[!toc-exclude\]/;
const TOC_EXCLUDE_RECURSIVE = /\[!toc-exclude-recursive\]/;
const TOC_EXCLUDE_CHILDREN = /\[!toc-exclude-children-only\]/;
const TOC_COLLAPSED = /\[!toc-collapse\]/;
const TOC_EXPANDED = /\[!toc-expand\]/;
// Matches any of the per-heading tags for stripping from heading text.
const TOC_TAG_RE = /\[!toc-(?:exclude(?:-recursive|-children-only)?|collapse|expand)\]/g;

// Walk the assembled body once: compute each heading's final slug (fence-aware),
// drop excluded headings, and map every description sentinel to its slug. Returns
// the surviving headings both as a flat list (for the markdown TOC) and as a
// nested tree carrying default expansion state (for the HTML/PDF generator). The
// markdown TOC is the full expanded view; collapse lives only in the tree.
function indexHeadings(body, { tocDepth, collapseDepth }) {
    const slugger = makeSlugger();
    const descSlugs = new Map();
    const flat = []; // surviving headings, in document order
    const suppress = []; // levels of headings currently excluding their subtree
    let inFence = false;

    for (const line of body.split('\n')) {
        const fence = line.match(/^\s*(```|~~~)/);
        if (fence) { inFence = !inFence; continue; }
        if (inFence) continue;

        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (!h) continue;

        const level = h[1].length;
        const raw = h[2];

        while (suppress.length && suppress[suppress.length - 1] >= level) suppress.pop();
        const hiddenByAncestor = suppress.length > 0;

        const sentinel = raw.match(/<!--@desc:([^>]*)-->/);
        const exclRecursive = TOC_EXCLUDE_RECURSIVE.test(raw);
        const exclChildren = TOC_EXCLUDE_CHILDREN.test(raw);
        const exclSelf = TOC_EXCLUDE_SELF.test(raw);

        // Generated description blocks (sentinel) are always kept out of the TOC.
        const excludeSelf = hiddenByAncestor || !!sentinel || exclSelf || exclRecursive;
        if (exclRecursive || exclChildren) suppress.push(level);

        const clean = raw.replace(/<!--@desc:[^>]*-->/g, '').replace(TOC_TAG_RE, '').trim();
        const slug = slugger(clean);
        if (sentinel) descSlugs.set(sentinel[1], slug);

        if (!excludeSelf && level <= tocDepth) {
            flat.push({ level, text: clean, slug, tagCollapsed: TOC_COLLAPSED.test(raw), tagExpanded: TOC_EXPANDED.test(raw) });
        }
    }

    const tree = buildHeadingTree(flat, collapseDepth);
    const toc = flat.map(({ level, text, slug }) => ({ level, text, slug }));
    return { toc, tree, descSlugs };
}

// Nest the flat headings by level into a forest, then assign each node a default
// `expanded` state: explicit tag wins; otherwise a node inherits "collapsed" from
// a collapsed ancestor, or falls back to the --collapse-depth baseline. Finally,
// an explicitly expanded node force-opens its ancestor chain so it stays visible.
function buildHeadingTree(flat, collapseDepth) {
    const roots = [];
    const stack = [];
    for (const n of flat) {
        n.children = [];
        while (stack.length && stack[stack.length - 1].level >= n.level) stack.pop();
        (stack.length ? stack[stack.length - 1].children : roots).push(n);
        stack.push(n);
    }
    const minLevel = flat.length ? Math.min(...flat.map((n) => n.level)) : 1;

    const assign = (node, region) => {
        if (node.tagExpanded) node.expanded = true;
        else if (node.tagCollapsed) node.expanded = false;
        else node.expanded = region === 'collapsed' ? false : (node.level - minLevel) < collapseDepth;
        const childRegion = node.tagCollapsed ? 'collapsed' : node.tagExpanded ? 'expanded' : region;
        for (const c of node.children) assign(c, childRegion);
    };
    for (const r of roots) assign(r, 'expanded');

    const forceOpen = (node, ancestors) => {
        if (node.tagExpanded) for (const a of ancestors) a.expanded = true;
        for (const c of node.children) forceOpen(c, [...ancestors, node]);
    };
    for (const r of roots) forceOpen(r, []);

    const prune = (node) => ({ text: node.text, slug: node.slug, level: node.level, expanded: node.expanded, children: node.children.map(prune) });
    return roots.map(prune);
}

function renderToc(entries, { links, indent, title }) {
    if (entries.length === 0) return `# ${title}\n`;
    const minLevel = Math.min(...entries.map((e) => e.level));
    const lines = [`# ${title}`, ''];
    for (const e of entries) {
        const pad = indent.repeat(e.level - minLevel);
        const label = links ? `[${e.text}](#${e.slug})` : e.text;
        lines.push(`${pad}- ${label}`);
    }
    lines.push('');
    return lines.join('\n');
}

function resolveLinks(body, linkRefs, descSlugs) {
    const missing = [];
    const resolved = body.replace(/\[\[XLINK:(\d+)\]\]/g, (_, i) => {
        const ref = linkRefs[Number(i)];
        const slug = descSlugs.get(ref.key);
        if (!slug) { missing.push(ref.key); return ref.display; } // no link if block missing
        return `[${ref.display}](#${slug})`;
    });
    if (missing.length) {
        const uniq = [...new Set(missing)];
        console.error(`Warning: ${missing.length} table link(s) had no matching description block: ${uniq.slice(0, 5).join(', ')}${uniq.length > 5 ? ' ...' : ''}`);
    }
    return resolved;
}

// Remove generator-only artifacts from the final text.
function stripMarkers(body) {
    return body
        .replace(/<!--@desc:[^>]*-->/g, '')
        .replace(/[ \t]*\[!toc-(?:exclude(?:-recursive|-children-only)?|collapse|expand)\]/g, '')
        .replace(/^\[!toc\][ \t]*\n?/mg, '');
}

/* --------------------------------------------------------- meta-tag fill-in */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function loadVersion() {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'version.json'), 'utf8'));
        return data.version || null;
    } catch {
        return null;
    }
}

function formatBuildDate() {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Replace bare [!Version] and [!Date] lines with their build-time values.
// Only replaces lines where the tag stands alone (no existing value), so
// re-running on already-stamped text is safe.
function substituteMetaTags(text, version, date) {
    let out = text;
    if (version) out = out.replace(/^\[!Version\][ \t]*$/m, `[!Version] v${version}`);
    if (date)    out = out.replace(/^\[!Date\][ \t]*$/m,    `[!Date] ${date}`);
    return out;
}

/* -------------------------------------------------------------------- CLI  */

function parseArgs(argv) {
    const args = {
        src: [], data: [], out: null, build: null,
        cost: true, sortTables: false, tocLinks: true, tocDepth: 6, noGlossary: false,
        collapseDepth: Infinity, tocJson: true,
        excludes: [...DEFAULT_EXCLUDES], help: false,
    };
    // Collect values after a multi-value flag until the next option or the end.
    const take = (i) => {
        const vals = [];
        while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) vals.push(argv[++i]);
        return [vals, i];
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--src') { const [v, ni] = take(i); args.src.push(...v); i = ni; }
        else if (a === '--data') { const [v, ni] = take(i); args.data.push(...v); i = ni; }
        else if (a === '--out' || a === '-o') args.out = argv[++i];
        else if (a === '--build') args.build = argv[++i];
        else if (a === '--no-cost') args.cost = false;
        else if (a === '--sort-tables') args.sortTables = true;
        else if (a === '--no-toc-links') args.tocLinks = false;
        else if (a === '--no-glossary') args.noGlossary = true;
        else if (a === '--toc-depth') args.tocDepth = parseInt(argv[++i], 10);
        else if (a === '--collapse-depth') args.collapseDepth = parseInt(argv[++i], 10);
        else if (a === '--toc-json') args.tocJson = argv[++i];
        else if (a === '--no-toc-json') args.tocJson = false;
        else if (a === '--exclude') args.excludes.push(argv[++i]);
        else if (a === '--help' || a === '-h') args.help = true;
        else console.error(`Note: ignoring unrecognized argument "${a}".`);
    }
    return args;
}

function usage() {
    return [
        'Usage: node build-rulebook.js --src <dir|glob ...> --data <dir|glob ...> --out <file.md> [options]',
        '',
        'Generates the skills/abilities/spells/knowledges chapters from JSON, stitches',
        'every chapter together, builds a Table of Contents from the headings, and',
        'writes the compiled rulebook to --out.',
        '',
        'Inputs (each accepts a directory, a glob, or a list of files; repeatable):',
        '  --src DIR|GLOB     Chapter/section .md files, held to NN.NN_*.md however',
        '                     specified (so *.md skips style guides, old builds, etc.).',
        '                     e.g. --src ./chapters   or   --src "./chapters/01.*.md"',
        '  --data DIR|GLOB    Skill/spell/etc JSON files (classified by filename).',
        '                     e.g. --data ./data      or   --data "./data/*-spells.json"',
        '  -o, --out FILE     Compiled output path (required)',
        '',
        'Options:',
        '  --build DIR        Where to write the temp generated chapters (default: out dir)',
        '  --toc-depth N      Deepest heading level shown in the TOC (default: 6)',
        '  --collapse-depth N Headings deeper than N levels are collapsed by default in',
        '                     the heading-index tree (default: none; all expanded)',
        '  --toc-json FILE    Write the nested heading index here (default: <out>.toc.json)',
        '  --no-toc-json      Do not write the heading-index JSON',
        '  --no-toc-links     Plain-text TOC entries instead of anchor links',
        '  --no-glossary      Skip generating the glossary appendix chapter',
        '  --no-cost          Omit the cost line from skill description blocks',
        '  --sort-tables      Sort table rows alphabetically (default: JSON order)',
        '  --exclude FILE     Additional chapter filename to skip (repeatable)',
        '  -h, --help         Show this help',
        '',
        'Quote globs to let the script expand them (./x/*.md); unquoted globs are',
        'expanded by your shell into a file list, which also works.',
        '',
        'Per-heading TOC tags (stripped from the compiled output):',
        '  [!toc-exclude]                 omit this heading',
        '  [!toc-exclude-recursive]       omit this heading and its whole subtree',
        '  [!toc-exclude-children-only]   keep this heading, omit its subtree',
        '  [!toc-collapse]               present, collapsed by default (HTML index)',
        '  [!toc-expand]                present, expanded; force-opens its ancestors',
        '',
        'Block-level placement tag:',
        '  [!toc]   marks where the rendered TOC is inserted in the PDF artifact',
        '           (<out>-pdf.md). Stripped from the web artifact. Allows the',
        '           metadata chapter (title, credits, dedication) to appear before',
        '           the TOC in print without special-casing that chapter in the reader.',
        '',
        'Collapse state is carried in the heading-index JSON for the web sidebar.',
    ].join('\n');
}

/* ------------------------------------------------------------------- main  */

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) { console.log(usage()); process.exit(0); }
    if (args.src.length === 0 || args.data.length === 0 || !args.out) {
        console.error('Error: --src, --data, and --out are all required.\n');
        console.error(usage());
        process.exit(1);
    }

    const srcFiles = resolveInputs(args.src, CHAPTER_FILE_RE, 'NN.NN_*.md');
    const dataFiles = resolveInputs(args.data, DATA_FILE_RE, '*.json');
    if (srcFiles.length === 0) { console.error('Error: --src resolved to no files.'); process.exit(1); }
    if (dataFiles.length === 0) { console.error('Error: --data resolved to no files.'); process.exit(1); }

    const outPath = path.resolve(args.out);
    const buildDir = args.build ? path.resolve(args.build) : path.dirname(outPath);
    fs.mkdirSync(buildDir, { recursive: true });

    // 1) Render data chapters to temp files, collecting table link refs.
    const buckets = collectData(dataFiles);
    const linkRefs = [];
    const generated = [];
    const opts = { cost: args.cost, sortTables: args.sortTables };

    for (const type of Object.keys(CHAPTERS)) {
        const groups = buckets[type];
        if (!groups || groups.length === 0) continue;
        const { out, title } = CHAPTERS[type];
        const text = renderDataChapter(type, title, groups, opts, linkRefs);
        const tmpPath = path.join(buildDir, out);
        fs.writeFileSync(tmpPath, text);
        generated.push({ name: out, text });
        console.log(`Generated ${tmpPath}`);
    }

    if (!args.noGlossary) {
        const text = renderGlossary(buckets);
        const tmpPath = path.join(buildDir, GLOSSARY_OUT);
        fs.writeFileSync(tmpPath, text);
        generated.push({ name: GLOSSARY_OUT, text });
        console.log(`Generated ${tmpPath}`);
    }

    // 2) Stitch all chapters in filename order.
    const chapters = assembleChapters(srcFiles, generated, args.excludes);
    let body = chapters.map((c) => c.text.replace(/\s+$/, '')).join('\n\n') + '\n';
    body = substituteMetaTags(body, loadVersion(), formatBuildDate());

    // 3) Index headings -> flat TOC + nested tree + description slugs.
    const { toc, tree, descSlugs } = indexHeadings(body, { tocDepth: args.tocDepth, collapseDepth: args.collapseDepth });

    // 4) Resolve table links; build TOC text for both artifact variants.
    const compiled = resolveLinks(body, linkRefs, descSlugs);
    const tocText = renderToc(toc, { links: args.tocLinks, indent: '\t', title: 'Table of Contents' });

    // PDF artifact: replace [!toc] with the rendered bullet list, then strip
    // remaining markers. This lets the metadata chapter (title, credits,
    // dedication) appear before the TOC in the print/PDF version.
    const TOC_PLACEMENT = /^\[!toc\][ \t]*$/m;
    if (TOC_PLACEMENT.test(compiled)) {
        const pdfBody = stripMarkers(compiled.replace(TOC_PLACEMENT, tocText.trimEnd()));
        const ext = path.extname(outPath);
        const pdfPath = path.join(
            path.dirname(outPath),
            `${path.basename(outPath, ext)}-pdf${ext}`,
        );
        fs.writeFileSync(pdfPath, pdfBody);
        console.log(`Wrote PDF artifact -> ${pdfPath}`);
    }

    // Web artifact: strip [!toc] (and all other markers). The web reader builds
    // its own navigation from the .toc.json data; no inline TOC is needed.
    const webBody = stripMarkers(compiled);
    fs.writeFileSync(outPath, webBody);
    console.log(`\nCompiled ${chapters.length} chapters + TOC (${toc.length} entries) -> ${outPath}`);

    // 5) Write the nested heading index (carries collapse state) for the sidebar.
    if (args.tocJson !== false) {
        const jsonPath = typeof args.tocJson === 'string'
            ? path.resolve(args.tocJson)
            : path.join(path.dirname(outPath), `${path.basename(outPath, path.extname(outPath))}.toc.json`);
        fs.writeFileSync(jsonPath, `${JSON.stringify({ headings: tree }, null, 2)}\n`);
        console.log(`Wrote heading index -> ${jsonPath}`);
    }
}

main();