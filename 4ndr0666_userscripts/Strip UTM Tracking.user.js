// ==UserScript==
// @name        Strip UTM Tracking
// @namespace   https://arantius.com/misc/greasemonkey/
// @description Remove "utm_" parameters from the query string, used by Google Analytics.
// @include     *?*utm*
// @version     1
// @grant       none
// @run-at      start
// ==/UserScript==

if (document.location.search) {
  var s = document.location.search.replace(/utm_[a-z]+=(.*?)(&|$)/g, '');
  if (s == '?') s = '';
  if (s != document.location.search) {
    var h = document.location.href.replace(/\?.*/, s);
    history.replaceState({}, document.title, h);
  }
}