'use strict';

/* =========================================================================
   TERMINAL PORTFOLIO — terminal engine (plain HTML/CSS/JS, zero deps)
   -------------------------------------------------------------------------
   All personal content lives in the content/ modules (loaded by content.js).
   The engine reads everything from the TERMINAL_CONTENT object:
     • user / hostname     → shown in the prompt
     • filesystem          → virtual directory tree (ls / cd / TAB)
     • resume              → structured data rendered by `cat resume.md`
     • files               → text printed by `cat` (about, projects, …)
     • banner              → welcome message printed on load and by `clear`
   To personalize the site, edit the files in content/ — not this file.
   ========================================================================= */

// ---------------------------------------------------------------- load content
const TERMINAL_CONTENT = window.TERMINAL_CONTENT || {};
// `let` (not `const`) because content modules load asynchronously — start()
// re-reads these from TERMINAL_CONTENT once every module is ready.
let USER = TERMINAL_CONTENT.user || 'guest';
let HOSTNAME = TERMINAL_CONTENT.hostname || 'terminal-website';
const RESUME_PATH = '/resume.md';
const FILESYSTEM = TERMINAL_CONTENT.filesystem || { type: 'dir', children: {} };
const FILES = TERMINAL_CONTENT.files || {};
const BANNER = TERMINAL_CONTENT.banner || [];

// ---------------------------------------------------------------- dom refs
const bodyEl = document.getElementById('terminal-body');
const tabBarEl = document.getElementById('tab-bar');
const titleEl = document.getElementById('terminal-title');

// ---------------------------------------------------------------- sessions
// Like a real Linux terminal, each tab is an independent session with its own
// output, input, history and cwd. `state` always points at the ACTIVE session,
// so commands can read `state.cwd` / `state.history` etc. without caring which
// tab they run in.
let state = null;
let activeId = null;
let sessionCounter = 0;
const sessions = [];

function getActive() { return state; }

// ---------------------------------------------------------------- utilities
// `.output` is the per-session scroll container (the prompt line stays pinned
// below it). scrollToBottom keeps the newest line and the prompt visible.
function scrollToBottom(s) {
    s.outputEl.scrollTop = s.outputEl.scrollHeight;
}

// Scroll so `el` sits just below the top padding of the output area. Used
// after printing a long file (`cat`), so the reader starts at the TOP of the
// file and scrolls down instead of landing on the last line.
function scrollElementToTop(s, el) {
    const style = getComputedStyle(s.outputEl);
    const padTop = parseFloat(style.paddingTop) || 0;
    const target = s.outputEl.getBoundingClientRect().top + padTop;
    const elTop = el.getBoundingClientRect().top;
    s.outputEl.scrollTop += (elTop - target);
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// Print one text line. Pass `scrollBottom = false` to append without forcing
// the scroll to the bottom (used when printing a whole file). Returns the
// created element so callers can scroll it into view afterwards.
function print(text, cls, scrollBottom = true) {
    const s = getActive();
    const line = document.createElement('div');
    line.className = 'output-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    s.outputEl.appendChild(line);
    if (scrollBottom) scrollToBottom(s);
    return line;
}

// Append a line of pre-rendered HTML (used by the Markdown renderer and for
// inline images). Any <img> that fails to load is swapped for a dim note.
// Returns the created element.
function printHTML(html, cls, scrollBottom = true) {
    const s = getActive();
    const line = document.createElement('div');
    line.className = 'output-line' + (cls ? ' ' + cls : '');
    line.innerHTML = html;
    line.querySelectorAll('img').forEach((img) => {
        img.addEventListener('error', () => {
            const note = document.createElement('span');
            note.className = 'c-dim';
            note.textContent = '[image not found: ' + (img.getAttribute('alt') || img.getAttribute('src')) + ']';
            img.replaceWith(note);
        });
    });
    s.outputEl.appendChild(line);
    if (scrollBottom) scrollToBottom(s);
    return line;
}

// Accepts strings or [text, className] pairs. A pair may have a third element
// `true` to mark its text as pre-rendered HTML (e.g. clickable `ls` links).
// Returns the first line element that has visible text (used to scroll a
// printed file back to its top — leading blank lines are skipped).
function printLines(lines, scrollBottom = true) {
    let first = null;
    for (const item of lines) {
        let el;
        if (Array.isArray(item)) {
            el = item[2] === true
                ? printHTML(item[0], item[1] || '', scrollBottom)
                : print(item[0], item[1] || '', scrollBottom);
        } else {
            el = print(item, '', scrollBottom);
        }
        if (!first && el.textContent.trim()) first = el;
    }
    return first;
}

function clearOutput() {
    getActive().outputEl.innerHTML = '';
}

// Print the welcome banner. Called on startup AND by `clear` / Ctrl+L, so
// clearing the screen brings the landing banner back. Lines run through
// inlineMD(), so Markdown links like [about](about.md) stay clickable.
function printBanner() {
    for (const item of BANNER) {
        const text = Array.isArray(item) ? item[0] : item;
        const cls = Array.isArray(item) ? (item[1] || '') : '';
        const line = String(text)
            .replace(/\$\{USER\}/g, USER)
            .replace(/\$\{HOSTNAME\}/g, HOSTNAME);
        printHTML(inlineMD(line), cls);
    }
}

function promptHTML(s) {
    const dir = s.cwd === '/' ? '~' : '~' + s.cwd;
    return '<span class="p-user">' + esc(USER) +
        '</span><span class="p-at">@</span><span class="p-host">' + esc(HOSTNAME) +
        '</span><span class="p-colon">:</span><span class="p-path">' + esc(dir) +
        '</span><span class="p-dollar">$</span> ';
}

function updatePrompt(s) {
    s.promptEl.innerHTML = promptHTML(s);
    const dir = s.cwd === '/' ? '~' : '~' + s.cwd;
    titleEl.textContent = USER + '@' + HOSTNAME + ': ' + dir;
}

// Echo the typed command into the output, exactly like a real terminal.
function echoCommand(s, command) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = promptHTML(s) + esc(command);
    s.outputEl.appendChild(line);
    scrollToBottom(s);
}

