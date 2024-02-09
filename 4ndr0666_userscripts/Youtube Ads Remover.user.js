// ==UserScript==
// @name        Youtube Ads Remover
// @namespace   http://none.com
// @description Removes Youtube Ads and other unwanted layers from Playing Videos
// @include         http://www.youtube.com/*
// @include         https://www.youtube.com/*
// @include         http://youtube.com/*
// @include         https://youtube.com/*
// @include         http://apis.google.com/*/widget/render/comments?*
// @include         https://apis.google.com/*/widget/render/comments?*
// @include         http://plus.googleapis.com/*/widget/render/comments?*
// @include         https://plus.googleapis.com/*/widget/render/comments?*
// @version     1
// @grant       none
// ==/UserScript==
// check if youtube video page is opened
var loopTime = 1000; // check for annotations interval in milliseconds
if (document.location.href.indexOf('v=') > 0) {
  // hide annotations  
  var hideAnnotations = function () {
    var ans = document.querySelectorAll('[class^=annotation]');
    for (var i = 0; i < ans.length; i++) {
      var an = ans[i];
      an.style.visibility = 'hidden';
    }
  }
  // contionous loop that hides annotations

  var hideAnnotationsLoop = function () {
    hideAnnotations();
    setTimeout(hideAnnotationsLoop, loopTime);
  }
  //init continuous loop

  hideAnnotationsLoop();
}
