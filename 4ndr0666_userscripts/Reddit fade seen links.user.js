// ==UserScript==
// @name        Reddit fade seen links
// @namespace   https://github.com/Farow/userscripts
// @description Fades links that you have already seen
// @include     /https?:\/\/[a-z]+\.reddit\.com\//
// @include     https://news.ycombinator.com/*
// @include     https://lobste.rs/*
// @include     https://openuserjs.org/*
// @include     http*://www.producthunt.com/*
// @include     https://www.qudos.io/*
// @include     https://news.layervault.com/
// @version     1.1.3
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// ==/UserScript==

'use strict';

/*
	changelog:

		2017-07-08 - 1.1.3
			- fixed reddit parent selector
		2015-09-16 - 1.1.2
			- fixed hacker news selector (authored by Poorchop)
		2015-08-08 - 1.1.1
			- fixed issue where the userscript wouldn't work if there were no previous stored data
		2015-05-23 - 1.1.0
			- added support for producthunt.com, qudos.io, news.layervault.com
		2015-05-22 - 1.0.9
			- fixed hacker news issue
		2014-11-14 - 1.0.8
			- fixed issue where you had to click twice to open a link with fade_mode = 3
		2014-11-04 - 1.0.7
			- hide seen button now displays the amount of seen/faded links
			- hide seen button and menu entries are now only created if links are found
			- right clicks and modifier keys will now prevent links being marked as seen when hovering over links
		2014-10-01 - 1.0.6
			- duplicate links are now marked on hover/click
			- seen links are now saved properly
			- hide seen button is only added if links are found
			- custom styles are only applied once
			- the transition effect now only applies to new links
			- improved support for openuserjs.org
		2014-09-19 - 1.0.5
			- added live feedback on hover/click
			- added clear all on this page command
			- added fade_mode option
			- improved hiding non-script links on openuserjs.org
			- removed opacity option
		2014-09-14 - 1.0.4
			- added a hide seen button
			- improved support for hacker news
		2014-09-13 - 1.0.3
			- added support for openuserjs.org
			- added support for styling new links
			- moved some options to css style to allow easier styling
			- added remove styles command
			- clear last now only works for the links that you saw on your last page,
			  not all the links that you have seen once
		2014-09-06 - 1.0.2
			- added support for news.ycombinator.com and lobste.rs
			- old links are now removed from storage depending on their last visit time, not first visit time
		2014-09-02 - 1.0.1 - no longer fades links or comments on a profile page
		2014-09-02 - 1.0.0 - initial release
*/

let fade_mode  = 2,   /* 1: automatically fade all links, 2: fade hovered links, 3: fade clicked links */
	hide_after = 0,   /* times seen a link before hiding it (0 to never hide links) */
	expiration = 14,   /* time after which to remove old links from storage, in days */
	style      =
		  '.fade { opacity: 0.5; }'
		+ '.hide { display: none; }'
		+ '.new  { box-shadow: -2px 0px 0px 0px hsl(210, 100%, 75%); }'
		+ '.new.fade { box-shadow: none; transition: all 1s ease-in; }'
		+ '.new.dupe { box-shadow: -2px 0px 0px 0px hsl(0, 100%, 75%); }'
;

window.addEventListener('load', init); /* compatibility with scripts that modify links */
window.addEventListener('unload', save_new);

