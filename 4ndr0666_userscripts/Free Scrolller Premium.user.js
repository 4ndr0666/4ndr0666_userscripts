// ==UserScript==
// @name         Free Scrolller Premium
// @namespace    https://greasyfork.org/en/scripts/441857-free-scrolller-premium
// @version      0.3.8
// @description  Gives you access to Scrolller Premium features for free.
// @author       NPC Tim
// @match        *://scrolller.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scrolller.com
// @grant        none
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/441857/Free%20Scrolller%20Premium.user.js
// @updateURL https://update.greasyfork.org/scripts/441857/Free%20Scrolller%20Premium.meta.js
// ==/UserScript==

(function() {
    'use strict';
    
    // When mouse moves search for all of the available download buttons by executing the 'download()' function.
    document.addEventListener('mousemove', download);
    
    // Iterate through the 'querySelectorAll' nodelist and add event listener to each names so if any 'Download' button is clicked then 'clickedDownload()' executes.
    // Log 'no download button found.' to the console if 'querySelectorAll' nodelist is empty.
    function download() {
        try {
            let download_buttons = document.querySelectorAll('[title="Download"]');
            download_buttons.forEach(function(download_button) {
                if(download_button.getAttribute('listener') !== 'true') {
                    download_button.setAttribute('listener', 'true');
                    download_button.addEventListener('click', function() {
                        clicked_download(download_button);
                    });
                }
            })
        }
        catch(err) {
            console.log('No download button found.');
        }
    }
    
    async function clicked_download(download_button) {
        // Gets download link for image/video when zoomed out.
        try {
            try {
                // Video download link.
                let download_link = download_button.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('vertical-view__media')[0].getElementsByClassName('vertical-view__media')[0].getElementsByTagName('source')[0].getAttribute('src');
                try {
                    let blob = await fetch(download_link).then(r => r.blob());
                    let local_URL = URL.createObjectURL(blob);
                    let auto_download = document.createElement('a');
                    auto_download.setAttribute('href', local_URL);
                    auto_download.setAttribute('visibility', 'hidden');
                    auto_download.setAttribute('download', blob.size);
                    document.body.append(auto_download);
                    auto_download.click();
                    auto_download.remove();
                }
                catch(err) {
                    window.open(download_link, '_blank');
                }
            }
            catch(err) {
                // Image download link.
                let download_links = download_button.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('vertical-view__media')[0].getAttribute('srcset');
                let http_index = download_links.lastIndexOf('https');
                let jpg_index = download_links.lastIndexOf('jpg') + 4;
                let download_link = download_links.substring(http_index, jpg_index);
                try {
                    let blob = await fetch(download_link).then(r => r.blob());
                    let local_URL = URL.createObjectURL(blob);
                    let auto_download = document.createElement('a');
                    auto_download.setAttribute('href', local_URL);
                    auto_download.setAttribute('visibility', 'hidden');
                    auto_download.setAttribute('download', blob.size);
                    document.body.append(auto_download);
                    auto_download.click();
                    auto_download.remove();
                }
                catch(err) {
                    window.open(download_link, '_blank');
                }
            }
        }
        // Gets download link for image/video when zoomed in.
        catch(err) {
            try {
                // video download link.
                let download_link = download_button.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('fullscreen-view__media')[0].getElementsByClassName('fullscreen-view__media')[0].getElementsByTagName('source')[0].getAttribute('src');
                try {
                    let blob = await fetch(download_link).then(r => r.blob());
                    let local_URL = URL.createObjectURL(blob);
                    let auto_download = document.createElement('a');
                    auto_download.setAttribute('href', local_URL);
                    auto_download.setAttribute('visibility', 'hidden');
                    auto_download.setAttribute('download', blob.size);
                    document.body.append(auto_download);
                    auto_download.click();
                    auto_download.remove();
                }
                catch(err) {
                    window.open(download_link, '_blank');
                }
            }
            catch(err) {
                // Image download link.
                let download_links = download_button.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('fullscreen-view__media')[0].getAttribute('srcset');
                let http_index = download_links.lastIndexOf('https');
                let jpg_index = download_links.lastIndexOf('jpg') + 4;
                let download_link = download_links.substring(http_index, jpg_index);
                try {
                    let blob = await fetch(download_link).then(r => r.blob());
                    let local_URL = URL.createObjectURL(blob);
                    let auto_download = document.createElement('a');
                    auto_download.setAttribute('href', local_URL);
                    auto_download.setAttribute('visibility', 'hidden');
                    auto_download.setAttribute('download', blob.size);
                    document.body.append(auto_download);
                    auto_download.click();
                    auto_download.remove();
                }
                catch(err) {
                    window.open(download_link, '_blank');
                }
            }
        }
    }
            
            // Check if the premium-only feature prompt is loaded every second. if it is, then remove prompt.
            let prompt_1 = document.getElementsByClassName("popup popup--sticky popup--animate popup--dark popup--zIndex");
            let prompt_2 = document.getElementsByClassName("popup popup--sticky popup--animate popup--light popup--zIndex");
            let prompt_3 = document.getElementsByClassName("popup popup--sticky popup--dark popup--zIndex");
            let prompt_interval = setInterval(function() {
                try {
                    prompt_1[0].remove();
                    prompt_2[0].remove();
                    prompt_3[0].remove();
                }
                catch(err) {
                }
            }, 1000);
            })();