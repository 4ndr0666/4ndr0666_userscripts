// ==UserScript==
// @name        4ndr0666 universal downloader
// @namespace   https://github.com/4ndr0666
// @description Gather all images and detect M3U8 videos from any page, on command
// @license     MIT
// @license     Public domain / no rights reserved
// @include     *
// @version     2.0
// @noframes
// @grant       GM_registerMenuCommand
// @grant       GM_addStyle
// @run-at      document-end
// ==/UserScript==

(function() {
    'use strict';

    // Add necessary styles
    GM_addStyle(`
        .flex-container {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .copy-link {
            max-width: 200px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin-left: 10px;
            cursor: pointer;
            color: blue;
        }
        .info {
            margin-left: 10px;
        }
        .download-btn {
            margin-left: 10px;
            cursor: pointer;
            color: green;
        }
        .m3u8-container {
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 1px solid black;
            padding: 10px;
            z-index: 10000;
        }
        .scraped a {
            color: #1BA;
        }
        .scraped a:visited {
            color: #A1A;
        }
    `);

    // Function to copy text to clipboard
    function copyTextToClipboard(text) {
        const copyFrom = document.createElement("textarea");
        copyFrom.textContent = text;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        copyFrom.blur();
        document.body.removeChild(copyFrom);
        alert('Link copied to clipboard');
    }

    // Function to handle M3U8 links
    function handleM3U8Links(url) {
        const container = document.querySelector('.m3u8-container') || createContainer();

        const item = document.createElement('div');
        item.className = 'flex-container';
        item.innerHTML = `
            <span class="copy-link" title="${url}">${url}</span>
            <span class="info">Detected M3U8</span>
            <span class="download-btn">下载 (Download)</span>
        `;

        item.querySelector('.copy-link').addEventListener('click', function() {
            copyTextToClipboard(url);
        });

        item.querySelector('.download-btn').addEventListener('click', function() {
            window.open(url, '_blank');
        });

        container.appendChild(item);
    }

    // Function to create the main container for M3U8 links
    function createContainer() {
        const container = document.createElement('div');
        container.className = 'm3u8-container';
        document.body.appendChild(container);
        return container;
    }

    // Improved network request handling to mitigate 403 errors
    function fetchM3U8Content(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': navigator.userAgent,
                'Referer': document.location.href
            },
            onload: function(response) {
                if (response.status === 200) {
                    callback(response.responseText);
                } else {
                    console.error('Failed to fetch M3U8 content:', response.status, response.statusText);
                }
            },
            onerror: function(err) {
                console.error('Network error:', err);
            }
        });
    }

    function handleM3U8Response(url) {
        fetchM3U8Content(url, function(content) {
            // Process M3U8 content here if needed
            handleM3U8Links(url);
        });
    }

    // Updated function to check for M3U8 links with improved error handling
    function checkForM3U8Links() {
        const links = document.querySelectorAll('a[href*=".m3u8"], video[src*=".m3u8"]');
        links.forEach(link => {
            const url = link.href || link.src;
            handleM3U8Response(url);
        });
    }

    // Initial check for M3U8 links
    checkForM3U8Links();

    // Observer to watch for new nodes
    const observer = new MutationObserver(checkForM3U8Links);
    observer.observe(document.body, { childList: true, subtree: true });

    // Function to show image and video links
    function show_links() {
        const links = get_links();
        let block = '<style> .scraped a { color: #1BA; } .scraped a:visited { color: #A1A; } </style>';
        links.reverse();
        block += "<span class='scraped'>";
        for (let n = 0; n < links.length; n++) {
            if (n !== 0 && n % 10 === 0) { block += "<br>"; }
            block += `${n} <a class='universal' href='${links[n]}'>${links[n]}</a> <br>\n`;
        }
        block += "</span>";
        document.body.innerHTML = block + document.body.innerHTML;
    }

    // Function to gather image and video links
    function get_links() {
        let urls = Array.from(document.getElementsByTagName('a')).map(v => v.href);
        urls = urls.concat(Array.from(document.getElementsByTagName('meta')).map(v => v.content));
        urls = urls.concat(Array.from(document.getElementsByTagName('img')).map(v => v.src));
        urls = urls.concat(Array.from(document.getElementsByTagName('video')).map(v => v.src));
        urls = urls.concat(Array.from(document.getElementsByTagName('source')).map(v => v.src));

        const whitelist = [".jpg", ".jpeg", ".png", ".gif", ".mp3", ".mp4", "en/artworks/", "/s/", "/view/", "s=view", "/pictures/", "/post/show/", "/posts/", "/art/", "/artworks/", "/picture.php", "artstation.com/projects/", "/art/view/"];
        urls = urls.filter(u => whitelist.some(w => u.includes(w)));

        urls = Array.from(new Set(urls));
        urls.push('----- ----- ----- ----- ----- ----- -----');
        return urls.concat(urls.reverse());
    }

    // Register menu command
    GM_registerMenuCommand("Link all images at top of page", show_links);

    // Add a button to trigger the scraping
    const trigger = document.createElement('button');
    trigger.style = "position: absolute; width: 90px; height: 30px; left:-85px; top: 5px; background-color:#303020; text-align: center; display: inline-block; border:1px solid #8080A0; cursor:pointer; line-height: 20px; color:#8080A0; font-family:Arial; font-size:10px; text-decoration:none; z-index: 1000000; overflow:hidden;";
    trigger.innerText = "Link all images";
    trigger.title = "Link all images at top of page";
    trigger.className = "ezas_unclicked_button";
    trigger.onclick = function() {
        this.style = 'display:none;';
        this.className = 'ezas_clicked_button';
        show_links();
    };
    document.body.appendChild(trigger);

    // Interval to check if button was clicked
    const button_check = document.getElementsByClassName('ezas_clicked_button');
    const fake_event = setInterval(function() {
        if (button_check.length > 0) {
            clearInterval(fake_event);
            show_links();
        }
    }, 500);

    // Handle scrollHeight error
    document.addEventListener('DOMContentLoaded', function() {
        const element = document.documentElement || document.body;
        if (element) {
            console.log('Scroll height:', element.scrollHeight);
        } else {
            console.error('Element does not exist');
        }
    });

})();
