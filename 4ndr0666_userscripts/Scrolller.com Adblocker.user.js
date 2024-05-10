// ==UserScript==
// @name            Scrolller.com Adblocker
// @name:de         Scrolller.com Werbeblocker
// @version         1.0.2
// @description     Blocks Ads and the Premium & Adblock Popup on Scrolller.com
// @description:de  Blockiert Werbung und das Premium & Adblock Popup auf Scrolller.com
// @icon            https://scrolller.com/assets/favicon-16x16.png
// @author          TalkLounge (https://github.com/TalkLounge)
// @namespace       https://github.com/TalkLounge/scrolller.com-adblocker
// @license         MIT
// @match           https://scrolller.com/*
// @grant           none
// @run-at          document-start
// @downloadURL https://update.greasyfork.org/scripts/465664/Scrolllercom%20Adblocker.user.js
// @updateURL https://update.greasyfork.org/scripts/465664/Scrolllercom%20Adblocker.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const s = document.createElement("style");
    s.innerHTML = `.popup:has(#recommendations__popup), .popup:has(.ad-block-popup), .popup:has([class^=PremiumCTAPopup]), .popup:has([class^=GetPremiumPopup]), .fullscreen-view__ad {
        display: none;
    }

    .vertical-view__column > .vertical-view__item {
        visibility: hidden;
    }`;
    document.head.append(s);

    const old_window_top_fetch = window.top.fetch;
    window.top.fetch = function () {
        if (arguments[1] && arguments[1].body && arguments[1].body.indexOf("AffiliateQuery") != -1) {
            return;
        }

        return old_window_top_fetch.apply(this, arguments);
    };
})();