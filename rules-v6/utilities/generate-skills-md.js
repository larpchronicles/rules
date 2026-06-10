/**
 * generate-skills-md.js
 * Project: chronicles-rules
 * Creator: Justin Doyle <jdoyle@jmdoyle.com>
 * Date: 6/9/2026
 */
'use strict';

const fs = require('fs');
const path = require('path');

const TIERS = ['primary', 'secondary', 'tertiary'];
const TIER_HEADERS = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

// Per-type config. Type is taken from the filename suffix:
//   <group>-skills.json | <group>-abilities.json | <group>-spells.json
const TYPES = {
    skills:    { word: 'Skills',    groupLabel: 'Skillset', descFile: 'skills.descriptions.md' },
    abilities: { word: 'Abilities', groupLabel: 'Pool',     descFile: 'abilities.descriptions.md' },
    spells:    { word: 'Spells',    groupLabel: 'School',    descFile: 'spells.descriptions.md' },
};
const INPUT_FILE_RE = /-(skills|abilities|spells)\.json$/i;

const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';

function parseArgs(argv) {
    const args = { inputs: [], outDir: null, cost: true, sortTables: false, help: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--out-dir' || arg === '-o') args.outDir = argv[++i];
        else if (arg === '--sort-tables') args.sortTables = true;
        else if (arg === '--no-cost') args.cost = false;
        else if (arg === '--help' || arg === '-h') args.help = true;
        else args.inputs.push(arg);
    }
    return args;
}

function usage() {
    return [
        'Usage: node generate-skills-md.js <file.json> [more.json ...] [options]',
        '       node generate-skills-md.js ./data/   (expands to every recognized *.json inside)',
        '',
        'Recognized inputs (type comes from the filename suffix):',
        '  <skillset>-skills.json      tiered, cost-based skills',
        '  <pool>-abilities.json       leveled pool abilities',
        '  <school>-spells.json        leveled spell-school spells',
        '',
        'For N recognized inputs, writes one <basename>.table.md per input, plus a',
        'merged, name-sorted descriptions file per type present:',
        '  skills.descriptions.md  abilities.descriptions.md  spells.descriptions.md',
        '',
        'Options:',
        '  -o, --out-dir DIR    Output directory (default: dir of first input)',
        '  --sort-tables        Sort table rows alphabetically (default: JSON order)',
        '  --no-cost            Omit the cost line from skill description blocks',
        '  -h, --help           Show this help',
    ].join('\n');
}

// "agility-abilities.json" -> { type: 'abilities', label: 'Agility' }
// "martial-arts-skills.json" -> { type: 'skills', label: 'Martial Arts' }
// returns { type: null } when the filename carries no known suffix.
function classifyInput(filePath) {
    const raw = path.basename(filePath, path.extname(filePath));
    const m = raw.match(/^(.*?)-(skills|abilities|spells)$/i);
    if (!m) return { type: null, label: null };
    const label = m[1]
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return { type: m[2].toLowerCase(), label };
}

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

// "Alchemy 5, Smithing 5, Rune Carving 5" or "None".
function prereqText(skill) {
    const prereqs = Array.isArray(skill.prereqs) ? skill.prereqs : [];
    if (prereqs.length === 0) return 'None';
    return prereqs.map((p) => `${p.name} ${p.ranks}`).join(', ');
}

const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

// Escape free text for a markdown table cell.
const tableCell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ').trim();

function buildTable(type, items, title) {
    const lines = [];
    lines.push(`## ${title}`);
    lines.push('');

    let headers;
    let row;
    if (type === 'skills') {
        headers = ['Skill', ...TIERS.map((t) => TIER_HEADERS[t]), 'Description'];
        row = (s) => [tableCell(s.name), ...TIERS.map((t) => costCell(s.spCosts, t)), tableCell(s.shortDescription)];
    } else if (type === 'abilities') {
        headers = ['Ability', 'Level', 'Duration', 'Verbal'];
        row = (s) => [tableCell(s.name), tableCell(s.level), tableCell(s.duration), tableCell(s.verbal)];
    } else { // spells
        headers = ['Spell', 'Level', 'Duration', 'Incant'];
        row = (s) => [tableCell(s.name), tableCell(s.level), tableCell(s.duration), tableCell(s.incant)];
    }

    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`|${'---|'.repeat(headers.length)}`);
    for (const item of items) lines.push(`|${row(item).join('|')}|`);
    lines.push('');
    return lines.join('\n');
}

