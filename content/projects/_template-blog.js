'use strict';

/* =========================================================================
   BLOG-STYLE PROJECT TEMPLATE
   -------------------------------------------------------------------------
   Use this for long-form projects that need several images — e.g. a PhD
   research summary, a case study, or a tutorial write-up.

   How the `markdown` field is rendered by `cat projects/<slug>.md`:

       # / ## / ###          headings
       - or * item           lists
       > quote               blockquote
       `code`                inline code
       [text](url)           links (open in a new tab)
       ![Caption](path)      images — add as many as you like, anywhere

   To use this file:
     1. Copy it in content/projects/ and rename it, e.g.  phd-research.js
     2. Fill in the fields below.
     3. Put your images in assets/img/ and reference them in the Markdown.
     4. Register the new file in the CONTENT_MODULES list in content.js,
        e.g.  'content/projects/phd-research.js',
     5. Reload the page — it appears under `ls projects/`.
   ========================================================================= */

window.TERMINAL_CONTENT.registerProject({
    slug: 'phd-research',                       // file will be /projects/phd-research.md
    title: 'My PhD Research',                   // heading shown at the top
    status: 'in progress',                      // optional
    role: 'PhD candidate',                      // optional
    stack: 'Python / PyTorch / TensorFlow',     // optional
    link: 'https://example.com',                // optional

    // OPTIONAL: list your figures here too, so each one also appears under
    // `ls projects/` (e.g. `cat projects/fig1.png`). Not required for the
    // images to render — the Markdown below is enough.
    images: [
        'assets/img/fig1.png',
        'assets/img/fig2.png',
        'assets/img/fig3.png'
    ],

    // The article itself. Write it like a blog post — indentation is fine,
    // it is stripped automatically. Add images wherever you need them.
    markdown: `
## Overview
A few sentences about the research question, why it matters, and the main
contribution of the work.

![Figure 1 — overview of the proposed model](assets/img/fig1.png)

## Method
Describe the approach step by step.

### Setup
- Framework / libraries used
- Data sources
- Evaluation metrics

## Results
Show the outcomes. Drop in as many figures as you need, with a caption.

![Figure 2 — quantitative results](assets/img/fig2.png)

![Figure 3 — qualitative comparison](assets/img/fig3.png)

> Key takeaway: a one-sentence summary of the most important finding.

## Discussion
What worked, what did not, and possible future directions.

## References
- [Author, Title, Venue (2024)](https://doi.org/...)
- [Related work](https://example.com)`
});
