/**
 * generate-html.js
 * Project: chronicles-rules
 * Creator: Justin Doyle <jdoyle@jmdoyle.com>
 *
 * Turns the compiled rulebook markdown + heading-index JSON (from
 * build-rulebook.js) into a single self-contained HTML page for chron-manager
 * to serve. The same rendered HTML is intended to back the print/PDF artifact
 * later, so this generator is the one place slugs/links are decided.
 *
 *   node generate-html.js --md <book.md> --toc <book.toc.json> --out <book.html>
 *
 * Options:
 *   --md FILE       Compiled rulebook markdown (required)
 *   --toc FILE      Heading-index JSON for the sidebar (optional; falls back to
 *                   a flat tree built from the document headings, all expanded)
 *   -o, --out FILE  Output HTML path (required)
 *   --title TEXT    Document/title-bar text (default: "Chronicles")
 *   -h, --help      Show this help
 */
'use strict';

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

/* ------------------------------------------------------------------ slugs  */
// Ported verbatim from build-rulebook.js so heading ids match the links the
// markdown already carries (TOC + table name links) and the toc.json slugs.
function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}
function makeSlugger() {
    const counts = new Map();
    return (text) => {
        const base = slugify(text);
        const n = counts.get(base) || 0;
        counts.set(base, n + 1);
        return n === 0 ? base : `${base}-${n}`;
    };
}

const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ------------------------------------------------------- markdown -> html  */

// Render markdown to HTML, assigning each heading the slug id that matches the
// document's existing anchor links. Also collects the headings encountered.
function renderContent(md) {
    const renderer = new MarkdownIt({ html: true, linkify: false, typographer: false });
    const slugger = makeSlugger();
    const headings = [];

    renderer.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
        const inline = tokens[idx + 1];
        const text = inline && inline.type === 'inline' ? inline.content : '';
        const slug = slugger(text);
        tokens[idx].attrSet('id', slug);
        headings.push({ level: Number(tokens[idx].tag.slice(1)), text, slug });
        return self.renderToken(tokens, idx, options);
    };

    const html = renderer.render(md);
    return { html, headings };
}

/* ------------------------------------------------------------- sidebar     */

// Build a nested tree from a flat heading list (fallback when no toc.json),
// everything expanded.
function treeFromHeadings(headings) {
    const roots = [];
    const stack = [];
    for (const h of headings) {
        const node = { text: h.text, slug: h.slug, level: h.level, expanded: true, children: [] };
        while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
        (stack.length ? stack[stack.length - 1].children : roots).push(node);
        stack.push(node);
    }
    return roots;
}

function renderNav(nodes) {
    if (!nodes || nodes.length === 0) return '';
    const items = nodes.map((n) => {
        const kids = n.children && n.children.length;
        const collapsed = kids && n.expanded === false;
        const toggle = kids
            ? `<button class="toc-toggle${collapsed ? ' collapsed' : ''}" aria-expanded="${!collapsed}" aria-label="Toggle section"></button>`
            : '<span class="toc-spacer"></span>';
        const link = `<a class="toc-link" href="#${escapeHtml(n.slug)}" data-slug="${escapeHtml(n.slug)}">${escapeHtml(n.text)}</a>`;
        const children = kids
            ? `<div class="toc-children${collapsed ? ' collapsed' : ''}">${renderNav(n.children)}</div>`
            : '';
        return `<li class="toc-item lvl-${n.level}${kids ? ' has-children' : ''}"><div class="toc-row">${toggle}${link}</div>${children}</li>`;
    });
    return `<ul class="toc-list">${items.join('')}</ul>`;
}

/* --------------------------------------------------------------- styles    */

