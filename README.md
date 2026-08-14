# Terminal Portfolio

A personal website styled like a Linux terminal. Visitors interact with it using
real terminal commands (`ls`, `cd`, `cat`, `echo`, ...) to explore your resume,
about, projects, and more.

Built with **plain HTML / CSS / JavaScript — zero dependencies, no build step.**

## Quick start

No package manager, no server, no installs:

1. Open `index.html` in any modern browser — just double-click it.
   (Or serve the folder, e.g. `python -m http.server` → http://localhost:8000.)
2. Start typing commands:

   | Command            | What it does                          |
   |--------------------|---------------------------------------|
   | `help`             | List all commands                     |
   | `ls`               | List files — click an entry to open it in a new tab |
   | `cd projects`      | Change into the projects directory    |
   | `cat about.md`     | Read the About file (formatted Markdown) |
   | `cat cv.pdf`       | Open your CV (PDF) in a new tab       |
   | `echo hi $USER`    | Print text (expands variables)        |
   | `clear`            | Clear the screen and re-show the welcome banner |

> The terminal window is **fully responsive** — it grows and shrinks with the
> browser window (no fixed width/height cap, just a 16px margin). On small
> screens (< 640px) it switches to an edge-to-edge fullscreen layout.

## Personalize it

Your content lives in small **modules** in the `content/` folder. `content.js`
is just a loader — it creates the shared data object and loads every module in
order. Edit the modules, never the engine (`script.js`):

| File (in `content/`)               | What it holds                              |
|------------------------------------|--------------------------------------------|
| `identity.js`                      | Your name, hostname, and the welcome banner |
| `resume.js`                        | Structured resume data → `cat resume.md`    |
| `assets.js`                        | PDFs / standalone images (`cv.pdf`, papers) |
| `files/about.md.js`                | The About page (Markdown)                   |
| `files/contact.md.js`              | The Contact page                            |
| `files/skills.md.js`               | The Skills page                             |
| `files/projects.md.js`             | The Projects overview page                  |
| `files/help.txt.js`                | The `cat help.txt` quick-start file         |
| `projects/*.js`                    | One file per project (copy the template)    |

- **Banner** — lines in `identity.js` are `[text, cssClass]` pairs and support
  `${USER}`. Markdown links like `[about](about.md)` open that section in a new
  tab. Includes quick links to the main sections and a command cheat-sheet.
- **Resume** — change any field in `resume.js` (name, contact, summary, skills,
  experience, education, certifications, projects) and reload.
- **Pages** — edit the Markdown inside `files/*.js` and reload.

## Adding a project (copy a template)

Each project is one file under `content/projects/`:

1. Copy `content/projects/_template.js` and rename it, e.g. `my-project.js`.
2. Fill in the fields: `slug`, `title`, `status`, `role`, `stack`, `link`,
   `image`, `description`.
3. Put any screenshot in `assets/img/` and point `image` at it (optional).
4. Register the file in the `CONTENT_MODULES` list near the top of `content.js`:

   ```js
   'content/projects/my-project.js',
   ```

5. Reload the page — it appears under `ls projects/`.

`cat projects/my-project.md` renders the fields as a formatted project page
(with the screenshot inline if you set `image`). No filesystem edits needed —
the loader builds the directory tree from the registered modules.

### Blog-style projects (several images / long write-up)

For a project that is more like a blog post — e.g. a **PhD research summary**
with multiple figures — copy `content/projects/_template-blog.js` instead.
It uses a `markdown` field: write the whole article as Markdown and drop in
as many images as you need:

```js
window.TERMINAL_CONTENT.registerProject({
    slug: 'phd-research',
    title: 'My PhD Research',
    status: 'in progress',
    role: 'PhD candidate',
    stack: 'Python / PyTorch',
    images: ['assets/img/fig1.png', 'assets/img/fig2.png'], // optional: also in `ls`
    markdown: `
## Overview
A few sentences about the research question.

![Figure 1 — model overview](assets/img/fig1.png)

## Results
![Figure 2 — main results](assets/img/fig2.png)

> Key takeaway: ...

- [Paper](https://doi.org/...)`
});
```

The `markdown` body supports `#` headings, `-` lists, `>` quotes, `` `code` ``,
`[links](url)` and any number of `![Caption](path)` images — all rendered by
`cat`. Indentation in the template literal is stripped automatically.

