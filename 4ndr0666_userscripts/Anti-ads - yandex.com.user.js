// ==UserScript==
// @name        Anti-ads - yandex.com
// @namespace   Violentmonkey Scripts
// @match       https://disk.yandex.com/*
// @grant       none
// @version     1.0.2
// @description Remove the porn and hot dates ads from Yandex Disk
// @require     https://code.jquery.com/jquery-3.5.1.slim.min.js
// @license     MIT
// ==/UserScript==

(function() {
  "use strict";
  $(document).ready(function() {
    function remover() {
      if($(".direct.root__bottom-ad").length > 0){
        $(".direct.root__bottom-ad").remove();
      }
    }
    setTimeout(remover, 200);
    setInterval(remover, 500);
  });
})();