let new_links = [ ],
	old_links = 0,
	site,
	hide_button,
	rules     = {
		'news.ycombinator.com': {
			'links': function () {
				/* exclude 'more' and comment pages */
				return [].slice.call(document.querySelectorAll('td.title > a'), 0, -1);
			},
			'parents': function (link) {
				return [
					link.parentElement.parentElement,
					link.parentElement.parentElement.nextElementSibling,
					link.parentElement.parentElement.nextElementSibling.nextElementSibling
				];
			},
			'hide_button': function () {
				let a = document.createElement('a');

				a.href = '#';
				a.textContent = 'hide seen';

				document.getElementsByClassName('pagetop')[0].innerHTML += ' | ';

				return ['.pagetop', a];
			},
			'hide_button_set_amount': function (button, amount) {
				button.textContent = 'hide seen (' + amount + ')';
			},
		},
		'reddit.com': {
			'include': function () {
				return document.body.classList.contains('listing-page');
			},
			'exclude': function () {
				return document.body.classList.contains('profile-page');
			},
			'links': '.thing.link > .entry a.title',
			'parents': function (link) {
				return [ link.closest('.thing') ];
			},
			'style': '.fade, .dupe { overflow: hidden; }',
			'hide_button': function () {
				let li = document.createElement('li'),
					a  = document.createElement('a');

				a.href = '#';
				a.textContent = 'hide seen';
				a.classList.add('choice');

				li.appendChild(a);

				return [ '.tabmenu', li ];
			},
			'hide_button_set_amount': function (button, amount) {
				button.children[0].textContent = 'hide seen (' + amount + ')';
			},
		},
		'lobste.rs': {
			'exclude': function () {
				return document.querySelector('.comments');
			},
			'links': '.link a',
			'parents': function (link) {
				return [ link.parentNode.parentNode.parentNode ];
			},
			'hide_button': function () {
				let a = document.createElement('a');

				a.href = '#';
				a.textContent = 'Hide seen';

				return ['.headerlinks', a];
			},
			'hide_button_set_amount': function (button, amount) {
				button.textContent = 'hide seen (' + amount + ')';
			},
		},
		'openuserjs.org': {
			'links': 'a.tr-link-a',
			'parents': function(link) {
				if (link.parentNode.tagName === 'B') {
					link = link.parentNode;
				}

				return [ link.parentNode.parentNode ];
			},
			'hide_button': function (){
				let li = document.createElement('li'),
					a  = document.createElement('a');

				a.href = '#';
				a.textContent = 'Hide seen';

				li.appendChild(a);

				return ['ul.navbar-right', li, document.getElementsByClassName('navbar-right')[0].lastElementChild.previousElementSibling];
			},
			'hide_button_set_amount': function (button, amount) {
				button.children[0].textContent = 'hide seen (' + amount + ')';
			},
			'style': '.table-responsive { overflow-x: visible; }',
		},
		'producthunt.com': {
			'links': '.post-url',
			'parents': function (link) {
				return [ link.parentElement.parentElement.parentElement ];
			},
			'hide_button': function () {
				let a = document.createElement('a');

				a.href = '#';
				a.textContent = 'hide seen';
				a.classList.add('header--secondary--link');

				return ['.v-links > .container', a];
			},
			'hide_button_set_amount': function (button, amount) {
				button.textContent = 'hide seen (' + amount + ')';
			},
			'style': '.new { border-radius: 0; }',
		},
		'qudos.io': {
			'links': '.entry .title',
			'parents': function (link) {
				return [ link.parentElement.parentElement.parentElement.parentElement.parentElement ];
			},
		},
		'news.layervault.com': {
			'links': '.StoryUrl',
			'parents': function (link) {
				return [ link.parentElement ];
			},
			'style': '.fade { opacity: 1; } .fade .StoryUrl { opacity: 0.5; }',
		},
	}
;

function init() {
	for (site in rules) {
		let site_tokens   = site.split('.'),
			domain_tokens = location.hostname.split('.').slice(-site_tokens.length);

		if (equal_arrays(site_tokens, domain_tokens)) {
			site = rules[site];
			break;
		}
	}

	if (site === undefined) {
		return;
	}

	if (site.hasOwnProperty('include') && !site.include()) {
		return;
	}

	if (site.hasOwnProperty('exclude') && site.exclude()) {
		return;
	}

	if (!site.hasOwnProperty('remove_default_styles')) {
		GM_addStyle(style);
	}

	if (site.hasOwnProperty('style')) {
		GM_addStyle(site.style);
	}

	let found = check_links(site);

	if (found) {
		if (site.hasOwnProperty('hide_button')) {
			let [where, button, insert_before] = site.hide_button();
			let element = document.querySelector(where);

			if (element) {
				if (insert_before) {
					element.insertBefore(button, insert_before);
				}
				else {
					element.appendChild(button);
				}

				button.addEventListener('click', function (event) {
					check_links(site, 1);
					event.preventDefault();
				});

				hide_button = button;
				update_hide_button();
			}
		}

		GM_registerMenuCommand('Fade links: clear all', clear.bind(undefined, 0, site));
		GM_registerMenuCommand('Fade links: clear all on this page', clear.bind(undefined, 1, site));
		GM_registerMenuCommand('Fade links: clear last', clear.bind(undefined, 2, site));
		GM_registerMenuCommand('Fade links: remove styles', remove_styles.bind(undefined, site));
		GM_registerMenuCommand('Fade links: hide seen', check_links.bind(undefined, site, 1));
	}

	remove_old();
}