// ---------------------------------------------------------------- path helpers
function normalizePath(base, arg) {
    const joined = arg.startsWith('/') ? arg : (base === '/' ? '/' + arg : base + '/' + arg);
    const stack = [];
    for (const part of joined.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') stack.pop();
        else stack.push(part);
    }
    return '/' + stack.join('/');
}

function getNode(absPath) {
    if (absPath === '/') return FILESYSTEM;
    let node = FILESYSTEM;
    for (const part of absPath.split('/').filter(Boolean)) {
        if (!node.children || !(part in node.children)) return null;
        node = node.children[part];
    }
    return node;
}

// Split a command line into args, respecting single/double quotes.
function splitArgs(input) {
    const args = [];
    let current = '';
    let inQuote = null;
    for (const ch of input) {
        if (ch === '"' || ch === "'") {
            if (inQuote === ch) inQuote = null;
            else if (inQuote === null) inQuote = ch;
            else current += ch;
        } else if (ch === ' ' && inQuote === null) {
            if (current) { args.push(current); current = ''; }
        } else {
            current += ch;
        }
    }
    if (current) args.push(current);
    return args;
}

// Render the structured `resume` object (from content.js) into plain text
// so it can be printed by `cat resume.md`.
function renderResume(r) {
    if (!r || !r.name) return '(no resume data in content.js)';
    const L = [];
    const blank = () => L.push('');
    L.push('# ' + r.name + (r.title ? ' — ' + r.title : ''));
    blank();

    if (r.contact) {
        L.push('## Contact Information');
        if (r.contact.email) L.push('- Email: ' + r.contact.email);
        if (r.contact.phone) L.push('- Phone: ' + r.contact.phone);
        if (r.contact.linkedin) L.push('- LinkedIn: ' + r.contact.linkedin);
        if (r.contact.github) L.push('- GitHub: ' + r.contact.github);
        blank();
    }

    if (r.summary) {
        L.push('## Summary');
        L.push(r.summary);
        blank();
    }

    if (r.skills) {
        L.push('## Skills');
        for (const [key, value] of Object.entries(r.skills)) {
            L.push('- ' + key.charAt(0).toUpperCase() + key.slice(1) + ': ' + value);
        }
        blank();
    }

    if (r.experience && r.experience.length) {
        L.push('## Experience');
        for (const job of r.experience) {
            blank();
            L.push(job.role + (job.company ? ' — ' + job.company : ''));
            if (job.period) L.push('(' + job.period + ')');
            for (const p of (job.points || [])) L.push('- ' + p);
        }
        blank();
    }

    if (r.education && r.education.length) {
        L.push('## Education');
        for (const edu of r.education) {
            blank();
            L.push(edu.degree + (edu.school ? ' — ' + edu.school : ''));
            if (edu.period) L.push('(' + edu.period + ')');
            for (const p of (edu.points || [])) L.push('- ' + p);
        }
        blank();
    }

    if (r.certifications && r.certifications.length) {
        L.push('## Certifications');
        for (const c of r.certifications) L.push('- ' + c);
        blank();
    }

    if (r.projects && r.projects.length) {
        L.push('## Projects');
        for (const p of r.projects) {
            L.push('- ' + p.name + (p.desc ? ': ' + p.desc : ''));
        }
    }

    return L.join('\n');
}

