'use strict';

/* =========================================================================
   PROJECT TEMPLATE — copy this file to add a new project
   -------------------------------------------------------------------------
   A project can be written in one of two ways:

   • QUICK   — one screenshot + a short description (see Option A below).
   • BLOG    — a long-form write-up with as many images as you like, e.g. a
               PhD research summary. Write the whole article as Markdown in
               the `markdown` field; `cat` renders headings, lists, quotes,
               code and ![images]. See Option B (and _template-blog.js).

   To add a project:
     1. Copy this file in content/projects/ and rename it, e.g.  my-project.js
        (or copy content/projects/_template-blog.js for a blog-style post).
     2. Fill in the fields below (slug is used for the file name).
     3. Put any images in assets/img/ and reference them below.
     4. Register the new file in the CONTENT_MODULES list in content.js,
        e.g.  'content/projects/my-project.js',
     5. Reload the page — it appears under `ls projects/`.
   ========================================================================= */

/* -------------------------------------------------------------------------
   OPTION A — quick project: one screenshot + a short description
   ------------------------------------------------------------------------- */
window.TERMINAL_CONTENT.registerProject({
    slug: 'my-project',                    // file will be /projects/my-project.md
    title: 'My Project',                   // heading shown at the top
    status: 'in development',              // optional
    role: 'full-stack developer',          // optional
    stack: 'React / Node.js',              // optional
    link: 'https://example.com',           // optional
    image: 'assets/img/my-project.svg',    // optional — put the file in assets/img/
    description: 'A short paragraph describing what this project does, ' +
        'what you built, and any interesting details.'
});

/* -------------------------------------------------------------------------
   OPTION B — blog-style project: a full write-up with several images
   (uncomment and adapt — the `markdown` field is rendered by `cat`, so it
   supports # headings, - lists, > quotes, `code` and ![images] anywhere.)

   window.TERMINAL_CONTENT.registerProject({
       slug: 'my-research',
       title: 'My PhD Research',
       status: 'in progress',
       role: 'PhD candidate',
       stack: 'Python / PyTorch',
       link: 'https://example.com',

       // optional: ALSO list each figure under `ls projects/`
       images: ['assets/img/fig1.png', 'assets/img/fig2.png'],

       // the article itself — write it like a blog post:
       markdown: `
## Overview
A few sentences about the research question and motivation.

![Figure 1 — model overview](assets/img/fig1.png)

## Method
Describe the approach, then show what you built.

### Data
- Dataset A
- Dataset B

## Results
![Figure 2 — main results](assets/img/fig2.png)

> Key takeaway: one sentence.

## References
- [Paper](https://doi.org/...)`,
   });
   ========================================================================= */
