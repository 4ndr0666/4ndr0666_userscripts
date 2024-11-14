// ==UserScript==
// @name         YouTube Enhancer (Loop & Screenshot Button)
// @description  Integrating loop and screenshot buttons into the video and shorts player to enhance user functionality.
// @icon         https://raw.githubusercontent.com/exyezed/youtube-enhancer/refs/heads/main/extras/youtube-enhancer.png
// @version      1.1
// @author       exyezed
// @namespace    https://github.com/exyezed/youtube-enhancer/
// @supportURL   https://github.com/exyezed/youtube-enhancer/issues
// @license      MIT
// @match        https://www.youtube.com/*
// @grant        GM_xmlhttpRequest
// @downloadURL https://update.greasyfork.org/scripts/513114/YouTube%20Enhancer%20%28Loop%20%20Screenshot%20Button%29.user.js
// @updateURL https://update.greasyfork.org/scripts/513114/YouTube%20Enhancer%20%28Loop%20%20Screenshot%20Button%29.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const YouTubeEnhancerLoopScreenshotConfig = {
        screenshotFormat: "png",
        extension: 'png',
        screenshotFunctionality: 2 // 0: download, 1: clipboard, 2: both
    };

    // CSS Styles
    const YouTubeEnhancerLoopScreenshotCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        a.YouTubeEnhancerLoopScreenshot-loop-button, a.YouTubeEnhancerLoopScreenshot-screenshot-button {
            text-align: center;
        }

        a.YouTubeEnhancerLoopScreenshot-loop-button svg, a.YouTubeEnhancerLoopScreenshot-screenshot-button svg {
            margin-bottom: 2px;
            width: 52%;
            vertical-align: middle;
        }

        a.YouTubeEnhancerLoopScreenshot-loop-button.active svg {
            fill: url(#buttonGradient);
        }

        a.YouTubeEnhancerLoopScreenshot-screenshot-button.clicked svg {
            fill: url(#buttonGradient);
        }

        .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 16px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button .material-symbols-outlined {
            font-size: 24px;
            font-variation-settings: 'FILL' 1;
        }

        /* Theme-specific styles */
        html[dark] .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button {
            background-color: rgba(255, 255, 255, 0.1);
        }

        html[dark] .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        html[dark] .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button .material-symbols-outlined {
            color: white;
        }

        html:not([dark]) .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button {
            background-color: rgba(0, 0, 0, 0.05);
        }

        html:not([dark]) .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }

        html:not([dark]) .YouTubeEnhancerLoopScreenshot-shorts-screenshot-button .material-symbols-outlined {
            color: #030303;
        }
    `;

    // Utility Functions
    const YouTubeEnhancerLoopScreenshotUtils = {
        addStyle(styleString) {
            const style = document.createElement('style');
            style.textContent = styleString;
            document.head.append(style);
        },

        getYouTubeVideoLoopSVG() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('height', '24px');
            svg.setAttribute('viewBox', '0 -960 960 960');
            svg.setAttribute('width', '24px');
            svg.setAttribute('fill', '#e8eaed');
            
            // Add gradient definition
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'buttonGradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('style', 'stop-color:#f03');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('style', 'stop-color:#ff2791');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.appendChild(defs);
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M220-260q-92 0-156-64T0-480q0-92 64-156t156-64q37 0 71 13t61 37l68 62-60 54-62-56q-16-14-36-22t-42-8q-58 0-99 41t-41 99q0 58 41 99t99 41q22 0 42-8t36-22l310-280q27-24 61-37t71-13q92 0 156 64t64 156q0 92-64 156t-156 64q-37 0-71-13t-61-37l-68-62 60-54 62 56q16 14 36 22t42 8q58 0 99-41t41-99q0-58-41-99t-99-41q-22 0-42 8t-36 22L352-310q-27 24-61 37t-71 13Z');
            
            svg.appendChild(path);
            return svg;
        },

        getYouTubeVideoScreenshotSVG() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('height', '24px');
            svg.setAttribute('viewBox', '0 -960 960 960');
            svg.setAttribute('width', '24px');
            svg.setAttribute('fill', '#e8eaed');
            
            // Add gradient definition
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'buttonGradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('style', 'stop-color:#f03');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('style', 'stop-color:#ff2791');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.appendChild(defs);
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M240-280h480L570-480 450-320l-90-120-120 160Zm-80 160q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z');
            
            svg.appendChild(path);
            return svg;
        },

        getVideoId() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('v') || window.location.pathname.split('/').pop();
        },

        getVideoTitle(callback) {
            const videoId = this.getVideoId();
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://exyezed.vercel.app/api/video/${videoId}`,
                onload: function(response) {
                    if (response.status === 200) {
                        const data = JSON.parse(response.responseText);
                        callback(data.title);
                    } else {
                        callback('YouTube Video');
                    }
                },
                onerror: function() {
                    callback('YouTube Video');
                }
            });
        },

        formatTime(time) {
            const date = new Date();
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const timeString = [
                Math.floor(time / 3600),
                Math.floor((time % 3600) / 60),
                Math.floor(time % 60)
            ].map(v => v.toString().padStart(2, '0')).join('-');
            return `${dateString} ${timeString}`;
        },

        async copyToClipboard(blob) {
            const clipboardItem = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([clipboardItem]);
        },

        downloadScreenshot(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Regular YouTube Video Functions
    const YouTubeEnhancerLoopScreenshotRegularVideo = {
        init() {
            this.insertLoopElement();
            this.insertScreenshotElement();
            this.addObserver();
            this.addContextMenuListener();
        },

        insertLoopElement() {
            const newButton = document.createElement('a');
            newButton.classList.add('ytp-button', 'YouTubeEnhancerLoopScreenshot-loop-button');
            newButton.title = 'Loop Video';
            newButton.appendChild(YouTubeEnhancerLoopScreenshotUtils.getYouTubeVideoLoopSVG());
            newButton.addEventListener('click', this.toggleLoopState);

            document.querySelector('div.ytp-left-controls').appendChild(newButton);
        },

        insertScreenshotElement() {
            const newButton = document.createElement('a');
            newButton.classList.add('ytp-button', 'YouTubeEnhancerLoopScreenshot-screenshot-button');
            newButton.title = 'Take Screenshot';
            newButton.appendChild(YouTubeEnhancerLoopScreenshotUtils.getYouTubeVideoScreenshotSVG());
            newButton.addEventListener('click', this.handleScreenshotClick);

            const loopButton = document.querySelector('.YouTubeEnhancerLoopScreenshot-loop-button');
            loopButton.parentNode.insertBefore(newButton, loopButton.nextSibling);
        },

        toggleLoopState() {
            const video = document.querySelector('video');
            video.loop = !video.loop;
            if (video.loop) video.play();

            YouTubeEnhancerLoopScreenshotRegularVideo.updateToggleControls();
        },

        updateToggleControls() {
            const youtubeVideoLoop = document.querySelector('.YouTubeEnhancerLoopScreenshot-loop-button');
            youtubeVideoLoop.classList.toggle('active');
            youtubeVideoLoop.setAttribute('title', this.isActive() ? 'Stop Looping' : 'Loop Video');
        },

        isActive() {
            const youtubeVideoLoop = document.querySelector('.YouTubeEnhancerLoopScreenshot-loop-button');
            return youtubeVideoLoop.classList.contains('active');
        },

        addObserver() {
            const video = document.querySelector('video');
            new MutationObserver((mutations) => {
                mutations.forEach(() => {
                    if ((video.getAttribute('loop') === null && this.isActive()) ||
                        (video.getAttribute('loop') !== null && !this.isActive())) this.updateToggleControls();
                });
            }).observe(video, { attributes: true, attributeFilter: ['loop'] });
        },

        addContextMenuListener() {
            const video = document.querySelector('video');
            video.addEventListener('contextmenu', () => {
                setTimeout(() => {
                    const checkbox = document.querySelector('[role=menuitemcheckbox]');
                    checkbox.setAttribute('aria-checked', this.isActive());
                    checkbox.addEventListener('click', this.toggleLoopState);
                }, 50);
            });
        },

        handleScreenshotClick(event) {
            const button = event.currentTarget;
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 100);

            YouTubeEnhancerLoopScreenshotRegularVideo.captureScreenshot();
        },

        captureScreenshot() {
            const player = document.querySelector('video');
            if (!player) return;

            const canvas = document.createElement("canvas");
            canvas.width = player.videoWidth;
            canvas.height = player.videoHeight;
            canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);

            YouTubeEnhancerLoopScreenshotUtils.getVideoTitle((title) => {
                const time = player.currentTime;
                const filename = `${title} ${YouTubeEnhancerLoopScreenshotUtils.formatTime(time)}.${YouTubeEnhancerLoopScreenshotConfig.extension}`;

                canvas.toBlob(async (blob) => {
                    if (YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 1 || YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 2) {
                        await YouTubeEnhancerLoopScreenshotUtils.copyToClipboard(blob);
                    }
                    if (YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 0 || YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 2) {
                        YouTubeEnhancerLoopScreenshotUtils.downloadScreenshot(blob, filename);
                    }
                }, `image/${YouTubeEnhancerLoopScreenshotConfig.screenshotFormat}`);
            });
        }
    };

    // YouTube Shorts Functions
    const YouTubeEnhancerLoopScreenshotShorts = {
        init() {
            this.insertScreenshotElement();
        },

        insertScreenshotElement() {
            const shortsContainer = document.querySelector('ytd-reel-video-renderer[is-active] #actions');
            if (shortsContainer && !shortsContainer.querySelector('.YouTubeEnhancerLoopScreenshot-shorts-screenshot-button')) {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'YouTubeEnhancerLoopScreenshot-shorts-screenshot-button';

                const iconSpan = document.createElement('span');
                iconSpan.className = 'material-symbols-outlined';
                iconSpan.textContent = 

 'photo_camera_back';

                iconDiv.appendChild(iconSpan);
                
                const customShortsIcon = shortsContainer.querySelector('#custom-shorts-icon');
                if (customShortsIcon) {
                    customShortsIcon.parentNode.insertBefore(iconDiv, customShortsIcon);
                } else {
                    shortsContainer.insertBefore(iconDiv, shortsContainer.firstChild);
                }

                iconDiv.addEventListener('click', () => this.captureScreenshot());
            }
        },

        captureScreenshot() {
            const player = document.querySelector('ytd-reel-video-renderer[is-active] video');
            if (!player) return;

            const canvas = document.createElement("canvas");
            canvas.width = player.videoWidth;
            canvas.height = player.videoHeight;
            canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);

            YouTubeEnhancerLoopScreenshotUtils.getVideoTitle((title) => {
                const time = player.currentTime;
                const filename = `${title} ${YouTubeEnhancerLoopScreenshotUtils.formatTime(time)}.${YouTubeEnhancerLoopScreenshotConfig.extension}`;

                canvas.toBlob(async (blob) => {
                    if (YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 1 || YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 2) {
                        await YouTubeEnhancerLoopScreenshotUtils.copyToClipboard(blob);
                    }
                    if (YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 0 || YouTubeEnhancerLoopScreenshotConfig.screenshotFunctionality === 2) {
                        YouTubeEnhancerLoopScreenshotUtils.downloadScreenshot(blob, filename);
                    }
                }, `image/${YouTubeEnhancerLoopScreenshotConfig.screenshotFormat}`);
            });
        }
    };

    // Theme Functions
    const YouTubeEnhancerLoopScreenshotTheme = {
        init() {
            this.updateStyles();
            this.addObserver();
        },

        updateStyles() {
            const isDarkTheme = document.documentElement.hasAttribute('dark');
            document.documentElement.classList.toggle('dark-theme', isDarkTheme);
        },

        addObserver() {
            const observer = new MutationObserver(this.updateStyles);
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['dark']
            });
        }
    };

    // Main Initialization
    function YouTubeEnhancerLoopScreenshotInit() {
        YouTubeEnhancerLoopScreenshotUtils.addStyle(YouTubeEnhancerLoopScreenshotCSS);
        setTimeout(YouTubeEnhancerLoopScreenshotVideoElementPresent() ? YouTubeEnhancerLoopScreenshotInitializeFeatures : YouTubeEnhancerLoopScreenshotInit, 500);
    }

    function YouTubeEnhancerLoopScreenshotVideoElementPresent() {
        return document.querySelector('video') !== null;
    }

    function YouTubeEnhancerLoopScreenshotInitializeFeatures() {
        YouTubeEnhancerLoopScreenshotRegularVideo.init();
        YouTubeEnhancerLoopScreenshotTheme.init();
        YouTubeEnhancerLoopScreenshotInitializeShortsFeatures();
    }

    function YouTubeEnhancerLoopScreenshotInitializeShortsFeatures() {
        if (window.location.pathname.includes('/shorts/')) {
            setTimeout(YouTubeEnhancerLoopScreenshotShorts.init.bind(YouTubeEnhancerLoopScreenshotShorts), 500);
        }
    }

    // Observers and Event Listeners
    const YouTubeEnhancerLoopScreenshotShortsObserver = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                YouTubeEnhancerLoopScreenshotInitializeShortsFeatures();
            }
        }
    });

    YouTubeEnhancerLoopScreenshotShortsObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('yt-navigate-finish', YouTubeEnhancerLoopScreenshotInitializeShortsFeatures);

    document.addEventListener('yt-action', function(event) {
        if (event.detail && event.detail.actionName === 'yt-reload-continuation-items-command') {
            YouTubeEnhancerLoopScreenshotInitializeShortsFeatures();
        }
    });

    // Initialize
    YouTubeEnhancerLoopScreenshotInit();
    console.log('YouTubeEnhancerLoopScreenshot: Enjoy the awesome music and capture your favorite moments!');
})();