// ==UserScript==
// @name         Bypass Instagram Login Redirects
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  a workaround to bypass Instagram login page
// @author       metoo666
// @match        *://*/*
// @run-at       document-body
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @license      GNU GPLv3
// @downloadURL https://update.greasyfork.org/scripts/420604/Bypass%20Instagram%20Login%20Redirects.user.js
// @updateURL https://update.greasyfork.org/scripts/420604/Bypass%20Instagram%20Login%20Redirects.meta.js
// ==/UserScript==

(async () => {
    // Instagram profile & post URLs regex
    const instaProfile = /(?<!^https\:\/\/www\.google\.com\/imgres\?imgurl.*)(?:https?\:\/\/)?(?:www\.)?(?<!help\.|api\.|business\.|about\.|lookaside\.)(?:(?:(?:instagram\.com|instagr\.am)\/accounts\/login\/\?next=)|(?:instagram\.com))(?:\/|%2f)(?!accounts|explore|developer|reel)([a-zA-Z._0-9]{3,})/i;
    const instaPost = /(?<!^https\:\/\/www\.google\.com\/imgres\?imgurl.*)(?:https?\:\/\/)?(?:www\.)?(?:(?:(?:instagram\.com|instagr\.am)\/accounts\/login\/\?next=)|(?:instagram\.com))(?:(?:\/|%2f)p|(?:\/|%2f)reel)(?:\/|%2f)([a-zA-Z._0-9-]+)/i;

    // Viewer class
    class Viewer {
        constructor(name, profilePrefix, postPrefix, identifier, reverseMediaId) {
            this.name = name; // viewer name
            this.profilePrefix = profilePrefix; // profile prefix URL
            this.postPrefix = postPrefix; // post prefix URL
            this.identifier = identifier; // "shortcode" or "mediaId"
            this.reverseMediaId = reverseMediaId; // true > reverse mediaId
        }
    }

    // Default viewer
    var defaultViewer = new Viewer("imginn", "https://imginn.com/", "https://imginn.com/p/", "shortcode")
    var currentViewer = await GM.getValue("viewerConfig", defaultViewer);


    // Menu Options:
    var viewerOptions = [{
        name: "Picnob",
        function: picnob
    }, {
        name: "Picuki",
        function: picuki
    }, {
        name: "Dumpor",
        function: dumpor
    }, {
        name: "imginn",
        function: imginn
    }];

    // ✔️ current option:
    for (let item of viewerOptions) {
        if (currentViewer.name == item.name) {
            item.name = currentViewer.name + " ✔️";
            GM.registerMenuCommand(item.name, item.function);
        } else {
            GM.registerMenuCommand(item.name, item.function);
        }
    }

    // Switching viewers handler functions
    async function picuki() {
        let name = "Picuki";
        if (currentViewer.name != name) {
            GM.setValue("viewerConfig", new Viewer(name, "https://picuki.com/profile/", "https://picuki.com/media/", "mediaId", false)); // set Viewer
            location.reload(); // reload page
            alert(`Viewer is now set to ${name}`);
        }
    }

    async function dumpor() {
        let name = "Dumpor";
        if (currentViewer.name != name) {
            GM.setValue("viewerConfig", new Viewer(name, "https://dumpor.com/v/", "https://dumpor.com/c/", "mediaId", true)); // set Viewer
            location.reload(); // reload page
            alert(`Viewer is now set to ${name}`);
        }
    }

    async function imginn() {
        let name = "imginn";
        if (currentViewer.name != name) {
            GM.setValue("viewerConfig", new Viewer(name, "https://imginn.com/", "https://imginn.com/p/", "shortcode")); // set Viewer
            location.reload(); // reload page
            alert(`Viewer is now set to ${name}`);
        }
    }

    async function picnob() {
        let name = "Picnob";
        if (currentViewer.name != name) {
            GM.setValue("viewerConfig", new Viewer(name, "https://www.picnob.com/profile/", "https://www.picnob.com/post/", "shortcode")); // set Viewer
            location.reload(); // reload page
            alert(`Viewer is now set to ${name}`);
        }
    }


    function getMediaId(url) {
        switch (true) {
            case (currentViewer.identifier == "shortcode"): // if identifier is "shortcode" > get shortcode
                var shortcode = url.match(instaPost)[1]; // extract shortcode
                return shortcode;
                break;
            case (currentViewer.identifier == "mediaId"): // if identifier is "mediaId" > calculate mediaId
                shortcode = url.match(instaPost)[1]; // extract shortcode
                var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
                var mediaId = BigInt(0); // BigInt is used to produce large integers beyond the JavaScript limit (see reference below)
                shortcode = shortcode.split(""); // split the shortcode into a character array
                shortcode.forEach((letter) => { // for each letter
                    mediaId = BigInt((mediaId * 64n)) + BigInt(alphabet.indexOf(letter)); // convert from base64 to base10
                });
                if (currentViewer.reverseMediaId) { // if reversemediaId is true > reverse mediaId
                    let reversedMediaId = mediaId.toString().split("").reverse().join("");
                    return reversedMediaId;
                } else {
                    return mediaId;
                }
                break;
        }
    }

    function getUsername(url) { // get Instagram username from URL
        url = decodeURIComponent(url); // decode URL percent encoding
        let username = url.match(instaProfile)[1]; // extract username
        return username;
    }

    // Address checker function
    (() => {
        let address = window.location.href; // get page address
        switch (true) {
            case /next=(?:\/|%2f)(?!accounts|explore|developer|reel)[a-zA-Z._0-9]{3,}/i.test(address): // if address is https://www.instagram.com/accounts/login/?next=/<username>/
                window.location.href = currentViewer.profilePrefix + getUsername(address); // open in same tab
                break;
            case /next=(?:\/|%2f)(p|reel)(?:\/|%2f)[a-zA-Z._0-9-]+/i.test(address): // if address is https://www.instagram.com/accounts/login/?next=/<p or reel>/<shortcode>/
                window.location.href = currentViewer.postPrefix + getMediaId(address); // open in same tab
                break;
        }
    })();

    if (!document.cookie.includes("ds_user_id")) { // if Instagram NOT logged in
        var aTags = []; // empty array to collect <a> tags
        var body = document.documentElement || document.body; // get body to monitor for changes
        var x; // loop variable
        // set up an observer
        var observer = new MutationObserver(() => {
            aTags = [...new Set([...aTags, ...document.querySelectorAll("a")])]; // collect <a> tags without duplicates
            for (x of aTags) {
                try {
                    if (instaProfile.test(decodeURIComponent(x.href))) { // if href is an Instagram profile URL
                        x.addEventListener("click", (event) => { // override click event
                            event.stopPropagation();
                        }, true);
                        x.href = currentViewer.profilePrefix + getUsername(x.href); // change href attribute to profile link
                    }
                    if (instaPost.test(decodeURIComponent(x.href))) { // if href is an Instagram post URL
                        x.addEventListener("click", (event) => { // override click event
                            event.stopPropagation();
                        }, true);
                        x.href = currentViewer.postPrefix + getMediaId(x.href); // change href attribute to post link
                    }
                } catch {} // ignore errors
            }
        });
        // start observer
        observer.observe(body, {
            subtree: true,
            childList: true, //  monitor addition/removal of nodes
            attributeFilter: ["href"] // monitor href changes
        });
    }
})();

// references:
// https://stackoverflow.com/questions/16758316/where-do-i-find-the-instagram-media-id-of-a-image
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// https://codeburst.io/how-to-merge-arrays-without-duplicates-in-javascript-91c66e7b74cf
// https://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
// https://stackoverflow.com/questions/56024629/what-is-the-accesskey-parameter-of-gm-registermenucommand-and-how-to-use-it