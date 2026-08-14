'use strict';

/* =========================================================================
   HELP FILE  →  shown by `cat help.txt`
   ========================================================================= */

window.TERMINAL_CONTENT.registerFile('/help.txt', `
TERMINAL QUICK START
--------------------
Type a command and press Enter.

Try these:
  help          show all commands
  ls            list files in the current directory
  cd projects   change into the projects directory
  cat about.md  read the about file
  echo hi       print some text
  clear         clear the screen (and re-show the welcome banner)

Use the UP / DOWN arrow keys to browse command history,
and press TAB to autocomplete commands and filenames.`);
