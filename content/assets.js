'use strict';

/* =========================================================================
   BINARY ASSETS (PDFs, standalone images)
   -------------------------------------------------------------------------
   Files opened with `cat <file>` / `open <file>`:

       registerAsset('/path/name.ext', 'image' | 'pdf', 'assets/...')

   Put the real files under the assets/ folder (see assets/README.txt).
   Project screenshots are normally attached to each project instead — see
   content/projects/_template.js.
   ========================================================================= */

(function (TC) {
    TC.registerAsset('/cv.pdf', 'pdf', 'assets/pdf/cv.pdf');
    TC.registerAsset('/papers/paper-2024.pdf', 'pdf', 'assets/pdf/paper-2024.pdf');
})(window.TERMINAL_CONTENT);