// ---------------------------------------------------------------- markdown rendering
// Tiny Markdown formatter used by `cat`. Supports: headings, lists, blockquotes,
// horizontal rules, **bold**, *italic*, `code`, [links](url) and ![images](url).
function inlineMD(text) {
    let html = esc(text);
    // inline code first so nothing inside `...` gets formatted further
    html = html.replace(/`([^`]+)`/g, '<span class="md-code">$1</span>');
    // images ![alt](src)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img class="md-img" src="$2" alt="$1">');
    // **bold**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<span class="c-bold">$1</span>');
    // *italic* and _italic_
    html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<span class="c-italic">$2</span>');
    html = html.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<span class="c-italic">$2</span>');
    // [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a class="c-link" href="$2" target="_blank" rel="noopener">$1</a>');
    return html;
}

function printMarkdown(content) {
    const s = getActive();
    let first = null;
    const remember = (el) => { if (!first && el.textContent.trim()) first = el; return el; };

    for (const raw of String(content).split('\n')) {
        const line = raw.replace(/\r$/, '');
        if (!line.trim()) { remember(print('', '', false)); continue; }

        // --- horizontal rule
        if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
            remember(printHTML('<div class="md-hr"></div>', '', false));
            continue;
        }
        // --- heading
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            remember(printHTML(inlineMD(h[2]), 'md-h md-h' + h[1].length, false));
            continue;
        }
        // --- blockquote
        if (/^\s*>\s?/.test(line)) {
            remember(printHTML(inlineMD(line.replace(/^\s*>\s?/, '')), 'md-quote', false));
            continue;
        }
        // --- unordered list
        const ul = line.match(/^\s*[-*+]\s+(.*)$/);
        if (ul) {
            remember(printHTML('\u2022 ' + inlineMD(ul[1]), 'md-li', false));
            continue;
        }
        // --- ordered list
        const ol = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (ol) {
            remember(printHTML('<span class="c-dim">' + ol[1] + '.</span> ' + inlineMD(ol[2]), 'md-li', false));
            continue;
        }
        // --- paragraph
        remember(printHTML(inlineMD(line), '', false));
    }

    // Leave the view scrolled to the TOP of the document so it can be read
    // top-to-bottom (instead of auto-scrolling to the last line).
    if (first) scrollElementToTop(s, first);
}

// ---------------------------------------------------------------- notebook rendering
// A project registered with a `notebook` array (see
// content/projects/_template-notebook.js) is rendered by `cat` as a Jupyter
// notebook in a browser: a light nbconvert-style card with In/Out prompts,
// syntax-highlighted Python, Markdown cells and rich outputs.

function renderNotebook(path, cells) {
    const name = path.split('/').filter(Boolean).pop() || 'notebook.ipynb';
    const html = [];
    html.push('<div class="nb">');
    html.push('<div class="nb-toolbar">');
    html.push('<span class="nb-name">' + esc(name) + '</span>');
    html.push('<span class="nb-menus">File&#160;&#160;Edit&#160;&#160;View&#160;&#160;Insert&#160;&#160;Cell&#160;&#160;Kernel&#160;&#160;Help</span>');
    html.push('<span class="nb-kernel">Python 3 &#183; Idle</span>');
    html.push('</div>');
    html.push('<div class="nb-body">');
    let codeNum = 0;
    for (const cell of cells) {
        if (!cell) continue;
        const type = cell.type || 'code';
        if (type === 'md' || type === 'markdown') {
            html.push('<div class="nb-cell nb-md">' + nbMarkdown(dedent(cell.source || '')) + '</div>');
        } else if (type === 'raw') {
            html.push('<div class="nb-cell nb-md"><pre class="nb-codeblock">' + esc(dedent(cell.source || '')) + '</pre></div>');
        } else {
            codeNum++;
            html.push('<div class="nb-cell nb-code">');
            html.push('<div class="nb-row">');
            html.push('<div class="nb-prompt">In [' + codeNum + ']:</div>');
            html.push('<div class="nb-source">' + nbPyHighlight(dedent(cell.source || '')) + '</div>');
            html.push('</div>');
            const outs = (cell.outputs || []).filter(Boolean);
            outs.forEach((out, i) => {
                html.push('<div class="nb-row nb-output-row">');
                html.push('<div class="nb-prompt' + (i === 0 ? ' nb-prompt-out' : '') + '">' + (i === 0 ? 'Out[' + codeNum + ']:' : '') + '</div>');
                html.push('<div class="nb-output">' + nbOutputHTML(out) + '</div>');
                html.push('</div>');
            });
            html.push('</div>');
        }
    }
    html.push('</div>');
    html.push('</div>');
    return html.join('');
}

function nbOutputHTML(out) {
    if (out.html != null) return '<div class="nb-html">' + out.html + '</div>';
    if (out.png != null) return '<img class="nb-img" src="' + esc(out.png) + '" alt="notebook output">';
    if (out.err != null) return '<pre class="nb-err">' + esc(out.err) + '</pre>';
    if (out.stream === 'stderr') return '<pre class="nb-err">' + esc(out.text != null ? out.text : '') + '</pre>';
    return '<pre class="nb-pre">' + esc(out.text != null ? out.text : '') + '</pre>';
}

// Light-theme Markdown for notebook cells (headings, lists, quotes, fenced
// code blocks, images, links, bold / italic / inline code).
function nbMarkdown(source) {
    const lines = String(source).replace(/\r/g, '').split('\n');
    const out = [];
    let inCode = false;
    let listType = null;
    let para = []; // current paragraph lines — merged so **bold** / *italics* / `code`
    // work across soft line breaks, like in a real notebook
    const closeList = () => { if (listType) { out.push('</' + listType + '>'); listType = null; } };
    const flushPara = () => {
        if (para.length) {
            out.push('<div class="nb-p">' + nbInline(para.join(' ')) + '</div>');
            para = [];
        }
    };
    for (const raw of lines) {
        const line = raw.replace(/\r$/, '');
        const trimmed = line.trim();
        const fence = line.match(/^\s*(```+|~~~+)\s*([\w+-]*)/);
        if (fence) {
            flushPara();
            if (inCode) { out.push('</pre>'); inCode = false; }
            else { closeList(); out.push('<pre class="nb-codeblock">'); inCode = true; }
            continue;
        }
        if (inCode) { flushPara(); out.push(esc(line) + '\n'); continue; }
        if (!trimmed) { flushPara(); continue; }
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) { flushPara(); closeList(); out.push('<div class="nb-h nb-h' + h[1].length + '">' + nbInline(h[2]) + '</div>'); continue; }
        if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) { flushPara(); closeList(); out.push('<hr class="nb-hr">'); continue; }
        if (/^\s*>\s?/.test(line)) { flushPara(); closeList(); out.push('<div class="nb-quote">' + nbInline(line.replace(/^\s*>\s?/, '')) + '</div>'); continue; }
        const ul = line.match(/^\s*[-*+]\s+(.*)$/);
        if (ul) { flushPara(); if (listType !== 'ul') { closeList(); out.push('<ul class="nb-ul">'); listType = 'ul'; } out.push('<li>' + nbInline(ul[1]) + '</li>'); continue; }
        const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (ol) { flushPara(); if (listType !== 'ol') { closeList(); out.push('<ol class="nb-ol">'); listType = 'ol'; } out.push('<li>' + nbInline(ol[1]) + '</li>'); continue; }
        para.push(line);
    }
    flushPara();
    closeList();
    if (inCode) out.push('</pre>');
    return out.join('\n');
}

