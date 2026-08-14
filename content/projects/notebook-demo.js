'use strict';

/* =========================================================================
   DEMO: JUPYTER NOTEBOOK-STYLE PROJECT
   -------------------------------------------------------------------------
   A sample notebook project showing off the notebook template — delete this
   file (and its entry in CONTENT_MODULES in content.js) when you are done.
   To make your own, copy content/projects/_template-notebook.js.
   ========================================================================= */

window.TERMINAL_CONTENT.registerProject({
    slug: 'notebook-demo',
    title: 'Notebook Demo',
    status: 'template demo',
    role: 'data analyst',
    stack: 'Python / pandas / matplotlib (rendered in-browser)',
    description: 'A sample Jupyter notebook rendered inside the terminal — ' +
        'Markdown cells, syntax-highlighted Python and rich outputs including ' +
        'a plot, all styled like Jupyter in a browser. Try ' +
        '`cat projects/notebook-demo.ipynb`.',

    notebook: [
        { type: 'md', source: `
# Sales Explorer

A quick exploration of weekly page views, built to show off the **notebook
template**: how Markdown cells, highlighted Python and rich outputs render.
Inline styling like **bold**, *italics* and \`code\` works across soft line breaks.

- Zero dependencies — cells are rendered by the terminal engine itself
- Style mimics Jupyter in a browser: In/Out prompts, code and outputs

> Tip: copy \`content/projects/_template-notebook.js\` to make your own.
        ` },
        { type: 'code', source: `
import pandas as pd
import numpy as np

rng = np.random.default_rng(7)
df = pd.DataFrame({
    'week': pd.date_range('2026-01-01', periods=12, freq='W'),
    'views': rng.integers(40, 120, 12)
})
df.head()
        `, outputs: [
            { text: '        week  views\n0 2026-01-04     73\n1 2026-01-11     58\n2 2026-01-18     94\n3 2026-01-25     81\n4 2026-02-01    102' }
        ] },
        { type: 'code', source: `
total = df['views'].sum()
mean = df['views'].mean()
print(f"total views: {total}")
print(f"weekly mean: {mean:.1f}")
        `, outputs: [
            'total views: 963',
            'weekly mean: 80.2'
        ] },
        { type: 'md', source: `
## Weekly trend

Plotting the series with matplotlib:
        ` },
        { type: 'code', source: `
import matplotlib.pyplot as plt

plt.figure(figsize=(6, 3))
plt.plot(df['week'], df['views'], marker='o', color='#4C72B0')
plt.title('Weekly page views')
plt.grid(alpha=0.3)
plt.show()
        `, outputs: [
            { html: `
<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg" font-family="Menlo, Consolas, monospace" font-size="10">
  <rect width="560" height="240" fill="#ffffff"/>
  <g stroke="#cccccc" stroke-width="1">
    <line x1="60" y1="20" x2="60" y2="190"/>
    <line x1="60" y1="190" x2="540" y2="190"/>
  </g>
  <polyline fill="none" stroke="#4C72B0" stroke-width="2"
    points="80,140 118,160 156,105 194,120 232,90 270,75 308,110 346,80 384,95 422,60 460,85 498,55"/>
  <g fill="#4C72B0">
    <circle cx="80" cy="140" r="3"/><circle cx="118" cy="160" r="3"/><circle cx="156" cy="105" r="3"/>
    <circle cx="194" cy="120" r="3"/><circle cx="232" cy="90" r="3"/><circle cx="270" cy="75" r="3"/>
    <circle cx="308" cy="110" r="3"/><circle cx="346" cy="80" r="3"/><circle cx="384" cy="95" r="3"/>
    <circle cx="422" cy="60" r="3"/><circle cx="460" cy="85" r="3"/><circle cx="498" cy="55" r="3"/>
  </g>
  <g fill="#555555" text-anchor="middle">
    <text x="80" y="208">Jan</text><text x="118" y="208">Feb</text><text x="156" y="208">Mar</text>
    <text x="194" y="208">Apr</text><text x="232" y="208">May</text><text x="270" y="208">Jun</text>
    <text x="308" y="208">Jul</text><text x="346" y="208">Aug</text><text x="384" y="208">Sep</text>
    <text x="422" y="208">Oct</text><text x="460" y="208">Nov</text><text x="498" y="208">Dec</text>
  </g>
  <g fill="#888888" text-anchor="end">
    <text x="55" y="194">0</text><text x="55" y="140">50</text><text x="55" y="86">100</text><text x="55" y="32">150</text>
  </g>
</svg>`
            }
        ] },
        { type: 'md', source: `
## Takeaways

- Views are fairly stable, peaking in mid-February
- This notebook is fully **client-side** — no server, no build step
        ` }
    ]
});
