// ==UserScript==
// @name          Blogger Content Warning Bypass
// @namespace     http://userstyles.org
// @description	  A user script to bypass Blogspot's Content Warning
// @include       http://blogspot.com/*
// @include       https://blogspot.com/*
// @include       http://*.blogspot.com/*
// @include       https://*.blogspot.com/*
// @run-at        document-start
// @version       1.0
// @downloadURL https://update.greasyfork.org/scripts/381732/Blogger%20Content%20Warning%20Bypass.user.js
// @updateURL https://update.greasyfork.org/scripts/381732/Blogger%20Content%20Warning%20Bypass.meta.js
// ==/UserScript==
(function() {var css = [
	"@namespace url(http://www.w3.org/1999/xhtml);",
	"iframe#injected-iframe[src*=\'blogin.g\']",
	"{ display: none !important; }",
	"",
	"body * { visibility: inherit !important; }"
].join("\n");
if (typeof GM_addStyle != "undefined") {
	GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
	PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
	addStyle(css);
} else {
	var node = document.createElement("style");
	node.type = "text/css";
	node.appendChild(document.createTextNode(css));
	var heads = document.getElementsByTagName("head");
	if (heads.length > 0) {
		heads[0].appendChild(node);
	} else {
		// no head yet, stick it whereever
		document.documentElement.appendChild(node);
	}
}
})();