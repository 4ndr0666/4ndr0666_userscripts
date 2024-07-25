// ==UserScript==
// @name         Instagram Image Source and Search
// @namespace    instagram_search
// @version      0.3.6
// @description  Adds buttons for simple image saving and searching in Instagram
// @homepageURL  https://github.com/0xC0FFEEC0DE/instagram-source-image
// @supportURL   https://github.com/0xC0FFEEC0DE/instagram-source-image/issues
// @downloadURL  https://raw.githubusercontent.com/0xC0FFEEC0DE/instagram-source-image/master/instagram-source-image.user.js
// @updateURL    https://raw.githubusercontent.com/0xC0FFEEC0DE/instagram-source-image/master/instagram-source-image.user.js
// @author       0xC0FFEEC0DE
// @include      https://*.instagram.com/*
// @license      MIT
// ==/UserScript==
//Search icon made by Smashicons from www.flaticon.com, Google icon made by SimpleIcon from www.flaticon.com, Camera icon by Gregor Cresnar from www.flaticon.com

(function() {
'use strict';

const SEARCH_ICON = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2Ljk2NiA1Ni45NjYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDU2Ljk2NiA1Ni45NjY7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4Ij4KPHBhdGggZD0iTTU1LjE0Niw1MS44ODdMNDEuNTg4LDM3Ljc4NmMzLjQ4Ni00LjE0NCw1LjM5Ni05LjM1OCw1LjM5Ni0xNC43ODZjMC0xMi42ODItMTAuMzE4LTIzLTIzLTIzcy0yMywxMC4zMTgtMjMsMjMgIHMxMC4zMTgsMjMsMjMsMjNjNC43NjEsMCw5LjI5OC0xLjQzNiwxMy4xNzctNC4xNjJsMTMuNjYxLDE0LjIwOGMwLjU3MSwwLjU5MywxLjMzOSwwLjkyLDIuMTYyLDAuOTIgIGMwLjc3OSwwLDEuNTE4LTAuMjk3LDIuMDc5LTAuODM3QzU2LjI1NSw1NC45ODIsNTYuMjkzLDUzLjA4LDU1LjE0Niw1MS44ODd6IE0yMy45ODQsNmM5LjM3NCwwLDE3LDcuNjI2LDE3LDE3cy03LjYyNiwxNy0xNywxNyAgcy0xNy03LjYyNi0xNy0xN1MxNC42MSw2LDIzLjk4NCw2eiIgZmlsbD0iIzAwMDAwMCIvPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K';
const GOOGLE_ICON = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDkwIDkwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA5MCA5MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGlkPSJHb29nbGUiIGQ9Ik03NC40OTksMEg1MC4xNDRjLTYuMzgyLDAtMTQuNDIxLDAuOTQyLTIxLjE1OCw2LjQ5Yy01LjA5LDQuMzc0LTcuNTY2LDEwLjM5Mi03LjU2NiwxNS44MjggICBjMCw5LjIxMSw3LjA5NCwxOC41NDYsMTkuNjI1LDE4LjU0NmMxLjE4MiwwLDIuNDc3LTAuMTIsMy43ODctMC4yMzVjLTAuNTkyLDEuNDEzLTEuMTg5LDIuNTk0LTEuMTg5LDQuNjA1ICAgYzAsMy42NjIsMS44OTMsNS45MDIsMy41NDcsOC4wMjljLTUuMzE0LDAuMzUzLTE1LjI0OSwwLjk0Mi0yMi41ODMsNS40MjhjLTYuOTc1LDQuMTQzLTkuMTA3LDEwLjE2LTkuMTA3LDE0LjQxNCAgIEMxNS40OTksODEuODQ2LDIzLjc3OCw5MCw0MC45MjMsOTBjMjAuMzM2LDAsMzEuMDk4LTExLjIyLDMxLjA5OC0yMi4zM2MwLTguMTQzLTQuNzI5LTEyLjE2NC05LjkzMi0xNi41MzRsLTQuMjU4LTMuMzA1ICAgYy0xLjI5NS0xLjA2NS0zLjA2OC0yLjQ3OS0zLjA2OC01LjA4YzAtMi41OTcsMS43NzMtNC4yNTQsMy4zMDctNS43ODljNC45NjQtMy44OTYsOS45MzMtOC4wMyw5LjkzMy0xNi43NyAgIGMwLTguOTc5LTUuNjgtMTMuNzA0LTguMzk2LTE1Ljk0N2g3LjMzNEw3NC40OTksMHogTTY0LjEwMyw3Mi4yNzljMCw3LjMyMi02LjAzMywxMi43NTMtMTcuMzg1LDEyLjc1MyAgIGMtMTIuNjQ4LDAtMjAuODA5LTYuMDI0LTIwLjgwOS0xNC40MDVjMC04LjM5Myw3LjU2OC0xMS4yMTgsMTAuMTY2LTEyLjE2NGM0Ljk2OS0xLjY1NiwxMS4zNTItMS44OTEsMTIuNDE0LTEuODkxICAgYzEuMTg0LDAsMS43NzUsMCwyLjcyNSwwLjExNUM2MC4yMDIsNjMuMDY0LDY0LjEwMyw2Ni4yNTcsNjQuMTAzLDcyLjI3OXogTTU0LjY0MiwzNC4yNDljLTEuODkzLDEuODg2LTUuMDg4LDMuMzA1LTguMDQ1LDMuMzA1ICAgYy0xMC4xNjQsMC0xNC43NzItMTMuMTEzLTE0Ljc3Mi0yMS4wMjNjMC0zLjA3MiwwLjU5Mi02LjI1OCwyLjU5OC04Ljc0YzEuODkzLTIuMzYyLDUuMjAxLTMuODk5LDguMjc3LTMuODk5ICAgYzkuODEyLDAsMTQuODk5LDEzLjIyOSwxNC44OTksMjEuNzNDNTcuNTk5LDI3Ljc1Miw1Ny4zNTgsMzEuNTI4LDU0LjY0MiwzNC4yNDl6IiBmaWxsPSIjMDAwMDAwIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==';
const SCREENSHOT_ICON = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ5MCA0OTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MCA0OTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMCwxNjcuODV2MjE2LjJjMCwzMywyNi44LDU5LjgsNTkuOCw1OS44aDM3MC40YzMzLDAsNTkuOC0yNi44LDU5LjgtNTkuOHYtMjE2LjJjMC0zMS40LTI1LjUtNTYuOS01Ni45LTU2LjloLTc5LjYgICAgbC0xLjktOC4zYy03LjctMzMuMy0zNy01Ni41LTcxLjItNTYuNWgtNzAuOWMtMzQuMSwwLTYzLjQsMjMuMi03MS4yLDU2LjVsLTEuOSw4LjNINTYuOUMyNS41LDExMC45NSwwLDEzNi41NSwwLDE2Ny44NXogICAgIE0xNDYuMiwxMzUuNDVjNS43LDAsMTAuNi0zLjksMTEuOS05LjVsNC4xLTE3LjhjNS4yLTIyLjEsMjQuNi0zNy41LDQ3LjMtMzcuNWg3MC45YzIyLjcsMCw0Mi4xLDE1LjQsNDcuMywzNy41bDQuMSwxNy44ICAgIGMxLjMsNS41LDYuMiw5LjUsMTEuOSw5LjVINDMzYzE3LjksMCwzMi40LDE0LjUsMzIuNCwzMi40djIxNi4yYzAsMTkuNS0xNS44LDM1LjMtMzUuMywzNS4zSDU5LjhjLTE5LjUsMC0zNS4zLTE1LjgtMzUuMy0zNS4zICAgIHYtMjE2LjJjMC0xNy45LDE0LjUtMzIuNCwzMi40LTMyLjRIMTQ2LjJ6IiBmaWxsPSIjMDAwMDAwIi8+CgkJPGNpcmNsZSBjeD0iODIuOSIgY3k9IjE4Ny43NSIgcj0iMTYuNCIgZmlsbD0iIzAwMDAwMCIvPgoJCTxwYXRoIGQ9Ik0yNDUsMzgwLjk1YzU2LjcsMCwxMDIuOS00Ni4yLDEwMi45LTEwMi45cy00Ni4yLTEwMi45LTEwMi45LTEwMi45cy0xMDIuOSw0Ni4xLTEwMi45LDEwMi45UzE4OC4zLDM4MC45NSwyNDUsMzgwLjk1eiAgICAgTTI0NSwxOTkuNjVjNDMuMiwwLDc4LjQsMzUuMiw3OC40LDc4LjRzLTM1LjIsNzguNC03OC40LDc4LjRzLTc4LjQtMzUuMi03OC40LTc4LjRTMjAxLjgsMTk5LjY1LDI0NSwxOTkuNjV6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==';

const sourceBtnClass = 'source_button';
const googleBtnClass = 'google_source_button';
const screenBtnClass = 'screenshot_button';

const footerPanelID = 'footerPanel';

const galleryClass = 'XCodT';

let firstArticles = document.querySelectorAll('article');
firstArticles.forEach(article => {
    let gallery = article.querySelector(`.${galleryClass}`);
    if (gallery) {
        processGallery(article);
        return;
    }

    let img = article.querySelector('img[srcset]');
    if (img) {
        let src = extractUrlFromSet(img.srcset);
        addButtons(article, src, src);
        return;
    }

    let video = article.querySelector('video');

    if (video) {
        let article = video.closest('article');

        if (article) {
            addButtons(article, video.src, video.poster);
        }
    }
});

let imageObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        //  console.log(mutation);
        let img = mutation.target;
        let article = img.closest('article');
        if (img.closest('ul.YlNGR')) { // img is in gallery
            processGallery(article);
            return;
        }

        if (article) {
            let src = extractUrlFromSet(img.srcset);
            addButtons(article, src, src);
        }
    });
}).observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['srcset'],
});

