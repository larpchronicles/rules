#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const TIERS = ['primary', 'secondary', 'tertiary'];
const TIER_HEADERS = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' };

function parseArgs(argv) {
    const args = {
        inputs: [],
        outDir: null,
        descName: 'all-skills.descriptions.md',
        descTitle: 'Skills',
        cost: true,
        sortTables: false,
        help: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--out-dir' || arg === '-o') args.outDir = argv[++i];
        else if (arg === '--desc-name') args.descName = argv[++i];
        else if (arg === '--desc-title') args.descTitle = argv[++i];
        else if (arg === '--sort-tables') args.sortTables = true;
        else if (arg === '--no-cost') args.cost = false;
        else if (arg === '--help' || arg === '-h') args.help = true;
        else args.inputs.push(arg);
    }
    return args;
}

function usage() {
    return [
        'Usage: node skills-to-md.js <skillset>-skills.json [more.json ...] [options]',
        '       node skills-to-md.js ./skills/   (expands to every *-skills.json inside)',
        '',
        'Directory arguments are expanded to their *-skills.json files (sorted).',
        'For N resolved input files, writes N+1 markdown files:',
        '  <basename>.table.md     one cost table per input (skillset from filename)',
        '  all-skills.descriptions.md   every skill block from all inputs, sorted by name',
        '',
        'Skillset is taken from the filename: "<skillset>-skills.json".',
        '',
        'Options:',
        '  -o, --out-dir DIR    Output directory (default: dir of first input)',
        '  --desc-name NAME     Filename for the combined descriptions file',
        '                       (default: all-skills.descriptions.md)',
        '  --desc-title TITLE   H1 title for the combined descriptions file (default: Skills)',
        '  --sort-tables        Also sort table rows alphabetically (default: JSON order)',
        '  --no-cost            Omit the cost line from the descriptions file',
        '  -h, --help           Show this help',
    ].join('\n');
}

// "general-skills.json" -> { label: "General", matched: true }
// "martial-arts-skills.json" -> { label: "Martial Arts", matched: true }
function skillsetFromFilename(filePath) {
    const raw = path.basename(filePath, path.extname(filePath));
    const m = raw.match(/^(.*?)-skills$/i);
    const slug = m ? m[1] : raw;
    const label = slug
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, matched: Boolean(m) };
}

// Returns "base", "base+increment", or "" for a single tier.
function costCell(spCosts, tier) {
    const base = spCosts && spCosts.base ? spCosts.base[tier] : undefined;
    if (base === undefined || base === null || String(base).trim() === '') return '';
    const inc = spCosts && spCosts.increment ? spCosts.increment[tier] : undefined;
    if (inc === undefined || inc === null || String(inc).trim() === '') return String(base);
    return `${base}+${inc}`;
}

// "**Primary**: 1+1 **Secondary**: 2+1 **Tertiary**: 3+1", present tiers only.
function metaCostLine(spCosts) {
    return TIERS
        .filter((t) => costCell(spCosts, t) !== '')
        .map((t) => `**${TIER_HEADERS[t]}**: ${costCell(spCosts, t)}`)
        .join(' ');
}

// Full cost line for a description block.
//   primary cost of 0  -> "**Cost**: Free"
//   otherwise          -> "**Cost**: **Primary**: 1+1 **Secondary**: 2+1 ..."
//   no cost data       -> null
function costLine(spCosts) {
    const primaryBase = spCosts && spCosts.base ? spCosts.base.primary : undefined;
    if (primaryBase !== undefined && primaryBase !== null && String(primaryBase).trim() === '0') {
        return '**Cost**: Free';
    }
    const tiers = metaCostLine(spCosts);
    return tiers ? `**Cost**: ${tiers}` : null;
}

// "Alchemy 5, Smithing 5, Rune Carving 5" or "None".
function prereqText(skill) {
    const prereqs = Array.isArray(skill.prereqs) ? skill.prereqs : [];
    if (prereqs.length === 0) return 'None';
    return prereqs.map((p) => `${p.ranks}x [[${p.name}]]`).join(', ');
}

