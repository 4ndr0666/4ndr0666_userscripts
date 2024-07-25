// ==UserScript==
// @name                Youtube HD Premium
// @icon                data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAqhJREFUaEPtmc9rE0EUxz+DjSh6UAQRxP4F9uhBRKjipef+FwqtoZdYEk3U4jGn0FJ6KrQnj6X0EKVKKIi9tAotPZSCYilFoq0/sK1Z92V329XGENiZSRZ2LtllZ9+8z/e9ncy8UcS8qZj7TwLQ7ggmEUgiEFGB/6aQAxeBq8Al4GxonDPAydD9+dB1qkFfefy9iZ9fgRrwC/jh96v6vz+Bj8B7BduNbBwDcOA6UABuAyciCqTr9d/ACxf0oYI3YaOHAA71KfWpq8QDF6BTP27H9/GRArk+ctSBZ0BGl2SG7YwoyB4COF66lDtY+X/1EPVvKXhVTxUHKsANw6rpNl9RcFM50A1sxEj9QAiJQrcA9LvT5XPd8liy1y8Ad4GSpQF1D3NPAO4DRd2WLdlL6wUYH4dKBSYnLfmPZoDZWejrg/l5GByE5WXTIIYAxO1aDaamYGgIthsuY3TAGQQI3KtWoVCAUgkODnQ4HbZhASAYbnUV0mmYm9MJYREgcHtmxvs+1td1gLQBQNze24OxMchmYXc3CkibAOQDl6k2k4GtrZgBLC56KbSwEMXx4F2LEdjchHweJia8KVZPswCwvw+jo5DLwc6OHrePrBgGKJdhYABWVnQ7bjiF1ta8OV+WFmab5ghMT8PSEhSL3lRpvmkGSKVAct5eqwPEfkMT+y3lZeBDbDf1kq6xLqv4AL3AyxhFQUoqvQpeh2ujI+46cdjeBBJppL9Li34UBCYP5Do4ErKIeiLV82PF3UAPB64Bj4E7biW4K5JO+l6WvajUbqW8/jZsttkBxwWgB7gCnPZfCg4z5P6UH6lzTfyUgxGp7ctBRdBkBxNsjiWXv4Seyd93+DDkG/AJeKfgc6NxOvUcoOXYJQAtS2WoYxIBQ8K2bDaJQMtSGer4B8aT1sve/dr7AAAAAElFTkSuQmCC
// @author              ElectroKnight22
// @namespace           electroknight22_youtube_hd_namespace
// @version             2024.07.24
// @match               *://www.youtube.com/*
// @exclude             *://www.youtube.com/live_chat*
// @grant               GM.getValue
// @grant               GM.setValue
// @grant               GM.deleteValue
// @grant               GM.listValues
// @grant               GM_registerMenuCommand
// @grant               GM_unregisterMenuCommand
// @license             MIT
// @description         Automcatically switches to your pre-selected resolution. Enables premium when possible.
// @description:zh-TW   自動切換到你預先設定的畫質。會優先使用Premium位元率。
// @description:zh-CN   自动切换到你预先设定的画质。会优先使用Premium比特率。
// @description:ja      自動的に設定した画質に替わります。Premiumのビットレートを優先的に選択します。
// @downloadURL https://update.greasyfork.org/scripts/498145/Youtube%20HD%20Premium.user.js
// @updateURL https://update.greasyfork.org/scripts/498145/Youtube%20HD%20Premium.meta.js
// ==/UserScript==

/*jshint esversion: 11 */

