'use strict';

/* =========================================================================
   TERMINAL PORTFOLIO — content loader
   -------------------------------------------------------------------------
   This file no longer holds your content directly. Instead it creates the
   shared TERMINAL_CONTENT object, provides the register*() helpers, and
   loads every small "content module" in the content/ folder (in order).

   Where to edit your personal data:

     content/identity.js               → your name, hostname, welcome banner
     content/resume.js                 → your resume data (`cat resume.md`)
     content/assets.js                 → PDFs / standalone images
     content/files/*.js                → the text pages (about, contact, …)
     content/projects/                 → one file per project (copy the
                                         template _template.js to add one)

   The terminal engine (script.js) starts automatically once every module
   in CONTENT_MODULES below has loaded.
   ========================================================================= */

window.TERMINAL_CONTENT = {
    user: 'guest',                        // filled in by identity.js
    hostname: 'terminal-website',         // filled in by identity.js
    banner: [],                           // filled in by identity.js
    filesystem: { type: 'dir', children: {} },  // built by the modules below
    resume: {},                           // filled in by resume.js
    files: {},                            // path -> text, filled by the modules
    notebooks: {}                         // path -> cells, filled by registerNotebook
};

const TC = window.TERMINAL_CONTENT;

// ---------------------------------------------------------------- helpers
// Make sure `parent` (a `children` object) contains a directory named `name`.
function ensureDir(parent, name) {
    if (!parent[name]) parent[name] = { type: 'dir', children: {} };
    return parent[name];
}

// Strip the common leading indentation from a multi-line string, so Markdown
// written indented inside a template literal still renders flush-left.
function dedent(str) {
    const lines = String(str).replace(/\r/g, '').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indents = lines
        .filter((l) => l.trim())
        .map((l) => (l.match(/^\s*/) || [''])[0].length);
    const min = indents.length ? Math.min(...indents) : 0;
    return lines.map((l) => l.slice(min)).join('\n');
}

// Register a plain-text page (formatted by `cat` when it ends in .md):
//   TC.registerFile('/projects/foo.md', `# Foo ...`)
TC.registerFile = function (absPath, content) {
    const parts = absPath.split('/').filter(Boolean);
    const name = parts.pop();
    let node = this.filesystem;
    for (const part of parts) node = ensureDir(node.children, part);
    node.children[name] = { type: 'file' };
    this.files[absPath] = content;
};

// Register a binary asset shown / opened by `cat` / `open`:
//   TC.registerAsset('/cv.pdf', 'pdf', 'assets/pdf/cv.pdf')
TC.registerAsset = function (absPath, kind, src) {
    const parts = absPath.split('/').filter(Boolean);
    const name = parts.pop();
    let node = this.filesystem;
    for (const part of parts) node = ensureDir(node.children, part);
    node.children[name] = { type: kind, src: src };
};

// Register a Jupyter-style notebook, rendered by `cat <file>.ipynb`:
//   TC.registerNotebook('/projects/foo.ipynb', [
//       { type: 'md',   source: '## Heading' },
//       { type: 'code', source: 'print(1)', outputs: ['1'] }
//   ])
TC.registerNotebook = function (absPath, cells) {
    const parts = absPath.split('/').filter(Boolean);
    const name = parts.pop();
    let node = this.filesystem;
    for (const part of parts) node = ensureDir(node.children, part);
    node.children[name] = { type: 'notebook' };
    this.notebooks[absPath] = cells || [];
};

// Convert a real Jupyter notebook (an nbformat v4 JSON object) into the cell
// DSL used by the notebook template — so you can paste an exported .ipynb
// directly into registerProject({ rawNotebook: {...} }). Handles markdown
// cells plus code cells with stream / error / execute_result / display_data
// outputs (text, HTML, PNG and SVG).
function nbformatToCells(nb) {
    const out = [];
    for (const c of (nb && Array.isArray(nb.cells) ? nb.cells : [])) {
        const source = Array.isArray(c.source) ? c.source.join('') : String(c.source || '');
        if (c.cell_type === 'markdown') {
            out.push({ type: 'md', source: source });
            continue;
        }
        if (c.cell_type !== 'code') {
            out.push({ type: 'raw', source: source });
            continue;
        }
        const cell = { type: 'code', source: source, outputs: [] };
        for (const o of (c.outputs || [])) {
            if (!o) continue;
            if (o.output_type === 'stream') {
                const text = Array.isArray(o.text) ? o.text.join('') : String(o.text || '');
                cell.outputs.push({ stream: o.name === 'stderr' ? 'stderr' : 'stdout', text: text });
            } else if (o.output_type === 'error') {
                const t = (o.traceback || []).join('\n');
                cell.outputs.push({ err: t || (o.ename + ': ' + (o.evalue || '')) });
            } else if (o.output_type === 'execute_result' || o.output_type === 'display_data') {
                const d = o.data || {};
                const join = (v) => Array.isArray(v) ? v.join('') : String(v || '');
                if (d['image/png']) cell.outputs.push({ png: 'data:image/png;base64,' + join(d['image/png']).replace(/\s/g, '') });
                else if (d['image/svg+xml']) cell.outputs.push({ html: join(d['image/svg+xml']) });
                else if (d['text/html']) cell.outputs.push({ html: join(d['text/html']) });
                else if (d['text/plain']) cell.outputs.push({ text: join(d['text/plain']) });
            }
        }
        out.push(cell);
    }
    return out;
}

