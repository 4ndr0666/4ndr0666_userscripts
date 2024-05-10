// ==UserScript==
// @name Video / Gif / Image downloader from the redgifs.com
// @description Creates a button on the sidebar to load the currently playing video/image. When you click the button, the file is downloaded after a short time. Stream advertisements have also been removed.
// @match https://redgifs.com
// @match https://redgifs.com/*
// @namespace RedGifsDownloader
// @author Maxim Harder & whtb
// @license MIT
// @version 2.3.0
// @run-at document-start
// @downloadURL https://update.sleazyfork.org/scripts/483255/Video%20%20Gif%20%20Image%20downloader%20from%20the%20redgifscom.user.js
// @updateURL https://update.sleazyfork.org/scripts/483255/Video%20%20Gif%20%20Image%20downloader%20from%20the%20redgifscom.meta.js
// ==/UserScript==


var video_src, storage_id;
var str = `<button class="download-mod FSButton"><img src="https://iili.io/JRN7osn.png" style=" color: #fff; width: 28px; height: 28px;" ></button>`;
var str_gl = `<button class="download-mod-gl FSButton"><img src="https://iili.io/J5n5T6Q.png" style=" color: #fff; width: 30px; height: 30px;" ></button>`;
var download_btn_gl = document.createElement('li');
var download_btn = document.createElement('li');
download_btn.innerHTML = str;
download_btn_gl.innerHTML = str_gl;
download_btn.classList.add("SideBar-Item");
download_btn_gl.classList.add("SideBar-Item");


function fetchFile(url) {
    fetch(url).then(res => res.blob()).then(file => {
        let tempUrl = URL.createObjectURL(file);
        const aTag = document.createElement("a");
        aTag.href = tempUrl;
        aTag.download = url.replace(/^.*[\\\/]/, '').slice(0, -127);
        document.body.appendChild(aTag);
        aTag.click();
        URL.revokeObjectURL(tempUrl);
        aTag.remove();
    }).catch(() => {
        alert("Failed to download file!");

    });
}

function getGallery() {
     if ( document.querySelector('.Player_isActive .download-mod-gl')==null) document.querySelector('.Player_isActive ul[class="SideBar"]').insertAdjacentElement('beforeend', download_btn_gl);
}

function rmAds(){
    if (document.querySelector(".SideBar-Item [class^='LiveButton']") != null) {
        document.querySelectorAll(".SideBar-Item [class^='LiveButton']").forEach((ad) => ad.parentElement.parentElement.remove())
    }
}

function getVideoDownloadMod() {
    video_src = document.querySelector('.Player_isActive').querySelector('video, img.ImageGif-Thumbnail, .swiper-slide-active img.GalleryGif-Image').src;
    if ( document.querySelector('.Player_isActive .download-mod')==null) document.querySelector('.Player_isActive ul[class="SideBar"]').insertAdjacentElement('beforeend', download_btn);
}

download_btn.addEventListener('click',function() {
    if(video_src!="") {
        fetchFile(video_src);
    }
});

download_btn_gl.addEventListener('click',function() {
    document.querySelector('.Player_isActive').querySelectorAll('img.GalleryGif-Image').forEach((element) => fetchFile(element.src));
});

setInterval(() => {
    if (document.querySelector('.Player_isActive')!=null) if (document.querySelector('.Player_isActive').querySelector('video, img.ImageGif-Thumbnail,  .swiper-slide-active img.GalleryGif-Image')!=null){ getVideoDownloadMod(); rmAds ();}
    if (document.querySelector('.Player_isActive .GalleryGif-Image')!=null) getGallery();
}, 1);

window.onload = function() {
    let style = document.createElement('style');
    style.innerHTML = `[class="wPZ+D9-J"]{ display: none;}`;
    document.head.appendChild(style); };