(function() {
    "use strict";

    const DEBUG = false;

    const DEFAULT_SETTINGS = {
        targetResolution: "hd2160"
    };

    const resolutions = ['highres', 'hd2880', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto'];
    const quality = {
        highres: 4320,
        hd2880:  2880,
        hd2160:  2160,
        hd1440:  1440,
        hd1080:  1080,
        hd720:   720,
        large:   480,
        medium:  360,
        small:   240,
        tiny:    144,
        auto:    0
    };

    const qualityLevels = Object.fromEntries(
        Object.entries(quality).map(([key, value]) => [value, key])
    );

    let userSettings = { ...DEFAULT_SETTINGS };
    let menuCommandIds = [];

    let doc = document, win = window;
    let videoId = null;

    // --------------------
    // --- FUNCTIONS ------
    // --------------------

    function debugLog(message, shouldShow = true) {
        if (DEBUG && shouldShow) {
            console.log("YTHD DEBUG | " + message);
        }
    }

    // --------------------
    // Attempt to set the video resolution to target quality or the next best quality
    function setResolution(target, force = false) {
        if (target == 'auto') return;

        let ytPlayer = doc.getElementById("movie_player") || doc.getElementsByClassName("html5-video-player")[0];

        if (!isValidVideo(ytPlayer, force)) return;

        videoId = ytPlayer.getVideoData().video_id;

        let localItem = null;
        try {
            localStorage.getItem("yt-player-quality");
        } catch {
            debugLog("Fetching last used quality failed catastrophically. Likely the website is not YouTube. If website is YouTube then YouTube changed something.");
        }

        let availableQualities = ytPlayer.getAvailableQualityLevels();
        target = findNextAvailableQuality(target, availableQualities);

        let premiumIndicator = "Premium";
        let premiumData = ytPlayer.getAvailableQualityData().find(q => q.quality == target && q.qualityLabel.includes(premiumIndicator) && q.isPlayable);
        ytPlayer.setPlaybackQualityRange(target, target, premiumData?.formatId);
        debugLog("Set quality to: " + target + (premiumData ? " Premium" : ""));

        if (localItem){
            localStorage.setItem("yt-player-quality",localItem);
        }
        else {
            localStorage.removeItem("yt-player-quality");
        }
    }

    function isValidVideo(ytPlayer, force) {

        if (!ytPlayer?.getAvailableQualityLabels()[0]) {
            debugLog("Video data missing");
            videoId = null;
            return false;
        }

        if (window.location.href.startsWith("https://www.youtube.com/shorts/")) {
            debugLog("Skipping Youtube Shorts");
            videoId = null;
            return false;
        }

        if (videoId == ytPlayer.getVideoData().video_id && !force) {
            debugLog("Duplicate load");
            return false;
        }

        return true;
    }

    function findNextAvailableQuality(target, availableQualities) {
        const available = availableQualities.map(q => ({ quality: q, value: quality[q] }));
        const targetValue = quality[target];
        const smallerOrEqualQualities = available.filter(q => q.value <= targetValue);
        smallerOrEqualQualities.sort((a, b) => b.value - a.value);
        return smallerOrEqualQualities.length > 0 ? smallerOrEqualQualities[0].quality : 'auto';
    }

    // --------------------
    // Functions for the quality selection menu

    function createQualityMenu() {
        GM_registerMenuCommand("Set Preferred Quality (show/hide)", () => {
            menuCommandIds.length ? removeQualityMenuItems() : showQualityMenuItems();
        }, {
            autoClose: false
        });
    }

    function showQualityMenuItems() {
        removeQualityMenuItems();
        resolutions.forEach((resolution) => {
            let qualityText = (resolution === 'auto') ? 'auto' : quality[resolution] + "p";
            if (resolution === userSettings.targetResolution) {
                qualityText += " (selected)";
            }
            let menuCommandId = GM_registerMenuCommand(qualityText, () => {
                setSelectedResolution(resolution);
            }, {
                autoClose: false,
            });
            menuCommandIds.push(menuCommandId);
        });
    }

    function removeQualityMenuItems() {
        while (menuCommandIds.length) {
            GM_unregisterMenuCommand(menuCommandIds.pop());
        }
    }

    function setSelectedResolution(resolution) {
        if (userSettings.targetResolution == resolution) return;
        userSettings.targetResolution = resolution;
        GM.setValue('targetResolution', resolution);
        removeQualityMenuItems();
        showQualityMenuItems();
        setResolution(resolution, true);
    }

    // --------------------
    // Sync settings with locally stored values
    async function applySettings() {
        try {
            // Get all keys from GM
            const storedValues = await GM.listValues();

            // Write any missing key-value pairs from DEFAULT_SETTINGS to GM
            await Promise.all(Object.entries(DEFAULT_SETTINGS).map(async ([key, value]) => {
                if (!storedValues.includes(key)) {
                    await GM.setValue(key, value);
                }
            }));

            // Delete any extra keys in GM that are not in DEFAULT_SETTINGS
            await Promise.all(storedValues.map(async key => {
                if (!(key in DEFAULT_SETTINGS)) {
                    await GM.deleteValue(key);
                }
            }));

            // Retrieve and update user settings from GM
            await Promise.all(
                storedValues.map(key => GM.getValue(key).then(value => [key, value]))
            ).then(keyValuePairs => keyValuePairs.forEach(([newKey, newValue]) => {
                userSettings[newKey] = newValue;
            }));

            debugLog(Object.entries(userSettings).map(([key, value]) => key + ": " + value).join(", "));
        } catch (error) {
            debugLog("Error when applying settings: " + error.message);
        }
    }

    // --------------------
    // Main function
    function main() {
        if (win.self == win.top) { createQualityMenu(); }
        setResolution(userSettings.targetResolution);
        win.addEventListener('popstate', () => { videoId = null; });
        win.addEventListener("loadstart", () => { setResolution(userSettings.targetResolution); }, true);
    }

    // --------------------
    // Entry Point
    applySettings().then(main);
})();