const STYLES = `
:root {
  --bg: #121212;
  --grad-a: #1a1a1a;
  --grad-b: #2a2a2a;
  --surface: #1e1e1e;
  --surface-2: #222;
  --ink: #f0f0f0;
  --ink-soft: #dddddd;
  --muted: #9a9385;
  --gold: #a99360;
  --gold-bright: #dbb722;
  --gold-dark: #7d6b42;
  --purple: #8a589f;
  --purple-bright: #8b0ac5;
  --purple-light: #b98fd0;
  --rule: rgba(169, 147, 96, 0.25);
  --row-border: #1e1e28;
  --head-border: #2a2a3a;
  --row-hover: #1a1a2a;
  --purple-glow: rgba(138, 88, 159, 0.8);
  --highlight: rgba(138, 88, 159, 0.16);
  --display: "Cinzel Decorative", "Marcellus", serif;
  --serif: "Marcellus", "Segoe UI", Georgia, serif;
  --sans: "Segoe UI", Tahoma, Geneva, Verdana, system-ui, sans-serif;
  --sidebar-w: 19rem;
  --measure: 44rem;
  --topbar-h: 3.25rem;
}
* { box-sizing: border-box; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 2px; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* top bar */
.topbar {
  position: sticky; top: 0; z-index: 30;
  height: var(--topbar-h);
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0 1.1rem;
  background: linear-gradient(180deg, var(--grad-a), color-mix(in srgb, var(--grad-a) 70%, var(--bg)));
  border-bottom: 1px solid var(--rule);
}
.topbar .brand {
  font-family: var(--display); font-weight: 700; font-size: 1.15rem;
  color: var(--gold); letter-spacing: 0.02em;
}
.topbar .brand .mark { color: var(--purple-light); }
.menu-btn {
  display: none; appearance: none; border: 1px solid var(--rule);
  background: var(--surface); color: var(--gold); border-radius: 0.4rem;
  width: 2.1rem; height: 2.1rem; cursor: pointer; font-size: 1rem;
}

/* layout */
.shell { display: flex; align-items: flex-start; }
.sidebar {
  position: sticky; top: var(--topbar-h);
  flex: 0 0 var(--sidebar-w); width: var(--sidebar-w);
  height: calc(100vh - var(--topbar-h));
  overflow-y: auto; overscroll-behavior: contain;
  padding: 1.25rem 0.6rem 3rem 1.1rem;
  background: linear-gradient(to bottom right, var(--grad-a), var(--grad-b));
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.5);
  scrollbar-width: none; -ms-overflow-style: none;
}
.sidebar::-webkit-scrollbar { display: none; }
.sidebar .index-label {
  font-family: var(--display); font-weight: 700;
  font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 0.7rem 0.2rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule);
}
.content {
  flex: 1 1 auto; min-width: 0;
  padding: 2.4rem clamp(1.1rem, 5vw, 3.5rem) 6rem;
}
.content .doc { max-width: var(--measure); margin: 0 auto; }

/* sidebar tree */
.toc-list { list-style: none; margin: 0; padding: 0; }
.toc-children { margin: 0; }
.toc-children.collapsed { display: none; }
.toc-row { display: flex; align-items: flex-start; gap: 0.15rem; border-radius: 0.35rem; }
.toc-link {
  display: block; flex: 1 1 auto;
  font-family: var(--serif);
  color: var(--ink-soft); text-decoration: none;
  font-size: 0.9rem; line-height: 1.35; letter-spacing: 0.01em;
  padding: 0.25rem 0.45rem; border-radius: 0.35rem;
  border-left: 3px solid transparent;
}
.toc-link:hover { background: var(--highlight); color: var(--gold); }
.toc-link.active {
  color: #fff; font-weight: 600;
  background: var(--purple);
  border-left-color: var(--gold);
  box-shadow: 0 0 10px var(--purple-glow);
}
.toc-item.lvl-1 > .toc-row > .toc-link { color: var(--gold); font-size: 0.98rem; font-weight: 600; }
.toc-item.lvl-1 > .toc-row > .toc-link.active { color: #fff; }
.toc-item.lvl-1 { margin-top: 0.4rem; }
.lvl-2 .toc-children, .toc-children .toc-children { margin-left: 0.55rem; padding-left: 0.45rem; border-left: 1px solid var(--rule); }
.toc-toggle, .toc-spacer { flex: 0 0 1.05rem; width: 1.05rem; height: 1.55rem; }
.toc-toggle {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--gold-dark); padding: 0;
}
.toc-toggle::before {
  content: ""; width: 0; height: 0;
  border-left: 5px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent;
  transform: rotate(90deg); transition: transform 0.15s ease;
}
.toc-toggle.collapsed::before { transform: rotate(0deg); }
.toc-toggle:hover { color: var(--gold); }

/* content typography */
.doc h1, .doc h2, .doc h3, .doc h4, .doc h5, .doc h6 {
  line-height: 1.2; scroll-margin-top: calc(var(--topbar-h) + 1rem);
}
.doc h1 {
  font-family: var(--display); font-weight: 700;
  font-size: 2rem; color: var(--gold); letter-spacing: 0.01em;
  margin: 3.4rem 0 1.2rem; padding-bottom: 0.5rem;
  border-bottom: 3px solid var(--purple);
}
.doc h1:first-child { margin-top: 0.5rem; }
.doc h2 { font-family: var(--serif); font-weight: 600; font-size: 1.55rem; color: var(--gold); margin: 2.5rem 0 0.8rem; }
.doc h3 { font-family: var(--serif); font-weight: 600; font-size: 1.22rem; color: var(--purple-light); margin: 1.9rem 0 0.5rem; }
.doc h4 {
  font-family: var(--sans); font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted);
  margin: 1.4rem 0 0.4rem;
}
.doc p { margin: 0.7rem 0; }
.doc a { color: var(--gold); text-decoration: none; border-bottom: 1px solid rgba(169, 147, 96, 0.35); }
.doc a:hover { color: var(--gold-bright); border-bottom-color: var(--gold-bright); }
.doc strong { color: var(--ink); }
.doc em { color: var(--ink-soft); }
.doc hr { border: 0; border-top: 1px solid var(--rule); margin: 1.7rem 0; }
.doc :target { animation: flash 1.4s ease; border-radius: 3px; }
@keyframes flash { from { background: var(--highlight); } to { background: transparent; } }

/* tables (mirrors chron-manager .em-table) */
.doc table {
  width: 100%; border-collapse: collapse; margin: 1.2rem 0; font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}
.doc thead th {
  text-align: left; color: var(--gold); font-weight: 600;
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--head-border);
}
.doc tbody td { padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--row-border); color: var(--ink-soft); vertical-align: top; }
.doc tbody tr:hover td { background: var(--row-hover); }
.doc td a { white-space: nowrap; }

/* responsive */
.scrim { display: none; }
@media (max-width: 52rem) {
  .menu-btn { display: inline-flex; align-items: center; justify-content: center; }
  .sidebar {
    position: fixed; top: var(--topbar-h); left: 0; z-index: 25;
    height: calc(100vh - var(--topbar-h));
    transform: translateX(-100%); transition: transform 0.22s ease;
  }
  body.nav-open .sidebar { transform: translateX(0); }
  body.nav-open .scrim {
    display: block; position: fixed; inset: var(--topbar-h) 0 0 0; z-index: 20;
    background: rgba(0, 0, 0, 0.5);
  }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { transition: none !important; animation: none !important; } }
`;

