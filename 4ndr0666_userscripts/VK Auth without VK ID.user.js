// ==UserScript==
// @name         VK Auth without VK ID
// @version      1.0
// @description  Authorization in VK without VK ID
// @author       vk.com/kizzn
// @match        *://id.vk.com/auth
// @match        *://id.vk.com/auth*
// @run-at       document-start
// @grant        none
// ==/UserScript==

location.href = location.protocol + "//vk.com/login?classic_flow=1";
