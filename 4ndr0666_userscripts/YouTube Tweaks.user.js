// ==UserScript==
// @name         YouTube Tweaks
// @version      2023.09.05
// @description  Block Shorts, hide watched videos, change the number of videos per row & more!
// @author       Pedro
// @license      MIT
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==
GM_registerMenuCommand('Options menu', createOptionsPanel);

const styleTag = document.createElement('style');
styleTag.innerHTML = `
    #contents > ytd-rich-grid-row,
    #contents > ytd-rich-grid-row > #contents {
        display: contents;
    }

    #content.ytd-rich-section-renderer {
        margin: 0 8px;
    }

    ytd-rich-item-renderer[is-slim-grid]:last-of-type {
        margin-right: calc(var(--ytd-rich-grid-item-margin)/2);
    }

    ytd-rich-item-renderer[is-slim-grid]:first-of-type {
        margin-left: calc(var(--ytd-rich-grid-item-margin)/2);
    }

    #contents.ytd-rich-grid-renderer:not([page-subtype="channels"] #contents.ytd-rich-grid-renderer) {
        width: calc(100% - 32px);
        max-width: calc(var(--ytd-rich-grid-items-per-row) * (var(--ytd-rich-grid-item-max-width) + var(--ytd-rich-grid-item-margin)));
    }

    ytd-rich-grid-media[mini-mode],
    ytd-rich-section-renderer[mini-mode] #content.ytd-rich-section-renderer {
        max-width: none;
    }

    .skeleton-bg-color.ytd-ghost-grid-renderer,
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer) {
        display: none;
    }`;

const observer = new MutationObserver(function() {
    if (document.body) {
        observer.disconnect();
        document.documentElement.appendChild(styleTag);
    }
});

observer.observe(document, {
    childList: true,
    subtree: true,
});

function createOptionsPanel() {
    if (document.getElementById('options-panel')) return;

    const div = document.createElement('div');
    div.id = 'options-panel';
    div.style.position = 'fixed';
    div.style.right = '0px';
    div.style.backgroundColor = 'var(--yt-spec-menu-background)';
    div.style.boxShadow = '0px 4px 32px 0px var(--yt-spec-static-overlay-background-light)';
    div.style.padding = '8px 0px';
    div.style.zIndex = '9999';

    const div2 = document.createElement('div');
    div2.classList.add('options-panel');
    div2.style.overflow = 'auto';
    div2.style.maxHeight = `calc(100vh - 50px)`;

    document.body.appendChild(div);
    div.appendChild(labelStyle('Close'));
    div.appendChild(div2);

    div.children[0].addEventListener('click', function() {
        div.remove();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) div.remove();
    });

    function labelStyle(text) {
        const div = document.createElement('div');
        div.style.cursor = 'pointer';
        div.style.padding = '10px';
        div.style.display = 'flex';

        const label = document.createElement('label');
        label.textContent = text;
        label.style.color = 'var(--yt-spec-text-primary)';
        label.style.fontFamily = 'Roboto, Arial, sans-serif';
        label.style.fontSize = '1.4rem';
        label.style.fontWeight = '400';
        label.style.cursor = 'pointer';
        label.style.flexGrow = '1';
        label.style.marginRight = '1em';

        div.addEventListener('mouseenter', function() {
            div.style.backgroundColor = 'var(--button-hover-color, var(--yt-spec-badge-chip-background))';
        });

        div.addEventListener('mouseleave', function() {
            div.style.backgroundColor = '';
        });

        div.appendChild(label);
        return div;
    }

    styleTag.innerHTML += `
        .options-panel::-webkit-scrollbar-track {
            background-color: none;
        }

        .options-panel::-webkit-scrollbar {
            width: 8px;
        }

        .options-panel::-webkit-scrollbar-thumb {
            background: var(--yt-spec-text-secondary);
            border-radius: 8px;
        }

        .options-panel::-webkit-scrollbar-thumb:hover {
            background: var(--yt-spec-text-disabled);
        }

        .select-menu {
            box-sizing: border-box;
            border: none;
            border-bottom: 1px solid var(--yt-spec-10-percent-layer);
            font-size: 1.4rem;
            width: 124px;
            height: 25px;
            background: var(--yt-spec-menu-background);
            color: var(--yt-spec-text-primary);
            transition: linear 0.08s;
            outline: none;
        }

        .select-menu:focus {
            border-bottom: 2px solid var(--main-color, var(--yt-spec-text-primary));
            color: var(--main-color, var(--yt-spec-text-primary));
            transition: linear 0.08s;
        }

        .select-menu option {
            color: var(--yt-spec-text-primary);
        }

        .select-menu::-webkit-scrollbar-track {
            background-color: var(--yt-spec-menu-background);
        }

        .select-menu::-webkit-scrollbar {
            width: 8px;
        }

        .select-menu::-webkit-scrollbar-thumb {
            background: var(--yt-spec-text-secondary);
            border-radius: 8px;
        }

        .toggle-button {
            display: inline-block;
            position: relative;
            width: 36px;
            height: 14px;
        }

        .toggle-button-track {
            position: absolute;
            height: 100%;
            width: 100%;
            top: 3px;
            border-radius: 8px;
            background-color: var(--paper-toggle-button-unchecked-bar-color, #000);
            opacity: var(--paper-toggle-button-unchecked-bar-opacity, 0.4);
            transition: background-color linear 0.08s;
        }

        .toggle-button[aria-pressed="true"] .toggle-button-track {
            background-color: var(--paper-toggle-button-checked-bar-color, var(--primary-color));
            opacity: var(--paper-toggle-button-checked-bar-opacity, 0.5);
        }

        .toggle-button-circle {
            position: absolute;
            left: 0;
            right: auto;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background-color: var(--paper-toggle-button-unchecked-button-color, #fafafa);
            transform: translateX(0px);
            transition: transform linear 0.08s, background-color linear 0.08s;
            box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
        }

        .toggle-button[aria-pressed="true"] .toggle-button-circle {
            background-color: var(--paper-toggle-button-checked-button-color, var(--primary-color));
            transform: translateX(16px);
        }`;

    const labels = [
        '🎨 Dark mode theme',
        '🎥 Videos per row',
        '👤 Video grid: Hide profile pictures',
        '🗛 Video grid: Decrease font size',
        '🎥 Show full video titles',
        '🩳 Shorts blocker',
        '🔎 Hide irrelevant search results',
        '⬆️ Show back to top button',
        '🎞️ More animations',
        '✂️ Compact left sidebar',
        '✂️ Compact header bar',
        '❌ Hide homepage\'s recommendation bar',
        '❌ Hide Latest YouTube Posts',
        '💬 Auto-expand comments',
        '📜 Video description appearance',
        '👾 Watch page: Hide game section',
        '🔴 Red subscribe button',
        '🎭 Fullscreen theater mode',
        '💡 Ambient mode in theater and fullscreen mode',
        '💳 Hide end cards',
        '🔁 Watch page: Hide Share button',
        '⬇️ Watch page: Hide Download button',
        '✂️ Watch page: Hide Clip button',
        '💲 Watch page: Hide Thanks button',
        '📜 Watch page: Hide Transcript button',
        '💾 Watch page: Hide Save button',
        '✂️ Watch page: Compact buttons',
        '🎥 Hide watched videos: Homepage',
        '🎥 Hide watched videos: Sub feed/channel video grid',
        '🎥 Hide watched videos: Related videos sidebar',
        '🎥 Hide watched videos: Search results',
        '🎵 Hide mixes: Homepage',
        '🎵 Hide mixes: Related videos sidebar',
        '🎵 Hide mixes: Search results',
    ];

    for (let i = 0; i < labels.length; i++) div2.appendChild(labelStyle(labels[i])).setAttribute('id', labels[i]);

    const selectMenus = [];

    const selectMenusOptions = [];

    const selectMenusLabels = [
        '🎨 Dark mode theme',
        '🎥 Videos per row',
        '⬆️ Show back to top button',
        '📜 Video description appearance',
        '🎥 Hide watched videos: Homepage',
        '🎥 Hide watched videos: Sub feed/channel video grid',
        '🎥 Hide watched videos: Related videos sidebar',
        '🎥 Hide watched videos: Search results',
    ];

    let keys = [
        'darkThemesSelectMenu',
        'videosPerRowSelectMenu',
        'scrollUpButtonSelectMenu',
        'videoDescriptionSelectMenu',
        'hideWatchVideosSelectMenu',
        'hideWatchVideos2SelectMenu',
        'hideWatchVideos3SelectMenu',
        'hideWatchVideos4SelectMenu',
    ];

    selectMenusOptions[0] = [
        { text: 'Default' },
        { text: 'Ilicit Purple' },
        { text: 'Icy Blue' },
        { text: 'Gruvbox' },
        { text: 'Neon' },
        { text: 'Yaru' },
        { text: 'Qogir Ubuntu' },
        { text: 'Sunset' },
        { text: 'Catppuccin Mocha' },
        { text: 'Catppuccin Macchiato' },
        { text: 'Catppuccin Frappe' },
        { text: 'Rosé Pine' },
        { text: 'Rosé Pine Moon' },
        { text: 'Everforest' },
        { text: 'Kanagawa' },
        { text: 'Nord' },
        { text: 'Sleek Coral' },
        { text: 'Sleek Cherry' },
        { text: 'Sleek Futura' },
        { text: 'Sleek BladeRunner' },
        { text: 'Pastel Green' },
        { text: 'Sweet Pastel' },
        { text: 'Pink' },
        { text: 'Trollwut Pink' },
        { text: 'Dracula' },
        { text: 'Sonokai Espresso' },
        { text: 'Sonokai Shusia' },
        { text: 'Grey and White' },
        { text: 'Black and Blue' },
        { text: 'Black and Yellow' },
        { text: 'Black and Green' },
        { text: 'Black and Pink' },
        { text: 'Black and Orange' },
        { text: 'Black and Red' },
        { text: 'GX Classic' },
        { text: 'Ultraviolet' },
        { text: 'Sub Zero' },
        { text: 'Frutti Di Mare' },
        { text: 'Purple Haze' },
        { text: 'Vaporwave' },
        { text: 'Rose Quartz' },
        { text: 'Coming Soon' },
        { text: 'Hackerman' },
        { text: 'Lambda' },
        { text: 'After Eight' },
        { text: 'Pay-To-Win' },
        { text: 'White Wolf' },
    ];

    selectMenusOptions[1] = [
        { text: 'Default' },
        { text: '4' },
        { text: '5' },
        { text: '6' },
        { text: '7' },
        { text: '8' },
        { text: '9' },
        { text: '10' },
        { text: '11' },
        { text: '12' },
    ];

    selectMenusOptions[2] = [
        { text: 'Turned off' },
        { text: 'On the right' },
        { text: 'On the left' },
        { text: 'Centered' },
    ];

    selectMenusOptions[3] = [
        { text: 'Default' },
        { text: 'Expanded' },
        { text: 'Expanded + sections hidden' },
        { text: 'Minimalist' },
    ];

    selectMenusOptions[4] = [
        { text: 'Turned off' },
        { text: 'All videos' },
        { text: 'Only fully-watched videos' },
    ];

    selectMenusOptions[5] = [
        { text: 'Turned off' },
        { text: 'All videos' },
        { text: 'Only fully-watched videos' },
    ];

    selectMenusOptions[6] = [
        { text: 'Turned off' },
        { text: 'All videos' },
        { text: 'Only fully-watched videos' },
    ];

    selectMenusOptions[7] = [
        { text: 'Turned off' },
        { text: 'All videos' },
        { text: 'Only fully-watched videos' },
    ];

    for (let i = 0; i < selectMenusOptions.length; i++) {
        selectMenus.push(document.createElement('select'));
        selectMenus[i].classList.add('select-menu');

        selectMenusOptions[i].forEach((option) => {
            selectMenus[i].appendChild(document.createElement('option')).textContent = option.text;
            document.getElementById(selectMenusLabels[i]).appendChild(selectMenus[i]);
        });

        GM_getValue(keys[i]) ? (selectMenus[i].value = GM_getValue(keys[i])) : (selectMenus[i].selectedIndex = 0);
    }

    selectMenus[0].addEventListener('change', (event) => {
        const optionsObj = {
            'Default': 0,
            'Ilicit Purple': 1,
            'Icy Blue': 2,
            'Gruvbox': 3,
            'Neon': 4,
            'Yaru': 5,
            'Qogir Ubuntu': 6,
            'Sunset': 7,
            'Catppuccin Mocha': 8,
            'Catppuccin Macchiato': 9,
            'Catppuccin Frappe': 10,
            'Rosé Pine': 11,
            'Rosé Pine Moon': 12,
            'Everforest': 13,
            'Kanagawa': 14,
            'Nord': 15,
            'Sleek Coral': 16,
            'Sleek Cherry': 17,
            'Sleek Futura': 18,
            'Sleek BladeRunner': 19,
            'Pastel Green': 20,
            'Sweet Pastel': 21,
            'Pink': 22,
            'Trollwut Pink': 23,
            'Dracula': 24,
            'Sonokai Espresso': 25,
            'Sonokai Shusia': 26,
            'Grey and White': 27,
            'Black and Blue': 28,
            'Black and Yellow': 29,
            'Black and Green': 30,
            'Black and Pink': 31,
            'Black and Orange': 32,
            'Black and Red': 33,
            'GX Classic': 34,
            'Ultraviolet': 35,
            'Sub Zero': 36,
            'Frutti Di Mare': 37,
            'Purple Haze': 38,
            'Vaporwave': 39,
            'Rose Quartz': 40,
            'Coming Soon': 41,
            'Hackerman': 42,
            'Lambda': 43,
            'After Eight': 44,
            'Pay-To-Win': 45,
            'White Wolf': 46,
        };

        GM_setValue('darkThemes', optionsObj[event.target.value]);
        GM_setValue('darkThemesSelectMenu', event.target.value);
        darkThemes(1);
    });

    selectMenus[1].addEventListener('change', (event) => {
        const optionsObj = {
            'Default': 0,
            '4': 1,
            '5': 2,
            '6': 3,
            '7': 4,
            '8': 5,
            '9': 6,
            '10': 7,
            '11': 8,
            '12': 9,
        };

        GM_setValue('videosPerRow', optionsObj[event.target.value]);
        GM_setValue('videosPerRowSelectMenu', event.target.value);
        videosPerRow(1);
    });

    selectMenus[2].addEventListener('change', (event) => {
        const optionsObj = {
            'Turned off': 0,
            'On the right': 1,
            'On the left': 2,
            'Centered': 3,
        };

        GM_setValue('scrollUpButton', optionsObj[event.target.value]);
        GM_setValue('scrollUpButtonSelectMenu', event.target.value);
        scrollUpButton(1);
    });

    selectMenus[3].addEventListener('change', (event) => {
        const optionsObj = {
            'Default': 0,
            'Expanded': 1,
            'Expanded + sections hidden': 2,
            'Minimalist': 3,
        };

        GM_setValue('videoDescription', optionsObj[event.target.value]);
        GM_setValue('videoDescriptionSelectMenu', event.target.value);
        videoDescription(1);
    });

    selectMenus[4].addEventListener('change', (event) => {
        const optionsObj = {
            'Turned off': 0,
            'All videos': 1,
            'Only fully-watched videos': 2,
        };

        GM_setValue('hideWatchVideos', optionsObj[event.target.value]);
        GM_setValue('hideWatchVideosSelectMenu', event.target.value);
        hideWatchVideos(1);
    });

    selectMenus[5].addEventListener('change', (event) => {
        const optionsObj = {
            'Turned off': 0,
            'All videos': 1,
            'Only fully-watched videos': 2,
        };

        GM_setValue('hideWatchVideos2', optionsObj[event.target.value]);
        GM_setValue('hideWatchVideos2SelectMenu', event.target.value);
        hideWatchVideos2(1);
    });

    selectMenus[6].addEventListener('change', (event) => {
        const optionsObj = {
            'Turned off': 0,
            'All videos': 1,
            'Only fully-watched videos': 2,
        };

        GM_setValue('hideWatchVideos3', optionsObj[event.target.value]);
        GM_setValue('hideWatchVideos3SelectMenu', event.target.value);
        hideWatchVideos3(1);
    });

    selectMenus[7].addEventListener('change', (event) => {
        const optionsObj = {
            'Turned off': 0,
            'All videos': 1,
            'Only fully-watched videos': 2,
        };

        GM_setValue('hideWatchVideos4', optionsObj[event.target.value]);
        GM_setValue('hideWatchVideos4SelectMenu', event.target.value);
        hideWatchVideos4(1);
    });

    keys = [
        '',
        '',
        'hideProfilePictures',
        'decreaseFontSize',
        'showFullVideoTitles',
        'shortsBlocker',
        'hideSearchResults',
        '',
        'moreAnimations',
        'compactLeftSidebar',
        'compactHeaderBar',
        'hideRecommendationBar',
        'hideLatestYouTubePosts',
        'autoExpandComments',
        '',
        'hideGameSection',
        'redSubscribeButton',
        'fullscreenTheaterMode',
        'ambientMode',
        'hideEndCards',
        'hideShareButton',
        'hideDownloadButton',
        'hideClipButton',
        'hideThanksButton',
        'hideTranscriptButton',
        'hideSaveButton',
        'compactButtons',
        '',
        '',
        '',
        '',
        'hideMixes',
        'hideMixes2',
        'hideMixes3',
    ];

    for (let i = 0; i < keys.length; i++) {
        if (document.getElementById(labels[i]).children.length > 1) continue;

        const toggleButton = document.createElement('div');
        toggleButton.classList.add('toggle-button');
        GM_getValue(keys[i]) ? toggleButton.setAttribute('aria-pressed', 'true') : toggleButton.setAttribute('aria-pressed', 'false');

        let div = document.createElement('div');
        div.classList.add('toggle-button-track');
        toggleButton.appendChild(div);

        div = document.createElement('div');
        div.classList.add('toggle-button-circle');
        toggleButton.appendChild(div);

        document.getElementById(labels[i]).appendChild(toggleButton);
        document.getElementById(labels[i]).addEventListener('click', eval(keys[i]));
    }
}

