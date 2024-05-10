// ==UserScript==
// @name         AZNude - Video Search & UI Tweaks
// @namespace    brazenvoid
// @version      3.1.1
// @author       brazenvoid
// @license      GPL-3.0-only
// @description  Search and cleaners
// @match        https://www.aznude.com/*
// @match        https://search.aznude.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://greasyfork.org/scripts/375557-base-resource/code/Base%20Resource.js?version=899286
// @require      https://greasyfork.org/scripts/416104-brazen-ui-generator/code/Brazen%20UI%20Generator.js?version=899448
// @require      https://greasyfork.org/scripts/418665-brazen-configuration-manager/code/Brazen%20Configuration%20Manager.js?version=892799
// @require      https://greasyfork.org/scripts/416105-brazen-base-search-enhancer/code/Brazen%20Base%20Search%20Enhancer.js?version=899428
// @grant        GM_addStyle
// @run-at	     document-idle
// @downloadURL https://update.sleazyfork.org/scripts/375263/AZNude%20-%20Video%20Search%20%20UI%20Tweaks.user.js
// @updateURL https://update.sleazyfork.org/scripts/375263/AZNude%20-%20Video%20Search%20%20UI%20Tweaks.meta.js
// ==/UserScript==

GM_addStyle(
    `#settings-wrapper{background-color:#ffa31a;top:20vh;width:270px}#settings-wrapper .form-group,#settings-wrapper label,#settings-wrapper input[type="checkbox"],#settings-wrapper input[type="radio"]{margin:0}`)

const PAGE_HOST_NAME = window.location.host
const PAGE_PATH_NAME = window.location.pathname

const IS_SEARCH_HOST = window.location.host.startsWith('search')
const IS_SEARCH_PAGE = PAGE_PATH_NAME.startsWith('/browse') || IS_SEARCH_HOST
const IS_SOURCE_PAGE = PAGE_PATH_NAME.startsWith('/view')
const IS_VIDEO_PAGE = PAGE_PATH_NAME.startsWith('/azncdn') || PAGE_PATH_NAME.startsWith('/mrskin')

const SCRIPT_PREFIX = 'az-sui-'

const SELECTOR_ITEM = '.albuma,.albuma2'
const SELECTOR_ITEM_DURATION = '.video-time'
const SELECTOR_ITEM_LIST = '.browse-type + .container > .row, .browse-celeb-main-content + .container > .row'
const SELECTOR_PAGINATION_WRAPPER = '.nav.navbar-nav.navbar-center .lbtn-group.text-mid-center'

const UI_REMOVE_AD_BOXES = 'Remove Ad Video Blocks'
const UI_REMOVE_RECOMMENDATIONS = 'Remove Recommendation Sections'
const UI_REMOVE_SCREENSHOTS = 'Hide Screenshots'

class AZSearchAndUITweaks extends BrazenBaseSearchEnhancer
{
    constructor ()
    {
        super(SCRIPT_PREFIX, SELECTOR_ITEM)

        this._configurationManager.
            addFlagField(UI_REMOVE_AD_BOXES, 'Hides ads disguised inside the videos list.').
            addFlagField(UI_REMOVE_RECOMMENDATIONS, 'Hides recommendation sections').
            addFlagField(UI_REMOVE_SCREENSHOTS, 'Hides screenshots from videos on celeb and movie pages.')

        if (IS_SEARCH_PAGE) {
            this._paginator = BrazenPaginator.create($(SELECTOR_PAGINATION_WRAPPER), SELECTOR_ITEM_LIST, SELECTOR_ITEM, window.location.origin + $('.lbtn-next').prev().attr('href')).
                onGetPageNoFromUrl((url) => parseInt(url.split('/').pop().replace('.html', ''))).
                onGetPageUrlFromPageNo(
                    (newPageNo, paginator) =>
                        window.location.href.replace(paginator.getCurrentPageNo().toString(), newPageNo.toString())).
                onGetPaginationElementForPageNo(
                    (pageNo, paginator) =>
                        paginator.getPaginationWrapper().find(pageNo === paginator.getCurrentPageNo() ? '#menu' : 'a[href$="' + pageNo + '"]'))
        }

        this._addPaginationConfiguration()
        this._setupUI()
        this._setupCompliance()
        this._setupComplianceFilters()
    }

    _removeAdBoxes ()
    {
        if (this._configurationManager.getValue(UI_REMOVE_AD_BOXES)) {
            $('.ad-box-video').each((index, element) => {
                element.remove()
            })
        }
    }

    _removeRecommendationSections ()
    {
        if (this._configurationManager.getValue(UI_REMOVE_RECOMMENDATIONS)) {
            $('.recommended').each((index, element) => {
                element.remove()
            })
        }
    }

    _setupCompliance ()
    {
        this._onGetItemLists = () => $(SELECTOR_ITEM_LIST)

        this._onGetItemName = (item) => item.children('a > h4').text() + ' ' + item.children('a > p').text()
    }

    _setupComplianceFilters ()
    {
        this._addItemDurationRangeFilter(SELECTOR_ITEM_DURATION)
        this._addItemComplexComplianceFilter(
            UI_REMOVE_SCREENSHOTS, (value) => value && IS_SOURCE_PAGE, (item) => Validator.isChildMissing(item, 'a.picture'))
    }

    _setupUI ()
    {
        this._onBeforeUIBuild = () => {
            this._removeAdBoxes()
            this._removeRecommendationSections()
        }

        this._onUIBuild = () =>
            this._uiGen.createSettingsSection().append([
                this._uiGen.createTabsSection(['Filters', 'UI', 'Pagination', 'Global'], [
                    this._uiGen.createTabPanel('Filters', true).append([
                        this._configurationManager.createElement(FILTER_DURATION_RANGE),
                        this._configurationManager.createElement(UI_REMOVE_SCREENSHOTS),
                        this._uiGen.createSeparator(),
                        this._configurationManager.createElement(OPTION_DISABLE_COMPLIANCE_VALIDATION),
                    ]),
                    this._uiGen.createTabPanel('UI').append([
                        this._configurationManager.createElement(UI_REMOVE_AD_BOXES),
                        this._configurationManager.createElement(UI_REMOVE_RECOMMENDATIONS),
                    ]),
                    this._uiGen.createTabPanel('Pagination').append([
                        this._configurationManager.createElement(CONFIG_PAGINATOR_THRESHOLD),
                        this._configurationManager.createElement(CONFIG_PAGINATOR_LIMIT),
                    ]),
                    this._uiGen.createTabPanel('Global').append([
                        this._configurationManager.createElement(OPTION_ALWAYS_SHOW_SETTINGS_PANE),
                        this._uiGen.createSeparator(),
                        this._createSettingsBackupRestoreFormActions(),
                    ]),
                ]),
                this._createSettingsFormActions(),
                this._uiGen.createSeparator(),
                this._uiGen.createStatisticsFormGroup(FILTER_DURATION_RANGE, 'Duration'),
                this._uiGen.createStatisticsFormGroup(UI_REMOVE_SCREENSHOTS, 'Screenshots'),
                this._uiGen.createSeparator(),
                this._uiGen.createStatusSection(),
            ])

        this._onAfterUIBuild = () => {
            this._uiGen.getSelectedSection()[0].userScript = this
        }
    }
}

(new AZSearchAndUITweaks).init()