function nbInline(text) {
    let html = esc(text);
    html = html.replace(/`([^`]+)`/g, '<code class="nb-code">$1</code>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="nb-img" src="$2" alt="$1">');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="nb-link" href="$2" target="_blank" rel="noopener">$1</a>');
    return html;
}

// Lightweight Python syntax highlighting (Jupyter's CodeMirror colours).
// Not a full parser, but handles keywords, builtins, def/class names,
// strings (incl. triple-quoted), numbers, comments and decorators.
function nbPyHighlight(code) {
    const src = String(code).replace(/\r/g, '');
    const n = src.length;
    const KW = new Set(['import','from','as','def','return','if','elif','else','for','while','in','not','and','or','class','try','except','finally','with','lambda','pass','break','continue','yield','global','nonlocal','raise','assert','is','del','True','False','None']);
    const BLT = new Set(['print','len','range','enumerate','zip','map','filter','sorted','sum','min','max','abs','str','int','float','bool','list','dict','set','tuple','repr','type','isinstance','issubclass','open','input','round','any','all','pow','next','iter','getattr','setattr','hasattr','format','super','object','property','staticmethod','classmethod','memoryview','bytes','frozenset']);
    const out = [];
    let i = 0;
    let defNext = false;
    while (i < n) {
        const ch = src[i];
        if (ch === '\n') { defNext = false; out.push('\n'); i++; continue; }
        if (ch === '#') {
            let j = i; while (j < n && src[j] !== '\n') j++;
            out.push('<span class="nb-tok-com">' + esc(src.slice(i, j)) + '</span>');
            i = j; continue;
        }
        if (ch === '"' || ch === "'") {
            let j = i + 1; const q = ch;
            const triple = (src[i + 1] === q && src[i + 2] === q);
            if (triple) j = i + 3;
            while (j < n) {
                if (src[j] === '\\') { j += 2; continue; }
                if (triple) {
                    if (src[j] === q && src[j + 1] === q && src[j + 2] === q) { j += 3; break; }
                    j++;
                } else {
                    if (src[j] === q) { j++; break; }
                    if (src[j] === '\n') break;
                    j++;
                }
            }
            out.push('<span class="nb-tok-str">' + esc(src.slice(i, j)) + '</span>');
            i = j; continue;
        }
        if (/[A-Za-z_]/.test(ch)) {
            let j = i; while (j < n && /[\w]/.test(src[j])) j++;
            const word = src.slice(i, j);
            if (defNext) { out.push('<span class="nb-tok-def">' + esc(word) + '</span>'); defNext = false; }
            else if (KW.has(word)) { out.push('<span class="nb-tok-kw">' + word + '</span>'); defNext = (word === 'def' || word === 'class'); }
            else if (BLT.has(word)) out.push('<span class="nb-tok-blt">' + word + '</span>');
            else out.push(esc(word));
            i = j; continue;
        }
        if (/[0-9]/.test(ch)) {
            let j = i; while (j < n && /[0-9._a-fA-FxXoObBeEjJ]/.test(src[j])) j++;
            out.push('<span class="nb-tok-num">' + esc(src.slice(i, j)) + '</span>');
            i = j; continue;
        }
        if (ch === '@') {
            let j = i + 1; while (j < n && /[\w.]/.test(src[j])) j++;
            out.push('<span class="nb-tok-dec">' + esc(src.slice(i, j)) + '</span>');
            i = j; continue;
        }
        if (ch !== ' ' && ch !== '\t') defNext = false;
        out.push(esc(ch));
        i++;
    }
    return out.join('');
}

// ---------------------------------------------------------------- command registry
const commands = {};

function register(name, def) {
    def.help = def.help || '';
    def.usage = def.usage || '';
    commands[name] = def;
}

register('help', {
    usage: '',
    help: 'Show available commands',
    run: () => {
        const names = Object.keys(commands).sort();
        const lines = [
            ['Available commands:', 'c-bold'],
            ['', '']
        ];
        for (const name of names) {
            const usage = commands[name].usage;
            lines.push(['  ' + name + (usage ? ' ' + usage : ''), '']);
        }
        lines.push(
            ['', ''],
            ['Tip: press TAB to autocomplete, and use ↑ / ↓ for history.', 'c-dim']
        );
        return lines;
    }
});

register('ls', {
    usage: '[path]',
    help: 'List directory contents (click an entry to open it in a new tab)',
    run: (args) => {
        const target = args[0] ? normalizePath(state.cwd, args[0]) : state.cwd;
        const node = getNode(target);
        if (!node) return [['ls: cannot access \'' + (args[0] || '') + '\': No such file or directory', 'c-red']];
        if (node.type !== 'dir') {
            const name = args[0] || target;
            return [['<a class="c-link" href="' + esc(name) + '">' + esc(name) + '</a>', '', true]];
        }
        const names = Object.keys(node.children);
        if (!names.length) return [['(empty)', 'c-dim']];
        // Every entry is a clickable link: files open in a new tab, folders
        // open a new tab already inside that folder.
        return names.map((name) => {
            const child = node.children[name];
            const isDir = child.type === 'dir';
            const href = esc(name) + (isDir ? '/' : '');
            const cls = isDir ? 'c-cyan c-bold' : '';
            return [
                '<a class="c-link' + (cls ? ' ' + cls : '') + '" href="' + href + '">' + href + '</a>',
                '',
                true
            ];
        });
    }
});

register('cd', {
    usage: '[path]',
    help: 'Change directory (supports .., /, ~)',
    run: (args) => {
        if (!args[0]) { state.cwd = '/'; return []; }
        const target = normalizePath(state.cwd, args[0]);
        const node = getNode(target);
        if (!node || node.type !== 'dir') {
            return [['cd: no such file or directory: ' + args[0], 'c-red']];
        }
        state.cwd = target;
        return [];
    }
});

register('cat', {
    usage: '<file>',
    help: 'Print file contents (formats Markdown, shows images, opens PDFs)',
    run: (args) => {
        if (!args[0]) return [['Usage: cat <file>', 'c-yellow']];
        const target = normalizePath(state.cwd, args[0]);
        const node = getNode(target);
        if (!node) return [['cat: ' + args[0] + ': No such file or directory', 'c-red']];
        if (node.type === 'dir') return [['cat: ' + args[0] + ': Is a directory', 'c-red']];

        // image asset -> render it inline
        if (node.type === 'image' && node.src) {
            printHTML('<img class="md-img" src="' + esc(node.src) + '" alt="' + esc(args[0]) + '">');
            return [];
        }
        // pdf asset -> open in a new tab
        if (node.type === 'pdf' && node.src) {
            printLines([[args[0] + ': PDF document — opening in a new tab…', 'c-yellow']]);
            window.open(node.src, '_blank');
            return [];
        }
        // notebook asset -> render it inline like a Jupyter notebook
        if (node.type === 'notebook') {
            const cells = (TERMINAL_CONTENT.notebooks || {})[target];
            if (!cells || !cells.length) {
                return [['cat: ' + args[0] + ': empty notebook', 'c-yellow']];
            }
            const nbEl = printHTML(renderNotebook(target, cells), '', false);
            if (nbEl) scrollElementToTop(state, nbEl);
            return [];
        }

        const content = target === RESUME_PATH
            ? renderResume(TERMINAL_CONTENT.resume)
            : (FILES[target] ?? '(empty file)');

        if (/\.md$/i.test(target)) {
            printMarkdown(content);
        } else {
            const firstEl = printLines(
                content.split('\n').map((line) => [line, 'c-cyan']), false);
            if (firstEl) scrollElementToTop(state, firstEl);
        }
        return [];
    }
});

register('open', {
    usage: '<file>',
    help: 'Open an image or PDF asset in a new tab',
    run: (args) => {
        if (!args[0]) return [['Usage: open <file>', 'c-yellow']];
        const target = normalizePath(state.cwd, args[0]);
        const node = getNode(target);
        if (!node) return [['open: ' + args[0] + ': No such file or directory', 'c-red']];
        if (!node.src) return [['open: ' + args[0] + ': not an image or PDF', 'c-yellow']];
        window.open(node.src, '_blank');
        return [['Opening ' + args[0] + '…', 'c-dim']];
    }
});

register('echo', {
    usage: '[text ...]',
    help: 'Print text (expands $USER, $PWD, ...)',
    run: (args) => {
        const vars = { USER, PWD: state.cwd, HOME: '/', HOSTNAME, SHELL: '/bin/bash' };
        const expanded = args
            .map((a) => a.replace(/\$(\w+)/g, (_, name) => (name in vars ? vars[name] : '')))
            .join(' ');
        return [expanded || ''];
    }
});

register('pwd', {
    usage: '',
    help: 'Print working directory',
    run: () => [state.cwd]
});

register('clear', {
    usage: '',
    help: 'Clear the screen and re-show the welcome banner (also Ctrl+L)',
    run: () => { clearOutput(); printBanner(); return []; }
});

register('history', {
    usage: '',
    help: 'Show command history',
    run: () => {
        if (!state.history.length) return [['(history is empty)', 'c-dim']];
        return state.history.map((h, i) => ['  ' + (i + 1) + '  ' + h, '']);
    }
});

register('whoami', {
    usage: '',
    help: 'Print the current user',
    run: () => [USER]
});

register('hostname', {
    usage: '',
    help: 'Print the hostname',
    run: () => [HOSTNAME]
});

register('uname', {
    usage: '',
    help: 'Print system information',
    run: () => ['Linux ' + HOSTNAME + ' 6.1.0-tty x86_64 GNU/Linux']
});

register('date', {
    usage: '',
    help: 'Print the current date and time',
    run: () => [formatDate(new Date())]
});

register('man', {
    usage: '<command>',
    help: 'Show usage for a command',
    run: (args) => {
        if (!args[0]) return [['What manual page do you want?', 'c-yellow']];
        const def = commands[args[0]];
        if (!def) return [['No manual entry for ' + args[0], 'c-red']];
        return [
            ['NAME', 'c-underline'],
            ['     ' + args[0] + ' — ' + def.help, ''],
            ['', ''],
            ['SYNOPSIS', 'c-underline'],
            ['     ' + args[0] + (def.usage ? ' ' + def.usage : ''), ''],
            ['', ''],
            ['EXAMPLES', 'c-underline'],
            ['     try: ' + args[0] + (def.usage ? ' ' + def.usage.replace(/[<>]/g, '') : ''), 'c-dim']
        ];
    }
});

register('neofetch', {
    usage: '',
    help: 'Print system info and a logo',
    run: () => [
        [
`     .--.
    |o_o |
    |:_/ |
   //   \\ \\
  (|     | )
  /'\\_   _/\`
  \\___)=(___/`, 'c-green c-bold'
        ],
        ['', ''],
        [USER + '@' + HOSTNAME, 'c-bold'],
        ['-----------------------', 'c-dim'],
        ['OS: Linux 6.1.0-tty x86_64', ''],
        ['Host: Personal Computer', ''],
        ['Kernel: 6.1.0-tty', ''],
        ['Shell: bash 5.2.15', ''],
        ['Terminal: custom-terminal', ''],
        ['CPU: Personal CPU @ 3.60GHz', ''],
        ['Memory: 4096MiB / 16384MiB', ''],
        ['', ''],
        ['Colors: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', 'c-dim']
    ]
});

register('sudo', {
    usage: '<command>',
    help: 'Pretend to be root',
    run: (args) => {
        if (!args[0]) return [['Usage: sudo <command>', 'c-yellow']];
        return [
            [USER + ' is not in the sudoers file.', 'c-red'],
            ['This incident will be reported.', 'c-dim']
        ];
    }
});

register('exit', {
    usage: '',
    help: 'Close the session',
    run: () => [['Session closed. Reload the page to start a new one.', 'c-red']]
});

// ---------------------------------------------------------------- date formatting
function formatDate(d) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const p = (n) => String(n).padStart(2, '0');
    return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + p(d.getDate()) +
        ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) +
        ' ' + d.getFullYear();
}

// ---------------------------------------------------------------- command dispatch
function executeCommand(s, raw) {
    const command = raw.trim();
    echoCommand(s, command);

    if (!command) return;

    const parts = splitArgs(command);
    const cmd = parts[0];
    const args = parts.slice(1);

    const def = commands[cmd];
    if (!def) {
        printLines([[`command not found: ${cmd}. Type 'help' for available commands.`, 'c-red']]);
        return;
    }

    const result = def.run(args);
    if (result && result.length) printLines(result);
    updatePrompt(s);
}

// ---------------------------------------------------------------- tab completion
function completePath(token) {
    const slashIndex = token.lastIndexOf('/');
    const dirPart = slashIndex === -1 ? '' : token.slice(0, slashIndex + 1);
    const partial = slashIndex === -1 ? token : token.slice(slashIndex + 1);

    const base = normalizePath(state.cwd, dirPart || '.');
    const node = getNode(base);
    if (!node || node.type !== 'dir') return [];

    return Object.keys(node.children)
        .filter((name) => name.startsWith(partial))
        .map((name) => dirPart + name + (node.children[name].type === 'dir' ? '/' : ''));
}

function handleTab(s) {
    const value = s.inputEl.value;
    if (!value) return;

    const hasSpace = /\s/.test(value);
    const rawTail = value.split(/\s+/).pop() || '';
    const prefix = value.slice(0, value.length - rawTail.length);

    if (!hasSpace) {
        // complete the command name
        const matches = Object.keys(commands).filter((c) => c.startsWith(value));
        if (matches.length === 1) s.inputEl.value = matches[0] + ' ';
        else if (matches.length > 1) printLines([matches.join('   '), '']);
        return;
    }

    // complete a path in the current directory
    const matches = completePath(rawTail);
    if (matches.length === 1) {
        s.inputEl.value = prefix + matches[0] + (matches[0].endsWith('/') ? '' : ' ');
    } else if (matches.length > 1) {
        printLines([matches.join('   '), '']);
    }
}

// ---------------------------------------------------------------- history
function handleArrowUp(s) {
    if (!s.history.length) return;
    if (s.historyIndex === -1) {
        s.buffer = s.inputEl.value;
        s.historyIndex = s.history.length - 1;
    } else if (s.historyIndex > 0) {
        s.historyIndex--;
    }
    s.inputEl.value = s.history[s.historyIndex];
}

function handleArrowDown(s) {
    if (s.historyIndex === -1) return;
    if (s.historyIndex < s.history.length - 1) {
        s.historyIndex++;
        s.inputEl.value = s.history[s.historyIndex];
    } else {
        s.historyIndex = -1;
        s.inputEl.value = s.buffer;
    }
}

// ---------------------------------------------------------------- sessions & tabs
function renderTabs() {
    tabBarEl.innerHTML = '';
    for (const s of sessions) {
        const tab = document.createElement('div');
        tab.className = 'tab' + (s.id === activeId ? ' active' : '');
        tab.dataset.session = s.id;
        tab.title = s.title;
        const label = document.createElement('span');
        label.className = 'tab-label';
        label.textContent = s.title;
        const close = document.createElement('span');
        close.className = 'tab-close';
        close.textContent = '\u00d7';
        close.title = 'Close session';
        close.addEventListener('click', (e) => { e.stopPropagation(); closeSession(s.id); });
        tab.appendChild(label);
        tab.appendChild(close);
        tab.addEventListener('click', () => activateSession(s.id));
        tabBarEl.appendChild(tab);
    }
    const add = document.createElement('div');
    add.className = 'tab-add';
    add.textContent = '+';
    add.title = 'New session';
    add.addEventListener('click', () => createSession('terminal'));
    tabBarEl.appendChild(add);
}

function activateSession(id) {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    activeId = id;
    state = s;
    sessions.forEach((x) => { x.pane.style.display = (x.id === id) ? 'flex' : 'none'; });
    tabBarEl.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.session === id));
    updatePrompt(s);
    s.inputEl.focus();
}

function closeSession(id) {
    const idx = sessions.findIndex((x) => x.id === id);
    if (idx === -1) return;
    sessions[idx].pane.remove();
    sessions.splice(idx, 1);
    renderTabs(); // always rebuild the tab bar after removing a session
    if (activeId === id) {
        activeId = null;
        if (sessions.length) activateSession(sessions[Math.min(idx, sessions.length - 1)].id);
        else { const fresh = createSession('terminal'); activateSession(fresh.id); }
    }
}

function createSession(title) {
    sessionCounter++;
    const id = 's' + sessionCounter;

    const pane = document.createElement('div');
    pane.className = 'session-pane';
    pane.id = 'session-' + id;

    const outputEl = document.createElement('div');
    outputEl.className = 'output';

    const inputLine = document.createElement('div');
    inputLine.className = 'input-line';
    const promptEl = document.createElement('span');
    promptEl.className = 'prompt-text';
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('autocapitalize', 'off');
    inputEl.setAttribute('autocorrect', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.setAttribute('aria-label', 'Terminal input');
    inputLine.appendChild(promptEl);
    inputLine.appendChild(inputEl);
    pane.appendChild(outputEl);
    pane.appendChild(inputLine);
    bodyEl.appendChild(pane);

    const session = {
        id,
        title: title || 'terminal',
        cwd: '/',
        history: [],
        historyIndex: -1,
        buffer: '',
        target: null,       // virtual path this tab was opened for (if any)
        outputEl,
        inputEl,
        promptEl,
        pane
    };

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = session.inputEl.value;
            if (value.trim()) session.history.push(value.trim());
            session.historyIndex = -1;
            session.buffer = '';
            session.inputEl.value = '';
            executeCommand(session, value);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleArrowUp(session);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleArrowDown(session);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTab(session);
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            session.outputEl.innerHTML = '';
            printBanner();
        } else if (e.ctrlKey && e.key === 'c') {
            session.inputEl.value = '';
            print('^C', 'c-dim');
        }
    });

    sessions.push(session);
    renderTabs();
    activateSession(id);
    return session;
}

// Open an internal link (e.g. a .md file) in its own terminal tab, just like
// a real Linux terminal. Reuses an existing tab for the same file if present.
function openLink(s, href) {
    const target = normalizePath(s.cwd, href);
    const node = getNode(target);
    const isDir = !!(node && node.type === 'dir');
    const title = target.split('/').filter(Boolean).pop() || 'terminal';
    const existing = sessions.find((x) => x.target === target);
    if (existing) { activateSession(existing.id); return; }
    const ns = createSession(title);
    ns.target = target;
    if (isDir) {
        // Opening a folder: land in a new tab already inside it.
        ns.cwd = target;
        updatePrompt(ns);
        executeCommand(ns, 'ls');
    } else {
        executeCommand(ns, 'cat ' + target);
    }
}

// ---------------------------------------------------------------- init
function init() {
    const s = createSession('terminal');

    printBanner();
    updatePrompt(s);
    s.inputEl.focus();

    // keep focus on the active session's input
    document.addEventListener('click', () => { const a = getActive(); if (a) a.inputEl.focus(); });

    // Internal links ([About](about.md), ...) open a new in-page terminal tab.
    // External links (http://, mailto:, ...) keep the default browser behavior.
    bodyEl.addEventListener('click', (e) => {
        const a = e.target.closest('a.c-link');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return; // external
        e.preventDefault();
        const s = getActive();
        if (s) openLink(s, href);
    });
}

// Content modules load asynchronously (content.js loader) — wait for them so
// the banner, filesystem, resume and identity are fully populated before the
// engine renders anything.
function start() {
    USER = window.TERMINAL_CONTENT.user || 'guest';
    HOSTNAME = window.TERMINAL_CONTENT.hostname || 'terminal-website';
    init();
}
if (window.TERMINAL_CONTENT && window.TERMINAL_CONTENT._ready) start();
else window.addEventListener('TERMINAL_CONTENT_READY', start, { once: true });
