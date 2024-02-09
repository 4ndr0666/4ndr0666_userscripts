// ==UserScript==
// @name:en         Remove VK Connect banner
// @name            Блокировщик баннера VK Connect
// @namespace       http://tampermonkey.net/
// @version         0.1
// @description:en  removes VK Connect banner (doesn't freeze page, doesn't block other popups)
// @description     убирает баннер VK Connect (но не заставляет страницу зависать, не блокирует другие всплывающие окна)
// @author          Gushchin
// @match           *://vk.com/*
// @match           *://*.vk.com/*
// @license         GPLv3
// ==/UserScript==

function hideVkConnectBanner() {
    if (document.querySelectorAll('.vk_connect_policy')[0]) {
        boxQueue._boxes = [];
        curBox()._hide();
        _message_boxes = [];
    }
}

(function () { setInterval(hideVkConnectBanner, 500); })();