function processGallery(article) {
    let div = article.querySelector(`.${galleryClass}`);
    let galleryCursor = [...div.parentElement.children].indexOf(div);
    let li = article.querySelectorAll('ul.YlNGR li')[galleryCursor];
    let img = li.querySelector('img[srcset]');
    if (img) {
        let src = extractUrlFromSet(img.srcset);
        addButtons(article, src, src);
    }
}

let galleryObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        let div = mutation.target;
        if (div.classList.contains(galleryClass)) {
            let article = div.closest('article');
            processGallery(article);
        }
    });
}).observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
});

let videoObserver = new MutationObserver(function(mutations) {
    mutations = Array.from(mutations);

    function videoClassCount(removedNodes) {
        return Array.from(removedNodes)
            .filter(node => node.classList && node.classList.contains('_8jZFn')).length;
    }

    let videoMutations = mutations
        .filter(m => m.removedNodes && videoClassCount(m.removedNodes) > 0);
    
    if(videoMutations.length === 0) return;

    videoMutations.forEach(m => {
        var video = m.previousSibling;
        if (video && video.tagName && video.tagName.toLowerCase() === 'video') {
            if (video.classList.contains('processed')) return;

            let playPromise = video.play();
            playPromise.then(() => {
                video.crossOrigin = 'anonymous';
                video.load();
                video.play();
            });

            video.classList.add('processed');

            let article = video.closest('article');
            if (article) {
                addButtons(article, video.src, video.poster, /*screenBtn:*/ true);
            }
        }
    });
}).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
});

