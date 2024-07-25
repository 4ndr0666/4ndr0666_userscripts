// ==UserScript==
// @name        Bunkr Sort Automatically
// @namespace   jAstn
// @match       https://bunkr.*/a/*
// @include     https://bunkr.*/a/*
// @match       https://bunkr.site/a/*
// @match       https://bunkr.se/a/*
// @match       https://bunkr.ci/a/*
// @match       https://bunkr.nu/a/*
// @match       https://bunkr.ac/a/*
// @match       https://bunkr.black/a/*
// @match       https://bunkr.cat/a/*
// @match       https://bunkr.la/a/*
// @match       https://bunkr.media/a/*
// @match       https://bunkr.red/a/*
// @match       https://bunkr.si/a/*
// @match       https://bunkr.site/a/*
// @match       https://bunkr.sk/a/*
// @match       https://bunkr.su/a/*
// @match       https://bunkr.ws/a/*
// @match       https://bunkrr.*/a/*
// @match       https://bunkrr.ru/a/*
// @match       https://bunkrr.su/a/*
// @match       https://cyberdrop.me/a/*
// @version     0.1
// @author      jAstn
// @grant       none
// @license jAstn
// @description Adds sort Buttons (Automatically Sorts)
// @icon         https://bunkr.nu/images/logo.svg
// @downloadURL https://update.greasyfork.org/scripts/495966/Bunkr%20Sort%20Automatically.user.js
// @updateURL https://update.greasyfork.org/scripts/495966/Bunkr%20Sort%20Automatically.meta.js
// ==/UserScript==

const getConfig = () => {
	if (location.host.includes("bunkr")) {
		return {
			selectors: {
				container: "section > div.grid-images",
				medias: "section > div.grid-images > div.grid-images_box",
			},
			getMediaData: (media) => {
				const [name, size, date] = media.querySelectorAll("div:nth-child(2) > p");

				return {
					element: media,
					name: name.innerText,
					size: convertSize(size.innerText),
					date: new Date(date.innerText.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "$2/$1/$3")),
				};
			},
		};
	}

	return {
		selectors: {
			container: "#table",
			medias: "div.image-container",
		},
		getMediaData: (media) => {
			const [name, _, size] = media.querySelectorAll("div.details > p");

			return {
				element: media,
				name: name.querySelector("a").innerText,
				size: convertSize(size.innerText),
				date: new Date(+media.querySelector("a.image").dataset.timestamp * 1000),
			};
		},
	};
};

const config = getConfig();

const { selectors, getMediaData } = config;

const medias = [];

let desc = true;

let currentSort = "size";

const iconStyles = "height: 24px; width: 24px; padding-left: 5px;";

const buttonStyles =
	"margin-right: 10px; line-height: inherit; font-size: 100%; font-weight: 500; padding-left: .75rem; padding-right: .75rem; padding-bottom: .5rem; padding-top: .5rem; border-radius: .375rem; display: flex; cursor: pointer; color: white; background-color: #242424;";

const icons = {
	desc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="${iconStyles}">
	<path fill="#FFF" d="M17.984375 2.9863281A1.0001 1.0001 0 0 0 17 4v13h-1.816406c-.568 0-.852219.686844-.449219 1.089844l2.658203 2.658203c.336.336.880797.336 1.216797 0l2.658203-2.658203c.402-.403.115875-1.089844-.453125-1.089844H19V4a1.0001 1.0001 0 0 0-1.015625-1.0136719zM4 3a1.0001 1.0001 0 1 0 0 2h9a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h7a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h5a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h3a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h1a1.0001 1.0001 0 1 0 0-2H4z"/>
</svg>`,
	asc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="${iconStyles}">
	<path fill="#FFF" d="M17.984375 2.9863281A1.0001 1.0001 0 0 0 17 4v13h-1.816406c-.568 0-.852219.686844-.449219 1.089844l2.658203 2.658203c.336.336.880797.336 1.216797 0l2.658203-2.658203c.402-.403.115875-1.089844-.453125-1.089844H19V4a1.0001 1.0001 0 0 0-1.015625-1.0136719zM4 3a1.0001 1.0001 0 1 0 0 2h1a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h3a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h5a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h7a1.0001 1.0001 0 1 0 0-2H4zm0 4a1.0001 1.0001 0 1 0 0 2h9a1.0001 1.0001 0 1 0 0-2H4z"/>
</svg>`,
};

