// ==UserScript==
// @name         Google Translate Widget
// @namespace    GoogleTranslateWidget
// @version      1.0
// @description  Embed Google Translate widget into web page
// @author       4ndr0666
// @match        *://*/*
// @grant        none
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/485678/Google%20Translate%20Widget.user.js
// @updateURL https://update.greasyfork.org/scripts/485678/Google%20Translate%20Widget.meta.js
// ==/UserScript==

(function() {
    'use strict';

    function addGoogleTranslate() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }

    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: 'auto',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    }

    window.googleTranslateElementInit = googleTranslateElementInit;
    addGoogleTranslate();

    var div = document.createElement('div');
    div.id = 'google_translate_element';
    document.body.insertBefore(div, document.body.firstChild);
})();