const SCRIPT = `
(function () {
  // collapse / expand sidebar branches
  document.querySelectorAll('.toc-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.toc-item').querySelector(':scope > .toc-children');
      if (!box) return;
      var collapsed = box.classList.toggle('collapsed');
      btn.classList.toggle('collapsed', collapsed);
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  // mobile drawer
  var body = document.body;
  var menu = document.querySelector('.menu-btn');
  var scrim = document.querySelector('.scrim');
  if (menu) menu.addEventListener('click', function () { body.classList.toggle('nav-open'); });
  if (scrim) scrim.addEventListener('click', function () { body.classList.remove('nav-open'); });
  document.querySelectorAll('.toc-link').forEach(function (a) {
    a.addEventListener('click', function () { body.classList.remove('nav-open'); });
  });

  // scrollspy: highlight the section currently in view, reveal it in the tree
  var links = {};
  document.querySelectorAll('.toc-link').forEach(function (a) { links[a.dataset.slug] = a; });
  var heads = Array.prototype.slice.call(document.querySelectorAll('.doc [id]'));
  var current = null;
  function activate(slug) {
    if (!links[slug] || current === slug) return;
    if (current && links[current]) links[current].classList.remove('active');
    current = slug;
    var a = links[slug];
    a.classList.add('active');
    var box = a.closest('.toc-children');
    while (box) { box.classList.remove('collapsed'); box = box.parentElement.closest('.toc-children'); }
    a.scrollIntoView({ block: 'nearest' });
  }
  if ('IntersectionObserver' in window && heads.length) {
    var seen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      var top = heads.filter(function (h) { return seen.has(h); })[0] || null;
      if (top) activate(top.id);
    }, { rootMargin: '-10% 0px -78% 0px', threshold: 0 });
    heads.forEach(function (h) { io.observe(h); });
  }
})();
`;

/* --------------------------------------------------------------- fonts     */