const buildButton = (name, style, title, icon = "") => `<button ${name} style="${style}">${title}<span>${icon}</span></button>`;

const buttons = {
	name: buildButton("sort-name", buttonStyles, "sort name"),
	size: buildButton("sort-size", buttonStyles.replace("#242424", "#303030"), "sort size", icons.desc),
	date: buildButton("sort-date", buttonStyles, "sort date"),
};

const sortButtons = {
	name: {
		element: buttons.name,
		action: (target, ...others) => {
			currentSort = "name";
			desc = !desc;

			for (const o of others) {
				o.style["background-color"] = "#242424";
				o.querySelector("span").innerHTML = "";
			}

			target.style["background-color"] = "#303030";
			target.querySelector("span").innerHTML = icons[desc ? "desc" : "asc"];

			if (desc) {
				sort(() => medias.sort((a, b) => b.name.localeCompare(a.name)));
			} else {
				sort(() => medias.sort((a, b) => a.name.localeCompare(b.name)));
			}
		},
	},
	size: {
		element: buttons.size,
		action: (target, ...others) => {
			currentSort = "size";
			desc = !desc;

			for (const o of others) {
				o.style["background-color"] = "#242424";
				o.querySelector("span").innerHTML = "";
			}

			target.style["background-color"] = "#303030";
			target.querySelector("span").innerHTML = icons[desc ? "desc" : "asc"];

			if (desc) {
				sort(() => medias.sort((a, b) => b.size - a.size));
			} else {
				sort(() => medias.sort((a, b) => -(b.size - a.size)));
			}
		},
	},
	date: {
		element: buttons.date,
		action: (target, ...others) => {
			currentSort = "date";
			desc = !desc;

			for (const o of others) {
				o.style["background-color"] = "#242424";
				o.querySelector("span").innerHTML = "";
			}

			target.style["background-color"] = "#303030";
			target.querySelector("span").innerHTML = icons[desc ? "desc" : "asc"];

			if (desc) {
				sort(() => medias.sort((a, b) => b.date - a.date));
			} else {
				sort(() => medias.sort((a, b) => -(b.date - a.date)));
			}
		},
	},
};

const conversionFactors = {
	B: 1,
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024,
};

const sizeUnits = Object.keys(conversionFactors);

const convertSize = (size) => {
	let sizeValue = parseFloat(size.match(/^[\d.]+/));
	let sizeUnit = size.match(/[A-Z]+/);

	return sizeValue * conversionFactors[sizeUnit];
};

const sort = (func) => {
	func();

	for (const [index, media] of medias.entries()) {
		media.element.style.order = index;
	}
};

const container = document.querySelector(selectors.container);

const sortButtonsContainer = document.createElement("div");
sortButtonsContainer.style.display = "flex";
sortButtonsContainer.style["justify-content"] = "center";
sortButtonsContainer.style["margin-bottom"] = "25px";
sortButtonsContainer.style["margin-top"] = "-15px";
sortButtonsContainer.innerHTML = sortButtons.name.element + sortButtons.size.element + sortButtons.date.element;

container.parentNode.insertBefore(sortButtonsContainer, container);

const sortButtonName = document.querySelector("button[sort-name]");
const sortButtonSize = document.querySelector("button[sort-size]");
const sortButtonDate = document.querySelector("button[sort-date]");

sortButtonName.addEventListener("click", () => {
	sortButtons.name.action(sortButtonName, sortButtonSize, sortButtonDate);
});

sortButtonSize.addEventListener("click", () => {
	sortButtons.size.action(sortButtonSize, sortButtonName, sortButtonDate);
});

sortButtonDate.addEventListener("click", () => {
	sortButtons.date.action(sortButtonDate, sortButtonName, sortButtonSize);
});

for (const media of document.querySelectorAll(selectors.medias)) {
	medias.push(getMediaData(media));
}

sort(() => medias.sort((a, b) => b.size - a.size));