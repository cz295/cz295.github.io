ASSETS FOLDER — images & PDFs
=============================

Drop your real files in here. The paths are referenced from the content
modules (content/assets.js, content/projects/*.js).

  assets/img/   images shown with `cat` (project screenshots, etc.)
                Supported: .png .jpg .jpeg .gif .webp .svg
  assets/pdf/   PDF files for your CV / papers, opened in a new tab

Examples already wired up:
  cv.pdf                         -> `cat cv.pdf` (or `open cv.pdf`)
  papers/paper-2024.pdf          -> `cd papers && cat paper-2024.pdf`
  img/terminal-website.svg       -> `cat projects/terminal-website.svg`

To add a project screenshot:
  1. Copy the image into assets/img/.
  2. Set `image: 'assets/img/your-file.png'` in your project module
     (content/projects/your-project.js) — see _template.js.
  3. Reload the page — it is embedded in the project page automatically.

To add a standalone picture/PDF (not attached to a project):
  1. Copy the file into assets/img or assets/pdf.
  2. Register it in content/assets.js, e.g.
       TC.registerAsset('/screenshot.png', 'image', 'assets/img/screenshot.png')
       TC.registerAsset('/cv.pdf',         'pdf',   'assets/pdf/cv.pdf')
  3. Reload the page.

You can also embed images inside Markdown files with:
  ![Screenshot](assets/img/screenshot.png)
`cat` will render it inline.
