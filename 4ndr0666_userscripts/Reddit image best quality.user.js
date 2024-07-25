// ==UserScript==
// @name            	Reddit image best quality
// @namespace       	https://greasyfork.org/users/821661
// @match           	https://www.reddit.com/*
// @match           	https://new.reddit.com/*
// @match           	https://sh.reddit.com/*
// @grant           	none
// @version         	1.0
// @author          	hdyzen
// @description     	images best quality in reddit
// @license         	MIT
// @downloadURL https://update.greasyfork.org/scripts/490602/Reddit%20image%20best%20quality.user.js
// @updateURL https://update.greasyfork.org/scripts/490602/Reddit%20image%20best%20quality.meta.js
// ==/UserScript==
'use strict';

const regex = /\/([^\/]+)\?/;

const observer = new MutationObserver(mutations => {
    const images = document.querySelectorAll('img[src^="https://preview.redd.it/"]:not([real])');
    images.forEach(image => {
        image.setAttribute('real', '');
        image.src = `https://i.redd.it/${image.src.match(regex)[1]}`;
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
