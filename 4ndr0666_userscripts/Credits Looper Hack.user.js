// ==UserScript==
// @name         Credits Looper Hack
// @namespace    *://*.tampermonkey.net/*
// @version        1
// @description    Get infinite credits!
// @match         https://vanceai.com/*
// @author        4ndr0666
// @grant         none
// ==/UserScript==

(function() {
    'use strict';

    // Function to set cookies
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=None; Secure";
    }

    window.addEventListener("load", function () {
        setCookie("leftCredits", "3", 30);
    }, false);
})();
