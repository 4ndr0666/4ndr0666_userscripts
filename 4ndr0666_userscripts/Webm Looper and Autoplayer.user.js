// ==UserScript==
// @name        Webm Looper and Autoplayer
// @namespace   https://raw.githubusercontent.com/kpg-anon/scripts/main/userscripts/webmloop.js
// @author      WhatIsThisImNotGoodWithComputers
// @description Loop and autoplay all webms by default
// @include     *.webm
// @run-at      document-start
// @version     1.1
// @grant       none
// ==/UserScript==

var vids = document.getElementsByTagName("video");
for (i = 0; i < vids.length; i++) {
    vids[i].setAttribute("loop", "true");
    vids[i].setAttribute("autoplay", "true");
}
void 0;