function addButtons(article, src, googleLink, isScreenBtnNeed) {
    let menuBar = article.querySelector('.ltpMr.Slqrh'); // xD
    if (!menuBar) {
        //return console.log("no menu in this article");
        return;
    }

    addSourceButton(menuBar, src);
    addGoogleButton(menuBar, googleLink);
    addScreenButton(article, menuBar, isScreenBtnNeed);
}

function addScreenButton(article, menuBar, isScreenBtnNeed) {
    let existBtn = menuBar.querySelector(`.${screenBtnClass}`);
    if (existBtn) {
        existBtn.parentNode.removeChild(existBtn);
    }

    if (!isScreenBtnNeed) {
        return;
    }

    let screenBtn = document.createElement('button');
    screenBtn.title = 'Make screenshot';
    screenBtn.className += screenBtnClass;
    screenBtn.style.width = '24px';
    screenBtn.style.height = '24px';
    screenBtn.style.margin = '8px 0 8px 8px';
    screenBtn.style.backgroundImage = `url(data:image/svg+xml;utf8;base64,${SCREENSHOT_ICON})`;
    screenBtn.style['background-color'] = 'white';
    screenBtn.style.border = 'none';
    screenBtn.style.cursor = 'pointer';

    screenBtn.onclick = () => {
        let video = article.querySelector('video');

        let img;
        if (video.played.length === 0) {
            img = document.createElement('img');
            img.src = video.poster;
        } else {
            img = makeScreenshot(video);
        }

        let panel = document.getElementById(footerPanelID);
        if (!panel) {
            panel = createFooterPanel();
        }
        img.style.width = '230px';
        img.style.margin = '5px';
        panel.appendChild(img);
    };

    menuBar.appendChild(screenBtn);
}

