// ==UserScript==
// @name        Facebook video downloader
// @icon        https://www.facebook.com/favicon.ico
// @namespace   Violentmonkey Scripts
// @match       https://www.facebook.com/*
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      https://github.com/HoangTran0410
// @description Download any video on Facebook (post/chat/comment)
// @license MIT
// ==/UserScript==

(() => {
  function getOverlapScore(el) {
    var rect = el.getBoundingClientRect();
    return (
      Math.min(
        rect.bottom,
        window.innerHeight || document.documentElement.clientHeight
      ) - Math.max(0, rect.top)
    );
  }

  function getVideoIdFromVideoElement(video) {
    try {
      for (let k in video.parentElement) {
        if (k.startsWith("__reactProps")) {
          return video.parentElement[k].children.props.videoFBID;
        }
      }
    } catch (e) {
      return null;
    }
  }

  async function getWatchingVideoId() {
    let allVideos = Array.from(document.querySelectorAll("video"));
    let result = [];

    for (let video of allVideos) {
      let videoId = getVideoIdFromVideoElement(video);
      if (videoId) {
        result.push({
          videoId,
          overlapScore: getOverlapScore(video),
        });
      }
    }

    return result
      .sort((a, b) => b.overlapScore - a.overlapScore)
      .map((_) => _.videoId)[0];
  }

  async function getVideoUrlFromVideoId(videoId) {
    try {
      let dtsg = await getDtsg();
      return await getLinkFbVideo2(videoId, dtsg);
    } catch (e) {
      return await getLinkFbVideo1(videoId);
    }
  }

  async function getLinkFbVideo2(videoId, dtsg) {
    let res = await fetch(
      "https://www.facebook.com/video/video_data_async/?video_id=" + videoId,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: stringifyVariables({
          __a: "1",
          fb_dtsg: dtsg,
        }),
      }
    );

    let text = await res.text();
    text = text.replace("for (;;);", "");
    let json = JSON.parse(text);

    const { hd_src, hd_src_no_ratelimit, sd_src, sd_src_no_ratelimit } =
      json?.payload || {};

    return hd_src_no_ratelimit || hd_src || sd_src_no_ratelimit || sd_src;
  }

  async function getLinkFbVideo1(videoId, dtsg) {
    let res = await fetchGraphQl("5279476072161634", {
      UFI2CommentsProvider_commentsKey: "CometTahoeSidePaneQuery",
      caller: "CHANNEL_VIEW_FROM_PAGE_TIMELINE",
      displayCommentsContextEnableComment: null,
      displayCommentsContextIsAdPreview: null,
      displayCommentsContextIsAggregatedShare: null,
      displayCommentsContextIsStorySet: null,
      displayCommentsFeedbackContext: null,
      feedbackSource: 41,
      feedLocation: "TAHOE",
      focusCommentID: null,
      privacySelectorRenderLocation: "COMET_STREAM",
      renderLocation: "video_channel",
      scale: 1,
      streamChainingSection: !1,
      useDefaultActor: !1,
      videoChainingContext: null,
      videoID: videoId,
    });
    let text = await res.text();

    let a = JSON.parse(text.split("\n")[0]),
      link = a.data.video.playable_url_quality_hd || a.data.video.playable_url;

    return link;
  }

  function fetchGraphQl(doc_id, variables) {
    return fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: stringifyVariables({
        doc_id: doc_id,
        variables: JSON.stringify(variables),
        fb_dtsg: dtsg,
        server_timestamps: !0,
      }),
    });
  }

  function stringifyVariables(d, e) {
    let f = [],
      a;
    for (a in d)
      if (d.hasOwnProperty(a)) {
        let g = e ? e + "[" + a + "]" : a,
          b = d[a];
        f.push(
          null !== b && "object" == typeof b
            ? stringifyVariables(b, g)
            : encodeURIComponent(g) + "=" + encodeURIComponent(b)
        );
      }
    return f.join("&");
  }

  async function getDtsg() {
    return require("DTSGInitialData").token;
  }

  function downloadURL(url, name) {
    var link = document.createElement("a");
    link.target = "_blank";
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadWatchingVideo() {
    try {
      let watchingVideoId = await getWatchingVideoId();
      if (!watchingVideoId) throw Error("Không tìm thấy video nào");

      let videoUrl = await getVideoUrlFromVideoId(watchingVideoId);

      if (videoUrl) {
        downloadURL(videoUrl, "fb_video.mp4");
      } else throw Error("Không tìm được video link");
    } catch (e) {
      alert("ERROR: " + e);
    }
  }

  function resisterMenuCommand() {
    GM_registerMenuCommand("Download watching video", downloadWatchingVideo);
  }

  resisterMenuCommand();
})();
