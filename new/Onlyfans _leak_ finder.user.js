// ==UserScript==
// @name         Onlyfans "leak" finder
// @namespace    http://tampermonkey.net/
// @version      0.8.1
// @description  Checks some sites for OF "leaks"
// @author       You
// @match        https://onlyfans.com/*
// @match        *coomer.su/*
// @match        *fapello.com/*
// @match        https://fansly.com/*
// @match        https://fantrie.com/*
// @match        *topfapgirls1.com/*
// @grant        GM.xmlHttpRequest
// @license      Unlicense
// @downloadURL https://update.sleazyfork.org/scripts/493657/Onlyfans%20%22leak%22%20finder.user.js
// @updateURL https://update.sleazyfork.org/scripts/493657/Onlyfans%20%22leak%22%20finder.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const MAX_RETRIES = 5;

    function getUsernameFromUrl() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        if (hostname === 'onlyfans.com' || hostname === 'fantrie.com') {
            return pathname.split('/')[1];
        }

        if (hostname === 'fansly.com') {
            const matches = pathname.match(/^\/([^/]+)/);
            return matches ? matches[1] : '';
        }

        return '';
    }

    function createRequest(url, onSuccess, onError, retryCount = 0) {
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            onload(response) {
                if (response.status === 200) {
                    onSuccess(response);
                } else if (retryCount < MAX_RETRIES) {
                    console.log(`Retrying... Attempt ${retryCount + 1}`);
                    setTimeout(() => createRequest(url, onSuccess, onError, retryCount + 1), 1000);
                } else {
                    console.error('Max retry attempts reached');
                    onError(response);
                }
            },
            onerror: onError,
        });
    }

    function fetchUserProfileFansly(username) {
        const apiUrl = `https://apiv3.fansly.com/api/v1/account?usernames=${username}`;

        createRequest(
            apiUrl,
            (response) => {
                const data = JSON.parse(response.responseText);
                if (data.success && data.response.length > 0) {
                    const id = data.response[0].id;
                    fetchUserProfileCoomer(id, 'fansly');
                } else {
                    console.log(`User ${username} not found`);
                }
            },
            (error) => console.error('Error fetching Fansly profile:', error)
        );
    }

    function fetchUserProfileCoomer(username, service) {
        const apiUrl = `https://coomer.su/api/v1/${service}/user/${username}/profile`;

        createRequest(
            apiUrl,
            () => {
                const profileUrl = `https://coomer.su/${service}/user/${username}`;
                addLinkToMenu(profileUrl, 'Coomer.su');
            },
            (error) => console.error('Error fetching Coomer profile:', error)
        );
    }

    function fetchUserProfileFapello(username) {
        const apiUrl = `https://fapello.com/${username}/`;

        createRequest(
            apiUrl,
            (response) => {
                if (response.finalUrl === apiUrl) {
                    addLinkToMenu(apiUrl, 'Fapello');
                } else {
                    console.log('Request was redirected');
                }
            },
            (error) => console.error('Error fetching Fapello profile:', error)
        );
    }

    function fetchUserProfileLeakNudes(username) {
        const apiUrl = `https://leaknudes.com/model/${username}`;

        createRequest(
            apiUrl,
            (response) => {
                if (response.finalUrl === apiUrl) {
                    addLinkToMenu(apiUrl, 'LeakNudes');
                } else {
                    console.log('Request was redirected');
                }
            },
            (error) => console.error('Error fetching LeakNudes profile:', error)
        );
    }

    function fetchUserProfileTopFapGirls(username) {
        const searchUrl = `https://www.topfapgirls1.com/search/?q=${username}`;

        createRequest(
            searchUrl,
            (response) => {
                console.log(response.status)
                console.log(searchUrl)
                if (response.status === 200 && !response.finalUrl.includes("?q=")) {
                    console.log(response.finalUrl)
                    addLinkToMenu(response.finalUrl, 'TopFapGirls1');
                } else {
                    console.log('User not found on TopFapGirls1');
                }
            },
            (error) => console.error('Error fetching TopFapGirls1 profile:', error)
        );
    }

    function addLinkToMenu(link, displayText) {
        const hostname = window.location.hostname;

        const createAnchorElement = (link, text) => {
            const aElement = document.createElement('a');
            aElement.href = link;
            aElement.textContent = text;
            aElement.style.cssText = `
                display: inline-block;
                padding: 8px 12px;
                margin: 4px 0;
                height: 1.8em;
                margin: 3.5em 0.25em 0 0.25em;
                background-color: #007bff;
                color: white;
                text-align: center;
                border-radius: 4px;
                text-decoration: none;
                font-size: 14px;
            `;
            return aElement;
        };

        if (hostname === 'fansly.com') {
            const followButton = document.querySelector('.follow-profile');
            if (followButton) {
                const newMenuElement = followButton.cloneNode(false);
                newMenuElement.textContent = displayText;

                const aElement = createAnchorElement(link, '');
                aElement.appendChild(newMenuElement);

                followButton.after(aElement);
            } else {
                console.error('Follow button not found');
            }
        } else if (hostname === 'fantrie.com') {
            const menuElement = document.querySelectorAll('.left-menus')[1];
            if (menuElement) {
                menuElement.appendChild(createAnchorElement(link, displayText));
            } else {
                console.error('Left menus element not found');
            }
        } else {
            const menuElement = document.querySelector('.l-header__menu.m-native-custom-scrollbar.m-scrollbar-y.m-invisible-scrollbar');
            if (menuElement) {
                const aElement = createAnchorElement(link, displayText);
                aElement.style.marginRight = '10px';

                if (menuElement.querySelectorAll('a').length > 0) {
                    menuElement.appendChild(document.createElement('br'));
                }

                menuElement.appendChild(aElement);
            } else {
                console.error('Menu element not found');
            }
        }
    }

    function waitForElement(selector, callback) {
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                callback(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    const username = getUsernameFromUrl();

    if (username) {
        const hostname = window.location.hostname;
        if (hostname === 'fansly.com') {
            waitForElement('.profile-details', () => {
                fetchUserProfileFansly(username);
                fetchUserProfileFapello(username);
                fetchUserProfileLeakNudes(username);
                fetchUserProfileTopFapGirls(username);
                if (username.includes('_')) {
                    fetchUserProfileFapello(username.replace(/_/g, '-'));
                }
                const instaElement = document.querySelector(".icon-container.instagram").parentNode
                if(instaElement){
                    const instaHandle = instaElement.href.match(/https:\/\/instagram\.com\/(.+)/)[1];
                    fetchUserProfileTopFapGirls(instaHandle);
                    fetchUserProfileFapello(instaHandle);
                }
            });
        } else if (hostname === 'fantrie.com') {
            waitForElement('.left-menus', () => {
                fetchUserProfileFapello(username);
                fetchUserProfileLeakNudes(username);
                fetchUserProfileTopFapGirls(username);
            });
        } else {
            waitForElement('.l-header__menu.m-native-custom-scrollbar.m-scrollbar-y.m-invisible-scrollbar', () => {
                fetchUserProfileCoomer(username, 'onlyfans');
                fetchUserProfileFapello(username);
                fetchUserProfileLeakNudes(username);
                fetchUserProfileTopFapGirls(username);
                if (username.includes('_')) {
                    fetchUserProfileFapello(username.replace(/_/g, '-'));
                }
            });
        }
    }
})();