function addSourceButton(menuBar, url) {
    let existBtn = menuBar.querySelector(`.${sourceBtnClass}`);
    if (existBtn) {
        existBtn.parentNode.removeChild(existBtn);
    }

    let sourceBtn = document.createElement('a');
    sourceBtn.target = '_blank';
    sourceBtn.title = 'Source';
    sourceBtn.className += sourceBtnClass;
    sourceBtn.style.width = '24px';
    sourceBtn.style.height = '24px';
    sourceBtn.style.margin = '8px 0 8px 10px';
    sourceBtn.style.backgroundImage = `url(data:image/svg+xml;utf8;base64,${SEARCH_ICON})`;
    sourceBtn.href = url;

    menuBar.appendChild(sourceBtn);
}

function addGoogleButton(menuBar, url) {
    let existBtn = menuBar.querySelector(`.${googleBtnClass}`);
    if (existBtn) {
        existBtn.parentNode.removeChild(existBtn);
    }

    let googleBtn = document.createElement('a');
    googleBtn.target = '_blank';
    googleBtn.title = 'Google it';
    googleBtn.className += googleBtnClass;
    googleBtn.style.width = '24px';
    googleBtn.style.height = '24px';
    googleBtn.style.margin = '8px 0 8px 8px';
    googleBtn.href = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(url)}`;
    googleBtn.style.backgroundImage = `url(data:image/svg+xml;utf8;base64,${GOOGLE_ICON})`;

    menuBar.appendChild(googleBtn);
}

function extractUrlFromSet(srcset) {
    let urls = srcset.split(',');
    return urls[urls.length - 1].split(' ')[0];
}

function createFooterPanel() {
    let panel = document.createElement('div');
    panel.id = footerPanelID;
    panel.style.position = 'fixed';
    panel.style.right = '4px';
    panel.style.bottom = 0;
    panel.style['background-color'] = '#21212121';
    panel.style['z-index'] = 42;

    let closeBtn = document.createElement('div');
    closeBtn.textContent = 'close';
    closeBtn.style.position = 'fixed';
    closeBtn.style.right = '250px';
    closeBtn.style.bottom = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style['z-index'] = 42;

    closeBtn.onclick = () => {
        panel.parentNode.removeChild(panel);
        closeBtn.parentNode.removeChild(closeBtn);
    };

    let body = document.querySelector('body');
    body.appendChild(panel);
    body.appendChild(closeBtn);
    return panel;
}

function makeScreenshot(video) {
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    var img = new Image();
    img.src = canvas.toDataURL('image/jpeg');

    return img;
}

})();
