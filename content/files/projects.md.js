'use strict';

/* =========================================================================
   PROJECTS OVERVIEW PAGE  →  shown by `cat projects.md`
   -------------------------------------------------------------------------
   This is the overview list. The individual projects (and their detail
   pages) live in content/projects/ — one file per project.
   ========================================================================= */

window.TERMINAL_CONTENT.registerFile('/projects.md', `
# Projects

## Terminal Website
A personal website styled like a Linux terminal. Run commands such as ls, cd,
cat, and echo to explore resume, about, and projects sections.

### Features
- Simulates terminal commands: ls, cd, cat, echo, and more
- Displays sections like Resume, About, and Projects
- Command history and tab completion

### Technologies
- HTML, CSS, JavaScript (vanilla — no build step)`);
