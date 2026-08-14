'use strict';

/* =========================================================================
   IDENTITY & BANNER
   -------------------------------------------------------------------------
   • user / hostname   → shown in the prompt:  user@hostname:~$
   • banner            → the welcome message printed on load AND by `clear`

   Banner lines are [text, cssClass] pairs. `${USER}` / `${HOSTNAME}` are
   filled in automatically. Markdown links like [about](about.md) render as
   clickable links that open in a new tab.
   ========================================================================= */

(function (TC) {
    TC.user = 'guest';
    TC.hostname = 'terminal-website';

    // push onto the shared banner array created by content.js
    TC.banner.push(
        ['==============================================================', 'c-dim'],
        ['  TERMINAL PORTFOLIO  v1.0.0', 'c-green c-bold'],
        ['  A Linux-terminal styled personal website', 'c-cyan'],
        ['==============================================================', 'c-dim'],
        ['', ''],
        ["Welcome, ${USER}! Explore the site with terminal commands:", 'c-yellow'],
        ['', ''],
        ['Quick links:', 'c-bold'],
        ['  [about](about.md)    [resume](resume.md)    [projects](projects.md)', ''],
        ['  [skills](skills.md)  [contact](contact.md)  [CV](cv.pdf)', ''],
        ['', ''],
        ['Try some commands:', 'c-bold'],
        ['  ls              list files in the current directory', ''],
        ['  cat about.md    read the About section', ''],
        ['  cd projects     open the projects folder', ''],
        ['  help            show all commands', ''],
        ['  neofetch        system info', ''],
        ['  clear           clear the screen and re-show this banner', ''],
        ['', ''],
        ['Tip: press TAB to autocomplete, use \u2191 / \u2193 for history.', 'c-dim']
    );
})(window.TERMINAL_CONTENT);