function darkThemes(click) {
    const cssCode = [`
        html[dark],
        html[dark] [dark] {
            --yt-spec-text-primary: var(--main-text);
            --yt-spec-touch-response: var(--main-text);
            --yt-spec-touch-response-inverse: currentcolor;
            --yt-spec-base-background: var(--main-background);
            --yt-spec-raised-background: var(--raised-background);
            --yt-spec-additive-background: var(--button-color);
            --yt-spec-badge-chip-background: var(--button-color);
            --yt-spec-outline: var(--button-hover-color);
            --yt-spec-10-percent-layer: var(--button-hover-color);
            --yt-spec-text-secondary: var(--secondary-text);
            --yt-spec-button-chip-background-hover: var(--button-hover-color);
            --yt-spec-icon-disabled: var(--disabled-color);
            --yt-spec-suggested-action: var(--sugg-action);
            --yt-spec-suggested-action-inverse: var(--sugg-action-inverse);
            --yt-spec-static-overlay-icon-active-other: var(--main-text);
            --yt-spec-static-overlay-touch-response-inverse: currentcolor;
            --yt-spec-static-overlay-background-brand: var(--red);
            --yt-spec-static-brand-red: var(--main-color);
            --yt-spec-commerce-filled-hover: var(--filled-button-hover-color);
            --yt-spec-mono-tonal-hover: var(--button-hover-color);
            --yt-spec-text-disabled: var(--disabled-color);
            --yt-spec-wordmark-text: var(--main-text);
            --yt-spec-brand-icon-active: var(--black, var(--white, var(--main-background)));
            --yt-spec-icon-active-other: var(--main-text);
            --yt-spec-call-to-action: var(--main-color);
            --yt-spec-call-to-action-inverse: var(--black, var(--white, var(--main-background)));
            --yt-spec-call-to-action-faded: var(--sugg-action);
            --yt-spec-themed-blue: var(--main-color);
            --yt-spec-themed-green: var(--green);
            --yt-spec-menu-background: var(--button-solid-color);
            --yt-spec-brand-background-primary: var(--raised-background);
            --yt-spec-general-background-a: var(--main-background);
            --yt-spec-general-background-b: var(--main-background);
            --yt-spec-general-background-c: var(--main-background);
            --yt-spec-static-brand-black: var(--main-background);
            --yt-spec-static-overlay-call-to-action: currentcolor;
            --yt-spec-light-blue: var(--main-color);
            --yt-spec-paper-tab-ink: currentcolor;
            --yt-spec-grey-5: var(--disabled-color);
            --yt-spec-brand-background-solid: var(--raised-background);
            --ytd-searchbox-background: var(--button-color);
            --ytd-searchbox-legacy-button-color: var(--button-color);
            --ytd-searchbox-legacy-border-color: none;
            --ytd-searchbox-legacy-button-hover-color: var(--button-color);
            --ytd-searchbox-legacy-button-focus-color: var(--button-color);
            --ytd-searchbox-legacy-button-border-color: none;
            --ytd-searchbox-legacy-button-hover-border-color: none;
            --ytd-searchbox-text-color: var(--main-text);
            --yt-emoji-picker-search-background-color: var(--button-color);
            --yt-emoji-picker-search-color: var(--main-text);
            --yt-emoji-picker-search-placeholder-color: var(--secondary-text);
            --yt-live-chat-primary-text-color: var(--main-text);
            --yt-live-chat-secondary-text-color: var(--secondary-text);
            --yt-live-chat-secondary-background-color: var(--button-color);
            --yt-live-chat-text-input-field-inactive-underline-color: var(--button-hover-color);
            --yt-live-chat-tertiary-text-color: var(--secondary-text);
            --yt-live-chat-vem-background-color: var(--button-solid-color);
            --yt-live-chat-background-color: var(--main-background);
            --yt-live-chat-banner-gradient-scrim: linear-gradient( var(--main-background), transparent);
            --yt-live-chat-action-panel-gradient-scrim: linear-gradient( to top, var(--main-background), transparent);
            --yt-live-chat-toast-background-color: var(--button-solid-color);
            --yt-live-chat-toast-action-color: var(--main-color);
            --yt-live-chat-toast-text-color: var(--main-text);
            --yt-live-chat-product-picker-hover-color: var(--button-hover-color);
            --yt-live-chat-sub-panel-background-color-transparent: var(--main-background);
            --yt-live-chat-action-panel-background-color: var(--main-background);
            --yt-live-chat-action-panel-background-color-transparent: var(--main-background);
            --yt-live-chat-dialog-background-color: var(--main-background);
            --yt-live-chat-author-chip-verified-background-color: var(--main-color);
            --yt-live-chat-author-chip-verified-text-color: var(--black, var(--white, var(--main-background)));
            --yt-live-chat-dialog-text-color: var(--main-text);
            --yt-live-chat-header-background-color: var(--main-background);
            --yt-live-chat-slider-active-color: var(--main-color);
            --yt-live-chat-slider-container-color: var(--button-hover-color);
            --yt-live-chat-sponsor-color: var(--green);
            --yt-live-chat-moderator-color: var(--main-color);
            --yt-live-chat-slider-markers-color: var(--main-text);
            --yt-live-chat-shimmer-linear-gradient: linear-gradient( 0deg, rgba(0, 0, 0, .1) 40%, var(--button-color), rgba(0, 0, 0, 0.1) 60%);
            --yt-live-chat-deleted-message-color: var(--secondary-text);
            --yt-live-chat-shimmer-background-color: rgba(0, 0, 0, 0.3);
            --yt-live-chat-overlay-color: rgba(0, 0, 0, 0.3);
            --yt-live-chat-button-dark-text-color: var(--main-text);
            --yt-live-chat-mode-change-background-color: var(--button-color);
            --yt-compact-link-icon-color: var(--main-text);
            --yt-deprecated-blue: var(--main-color);
            --paper-radio-button-checked-color: var(--main-color);
            --paper-radio-button-checked-ink-color: var(--main-color);
            --paper-radio-button-unchecked-color: var(--main-text);
            --paper-radio-button-unchecked-ink-color: var(--main-text);
            --paper-toggle-button-checked-bar-color: var(--main-color);
            --paper-toggle-button-unchecked-bar-color: var(--main-text);
            --paper-toggle-button-checked-button-color: var(--main-color);
            --paper-toggle-button-checked-ink-color: var(--main-color);
            --paper-toggle-button-unchecked-button-color: var(--main-text);
            --paper-toggle-button-unchecked-bar-opacity: 0.38;
            --paper-toggle-button-checked-bar-opacity: 0.38;
            --paper-checkbox-checked-color: var(--main-color);
            --paper-checkbox-checked-ink-color: var(--main-color);
            --paper-checkbox-unchecked-color: var(--main-text);
            --paper-checkbox-unchecked-ink-color: var(--main-text);
            --paper-tooltip-background: var(--main-color);
            --yt-spec-commerce-badge-background: var(--button-color);
            --yt-spec-commerce-tonal-hover: var(--button-hover-color);
            --yt-spec-brand-button-background: var(--red);
            --divider-color: var(--button-hover-color);
            --yt-spec-brand-link-text: var(--red);
            --yt-spec-static-grey: var(--sugg-action-inverse);
            --yt-deprecated-white-opacity-lighten-4: var(--button-color);
        }

        html[darker-dark-theme][dark] {
            background: var(--main-background) !important;
            --yt-spec-text-primary: var(--main-text);
            --yt-spec-text-primary-inverse: var(--black, var(--white, var(--main-background)));
        }

        html[system-icons][dark],
        html[system-icons] [dark] {
            --yt-spec-icon-disabled: var(--disabled-color);
            --yt-spec-brand-icon-inactive: var(--main-text);
            --yt-spec-icon-inactive: var(--main-text);
        }

        /* Text selection */
        html[dark] ::selection {
            color: var(--black, var(--white, var(--main-background))) !important;
            background: var(--main-color) !important;
        }

        /* Tooltip */
        html[dark] .tp-yt-paper-tooltip[style-target=tooltip] {
            color: var(--black, var(--white, var(--main-background)));
        }

        /* Flickering border fix */
        html[dark]:not(.style-scope) {
            --primary-text-color: transparent;
        }

        /* Input fields */
        html[dark] ::-webkit-input-placeholder {
            color: var(--secondary-text) !important;
        }

        html[dark] ytd-searchbox[has-focus] #container.ytd-searchbox {
            border: none;
            box-shadow: none;
        }

        html[dark] .focused-line.tp-yt-paper-input-container,
        html[dark] input:focus,
        html[dark] yt-clip-creation-scrubber-renderer[highlight-start] #start.yt-clip-creation-scrubber-renderer,
        html[dark] yt-clip-creation-scrubber-renderer[highlight-end] #end.yt-clip-creation-scrubber-renderer {
            border-color: var(--main-color);
        }

        html[dark] .unfocused-line.tp-yt-paper-input-container {
            border-color: var(--button-hover-color);
        }

        html[dark] #bar.yt-copy-link-renderer,
        html[dark] yt-copy-link-renderer[renderer-style=copy-link-renderer-style-settings] #bar.yt-copy-link-renderer {
            background: var(--button-color);
            border: none;
        }

        /* Dropdown menus */
        html[dark] ytd-dropdown-renderer {
            --paper-dropdown-menu-focus-color: var(--main-color);
        }

        /* Search suggestions box */
        html[dark] .sbsb_a {
            background: var(--button-solid-color);
        }

        html[dark] .gsfs,
        html[dark] .sbpqs_a b,
        html[dark] .sbpqs_a,
        html[dark] .sbfl_a:hover {
            color: var(--main-text);
        }

        html[dark] .sbsb_i {
            color: var(--main-color);
        }

        html[dark] .sbqs_c::before,
        html[dark] .sbpqs_a::before,
        ytd-masthead[dark] .gsst_e {
            filter: var(--filter);
        }

        html[dark] .sbpqs_a::before {
            background: no-repeat url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJibGFjayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNDc1IDE0LjEyNTNMOC4zMzMzIDExLjU1ODdWNS44MzM2Nkg5Ljk5OTk3VjEwLjYzMzdMMTMuMzU4MyAxMi43MDg3TDEyLjQ3NSAxNC4xMjUzWk0xOC4zMzMzIDEwLjAwMDNDMTguMzMzMyAxNC41OTIgMTQuNTkxNiAxOC4zMzM3IDkuOTk5OTcgMTguMzMzN0M1LjQwODMgMTguMzMzNyAxLjY2NjYzIDE0LjU5MiAxLjY2NjYzIDEwLjAwMDNIMi40OTk5N0MyLjQ5OTk3IDE0LjEzMzcgNS44NjY2MyAxNy41MDAzIDkuOTk5OTcgMTcuNTAwM0MxNC4xMzMzIDE3LjUwMDMgMTcuNSAxNC4xMzM3IDE3LjUgMTAuMDAwM0MxNy41IDUuODY2OTkgMTQuMTMzMyAyLjUwMDMzIDkuOTk5OTcgMi41MDAzM0M3LjM0MTYzIDIuNTAwMzMgNC45MzMzIDMuODY2OTkgMy41NjY2MyA2LjE1MDMzQzMuNDc0OTcgNi4zMDAzMyAzLjM4MzMgNi40NTg2NiAzLjMwODMgNi42MTY5OUMzLjI5OTk3IDYuNjMzNjYgMy4yOTE2MyA2LjY1MDMzIDMuMjgzMyA2LjY2Njk5SDYuNjY2NjNWNy41MDAzM0gxLjYzMzNWMi41MDAzM0gyLjQ2NjYzVjYuNDUwMzNDMi40OTk5NyA2LjM3NTMzIDIuNTI0OTcgNi4zMDg2NiAyLjU1ODMgNi4yNDE5OUMyLjY0OTk3IDYuMDU4NjYgMi43NDk5NyA1Ljg5MTk5IDIuODQ5OTcgNS43MTY5OUM0LjM0OTk3IDMuMjE2OTkgNy4wOTE2MyAxLjY2Njk5IDkuOTk5OTcgMS42NjY5OUMxNC41OTE2IDEuNjY2OTkgMTguMzMzMyA1LjQwODY2IDE4LjMzMzMgMTAuMDAwM1oiLz48L3N2Zz4=');
        }

        html[dark] .sbqs_c::before {
            background: no-repeat url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJibGFjayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcuMzkxNyAxNi44MDgzTDEyLjczMzMgMTIuMTVDMTMuNjI1IDExLjEyNSAxNC4xNjY3IDkuNzkxNjcgMTQuMTY2NyA4LjMzMzMzQzE0LjE2NjcgNS4xMDgzMyAxMS41NTgzIDIuNSA4LjMzMzMzIDIuNUM1LjEwODMzIDIuNSAyLjUgNS4xMDgzMyAyLjUgOC4zMzMzM0MyLjUgMTEuNTU4MyA1LjEwODMzIDE0LjE2NjcgOC4zMzMzMyAxNC4xNjY3QzkuNzkxNjcgMTQuMTY2NyAxMS4xMjUgMTMuNjI1IDEyLjE1IDEyLjc0MTdMMTYuODA4MyAxNy40TDE3LjM5MTcgMTYuODA4M1pNOC4zMzMzMyAxMy4zMzMzQzUuNTc1IDEzLjMzMzMgMy4zMzMzMyAxMS4wOTE3IDMuMzMzMzMgOC4zMzMzM0MzLjMzMzMzIDUuNTc1IDUuNTc1IDMuMzMzMzMgOC4zMzMzMyAzLjMzMzMzQzExLjA5MTcgMy4zMzMzMyAxMy4zMzMzIDUuNTc1IDEzLjMzMzMgOC4zMzMzM0MxMy4zMzMzIDExLjA5MTcgMTEuMDkxNyAxMy4zMzMzIDguMzMzMzMgMTMuMzMzM1oiLz48L3N2Zz4=');
        }

        html[dark] .sbfl_b {
            background: none;
        }

        html[dark] .sbpqs_c {
            color: var(--secondary-text);
        }

        /* Regular/Shorts player */
        html[dark] .ytp-play-progress,
        html[dark] .ytp-swatch-background-color:not(.ytp-play-progress),
        html[dark] #progress.ytd-thumbnail-overlay-resume-playback-renderer,
        html[dark] .ytp-chrome-controls .ytp-button[aria-pressed]:after,
        html[dark] .ytp-slider-handle,
        html[dark] .ytp-slider-handle:before,
        html[dark] .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox:after,
        html[dark] .ytp-volume-slider-handle:before,
        html[dark] .ytp-volume-slider-handle {
            background: var(--main-color);
        }

        html[dark] .ytp-slider-handle:after {
            background: var(--button-hover-color);
            z-index: -1;
        }

        html[dark] .ytp-volume-slider-handle:after {
            z-index: -1;
        }

        ytd-reel-player-header-renderer,
        yt-icon.ytd-shorts-player-controls,
        ytd-video-meta-block[is-slim-short] #metadata-line.ytd-video-meta-block {
            color: #fff;
        }

        html[dark] .ytp-probably-keyboard-focus .ytp-menuitem:focus,
        html[dark] .ytp-probably-keyboard-focus .ytp-button:focus,
        html[dark] .ytp-probably-keyboard-focus .ytp-volume-panel:focus,
        html[dark] .ytp-probably-keyboard-focus .ytp-panel-footer-content-link:focus,
        html[dark] .ytp-probably-keyboard-focus .ytp-slider-section:focus {
            box-shadow: inset 0 0 0 2px currentcolor;
        }

        html[dark] .ytp-probably-keyboard-focus .ytp-panel-back-button:focus {
            box-shadow: inset 0 0 0 2px black;
        }

        html[dark] .ytp-probably-keyboard-focus .ytp-menuitem:focus .ytp-menuitem-label,
        html[dark] .ytp-probably-keyboard-focus .ytp-menuitem:focus .ytp-menuitem-content {
            box-shadow: none;
        }

        html[dark] .ytp-probably-keyboard-focus .ytp-progress-bar:focus {
            box-shadow: 0 0 0 2px var(--main-color);
        }

        html[dark] .html5-video-player .ytp-panel-footer-content-link {
            color: var(--main-color);
        }

        html[dark] .ytp-popup {
            background: var(--button-solid-color);
        }

        html[dark] .ytp-panel-menu,
        html[dark] .ytp-panel-header,
        html[dark] .ytp-quality-menu .ytp-menuitem-label supm,
        html[dark] .ytp-panel-footer,
        html[dark] .html5-video-player .ytp-popup {
            color: var(--main-text);
        }

        html[dark] .ytp-menuitem-label-count,
        html[dark] .ytp-menu-label-secondary,
        html[dark] .ytp-swatch-color-white,
        html[dark] .ytp-premium-label {
            color: var(--secondary-text);
        }

        html[dark] .ytp-menuitem-icon [fill="white"],
        html[dark] .ytp-menuitem-icon [fill*="fff"] {
            fill: var(--main-text);
        }

        html[dark] .ytp-menuitem[aria-haspopup=true] .ytp-menuitem-content {
            background-image: var(--arrow);
        }

        html[dark] .ytp-menuitem[role=menuitemradio][aria-checked=true] .ytp-menuitem-label,
        html[dark] .ytp-contextmenu .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
            background-image: var(--check-mark);
        }

        html[dark] .ytp-panel-back-button {
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNIDE5LjQxLDIwLjA5IDE0LjgzLDE1LjUgMTkuNDEsMTAuOTEgMTgsOS41IGwgLTYsNiA2LDYgeiIgZmlsbD0iYmxhY2siIC8+PC9zdmc+');
            filter: var(--filter);
        }

        html[dark] .ytp-popup {
            text-shadow: none;
        }

        html[dark] .ytp-panel-header,
        html[dark] .ytp-panel-footer {
            border-color: var(--button-hover-color);
        }

        html[dark] .ytp-menuitem:not([aria-disabled=true]):hover {
            background: var(--button-hover-color);
        }

        html[dark] .ytp-tooltip-text:not(.ytp-preview:not(.ytp-text-detail) .ytp-tooltip-text) {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .iv-branding .branding-context-container-inner {
            background: var(--main-background);
            color: var(--main-text);
        }

        html[dark] .ytp-tooltip.ytp-preview:not(.ytp-tooltip.ytp-preview:not(.ytp-text-detail)) {
            background: var(--main-color);
        }

        html[dark] .ytp-tooltip.ytp-text-detail .ytp-tooltip-title {
            color: var(--black, var(--white, var(--main-background)));
            opacity: 0.7;
        }

        html[dark] .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox:not(.ytp-panel-menu):not(.ytp-contextmenu .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox) {
            background: var(--main-color-38);
        }

        html[dark] .ytp-menuitem-toggle-checkbox:after {
            background: var(--main-text);
        }

        html[dark] .ytp-menuitem-toggle-checkbox {
            background: var(--disabled-color);
        }

        html[dark] .html5-video-player:not(.ytp-touch-mode) ::-webkit-scrollbar-track,
        html[dark] .html5-video-player:not(.ytp-touch-mode) ::-webkit-scrollbar {
            background: none;
        }

        html[dark] .html5-video-player:not(.ytp-touch-mode) ::-webkit-scrollbar-thumb {
            background: var(--secondary-text);
            border: 1px solid var(--button-solid-color);
        }

        html[dark] .html5-video-player:not(.ytp-touch-mode) ::-webkit-scrollbar-thumb:hover {
            background: var(--disabled-color);
        }

        /* Ambient mode */
        #cinematics.ytd-watch-flexy {
            display: none;
        }

        /* Buttons */
        html[dark] ytd-guide-entry-renderer[active],
        html[dark] .ytd-mini-guide-renderer[is-active],
        html[dark] ytd-compact-link-renderer[compact-link-style=compact-link-style-type-settings-sidebar][active],
        html[dark] ytd-compact-link-renderer[compact-link-style=compact-link-style-type-settings-sidebar][active]:hover {
            background: var(--main-color);
        }

        html[dark] ytd-mini-guide-entry-renderer[aria-selected="false"]:not(:hover) {
            background: none;
        }

        html[dark] a.ytd-mini-guide-entry-renderer {
            padding: 14px 0 14px;
        }

        html[dark] ytd-guide-entry-renderer[active] .title.ytd-guide-entry-renderer,
        html[dark] [system-icons][is-active] .title.ytd-mini-guide-entry-renderer,
        html[dark] ytd-compact-link-renderer[compact-link-style=compact-link-style-type-settings-sidebar][active] [id="label"] {
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled,
        html[dark] .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--filled,
        html[dark] .yt-spec-button-shape-next--call-to-action.yt-spec-button-shape-next--filled {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled:hover,
        html[dark] .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--filled:hover,
        html[dark] .yt-spec-button-shape-next--call-to-action.yt-spec-button-shape-next--filled:hover {
            background: var(--filled-button-hover-color);
        }

        html[dark] #search-clear-button .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--text {
            background: none;
            --yt-spec-touch-response: none;
        }

        html[dark] yt-chip-cloud-chip-renderer[chip-style=STYLE_DEFAULT][selected],
        html[dark] yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER][selected] {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] yt-icon-button.yt-live-chat-item-list-renderer,
        html[dark] yt-icon-button.yt-live-chat-item-list-renderer[disabled],
        html[dark] yt-icon.yt-live-chat-ticker-renderer {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
            --yt-spec-touch-response: currentcolor;
        }

        html[dark] .arrow.ytd-horizontal-card-list-renderer,
        html[dark] .arrow.yt-horizontal-list-renderer,
        html[dark] .arrow-container.ytd-video-description-music-section-renderer,
        html[dark] .arrow.ytd-post-multi-image-renderer,
        html[dark] .arrow.ytd-merch-shelf-renderer,
        html[dark] .ytd-horizontal-card-list-renderer[arrow],
        html[dark] .scroll-button {
            background: var(--button-solid-color);
            box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3), 0 0 4px rgba(0, 0, 0, 0.2);
        }

        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(2) > path:nth-child(1),
        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(4) > path:nth-child(1) {
            stroke: var(--main-text);
        }

        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(1) > path:nth-child(1),
        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(3) > path:nth-child(1) {
            fill: var(--main-text);
        }

        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(1) > path:nth-child(2),
        html[dark] yt-animated-icon[animated-icon-type="LIKE"] > ytd-lottie-player > lottie-component > svg > g:nth-child(2) > g:nth-child(2) > g:nth-child(3) > path:nth-child(2) {
            stroke: var(--main-text);
        }

        html[dark] tp-yt-paper-tabs {
            --paper-tabs-selection-bar-color: var(--main-color);
        }

        html[dark] tp-yt-paper-tab.iron-selected {
            color: var(--main-color);
        }

        html[dark] yt-button-shape {
            --yt-spec-touch-response: currentcolor;
        }

        html[dark] ytd-guide-entry-renderer[active],
        html[dark] .ytd-mini-guide-renderer[aria-selected="true"],
        html[dark] ytd-compact-link-renderer[compact-link-style=compact-link-style-type-settings-sidebar][active] tp-yt-paper-item.ytd-compact-link-renderer {
            --yt-spec-touch-response: var(--black, var(--white, var(--main-background)));
            --paper-item-focused-before-background: var(--black, var(--white, var(--main-background)));
        }

        html[dark] tp-yt-paper-item[disabled],
        html[dark] .tp-yt-paper-item.tp-yt-paper-item[disabled] {
            --paper-item-focused-before-background: var(--disabled-color);
        }

        html[dark] .html5-ypc-purchase {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .html5-ypc-purchase:hover {
            background: var(--filled-button-hover-color);
        }

        html[dark] button.ytp-subtitles-button.ytp-button::after {
            background: var(--main-color) !important;
        }

        html[dark] #voice-search-button .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text {
            color: var(--main-text);
        }

        html[dark] yt-notification-action-renderer[ui-refresh] yt-icon-button.yt-notification-action-renderer,
        html[dark] .yt-spec-button-shape-next--mono-inverse.yt-spec-button-shape-next--text {
            color: currentcolor;
            --yt-spec-touch-response: currentcolor;
        }

        html[dark] .yt-spec-button-shape-next--mono-inverse.yt-spec-button-shape-next--text:hover {
            background: var(--sugg-action-inverse);
        }

        html[dark] #voice-search-button .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text:hover {
            background: var(--button-hover-color);
            --yt-spec-static-overlay-touch-response: var(--main-text);
        }

        html[dark] yt-live-chat-membership-item-renderer {
            --yt-live-chat-footer-button-text-color: var(--black, var(--white, var(--main-background)));
            --yt-live-chat-footer-button-text-background-color: var(--main-color);
        }

        html[dark] #icon.ytd-pivot-button-renderer {
            border-color: var(--main-color);
        }

        html[dark] .ytp-flyout-cta .ytp-flyout-cta-action-button.ytp-flyout-cta-action-button-rounded {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background))) !important;
        }

        html[dark] ytd-pivot-button-renderer[background-color=THEME_ATTRIBUTE_OVERLAY_BACKGROUND_MEDIUM] #icon.ytd-pivot-button-renderer {
            background: none;
        }

        html[dark] yt-live-chat-toast-renderer .yt-spec-button-shape-next--call-to-action-inverse.yt-spec-button-shape-next--text {
            color: var(--main-color);
        }

        html[dark] yt-live-chat-toast-renderer .yt-spec-button-shape-next--call-to-action-inverse.yt-spec-button-shape-next--text:hover {
            background: var(--sugg-action);
        }

        /* Live chat dialogs */
        html[dark] #live-chat-dialog-body .bold.yt-formatted-string:not(a) {
            color: var(--main-text) !important;
        }

        /* Scrollbars */
        html[dark] [class*="yt-live-chat"]::-webkit-scrollbar-thumb,
        html[dark] #categories.yt-emoji-picker-renderer::-webkit-scrollbar-thumb {
            background: var(--secondary-text) !important;
        }

        html[dark] [class*="yt-live-chat"]::-webkit-scrollbar-thumb:hover,
        html[dark] #categories.yt-emoji-picker-renderer::-webkit-scrollbar-thumb:hover {
            background: var(--disabled-color) !important;
        }

        /* Hyperlinks */
        html[dark] .yt-core-attributed-string--link-inherit-color[style*="rgb(62"],
        html[dark] .yt-formatted-string[style*="rgb(62"],
        html[dark] .yt-channel-external-link-view-model-wiz__link {
            color: var(--main-color) !important;
        }

        html[dark] .yt-core-attributed-string--highlight-text-decorator {
            color: var(--main-text) !important;
            background: var(--button-color) !important;
        }

        html[dark] [src="https://www.gstatic.com/youtube/img/watch/yt_favicon.png"] {
            content: url(https://imgur.com/Vw5TCSc.png);
            filter: var(--filter);
        }

        /* Badges/icons */
        html[dark] .badge-style-type-live-now-alternate.ytd-badge-supported-renderer span.ytd-badge-supported-renderer,
        html[dark] .badge-style-type-live-now-alternate.ytd-badge-supported-renderer yt-icon.ytd-badge-supported-renderer,
        html[dark] ytd-thumbnail-overlay-time-status-renderer[overlay-style=LIVE] #time-status.ytd-thumbnail-overlay-time-status-renderer {
            color: var(--white, var(--white-2, var(--black, var(--main-background))));
        }

        html[dark] .yt-spec-icon-badge-shape--type-notification .yt-spec-icon-badge-shape__badge,
        html[dark] .ytp-videowall-still-info-live,
        html[dark] .ytp-live-badge[disabled]:before {
            background: var(--red);
            color: var(--white, var(--white-2, var(--main-background)));
            border: none;
        }

        html[dark] .guide-entry-badge.ytd-guide-entry-renderer {
            color: var(--red);
        }

        html[dark] ytd-guide-entry-renderer[active] .guide-entry-badge {
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .yt-spec-icon-badge-shape,
        html[dark] .yt-spec-profile-page-header-information-view-model-shape__profile-page-header-title,
        html[dark] .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon {
            color: var(--main-text);
        }

        html[dark] ytd-author-comment-badge-renderer[creator] {
            --ytd-author-comment-badge-background-color: var(--main-color) !important;
            --ytd-author-comment-badge-name-color: var(--black, var(--white, var(--main-background))) !important;
            --ytd-author-comment-badge-icon-color: var(--black, var(--white, var(--main-background))) !important;
        }

        html[dark] .ytp-settings-button.ytp-hd-quality-badge:after,
        html[dark] .ytp-settings-button.ytp-hdr-quality-badge:after,
        html[dark] .ytp-settings-button.ytp-4k-quality-badge:after,
        html[dark] .ytp-settings-button.ytp-5k-quality-badge:after,
        html[dark] .ytp-settings-button.ytp-8k-quality-badge:after,
        html[dark] .ytp-settings-button.ytp-3d-badge-grey:after,
        html[dark] .ytp-settings-button.ytp-3d-badge:after {
            background-color: var(--main-color-inverted, var(--main-color));
            filter: var(--invert-filter);
        }

        html[dark] #hearted.ytd-creator-heart-renderer {
            color: var(--red);
        }

        html[dark] ytd-topbar-logo-renderer [fill="#FF0000"],
        html[dark] ytd-guide-entry-renderer [fill*="F00"],
        html[dark] ytd-guide-entry-renderer [fill="red"],
        html[dark] ytd-offline-promo-renderer [fill*="F00"],
        html[dark] [class*="shelf-renderer"] [fill="red"],
        html[dark] #icon.yt-live-chat-viewer-engagement-message-renderer [fill*="F00"],
        html[dark] .ytp-cued-thumbnail-overlay:hover .ytp-large-play-button-bg,
        html[dark] ytd-guide-entry-renderer[active] [fill="#FAFAFA"],
        html[dark] ytd-thumbnail-overlay-downloading-renderer [fill="var(--yt-spec-static-brand-white)"],
        html[dark] ytd-compact-link-renderer [fill="#CC0000"],
        html[dark] ytd-member-hub-profile-renderer [fill="#CC0000"],
        html[dark] ytd-badge-supported-renderer [fill="#CC0000"],
        html[dark] ytd-consent-bump-v2-lightbox [fill="#FF0000"] {
            fill: var(--main-color);
        }

        html[dark] ytd-topbar-logo-renderer [fill="white"],
        html[dark] ytd-guide-entry-renderer [fill="#FAFAFA"],
        html[dark] ytd-guide-entry-renderer [fill*="#fff"],
        html[dark] ytd-guide-entry-renderer [fill*="#FFF"]:not([d*="M10"]),
        html[dark] ytd-guide-entry-renderer[active] [fill*="F00"],
        html[dark] ytd-offline-promo-renderer [fill="white"],
        html[dark] [class*="shelf-renderer"] [fill*="#fff"],
        html[dark] #icon.yt-live-chat-viewer-engagement-message-renderer [fill="#FAFAFA"],
        html[dark] .ytp-cued-thumbnail-overlay:hover [d*="M 45"],
        html[dark] ytd-compact-link-renderer [fill="#FFF"],
        html[dark] ytd-member-hub-profile-renderer [fill="#FFF"],
        html[dark] ytd-badge-supported-renderer [fill="#FFF"],
        html[dark] ytd-consent-bump-v2-lightbox [fill="white"] {
            fill: var(--black, var(--white, var(--main-background)));
        }

        /* Empty channel ilustration */
        [src="https://www.gstatic.com/youtube/img/channels/empty_channel_dark_illustration.svg"] {
            content: url('https://www.gstatic.com/youtube/img/channels/mobile/create_a_video_promo/dark_200x200.png');
        }

        /* Pop-up notification */
        html[dark] yt-notification-action-renderer[ui-refresh] tp-yt-paper-toast.yt-notification-action-renderer {
            background: var(--main-color);
        }

        html[dark] yt-notification-action-renderer[ui-refresh] #text.yt-notification-action-renderer,
        html[dark] yt-notification-action-renderer[ui-refresh] #sub-text.yt-notification-action-renderer {
            color: var(--black, var(--white, var(--main-background)));
        }

        /* Skeletons */
        html[dark] .watch-skeleton .skeleton-bg-color,
        html[dark] #home-page-skeleton .skeleton-bg-color,
        html[dark] .masthead-skeleton-icon {
            background: var(--button-color);
        }

        html[dark] #home-container-skeleton,
        html[dark] #home-page-skeleton #guide-skeleton,
        html[dark] #home-chips {
            background: var(--main-backgrond);
            border-color: var(--button-color);
        }

        html[dark] .watch-skeleton .skeleton-light-border-bottom {
            border-color: var(--button-color);
        }

        /* Clip creation scrubber view */
        html[dark] .handle-grip.yt-clip-creation-scrubber-view {
            background: var(--black, var(--white, var(--main-background)));
        }

        /* Emoji picker */
        html[dark] #emojis.ytd-commentbox {
            --yt-emoji-picker-category-background-color: var(--raised-background);
        }

        html[dark] yt-emoji-picker-category-button-renderer[active] {
            color: var(--main-color);
        }

        /* Cards */
        html[dark] .ytp-ce-expanding-overlay-background,
        html[dark] .yt-ui-ellipsis {
            background: var(--main-background);
        }

        html[dark] .ytp-ce-channel-this .ytp-ce-channel-metadata {
            border-top: 1px solid var(--button-hover-color);
            color: var(--secondary-text);
        }

        html[dark] .ytp-sb-subscribe,
        html[dark] a.ytp-sb-subscribe {
            background: var(--main-color);
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .ytp-sb-unsubscribe {
            background: var(--button-color);
            color: var(--main-text);
        }

        html[dark] a.ytp-ce-link,
        html[dark] a.ytp-ce-link:hover,
        html[dark] a.ytp-ce-link:visited {
            color: var(--main-color) !important;
        }

        html[dark] .ytp-ce-element.ytp-ce-force-expand,
        html[dark] .ytp-ce-element.ytp-ce-element-hover {
            border: 1px solid var(--main-color);
        }

        html[dark] .ytp-ce-website-metadata,
        html[dark] .ytp-ce-merchandise-metadata,
        html[dark] .ytp-ce-merchandise-price-container,
        html[dark] .ytp-ce-channel-subscribers-text,
        html[dark] .ytp-ce-channel-metadata {
            color: var(--secondary-text);
        }

        html[dark] .ytp-ce-website-title,
        html[dark] .ytp-ce-merchandise-title {
            color: var(--main-text);
        }

        html[dark] .ytp-exp-ppp-update .ytp-paid-content-overlay-link,
        html[dark] #avatar.ytd-watch-card-rich-header-renderer {
            border-color: var(--main-color);
        }

        /* Autoplay screen */
        html[dark] .ytp-autonav-thumbnail-small:hover,
        html[dark] .ytp-autonav-endscreen-upnext-thumbnail:hover {
            border-color: var(--main-color);
        }

        /* Thanks slider container */
        ytd-pdg-color-slider-renderer[is-dark-theme] tp-yt-paper-slider.ytd-pdg-color-slider-renderer {
            --paper-slider-container-color: var(--button-color);
        }

        /* Search filters */
        html[dark] ytd-search-filter-renderer.selected yt-formatted-string.ytd-search-filter-renderer {
            color: var(--main-color);
        }

        /* Progress bar */
        html[dark] #progress.ytd-flow-step-renderer {
            background: var(--main-color);
        }

        /* Banners */
        ytd-statement-banner-renderer[is-dark-theme] [style*="background-color:rgba(15"] {
            background: none !important;
        }

        html[dark] ytd-network-status-banner[current-state=OFFLINE] {
            color: var(--main-text);
            background: var(--raised-background);
        }

        html[dark] ytd-network-status-banner[current-state=BACK_ONLINE] {
            color: var(--black, var(--white, var(--main-background)));
        }

        html[dark] .ytp-flyout-cta .ytp-flyout-cta-body,
        html[dark] .ytp-flyout-cta:hover .ytp-flyout-cta-body {
            background: var(--main-background);
        }

        html[dark] .ytp-flyout-cta .ytp-flyout-cta-headline-container {
            color: var(--main-text);
        }

        html[dark] .ytp-flyout-cta .ytp-flyout-cta-description-container {
            color: var(--secondary-text);
        }

        /* Text */
        html[dark] #title-container.ytd-brand-video-shelf-renderer,
        html[dark] #subtitle-container.ytd-brand-video-shelf-renderer,
        html[dark] .yt-core-attributed-string--link-inherit-color[style*="rgb(255"],
        html[dark] .ytd-menu-title-renderer {
            color: var(--main-text) !important;
        }

        /* Masthead */
        ytd-masthead.shell.dark,
        html[dark] ytd-masthead.shell.theater {
            background: var(--main-background) !important;
        }`,

        `:root {
            --main-color: #bf77f6;
            --main-color-38: rgba(191, 119, 246, 0.38);
            --main-text: #d8c4f1;
            --secondary-text: #9a8aab;
            --sugg-action: #45315c;
            --sugg-action-inverse: rgba(28, 25, 41, 0.2);
            --main-background: #1c1929;
            --raised-background: #241f35;
            --disabled-color: rgba(216, 196, 241, 0.38);
            --button-color: rgba(172, 158, 230, 0.1);
            --button-hover-color: rgba(172, 158, 230, 0.2);
            --button-solid-color: #2b263c;
            --filled-button-hover-color: #9f64cd;
            --red: #f57676;
            --green: #76f576;
            --filter: invert(81%) sepia(15%) saturate(488%) hue-rotate(222deg) brightness(97%) contrast(94%);
            --main-color-inverted: #408809;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Q4YzRmMSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZDhjNGYxIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #96cdfb;
            --main-color-38: rgba(150, 205, 251, 0.38);
            --main-text: #e0e0e0;
            --secondary-text: #999999;
            --sugg-action: #344754;
            --sugg-action-inverse: rgba(19, 26, 28, 0.2);
            --main-background: #131a1c;
            --raised-background: #1c2629;
            --disabled-color: rgba(224, 224, 224, 0.38);
            --button-color: rgba(174, 218, 230, 0.1);
            --button-hover-color: rgba(174, 218, 230, 0.2);
            --button-solid-color: #232d30;
            --filled-button-hover-color: #7ca9cf;
            --red: #fb9696;
            --green: #96fa96;
            --filter: invert(99%) sepia(3%) saturate(1187%) hue-rotate(202deg) brightness(108%) contrast(76%);
            --main-color-inverted: #693204;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2UwZTBlMCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTBlMGUwIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #8ec07c;
            --main-color-38: rgba(142, 192, 124, 0.38);
            --main-text: #ebdbb2;
            --secondary-text: #a89984;
            --sugg-action: #424e3d;
            --sugg-action-inverse: rgba(40, 40, 40, 0.2);
            --main-background: #282828;
            --raised-background: #35312f;
            --disabled-color: rgba(235, 219, 178, 0.38);
            --button-color: rgba(194, 165, 150, 0.13);
            --button-hover-color: rgba(194, 165, 150, 0.26);
            --button-solid-color: #3c3836;
            --filled-button-hover-color: #7aa26b;
            --red: #fb4934;
            --green: #8ec07c;
            --filter: invert(85%) sepia(40%) saturate(189%) hue-rotate(4deg) brightness(98%) contrast(91%);
            --main-color-inverted: #713f83;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2ViZGJiMiIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZWJkYmIyIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #00f29b;
            --main-color-38: rgba(0, 242, 155, 0.38);
            --main-text: #e0e0e0;
            --secondary-text: #999999;
            --sugg-action: #13523e;
            --sugg-action-inverse: rgba(26, 28, 31, 0.2);
            --main-background: #1a1c1f;
            --raised-background: #25282c;
            --disabled-color: rgba(224, 224, 224, 0.38);
            --button-color: rgba(202, 213, 230, 0.1);
            --button-hover-color: rgba(202, 213, 230, 0.2);
            --button-solid-color: #2c2f33;
            --filled-button-hover-color: #05c882;
            --red: #ff263c;
            --green: #00f29b;
            --red-2: var(--red);
            --filter: invert(99%) sepia(3%) saturate(1187%) hue-rotate(202deg) brightness(108%) contrast(76%);
            --main-color-inverted: #ff0d64;
            --invert-filter: invert(100%);
            --white-2: #ffff;
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2UwZTBlMCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTBlMGUwIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #e95420;
            --main-color-38: rgba(233, 84, 32, 0.38);
            --main-text: #f7f7f7;
            --secondary-text: #b0b0b0;
            --sugg-action: #5b3629;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #2c2c2c;
            --raised-background: #383838;
            --disabled-color: rgba(247, 247, 247, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #3f3f3f;
            --filled-button-hover-color: #ed764d;
            --red: #c7162b;
            --green: #16c731;
            --filter: invert(100%) sepia(0%) saturate(7474%) hue-rotate(226deg) brightness(108%) contrast(94%);
            --white: #fff;
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Y3ZjdmNyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZjdmN2Y3IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #fb8441;
            --main-color-38: rgba(251, 132, 65, 0.38);
            --main-text: #D3DAE3;
            --secondary-text: #91959c;
            --sugg-action: #583b31;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #282a33;
            --raised-background: #30333e;
            --disabled-color: rgba(211, 218, 227, 0.38);
            --button-color: rgba(188, 195, 230, 0.1);
            --button-hover-color: rgba(188, 195, 230, 0.2);
            --button-solid-color: #373a45;
            --filled-button-hover-color: #fc9d67;
            --red: #fc4138;
            --green: #73d216;
            --white: #fff;
            --filter: invert(94%) sepia(6%) saturate(493%) hue-rotate(183deg) brightness(94%) contrast(90%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI0QzREFFMyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjRDNEQUUzIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #ff8a65;
            --main-color-38: rgba(255, 138, 101, 0.38);
            --main-text: #f8f0d3;
            --secondary-text: #b8aeae;
            --sugg-action: #51342b;
            --sugg-action-inverse: rgba(23, 23, 23, 0.2);
            --main-background: #171717;
            --raised-background: #252323;
            --disabled-color: rgba(224, 224, 224, 0.38);
            --button-color: rgba(215, 201, 201, 0.11);
            --button-hover-color: rgba(215, 201, 201, 0.22);
            --button-solid-color: #2c2a2a;
            --filled-button-hover-color: #d17356;
            --red: #ff6666;
            --green: #66ff66;
            --filter: invert(86%) sepia(38%) saturate(125%) hue-rotate(4deg) brightness(104%) contrast(95%);
            --main-color-inverted: #00759a;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Y4ZjBkMyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZjhmMGQzIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #89b4fa;
            --main-color-38: rgba(137, 180, 250, 0.38);
            --main-text: #cdd6f4;
            --secondary-text: #9299ad;
            --sugg-action: #394461;
            --sugg-action-inverse: rgba(30, 30, 46, 0.2);
            --main-background: #1e1e2e;
            --raised-background: #252539;
            --disabled-color: rgba(205, 214, 244, 0.38);
            --button-color: rgba(163, 163, 230, 0.1);
            --button-hover-color: rgba(163, 163, 230, 0.2);
            --button-solid-color: #2c2c40;
            --filled-button-hover-color: #7496d1;
            --red: #f38ba8;
            --green: #a6e3a1;
            --filter: invert(88%) sepia(3%) saturate(2063%) hue-rotate(192deg) brightness(94%) contrast(104%);
            --main-color-inverted: #764b05;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2NkZDZmNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjY2RkNmY0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #8aadf4;
            --main-color-38: rgba(138, 173, 244, 0.38);
            --main-text: #cad3f5;
            --secondary-text: #9299ad;
            --sugg-action: #41516a;
            --sugg-action-inverse: rgba(36, 39, 58, 0.2);
            --main-background: #24273a;
            --raised-background: #292d44;
            --disabled-color: rgba(202, 211, 245, 0.38);
            --button-color: rgba(156, 165, 230, 0.1);
            --button-hover-color: rgba(156, 165, 230, 0.2);
            --button-solid-color: #30344b;
            --filled-button-hover-color: #7592cf;
            --red: #ed8796;
            --green: #a6da95;
            --filter: invert(81%) sepia(28%) saturate(232%) hue-rotate(191deg) brightness(97%) contrast(97%);
            --main-color-inverted: #75520b;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2NhZDNmNSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjY2FkM2Y1IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #8caaee;
            --main-color-38: rgba(140, 170, 238, 0.38);
            --main-text: #c6d0f5;
            --secondary-text: #9299ad;
            --sugg-action: #4a5a73;
            --sugg-action-inverse: rgba(48, 52, 70, 0.2);
            --main-background: #303446;
            --raised-background: #353a4f;
            --disabled-color: rgba(198, 208, 245, 0.38);
            --button-color: rgba(165, 179, 230, 0.1);
            --button-hover-color: rgba(165, 179, 230, 0.2);
            --button-solid-color: #3c4156;
            --filled-button-hover-color: #7a92cc;
            --red: #e78284;
            --green: #a6d189;
            --filter: invert(84%) sepia(6%) saturate(1227%) hue-rotate(192deg) brightness(98%) contrast(96%);
            --main-color-inverted: #735511;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2M2ZDBmNSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjYzZkMGY1IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #ebbcba;
            --main-color-38: rgba(235, 188, 186, 0.38);
            --main-text: #e0def4;
            --secondary-text: #a09ead;
            --sugg-action: #4e404a;
            --sugg-action-inverse: rgba(25, 23, 36, 0.2);
            --main-background: #191724;
            --raised-background: #211f30;
            --disabled-color: rgba(224, 222, 244, 0.38);
            --button-color: rgba(174, 165, 230, 0.1);
            --button-hover-color: rgba(174, 165, 230, 0.2);
            --button-solid-color: #282637;
            --filled-button-hover-color: #c19b9c;
            --red: #eb6f92;
            --green: #9ccfd8;
            --filter: invert(80%) sepia(5%) saturate(817%) hue-rotate(205deg) brightness(114%) contrast(91%);
            --main-color-inverted: #144345;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2UwZGVmNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTBkZWY0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #ebbcba;
            --main-color-38: rgba(235, 188, 186, 0.38);
            --main-text: #e0def4;
            --secondary-text: #a09ead;
            --sugg-action: #554856;
            --sugg-action-inverse: rgba(35, 33, 53, 0.2);
            --main-background: #232135;
            --raised-background: #292740;
            --disabled-color: rgba(224, 222, 244, 0.38);
            --button-color: rgba(163, 156, 230, 0.1);
            --button-hover-color: rgba(163, 156, 230, 0.2);
            --button-solid-color: #302e47;
            --filled-button-hover-color: #c39da0;
            --red: #eb6f92;
            --green: #9ccfd8;
            --filter: invert(80%) sepia(5%) saturate(817%) hue-rotate(205deg) brightness(114%) contrast(91%);
            --main-color-inverted: #144345;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2UwZGVmNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTBkZWY0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #a7c080;
            --main-color-38: rgba(167, 192, 128, 0.38);
            --main-text: #d3c6aa;
            --secondary-text: #8c8472;
            --sugg-action: #4c584c;
            --sugg-action-inverse: rgba(43, 51, 57, 0.2);
            --main-background: #2d353b;
            --raised-background: #343e45;
            --disabled-color: rgba(211, 198, 170, 0.38);
            --button-color: rgba(184, 209, 230, 0.1);
            --button-hover-color: rgba(184, 209, 230, 0.2);
            --button-solid-color: #3b454c;
            --filled-button-hover-color: #8fa471;
            --red: #e67e80;
            --green: #a7c080;
            --filter: invert(92%) sepia(18%) saturate(409%) hue-rotate(347deg) brightness(89%) contrast(84%);
            --main-color-inverted: #583f7f;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2QzYzZhYSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZDNjNmFhIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #e6c384;
            --main-color-38: rgba(230, 195, 132, 0.38);
            --main-text: #dcd7ba;
            --secondary-text: #94917e;
            --sugg-action: #51483f;
            --sugg-action-inverse: rgba(31, 31, 40, 0.2);
            --main-background: #1f1f28;
            --raised-background: #2b2a30;
            --disabled-color: rgba(220, 215, 186, 0.38);
            --button-color: rgba(181, 170, 157, 0.13);
            --button-hover-color: rgba(181, 170, 157, 0.26);
            --button-solid-color: #323137;
            --filled-button-hover-color: #bea272;
            --red: #c34043;
            --green: #76946a;
            --filter: invert(81%) sepia(17%) saturate(288%) hue-rotate(14deg) brightness(106%) contrast(88%);
            --main-color-inverted: #193c7b;
            --invert-filter: invert(100%);
            --white-2: #fff;
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2RjZDdiYSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZGNkN2JhIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #88c0d0;
            --main-color-38: rgba(136, 192, 208, 0.38);
            --main-text: #eceff4;
            --secondary-text: #a8aaad;
            --sugg-action: #455764;
            --sugg-action-inverse: rgba(46, 52, 64, 0.2);
            --main-background: #2e3440;
            --raised-background: #343c49;
            --disabled-color: rgba(236, 239, 244, 0.38);
            --button-color: rgba(174, 193, 230, 0.1);
            --button-hover-color: rgba(174, 193, 230, 0.2);
            --button-solid-color: #3b4350;
            --filled-button-hover-color: #76a4b3;
            --red: #bf616a;
            --green: #a3be8c;
            --filter: invert(93%) sepia(8%) saturate(111%) hue-rotate(179deg) brightness(103%) contrast(93%);
            --main-color-inverted: #773f2f;
            --invert-filter: invert(100%);
            --white-2: #fff;
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2VjZWZmNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZWNlZmY0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #f88379;
            --main-color-38: rgba(248, 131, 121, 0.38);
            --main-text: #d7d7d7;
            --secondary-text: #8f8f8f;
            --sugg-action: #4c363b;
            --sugg-action-inverse: rgba(19, 28, 38, 0.2);
            --main-background: #131c26;
            --raised-background: #182432;
            --disabled-color: rgba(215, 215, 215, 0.38);
            --button-color: rgba(138, 181, 230, 0.1);
            --button-hover-color: rgba(138, 181, 230, 0.2);
            --button-solid-color: #1f2b39;
            --filled-button-hover-color: #ca6f69;
            --red: #f88379;
            --green: #79f788;
            --filter: invert(100%) sepia(1%) saturate(5386%) hue-rotate(240deg) brightness(118%) contrast(69%);
            --main-color-inverted: #077c86;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Q3ZDdkNyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZDdkN2Q3IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #d98ba1;
            --main-color-38: rgba(217, 139, 161, 0.38);
            --main-text: #d7d7d7;
            --secondary-text: #8f8f8f;
            --sugg-action: #453845;
            --sugg-action-inverse: rgba(19, 28, 38, 0.2);
            --main-background: #131c26;
            --raised-background: #182432;
            --disabled-color: rgba(215, 215, 215, 0.38);
            --button-color: rgba(138, 181, 230, 0.1);
            --button-hover-color: rgba(138, 181, 230, 0.2);
            --button-solid-color: #1f2b39;
            --filled-button-hover-color: #b27589;
            --red: #f88379;
            --green: #79f788;
            --filter: invert(100%) sepia(1%) saturate(5386%) hue-rotate(240deg) brightness(118%) contrast(69%);
            --main-color-inverted: #26745e;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Q3ZDdkNyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZDdkN2Q3IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #34ad7e;
            --main-color-38: rgba(52, 173, 126, 0.38);
            --main-text: #dedede;
            --secondary-text: #969696;
            --sugg-action: #304949;
            --sugg-action-inverse: rgba(46, 40, 55, 0.2);
            --main-background: #2e2837;
            --raised-background: #362f41;
            --disabled-color: rgba(222, 222, 222, 0.38);
            --button-color: rgba(197, 177, 230, 0.1);
            --button-hover-color: rgba(197, 177, 230, 0.2);
            --button-solid-color: #3d3648;
            --filled-button-hover-color: #339270;
            --red: #d06262;
            --green: #34ad7e;
            --filter: invert(100%) sepia(1%) saturate(3148%) hue-rotate(221deg) brightness(114%) contrast(74%);
            --main-color-inverted: #cb5281;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2RlZGVkZSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZGVkZWRlIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #dcd88c;
            --main-color-38: rgba(220, 216, 140, 0.38);
            --main-text: #9fbfb7;
            --secondary-text: #637873;
            --sugg-action: #494a3a;
            --sugg-action-inverse: rgba(24, 27, 30, 0.2);
            --main-background: #181b1e;
            --raised-background: #23272b;
            --disabled-color: rgba(159, 191, 183, 0.38);
            --button-color: rgba(195, 213, 230, 0.1);
            --button-hover-color: rgba(195, 213, 230, 0.2);
            --button-solid-color: #2a2e32;
            --filled-button-hover-color: #b5b276;
            --red: #f6867c;
            --green: #7af57a;
            --filter: invert(80%) sepia(5%) saturate(872%) hue-rotate(115deg) brightness(91%) contrast(93%);
            --main-color-inverted: #232773;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iIzlmYmZiNyIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjOWZiZmI3IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #89E894;
            --main-color-38: rgba(137, 232, 148, 0.38);
            --main-text: #eceff4;
            --secondary-text: #a8aaad;
            --sugg-action: #2e4839;
            --sugg-action-inverse: rgba(16, 19, 26, 0.2);
            --main-background: #10131a;
            --raised-background: #181d27;
            --disabled-color: rgba(236, 239, 244, 0.38);
            --button-color: rgba(165, 186, 230, 0.1);
            --button-hover-color: rgba(165, 186, 230, 0.2);
            --button-solid-color: #1f242e;
            --filled-button-hover-color: #71be7b;
            --red: #e88989;
            --green: #89E894;
            --filter: invert(99%) sepia(16%) saturate(943%) hue-rotate(176deg) brightness(99%) contrast(93%);
            --main-color-inverted: #76176b;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2VjZWZmNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZWNlZmY0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #a4cce8;
            --main-color-38: rgba(164, 204, 232, 0.38);
            --main-text: #ffdfdf;
            --secondary-text: #b8a0a0;
            --sugg-action: #384651;
            --sugg-action-inverse: rgba(20, 25, 30, 0.2);
            --main-background: #14191e;
            --raised-background: #1d232b;
            --disabled-color: rgba(255, 223, 223, 0.38);
            --button-color: rgba(172, 200, 230, 0.1);
            --button-hover-color: rgba(172, 200, 230, 0.2);
            --button-solid-color: #242a32;
            --filled-button-hover-color: #87a8c0;
            --red: #FAA0A0;
            --green: #a0faa0;
            --filter: invert(81%) sepia(5%) saturate(1589%) hue-rotate(311deg) brightness(102%) contrast(133%);
            --main-color-inverted: #5b3317;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2ZmZGZkZiIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZkZmRmIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #e95198;
            --main-color-38: rgba(233, 81, 152, 0.38);
            --main-text: #e4e3f6;
            --secondary-text: #a1a0ad;
            --sugg-action: #552d46;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #24212b;
            --raised-background: #2d2a37;
            --disabled-color: rgba(228, 227, 246, 0.38);
            --button-color: rgba(200, 186, 230, 0.1);
            --button-hover-color: rgba(200, 186, 230, 0.2);
            --button-solid-color: #34313e;
            --filled-button-hover-color: #ed74ad;
            --red: #e95151;
            --green: #51e851;
            --filter: invert(92%) sepia(2%) saturate(1544%) hue-rotate(203deg) brightness(99%) contrast(94%);
            --white: #fff;
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U0ZTNmNiIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTRlM2Y2IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #e91e63;
            --main-color-38: rgba(233, 30, 99, 0.38);
            --main-text: #eeeeee;
            --secondary-text: #a6a6a6;
            --sugg-action: #461425;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #101010;
            --raised-background: #1e1e1e;
            --disabled-color: rgba(238, 238, 238, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #252525;
            --filled-button-hover-color: #ed4b82;
            --red: #e91e28;
            --green: #1ee96f;
            --filter: invert(99%) sepia(7%) saturate(172%) hue-rotate(260deg) brightness(114%) contrast(87%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2VlZWVlZSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZWVlZWVlIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #bd93f9;
            --main-color-38: rgba(189, 147, 249, 0.38);
            --main-text: #f8f8f2;
            --secondary-text: #b0b0ac;
            --sugg-action: #4d4467;
            --sugg-action-inverse: rgba(40, 42, 54, 0.2);
            --main-background: #282a36;
            --raised-background: #2f3240;
            --disabled-color: rgba(248, 248, 242, 0.38);
            --button-color: rgba(179, 186, 230, 0.1);
            --button-hover-color: rgba(179, 186, 230, 0.2);
            --button-solid-color: #363947;
            --filled-button-hover-color: #9f7ed2;
            --red: #ff5555;
            --green: #50fa7b;
            --filter: invert(90%) sepia(69%) saturate(106%) hue-rotate(311deg) brightness(107%) contrast(94%);
            --main-color-inverted: #426c06;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2Y4ZjhmMiIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZjhmOGYyIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #85dad2;
            --main-color-38: rgba(133, 218, 210, 0.38);
            --main-text: #e4e3e1;
            --secondary-text: #9c9c9a;
            --sugg-action: #465855;
            --sugg-action-inverse: rgba(49, 44, 43, 0.2);
            --main-background: #312c2b;
            --raised-background: #3c3735;
            --disabled-color: rgba(228, 227, 225, 0.38);
            --button-color: rgba(230, 211, 207, 0.1);
            --button-hover-color: rgba(230, 211, 207, 0.2);
            --button-solid-color: #433e3c;
            --filled-button-hover-color: #74b7b1;
            --red: #fd6883;
            --green: #adda78;
            --filter: invert(76%) sepia(100%) saturate(4%) hue-rotate(358deg) brightness(103%) contrast(88%);
            --main-color-inverted: #7a252d;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U0ZTNlMSIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTRlM2UxIiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: #a9dc76;
            --main-color-38: rgba(169, 220, 118, 0.38);
            --main-text: #e3e1e4;
            --secondary-text: #9c9a9c;
            --sugg-action: #4c5740;
            --sugg-action-inverse: rgba(45, 42, 46, 0.2);
            --main-background: #2d2a2e;
            --raised-background: #383539;
            --disabled-color: rgba(227, 225, 228, 0.38);
            --button-color: rgba(225, 213, 230, 0.1);
            --button-hover-color: rgba(225, 213, 230, 0.2);
            --button-solid-color: #3f3c40;
            --filled-button-hover-color: #90b867;
            --red: #ff6188;
            --green: #a9dc76;
            --filter: invert(96%) sepia(7%) saturate(62%) hue-rotate(236deg) brightness(99%) contrast(84%);
            --main-color-inverted: #562389;
            --invert-filter: invert(100%);
            --check-mark: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2UzZTFlNCIgLz48L3N2Zz4=);
            --arrow: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTNlMWU0IiAvPjwvc3ZnPg==);
        }`,

        `:root {
            --main-color: white;
            --main-color-38: rgba(255, 255, 255, 0.38);
            --main-text: #cfcfcf;
            --secondary-text: #878787;
            --sugg-action: #585858;
            --sugg-action-inverse: rgba(32, 32, 32, 0.2);
            --main-background: #202020;
            --raised-background: #2d2d2d;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #343434;
            --filled-button-hover-color: #d2d2d2;
            --red: #fb7c7c;
            --green: #6ee1b6;
            --filter: invert(96%) sepia(0%) saturate(0%) hue-rotate(108deg) brightness(87%) contrast(93%);
            --main-color-inverted: black;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2NmY2ZjZiIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjY2ZjZmNmIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #61D0FF;
            --main-color-38: rgba(56, 174, 237, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #0e2c3b;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #4ea6cc;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #9e2f00;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #FFEA61;
            --main-color-38: rgba(255, 234, 97, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #403b18;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #ccbb4e;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #00159e;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #90FF61;
            --main-color-38: rgba(144, 255, 97, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #244018;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #73cc4e;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #6f009e;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #FF61FF;
            --main-color-38: rgba(255, 97, 255, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #401840;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #cc4ecc;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #009e00;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #FFAB61;
            --main-color-38: rgba(255, 171, 97, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #402b18;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #cc894e;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #00549e;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #FF6161;
            --main-color-38: rgba(255, 97, 97, 0.38);
            --main-text: #e7e9ea;
            --secondary-text: #a2a3a3;
            --sugg-action: #401818;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: black;
            --raised-background: #101010;
            --disabled-color: rgba(231, 233, 234, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #171717;
            --filled-button-hover-color: #cc4e4e;
            --red: #FF6161;
            --green: #90FF61;
            --filter: invert(99%) sepia(1%) saturate(891%) hue-rotate(170deg) brightness(94%) contrast(95%);
            --main-color-inverted: #009e9e;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #fa1e4e;
            --main-color-38: rgba(250, 30, 78, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #4c1426;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #121019;
            --raised-background: #1c1826;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(184, 170, 230, 0.1);
            --button-hover-color: rgba(184, 170, 230, 0.2);
            --button-solid-color: #231f2d;
            --filled-button-hover-color: #fb4b71;
            --red: #fa1e1e;
            --green: #1efa6b;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #a970ff;
            --main-color-38: rgba(169, 112, 255, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #352556;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #0e0c1d;
            --raised-background: #14112a;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(142, 129, 230, 0.1);
            --button-hover-color: rgba(142, 129, 230, 0.2);
            --button-solid-color: #1b1831;
            --filled-button-hover-color: #ba8dff;
            --red: #ff7070;
            --green: #70ff91;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #4474ee;
            --main-color-38: rgba(68, 116, 238, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #1c2b50;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #0e121b;
            --raised-background: #151b28;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(149, 174, 230, 0.1);
            --button-hover-color: rgba(149, 174, 230, 0.2);
            --button-solid-color: #1c222f;
            --filled-button-hover-color: #6990f1;
            --red: #ee4444;
            --green: #44ee60;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #ff7070;
            --main-color-38: rgba(255, 112, 112, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #492732;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #0c0f1d;
            --raised-background: #151b28;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(129, 147, 230, 0.1);
            --button-hover-color: rgba(129, 147, 230, 0.2);
            --button-solid-color: #181c31;
            --filled-button-hover-color: #ff8d8d;
            --red: #ff7070;
            --green: #70ff7a;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #c4ff70;
            --main-color-38: rgba(196, 255, 112, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #414536;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #150722;
            --raised-background: #1c082f;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(161, 90, 230, 0.1);
            --button-hover-color: rgba(161, 90, 230, 0.2);
            --button-solid-color: #230f36;
            --filled-button-hover-color: #a1cd61;
            --red: #ff7070;
            --green: #c4ff70;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #3b008f;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #47ffe7;
            --main-color-38: rgba(71, 255, 231, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #284850;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #1e0b1d;
            --raised-background: #2b0e2a;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 122, 225, 0.1);
            --button-hover-color: rgba(230, 122, 225, 0.2);
            --button-solid-color: #321631;
            --filled-button-hover-color: #3fcebf;
            --red: #ff476f;
            --green: #47ffa6;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #b80018;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #ff708d;
            --main-color-38: rgba(255, 112, 141, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #562532;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #1d0c13;
            --raised-background: #2a111b;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 129, 170, 0.1);
            --button-hover-color: rgba(230, 129, 170, 0.2);
            --button-solid-color: #311822;
            --filled-button-hover-color: #ff8da4;
            --red: #ff7070;
            --green: #70ff81;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #fdf008;
            --main-color-38: rgba(253, 240, 8, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #3f5721;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #002429;
            --raised-background: #002d34;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(46, 205, 230, 0.1);
            --button-hover-color: rgba(46, 205, 230, 0.2);
            --button-solid-color: #05353c;
            --filled-button-hover-color: #cac70e;
            --red: #fd0808;
            --green: #08fd1c;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white-2: #fff;
            --main-color-inverted: #020ff7;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #33ff4e;
            --main-color-38: rgba(51, 255, 78, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #195220;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #101811;
            --raised-background: #19261a;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(174, 230, 181, 0.1);
            --button-hover-color: rgba(174, 230, 181, 0.2);
            --button-solid-color: #202d21;
            --filled-button-hover-color: #2cd141;
            --red: #ff3333;
            --green: #33ff4e;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #cc00b1;
            --white-2: #fff;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #ff9900;
            --main-color-38: rgba(255, 153, 0, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #4e3710;
            --sugg-action-inverse: rgba(255, 255, 255, 0.2);
            --main-background: #131615;
            --raised-background: #1f2423;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(209, 230, 223, 0.1);
            --button-hover-color: rgba(209, 230, 223, 0.2);
            --button-solid-color: #262b2a;
            --filled-button-hover-color: #ffad33;
            --red: #ff1500;
            --green: #59ff00;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --white: #fff;
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #5aedbc;
            --main-color-38: rgba(90, 237, 188, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #284a3d;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #171412;
            --raised-background: #25201d;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 209, 195, 0.1);
            --button-hover-color: rgba(230, 209, 195, 0.2);
            --button-solid-color: #2c2724;
            --filled-button-hover-color: #4dc29a;
            --red: #ed5a5a;
            --green: #5aed69;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #a51243;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #deb768;
            --main-color-38: rgba(222, 183, 104, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #4a3e27;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #181511;
            --raised-background: #26211a;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 209, 181, 0.1);
            --button-hover-color: rgba(230, 209, 181, 0.2);
            --button-solid-color: #2d2821;
            --filled-button-hover-color: #b79656;
            --red: #de6868;
            --green: #6ede68;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #214897;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,

        `:root {
            --main-color: #cccccc;
            --main-color-38: rgba(204, 204, 204, 0.38);
            --main-text: #fff;
            --secondary-text: #b8b8b8;
            --sugg-action: #424242;
            --sugg-action-inverse: rgba(0, 0, 0, 0.2);
            --main-background: #141414;
            --raised-background: #222222;
            --disabled-color: rgba(255, 255, 255, 0.38);
            --button-color: rgba(230, 230, 230, 0.1);
            --button-hover-color: rgba(230, 230, 230, 0.2);
            --button-solid-color: #292929;
            --filled-button-hover-color: #a7a7a7;
            --red: #de6868;
            --green: #6ede68;
            --black: #000;
            --filter: invert(100%) sepia(0%) saturate(7481%) hue-rotate(216deg) brightness(100%) contrast(101%);
            --main-color-inverted: #333333;
            --invert-filter: invert(100%);
            --check-mark: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIgZmlsbD0iI2U3ZTllYSIgLz48L3N2Zz4=');
            --arrow: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZTdlOWVhIiAvPjwvc3ZnPg==');
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('darkThemes')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('darkThemes')] + cssCode[0];
}

if (GM_getValue('darkThemes')) darkThemes();

function videosPerRow(click) {
    const cssCode = [`
        .ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 4;
        }

        ytd-rich-item-renderer:nth-child(4):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 4;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }

        .ytp-inline-preview-mode .ytp-paid-content-overlay,
        [style="--ytd-rich-shelf-items-count: 4;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        #home-page-skeleton .rich-grid-media-skeleton {
            max-width: calc(100%/var(--ytd-rich-grid-items-per-row) - 16px);
            min-width: 0;
        }

        ytd-rich-section-renderer {
            order: -1;
        }

        ytd-rich-shelf-renderer {
            border: none;
        }

        #rich-shelf-header.ytd-rich-shelf-renderer,
        ytd-rich-section-renderer.ytd-rich-grid-renderer+ytd-rich-section-renderer.ytd-rich-grid-renderer {
            margin-top: 0;
        }

        [page-subtype="home"] .yt-core-image--content-mode-scale-aspect-fill {
            object-fit: fill;
        }

        .ytp-inline-preview-ui .ytp-subtitles-button,
        .ytp-inline-preview-ui .ytp-mute-button {
            display: block !important;
        }

        .ytp-inline-preview-mode button.ytp-subtitles-button.ytp-button::after {
            margin: 0 8px;
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 5;
        }

        ytd-rich-item-renderer:nth-child(5):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 5;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 5;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 6;
        }

        ytd-rich-item-renderer:nth-child(6):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 6;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 6;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 7;
        }

        ytd-rich-item-renderer:nth-child(7):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 7;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 7;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 8;
        }

        ytd-rich-item-renderer:nth-child(8):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 8;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 8;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 9;
        }

        ytd-rich-item-renderer:nth-child(9):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 9;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 9;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 10;
        }

        ytd-rich-item-renderer:nth-child(10):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 10;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 10;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 11;
        }

        ytd-rich-item-renderer:nth-child(11):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 11;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 11;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,

        `.ytd-rich-grid-renderer,
        html {
            --ytd-rich-grid-items-per-row: 12;
        }

        ytd-rich-item-renderer:nth-child(12):has(#video-title.ytd-rich-grid-media)[hidden] {
            display: block !important;
        }

        [style="--ytd-rich-shelf-items-count: 12;"]:has(#video-title.ytd-rich-grid-media) .expand-collapse-button.ytd-rich-shelf-renderer {
            display: none;
        }

        [style="--ytd-rich-shelf-items-count: 12;"]:has(#video-title.ytd-rich-grid-media) #dismissible.ytd-rich-shelf-renderer {
            border-bottom: 4px solid var(--yt-spec-10-percent-layer);
        }`,
    ];

    if (click) for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');

    for (let i = 0; i < GM_getValue('videosPerRow'); i++) styleTag.innerHTML += cssCode[i];
}

if (GM_getValue('videosPerRow')) videosPerRow();

function hideProfilePictures(click) {
    const cssCode = `
        .ytd-rich-grid-media:is(#avatar, #avatar-link),
        #home-page-skeleton .channel-avatar {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideProfilePictures') === true;
        state = !state;
        GM_setValue('hideProfilePictures', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('👤 Video grid: Hide profile pictures').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('👤 Video grid: Hide profile pictures').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideProfilePictures')) hideProfilePictures();

function shortsBlocker(click) {
    const cssCode = `
        #items.ytd-grid-renderer > ytd-grid-video-renderer.ytd-grid-renderer:has([href*="/shorts/"]),
        #items.yt-horizontal-list-renderer > *.yt-horizontal-list-renderer:has([href*="/shorts/"]),
        ytd-rich-section-renderer:has([is-shorts]),
        ytd-rich-item-renderer:has([href*="/shorts/"]):not([is-slim-media]),
        ytd-video-renderer:has([href*="/shorts/"]),
        ytd-notification-renderer:has([href*="/shorts/"]),
        ytd-reel-shelf-renderer:has([href*="/shorts/"]),
        [page-subtype="subscriptions"] ytd-item-section-renderer:has([href*="/shorts/"]) {
            display: none !important;
        }`;

    if (click) {
        let state = GM_getValue('shortsBlocker') === true;
        state = !state;
        GM_setValue('shortsBlocker', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🩳 Shorts blocker').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🩳 Shorts blocker').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('shortsBlocker')) shortsBlocker();

function hideSearchResults(click) {
    const cssCode = `
        [is-search] ytd-shelf-renderer.ytd-item-section-renderer:not(ytd-channel-renderer + ytd-shelf-renderer),
        [is-search] ytd-horizontal-card-list-renderer.ytd-item-section-renderer:not(:first-child),
        [is-search] ytd-exploratory-results-renderer.ytd-item-section-renderer {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideSearchResults') === true;
        state = !state;
        GM_setValue('hideSearchResults', state);
        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🔎 Hide irrelevant search results').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🔎 Hide irrelevant search results').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode
}

if (GM_getValue('hideSearchResults')) hideSearchResults();

function ambientMode(click) {
    const cssCode = [`
        ytd-watch-flexy[theater] #player.ytd-watch-flexy,
        ytd-watch-flexy[fullscreen] #player.ytd-watch-flexy {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            margin-top: 100px;
        }

        .html5-video-player {
            z-index: 1 !important;
        }

        body,
        body [scrolling] {
            overflow-x: hidden;
        }

        html[dark] ytd-masthead[is-watch-page][theater]:not([fullscreen]) #background.ytd-masthead {
            transition: opacity .1s linear;
        }`,

        `html[dark] ytd-masthead[is-watch-page][theater]:not([fullscreen]) #background.ytd-masthead {
            opacity: 0;
        }`
    ];

    window.addEventListener('scroll', mastheadBackground);

    if (click) {
        let state = GM_getValue('ambientMode') === true;
        state = !state;
        GM_setValue('ambientMode', state);
        if (state) {
            styleTag.innerHTML += cssCode[0] + cssCode[1];
            document.getElementById('💡 Ambient mode in theater and fullscreen mode').children[1].setAttribute('aria-pressed', 'true');
        } else {
            window.removeEventListener('scroll', mastheadBackground);
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[0], '').replace(cssCode[1], '');
            document.getElementById('💡 Ambient mode in theater and fullscreen mode').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode[0] + cssCode[1];
}

if (GM_getValue('ambientMode')) ambientMode();

function mastheadBackground() {
    if (window.location.toString().includes('/watch')) {
        if (window.pageYOffset >= 1) styleTag.innerHTML = styleTag.innerHTML.replace(
        `html[dark] ytd-masthead[is-watch-page][theater]:not([fullscreen]) #background.ytd-masthead {
            opacity: 0;
        }`, '');
        else styleTag.innerHTML +=
        `html[dark] ytd-masthead[is-watch-page][theater]:not([fullscreen]) #background.ytd-masthead {
            opacity: 0;
        }`;
    }
}

function fullscreenTheaterMode(click) {
    const cssCode = `
        ytd-watch-flexy[full-bleed-player]:not([fullscreen])[theater] #full-bleed-container.ytd-watch-flexy {
            height: 100vh;
            max-height: none;
            margin-top: calc(0px - var(--ytd-toolbar-height));
        }

        #masthead-container.ytd-app [is-watch-page][theater]:not([fullscreen]) {
            opacity: 0;
            transition: opacity .1s ease-in;
        }

        #masthead-container.ytd-app:hover [theater]:not([fullscreen]) {
            opacity: 1;
            transition: opacity .1s ease-out;
        }

        ytd-masthead[is-watch-page][theater] #background.ytd-masthead {
            opacity: 1 !important;
        }

        [theater]:not([fullscreen]) .ytp-cards-button-icon,
        [theater]:not([fullscreen]) .ytp-share-icon,
        [theater]:not([fullscreen]) .ytp-tooltip-text,
        [theater]:not([fullscreen]) .ytp-cards-teaser,
        [theater]:not([fullscreen]) .ytp-exp-ppp-update .ytp-paid-content-overlay-link,
        [theater]:not([fullscreen]) .ytp-sfn,
        [theater]:not([fullscreen]) .ytp-drawer {
            margin-top: var(--ytd-toolbar-height);
        }`;

    if (click) {
        let state = GM_getValue('fullscreenTheaterMode') === true;
        state = !state;
        GM_setValue('fullscreenTheaterMode', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎭 Fullscreen theater mode').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎭 Fullscreen theater mode').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('fullscreenTheaterMode')) fullscreenTheaterMode();

function scrollUpButton(click) {
    const cssCode = [`
        #scroll-up-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            border-radius: 100%;
        }

        #scroll-up-button:hover::before {
            background-color: currentcolor;
            opacity: 0.2;
        }

        #scroll-up-button:active::before {
            background: currentcolor;
            opacity: 0.4;
        }

        #scroll-up-button.show {
            opacity: 1;
            visibility: visible;
            transition: all .2s ease-out;
        }

        #scroll-up-button svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px
        }`,

        `#scroll-up-button {
            display: inline-block;
            background-color: var(--paper-tooltip-background, var(--yt-spec-text-primary));
            color: var(--yt-spec-text-primary-inverse);
            width: 35px;
            height: 35px;
            text-align: center;
            border-radius: 50%;
            position: fixed;
            bottom: 10px;
            right: 10px;
            opacity: 0;
            visibility: hidden;
            z-index: 9999;
            cursor: pointer;
            transition: all .2s ease-in;
            box-shadow: 0px 4px 32px 0px var(--yt-spec-static-overlay-background-light);
        }`,

        `#scroll-up-button {
            display: inline-block;
            background-color: var(--paper-tooltip-background, var(--yt-spec-text-primary));
            color: var(--yt-spec-text-primary-inverse);
            width: 35px;
            height: 35px;
            text-align: center;
            border-radius: 50%;
            position: fixed;
            bottom: 10px;
            left: 10px;
            opacity: 0;
            visibility: hidden;
            z-index: 9999;
            cursor: pointer;
            transition: all .2s ease-in;
            box-shadow: 0px 4px 32px 0px var(--yt-spec-static-overlay-background-light);
        }`,

        `#scroll-up-button {
            display: inline-block;
            background-color: var(--paper-tooltip-background, var(--yt-spec-text-primary));
            color: var(--yt-spec-text-primary-inverse);
            width: 35px;
            height: 35px;
            text-align: center;
            border-radius: 50%;
            position: fixed;
            bottom: 10px;
            left: 50%;
            opacity: 0;
            visibility: hidden;
            z-index: 9999;
            cursor: pointer;
            transition: all .2s ease-in;
            box-shadow: 0px 4px 32px 0px var(--yt-spec-static-overlay-background-light);
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (document.getElementById('scroll-up-button')) document.getElementById('scroll-up-button').remove();
        if (!GM_getValue('scrollUpButton')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('scrollUpButton')] + cssCode[0];

    const scrollUpButton = document.createElement('a');
    scrollUpButton.id = 'scroll-up-button';
    scrollUpButton.style.fill = 'currentColor';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '19.35,11.5 11.5,3.65 3.65,11.5 4.35,12.21 11,5.56 11,20 12,20 12,5.56 18.65,12.21');

    svg.appendChild(polygon);
    scrollUpButton.appendChild(svg);
    document.documentElement.appendChild(scrollUpButton);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset >= 300) scrollUpButton.classList.add('show');
        else scrollUpButton.classList.remove('show');
    });

    scrollUpButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
        });
    });
}