// One H3 description block (array of lines) for a single item.
function buildBlock(type, item, groupLabel, includeCost) {
    const HB = '  '; // markdown hard line break (two trailing spaces)
    const lines = [];
    lines.push(`### ${item.name}`);
    lines.push(`**${TYPES[type].groupLabel}**: [${groupLabel}]${HB}`);

    if (type === 'skills') {
        if (includeCost) {
            const cost = costLine(item.spCosts);
            if (cost) lines.push(`${cost}${HB}`);
        }
        lines.push(`**Prerequisites**: ${prereqText(item)}${HB}`);
    } else {
        if (has(item.level)) lines.push(`**Level**: ${item.level}${HB}`);
        if (has(item.duration)) lines.push(`**Duration**: ${item.duration}${HB}`);
        const call = type === 'spells' ? item.incant : item.verbal;
        const callLabel = type === 'spells' ? 'Incant' : 'Verbal';
        if (has(call)) lines.push(`**${callLabel}**: ${call}${HB}`);
    }

    lines.push((item.description || '').trim());
    lines.push('');
    lines.push('---');
    lines.push('');
    return lines;
}

// entries: array of { item, label }, already in the desired order.
function buildDescriptions(type, entries, includeCost) {
    const lines = [];
    for (const { item, label } of entries) {
        lines.push(...buildBlock(type, item, label, includeCost));
    }
    return lines.join('\n');
}

// Expand directory args to their recognized *.json files; pass file args through.
// Dedups by absolute path, preserves first-seen order.
function expandInputs(inputs) {
    const resolved = [];
    for (const input of inputs) {
        let stat;
        try {
            stat = fs.statSync(input);
        } catch (err) {
            console.error(`Error: cannot access ${input}: ${err.message}`);
            process.exit(1);
        }
        if (stat.isDirectory()) {
            const matches = fs
                .readdirSync(input)
                .filter((f) => INPUT_FILE_RE.test(f))
                .sort(byName)
                .map((f) => path.join(input, f));
            if (matches.length === 0) {
                console.error(`Warning: no recognized *-{skills,abilities,spells}.json files found in ${input}`);
            }
            resolved.push(...matches);
        } else {
            resolved.push(input);
        }
    }
    const seen = new Set();
    return resolved.filter((p) => {
        const abs = path.resolve(p);
        if (seen.has(abs)) return false;
        seen.add(abs);
        return true;
    });
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
    const badIndex = items.findIndex((s) => !s || typeof s.name !== 'string');
    if (badIndex !== -1) {
        console.error(`${inputPath}: item at index ${badIndex} is missing a string "name" field.`);
        process.exit(1);
    }
    return items;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help || args.inputs.length === 0) {
        console.log(usage());
        process.exit(args.inputs.length ? 0 : 1);
    }

    const files = expandInputs(args.inputs);
    if (files.length === 0) {
        console.error('No input files resolved (check paths and that directories contain recognized *.json).');
        process.exit(1);
    }

    const outDir = args.outDir
        ? path.resolve(args.outDir)
        : path.dirname(path.resolve(files[0]));
    fs.mkdirSync(outDir, { recursive: true });

    const byType = { skills: [], abilities: [], spells: [] }; // { item, label } per type
    const written = [];

    for (const inputArg of files) {
        const inputPath = path.resolve(inputArg);
        const { type, label } = classifyInput(inputPath);
        if (!type) {
            console.error(
                `Warning: skipping ${path.basename(inputPath)} ` +
                `(expected *-skills.json, *-abilities.json, or *-spells.json).`
            );
            continue;
        }

        const items = loadItems(inputPath);

        const tableItems = args.sortTables
            ? [...items].sort((a, b) => byName(a.name, b.name))
            : items;
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const tablePath = path.join(outDir, `${baseName}.table.md`);
        fs.writeFileSync(tablePath, buildTable(type, tableItems, `${label} ${TYPES[type].word}`));
        written.push(tablePath);

        for (const item of items) byType[type].push({ item, label });
    }

    for (const type of Object.keys(TYPES)) {
        const entries = byType[type];
        if (entries.length === 0) continue;
        entries.sort((a, b) => byName(a.item.name, b.item.name));
        const descPath = path.join(outDir, TYPES[type].descFile);
        fs.writeFileSync(descPath, buildDescriptions(type, entries, args.cost));
        written.push(descPath);
    }

    for (const p of written) console.log(`Wrote ${p}`);
}

main();