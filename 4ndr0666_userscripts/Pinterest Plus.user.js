// ==UserScript==
// @name	Pinterest Plus
// @namespace	https://greasyfork.org/users/102866
// @description	Show full size + open original image.
// @match     https://*.pinterest.com/*
// @match     https://*.pinterest.at/*
// @match     https://*.pinterest.ca/*
// @match     https://*.pinterest.ch/*
// @match     https://*.pinterest.cl/*
// @match     https://*.pinterest.co.kr/*
// @match     https://*.pinterest.co.uk/*
// @match     https://*.pinterest.com.au/*
// @match     https://*.pinterest.com.mx/*
// @match     https://*.pinterest.de/*
// @match     https://*.pinterest.dk/*
// @match     https://*.pinterest.es/*
// @match     https://*.pinterest.fr/*
// @match     https://*.pinterest.ie/*
// @match     https://*.pinterest.info/*
// @match     https://*.pinterest.it/*
// @match     https://*.pinterest.jp/*
// @match     https://*.pinterest.nz/*
// @match     https://*.pinterest.ph/*
// @match     https://*.pinterest.pt/*
// @match     https://*.pinterest.se/*
// @author	TiLied
// @version	0.7.00
// @grant	GM_openInTab
// @grant	GM_listValues
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_deleteValue
// @require	https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant	GM.openInTab
// @grant	GM.listValues
// @grant	GM.getValue
// @grant	GM.setValue
// @grant	GM.deleteValue
// @downloadURL https://update.greasyfork.org/scripts/30839/Pinterest%20Plus.user.js
// @updateURL https://update.greasyfork.org/scripts/30839/Pinterest%20Plus.meta.js
// ==/UserScript==

	class PinterestPlus
	{
		_FirstInstance_;
		get FirstInstance() { return this._FirstInstance_; }
		set FirstInstance(value) { this._FirstInstance_ = value; }

		_Urls = new Array(1);
		_BtnOn = false;

		_OldHash = "";
		_Check = 0;

		constructor()
		{
			console.log("Pinterest Plus v" + GM.info.script.version + " initialization");

			this._SetCSS();
			this._FirstTime();
		}

		_SetCSS()
		{

			window.document.head.append("<!--Start of Pinterest Plus v" + GM.info.script.version + " CSS-->");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
			"{"+
			"border: 2px solid black!important;"+
			"}</ style >");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
			"{"+
				"border: 2px solid black!important;"+
			"}</style>");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
		"{"+
			"border: 2px solid black!important;"+
			"}</style>");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css' >#myBtn"+
		"{"+
			"pointer-events: auto; !important;"+
			"display: inherit; " +
			"align-items: center; "+
			"box-sizing: border - box; "+
			"color:#fff;"+
			"font-size: 16px; "+
			"font-weight: 700; "+
			"letter-spacing: -.4px; "+
			"margin-top: -4px; "+
			"border-style: solid; "+
			"border-width: 0px; "+
			"background-color: #e60023;"+
			"border-radius: 24px; "+
			"padding: 10px 14px; "+
			"will-change: transform; "+
			"margin-left: 8px; "+
		"}</style>");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css'>#myBtn:hover"+
		"{"+
			"background - color: #ad081b;"+
		"}</ style >");

			window.document.head.insertAdjacentHTML("beforeend", "<style type='text/css'>#pp_divFullSize"+
		"{"+
			"z-index: 500; !important;"+
			"justify-content: center;"+
			"display: grid;"+
		"}</ style >");

			window.document.head.append("<!--End of Pinterest Plus v" + GM.info.script.version + " CSS-->");

		}

		async _FirstTime()
		{
			this.FirstInstance = this;

			if (await this.HasValueGM("ppFullSize", false))
			{
				this._BtnOn = await GM.getValue("ppFullSize");
			}

			//Console log prefs with value
			console.log("*prefs:");
			console.log("*-----*");

			let vals = await GM.listValues();

			//Find out that var in for block is not local... Seriously js?
			for (let i = 0; i < vals.length; i++)
			{
				console.log("*" + vals[i] + ":" + await GM.getValue(vals[i]));
			}
			console.log("*-----*");
		}

		Main()
		{
			if (!window.document.location.pathname.startsWith("/pin/"))
			{
				this.UrlHandler();
				return;
			}

			this._Urls = new Array(1);

			let buttonDiv = window.document.createElement("div");
			let buttonButton = window.document.createElement("button");
			let buttonText = window.document.createTextNode("Full Size");
			let parentDiv = window.document.querySelector("div[data-test-id='closeupActionBar']>div>div,"+
				"div[data-test-id='UnauthBestPinCardBodyContainer']>div>div>div,"+
				"div.UnauthStoryPinCloseupBody__container>div>div,"+
				"div[data-test-id='CloseupDetails'],"+
				"div[data-test-id='CloseupMainPin']>div>div:last-child>div");

			if (parentDiv == null)
			{
				console.error("parentDiv:", parentDiv);
				return;
			}

			buttonButton.appendChild(buttonText);
			buttonDiv.appendChild(buttonButton);
			buttonButton.id = "myBtn";

			parentDiv.appendChild(buttonDiv);

			//
			let queryCloseup = window.document.querySelector("div[data-test-id='CloseupMainPin'], div.reactCloseupScrollContainer");

			if (queryCloseup == null)
			{
				console.error("div[data-test-id='pin']:first, div.reactCloseupScrollContainer:", queryCloseup);
				return;
			}

			let div = window.document.querySelector("#pp_divFullSize");

			if (div == null)
			{
				div = window.document.createElement("div");

				div.id = "pp_divFullSize";

				queryCloseup.prepend(div);
			}

			div.style.display = "none";

			if (this._BtnOn)
			{
				buttonButton.classList.add("ppTrue");

				div.style.display = "grid";
			}

			this.Events(buttonButton);

			this.Core(buttonButton);

			this.UrlHandler();
		}

		Core(btn)
		{
			let time = Date.now();

			let re = new RegExp("\\/(\\d+)\\/|pin\\/([\\w\\-]+)\\/?");
			let regU = re.exec(window.document.location.href);

			let id = regU[1];

			if (id == null)
				id = regU[2];

			if (id == null)
			{
				//TODO! not through request!
				console.error("id is undefined");
				return;
			}

			let urlRec = "https://" + window.document.location.host + "/resource/PinResource/get/?source_url=/pin/" + id + "/&data={%22options%22:{%22field_set_key%22:%22detailed%22,%22id%22:%22" + id + "%22},%22context%22:{}}&_=" + time;

			window.fetch(urlRec)
				.then(async (response) =>
				{
					let a = await response;
					return a.json();
				})
				.then(async (_r) =>
				{
					let r = await await await _r;

					if (r["resource_response"]["status"] == "success")
					{
						console.log(r["resource_response"]["data"]);

						let pin = r["resource_response"]["data"];

						if (pin["videos"] != null)
						{
							let k0 = Object.keys(pin["videos"]["video_list"])[0];

							this._Urls[0] = pin["videos"]["video_list"][k0]["url"];

							btn.setAttribute("title", "" + pin["videos"]["video_list"][k0]["width"] + "px x " + pin["videos"]["video_list"][k0]["height"] + "px");

							return;
						}

						if (pin["story_pin_data"] != null)
						{
							let sp = pin["story_pin_data"]["pages"];

							for (let i = 0; i < sp.length; i++)
							{
								if (this._Urls[0] == null)
								{
									this._Urls[0] = sp[i]["image"]["images"]["originals"]["url"];
									continue;
								}
								this._Urls.push(sp[i]["blocks"]["0"]["image"]["images"]["originals"]["url"]);
							}

							return;
						}

						this._Urls[0] = pin["images"]["orig"]["url"];

						btn.setAttribute("title", "" + pin["images"]["orig"]["width"] + "px x " + pin["images"]["orig"]["height"] + "px");

						if (this._BtnOn)
							this.Show(this._Urls[0]);

						return;
					}
					else
					{
						console.error(r);
					}
				});
		}

		Events(btn)
		{
			btn.addEventListener("mousedown", (e) =>
			{
				if (e.button == 2)
				{
					if (this._BtnOn)
					{
						GM.setValue("ppFullSize", false);
						btn.classList.remove("ppTrue");
						this._BtnOn = false;
					}
					else
					{
						GM.setValue("ppFullSize", true);
						btn.classList.add("ppTrue");
						this._BtnOn = true;
					}

					//console.log("right");
				}
				if (e.button == 0)
				{
					this.Show(this._Urls[0]);

					let _div = window.document.querySelector("#pp_divFullSize");

					if (_div.style.display == "none")
						_div.style.display = "grid";
					else
						_div.style.display = "none";

					//console.log("left");
				}
				if (e.button == 1)
				{
					for (let i = 0; i < this._Urls.length; i++)
					{
						if (this._Urls[i] != null)
							GM.openInTab(this._Urls[i]);
					}

					//console.log("middle");
				}

				e.preventDefault();
			}, false);
		}

		Show(url)
		{
			let img = window.document.querySelector("#pp_img");

			if (img != null)
			{
				img.setAttribute("src", url);
			}
			else
			{
				img = window.document.createElement("img");

				img.id = "pp_img";
				img.setAttribute("src", url);

				let _div = window.document.querySelector("#pp_divFullSize");
				_div.prepend(img);
			}
		}

		//Handler for url
		UrlHandler()
		{
			this._OldHash = window.location.pathname;

			let that = this;
			let detect = () =>
			{
				if (that._OldHash != window.location.pathname)
				{
					that._OldHash = window.location.pathname;
					window.setTimeout(() =>
					{
						this.Main();
					}, 1500);
				}
			};

			this._Check = window.setInterval(() =>
			{
				detect();
			}, 250);
		}

		//Start
		//async Methods/Functions GM_VALUE
		async HasValueGM(nameVal, optValue)
		{
			let vals = await GM.listValues();

			if (vals.length== 0)
			{
				if (optValue != null)
				{
					GM.setValue(nameVal, optValue);
					return true;
				}
				else
				{
					return false;
				}
			}

			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] == nameVal)
				{
					return true;
				}
			}

			if (optValue != null)
			{
				GM.setValue(nameVal, optValue);
				return true;
			}
			else
			{
				return false;
			}
		}

		async DeleteValuesGM(nameVal)
		{
			let vals = await GM.listValues();

			if (vals.length== 0)
			{
				return;
			}

			switch (nameVal)
			{
				case "all":
					for (let i = 0; i < vals.length; i++)
					{
						if (vals[i] != "adm")
						{
							GM.deleteValue(vals[i]);
						}
					}
					break;
				case "old":
					for (let i = 0; i < vals.length; i++)
					{
						if (vals[i] == "debug" || vals[i] == "debugA")
						{
							GM.deleteValue(vals[i]);
						}
					}
					break;
				default:
					for (let i = 0; i < vals.length; i++)
					{
						if (vals[i] == nameVal)
						{
							GM.deleteValue(nameVal);
						}
					}
					break;
			}
		}

		UpdateGM(what)
		{
			let gmVal;

			switch (what)
			{
				case "options":
					gmVal = JSON.stringify("");
					GM.setValue("pp_options", gmVal);
					break;
				default:
					console.error("class:Options.UpdateGM(" + what + "). default switch");
					break;
			}
		}
		//async Methods/Functions GM_VALUE
		//End
	}

let pp;

window.onload = function ()
{
	pp = new PinterestPlus();

	setTimeout(() =>
	{
		pp.FirstInstance.Main();
		console.log(pp);
	}, 1250);
};