// ==UserScript==
// @id               YoutubeSearchFilterPersist
// @name             Youtube Search Filter Persist 
// @description      With this script, the search filter settings are saved and were reused in another search. With the button "Reset Filters" the search filters can be reset again.
// @version          0.1
// @author           Jan-Felix Wittmann <jfwittmann7@gmail.com>
// @copyright 2021, leobm (https://openuserjs.org/users/leobm)
// @license MIT
// @updateURL https://openuserjs.org/meta/leobm/Youtube_Search_Filter_Persist.meta.js
// @downloadURL https://openuserjs.org/install/leobm/Youtube_Search_Filter_Persist.user.js
// @icon             https://www.google.com/s2/favicons?domain=youtube.com
// @match            http://www.youtube.com/results*
// @match            https://www.youtube.com/results*
// @include          http://www.youtube.com/results*
// @include          https://www.youtube.com/results*
// @run-at           document-start
// @grant            GM.getValue
// @grant            GM.setValue
// ==/UserScript==

(function (d) {
  let currentSearch = window.location.search;

  async function updateUrlSearch() {
    let urlSearchParams = new URLSearchParams(currentSearch);
    let curSearchQueryParam = urlSearchParams.get('search_query');
    let curSearchFilterParam = urlSearchParams.get('sp');

    if (curSearchQueryParam) {

      let storedSearchFilter = await GM.getValue('search_filter');
      if (storedSearchFilter != curSearchFilterParam) {

        if (curSearchFilterParam != null) {
          await GM.setValue('search_filter', curSearchFilterParam);
          urlSearchParams.set("sp", curSearchFilterParam);
          window.location.search = urlSearchParams.toString();
        }
        else if (storedSearchFilter != null) {
          urlSearchParams.set("sp", storedSearchFilter);
          window.location.search = urlSearchParams.toString();
        }
      }
    }
  }
  updateUrlSearch();

  setInterval(function () {
    if (currentSearch != window.location.search) {
      currentSearch = window.location.search;
      updateUrlSearch();
    }
  }, 500);

  var documentObserver = new MutationObserver(function (mutations, me) {
    var filterBtn = query(d, 'ytd-toggle-button-renderer.ytd-search-sub-menu-renderer')[0];
    if (filterBtn) {
      GM.getValue('search_filter').then((storedSearchFilter) => {
        if (storedSearchFilter) {
          let resetFiltersBtn = document.createElement("a")
          resetFiltersBtn.href = "#";
          resetFiltersBtn.style = "text-transform: uppercase; font-weight: bold; display:inline-block;font-size:1.3em";
          resetFiltersBtn.append("Reset Filters")
          resetFiltersBtn.addEventListener('click', (evt) => {
            GM.setValue('search_filter', null).then(() => {
              let urlSearchParams = new URLSearchParams(currentSearch);
              urlSearchParams.delete("sp");
              window.location.search = urlSearchParams.toString();
            });
          });

          filterBtn.parentNode.appendChild(resetFiltersBtn);
        }
      });
      me.disconnect(); // stop observing
      return;
    }
  });

  documentObserver.observe(d, {
    childList: true,
    subtree: true
  });

  function query(startNode, selector) {
    try {
      var nodes = Array.prototype.slice.call(
        startNode.querySelectorAll(selector));
      return nodes;
    }
    catch (e) {}
    return [];
  }

})(document);