if (GM_getValue('scrollUpButton')) {
    document.addEventListener('DOMContentLoaded', function() {
        scrollUpButton();
    });
}

function showFullVideoTitles(click) {
    const cssCode = `
        ytd-grid-video-renderer #video-title.yt-simple-endpoint.ytd-grid-video-renderer,
        ytd-rich-grid-media[mini-mode] #video-title.ytd-rich-grid-media,
        ytd-rich-grid-slim-media[mini-mode] #video-title.ytd-rich-grid-slim-media,
        ytd-video-renderer[is-backstage-video] #video-title.ytd-video-renderer,
        #video-title[class*="ytd"] {
            -webkit-line-clamp: 20;
            max-height: 44rem;
        }`;

    if (click) {
        let state = GM_getValue('showFullVideoTitles') === true;
        state = !state;
        GM_setValue('showFullVideoTitles', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎥 Show full video titles').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎥 Show full video titles').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('showFullVideoTitles')) showFullVideoTitles();

function autoExpandComments(click) {
    const cssCode = `
        #comment-content ytd-expander[should-use-number-of-lines][collapsed] > #content.ytd-expander {
            --ytd-expander-max-lines: none;
        }`;

    if (click) {
        let state = GM_getValue('autoExpandComments') === true;
        state = !state;
        GM_setValue('autoExpandComments', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('💬 Auto-expand comments').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('💬 Auto-expand comments').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('autoExpandComments')) autoExpandComments();

function videoDescription(click) {
    const cssCode = [`
        ytd-expander.ytd-video-secondary-info-renderer tp-yt-paper-button,
        .ytd-watch-metadata:is(#description, ytd-metadata-row-container-renderer),
        .ytd-video-primary-info-renderer:is(.title.ytd-video-primary-info-renderer, ytd-badge-supported-renderer),
        #info.ytd-video-primary-info-renderer #menu-container,
        #top-row.ytd-video-secondary-info-renderer {
            display: none;
        }

        #info-strings.ytd-video-primary-info-renderer,
        span.ytd-video-view-count-renderer {
            color: var(--yt-spec-text-primary);
            font-weight: 500;
        }

        .ytd-watch-flexy:is(#info-contents, #meta-contents),
        ytd-structured-description-content-renderer.ytd-video-secondary-info-renderer {
            display: block !important;
        }

        ytd-expander.ytd-video-secondary-info-renderer {
            margin: 0px;
        }

        ytd-expander[collapsed] > #content.ytd-expander {
            max-height: none;
        }

        #description.ytd-video-secondary-info-renderer {
            max-width: none;
        }

        ytd-video-primary-info-renderer,
        ytd-video-secondary-info-renderer {
            border: none;
            padding: 0;
        }

        .super-title.ytd-video-primary-info-renderer {
            color: var(--yt-spec-text-secondary);
        }`,

        `ytd-expander.ytd-video-secondary-info-renderer tp-yt-paper-button,
        .ytd-watch-metadata:is(#description, ytd-metadata-row-container-renderer),
        .ytd-video-primary-info-renderer:is(.title.ytd-video-primary-info-renderer, ytd-badge-supported-renderer),
        #info.ytd-video-primary-info-renderer #menu-container,
        #top-row.ytd-video-secondary-info-renderer,
        .ytd-structured-description-content-renderer:is(ytd-video-description-infocards-section-renderer, ytd-video-description-music-section-renderer, ytd-video-description-course-section-renderer, ytd-horizontal-card-list-renderer) {
            display: none;
        }

        #info-strings.ytd-video-primary-info-renderer,
        span.ytd-video-view-count-renderer {
            color: var(--yt-spec-text-primary);
            font-weight: 500;
        }

        #info-contents.ytd-watch-flexy,
        #meta-contents.ytd-watch-flexy {
            display: block !important;
        }

        ytd-expander.ytd-video-secondary-info-renderer {
            margin: 0px;
        }

        ytd-expander[collapsed] > #content.ytd-expander {
            max-height: none;
        }

        #description.ytd-video-secondary-info-renderer {
            max-width: none;
        }

        ytd-video-primary-info-renderer,
        ytd-video-secondary-info-renderer {
            border: none;
            padding: 0;
        }

        .super-title.ytd-video-primary-info-renderer {
            color: var(--yt-spec-text-secondary);
        }`,

        `.ytd-watch-metadata #snippet.ytd-text-inline-expander {
            display: none;
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('videoDescription')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('videoDescription') - 1];
}

if (GM_getValue('videoDescription')) videoDescription();

function redSubscribeButton(click) {
    const cssCode = `
        ytd-subscribe-button-renderer .yt-spec-button-shape-next--size-m.yt-spec-button-shape-next--filled,
        [button-style="COMPACT_GRAY"]:not([subscribed]) .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal,
        .ytp-sb-subscribe,
        a.ytp-sb-subscribe {
            background: #cc0000 !important;
            color: #ffff !important;
        }

        ytd-subscribe-button-renderer .yt-spec-button-shape-next--size-m.yt-spec-button-shape-next--filled:hover,
        [button-style="COMPACT_GRAY"]:not([subscribed]) .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal:hover {
            background: #b70000 !important;
        }

        ytd-subscribe-button-renderer {
            --yt-spec-touch-response: currentcolor;
            --yt-spec-touch-response-inverse: currentcolor;
            --yt-spec-static-overlay-touch-response-inverse: currentcolor;
        }`;

    if (click) {
        let state = GM_getValue('redSubscribeButton') === true;
        state = !state;
        GM_setValue('redSubscribeButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🔴 Red subscribe button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🔴 Red subscribe button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('redSubscribeButton')) redSubscribeButton();

function hideEndCards(click) {
    const cssCode = `
        .ytp-ce-element.ytp-ce-element-show {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideEndCards') === true;
        state = !state;
        GM_setValue('hideEndCards', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('💳 Hide end cards').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('💳 Hide end cards').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideEndCards')) hideEndCards();

function hideLatestYouTubePosts(click) {
    const cssCode = `
        ytd-rich-section-renderer:has([is-post]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideLatestYouTubePosts') === true;
        state = !state;
        GM_setValue('hideLatestYouTubePosts', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('❌ Hide Latest YouTube Posts').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('❌ Hide Latest YouTube Posts').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideLatestYouTubePosts')) hideLatestYouTubePosts();

function hideRecommendationBar(click) {
    const cssCode = `
        [page-subtype="home"] ytd-feed-filter-chip-bar-renderer,
        html[darker-dark-theme] #home-chips {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideRecommendationBar') === true;
        state = !state;
        GM_setValue('hideRecommendationBar', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('❌ Hide homepage\'s recommendation bar').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('❌ Hide homepage\'s recommendation bar').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideRecommendationBar')) hideRecommendationBar();

function hideShareButton(click) {
    const cssCode = `
        ytd-menu-renderer:not([condensed]) #top-level-buttons-computed ytd-button-renderer:nth-child(2) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideShareButton') === true;
        state = !state;
        GM_setValue('hideShareButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🔁 Watch page: Hide Share button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🔁 Watch page: Hide Share button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideShareButton')) hideShareButton();

function hideDownloadButton(click) {
    const cssCode = `
        #flexible-item-buttons.ytd-menu-renderer:not(:empty) > .ytd-menu-renderer[button-renderer]:has([d="M17 18v1H6v-1h11zm-.5-6.6-.7-.7-3.8 3.7V4h-1v10.4l-3.8-3.8-.7.7 5 5 5-4.9z"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideDownloadButton') === true;
        state = !state;
        GM_setValue('hideDownloadButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('⬇️ Watch page: Hide Download button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('⬇️ Watch page: Hide Download button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideDownloadButton')) hideDownloadButton();

function hideClipButton(click) {
    const cssCode = `
        #flexible-item-buttons ytd-button-renderer:has([d="M8 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm-1 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3.79-7.77L21 18.44V20h-3.27l-5.76-5.76-1.27 1.27c.19.46.3.96.3 1.49 0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4c.42 0 .81.08 1.19.2l1.37-1.37-1.11-1.11C8 10.89 7.51 11 7 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4c0 .43-.09.84-.21 1.23zm-.71.71-.43-.44.19-.58c.11-.34.16-.64.16-.92 0-1.65-1.35-3-3-3S4 5.35 4 7s1.35 3 3 3c.36 0 .73-.07 1.09-.21l.61-.24.46.46 1.11 1.11.71.71-.71.71-1.37 1.37-.43.43-.58-.18C7.55 14.05 7.27 14 7 14c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3c0-.38-.07-.75-.22-1.12l-.25-.61.47-.47 1.27-1.27.71-.71.71.71L18.15 19H20v-.15l-9.92-9.91zM17.73 4H21v1.56l-5.52 5.52-2.41-2.41L17.73 4zm.42 1-3.67 3.67 1 1L20 5.15V5h-1.85z"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideClipButton') === true;
        state = !state;
        GM_setValue('hideClipButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('✂️ Watch page: Hide Clip button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('✂️ Watch page: Hide Clip button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideClipButton')) hideClipButton();

function hideThanksButton(click) {
    const cssCode = `
        #flexible-item-buttons ytd-button-renderer:has([d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm5.5-15c-1.74 0-3.41.88-4.5 2.28C10.91 2.88 9.24 2 7.5 2 4.42 2 2 4.64 2 7.99c0 4.12 3.4 7.48 8.55 12.58L12 22l1.45-1.44C18.6 15.47 22 12.11 22 7.99 22 4.64 19.58 2 16.5 2zm-3.75 17.85-.75.74-.74-.73-.04-.04C6.27 14.92 3 11.69 3 7.99 3 5.19 4.98 3 7.5 3c1.4 0 2.79.71 3.71 1.89L12 5.9l.79-1.01C13.71 3.71 15.1 3 16.5 3 19.02 3 21 5.19 21 7.99c0 3.7-3.28 6.94-8.25 11.86z"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideThanksButton') === true;
        state = !state;
        GM_setValue('hideThanksButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('💲 Watch page: Hide Thanks button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('💲 Watch page: Hide Thanks button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideThanksButton')) hideThanksButton();

function hideSaveButton(click) {
    const cssCode = `
        #flexible-item-buttons ytd-button-renderer:has([d="M22 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2zm-8-6H2v1h12V7zM2 12h8v-1H2v1zm0 4h8v-1H2v1z"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideSaveButton') === true;
        state = !state;
        GM_setValue('hideSaveButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('💾 Watch page: Hide Save button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('💾 Watch page: Hide Save button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideSaveButton')) hideSaveButton();

function hideTranscriptButton(click) {
    const cssCode = `
        #flexible-item-buttons ytd-button-renderer:has([d="M6 6H3v1h3V6zm15 5h-3v1h3v-1zM6 16H3v1h3v-1zM21 6H8v1h13V6zm-5 5H3v1h13v-1zm5 5H8v1h13v-1z"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideTranscriptButton') === true;
        state = !state;
        GM_setValue('hideTranscriptButton', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('📜 Watch page: Hide Transcript button').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('📜 Watch page: Hide Transcript button').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideTranscriptButton')) hideTranscriptButton();

function compactButtons(click) {
    const cssCode = `
        ytd-menu-renderer:not([condensed]) #top-level-buttons-computed ytd-button-renderer:nth-child(2) .yt-spec-button-shape-next--button-text-content,
        #flexible-item-buttons .yt-spec-button-shape-next__button-text-content {
            display: none;
        }

        ytd-menu-renderer:not([condensed]) #top-level-buttons-computed ytd-button-renderer:nth-child(2),
        #flexible-item-buttons .yt-spec-button-shape-next.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--mono,
        #flexible-item-buttons .yt-spec-button-shape-next--disabled.yt-spec-button-shape-next--tonal {
            width: 36px;
            padding: 0;
        }

        ytd-menu-renderer:not([condensed]) #top-level-buttons-computed ytd-button-renderer:nth-child(2) .yt-spec-button-shape-next__icon,
        #flexible-item-buttons .yt-spec-button-shape-next__icon {
            margin: 0;
        }`;

    if (click) {
        let state = GM_getValue('compactButtons') === true;
        state = !state;
        GM_setValue('compactButtons', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('✂️ Watch page: Compact buttons').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('✂️ Watch page: Compact buttons').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('compactButtons')) compactButtons();

function hideWatchVideos(click) {
    const cssCode = [`
        [page-subtype="home"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer) {
            display: none;
        }`,

        `[page-subtype="home"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has(.badge-style-type-live-now-alternate.ytd-badge-supported-renderer)) {
            display: none;
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('hideWatchVideos')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('hideWatchVideos') - 1];
}

if (GM_getValue('hideWatchVideos')) hideWatchVideos();

function hideWatchVideos2(click) {
    const cssCode = [`
        [page-subtype="subscriptions"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer),
        [page-subtype="subscriptions"] ytd-item-section-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer),
        [page-subtype="channels"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer) {
            display: none;
        }`,

        `[page-subtype="subscriptions"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has(.badge-style-type-live-now-alternate.ytd-badge-supported-renderer)),
        [page-subtype="subscriptions"] ytd-item-section-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has(.badge-style-type-live-now-alternate.ytd-badge-supported-renderer)),
        [page-subtype="channels"] ytd-rich-item-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has([overlay-style="LIVE"])) {
            display: none;
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('hideWatchVideos2')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('hideWatchVideos2') - 1];
}

if (GM_getValue('hideWatchVideos2')) hideWatchVideos2();

function hideWatchVideos3(click) {
    const cssCode = [`
        ytd-compact-video-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer) {
            display: none;
        }`,

        `ytd-compact-video-renderer:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has(.badge-style-type-live-now-alternate.ytd-badge-supported-renderer)) {
            display: none;
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('hideWatchVideos3')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('hideWatchVideos3') - 1];
}

if (GM_getValue('hideWatchVideos3')) hideWatchVideos3();

function hideWatchVideos4(click) {
    const cssCode = [`
        ytd-video-renderer[is-search]:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer) {
            display: none;
        }`,

        `ytd-video-renderer[is-search]:has(#progress.ytd-thumbnail-overlay-resume-playback-renderer[style="width: 100%;"]):not(:has(.badge-style-type-live-now-alternate.ytd-badge-supported-renderer)) {
            display: none;
        }`,
    ];

    if (click) {
        for (let i = 0; i < cssCode.length; i++) styleTag.innerHTML = styleTag.innerHTML.replace(cssCode[i], '');
        if (!GM_getValue('hideWatchVideos4')) return;
    }

    styleTag.innerHTML += cssCode[GM_getValue('hideWatchVideos4') - 1];
}

if (GM_getValue('hideWatchVideos4')) hideWatchVideos4();

function hideMixes(click) {
    const cssCode = `
        ytd-rich-item-renderer:has([href*="start_radio=1"]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideMixes') === true;
        state = !state;
        GM_setValue('hideMixes', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎵 Hide mixes: Homepage').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎵 Hide mixes: Homepage').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideMixes')) hideMixes();

function hideMixes2(click) {
    const cssCode = `
        ytd-compact-radio-renderer {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideMixes2') === true;
        state = !state;
        GM_setValue('hideMixes2', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎵 Hide mixes: Related videos sidebar').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎵 Hide mixes: Related videos sidebar').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideMixes2')) hideMixes2();

function hideMixes3(click) {
    const cssCode = `
        ytd-radio-renderer {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideMixes3') === true;
        state = !state;
        GM_setValue('hideMixes3', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎵 Hide mixes: Search results').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎵 Hide mixes: Search results').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideMixes3')) hideMixes3();

function hideGameSection(click) {
    const cssCode = `
        ytd-rich-metadata-row-renderer:not([fixie]) {
            display: none;
        }`;

    if (click) {
        let state = GM_getValue('hideGameSection') === true;
        state = !state;
        GM_setValue('hideGameSection', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('👾 Watch page: Hide game section').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('👾 Watch page: Hide game section').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('hideGameSection')) hideGameSection();

function moreAnimations(click) {
    const cssCode = `
        ytd-video-renderer,
        ytd-channel-renderer,
        ytd-rich-item-renderer,
        ytd-playlist-video-renderer,
        ytd-playlist-renderer,
        .ytd-grid-renderer:is(ytd-grid-video-renderer, ytd-grid-playlist-renderer, ytd-grid-show-renderer, ytd-grid-channel-renderer, ytd-vertical-product-card-renderer),
        .ytd-item-section-renderer:is(ytd-radio-renderer, ytd-playlist-renderer, ytd-compact-video-renderer, ytd-compact-playlist-renderer, ytd-compact-radio-renderer, ytd-backstage-post-thread-renderer, ytd-channel-about-metadata-renderer, ytd-channel-video-player-renderer, ytd-message-renderer, ytd-background-promo-renderer),
        #body.ytd-comment-renderer,
        #description.ytd-watch-metadata,
        ytd-metadata-row-container-renderer,
        #description.ytd-video-secondary-info-renderer,
        ytd-video-primary-info-renderer,
        .arrow.yt-horizontal-list-renderer {
            animation: cubic-bezier(0.4, 0, 0.2, 1) fadeInUp .8s;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0px);
            }
        }

        .ytd-recognition-shelf-renderer:is(#avatars-container, #action-button),
        .ytd-channel-sub-menu-renderer:is(#sort-menu, ytd-menu-renderer),
        #subscribe-button.ytd-shelf-renderer,
        #menu:is(.ytd-watch-metadata, .ytd-rich-shelf-renderer, .ytd-shelf-renderer),
        #sort-filter.ytd-horizontal-card-list-renderer,
        ytd-menu-renderer.ytd-reel-shelf-renderer {
            animation: cubic-bezier(0.4, 0, 0.2, 1) fadeInLeft .8s
        }

        @keyframes fadeInLeft {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0px);
            }
        }

        #text-container.ytd-recognition-shelf-renderer,
        #items:is(.yt-horizontal-list-renderer, .ytd-horizontal-card-list-renderer),
        h2:is(.ytd-rich-shelf-renderer, .ytd-shelf-renderer),
        #subtitle.ytd-shelf-renderer,
        #primary-items.ytd-channel-sub-menu-renderer,
        .ytd-watch-metadata:is(h1, ytd-badge-supported-renderer, #owner),
        .thumbnail-and-metadata-wrapper.ytd-playlist-header-renderer,
        h3.ytd-channel-featured-content-renderer,
        .ytd-horizontal-card-list-renderer:is(#header, #header-button),
        h2.ytd-reel-shelf-renderer {
            animation: cubic-bezier(0.4, 0, 0.2, 1) fadeInRight .8s;
        }

        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0px);
            }
        }`;

    if (click) {
        let state = GM_getValue('moreAnimations') === true;
        state = !state;
        GM_setValue('moreAnimations', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🎞️ More animations').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🎞️ More animations').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('moreAnimations')) moreAnimations();

function decreaseFontSize(click) {
    const cssCode = `
        #video-title[class*="style-scope ytd-rich-grid"],
        ytd-game-details-renderer[is-rich-grid]:not([mini-mode]) #title.ytd-game-details-renderer {
            font-size: 1.4rem;
            line-height: 2rem;
        }

        .ytd-rich-grid-media ytd-video-meta-block[rich-meta] #byline-container.ytd-video-meta-block,
        .ytd-rich-grid-media ytd-video-meta-block[rich-meta] #metadata-line.ytd-video-meta-block {
            font-size: 1.2rem;
            line-height: 1.8rem;
        }`;

    if (click) {
        let state = GM_getValue('decreaseFontSize') === true;
        state = !state;
        GM_setValue('decreaseFontSize', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('🗛 Video grid: Decrease font size').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('🗛 Video grid: Decrease font size').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('decreaseFontSize')) decreaseFontSize();

function compactLeftSidebar(click) {
    const cssCode = `
        ytd-app {
            --app-drawer-width: 82px;
        }

        ytd-guide-renderer.ytd-app,
        #guide-skeleton {
            width: 82px;
        }

        body[dir="ltr"] ytd-app[guide-persistent-and-visible] ytd-page-manager.ytd-app {
            margin-left: var(--app-drawer-width);
        }

        body[dir="rtl"] ytd-app[guide-persistent-and-visible] ytd-page-manager.ytd-app {
            margin-right: var(--app-drawer-width);
        }

        ytd-guide-section-renderer {
            --paper-item-min-height: 48px;
        }

        ytd-guide-entry-renderer {
            width: var(--paper-item-min-height);
        }

        #guide-content ytd-topbar-logo-renderer,
        #guide-section-title.ytd-guide-section-renderer,
        .title.ytd-guide-entry-renderer,
        .ytd-guide-renderer:is(#guide-links-primary, #guide-links-secondary, #footer, ytd-guide-signin-promo-renderer) {
            display: none;
        }

        .guide-icon.ytd-guide-entry-renderer,
        yt-img-shadow.ytd-guide-entry-renderer {
            margin: 0px;
        }

        yt-img-shadow.ytd-guide-entry-renderer {
            margin-bottom: 3px;
        }

        tp-yt-paper-item.ytd-guide-entry-renderer {
            flex-direction: column;
            justify-content: center;
        }

        ytd-guide-entry-renderer,
        #endpoint.yt-simple-endpoint.ytd-guide-entry-renderer:is(:hover, :focus, :active),
        yt-interaction.ytd-guide-entry-renderer,
        tp-yt-paper-item.ytd-guide-entry-renderer {
            border-radius: 50%;
            --paper-item-focused-before-border-radius: 50%;
        }`;

    if (click) {
        let state = GM_getValue('compactLeftSidebar') === true;
        state = !state;
        GM_setValue('compactLeftSidebar', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('✂️ Compact left sidebar').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('✂️ Compact left sidebar').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('compactLeftSidebar')) compactLeftSidebar();

function compactHeaderBar(click) {
    const cssCode = `
        html {
            --ytd-toolbar-height: 36px;
        }

        ytd-feed-filter-chip-bar-renderer {
            --ytd-rich-grid-chips-bar-top: var(--ytd-toolbar-height);
        }

        ytd-app:not([scrolling]) {
            --ytd-masthead-height: var(--ytd-toolbar-height) !important;
        }

        .ytd-masthead:is(#container, #background),
        #header.ytd-app,
        ytd-masthead.shell {
            height: var(--ytd-toolbar-height);
        }

        #player.skeleton.theater {
            margin-top: var(--ytd-toolbar-height);
        }

        .ytd-searchbox:is(#search-form, #search-icon-legacy) {
            height: 30px;
        }

        yt-icon-button:is(.ytd-topbar-menu-button-renderer, .ytd-masthead, .ytd-notification-topbar-button-renderer),
        #masthead .yt-spec-button-shape-next--icon-only-default,
        #guide-button.ytd-app {
            width: 30px;
            height: 30px;
            padding: 3px;
        }

        #container.ytd-masthead,
        #header.ytd-app {
            padding: 0 21px;
        }`;

    if (click) {
        let state = GM_getValue('compactHeaderBar') === true;
        state = !state;
        GM_setValue('compactHeaderBar', state);

        if (state) {
            styleTag.innerHTML += cssCode;
            document.getElementById('✂️ Compact header bar').children[1].setAttribute('aria-pressed', 'true');
        } else {
            styleTag.innerHTML = styleTag.innerHTML.replace(cssCode, '');
            document.getElementById('✂️ Compact header bar').children[1].setAttribute('aria-pressed', 'false');
        }
    } else styleTag.innerHTML += cssCode;
}

if (GM_getValue('compactHeaderBar')) compactHeaderBar();