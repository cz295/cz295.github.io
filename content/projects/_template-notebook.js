'use strict';

/* =========================================================================
   JUPYTER NOTEBOOK-STYLE PROJECT TEMPLATE
   -------------------------------------------------------------------------
   Use this for projects that are best shown as a Jupyter notebook — data
   analysis, ML experiments, tutorials with runnable-looking code cells.

   When you register a project with a `notebook` array, two things happen:

       • `cat projects/<slug>.md`     shows the title + description and a
                                      clickable link to open the notebook
       • `cat projects/<slug>.ipynb`  renders the notebook itself, styled
                                      like Jupyter in a browser (In/Out
                                      prompts, syntax-highlighted code,
                                      Markdown cells and rich outputs)

   To use this file:
     1. Copy it in content/projects/ and rename it, e.g.  my-analysis.js
     2. Fill in the fields below and write your notebook.
     3. Put any images in assets/img/ and use them as `png` outputs.
     4. Register the new file in the CONTENT_MODULES list in content.js,
        e.g.  'content/projects/my-analysis.js',
     5. Reload the page — then `cat projects/my-analysis.ipynb`.
   ========================================================================= */

window.TERMINAL_CONTENT.registerProject({
    slug: 'my-analysis',                    // file will be /projects/my-analysis.md + .ipynb
    title: 'My Data Analysis',              // heading shown on the .md page
    status: 'completed',                    // optional
    role: 'data scientist',                 // optional
    stack: 'Python / pandas / matplotlib',  // optional
    link: 'https://example.com',            // optional
    description: 'One or two sentences describing the analysis.', // shown on the .md page

    // OPTIONAL: list any figures here too so they also appear under
    // `ls projects/` (e.g. `cat projects/fig1.png`).
    // images: ['assets/img/fig1.png'],

    // ---------------------------------------------------------------------
    // THE NOTEBOOK — an array of cells, top to bottom. You may also paste a
    // real exported .ipynb JSON object into `rawNotebook` instead:
    //     rawNotebook: { cells: [ ... ], nbformat: 4, ... }
    // and it is converted automatically (nbformat v4).
    //
    // Cell types:
    //   { type: 'md',   source: '...' }     Markdown cell — renders headings,
    //                                       lists, quotes, fenced code,
    //                                       `code`, [links](url), ![images]
    //   { type: 'raw',  source: '...' }     plain preformatted text cell
    //   { type: 'code', source: '...', outputs: [...] }  a code cell; the
    //                                       code is syntax-highlighted and can
    //                                       have any of these outputs (shown
    //                                       under an Out[n]: prompt):
    //                                           'plain text'            stdout
    //                                           { text: '...' }         stdout
    //                                           { err: '...' }          error / stderr (red)
    //                                           { html: '<b>..</b>' }   rich HTML (tables, plots)
    //                                           { png: 'assets/img/plot.png' }  image (figure)
    //
    // Sources may be indented inside the object — the indentation is
    // stripped automatically, so write them however you like.
    // ---------------------------------------------------------------------
    notebook: [
        { type: 'md', source: `
## Overview
A few sentences about the notebook: what question it answers and how.

- Dataset A
- Method B
        ` },
        { type: 'code', source: `
import pandas as pd
import numpy as np

df = pd.DataFrame({'x': range(5), 'y': [1, 4, 9, 16, 25]})
df.head()
        `, outputs: [
            { text: '   x   y\n0  0   1\n1  1   4\n2  2   9\n3  3  16\n4  4  25' }
        ] },
        { type: 'code', source: `
mean = df['y'].mean()
print(f"mean of y: {mean:.2f}")
        `, outputs: [
            'mean of y: 11.00'
        ] }
    ]
});