// Register a project from a single object (see content/projects/_template.js).
// Builds the /projects/<slug>.md page and (optionally) its screenshots.
//
// QUICK project (one screenshot + short description):
//     registerProject({ slug, title, image, description, ... })
//
// BLOG-STYLE project (long write-up, several images — e.g. a research page):
//     registerProject({
//         slug, title, status, role, stack, link,
//         images:  ['assets/img/fig1.png', 'assets/img/fig2.png'], // optional:
//                   also listed in `ls projects/`
//         markdown: `  <- full Markdown body; `cat` renders headings, lists,
//                        quotes, code and any number of ![images] in it
//     })
//
// NOTEBOOK-STYLE project (rendered like a Jupyter notebook in a browser):
//     registerProject({
//         slug, title, status, role, stack, link, description,
//         notebook: [
//             { type: 'md',   source: '## Intro' },
//             { type: 'code', source: 'import pandas as pd', outputs: ['...'] }
//         ]
//     })
//     (see content/projects/_template-notebook.js for the full cell DSL,
//      including rich outputs, images, and pasting a real .ipynb via
//      `rawNotebook`.)
TC.registerProject = function (proj) {
    const slug = proj.slug;
    if (!slug) throw new Error('registerProject: each project needs a slug (e.g. "my-project")');

    const title = proj.title || slug;
    const lines = [];
    lines.push(title);
    lines.push('-'.repeat(Math.max(16, title.length)));
    if (proj.status) lines.push('Status: ' + proj.status);
    if (proj.role) lines.push('Role:   ' + proj.role);
    if (proj.stack) lines.push('Stack:  ' + proj.stack);
    if (proj.link) lines.push('Link:   ' + proj.link);
    lines.push('');

    if (proj.notebook || proj.rawNotebook) {
        // NOTEBOOK-STYLE project — rendered like a Jupyter notebook in a
        // browser (see content/projects/_template-notebook.js). Builds a
        // /projects/<slug>.ipynb page that `cat` renders as a notebook, and
        // a short .md landing page with a link to open it.
        const cells = proj.notebook || nbformatToCells(proj.rawNotebook);
        this.registerNotebook('/projects/' + slug + '.ipynb', cells);
        if (Array.isArray(proj.images)) {
            for (const src of proj.images) {
                this.registerAsset('/projects/' + src.split('/').pop(), 'image', src);
            }
        }
        if (proj.description) lines.push(proj.description);
        lines.push('');
        lines.push('Open the notebook: [projects/' + slug + '.ipynb](/projects/' + slug + '.ipynb)');
    } else if (proj.markdown) {
        // Full Markdown body — the blog-style option. Any number of images,
        // headings, lists, quotes, code blocks, etc. Images inside it render
        // inline via `cat`. The optional `images` array ALSO lists them under
        // `ls projects/`.
        if (Array.isArray(proj.images)) {
            for (const src of proj.images) {
                this.registerAsset('/projects/' + src.split('/').pop(), 'image', src);
            }
        }
        lines.push(dedent(proj.markdown));
    } else {
        // Simple option: one screenshot + a short description.
        if (proj.image) {
            lines.push('![Screenshot](' + proj.image + ')');
            lines.push('');
            const imgName = proj.image.split('/').pop();
            this.registerAsset('/projects/' + imgName, 'image', proj.image);
        }
        if (proj.description) lines.push('Description: ' + proj.description);
    }

    this.registerFile('/projects/' + slug + '.md', lines.join('\n'));
};

// ---------------------------------------------------------------- modules
// To add a project: copy content/projects/_template.js (quick) or
// content/projects/_template-blog.js (long write-up with several images),
// then add its file name to this list, e.g.  'content/projects/my-project.js',
const CONTENT_MODULES = [
    'content/identity.js',
    // ---- pages (one file per page) ----
    'content/files/about.md.js',
    'content/resume.js',
    'content/files/contact.md.js',
    'content/files/skills.md.js',
    'content/files/help.txt.js',
    'content/files/projects.md.js',
    // ---- binary assets (PDFs, standalone images) ----
    'content/assets.js',
    // ---- projects (copy the template to add one) ----
    'content/projects/terminal-website.js',
    'content/projects/task-manager.js',
    'content/projects/api-service.js',
    // ---- notebook-style project (renders like Jupyter in a browser) ----
    'content/projects/notebook-demo.js'
];

// ---------------------------------------------------------------- load modules
// Loads each module in order, then tells script.js to start.
(function loadModules(index) {
    if (index >= CONTENT_MODULES.length) {
        TC._ready = true;
        window.dispatchEvent(new Event('TERMINAL_CONTENT_READY'));
        return;
    }
    const src = CONTENT_MODULES[index];
    const el = document.createElement('script');
    el.src = src;
    el.onload = function () { loadModules(index + 1); };
    el.onerror = function () {
        console.error('[content] could not load module: ' + src);
        loadModules(index + 1); // skip a broken module, keep going
    };
    document.head.appendChild(el);
})(0);