// Build the @font-face / @import CSS that matches chron-manager: Marcellus is
// embedded from a local .ttf (self-contained); Cinzel Decorative is pulled from
// Google Fonts the same way the app loads it. Returns CSS that must precede the
// main stylesheet (an @import has to come first).
function fontCss(fontsDir, webFonts) {
    const parts = [];
    if (webFonts) {
        parts.push("@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap');");
    }
    const marcellus = path.join(fontsDir, 'Marcellus-Regular.ttf');
    if (fs.existsSync(marcellus)) {
        const b64 = fs.readFileSync(marcellus).toString('base64');
        parts.push(`@font-face{font-family:'Marcellus';src:url(data:font/ttf;base64,${b64}) format('truetype');font-weight:normal;font-style:normal;font-display:swap;}`);
    } else {
        console.error(`Note: ${marcellus} not found; Marcellus will fall back to a serif stack.`);
    }
    return parts.join('\n');
}

/* --------------------------------------------------------------- assemble  */

function buildPage({ title, contentHtml, navHtml, fonts }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${fonts ? `${fonts}\n` : ''}${STYLES}</style>
</head>
<body>
<header class="topbar">
  <button class="menu-btn" aria-label="Toggle navigation">&#9776;</button>
  <div class="brand"><span class="mark">&#9670;</span> ${escapeHtml(title)}</div>
</header>
<div class="shell">
  <nav class="sidebar" aria-label="Table of contents">
    <p class="index-label">Contents</p>
    ${navHtml}
  </nav>
  <main class="content"><article class="doc">${contentHtml}</article></main>
  <div class="scrim"></div>
</div>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

/* -------------------------------------------------------------------- CLI  */

function parseArgs(argv) {
    const args = { md: null, toc: null, out: null, title: 'Chronicles', fontsDir: null, webFonts: true, help: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--md') args.md = argv[++i];
        else if (a === '--toc') args.toc = argv[++i];
        else if (a === '--out' || a === '-o') args.out = argv[++i];
        else if (a === '--title') args.title = argv[++i];
        else if (a === '--fonts-dir') args.fontsDir = argv[++i];
        else if (a === '--no-web-fonts') args.webFonts = false;
        else if (a === '--help' || a === '-h') args.help = true;
        else console.error(`Note: ignoring unrecognized argument "${a}".`);
    }
    return args;
}

function usage() {
    return [
        'Usage: node generate-html.js --md <book.md> --out <book.html> [--toc <book.toc.json>] [options]',
        '',
        'Renders the compiled rulebook markdown into a single HTML page themed to match',
        'chron-manager (dark, Cinzel Decorative + Marcellus, gold/purple), for the app to serve.',
        '',
        'Options:',
        '  --md FILE         Compiled rulebook markdown (required)',
        '  -o, --out FILE    Output HTML path (required)',
        '  --toc FILE        Heading-index JSON for the sidebar (else built from headings)',
        '  --title TEXT      Title-bar text (default: "Chronicles")',
        '  --fonts-dir DIR   Directory holding Marcellus-Regular.ttf to embed',
        '                    (default: ./fonts next to this script)',
        '  --no-web-fonts    Skip the Google Fonts import for Cinzel Decorative',
        '  -h, --help        Show this help',
    ].join('\n');
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) { console.log(usage()); process.exit(0); }
    if (!args.md || !args.out) {
        console.error('Error: --md and --out are required.\n');
        console.error(usage());
        process.exit(1);
    }

    const mdRaw = fs.readFileSync(path.resolve(args.md), 'utf8');
    const { html: contentHtml, headings } = renderContent(mdRaw);

    let tree;
    if (args.toc) {
        try {
            tree = JSON.parse(fs.readFileSync(path.resolve(args.toc), 'utf8')).headings;
        } catch (e) {
            console.error(`Warning: could not read --toc (${e.message}); falling back to document headings.`);
        }
    }
    if (!tree) tree = treeFromHeadings(headings);

    const fontsDir = args.fontsDir ? path.resolve(args.fontsDir) : path.join(__dirname, 'fonts');
    const fonts = fontCss(fontsDir, args.webFonts);

    const page = buildPage({ title: args.title, contentHtml, navHtml: renderNav(tree), fonts });
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, page);

    const bytes = Buffer.byteLength(page);
    console.log(`Rendered ${headings.length} headings -> ${outPath} (${(bytes / 1024).toFixed(0)} KB)`);
}

main();