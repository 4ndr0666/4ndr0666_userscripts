// ==UserScript==
// @name        Redgifs Embed Tweaks
// @namespace   https://greasyfork.org/pt-BR/users/821661
// @match       https://www.redgifs.com/ifr/*
// @grant       GM_registerMenuCommand
// @grant       GM_addElement
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @version     0.2.8
// @author      hdyzen
// @description tweaks redgifs embed/iframe video
// @license     MIT
// @downloadURL https://update.greasyfork.org/scripts/480214/Redgifs%20Embed%20Tweaks.user.js
// @updateURL https://update.greasyfork.org/scripts/480214/Redgifs%20Embed%20Tweaks.meta.js
// ==/UserScript==

(function () {
	'use strict';
	// Autoplay state
	const autoplay = GM_getValue('autoplay', true);
	// Open state
	const openLink = GM_getValue('openlink', false);
	// Autopause state
	const autoPause = GM_getValue('autoPause', true);
	// Muted state
	const muted = GM_getValue('muted', false);
	// Bloat state
	const bloat = GM_getValue('bloat', false);
	// Quality state
	const quality = GM_getValue('quality', true);
	// Middle click state
	const middleClick = GM_getValue('middleClick', true);
	let midClick = false;
	// Background color state
	let bgk = GM_getValue('bgk', true);
	let bgkColor = GM_getValue('bgkColor', '#0b0b28');
	let style = GM_addStyle(`body,.App{background:${bgkColor}}.hidden{visibility:hidden;}`);
	// Direct link state
	const dLink = GM_getValue('dLink', true);
	// Refresh state
	const refresh = GM_getValue('refresh', true);
	// Title
	const title = 'Click for toggle';
	// Click event
	const click = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
	});
	// Toggle item and reload page
	function toggle(key, value) {
		GM_setValue(key, value);
		location.reload();
	}
	// Autoplay toggle
	function autoplayToggle() {
		toggle('autoplay', !autoplay);
	}
	// Open link when click on video
	function openLinkToggle() {
		toggle('openlink', !openLink);
	}
	// Pause when video less than 80% visible
	function pauseVideoToggle() {
		toggle('autoPause', !autoPause);
	}
	// Muted default
	function mutedToggle() {
		toggle('muted', !muted);
	}
	// Open link when click on video
	function bloatToggle() {
		toggle('bloat', !bloat);
	}
	// Quality default
	function qualityToggle() {
		toggle('quality', !quality);
	}
	// Middle click
	function midClickToggle() {
		toggle('middleClick', !middleClick);
	}
	// Open pick color for background
	function bgkColorToggle() {
		// document.querySelector('#pick-color').click();
		toggle('bgk', !bgk);
	}
	// Direct link
	function dLinkToggle() {
		toggle('dLink', !dLink);
	}
	// Refresh page
	function refreshToggle() {
		toggle('refresh', !refresh);
	}
	// Intersection observer video
	function observerVideo(target) {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting && !entry.target.paused) entry.target.pause();
				}
			},
			{
				threshold: 0.8,
			},
		);
		observer.observe(target);
	}
	// Return element
	function el(e) {
		return document.querySelector(e);
	}
	// Menu commands
	(function menuCommands() {
		// Autoplay
		const commandAutoplay = GM_registerMenuCommand('Autoplay: ON', autoplayToggle, {
			title: title,
		});
		if (!autoplay) {
			GM_registerMenuCommand('Autoplay: OFF', autoplayToggle, {
				title: title,
				id: commandAutoplay,
			});
		}
		// Open link
		const commandLink = GM_registerMenuCommand('Open link when click: OFF', openLinkToggle, {
			title: title,
		});
		if (openLink) {
			GM_registerMenuCommand('Open link when click: ON', openLinkToggle, {
				title: title,
				id: commandLink,
			});
		}
		// Pause video
		const commandPause = GM_registerMenuCommand('Autopause: ON', pauseVideoToggle, {
			title: title,
		});
		if (!autoPause) {
			GM_registerMenuCommand('Autopause: OFF', pauseVideoToggle, {
				title: title,
				id: commandPause,
			});
		}
		// Muted
		const commandMuted = GM_registerMenuCommand('Muted: ON', mutedToggle, {
			title: title,
		});
		if (!muted) {
			GM_registerMenuCommand('Muted: OFF', mutedToggle, {
				title: title,
				id: commandMuted,
			});
		}
		// Bloat
		const commandBloat = GM_registerMenuCommand('Hide Bloat: OFF', bloatToggle, {
			title: title,
		});
		if (bloat) {
			GM_registerMenuCommand('Hide Bloat: ON', bloatToggle, {
				title: title,
				id: commandBloat,
			});
		}
		// Quality
		const commandQuality = GM_registerMenuCommand('Default Quality: HD', qualityToggle, {
			title: title,
		});
		if (!quality) {
			GM_registerMenuCommand('Default Quality: SD', qualityToggle, {
				title: title,
				id: commandQuality,
			});
		}
		// Middle click
		const commandMidClick = GM_registerMenuCommand('Middle click: open watch page', midClickToggle, {
			title: title,
		});
		if (!middleClick) {
			GM_registerMenuCommand('Middle click: open ifr page', midClickToggle, {
				title: title,
				id: commandMidClick,
			});
		}
		// Background color
		const commandBgk = GM_registerMenuCommand('Change background color: ON', bgkColorToggle, {
			title: title,
		});
		if (!bgk) {
			GM_registerMenuCommand(`Change background color: OFF`, bgkColorToggle, {
				title: title,
				id: commandBgk,
			});
		}
		// Direct link
		const commandDLink = GM_registerMenuCommand('Direct link button: ON', dLinkToggle, {
			title: title,
		});
		if (!dLink) {
			GM_registerMenuCommand(`Direct link button: OFF`, dLinkToggle, {
				title: title,
				id: commandDLink,
			});
		}
		// Refresh
		const commandRefresh = GM_registerMenuCommand('Refresh page: ON', refreshToggle, {
			title: title,
		});
		if (!refresh) {
			GM_registerMenuCommand(`Refresh page: OFF`, refreshToggle, {
				title: title,
				id: commandRefresh,
			});
		}
	})();
	// Prevent opening video link
	if (!openLink) {
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.videoLink')) return;
			e.preventDefault();
		});
	}
	// Middle click open link
	if (!middleClick) {
		document.addEventListener('mousedown', (e) => {
			if (!e.target.closest('.videoLink')) return;
			midClick = true;
		});
		document.addEventListener('mouseup', (e) => {
			if (midClick) {
				const videoLink = e.target.parentElement;
				videoLink.href = videoLink.href.replace('/watch/', '/ifr/');
				midClick = false;
			}
		});
	}
	// Remove bloat
	if (bloat) GM_addStyle(`.userInfo,.logo,#shareButton{display:none!important}`);
	// GM style
	GM_addStyle(`.gifQuality,.fullScreen{margin-left:0!important}`);
	// Mutation observer
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'childList' && mutation.target.querySelector('a.videoLink video:not([exist])')) {
				el('video').setAttribute('exist', '');
				const video = el('video');
				const qBtn = quality ? el('[d^="M1 12C1"]') : el('[d^="M1.16712"]');
				const muteButton = el('.soundOff');
				const buttonParent = video.closest('.embeddedPlayer').querySelector('.buttons');
				if (video && !autoplay) {
					video.removeAttribute('autoplay');
				}
				if (video && autoPause) {
					observerVideo(video);
				}
				if (video && !muted && muteButton) {
					muteButton.dispatchEvent(click);
				}
				if (video && qBtn) {
					qBtn.closest('.button').dispatchEvent(click);
				}
				if (video && bgk) {
					let pickColor = GM_addElement(buttonParent, 'label', {
						id: 'pick-color',
						title: 'Change background color',
					});
					pickColor.innerHTML = `<span class="color-icon button"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="width: unset;margin: auto;" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.20348 2.00378C9.46407 2.00378 10.5067 3.10742 10.6786 4.54241L19.1622 13.0259L11.384 20.8041C10.2124 21.9757 8.31291 21.9757 7.14134 20.8041L2.8987 16.5615C1.72713 15.3899 1.72713 13.4904 2.8987 12.3188L5.70348 9.51404V4.96099C5.70348 3.32777 6.82277 2.00378 8.20348 2.00378ZM8.70348 4.96099V6.51404L7.70348 7.51404V4.96099C7.70348 4.63435 7.92734 4.36955 8.20348 4.36955C8.47963 4.36955 8.70348 4.63435 8.70348 4.96099ZM8.70348 10.8754V9.34247L4.31291 13.733C3.92239 14.1236 3.92239 14.7567 4.31291 15.1473L8.55555 19.3899C8.94608 19.7804 9.57924 19.7804 9.96977 19.3899L16.3337 13.0259L10.7035 7.39569V10.8754C10.7035 10.9184 10.7027 10.9612 10.7012 11.0038H8.69168C8.69941 10.9625 8.70348 10.9195 8.70348 10.8754Z" fill="currentColor"/><path d="M16.8586 16.8749C15.687 18.0465 15.687 19.946 16.8586 21.1175C18.0302 22.2891 19.9297 22.2891 21.1013 21.1175C22.2728 19.946 22.2728 18.0465 21.1013 16.8749L18.9799 14.7536L16.8586 16.8749Z" fill="currentColor"/></svg></span><input type="color" style="display:none">`;
					pickColor.oninput = (e) => {
						let color = e.target.value;
						GM_setValue('bgkColor', color);
						style = GM_addStyle(`body,.App{background:${color}}`);
					};
				}
				if (video && dLink) {
					let toLink = GM_addElement(document.body, 'a', {
						class: 'toLink',
						style: 'position: absolute;right: 1rem;bottom: 1rem;cursor:pointer;s',
						href: video.src,
						target: '_blank',
						rel: 'noreferrer noopener',
						title: 'Redirect to mp4 link',
					});
					toLink.innerHTML = `<svg width="28px" height="28px" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(1px 0 5px black);" xmlns="http://www.w3.org/2000/svg">
					<path d="M14.1625 18.4876L13.4417 19.2084C11.053 21.5971 7.18019 21.5971 4.79151 19.2084C2.40283 16.8198 2.40283 12.9469 4.79151 10.5583L5.51236 9.8374" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
					<path d="M9.8374 14.1625L14.1625 9.8374" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
					<path d="M9.8374 5.51236L10.5583 4.79151C12.9469 2.40283 16.8198 2.40283 19.2084 4.79151M18.4876 14.1625L19.2084 13.4417C20.4324 12.2177 21.0292 10.604 20.9988 9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
					<script xmlns=""/></svg>`;
				}
				if (video && refresh) {
					let toRefresh = GM_addElement(buttonParent, 'div', {
						class: 'toRefresh',
						title: 'Refresh',
					});
					toRefresh.innerHTML = `<svg width="28px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><script xmlns=""/></svg>`;
					toRefresh.onclick = () => {
						location.reload();
					};
				}
				observer.disconnect();
			}
		});
	});
	// Installing observer
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