function check_links(site, on_demand_hide) {
	let old   = get_links_in_storage(),
		links = get_links_in_page(site);

	links.forEach(function (element) {
		let url = element.href;

		if (on_demand_hide) {
			if (get_parents(site, element)[0].classList.contains('fade')) {
				fade(site, element, 0, 0, 1); /* force */
			}

			old_links = 0;
			update_hide_button();

			return;
		}

		if (!old.hasOwnProperty(url)) {
			/* mark new */
			let parents = get_parents(site, element);
			for (let i = 0; i < parents.length; i++) {
				parents[i].classList.add('new');
			}

			/* automatically add to history */
			if (fade_mode === 1) {
				new_links.push(url);
				if (!old.hasOwnProperty(url)) {
					old[url] = {
						seen: 0,
						last: 1,
						when: Date.now(),
						accessed: 1,
					};
				}
			}
			/* add to history on hover/click */
			else {
				let capture_event = fade_mode === 2 ? 'mouseover' : 'mouseup';
				element.addEventListener(capture_event, function (e) {
					/* avoid right click and modifier buttons */
					if (e.button === 2 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
						return;
					}

					new_links.push(e.currentTarget.href);
					mark_dupes(site, links, e.currentTarget);
					fade(site, element, 1);

					old_links++;
					update_hide_button();

					/* clone hack to remove event listener */
					window.setTimeout(function (target) {
						let clone = target.cloneNode(1);
						target.parentNode.replaceChild(clone, target);
					}, 0, e.currentTarget);
				});
			}
		}
		else {
			old[url].when = Date.now();
			old_links++;

			if (old[url].accessed) {
				fade(site, element, old[url].seen, 1);
				return;
			}

			old[url].accessed = 1;
			old[url].seen++;

			if (old[url].last == 1) {
				old[url].last++;
			}
			else if (old[url].last) {
				old[url].last = 0;
			}

			fade(site, element, old[url].seen);
		}
	});

	save_links(old);
	return links.length;
}

function clear(clear_type, site) {
	/* clear all */
	if (!clear_type) {
		save_links({});
		return;
	}

	let links = get_links_in_storage();

	/* clear all on this page */
	if (clear_type === 1) {
		let new_links = get_links_in_page(site);

		new_links.forEach(function (element) {
			let url = element.href;

			if (links.hasOwnProperty(url)) {
				delete links[url];
			}
		});
	}
	/* clear last */
	else if (clear_type === 2) {
		for (let url in links) {
			if (links[url].last == 2) {
				delete links[url];
			}
		}
	}

	save_links(links);
	return;
}

function fade(site, link, seen, is_dupe, force_hide) {
	let parents = get_parents(site, link);
	if (force_hide || (hide_after !== 0 && seen > hide_after - 1)) {
		for (let i = 0; i < parents.length; i++) {
			parents[i].classList.add('hide');
		}

		return;
	}

	for (let i = 0; i < parents.length; i++) {
		if (seen) {
			parents[i].classList.add('fade');
		}
		else if (is_dupe) {
			parents[i].classList.add('dupe');
		}
	}
}

function update_hide_button() {
	if (site.hasOwnProperty('hide_button_set_amount')) {
		site.hide_button_set_amount(hide_button, old_links);
	}
}

function mark_dupes(site, links, exception) {
	/* already marked as a dupe */
	if (get_parents(site, exception)[0].classList.contains('dupe')) {
		return;
	}

	links.forEach(function (link) {
		if (link === exception) {
			return;
		}

		if (link.href === exception.href) {
			fade(site, link, 0, 1); /* add dupe class */
		}
	});
}

function save_new() {
	let old = get_links_in_storage();

	new_links.forEach(function (url) {
		if (!old.hasOwnProperty(url)) {
			old[url] = {
				seen: 1,
				last: 1,
				when: Date.now(),
				accessed: 1,
			};
		}
	});

	save_links(old);
}

function remove_styles(site) {
	let links = get_links_in_page(site);

	links.forEach(function (element) {
		let parents = get_parents(site, element);
		for (let i = 0; i < parents.length; i++) {
			parents[i].classList.remove('fade', 'dupe', 'hide', 'new');
		}
	});
}

function remove_old() {
	let links = get_links_in_storage(),
		diff  = Date.now() - expiration * 86400000, /* expiration * 1 day */
		count = 0;

	for (let url in links) {
		if (links[url].when < diff) {
			delete links[url];
			count++;
		}
	}

	if (count) {
		save_links(links);
	}
}

function get_links_in_page(site) {
	if (typeof site.links == 'function') {
		return site.links();
	}

	return [].slice.call(document.querySelectorAll(site.links));
}

function get_links_in_storage() {
	let links = GM_getValue('links');

	if (!links) {
		return { };
	}

	return JSON.parse(links);
}

function get_parents(site, link) {
	if (site.hasOwnProperty('parents')) {
		return site.parents(link);
	}

	return link;
}

function save_links(links) {
	for (let url in links) {
		if (links[url].accessed) {
			delete links[url].accessed;
		}
		else if (links[url].last == 2) {
			links[url].last = 0;
		}
	}

	GM_setValue('links', JSON.stringify(links));
}

function equal_arrays(a, b) {
	if (a === b) {
		return true;
	}
	if (!a || !b || a.length != b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}
