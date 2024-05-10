
// ==UserScript==
// @name         MULTI: behavior - fetch img links from galleries
// @version      0.1
// @description  To add a new site, @include it below with regex or @match if you don't know regex (ex. https://www.google.com/*). Then add the required info in the set_per_site_vars() function
// @author       You
// @include      /^http.*:\/\/.*urlgalleries\.net\/.+$/
// @include      /^http.*:\/\/(?:www\.)?(?:vip\.)?hqnp\.org\/content\/.+$/
// @include      /^http.*:\/\/(?:www\.)?imagefap\.com\/pictures\/.+$/
// @include      /^http.*:\/\/(?:www\.)?kitty-kats\.net\/threads\/.+$/
// @include      /^http.*:\/\/(?:www\.)?eropics\.to\/.+$/
// @include      /^http.*:\/\/(?:www\.)?vipergirls\.to\/threads\/.+$/
// @include      /^http.*:\/\/(?:www\.)?eroticity\.net\/threads\/.+$/
// @include      /^http.*:\/\/(?:www\.)?porn-w\.org\/topic.+$/
// @include      /^http.*:\/\/(?:www\.)?erohd\.net\/.+$/
// @include      /^http.*:\/\/(?:www\.)?greekfoot\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?hotgirlspics\.net\/.+$/
// @include      /^http.*:\/\/(?:www\.)?pinkfineart\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?thenude\.com\/cover\/.+$/
// @include      /^http.*:\/\/(?:www\.)?porncoven\.com\/threads\/.+$/
// @include      /^http.*:\/\/(?:www\.)?indexxx\.to\/threads\/.+$/
// @include      /^http.*:\/\/(?:www\.)?adultphotosets\.best\/softcore-photo-sets\/.+$/
// @include      /^http.*:\/\/(?:www\.)?adultphotosets\.best\/hardcore-photo-sets\/.+$/
// @include      /^http.*:\/\/(?:www\.)?photos18\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?hothag\.com\/galleries\/.+$/
// @include      /^http.*:\/\/(?:www\.)?imx\.to\/g\/.+$/
// @include      /^http.*:\/\/(?:www\.)?eroboom\..{2,3}\/photoset\/.+$/
// @include      /^http.*:\/\/(?:www\.)?nudemodels\.cc\/gallery\/.+$/
// @include      /^http.*:\/\/(?:www\.)?x3vid\.com\/gallery.+$/
// @include      /^http.*:\/\/(?:www\.)?teenporngallery\.net\/.+$/
// @include      /^http.*:\/\/(?:www\.)?celebmasta\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?thefappeningblog\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?fappeningbook\.com\/.+$/
// @include      /^http.*:\/\/(?:www\.)?nudemodels\.cc\/.+$/
// @include      /^http.*:\/\/(?:www\.)?gjbisai\.info\/index\.php\/artdetail-.+$/
// @include      /^http.*:\/\/(?:www\.)?xfobo\.com\/showthread\.php.+$/
// @include      /^http.*:\/\/(?:www\.)?jpegworld\.com\/galleries\/.+$/
// @include      /^http.*:\/\/(?:www\.)?poiski\.pro\/vk\/user\/.+$/
// @include      /^http.*:\/\/(?:www\.)?hotpic\.cc\/album\/.+$/
// @include      /^http.*:\/\/(?:www\.)?xchina\.pro\/photo\/id.+$/
// @match        *://onpornpics.com/*
// @match        *://fapodrom.com/*
// @match        *://girlsreleased.com/*
// @match        *://babe.today/pics/*
// @match        *://glam0ur.net/*
// @match        *://pornpics.pictures/*
// @match        *://bondage.gallery/*
// @match        *://yespornpics.com/*
// @match        *://models-galleries.com/showthread.php?*
// @match        *://hot-foto.com/*
// @match        *://www.sishisp.top/index.php/artdetail*
// @grant        GM_setClipboard
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';

    /****************************************************/
    // GLOBALS
    /****************************************************/

    let URL_OBJ = new URL(window.location.href);

    //---------------------------------------------------
    // Working

    let SET_NAME = "";
    let PAGE_NUMBER = 1;
    let COUNTER = 1;
    let OUTPUT = [];
    let ERRORS = [];

    //---------------------------------------------------
    // Per site

    // Manditory
    let GALLERY_IMGS_SELECTOR = ""; // MUST BE SET

    // Optional
    let COPY_GALLERY_IMGS_SRCS = false; // by default, the href of the parent <a> element of each image is copied, but if the gallery has full size image in it, set this to true
    let FULL_SIZE_IMG_SELECTOR = ""; // setting this essentially means the script will open all the gallery img links and retrieve the full-size image link (must be on the same site)
    let PAGINATION_LINKS_SELECTOR = ""; // setting this tells the script you're dealing with a multi-page gallery. It gets all page links and loops to see if one called "next" exists
    let POST_WRAPPER_SELECTOR = ""; // setting this tells the script it needs the user to select a post. The selector is used to verify that it was clicked within post.
    let DIFFERENT_METHOD = false; // setting this means a completely different method needs to be used (it needs to be defined)

    /****************************************************/
    // INITIALIZE (START)
    /****************************************************/

    init();
    function init()
    {
        set_per_site_vars();
        add_html();
    }

    function set_per_site_vars()
    {
        if (URL_OBJ.host.includes("urlgalleries.net")) {
            GALLERY_IMGS_SELECTOR = `#wtf img`;
            DIFFERENT_METHOD = true;
        }
        else if (URL_OBJ.host.includes("hqnp.org")) {
            DIFFERENT_METHOD = true;
        }
        else if (URL_OBJ.host.includes("imagefap.com")) {
            GALLERY_IMGS_SELECTOR = `#gallery img:not([src*="ajax-loader"])`;
            PAGINATION_LINKS_SELECTOR = `a[class^="link3"]`;
        }
        else if (URL_OBJ.host.includes("kitty-kats.net") || URL_OBJ.host.includes("indexxx.to")) {
            GALLERY_IMGS_SELECTOR = ".message-userContent .bbImage";
        }
        else if (URL_OBJ.host.includes("eropics.to")) {
            GALLERY_IMGS_SELECTOR = ".entry-content img";
        }
        else if (URL_OBJ.host.includes("erohd.net")) {
            GALLERY_IMGS_SELECTOR = ".sigFreeImg";
        }
        else if (URL_OBJ.host.includes("vipergirls.to") || URL_OBJ.host.includes("eroticity.net") || URL_OBJ.host.includes("porncoven.com") || URL_OBJ.host.includes("xfobo.com")) {
            GALLERY_IMGS_SELECTOR = "img";
            POST_WRAPPER_SELECTOR = `div[id^="post_message_"]`;
        }
        else if (URL_OBJ.host.includes("porn-w.org")) {
            GALLERY_IMGS_SELECTOR = "img";
            POST_WRAPPER_SELECTOR = `.message-body`;
        }
        else if (URL_OBJ.host.includes("greekfoot.com")) {
            GALLERY_IMGS_SELECTOR = "img";
            POST_WRAPPER_SELECTOR = `div[id^="msg_"], div[class="list_posts"]`;
        }
        else if (URL_OBJ.host.includes("hotgirlspics.net")) {
            GALLERY_IMGS_SELECTOR = `.entry-content img:not([loading]):not([title])`;
        }
        else if (URL_OBJ.host.includes("pinkfineart.com")) {
            GALLERY_IMGS_SELECTOR = `a[id^="pic"] img`;
        }
        else if (URL_OBJ.host.includes("adultphotosets.best")) {
            GALLERY_IMGS_SELECTOR = `article[class*="fullstory"] img`;
        }
        else if (URL_OBJ.host.includes("girlsreleased.com")) {
            GALLERY_IMGS_SELECTOR = `#set_list .setthumbs img`;
        }
        else if (URL_OBJ.host.includes("thenude.com")) {
            GALLERY_IMGS_SELECTOR = `#lightgallery .gallery-thumb`;
        }
        else if (URL_OBJ.host.includes("photos18.com")) {
            GALLERY_IMGS_SELECTOR = `#content .imgHolder img`;
        }
        else if (URL_OBJ.host.includes("eroboom")) {
            GALLERY_IMGS_SELECTOR = `#jc img`;
        }
        else if (URL_OBJ.host.includes("hothag.com")) {
            GALLERY_IMGS_SELECTOR = `#gal_blk a img`;
        }
        else if (URL_OBJ.host.includes("imx.to")) {
            GALLERY_IMGS_SELECTOR = `#content .imgtooltip`;
        }
        else if (URL_OBJ.host.includes("nudemodels.cc")) {
            GALLERY_IMGS_SELECTOR = `#album img`;
            COPY_GALLERY_IMGS_SRCS = true;
        }
        else if (URL_OBJ.host.includes("x3vid.com")) {
            GALLERY_IMGS_SELECTOR = `#my-posts a figure img`;
            PAGINATION_LINKS_SELECTOR = `.pagination a`;
            FULL_SIZE_IMG_SELECTOR = `img[class="slide-img"]`;
        }
        else if (URL_OBJ.host.includes("teenporngallery.net")) {
            GALLERY_IMGS_SELECTOR = `td a img:not([class]):not([src$=".gif"])`;
        }
        else if (URL_OBJ.host.includes("celebmasta.com")) {
            GALLERY_IMGS_SELECTOR = `.entry-content a img`;
            COPY_GALLERY_IMGS_SRCS = true;
        }
        else if (URL_OBJ.host.includes("thefappeningblog.com")) {
            GALLERY_IMGS_SELECTOR = `#content a img`;
        }
        else if (URL_OBJ.host.includes("fappeningbook.com")) {
            GALLERY_IMGS_SELECTOR = `.my-gallery a[href^="https://fappeningbook"] img`;
            FULL_SIZE_IMG_SELECTOR = `.big-photo-dv a img`;
            PAGINATION_LINKS_SELECTOR = `.pages-dv a`;
        }
        else if (URL_OBJ.host.includes("nudemodels.cc")) {
            GALLERY_IMGS_SELECTOR = `.container .col-md-7 img[width="auto"]`;
        }
        else if (URL_OBJ.host.includes("gjbisai.info")) {
            GALLERY_IMGS_SELECTOR = `.video-holder .embed-responsive img`;
            COPY_GALLERY_IMGS_SRCS = true;
        }
        else if (URL_OBJ.host.includes("onpornpics.com")) {
            GALLERY_IMGS_SELECTOR = `.bikoh-gallery img`;
        }
        else if (URL_OBJ.host.includes("fapodrom.com")) {
            GALLERY_IMGS_SELECTOR = `.demo-gallery img`;
        }
        else if (URL_OBJ.host.includes("babe.today")) {
            GALLERY_IMGS_SELECTOR = `.jpeg.round > a > img`;
        }
        else if (URL_OBJ.host.includes("glam0ur.net")) {
            GALLERY_IMGS_SELECTOR = "img";
            POST_WRAPPER_SELECTOR = `div[id^="post_message_"]`;
        }
        else if (URL_OBJ.host.includes("pornpics.pictures")) {
            GALLERY_IMGS_SELECTOR = `.pix li a[href^="/media"] img`;
        }
        else if (URL_OBJ.host.includes("bondage.gallery")) {
            GALLERY_IMGS_SELECTOR = `.thumbs li a:not([href*="vip"]) img`;
        }
        else if (URL_OBJ.host.includes("yespornpics.com")) {
            GALLERY_IMGS_SELECTOR = `.flex8 .jpeg a img`;
        }
        else if (URL_OBJ.host.includes("models-galleries.com")) {
            GALLERY_IMGS_SELECTOR = `.post_content a img`;
        }
        else if (URL_OBJ.host.includes("hot-foto.com")) {
            GALLERY_IMGS_SELECTOR = `.full-news a img`;
        }
        else if (URL_OBJ.host.includes("sishisp.top")) {
            GALLERY_IMGS_SELECTOR = `.player .embed-responsive img`;
            COPY_GALLERY_IMGS_SRCS = true;
        }
        else if (URL_OBJ.host.includes("jpegworld.com")) {
            GALLERY_IMGS_SELECTOR = `.gallery-inner-col.inner-col img`;
        }
        else if (URL_OBJ.host.includes("poiski.pro")) {
            GALLERY_IMGS_SELECTOR = `.img_thumb_lightgallery`;
        }
        else if (URL_OBJ.host.includes("hotpic.cc")) {
            GALLERY_IMGS_SELECTOR = `.hotgrid.row.g-1 img`;
        }
        else if (URL_OBJ.host.includes("xchina.pro")) {
            GALLERY_IMGS_SELECTOR = `.photos > a img`;
        }

        // Validate
        if (COPY_GALLERY_IMGS_SRCS && FULL_SIZE_IMG_SELECTOR) {
            alert("COPY_GALLERY_IMGS_SRCS and FULL_SIZE_IMG_SELECTOR can't be both set");
            throw new Error("COPY_GALLERY_IMGS_SRCS and FULL_SIZE_IMG_SELECTOR can't be both set");
        }
        if (PAGINATION_LINKS_SELECTOR && POST_WRAPPER_SELECTOR) {
            alert("PAGINATION_LINKS_SELECTOR and POST_WRAPPER_SELECTOR can't be both set");
            throw new Error("PAGINATION_LINKS_SELECTOR and POST_WRAPPER_SELECTOR can't be both set");
        }

    }

    function add_html()
    {
        let styleHtml =
            `<style id="generalStyle">
                #sideBtn {position: fixed; top: 50%; display: block; font-size: 1.2rem; padding: 5px; background: green; border: 3px solid red; cursor: pointer; z-index: 99999999;}

                #custMsg {position:fixed; top:0; left: 50%; font-size:1rem; padding:10px; width:max-content; z-index: 99999999;}
                .genericCustMsg {background:blue; color:white;}
                .successCustMsg {background:green; color:white;}
                .errorCustMsg {background:red; color:white;}
            </style>`;
        document.querySelector(`html`).appendChild(html_to_node(styleHtml));

        let buttonsHtml = `<button id="sideBtn">Links</button>`;
        document.querySelector(`html`).appendChild(html_to_node(buttonsHtml));

        document.querySelector("#sideBtn").addEventListener("click", run);
    }

    /****************************************************/
    // RUN
    /****************************************************/

    async function run()
    {
        // Reset variables from last use
        SET_NAME = "";
        PAGE_NUMBER = 1;
        COUNTER = 1;
        OUTPUT = [];
        ERRORS = [];

        // Remove previous output
        try {document.querySelector("#outputBlock").remove();} catch(err) {}

        // Get the name of the gallery/set from the user
        SET_NAME = get_set_name_user_input();
        if (!SET_NAME) return;

        // Get the links
        if (DIFFERENT_METHOD) await different_methods();
        else await standard_emthod();

        // Output
        display_msg(`Finished getting links.`);
        //display_output();
        let crawljobSaveSuccess = await save_as_crawljob_file();
        if (FULL_SIZE_IMG_SELECTOR || ERRORS.length > 0 || !crawljobSaveSuccess) display_output();
    }

    //---------------------------------------------------
    // Get set name user input

    // This is a seperate function because it could get longer if I decide to add more auto-generated names
    function get_set_name_user_input()
    {
        if (URL_OBJ.host.includes("sishisp.top")) {
            return "sishisp.top - artdetail - " + document.location.href.split("artdetail-").pop().split(".html")[0];
        }
        else if (URL_OBJ.host.includes("poiski.pro")) {
            return "vk.com - " + document.querySelector(".main h1").innerText.trim() + " - " + document.location.href.split("user/id")[1].trim();
        }
        else if (URL_OBJ.host.includes("xchina.pro")) {
            return "xchina - " + window.location.href.split("id-")[1].split("/")[0].split(".html")[0];
        }
        return prompt("ENTER NAME OF SET:").trim();
    }

    //---------------------------------------------------
    // Methods to get links

    async function standard_emthod()
    {
        let curUrl = get_starting_url();

        while(curUrl)
        {
            if (PAGINATION_LINKS_SELECTOR) display_msg(`Working on page ${PAGE_NUMBER}`);

            let domElem = await get_dom_element(curUrl);

            if (domElem) {
                if (FULL_SIZE_IMG_SELECTOR) await fetch_fullsize_links(domElem);
                else get_links_from_gallery(domElem);
            }
            else {
                ERRORS.push(`FAILED TO FETCH PAGE:\n${curUrl}\n`);
            }

            if (!PAGINATION_LINKS_SELECTOR) {
                break;
            }
            else {
                curUrl = get_next_page_url(domElem);
                PAGE_NUMBER++;
            }
        }
    }

    // define each different method's name as the site
    async function different_methods()
    {
        if (URL_OBJ.host.includes("hqnp.org")) {
            // There is a "Download Album button, which is a textarea containing all the links"
            try {
                let linksArr = document.querySelector(`#getall textarea[name="photos"]`).value.trim().split("\n");
                for (let link of linksArr) {
                    OUTPUT.push(link + "#custnum=" + COUNTER);
                    COUNTER += 1;
                }
            }
            catch(err) {
                ERRORS.push(`FAILED TO GET LINKS`);
            }
        }
        else if (URL_OBJ.host.includes("urlgalleries.net")) {
            // by adding "&a=10000" to the end you get all the images on one page
            let url = window.location.href;
            let domElem;
            if (url.includes("&a=10000")) domElem = document;
            else domElem = await fetch_html_data(url.split("?")[0].split("&")[0] + "&a=10000", null, GALLERY_IMGS_SELECTOR);
            if (!domElem) ERRORS.push(`FAILED TO GET LINKS`);
            get_links_from_gallery(domElem);
        }
    }

    //---------------------------------------------------
    // Standard method helpers

    // The starting url is either the link itself, assuming there are no pages, or the link to the first page, which this function tries to get
    function get_starting_url()
    {
        if (!PAGINATION_LINKS_SELECTOR) return window.location.href;

        let allPaginationElems = document.querySelectorAll(PAGINATION_LINKS_SELECTOR);
        for (let elem of allPaginationElems)
        {
            try {
                if (elem.innerText.toLowerCase().includes("first") || elem.innerText.trim() == "1") return elem.href;
            } catch(err) {}
        }

        return window.location.href;
    }

    // The dom element can be either:
    // a fetched page - when multiple pages
    // a post element - if user needs to select it
    // the document element of the url loaded in the browser - assuming no pages and no user selection is required
    async function get_dom_element(curUrl)
    {
        let domElem;

        if (PAGINATION_LINKS_SELECTOR) domElem = await fetch_html_data(curUrl, null, GALLERY_IMGS_SELECTOR);
        else if (POST_WRAPPER_SELECTOR) domElem = await get_user_post_selection();
        else domElem = document;

        return domElem;


        async function get_user_post_selection()
        {
            document.querySelector("body").addEventListener("click", get_user_post_selection_handler);
            display_msg("Click on the post body you wish to select...");

            let postDom = false;
            while (!postDom) await delay(100);
            return postDom;

            function get_user_post_selection_handler(event)
            {
                let elem = event.target;
                let matchedElem = elem.closest(POST_WRAPPER_SELECTOR); // closest(cssQuery) returns the first parent element matching the selector, null if no match
                if (matchedElem) {
                    document.querySelector("body").removeEventListener("click", get_user_post_selection_handler);
                    postDom = matchedElem;
                }
                else {
                    display_msg("Improper selection, try again", "errorCustMsg");
                }
            }
        }
    }

    // All the images on the page are opened seperatly and the full size image link is acquired from their individual pages
    async function fetch_fullsize_links(domElem)
    {
        let antiConjestionCounter = 0; // prevents making too many simintanois requests - aka for ex. not wating on 200 iamges at once
        let antiConjestionLimit = 20;

        let allGalleryImgElems = domElem.querySelectorAll(GALLERY_IMGS_SELECTOR);
        let promises = [];

        for (let imgElem of allGalleryImgElems)
        {
            if (antiConjestionCounter == antiConjestionLimit) {
                antiConjestionCounter = 0;
                display_msg(`Waiting for the most recent ${antiConjestionLimit} images to fetch`);
                await Promise.all(promises);
            }

            let link = get_image_link(imgElem);
            if (link) {
                promises.push(get_fullsize_link(link, COUNTER));
                antiConjestionCounter += 1;
                display_msg(`Started image ${COUNTER}`);
                await delay(100); // wait before you add the new promise since some sites don't support going too fast
            } else {
                ERRORS.push(`NO IMG LINK ELEMENT\n${imgElem.src}\n`);
            }
            COUNTER += 1;
        }

        display_msg(`Waiting for images on page ${PAGE_NUMBER} to fetch`);
        await Promise.all(promises);

        async function get_fullsize_link(fullSizeImgPageUrl, counterAtTheTime)
        {
            try {
                let singleImgPageDom = await fetch_html_data(fullSizeImgPageUrl, null, FULL_SIZE_IMG_SELECTOR);
                let fullSizeImgLink = singleImgPageDom.querySelector(FULL_SIZE_IMG_SELECTOR).src;
                OUTPUT.push(fullSizeImgLink + "#custnum=" + counterAtTheTime);
            }
            catch(err) {
                ERRORS.push(`FAILED TO FETCH FULL SIZE IMAGE LINK:\n${fullSizeImgPageUrl}\n`);
            }
        }
    }

    function get_links_from_gallery(domElem)
    {
        let allGalleryImgElems = domElem.querySelectorAll(GALLERY_IMGS_SELECTOR);

        for (let imgElem of allGalleryImgElems)
        {
            let link = get_image_link(imgElem);
            if (link) OUTPUT.push(link + "#custnum=" + COUNTER);
            else ERRORS.push(`NO IMG LINK ELEMENT\n${imgElem.src}\n`);
            COUNTER++;
        }
    }

    // This one returns the image link based on per-set prefernces (image source vs href)
    function get_image_link(imgElem)
    {
        if (COPY_GALLERY_IMGS_SRCS) {
            return imgElem.src;
        }
        else {
            let linkElem = imgElem.closest("a");
            if (linkElem) return linkElem.href;
            else return false;
        }
    }

    function get_next_page_url(domElem)
    {
        let allPaginationElems = domElem.querySelectorAll(PAGINATION_LINKS_SELECTOR);
        for (let elem of allPaginationElems)
        {
            try {
                if (elem.innerText.toLowerCase().includes("next") || elem.getAttribute("rel").toLowerCase().includes("next")) return elem.href;
            } catch(err) {}
        }
        return null;
    }

    //---------------------------------------------------
    // Output options (configure at the bottom of the run function which one to use and when)

    async function contact_jdownloader()
    {
        // used so that the form doesn't load a new page or open a new window
        try {document.querySelector("#jdFrame").remove()} catch(e) {}
        let frameHtml = `<iframe id="jdFrame" name="jdownloader-frame" style="width:100%;" hidden></iframe>`;
        document.querySelector("body").appendChild(html_to_node(frameHtml));

        try {document.querySelector("#jdForm").remove()} catch(e) {}
        let formHtml = `<form id='jdForm' action='http://127.0.0.1:9666/flash/add' method='POST' target='jdownloader-frame'><input type="hidden" name="source" value="tampermonkey"/><input type="hidden" name="package" value="${SET_NAME}"/><input id="jdUrlsInput" type="hidden" name="urls" value="${OUTPUT.join("<br>")}"/></form>`;
        document.querySelector("body").appendChild(html_to_node(formHtml));

        let formElem = document.querySelector("#jdForm");
        formElem.submit();
    }

    async function save_as_crawljob_file()
    {
        let outputStr = OUTPUT.join("<br>");

        let outputObj =
            [
                {
                    //forcedStart: "TRUE",
                    //autoConfirm: "TRUE",
                    text: outputStr,
                    packageName: SET_NAME
                }
            ];

        let base64Encoded = utf8ToBase64(JSON.stringify(outputObj));

        let containsImxLinks = (outputStr.includes("imx")) ? true : false; // much slower to download
        let fileName = (containsImxLinks) ? `${SET_NAME}.crawljob` : `(not imx) ${SET_NAME}.crawljob`

        GM_download({
            url:`data:text/plain;base64,${base64Encoded}`,
            name:fileName,
            saveAs:false,
            onerror:()=>{display_msg(`FAILED SAVING FILE`, "errorCustMsg"); return false;},
            onload:()=>{display_msg(`FILE SAVED with ${OUTPUT.length} links`, "successCustMsg")}
        });

        return true;

        function utf8ToBase64(str) {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            let base64 = '';

            for (let i = 0; i < data.length; i++) {
                base64 += String.fromCharCode(data[i]);
            }

            return btoa(base64);
        }
    }

    function display_output()
    {
        let html =
            `<div id="outputBlock" style="position:fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width:auto; height: auto; max-height: 750px; overflow: scroll; background:black; border: 5px dotted gray;">

                <div id="windowDecoration" style="display:block; background: rgb(62, 62, 62); overflow: hidden; color: white;">
                    <div class="leftSide" style="float: left; padding-left: 10px;">
                        Output shown due to errors
                    </div>
                    <div class="rightSide" style="float: right; padding-left: 10px;">
                        <div id="rightSideButtonsContainer" style="display: flex;">
                            <!--<button id="minimizeOutput" style="background: #9f722d;">_</button>-->
                            <!--<button id="toggleFullscreenOutput" style="background: #3d4a90;">▢</button>-->
                            <button id="removeOutput" style="background: red;">X</button>
                        </div>
                    </div>
                </div>

                <div id="setNameInfo" class="infoBlock" style="color: #2a379f;">
                    <p>SET NAME</p>
                    <p><input type="text" id="setname" style="border-color: #2a379f;" readonly/></p>
                    <p><button id="copySetNameBtn" style="background: #2a379f;">Copy</button></p>
                </div>

                <div id="outputInfo" class="infoBlock" style="color: #056905;">
                    <p>OUTPUT (${OUTPUT.length} links):</p>
                    <p><textarea id="out" style="border-color: #056905;" readonly></textarea></p>
                    <p><button id="copyLinksBtn" style="background: #056905;">Copy</button></p>
                </div>

                <div id="errorsInfo" class="infoBlock" style="color:#a91a1a;">
                    <p>ERRORS:</p>
                    <p><textarea id="err" style="border-color:#a91a1a;" readonly></textarea></p>
                </div>

                <style>
                    #outputBlock textarea, #outputBlock input {width:500px; border:2px solid; background:rgb(20, 20, 20); color: white; box-sizing: border-box;}
                    #outputBlock textarea {height:200px;}
                    #outputBlock button {border: none; padding: 2px; cursor: pointer;}
                    #outputBlock #windowDecoration button {padding: 2px 10px; color: white; display: flex; flex-grow: 1; align-items: center; justify-content: center;}
                    #outputBlock .infoBlock {margin-bottom: 10px; padding: 10px;}
                    #outputBlock .infoBlock:last-child {margin-bottom: 0px;}
                </style>
            </div>`;

        document.querySelector("html").appendChild(html_to_node(html));

        document.querySelector("#setname").value = SET_NAME;
        document.querySelector("#out").value = OUTPUT.join("\n");
        document.querySelector("#err").value = ERRORS.join("\n");

        document.querySelector("#copySetNameBtn").addEventListener("click", ()=>{
            GM_setClipboard(SET_NAME, "text");
            display_msg(`COPIED SET NAME`, "successCustMsg");
        });
        document.querySelector("#copyLinksBtn").addEventListener("click", ()=>{
            GM_setClipboard(document.querySelector("#out").value, "text");
            display_msg(`COPIED ${OUTPUT.length} links`, "successCustMsg");
        });
        document.querySelector("#removeOutput").addEventListener("click", ()=>{
            try {document.querySelector("#outputBlock").remove();} catch(err) {}
        });
    }

    function copy_outout_to_clipboard() {
        GM_setClipboard(OUTPUT.join("\n"), "text");
        display_msg(`COPIED ${OUTPUT.length} links`, "successCustMsg");
    }

    /****************************************************/
    // GLOBAL HELPERS
    /****************************************************/

    async function display_msg(text, htmlClass="genericCustMsg")
    {
        let prevMsg = document.querySelector(`#custMsg`);
        if (prevMsg) prevMsg.remove();
        document.querySelector(`html`).appendChild(html_to_node(`<p id="custMsg" class="${htmlClass}">${text}</p>`));
    }

    /****************************************************/
    // GENERIC HELPERS
    /****************************************************/

    function html_to_node(code)
    {
        let tempWrapper = document.createElement("div");
        tempWrapper.innerHTML = code;
        if (tempWrapper.childElementCount == 1) tempWrapper = tempWrapper.firstChild;
        return tempWrapper;
    }

    // Some sites like hqnp will return a page BUT something like "You're magic is wating...". So you need to keep making requests until it returns the right page.
    async function fetch_html_data(url, formData, selectorToTest)
    {
        let attempts = 0;
        while (attempts < 200) {
            try {
                let response;
                if (!formData) response = await fetch(url, {method: 'get', credentials: 'include'});
                else response = await fetch(url, {method: 'get', credentials: 'include', body: formData});
                let htmlString = await response.text();
                let parser = new DOMParser();
                let pageDom = parser.parseFromString(htmlString, "text/html");
                pageDom.querySelector(selectorToTest).getAttribute("test");
                return pageDom;
            }
            catch(err) {
                await delay(100);
            }

            attempts += 1;
        }
        return false;
    }

    function delay(durationMs)
    {
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }
})();