const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

function buildTable(skills, title) {
    const lines = [];
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(`| Skill | ${TIERS.map((t) => TIER_HEADERS[t]).join(' | ')} |`);
    lines.push(`|${'---|'.repeat(TIERS.length + 1)}`);
    for (const skill of skills) {
        const cells = TIERS.map((t) => costCell(skill.spCosts, t));
        lines.push(`|${skill.name}|${cells.join('|')}|`);
    }
    lines.push('');
    return lines.join('\n');
}

// entries: array of { skill, skillset }, already in the desired order.
function buildDescriptions(entries, title, includeCost) {
    const HB = '  '; // markdown hard line break (two trailing spaces)
    //const lines = [`# ${title}`, ''];
    const lines = [];
    for (const { skill, skillset } of entries) {
        lines.push(`## ${skill.name}`);
        lines.push(`**Skillset**: [[${skillset}]]${HB}`);
        if (includeCost) {
            const cost = costLine(skill.spCosts);
            if (cost) lines.push(`${cost}${HB}`);
        }
        lines.push(`**Prerequisites**: ${prereqText(skill)}${HB}`);
        lines.push((skill.description || '').trim());
        lines.push('');
    }
    return lines.join('\n');
}

// Expand directory args to their *-skills.json files; pass file args through.
// Dedups by absolute path, preserves first-seen order.
function expandInputs(inputs) {
    const SKILLS_RE = /-skills\.json$/i;
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
                .filter((f) => SKILLS_RE.test(f))
                .sort(byName)
                .map((f) => path.join(input, f));
            if (matches.length === 0) {
                console.error(`Warning: no *-skills.json files found in ${input}`);
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

function loadSkills(inputPath) {
    let skills;
    try {
        skills = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    } catch (err) {
        console.error(`Error reading/parsing ${inputPath}: ${err.message}`);
        process.exit(1);
    }
    if (!Array.isArray(skills)) {
        console.error(`${inputPath}: expected the JSON root to be an array of skill objects.`);
        process.exit(1);
    }
    const badIndex = skills.findIndex((s) => !s || typeof s.name !== 'string');
    if (badIndex !== -1) {
        console.error(`${inputPath}: skill at index ${badIndex} is missing a string "name" field.`);
        process.exit(1);
    }
    return skills;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help || args.inputs.length === 0) {
        console.log(usage());
        process.exit(args.inputs.length ? 0 : 1);
    }

    const files = expandInputs(args.inputs);
    if (files.length === 0) {
        console.error('No input files resolved (check paths and that directories contain *-skills.json).');
        process.exit(1);
    }

    const outDir = args.outDir
        ? path.resolve(args.outDir)
        : path.dirname(path.resolve(files[0]));
    fs.mkdirSync(outDir, { recursive: true });

    const entries = []; // { skill, skillset } across all inputs
    const written = [];

    for (const inputArg of files) {
        const inputPath = path.resolve(inputArg);
        const skills = loadSkills(inputPath);

        const { label, matched } = skillsetFromFilename(inputPath);
        if (!matched) {
            console.error(
                `Warning: ${path.basename(inputPath)} does not match "<skillset>-skills.json"; ` +
                `using "${label}" as the skillset.`
            );
        }

        const tableSkills = args.sortTables
            ? [...skills].sort((a, b) => byName(a.name, b.name))
            : skills;
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const tablePath = path.join(outDir, `${baseName}.table.md`);
        fs.writeFileSync(tablePath, buildTable(tableSkills, `${label} Skills`));
        written.push(tablePath);

        for (const skill of skills) entries.push({ skill, skillset: label });
    }

    entries.sort((a, b) => byName(a.skill.name, b.skill.name));

    const descPath = path.join(outDir, args.descName);
    fs.writeFileSync(descPath, buildDescriptions(entries, args.descTitle, args.cost));
    written.push(descPath);

    for (const p of written) console.log(`Wrote ${p}`);
}

main();