### Notebook-style projects (rendered like Jupyter in a browser)

For a project that is best shown as a **Jupyter notebook** — data analysis, ML
experiments, tutorials — copy `content/projects/_template-notebook.js`. It uses
a `notebook` array of cells:

```js
window.TERMINAL_CONTENT.registerProject({
    slug: 'my-analysis',
    title: 'My Data Analysis',
    stack: 'Python / pandas / matplotlib',
    notebook: [
        { type: 'md',   source: '## Overview\nA few sentences...' },
        { type: 'code', source: 'import pandas as pd\nprint(df.head())',
          outputs: ['0  1  4  9  16  25'] }
    ]
});
```

`cat projects/my-analysis.ipynb` renders it styled like Jupyter in a browser —
In/Out prompts, syntax-highlighted Python, Markdown cells and rich outputs
(plain text, errors, HTML, or `{ png: 'assets/img/plot.png' }` figures).
`cat projects/my-analysis.md` shows the title, description and a link to open
the notebook. You can also paste a real exported `.ipynb` (nbformat v4) into
`rawNotebook: { ... }` and it is converted automatically. The template file
documents the full cell DSL and output formats.

## Formatting & assets

`cat` understands Markdown (`.md`): headings, lists, blockquotes, horizontal
rules, **bold**, *italic*, `` `code` ``, `[links](url)` and inline images
`![alt](assets/img/...).png`.

**Images** — for project screenshots, set `image` in your project module (see
`_template.js`). For any other picture, register it in `content/assets.js`:

```js
TC.registerAsset('/screenshot.png', 'image', 'assets/img/screenshot.png');
```

`cat projects/terminal-website.svg` renders it inline; `open <file>` opens it
in a new tab. You can also embed it inside a `.md` file with
`![Screenshot](assets/img/terminal-website.svg)`.

**PDFs** (CV, papers, …) — drop a PDF into `assets/pdf/`, then register it:

```js
TC.registerAsset('/cv.pdf', 'pdf', 'assets/pdf/cv.pdf');
TC.registerAsset('/papers/paper-2024.pdf', 'pdf', 'assets/pdf/paper-2024.pdf');
```

`cat cv.pdf` (or `open cv.pdf`) opens the PDF in a new tab.

## Tabs & links

Like a real Linux terminal, the site supports multiple **tabs** — each is an
independent session with its own output, input, history and current directory:

- Click the **`+`** button to open a new blank session.
- Click a tab to switch back to it; click **`×`** to close a tab.
- **Internal links** in Markdown (e.g. `[Resume](resume.md)`) open that file in
  its own tab — switch back and forth between tabs freely.
- **`ls` entries are clickable too**: click a file to open it in a new tab, or a
  folder (e.g. `projects/`) to open a new tab already inside that folder.
- **External links** (`https://…`, `mailto:…`) open in a real browser tab.

Try it: `cat about.md` then click `[Resume](resume.md)` in the output, or run
`ls` and click any entry.

## Files

| File           | Purpose                                        |
|----------------|------------------------------------------------|
| `index.html`   | Page shell + terminal window markup            |
| `styles.css`   | Terminal look & feel (dark, green-on-black)    |
| `content.js`   | **Loader**: builds `TERMINAL_CONTENT`, loads the modules |
| `content/`     | **Your content** — identity, resume, pages, projects |
| `script.js`    | Terminal engine: reads `TERMINAL_CONTENT`, runs commands |
| `assets/img/`  | Pictures shown with `cat` (project screenshots, …) |
| `assets/pdf/`  | PDFs for your CV / papers, opened in a new tab |

## Command list

`help`, `ls`, `cd`, `cat`, `echo`, `pwd`, `clear`, `history`, `whoami`,
`hostname`, `uname`, `date`, `man`, `neofetch`, `open`, `sudo`, `exit`

**Features:** command history (↑/↓), TAB autocompletion for commands and
filenames, Ctrl+L to clear (re-shows the banner), Ctrl+C to cancel, quoted
args, and `~` / `.` / `..` path support.

**Reading files:** the output area scrolls on its own (a "sub-scroll") while
the prompt stays pinned at the bottom. Long files opened with `cat` or a link
(e.g. the resume) start scrolled to the **top**, so you can read them
top-to-bottom.

## License

MIT