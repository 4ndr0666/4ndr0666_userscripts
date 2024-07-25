// ==UserScript==
// @name         网页中英双显互译
// @name:en      Translation between Chinese and English
// @namespace    http://yeyu1024.xyz
// @version      1.8.4
// @description  中-英-外互转，双语显示。支持谷歌，微软等API，为用户提供了快速准确的中英文翻译服务。无论是在工作中处理文件、学习外语、还是在日常生活中与国际友人交流，这个脚本都能够帮助用户轻松应对语言障碍。通过简单的操作，用户只需点击就会立即把网页翻译，节省了用户手动查词或使用在线翻译工具的时间，提高工作效率。
// @description:en  Web pages translated into Chinese, English and foreign languages
// @description:de  Webseite in Chinesisch, Englisch, Fremdsprachen
// @description:ru  Перевод страницы на китайский, английский и иностранные языки
// @description:ar  صفحة الإنترنت الصينية و الإنجليزية و اللغات الأجنبية
// @description:ja ホームページ中国語、英語、外国語の翻訳
// @description:ko  WEB 중국어, 영어, 외국어 상호 번역
// @description:fr  Traduction de pages Web en chinois, anglais, langues étrangères vers et depuis
// @description:pt  Tradução de páginas da Web para chinês, inglês e língua estrangeira
// @author       夜雨
// @match        *://*/*
// @exclude      *://*.baidu.com/*
// @exclude      *://localhost:*/*
// @exclude      *://127.0.0.1:*/*
// @exclude      *://*.bilibili.com/*
// @exclude      *://*.jd.com/*
// @exclude      *://*.taobao.com/*
// @exclude      *://*.iqiyi.com/*
// @exclude      *://*.360.cn/*
// @exclude      *://*.gov.cn/*
// @exclude      *://*.12306.cn/*
// @exclude      *://*.ctrip.com/*
// @exclude      *://*.hao123.com/*
// @exclude      *://*.youku.com/*
// @exclude      *://*.aliyun.com/*
// @exclude      *://*.shushubuyue.net/*
// @exclude      *://*.shushubuyue.com/*
// @exclude      *://onfix.cn/*
// @exclude      *://yeyu2048.xyz/*
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=translate.google.com
// @require      https://cdn.staticfile.org/jquery/3.4.0/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/toastr.js/2.1.4/toastr.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
// @resource toastCss  https://cdn.bootcdn.net/ajax/libs/toastr.js/2.1.4/toastr.min.css
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @connect      api-edge.cognitive.microsofttranslator.com
// @connect      edge.microsoft.com
// @connect      fanyi-api.baidu.com
// @connect      translate.googleapis.com
// @connect      fanyi.sogou.com
// @connect      ifanyi.iciba.com
// @connect      dict.hjenglish.com
// @connect      openapi.youdao.com
// @connect      caiyunai.com
// @connect      caiyunapp.com
// @connect      transmart.qq.com
// @connect      translate.alibaba.com
// @connect      papago.naver.com
// @connect      m.youdao.com
// @connect      worldlingo.com
// @connect      deepl.com
// @connect      fanyi.baidu.com
// @connect      flitto.com.cn
// @connect      translate.yandex.com
// @connect      yandex.net
// @connect      fanyi.pdf365.cn
// @connect      dict.cnki.net
// @connect      itrans.xf-yun.com
// @connect      kuaiyi.wps.cn
// @website      https://greasyfork.org/zh-CN/scripts/469073
// @license      MIT

// @downloadURL https://update.greasyfork.org/scripts/469073/%E7%BD%91%E9%A1%B5%E4%B8%AD%E8%8B%B1%E5%8F%8C%E6%98%BE%E4%BA%92%E8%AF%91.user.js
// @updateURL https://update.greasyfork.org/scripts/469073/%E7%BD%91%E9%A1%B5%E4%B8%AD%E8%8B%B1%E5%8F%8C%E6%98%BE%E4%BA%92%E8%AF%91.meta.js
// ==/UserScript==


(async function () {
    'use strict';

    //检测网页类型
    try {
        if(document.contentType ==='application/xml') return;
    }catch (ex){console.error(ex)}

    let authCode;//微软
    let secretCode;//搜狗
    let sogou_uuid;//搜狗uuid
    const APIConst = {
        Baidu: 'baidu',
        BaiduMobileWeb: 'baiduMobileWeb',//百度手机版web
        Microsoft: 'microsoft',
        Google: 'google',
        SogouWeb: 'sogouWeb',
        ICIBAWeb: 'icibaWeb',//金山词霸
        HujiangWeb: 'hujiangWeb',//沪江小D
        Youdao: 'youdao',//有道api
        CaiyunWeb: 'caiyunWeb',//彩云小译
        TransmartWeb: 'transmartWeb',//腾讯交互式翻译 https://transmart.qq.com/zh-CN/index
        AlibabaWeb: 'alibabaWeb',//阿里翻译
        PapagoWeb: 'papagoWeb',//Papago
        YoudaoMobileWeb: 'youdaoMobileWeb',//有道手机版
        Worldlingo: 'worldlingo',//worldlingo   https://fy.httpcn.com/fanyi/
        DeepLWeb: 'deepLWeb',//DeepL
        FlittoWeb: 'flittoWeb',//易翻通
        YandexWeb: 'yandexWeb',//Yandex
        FuxiWeb: 'fuxiWeb',//福昕翻译    https://fanyi.pdf365.cn/
        CNKIWeb: 'CNKIWeb',//cnki
        Xunfei: 'xunfei',//讯飞 API
        WPSKuaiyiWeb: 'WPSKuaiyiWeb',//WSP 金山快译 web
        BaiduAPI: {
            name: "baidu",
            ChineseLang: 'zh',
            EnglishLang: 'en',
            //appid 百度API有月额度(100w字符/月)限制，建议申请自己的秘钥，详见：https://fanyi-api.baidu.com/
            appid: '20230622001720783',  //appid 申请可见 这里需要修改成自己的appid
            secret: 'dQVha4zSH26nMDLpfoVC'// secret 申请可见 这里需要修改成自己的secret
        },
        BaiduMobileWebAPI: {
            name: "baiduMobileWeb",
            ChineseLang: 'zh',
            EnglishLang: 'en',
        },
        MicrosoftAPI: {
            name: "microsoft",
            ChineseLang: 'zh-Hans',
            EnglishLang: 'en'
        },
        //google需要科学上网
        GoogleAPI: {
            name: "google",
            ChineseLang: 'zh-CN',
            EnglishLang: 'en'
        },
        SogouWebAPI: {
            name: "sogouWeb",
            ChineseLang: 'zh-CHS',
            EnglishLang: 'en'
        },
        ICIBAWebAPI: {
            name: "icibaWeb",
            ChineseLang: 'zh',
            EnglishLang: 'en'
        },
        HujiangWebAPI: {
            name: 'hujiangWeb',
            ChineseLang: 'cn',
            EnglishLang: 'en'
        },
        YoudaoAPI: {
            name: 'youdao',
            ChineseLang: 'zh-CHS',
            EnglishLang: 'en',
            //有道翻译key配置，建议申请自己的秘钥 进行修改，详见：https://ai.youdao.com/console/#/service-singleton/text-translation
            appId: '0625d97d20b47865',  //填写自己的应用id
            appKey: 'xxxxxxxxxxxxxxxxxxxx',  //填写自己的应用秘钥
        },
        CaiyunWebAPI: {
            name: 'caiyunWeb',
            ChineseLang: 'zh',
            EnglishLang: 'en'
        },
        TransmartWebAPI: {
            name: 'transmartWeb',
            ChineseLang: 'zh',
            EnglishLang: 'en'
        },
        AlibabaWebAPI: {
            name: 'alibabaWeb',
            ChineseLang: 'zh',
            EnglishLang: 'en'
        },
        PapagoWebAPI: {
            name: 'papagoWeb',
            ChineseLang: 'zh-CN',
            EnglishLang: 'en'
        },
        YoudaoMobileWebAPI: {
            name: 'youdaoMobileWeb',
            ChineseLang: 'ZH_CN',
            EnglishLang: 'EN'
        },
        WorldlingoAPI: {
            name: 'worldlingo',
            ChineseLang: 'zh_cn',
            EnglishLang: 'en'
        },
        DeepLWebAPI: {
            name: 'deepLWeb',
            ChineseLang: 'ZH',
            EnglishLang: 'EN'
        },
        FlittoWebAPI: {
            name: 'flittoWeb',
            ChineseLang: 11,
            EnglishLang: 17
        },
        YandexWebAPI: {
            name: 'yandexWeb',
            ChineseLang: "zh",
            EnglishLang: "en"
        },
        FuxiWebAPI: {
            name: 'fuxiWeb',
            ChineseLang: "zh-CN",
            EnglishLang: "en"
        },
        CNKIWebAPI: {
            name: 'CNKIWeb',
            ChineseLang: "1",
            EnglishLang: "0"
        },
        XunfeiAPI: {
            name: 'xunfei',
            ChineseLang: "cn",
            EnglishLang: "en",
            APPID: '535ee726',//讯飞翻译 appid 修改成自己的 详见https://console.xfyun.cn/services/its
            APISecret: 'xxx',//讯飞翻译 APISecret 修改成自己的 详见https://console.xfyun.cn/services/its
            APIKey: 'xxx'//讯飞翻译 APIKey 修改成自己的 详见https://console.xfyun.cn/services/its
        },
        WPSKuaiyiWebAPI: {
            name: 'WPSKuaiyiWeb',
            ChineseLang: "zh",
            EnglishLang: "en"
        }

    }
    let TRANSMART_CLIENT_KEY = '';

    let currentAPI = APIConst.MicrosoftAPI //默认微软
    let isDoubleShow = true //是否双显 true/false
    let isHighlight = true //是否译文高亮 true/false
    let englishAutoTranslate = false //英文自动翻译 true/false
    let highlightColor = '#d8551f' //高亮颜色
    let selectTolang = currentAPI.ChineseLang // 选词翻译目标语言
    let selectMode = false //右键选词模式开关 true/false 默认关
    let leftSelectMode = false //左键选词模式开关 true/false 默认关
    let excludeSites = ['www.qq.com', 'yeyu1024.xyz'] //排除不运行的网站 exclude web host
    let noTranslateWords = ['SpringBoot', 'ChatGPT', 'YouTube', 'Twitter'] //仅当单个词不会被翻译,是组合或句子时失效

    let scrollTranslate = !!localStorage.getItem("scrollTranslate"); //是否滚动翻译 true/false

    let switchIndex = 0;

    let enableCache = true; //是否启用缓存 true/false 默认启用
    let maxCacheCount = 1500; //最大缓存数量

    function isMobile() {
        let userAgentInfo = navigator.userAgent.toLowerCase();
        let mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod","Mobile"];
        let mobile_flag = false;
        //根据userAgent判断是否是手机
        for (let v = 0; v < mobileAgents.length; v++) {
            if (userAgentInfo.indexOf(mobileAgents[v].toLowerCase()) > -1) {
                mobile_flag = true;
                break;
            }
        }
        return mobile_flag;
    }

    try {
        highlightColor = await GM_getValue("highlightColor", highlightColor)
    }catch (e) { }

    function getCookieValue(cookies, cookieName) {
        let name = cookieName + "=";
        let cookieArray = cookies.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return "";
    }

    setTimeout(() => {
        if (location.href.includes('translate.yandex.com')) {
            GM_setValue("yandexuid", getCookieValue(document.cookie, "yandexuid"))
            GM_setValue("yandexspravka", getCookieValue(document.cookie, "spravka"))
            Toast.success("yandexuid 获取成功：" + getCookieValue(document.cookie, "yandexuid"))
            Toast.success("spravka 获取成功：" + getCookieValue(document.cookie, "spravka"))
        }

        if (location.href.includes('dict.cnki.net')) {
            GM_setValue("CNKI_TOKEN", getCookieValue(document.cookie, "token"))
            Toast.success("CNKI_TOKEN 获取成功：" + getCookieValue(document.cookie, "token"))
        }

        if (location.href.includes('kuaiyi.wps.cn')) {
            GM_setValue("wps_xcsrftoken", getCookieValue(document.cookie, "_xsrf"))
            Toast.success("wps_xcsrftoken 获取成功：" + getCookieValue(document.cookie, "_xsrf"))
        }
    })

    function isEqual(obj1, obj2) {
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            return obj1 === obj2;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (!isEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        return true;
    }

    function addToArray(arr, obj, maxLength) {
        maxLength = maxLength || maxCacheCount;
        if (arr.length >= maxLength) {
            arr.shift();
        }

        let flag = true;

        let start = 0;
        let end = arr.length - 1;
        if (start > end) flag = true;//fix 空直接添加
        //O(length/2)
        while (start <= end) {
            if (isEqual(arr[start], obj) || isEqual(arr[end], obj)) {
                flag = true;
                break;
            }
            start++;
            end--;
        }

        //O(length)
        /*for (let i = 0; i < arr.length; i++) {
            if (isEqual(arr[i], obj)) {
                flag = false;
                break;
            }
        }*/

        if (flag) {
            arr.push(obj);
        }
        return arr;
    }

    function combineArray(arr1, arr2) {

        /*for (let i = 0; i < arr2.length; i++) {
            addToArray(arr1, arr2[i])
        }*/

        let start = 0;
        let end = arr2.length - 1;
        if (start > end) return arr1;

        while (start <= end) {
            if (start === end) {
                addToArray(arr1, arr2[start])
            } else {
                addToArray(arr1, arr2[start])
                addToArray(arr1, arr2[end])
            }
            start++;
            end--;
        }

        return arr1;
    }

    function jsonToObject(jsonStr) {
        try {
            const obj = JSON.parse(jsonStr);
            return obj;
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return [];
        }
    }

    function objectToJson(obj) {
        try {
            const jsonStr = JSON.stringify(obj);
            return jsonStr;
        } catch (error) {
            console.error('Error converting object to JSON:', error);
            return [];
        }
    }

    let cacheChanged = true;
    let tempCache;

    function readCache(key) {
        if (cacheChanged) {
            const value = localStorage.getItem(key);
            const ret = (value !== null ? jsonToObject(value) : [])
            tempCache = ret;
            return ret;
        } else {
            return tempCache || [];
        }
    }

    function storeCache(key, store_arr) {
        cacheChanged = true;
        const old_cache = readCache(key)
        const new_cache = combineArray(old_cache, store_arr)
        localStorage.setItem(key, objectToJson(new_cache))
    }


    function translateFromCache(text, node, lang, key) {
        //异步
        return new Promise((resolve, reject) => {
            if (!text) {
                //console.error("no text:", text)
                // return true;
                resolve("no text:")
                return
            }
            if (noTranslateWords.includes(text)) {
                // return true;
                resolve("do not TranslateWords")
                return
            }

            let shouldBreak = false;
            let rj = false;//reject
            try {
                const cache = readCache(key) //[{},{}...]
                if (cache) {
                    //双指针找 >>>
                    let start = 0;
                    let end = cache.length - 1;

                    while (start <= end) {
                        if (lang === currentAPI.ChineseLang) {
                            //en to zh
                            if (cache[start].english === text || cache[end].english === text) {
                                setTimeout(() => {
                                    renderPage({cacheResult: cache[start].english === text ? cache[start].chinese : cache[end].chinese},
                                        text, node, lang)
                                })
                                console.warn("en to zh cache: ", text)
                                shouldBreak = true;
                                break;
                                //return true;
                            }
                        } else if (lang === currentAPI.EnglishLang) {
                            //zh to en
                            if (cache[start].chinese === text || cache[end].chinese === text) {
                                console.warn("zh to en cache: ", text)
                                setTimeout(() => {
                                    renderPage({cacheResult: cache[start].chinese === text ? cache[start].english : cache[end].english},
                                        text, node, lang)
                                })
                                shouldBreak = true;
                                break;
                                //return true;
                            }
                        } else {
                            //return false;
                            shouldBreak = true;
                            rj = true;
                            break;
                        }
                        start++;
                        end--;
                    }
                    //双指针 <<<<
                }
            } catch (e) {
                console.error("translateFromCache ex", e)
                //return false;
                reject("translateFromCache ex")
                return;
            }
            if (shouldBreak) {
                if (rj) {
                    //中断被拒绝
                    reject('语言异常')
                } else {
                    //中断未被拒绝
                    resolve('成功缓存')
                }
            } else {
                //不中断
                reject('无缓存')
            }
            // return false;
        })
    }

    function addToastCss() {
        try {
            GM_addStyle(GM_getResourceText("toastCss"))
        } catch (e) {

        }
    }

    addToastCss()


    function changeSelectLang() {
        if (selectTolang === currentAPI.ChineseLang) {
            selectTolang = currentAPI.EnglishLang;
            console.log('当前目标语言为外语')
            Toast.success('当前目标语言为外语')
            GM_setValue("selectTolang","EnglishLang")
        } else {
            selectTolang = currentAPI.ChineseLang;
            console.log('当前目标语言为中文')
            Toast.success('当前目标语言为中文')
            GM_setValue("selectTolang","ChineseLang")
        }

    }

    function autoTranslateSwitch() {
        if (englishAutoTranslate) {
            englishAutoTranslate = false;
            GM_setValue("englishAutoTranslate", false)
            Toast.error('外语自动翻译已关闭! 请重新刷新页面.')
        } else {
            englishAutoTranslate = true;
            GM_setValue("englishAutoTranslate", true)
            Toast.success('外语自动翻译已打开! 请重新刷新页面.')
        }
    }

    function rightSelectMode() {
        if (selectMode) {
            console.log('鼠标右击选词翻译已经关闭', selectMode)
            selectMode = false;
            //移除事件
            document.removeEventListener('mousemove', handleMousemove);
            document.removeEventListener('mouseout', handleMouseout);
            document.removeEventListener('contextmenu', handleContextmenu);//右击事件

            Toast.success('鼠标右击选词翻译已经关闭')

        } else {
            console.log('鼠标右击选词翻译已经开启', selectMode)
            selectMode = true;
            //增加事件
            document.addEventListener('mousemove', handleMousemove);
            document.addEventListener('mouseout', handleMouseout);
            document.addEventListener('contextmenu', handleContextmenu);//右击事件
            Toast.success('鼠标右击选词翻译已经开启')
        }
    }


    //是否支持多语种的引擎
    function isSupportMultiLang(){
        return currentAPI.name === APIConst.TransmartWeb || currentAPI.name === APIConst.Microsoft || currentAPI.name === APIConst.Google
            || currentAPI.name === APIConst.BaiduMobileWeb || currentAPI.name === APIConst.AlibabaWeb
    }

    function colorSelectAndSettings(event) {
        $("body").append(`<div class="MyColorSelector" style="z-index: 9999 !important;padding:16px;position: fixed;border-radius: 4px;border: 1px salmon solid;top: 10%;bottom: 10%;left: 50%;transform: translateX(-50%);background: white;box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 5px;overflow-y: scroll;" id="MyColorSelector">
        <div>
          <label for="redRange">红/Red:</label>
          <input type="range" id="redRange" min="0" max="255" value="0" onchange="document.getElementById('redval').innerHTML = value">
          <span style="color: red" id="redval">0</span>
        </div>
        <div>
          <label for="greenRange">绿/Green:</label>
          <input type="range" id="greenRange" min="0" max="255" value="0" onchange="document.getElementById('greenval').innerHTML = value">
           <span style="color: green" id="greenval">0</span>
        </div>
        <div>
          <label for="blueRange">蓝/Blue:</label>
          <input type="range" id="blueRange" min="0" max="255" value="0" onchange="document.getElementById('blueval').innerHTML = value">
           <span style="color: blue" id="blueval">0</span>
        </div>
        <div>
          <div style=" width: 50px; height: 50px; margin-top: 10px;margin-bottom: 10px;margin-left: 20px" id="colorDisplay"></div>
          <div style="font-size: 30px;" id="colorPreview">文字预览</div>
        </div>
        <button style="cursor: pointer;color: white;border: 6px;outline: none;background: #4caf50;padding: 8px 0;border-radius: 6px;font-size: 14px;margin: 0 auto;margin-top: 6px;width: 70px;" id="selectColorBtn">确定</button>
        <button style="cursor: pointer;color: white;border: 6px;outline: none;background: #4caf50;padding: 8px 0;border-radius: 6px;font-size: 14px;margin: 0 auto;margin-top: 6px;width: 70px;" id="scrollBtn">滚动</button>
        <button style="cursor: pointer;color: white;border: 6px;outline: none;background: #4caf50;padding: 8px 0;border-radius: 6px;font-size: 14px;margin: 0 auto;margin-top: 6px;width: 70px;" id="selectColorCancelBtn">退出</button>
         <div><span style="margin-top: 10px">温馨提示：在输入框时,连续按三下空格键即可翻译输入框的内容.</span></div>
            <div><span>翻译引擎:</span>
              <select id="selectAPI">
                  <option value="999">微软[推荐]</option>
                  <option value="0">百度[需key]</option>
                  <option value="1">谷歌[推荐]</option>
                  <option value="2">搜狗</option>
                  <option value="3">词霸</option>
                  <option value="4">沪江小D</option>
                  <option value="5">有道[需key]</option>
                  <option value="6">彩云</option>
                  <option value="7">腾讯交互[推荐]</option>
                  <option value="8">Alibaba</option>
                  <option value="9">Papago</option>
                  <option value="10">有道手机[推荐]</option>
                  <option value="11">worldlinGO</option>
                  <option value="12">DeepL[限制]</option>
                  <option value="13">百度手机</option>
                  <option value="14">易翻通</option>
                  <option value="15">Yandex</option>
                  <option value="16">福昕</option>
                  <option value="17">CNKI</option>
                  <option  value="18">讯飞[需key]</option>
                  <option value="19">金山快译</option>
              </select>
               <button style="cursor: pointer;color: white;border: 6px;outline: none;background: #4caf50;padding: 8px 0;border-radius: 6px;font-size: 14px;margin: 0 auto;margin-top: 6px;width: 70px;" id="selectAPIBtn">选择</button>
            </div>
         <div><span style="margin-top: 10px">注意:外语目前仅适用部分引擎，语言代码可能会存在差异,其他默认英语.</span></div>
            <div><span>外语语言:</span>
              <select id="selectForeign">
                  <option value="en">英语(en)</option>
                  <option value="ja">日语(ja)</option>
                  <option value="ko">韩语(ko)</option>
                  <option value="ru">俄语(ru)</option>
                  <option value="de">徳语(de)</option>
                  <option value="fr">法语(fr)</option>
                  <option value="th">泰语(th)</option>
                  <option value="hi">印地(hi)</option>
                  <option value="it">意大利(it)</option>
                  <option value="pt">葡萄牙(pt)</option>
                  <option value="ar">阿拉伯(ar)</option>
                  <option value="vi">越南语(vi)</option>
                  <option value="tr">土耳其(tr)</option>
                  <option value="id">印尼(id)</option>
                  <option value="zh">中文(zh)</option>
                  <option value="zh-Hans">中文(zh-Hans)</option>
                  <option value="zh-CN">中文(zh-CN)</option>
                  <option value="zh_cn">中文(zh_cn)</option>
                  <option value="zh-CHS">中文(zh-CHS)</option>
                  <option value="cn">中文(cn)</option>
                  <option value="zh-TW">中文繁体(zh-TW)</option>
              </select>
               <button style="cursor: pointer;color: white;border: 6px;outline: none;background: #4caf50;padding: 8px 0;border-radius: 6px;font-size: 14px;margin: 0 auto;margin-top: 6px;width: 70px;" id="selectForeignBtn">选择</button>
            </div>
        </div>
        `);
        const MyColorSelector = document.getElementById("MyColorSelector");
        const redRange = document.getElementById("redRange");
        const greenRange = document.getElementById("greenRange");
        const blueRange = document.getElementById("blueRange");
        const colorDisplay = document.getElementById("colorDisplay");
        const colorPreview = document.getElementById("colorPreview");
        const selectColorBtn = document.getElementById("selectColorBtn");
        const selectColorCancelBtn = document.getElementById("selectColorCancelBtn");
        const selectAPIBtn = document.getElementById("selectAPIBtn");
        const scrollBtn = document.getElementById("scrollBtn");
        const selectForeignBtn = document.getElementById("selectForeignBtn");

        // 更新颜色显示区域的颜色
        function updateColorDisplay() {
            const redValue = redRange.value;
            const greenValue = greenRange.value;
            const blueValue = blueRange.value;

            const selectedColor = `rgb(${redValue},${greenValue},${blueValue})`;
            colorDisplay.style.backgroundColor = selectedColor;
            colorPreview.style.color = selectedColor
        }

        // 添加滑块的 input 事件处理程序
        redRange.addEventListener("input", updateColorDisplay);
        greenRange.addEventListener("input", updateColorDisplay);
        blueRange.addEventListener("input", updateColorDisplay);
        selectColorBtn.addEventListener("click", (ev)=>{
            const redValue = redRange.value;
            const greenValue = greenRange.value;
            const blueValue = blueRange.value;
            const selectedColor = `rgb(${redValue},${greenValue},${blueValue})`;
            GM_setValue("highlightColor", selectedColor)
            Toast.success("请重新刷新页面生效!")
            MyColorSelector.remove()
        });

        selectColorCancelBtn.addEventListener("click", (ev)=>{

            MyColorSelector.remove()
        });

        //本站滚动
        scrollBtn.addEventListener("click", (ev)=>{
            if(scrollTranslate){
                localStorage.removeItem("scrollTranslate")
                scrollTranslate = false
                Toast.error("本站滚动翻译已关！")
                window.removeEventListener('scroll', handleScroll);
            }else {
                localStorage.setItem("scrollTranslate", "open")
                scrollTranslate = true
                Toast.info("本站滚动翻译已开，如需要切换语言请点侧边的语言按钮！")
                window.addEventListener('scroll', handleScroll);
            }
        })

        //选择引擎
        selectAPIBtn.addEventListener('click', () => {
            const selectEl = document.getElementById('selectAPI');
            const selectedValue = selectEl.options[selectEl.selectedIndex].value;
            switchIndex = selectedValue
            switchAPI(true)
            MyColorSelector.remove() //退出

        });

        //选择外语语种
        selectForeignBtn.addEventListener('click', () => {

            const selectEl = document.getElementById('selectForeign');
            const selectedValue = selectEl.options[selectEl.selectedIndex].value;
            if(isSupportMultiLang()){
                Reflect.set(currentAPI,"EnglishLang",selectedValue)
                Toast.success("设置成功！" + selectedValue)
                localStorage.removeItem(`${currentAPI.name}wordCache`)//清空缓存
                GM_setValue("selectForeignLang", selectedValue)
                MyColorSelector.remove() //退出
            }else{
                Toast.error("暂时仅支持腾讯交互，谷歌，微软, 手机有道,阿里翻译。请切换引擎后设置")
            }

        });

        // 初始化颜色显示
        updateColorDisplay();

        //加载预览色
        colorDisplay.style.backgroundColor = highlightColor;
        colorPreview.style.color = highlightColor

        //提示当前引擎
        try {
            Toast.info(`当前API:${currentAPI.name}`)
        } catch (e) {}
    }

    //注册菜单
    setTimeout(() => {
        GM_registerMenuCommand("更新脚本", function (event) {
            if(isMobile()){
                location.href = "https://greasyfork.org/zh-CN/scripts/469073"
            }else {
                GM_openInTab("https://greasyfork.org/zh-CN/scripts/469073")
            }

        }, "updateTranslateJS");


        GM_registerMenuCommand("颜色/设置", colorSelectAndSettings, "HeightLightColor");


        GM_registerMenuCommand("排除/放行该站", function (event) {
            if (excludeSites.includes(location.host)) {
                console.log('网站已经存在,现已经放行')
                excludeSites = excludeSites.filter(function (element) {
                    return element !== location.host; // 返回不等于要删除元素的元素
                });
                console.log(excludeSites);
                Toast.success('网站已经存在,现已经放行')
            } else {
                console.log('网站不存在, 现已经排除')
                excludeSites.push(location.host)
                Toast.success('网站不存在, 现已经排除')
            }
            GM_setValue("excludeSites", JSON.stringify(excludeSites))
            console.log(excludeSites)
        }, "excludeWeb");

        // GM_registerMenuCommand("鼠标右击选词开关", rightSelectMode, "selectMode");


    })

    //载入配置
    async function loadConfig() {

        //载入腾讯
        setTimeout(()=>{
          if(location.host.includes("transmart.qq.com")){
              GM_setValue("TRANSMART_CLIENT_KEY", unsafeWindow.TRANSMART_CLIENT_KEY)
              Toast.info(`获取权信息${unsafeWindow.TRANSMART_CLIENT_KEY}，请返回重新:`)
          }
        },3000)

        TRANSMART_CLIENT_KEY = await GM_getValue("TRANSMART_CLIENT_KEY", `browser-chrome-122.0.6261-Windows_10-${uuidv4()}-${Date.now()}`)

        isDoubleShow = await GM_getValue("isDoubleShow", true)
        isHighlight = await GM_getValue("isHighlight", true)
        englishAutoTranslate = await GM_getValue("englishAutoTranslate", false)
        leftSelectMode = await GM_getValue("leftSelectMode", false)
        let selectlang = await GM_getValue("selectTolang", "ChineseLang")
        setTimeout(()=>{
            if(leftSelectMode){
                leftSelectMode = false;
                leftSelect(true)
            }
            if(selectlang === 'ChineseLang'){
                selectTolang = currentAPI.ChineseLang
            }else{
                selectTolang = currentAPI.EnglishLang
            }
        })
        try {
            switchIndex = await GM_getValue("switchIndex", 0) - 1
            console.warn("switchIndex", switchIndex)
            switchAPI(false)
        } catch (ex) {
            switchIndex = 0;
            console.error("switchIndex ex:", switchIndex, ex)
        }

        //载入外语语种
        try {
            if(isSupportMultiLang()){
                let selectForeignLang = await GM_getValue("selectForeignLang")
                if(selectForeignLang){
                    Reflect.set(currentAPI, "EnglishLang", selectForeignLang)
                }
            }
            console.warn("selectForeignLang load:", selectForeignLang)
        } catch (ex) {
            console.error("selectForeignLang load ex:", switchIndex, ex)
        }

        console.warn("isDoubleShow", isDoubleShow)
        console.warn("isHighlight", isHighlight)
        console.warn("englishAutoTranslate", englishAutoTranslate)

        const excludeSitesConfig = await GM_getValue("excludeSites")
        if (excludeSitesConfig) {
            try {
                excludeSites = JSON.parse(excludeSitesConfig)
            } catch (e) {
                console.error('json出错:', e, excludeSitesConfig)
            }
        }
        console.warn('excludeSites', excludeSites)


        //toastr配置
        toastr.options = {
            // "closeButton": false,
            // "debug": false,
            // "newestOnTop": false,
            // "progressBar": false,
            "positionClass": "toast-top-right", // 提示框位置，这里填类名
            // "preventDuplicates": false,
            // "onclick": null,
            "showDuration": "1000",              // 提示框渐显所用时间
            "hideDuration": "1000",              // 提示框隐藏渐隐时间
            "timeOut": "5000",                  // 提示框持续时间
            "extendedTimeOut": "2000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
    }

    try {
        await loadConfig()
    } catch (e) {
        console.error("load config error:", e)
    }

    function handleMouseout(event) {
        const target = event.target;
        if (target.classList.contains('translate-main')) {
            return
        }
        target.style.border = '';
        //console.error('mouseout' + target);
    }

    function handleMousemove(event) {
        const target = event.target;
        if (target.classList.contains('translate-main')) {
            return
        }

        target.style.border = '1px solid red';
        //console.log('mousemove' + target);
    }

    function handleContextmenu(event) {
        event.preventDefault(); // 阻止默认右键菜单的显示
        const target = event.target;
        console.warn('contextmenu' + target);
        target.style.border = '';
        //翻译
        translateTo(selectTolang, target)

    }

    async function handleMouseUpOrTouchend(event) {
        event.stopPropagation()

        //copyTranslatedText
        if (/copyTranslatedText/.test(event.target.id)) {
            GM_setClipboard(document.querySelector('#qs_selectedText').innerText, "text");
            console.log('复制成功')
            Toast.success("复制成功!")
            return
        }

        const selectText = window.getSelection().toString()
        //console.error(event.target)
        if (/(qs_searchBoxOuter|qs_searchBox|qs_selectedText)/.test(event.target.id)) {
            return;
        } else {
            document.querySelectorAll('#qs_searchBoxOuter').forEach(item => {
                item.remove();
            })
        }

        if (!selectText) return;

        console.warn(selectText)
        let mouseX = event.pageX;
        let mouseY = event.pageY;
        if (event.changedTouches && event.changedTouches.length > 0) {
            mouseX = event.changedTouches[0].pageX
            mouseY = event.changedTouches[0].pageY
        }

        console.log('鼠标位置：', mouseX, mouseY);

        $("body").append($(`
                <div id="qs_searchBoxOuter">
                    <a id="qs_searchBox" style="display: block; left:${mouseX - 10}px; top: ${mouseY}px;">
                        <div id="qs_selectedText">${selectText}</div>
                        <hr>
                        <div id="qs_searchIconOuter"><span id="qs_searchIconInner"><svg id="copyTranslatedText" width="24" height="24" data-v-13fede38="" t="1679666016648" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6241" class="icon"><path data-v-13fede38="" d="M661.333333 234.666667A64 64 0 0 1 725.333333 298.666667v597.333333a64 64 0 0 1-64 64h-469.333333A64 64 0 0 1 128 896V298.666667a64 64 0 0 1 64-64z m-21.333333 85.333333H213.333333v554.666667h426.666667v-554.666667z m191.829333-256a64 64 0 0 1 63.744 57.856l0.256 6.144v575.701333a42.666667 42.666667 0 0 1-85.034666 4.992l-0.298667-4.992V149.333333H384a42.666667 42.666667 0 0 1-42.368-37.674666L341.333333 106.666667a42.666667 42.666667 0 0 1 37.674667-42.368L384 64h447.829333z" fill="#909399" p-id="6242"></path></svg></span></div>
                    </a>
                </div>

        `))
        const old_isDoubleShow = isDoubleShow;
        isDoubleShow = false;
        translateTo(selectTolang, document.getElementById("qs_searchBoxOuter"), true)
        setTimeout(() => {
            isDoubleShow = old_isDoubleShow;
        }, 2000)
        console.log('鼠标松开了');
    }


    function leftSelect(noToast) {
        if (leftSelectMode) {
            console.log('鼠标选词翻译已经关闭', leftSelectMode)
            leftSelectMode = false;
            document.removeEventListener('mouseup', handleMouseUpOrTouchend);
            document.removeEventListener('touchcancel', handleMouseUpOrTouchend);
            if(!noToast){
                Toast.success('选词翻译已经关闭')
            }
        } else {
            console.log('鼠标选词翻译已经开启', leftSelectMode)
            leftSelectMode = true;
            document.addEventListener('mouseup', handleMouseUpOrTouchend);
            document.addEventListener('touchcancel', handleMouseUpOrTouchend);
            if(!noToast) {
                Toast.success('选词翻译已经开启')
            }
        }
        GM_setValue("leftSelectMode",leftSelectMode)
    }


    function switchAPI(openWeb) {
        switchIndex++;
        try {
            switch (switchIndex) {
                case 1:
                    currentAPI = APIConst.BaiduAPI
                    Toast.success('已经切换百度翻译,未配置api需源码中修改秘钥.建议申请自己的秘钥，详见：https://fanyi-api.baidu.com/')
                    break
                case 2:
                    currentAPI = APIConst.GoogleAPI
                    Toast.success('已经切换谷歌翻译')
                    break
                case 3:
                    currentAPI = APIConst.SogouWebAPI
                    Toast.success('已经切换搜狗翻译')
                    break
                case 4:
                    currentAPI = APIConst.ICIBAWebAPI
                    Toast.success('已经切换词霸翻译')
                    break
                case 5:
                    currentAPI = APIConst.HujiangWebAPI
                    Toast.success('已经切换沪江翻译')
                    if(openWeb){
                        try {
                            GM_openInTab("https://dict.hjenglish.com/app/trans")
                        }catch (e) { }
                    }
                    break
                case 6:
                    currentAPI = APIConst.YoudaoAPI
                    Toast.success('已经切换有道翻译，未配置api key 需要到源码中修改秘钥.建议申请自己的秘钥 进行修改，详见：https://ai.youdao.com/console/#/service-singleton/text-translation')
                    break
                case 7:
                    currentAPI = APIConst.CaiyunWebAPI
                    Toast.success('已经切换彩云翻译')
                    break
                case 8:
                    currentAPI = APIConst.TransmartWebAPI
                    Toast.success('已经切换腾讯交互式翻译.需鉴权')
                    if(openWeb){
                        try {
                            GM_openInTab("https://transmart.qq.com/")
                        }catch (e) {
                            location.href = 'https://transmart.qq.com/'
                        }
                    }
                    break
                case 9:
                    currentAPI = APIConst.AlibabaWebAPI
                    Toast.success('已经切换阿里翻译')
                    break
                case 10:
                    currentAPI = APIConst.PapagoWebAPI
                    Toast.success('已经切换Papago翻译')
                    break
                case 11:
                    currentAPI = APIConst.YoudaoMobileWebAPI
                    Toast.success('已经切换有道手机翻译')
                    break
                case 12:
                    currentAPI = APIConst.WorldlingoAPI
                    Toast.success('已经切换WorldlinGo翻译')
                    break
                case 13:
                    currentAPI = APIConst.DeepLWebAPI
                    Toast.success('已经切换DeepL Web翻译(有ip次数限制)')
                    break
                case 14:
                    currentAPI = APIConst.BaiduMobileWebAPI
                    Toast.success('已经切换百度翻译手机版 web')
                    break
                case 15:
                    currentAPI = APIConst.FlittoWebAPI
                    Toast.success('已经切换易翻通 web')
                    break
                case 16:
                    currentAPI = APIConst.YandexWebAPI
                    Toast.success('已经切换Yandex web  https://translate.yandex.com/')
                    if(openWeb){
                        try {
                            GM_openInTab("https://translate.yandex.com/")
                        }catch (e) { }
                    }
                    break
                case 17:
                    currentAPI = APIConst.FuxiWebAPI
                    Toast.success('已经切换福昕翻译 web')
                    break
                case 18:
                    currentAPI = APIConst.CNKIWebAPI
                    Toast.success('已经切换CNKI web .频繁不出结果需要到官网刷新验证码.https://dict.cnki.net/index')
                    if(openWeb){
                        try {
                            GM_openInTab("https://dict.cnki.net/index")
                        }catch (e) { }
                    }
                    break
                case 19:
                    currentAPI = APIConst.XunfeiAPI
                    Toast.success('已经切换讯飞API版, 未配置api key 需要到源码中修改秘钥.申请key详见https://console.xfyun.cn/services/its')
                    break
                case 20:
                    currentAPI = APIConst.WPSKuaiyiWebAPI
                    Toast.success('已经切换金山快译 需要到https://kuaiyi.wps.cn获取token')
                    if(openWeb){
                        try {
                            GM_openInTab("https://kuaiyi.wps.cn")
                        }catch (e) { }
                    }
                    break
                default:
                    currentAPI = APIConst.MicrosoftAPI
                    Toast.success('已经切换微软翻译')
                    switchIndex = 0
            }
        } catch (e) {
        }
        selectTolang = currentAPI.ChineseLang //重置
        //持久化
        GM_setValue("switchIndex", switchIndex)
    }


    //toastr 封装  ----start----
    const Toast = {

        warn: function (msg, title, options) {
            try {
                toastr.warning(msg, title, options)
            } catch (e) {
            }
        },
        info: function (msg, title, options) {
            try {
                toastr.info(msg, title, options)
            } catch (e) {
            }
        },
        success: function (msg, title, options) {
            try {
                toastr.success(msg, title, options)
            } catch (e) {
            }
        },
        error: function (msg, title, options) {
            try {
                toastr.error(msg, title, options)
            } catch (e) {
            }
        },
    };

    //toastr 封装  ----end----

    if (excludeSites.includes(location.host)) {
        throw new Error('当前网站不允许运行,已经停止!')
    }


    async function GM_fetch(details) {
        return new Promise((resolve, reject) => {
            switch (details.responseType) {
                case "stream":
                    details.onloadstart = (res) => {
                        resolve(res)
                    }
                    break;
                default:
                    details.onload = (res) => {
                        resolve(res)
                    };
            }

            details.onerror = (res) => {
                reject(res)
            };
            details.ontimeout = (res) => {
                reject(res)
            };
            details.onabort = (res) => {
                reject(res)
            };
            GM_xmlhttpRequest(details)

        });
    }


    //add css
    GM_addStyle(`
    .translate-main{
        position: fixed !important;
        top: 35% !important;
        right: 0 !important;
        height: 200px !important;
        margin-top: -100px !important;
        z-index: 99999 !important;
    }
    .translate-main-fold{
            position: absolute !important;
            right: 0 !important;
            padding: 14px 7px !important;
            text-align: center !important;
            background: #cddceb !important;
            border-radius: 50%;
            border-top-right-radius: 4px !important;
            border-bottom-right-radius: 4px !important;
            font-size: 14px !important;
            /*line-height: 24px !important;*/
            font-weight: 600 !important;
            cursor: pointer !important;
            opacity: 0.35 !important;
            transition: opacity 0.35s ease !important;
        }
    .translate-main-fold:hover{
        opacity: 1 !important;
    }
    .translate-main-body{
            position: absolute !important;
            right: -200px !important;
            width: 160px !important;
            /* height: 178px !important; */
            padding: 12px 10px !important;
            transition: .5s all !important;
            border-radius: 4px !important;
            background: #f4f7fa !important;
        }
    .translate-main.unfold .translate-main-body{
            right: 0 !important;
        }
    .translate-main-header{
            padding-bottom: 10px !important;
            padding-left: 6px !important;
            border-bottom: 1px dashed #d1d4cc !important;
            color: #70ca5d !important;
            font-size: 14px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }
    .translate-arrow{
            font-size: 18px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
        }
    .translate-main ul{
            list-style-type: none;
            padding: 0;
            margin: 0;
        }

    .translate-main li{
            margin-top:6px !important;
            white-space: normal !important;
            display: block;
        }
    .translate-main li a{
            display:block !important;
            color:#697466 !important;
            font-size:14px !important;
            text-decoration:none !important;
            text-align:center !important;
            padding:6px 12px 4px !important;
        }
    .translate-main li a:hover{
            border-radius :4px !important;
            background:#eaebe9 !important;
            color:#62b651 !important;
      }
    .translate-span {
         display: inline;
     }

     .translate-span.hide {
         display: none !important;
     }

     .translate-src.hide {
         display: none !important;
     }

     .translate-span.light-color {
         color: ${highlightColor} !important;
     }

     /*选词css*/
     #qs_searchBox {
                background-color: #fff;
                color: #444;
                text-align: center;
                padding: 12px 12px 0 12px;
                max-width: 300px;
                position: absolute;
               /* height: 28px;*/
                border-radius: 6px;
                border: none;
                outline: 0;
                text-decoration: none;
                box-shadow: 0 0 0 1px rgba(0,0,0,.05),0 2px 3px 0 rgba(0,0,0,.1);
                margin-top: 8px;
                display: none;
                cursor: pointer;
                font-weight: 600;
                z-index: 30009
            }

            #qs_searchBox:hover {
                box-shadow: 0 0 0 1px rgba(0,0,0,.05),0 2px 4px 1px rgba(0,0,0,.14)
            }

            #qs_selectedText {
                /* padding-right:12px; */
                /*overflow: hidden;*/
                text-overflow: ellipsis;
                white-space: normal;
                max-width: 258px;
            }


            #qs_searchIconInner {
                display: inline-flex;
            }

        `)

    //add box
    $("body").append($(`<div class="translate-main">
   <div class="translate-main-fold">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" stroke="currentColor" fill="currentColor">
            <path d="m575.73-226.04-37.924 100.231q-3.23 8-10.173 12.865-6.942 4.866-15.749 4.866-14.385 0-22.5-11.846t-2.846-25.73l155.154-400.731q3.346-8.115 10.5-12.884t15.577-4.769h21.499q8.423 0 15.576 4.923 7.154 4.922 10.693 13.038l154.961 400.23q5.769 13.769-2.692 25.769-8.461 12-22.845 12-9.116 0-16.154-4.866-7.038-4.865-10.384-13.48l-37.731-99.616H575.73ZM359.307-417.193 179.846-237.962q-7.808 8.192-18.961 8.499-11.154.308-19.961-8.499-8.5-8.5-8.5-19.615 0-11.115 8.5-19.807l179.154-179.847q-35.923-36.731-68.077-86.115-32.154-49.385-49.885-95.539h60.383q15.5 34.692 41.923 73.924 26.424 39.231 54.885 68.808 45.847-46.039 82.232-104.732 36.385-58.692 53.385-115.077H103.847q-11.653 0-19.864-8.211-8.212-8.211-8.212-19.865 0-11.461 8.212-19.672 8.21-8.212 19.864-8.212h228.269v-36.73q0-11.461 8.115-19.673 8.115-8.211 19.769-8.211 11.654 0 19.865 8.211 8.211 8.212 8.211 19.673v36.73h228.269q11.461 0 19.673 8.212 8.211 8.211 8.211 19.672 0 11.654-8.211 19.865-8.212 8.211-19.673 8.211h-63.076q-20.77 69.5-61.577 138.558-40.808 69.057-92.962 121.096l92.538 94.924-21.384 57.575-110.577-113.384Zm235.153 140h167.309l-83.655-220.962-83.654 220.962Z"></path>
        </svg>
   </div>
   <div class="translate-main-body">
    <div class="translate-main-header">
        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" stroke="currentColor" fill="currentColor">
            <path d="m575.73-226.04-37.924 100.231q-3.23 8-10.173 12.865-6.942 4.866-15.749 4.866-14.385 0-22.5-11.846t-2.846-25.73l155.154-400.731q3.346-8.115 10.5-12.884t15.577-4.769h21.499q8.423 0 15.576 4.923 7.154 4.922 10.693 13.038l154.961 400.23q5.769 13.769-2.692 25.769-8.461 12-22.845 12-9.116 0-16.154-4.866-7.038-4.865-10.384-13.48l-37.731-99.616H575.73ZM359.307-417.193 179.846-237.962q-7.808 8.192-18.961 8.499-11.154.308-19.961-8.499-8.5-8.5-8.5-19.615 0-11.115 8.5-19.807l179.154-179.847q-35.923-36.731-68.077-86.115-32.154-49.385-49.885-95.539h60.383q15.5 34.692 41.923 73.924 26.424 39.231 54.885 68.808 45.847-46.039 82.232-104.732 36.385-58.692 53.385-115.077H103.847q-11.653 0-19.864-8.211-8.212-8.211-8.212-19.865 0-11.461 8.212-19.672 8.21-8.212 19.864-8.212h228.269v-36.73q0-11.461 8.115-19.673 8.115-8.211 19.769-8.211 11.654 0 19.865 8.211 8.211 8.212 8.211 19.673v36.73h228.269q11.461 0 19.673 8.212 8.211 8.211 8.211 19.672 0 11.654-8.211 19.865-8.212 8.211-19.673 8.211h-63.076q-20.77 69.5-61.577 138.558-40.808 69.057-92.962 121.096l92.538 94.924-21.384 57.575-110.577-113.384Zm235.153 140h167.309l-83.655-220.962-83.654 220.962Z"></path>
        </svg>
     <span>中外互译</span>
     <span class="translate-arrow">&gt;</span>
    </div>
    <div class="translate-main-body">
     <ul>
      <li>
       <a id="en2zh" href="javascript:void(0)">
        <span>转中文</span>
       </a>
      </li>
      <li>
       <a id="zh2en" href="javascript:void(0)">
        <span>转外文</span>
       </a>
      </li>
      <li style="display: flex; justify-content: center ">
       <a id="doubleShow" href="javascript:void(0)">
        <span>双显</span>
       </a>
       <a id="highlightTranslateText" href="javascript:void(0)">
        <span>高亮</span>
       </a>
      </li>

      <li style="display: flex; justify-content: center ">
       <a id="autoTranslateSwitch" href="javascript:void(0)">
        <span>自动</span>
       </a>
       <a id="changeSelectLang" href="javascript:void(0)">
        <span>语言</span>
       </a>
      </li>

      <li style="display: flex; justify-content: center ">
       <a id="rightSelectMode" href="javascript:void(0)">
        <span>右击</span>
       </a>
       <a id="updateScript" href="javascript:void(0)">
        <span>更新</span>
       </a>
      </li>

      <li style="display: flex; justify-content: center ">
       <a id="leftSelectMode" href="javascript:void(0)">
        <span>选词</span>
       </a>
       <a id="switchAPI" href="javascript:void(0)">
        <span>引擎</span>
       </a>
      </li>
      <li>
       <a id="sourceText" href="javascript:void(0)">
        <span>原文</span>
       </a>
      </li>
     </ul>
    </div>

   </div>
  </div>`))


    //add functions


    function hasChinese(sentence) {
        if (!sentence) return false;
        const pattern = /[\u4E00-\u9FA5]/;
        return pattern.test(sentence);
    }

    function hasEnglish(sentence) {
        if (!sentence) return false;
        const pattern = /[a-zA-Z]/;
        return pattern.test(sentence);
    }

    function isAllChinese(str) {
        if (!str) return false;
        const reg = /^[\u4e00-\u9fa5]+$/;
        return reg.test(str);
    }


    //还原网页
    function clearSpan(lang) {
        document.querySelectorAll(".translate-span").forEach(item => {
            if (!isDoubleShow) {
                if (!item.className.includes(`lang-${lang}`)) {
                    item.remove()
                }
            } else {
                item.remove()
            }
        })

        document.querySelectorAll(".translate-src").forEach(item => {
            if (!isDoubleShow) {
                if (!item.className.includes(`lang-${lang}`)) {
                    const textNode = document.createTextNode(item.textContent);
                    item.replaceWith(textNode)
                }
            } else {
                const textNode = document.createTextNode(item.textContent);
                item.replaceWith(textNode)
            }

        })
    }

    //渲染页面
    function renderPage(res, text, node, lang) {
        if (!res) return;
        try {
            let yiwen;
            if (res && res.cacheResult) {
                //缓存
                yiwen = res.cacheResult
            } else if (currentAPI.name === APIConst.Baidu) {
                yiwen = JSON.parse(res.responseText).trans_result[0].dst;
            } else if (currentAPI.name === APIConst.Microsoft) {
                yiwen = JSON.parse(res.responseText)[0].translations[0].text;
            } else if (currentAPI.name === APIConst.Google) {
                yiwen = JSON.parse(res.responseText)[0][0][0];
            } else if (currentAPI.name === APIConst.SogouWeb) {
                yiwen = JSON.parse(res.responseText).data.translate.dit
            } else if (currentAPI.name === APIConst.ICIBAWeb) {
                yiwen = JSON.parse(decodeICIBA(JSON.parse(res.responseText).content)).out
            } else if (currentAPI.name === APIConst.HujiangWeb) {
                yiwen = JSON.parse(res.responseText).data.content;
            } else if (currentAPI.name === APIConst.Youdao) {
                yiwen = JSON.parse(res.responseText).translation[0]
            } else if (currentAPI.name === APIConst.CaiyunWeb) {
                yiwen = decodeCaiyun(JSON.parse(res.responseText).target)
            } else if (currentAPI.name === APIConst.TransmartWeb) {
                yiwen = JSON.parse(res.responseText).auto_translation[0]
            } else if (currentAPI.name === APIConst.AlibabaWeb) {
                yiwen = JSON.parse(res.responseText).data.translateText
            } else if (currentAPI.name === APIConst.PapagoWeb) {
                yiwen = JSON.parse(res.responseText).translatedText
            } else if (currentAPI.name === APIConst.YoudaoMobileWeb) {
                let doc = document.implementation.createHTMLDocument();
                doc.body.innerHTML = res.responseText;
                yiwen = doc.querySelector("#translateResult li").innerText.trim();
                //debugger
            } else if (currentAPI.name === APIConst.Worldlingo) {
                yiwen = res.responseText;
            } else if (currentAPI.name === APIConst.DeepLWeb) {
                yiwen = JSON.parse(res.responseText).result.translations[0].beams[0].sentences[0].text
            } else if (currentAPI.name === APIConst.BaiduMobileWeb) {
                yiwen = JSON.parse(res.responseText).trans[0].dst
            } else if (currentAPI.name === APIConst.FlittoWeb) {
                yiwen = JSON.parse(res.responseText)[0].tr_content
            } else if (currentAPI.name === APIConst.YandexWeb) {
                yiwen = JSON.parse(res.responseText).text[0]
            }else if (currentAPI.name === APIConst.FuxiWeb) {
                yiwen = JSON.parse(res.responseText).result
            }else if (currentAPI.name === APIConst.CNKIWeb) {
                yiwen = JSON.parse(res.responseText).data.mResult.replace(/\(.*?ad\.html\)/g, '').trim()
            }else if (currentAPI.name === APIConst.Xunfei) {
                yiwen = JSON.parse(decodeBase64toString(JSON.parse(res.responseText).payload.result.text)).trans_result.dst
            }else if (currentAPI.name === APIConst.WPSKuaiyiWeb) {
                yiwen = JSON.parse(res.responseText).data.trans_result[0].tgt_para;
            } else {
                //default
                yiwen = JSON.parse(res.responseText)[0].translations[0].text;
            }

            if (yiwen === text) return

            //连击翻译及特殊处理
            if(/(input|textarea)/i.test(node.nodeName)){

                if (node.getAttribute("triple")){
                    if(node.value){
                        node.value = yiwen //三击
                    }
                }else if(node.hasAttribute('placeholder')){
                    //提示词
                    node.setAttribute('placeholder', yiwen);
                }
                return
            }

            /*node.innerText = text + "=>" + yiwen*/
            const outersp = document.createElement("span")
            outersp.innerHTML = text + " " //src text
            const sp = document.createElement("span")
            sp.setAttribute("class",
                isDoubleShow && isHighlight ? `translate-span light-color lang-${lang}` : `translate-span lang-${lang}`)
            sp.innerHTML = yiwen

            if (!isDoubleShow) {
                //单
                const srcSpan = document.createElement("span")
                srcSpan.setAttribute("class", `translate-src hide lang-${lang}`)
                srcSpan.innerHTML = text //src text
                outersp.innerHTML = '' // clear src text
                outersp.append(srcSpan)
                outersp.append(sp)
            } else {
                //双
                outersp.append(sp)
            }
            node.replaceWith(outersp);

            if (enableCache && res && !res.cacheResult && yiwen && text) {
                //缓存数据
                if (lang === currentAPI.ChineseLang) {
                    //en to zh
                    const arr = [{english: text, chinese: yiwen}]
                    storeCache(`${currentAPI.name}wordCache`, arr)
                } else if (lang === currentAPI.EnglishLang) {
                    //zh to en
                    const arr = [{english: yiwen, chinese: text}]
                    storeCache(`${currentAPI.name}wordCache`, arr)
                }
            }

        } catch (ex) {
            console.error(" 未知错误!", ex, node)
        }
    }

    //微软翻译
    function translateMicrosoft(text, node, lang) {
        if (!authCode || !text) {
            console.error("no authCode or text:", authCode, text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        GM_fetch({
            method: "POST",
            url: `https://api-edge.cognitive.microsofttranslator.com/translate?from=&to=${lang}&api-version=3.0&includeSentenceLength=true`,
            headers: {
                "authorization": `Bearer ${authCode}`,
                "Content-Type": "application/json",
            },
            data: JSON.stringify([{"Text": text}]),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //百度api翻译
    function translateBaiduApi(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        const salt = `${Date.now()}`;
        const sign = CryptoJS.MD5(`${APIConst.BaiduAPI.appid}${text}${salt}${APIConst.BaiduAPI.secret}`).toString();
        const params = new URLSearchParams();
        let sendData = {
            q: text,
            from: "auto",
            to: lang,
            appid: `${APIConst.BaiduAPI.appid}`,
            salt: `${salt}`,
            sign: sign
        }
        for (const key in sendData) {
            params.append(key, sendData[key]);
        }
        const encodedData = params.toString();

        GM_fetch({
            method: "POST",
            url: `https://fanyi-api.baidu.com/api/trans/vip/translate`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: encodedData,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //有道api翻译
    function truncate(q) {
        const len = q.length;
        if (len <= 20) return q;
        return q.substring(0, 10) + len + q.substring(len - 10, len);
    }

    function translatYoudaoAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        const appId = APIConst.YoudaoAPI.appId;
        const appkey = APIConst.YoudaoAPI.appKey;
        ;
        const salt = (new Date).getTime();
        const curtime = Math.round(new Date().getTime() / 1000);
        const query = text;
        const sign = CryptoJS.SHA256(appId + truncate(query) + salt + curtime + appkey).toString(CryptoJS.enc.Hex);

        const params = new URLSearchParams();
        let sendData = {
            q: query,
            appKey: appId,
            salt: salt,
            from: from,
            to: lang,
            sign: sign,
            signType: "v3",
            curtime: curtime,
        }

        for (const key in sendData) {
            params.append(key, sendData[key]);
        }
        const encodedData = params.toString();
        console.log(encodedData)
        GM_fetch({
            method: "POST",
            url: `https://openapi.youdao.com/api`,
            headers: {
                "accept": "application/json, text/javascript, */*;",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            data: encodedData,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //Google翻译
    function translateGoogle(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        GM_fetch({
            method: "GET",
            url: `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${lang}&q=${encodeURIComponent(text)}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //搜狗web

    function isMobile() {
        let userAgentInfo = navigator.userAgent.toLowerCase();
        let mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod", "Mobile"];
        let mobile_flag = false;
        //根据userAgent判断是否是手机
        for (let v = 0; v < mobileAgents.length; v++) {
            if (userAgentInfo.indexOf(mobileAgents[v].toLowerCase()) > -1) {
                mobile_flag = true;
                break;
            }
        }
        return mobile_flag;
    }

    function uuidv4() {
        let t, n, r = "";
        for (t = 0; t < 32; t++) {
            n = 16 * Math.random() | 0,
            8 !== t && 12 !== t && 16 !== t && 20 !== t || (r += "-");
            const e = 3 & n
                , o = 16 === t ? 8 | e : n;
            r += (12 === t ? 4 : o).toString(16)
        }
        return r
    }


    function translateSogouWeb(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            "Content-Type": "application/json;charset=UTF-8",
            "Origin": "https://fanyi.sogou.com",
            "Referer": `https://fanyi.sogou.com/text?keyword=${encodeURIComponent(text)}&transfrom=en&transto=zh-CHS&model=general`,
            "Accept": "application/json, text/plain, */*",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
        }


        let sign = CryptoJS.MD5("".concat(from).concat(lang).concat(text).concat(secretCode)).toString();

        GM_fetch({
            method: "POST",
            url: `https://fanyi.sogou.com/api/trans${isMobile() ? "wap" : "pc"}/text/result`,
            headers: header,
            data: JSON.stringify({
                "from": from,
                "to": lang,
                "text": text,
                "client": isMobile() ? "wap" : "pc",
                "fr": isMobile() ? "browser_wap" : "browser_pc",
                "needQc": 1,
                "s": sign,
                "uuid": sogou_uuid || uuidv4(),
                "exchange": false
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    function translateICIBAWeb(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            "content-type": "application/x-www-form-urlencoded",
            "Referer": `https://www.iciba.com/translate`,
            "origin": "https://ifanyi.iciba.com"
        }

        const v = "6key_web_new_fanyi".concat("6dVjYLFyzfkFkk").concat(text.replace(/(^\s*)|(\s*$)/g, ""))

        let sign = CryptoJS.MD5(v).toString().substring(0, 16);

        sign = AES_ECB.encrypt(sign,"L4fBtD5fLC9FQw22")
        //debugger

        GM_fetch({
            method: "POST",
            url: `https://ifanyi.iciba.com/index.php?c=trans&m=fy&client=6&auth_user=key_web_new_fanyi&sign=${sign}`,
            headers: header,
            data: `from=${from}&to=${lang}&q=${encodeURIComponent(text)}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //彩云翻译
    function toBase64(e) {
        const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            , i = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"
            , a = n => t.indexOf(n)
            , o = n => a(n) > -1 ? i[a(n)] : n;
        return e.split("").map(o).join("")
    }

    function decodeCaiyun(target) {
        if (!target) return
        const t = toBase64(target);
        // 将 base64 编码的字符串转换为字节数组
        const bytes = CryptoJS.enc.Base64.parse(t);
        // 将字节数组转换为 UTF-8 字符串
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function translatCaiyunWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        if (!caiyun_JWT || !caiyun_Token) {
            console.error("no caiyun_JWT or caiyun_Token:", caiyun_JWT, caiyun_Token)
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            "Referer": `https://fanyi.caiyunapp.com/`,
            "origin": "https://fanyi.caiyunapp.com",
            "accept": "application/json, text/plain, */*",
            "app-name": "xy",
            "content-type": "application/json;charset=UTF-8",
            "device-id": caiyun_deviceID,
            "os-type": "web",
            "os-version": "",
            "t-authorization": caiyun_JWT,
            "x-authorization": caiyun_Token
        }

        GM_fetch({
            method: "POST",
            url: `https://api.interpreter.caiyunai.com/v1/translator`,
            headers: header,
            data: JSON.stringify({
                "source": text,
                "trans_type": `${from}2${lang}`,
                "request_id": "web_fanyi",
                "media": "text",
                "os_type": "web",
                "dict": true,
                "cached": true,
                "replaced": true,
                "style": "formal",
                "browser_id": caiyun_deviceID
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //获取chrome版本
    function getChromeVersion() {
        const userAgent = navigator.userAgent;
        const match = userAgent.match(/Chrome\/([\d.]+)/);
        if (match && match[1]) {
            return match[1]; // 返回版本号，例如 "93.0.4577.63"
        } else {
            return '122.0.6261.95'; // 如果不是Chrome浏览器或者无法解析版本号，则返回null
        }
    }


    //腾讯交互翻译
    function translatTransmartWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let header = {
            'Content-Type': 'application/json',
            'Host': 'transmart.qq.com',
            'Origin': 'https://transmart.qq.com',
            'Referer': 'https://transmart.qq.com/'
        }

        //TODO
        GM_fetch({
            method: "POST",
            url: `https://transmart.qq.com/api/imt`,
            headers: header,
            data: JSON.stringify({
                "header": {
                    "fn": "auto_translation",
                    "session": "",
                    "client_key": TRANSMART_CLIENT_KEY ? TRANSMART_CLIENT_KEY: `browser-chrome-${getChromeVersion()}-Windows_10-${uuidv4()}-${Date.now()}`,
                    "user": ""
                },
                "type": "plain",
                "model_category": "normal",
                "text_domain": "general",
                "source": {
                    "lang": "auto",
                    "text_list": [text]
                },
                "target": {
                    "lang": lang
                }
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //deepL web
    //let deepl_id = 1e4 * Math.round(1e4 * Math.random())
    function translatDeepLWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            'Content-Type': 'application/json',
            'Origin': 'https://www.deepl.com',
            'Referer': 'https://www.deepl.com/'
        }

        let r = Date.now();
        let n = 1;
        n += ((text || "").match(/[i]/g) || []).length

        let deepl_id = 1e4 * Math.round(1e4 * Math.random())
        GM_fetch({
            method: "POST",
            url: `https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs`,
            headers: header,
            anonymous: true,
            nocache: true,
            data: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "LMT_handle_jobs",
                "params": {
                    "jobs": [
                        {
                            "kind": "default",
                            "sentences": [
                                {
                                    "text": text,
                                    "id": 0,
                                    "prefix": ""
                                }
                            ],
                            "raw_en_context_before": [],
                            "raw_en_context_after": [],
                            "preferred_num_beams": 4,
                            "quality": "fast"
                        }
                    ],
                    "lang": {
                        "preference": {
                            "weight": {
                                "DE": 0.18427,
                                "EN": from === currentAPI.EnglishLang ? 9.93878 : 5.90582,
                                "ES": 0.13236,
                                "FR": 0.16311,
                                "IT": 0.11621,
                                "JA": 0.17963,
                                "NL": 0.1865,
                                "PL": 0.11549,
                                "PT": 0.10159,
                                "RU": 0.10577,
                                "ZH": from === currentAPI.ChineseLang ? 9.93878 : 5.90582,
                                "BG": 0.07468,
                                "CS": 0.09005,
                                "DA": 0.08567,
                                "EL": 0.07069,
                                "ET": 0.0836,
                                "FI": 0.09628,
                                "HU": 0.08731,
                                "LT": 0.07119,
                                "LV": 0.06866,
                                "RO": 0.07842,
                                "SK": 0.07497,
                                "SL": 0.08492,
                                "SV": 0.10275,
                                "TR": 0.07728,
                                "ID": 0.09161,
                                "UK": 0.08573,
                                "KO": 0.04671,
                                "NB": 0.05511
                            },
                            "default": "default"
                        },
                        "source_lang_user_selected": from,
                        "target_lang": lang
                    },
                    "priority": -1,
                    "commonJobParams": {
                        "mode": "translate",
                        "browserType": 1
                    },
                    "timestamp": r + (n - r % n)
                },
                "id": deepl_id
            }).replace('hod":"', (deepl_id + 3) % 13 == 0 || (deepl_id + 5) % 29 == 0 ? 'hod" : "' : 'hod": "'),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    function uuid_papago() {
        let a = (new Date).getTime();
        const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            const t = (a + 16 * Math.random()) % 16 | 0;
            return a = Math.floor(a / 16),
                ("x" === e ? t : 3 & t | 8).toString(16)
        })
        return id;
    }

    //PapaGO
    let papaId;

    function translatPapagoWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        papaId = papaId || uuid_papago();
        const time = (new Date).getTime() - 1073;

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            'Origin': 'https://papago.naver.com',
            'Referer': 'https://papago.naver.com/',
            "accept": "application/json",
            "Authorization": 'PPG ' + papaId + ':' + CryptoJS.HmacMD5(papaId + '\nhttps://papago.naver.com/apis/nsmt/translate\n' + time, "v1.8.0_33f494c37e").toString(CryptoJS.enc.Base64),
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Device-Type": "pc",
            "Sec-Fetch-Site": "same-origin",
            "Timestamp": `${time}`,
            "X-Apigw-Partnerid": "papago"
        }

        GM_fetch({
            method: "POST",
            url: `https://papago.naver.com/apis/nsmt/translate`,
            headers: header,
            data: `deviceId=${papaId}&locale=zh-CN&dict=true&dictDisplay=30&honorific=false&instant=false&paging=false&source=${from}&target=${lang}&text=${encodeURIComponent(text)}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //有道手机版web
    function translatYoudaoMobileWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            'Origin': 'https://m.youdao.com',
            'Referer': 'https://m.youdao.com/translate/',
            "Content-Type": "application/x-www-form-urlencoded"
        }

        GM_fetch({
            method: "POST",
            url: `https://m.youdao.com/translate`,
            headers: header,
            data: `inputtext=${encodeURIComponent(text)}&type=${from}2${lang}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //百度手机版 web

    let baidu_gtk; //windows.gtk
    let baidu_token; // token
    function getBaiduSign(t, r) {
        var o, i = t.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
        if (null === i) {
            var a = t.length;
            a > 30 && (t = "".concat(t.substr(0, 10)).concat(t.substr(Math.floor(a / 2) - 5, 10)).concat(t.substr(-10, 10)))
        } else {
            for (var s = t.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), c = 0, u = s.length, l = []; c < u; c++)
                "" !== s[c] && l.push.apply(l, function (t) {
                    if (Array.isArray(t))
                        return e(t)
                }(o = s[c].split("")) || function (t) {
                    if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"])
                        return Array.from(t)
                }(o) || function (t, n) {
                    if (t) {
                        if ("string" == typeof t)
                            return e(t, n);
                        var r = Object.prototype.toString.call(t).slice(8, -1);
                        return "Object" === r && t.constructor && (r = t.constructor.name),
                            "Map" === r || "Set" === r ? Array.from(t) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? e(t, n) : void 0
                    }
                }(o) || function () {
                    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()),
                c !== u - 1 && l.push(i[c]);
            var p = l.length;
            p > 30 && (t = l.slice(0, 10).join("") + l.slice(Math.floor(p / 2) - 5, Math.floor(p / 2) + 5).join("") + l.slice(-10).join(""))
        }
        //debugger
        for (var d = "".concat(String.fromCharCode(103)).concat(String.fromCharCode(116)).concat(String.fromCharCode(107)), h = (null !== r ? r : (r = window[d] || "") || "").split("."), f = Number(h[0]) || 0, m = Number(h[1]) || 0, g = [], y = 0, v = 0; v < t.length; v++) {
            var _ = t.charCodeAt(v);
            _ < 128 ? g[y++] = _ : (_ < 2048 ? g[y++] = _ >> 6 | 192 : (55296 == (64512 & _) && v + 1 < t.length && 56320 == (64512 & t.charCodeAt(v + 1)) ? (_ = 65536 + ((1023 & _) << 10) + (1023 & t.charCodeAt(++v)),
                g[y++] = _ >> 18 | 240,
                g[y++] = _ >> 12 & 63 | 128) : g[y++] = _ >> 12 | 224,
                g[y++] = _ >> 6 & 63 | 128),
                g[y++] = 63 & _ | 128)
        }
        for (var b = f, w = "".concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(97)) + "".concat(String.fromCharCode(94)).concat(String.fromCharCode(43)).concat(String.fromCharCode(54)), k = "".concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(51)) + "".concat(String.fromCharCode(94)).concat(String.fromCharCode(43)).concat(String.fromCharCode(98)) + "".concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(102)), x = 0; x < g.length; x++)
            b = n_baidu(b += g[x], w);
        return b = n_baidu(b, k),
        (b ^= m) < 0 && (b = 2147483648 + (2147483647 & b)),
            "".concat((b %= 1e6).toString(), ".").concat(b ^ f)
    }

    function n_baidu(t, e) {
        for (var n = 0; n < e.length - 2; n += 3) {
            var r = e.charAt(n + 2);
            r = "a" <= r ? r.charCodeAt(0) - 87 : Number(r),
                r = "+" === e.charAt(n + 1) ? t >>> r : t << r,
                t = "+" === e.charAt(n) ? t + r & 4294967295 : t ^ r
        }
        return t
    }

    function translatBaiduMobileWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
            "x-requested-with": "XMLHttpRequest",
            "origin": "https://fanyi.baidu.com",
            "Referer": "https://fanyi.baidu.com/"
        }

        GM_fetch({
            method: "POST",
            url: `https://fanyi.baidu.com/basetrans`,
            headers: header,
            data: `query=${encodeURIComponent(text)}&from=${from}&to=${lang}&token=${baidu_token}&sign=${getBaiduSign(text, baidu_gtk)}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //易翻通
    function Qe() {
        return window.crypto || window.msCrypto
    }

    var Xe = function () {
        function e() {
            this.buffer = new Uint8Array(8),
                Qe().getRandomValues(this.buffer),
                this.buffer[0] = 127 & this.buffer[0]
        }

        return e.prototype.toString = function (e) {
            var t = this.readInt32(0)
                , n = this.readInt32(4)
                , r = "";
            do {
                var a = t % e * 4294967296 + n;
                t = Math.floor(t / e),
                    n = Math.floor(a / e),
                    r = (a % e).toString(e) + r
            } while (t || n);
            return r
        }
            ,
            e.prototype.toDecimalString = function () {
                return this.toString(10)
            }
            ,
            e.prototype.toPaddedHexadecimalString = function () {
                var e = this.toString(16);
                return Array(17 - e.length).join("0") + e
            }
            ,
            e.prototype.readInt32 = function (e) {
                return 16777216 * this.buffer[e] + (this.buffer[e + 1] << 16) + (this.buffer[e + 2] << 8) + this.buffer[e + 3]
            }
            ,
            e
    }();

    function translatFlittoWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }
        let traceId = new Xe
        let spanId = new Xe

        const traceparent = "00-0000000000000000".concat(traceId.toPaddedHexadecimalString(), "-")
            .concat(spanId.toPaddedHexadecimalString(), "-0").concat(true ? "1" : "0")

        let header = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/json",
            "traceparent": traceparent,
            "origin": "https://www.flitto.com.cn",
            "Referer": "https://www.flitto.com.cn/language/translation/text"
        }

        GM_fetch({
            method: "POST",
            url: `https://www.flitto.com.cn/api/1.2/tr/recommends/text`,
            headers: header,
            data: JSON.stringify({
                "src_lang_id": from,
                "dst_lang_id": lang,
                "content": text,
                "size": text.length
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    // Yandex Web
    let yandex_reqid;
    let yandex_uid;
    let yandex_spravka;
    let yandex_index = 0;

    async function translatYandexWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        if (!yandex_reqid) {
            console.error("no yandex_reqid", yandex_reqid)
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }


        let header = {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "x-retpath-y": "https://translate.yandex.com",
            "origin": "https://translate.yandex.com",
            "Referer": "https://translate.yandex.com/",
            "Sec-Fetch-Site": "cross-site"
        }


        GM_fetch({
            method: "POST",
            anonymous: true,
            url: `https://translate.yandex.net/api/v1/tr.json/translate?id=${yandex_reqid}-${yandex_index++}-0&srv=tr-text&source_lang=${from}&target_lang=${lang}&reason=type-end&format=text&ajax=1&yu=${yandex_uid}${yandex_spravka ? '&spravka=' + yandex_spravka : ''}`,
            headers: header,
            data: `text=${encodeURIComponent(text)}&options=4`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //福昕翻译
    async function translatFuxiWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }


        let header = {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://fanyi.pdf365.cn",
            "Referer": "https://fanyi.pdf365.cn/free",
            "x-requested-with": "XMLHttpRequest"
        }

        let time = Date.parse(new Date);

        GM_fetch({
            method: "POST",
            anonymous: true,
            url: `https://fanyi.pdf365.cn/api/wordTranslateResult`,
            headers: header,
            data: `plateform=web&orginL=${from}&targetL=${lang}&text=${encodeURIComponent(text)}&timestamp=${time}&sign=${CryptoJS.MD5(time + "FOXIT_YEE_TRANSLATE").toString()}&userId=`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //Worldlingo
    function translatWorldlingoAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        GM_fetch({
            method: "GET",
            url: `https://www.worldlingo.com/Sg0NoecXVVBsQeWBZ7hb_1rhKD4jEN2ElsZbrxpDzkcM-/texttranslate?wl_srcenc=utf-8&wl_tp=&wl_srclang=${from}&wl_trglang=${lang}&wl_text=${encodeURIComponent(text)}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //CNKI
    function encryptCNKI(txt) {

        return  CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(txt), CryptoJS.enc.Utf8.parse("4e87183cfd3a45fe"), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString().replace(/\//g, "_").replace(/\+/g, "-")

    }
    let CNKI_TOKEN;
    function translatCNKIWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (!CNKI_TOKEN) {
            console.error("no CNKI_TOKEN:", CNKI_TOKEN)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        GM_fetch({
            method: "POST",
            url: `https://dict.cnki.net/fyzs-front-api/translate/literaltranslation`,
            headers: {
                "accept": "application/json, text/plain, */*",
                "cache-control": "no-cache",
                "content-type": "application/json;charset=UTF-8",
                "sec-fetch-site": "same-origin",
                "token": CNKI_TOKEN,
                "Origin":"https://dict.cnki.net",
                "Referer":"https://dict.cnki.net/index"
            },
            data: JSON.stringify({
                "words": encryptCNKI(text),
                "translateType": lang
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    //爱词霸


    const AES_ECB = {

        encrypt: function(e, t) {
            return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(e), CryptoJS.enc.Utf8.parse(t), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).toString()
        },
        decrypt: function(e, t) {
            return CryptoJS.AES.decrypt(e, CryptoJS.enc.Utf8.parse(t), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8)
        }
    };

    function decodeICIBA(content) {
      return  AES_ECB.decrypt(content,"aahc3TfyfCEmER33")
    }

    //讯飞
    function getRfc1123Date(){
        const date = new Date();
        const options = {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'GMT',
            hour12: false,
            timeZoneName: 'short'
        };

        const rfc1123Date = date.toLocaleString('en-US', options);
        //console.log(rfc1123Date);//Sun, Jul 09, 2023, 12:08:48 PM UTC

        let parts = rfc1123Date.split(",")
        let subparts = parts[1].split(" ")

        const ret = `${parts[0]}, ${subparts[2]} ${subparts[1]}${parts[2]}${parts[3].replace("UTC","GMT")}`;

        console.log(ret)//Mon, 30 Nov 2020 02:34:33 GMT

        return ret;
    }

    function hmacSha256(text,secretKey) {
        return  CryptoJS.HmacSHA256(text, secretKey);

    }

    function base64WordArray(WordArray) {
        //var words = CryptoJS.enc.Utf8.parse(text); // WordArray object
        return CryptoJS.enc.Base64.stringify(WordArray);
    }
    function base64Text(text) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    }
    function decodeBase64toString(base64Str) {
        return CryptoJS.enc.Base64.parse(base64Str).toString(CryptoJS.enc.Utf8);
    }


    function translatXunfeiAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        const today = getRfc1123Date()

        const signature_origin = "host: itrans.xf-yun.com\n" +
            "date: "+ today +"\n" +
            "POST /v1/its HTTP/1.1"

        const signature_sha= hmacSha256(signature_origin , APIConst.XunfeiAPI.APISecret)

        const signature = base64WordArray(signature_sha)

        //console.log("signature", signature)

        const authorization  = base64Text(`api_key="${APIConst.XunfeiAPI.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`)

        //console.log("authorization", authorization)

        GM_fetch({
            url: `https://itrans.xf-yun.com/v1/its?authorization=${authorization}&host=itrans.xf-yun.com&date=${encodeURIComponent(today)}`,
            method: "POST",
            headers: {
                "content-type":"application/json",
                "Authentication": authorization,
                "date":today
            },
            data: JSON.stringify({
                "header": {
                    "app_id": APIConst.XunfeiAPI.APPID,
                    "status": 3,
                    "res_id": generateRandomString(6)
                },
                "parameter": {
                    "its": {
                        "from": from,
                        "to": lang,
                        "result": {}
                    }
                },
                "payload": {
                    "input_data": {
                        "encoding": "utf8",
                        "status": 3,
                        "text": base64Text(text)
                    }
                }
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });


    }


    //wps web
    function getSignatureStr(obj)  {
        const newkey = Object.keys(obj).sort()
        let signatureStr = ''
        newkey.forEach((item) => {
            // 空参数不参与签名
            if (obj[item] === 0) {
                signatureStr += item + '=' + obj[item]
            } else if (obj[item] != 'undefined' && obj[item] != null && obj[item] != '' && typeof obj[item] != 'object') {
                signatureStr += item + '=' + obj[item]
            }
        })
        return signatureStr
    }

    let wps_xcsrftoken ;
    function translatWPSKuaiyiWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (!wps_xcsrftoken) {
            console.error("no wps_xcsrftoken:", wps_xcsrftoken)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        // ***** 统一新增签名修堵 漏洞 ***** //
        const timestamp = new Date().getTime()
        //加入时间戳
        const nonce = `${Math.floor(Math.random() * 10000000000)}`

        const options = {
            "data": {
                "text": text,
                "from_lang": from,
                "to_lang": lang
            }
        }

        const needSortObj = Object.assign(
            {
                timestamp,
                nonce,
            },
            options.params || options.data
        )
        //
        // const needSortObj ={
        //     "timestamp": timestamp,
        //     "nonce": nonce,
        //     "text": text,
        //     "from_lang": from,
        //     "to_lang": lang
        // }

        const signatureStr = getSignatureStr(needSortObj)
        const sign_x = `appid=zxcde321456tgbvf&nonce=${nonce}&timestamp=${timestamp}`
        const signature = CryptoJS.MD5(`/v1/mt/trans_text${signatureStr}d5cefewwheuasfd2c9ef83996fd0d82`).toString()

        GM_fetch({
            url: `https://kuaiyi.wps.cn/v1/mt/trans_text`,
            method: "POST",
            headers:{
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
                "origin": "https://kuaiyi.wps.cn",
                "Referer": "https://kuaiyi.wps.cn/txt-translate?banGetPreTxt=true",
                "sec-fetch-site": "same-origin",
                "sign-x": sign_x,
                "signature": signature,
                "x-csrftoken": wps_xcsrftoken
            },
            data: JSON.stringify(options.data),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });






    }


    //阿里翻译
    let ali_uuid;
    let webFormBoundary = generateRandomString(16)

    function translatAlibabaWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }

        let header = {
            "content-type": `multipart/form-data; boundary=----WebKitFormBoundary${webFormBoundary}`,
            "accept": "application/json, text/plain, */*",
            'Origin': 'https://translate.alibaba.com',
            'Referer': 'https://translate.alibaba.com/',
            "x-xsrf-token_property_item": ali_uuid,
            "sec-fetch-site": "same-origin",
        }

        GM_fetch({
            method: "POST",
            url: `https://translate.alibaba.com/api/translate/text`,
            headers: header,
            data: `------WebKitFormBoundary${webFormBoundary}\r
Content-Disposition: form-data; name="srcLang"\r
\r
auto\r
------WebKitFormBoundary${webFormBoundary}\r
Content-Disposition: form-data; name="tgtLang"\r
\r
${lang}\r
------WebKitFormBoundary${webFormBoundary}\r
Content-Disposition: form-data; name="domain"\r
\r
general\r
------WebKitFormBoundary${webFormBoundary}\r
Content-Disposition: form-data; name="query"\r
\r
${text}\r
------WebKitFormBoundary${webFormBoundary}\r
Content-Disposition: form-data; name="_csrf"\r
\r
${ali_uuid}\r
------WebKitFormBoundary${webFormBoundary}--\r
`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }

    const generateRandomIP = () => {
        const ip = [];
        for (let i = 0; i < 4; i++) {
            ip.push(Math.floor(Math.random() * 256));
        }
        console.log(ip.join('.'))
        return ip.join('.');
    }

    function translatHujiangWebAPI(text, node, lang) {
        if (!text) {
            console.error("no text:", text)
            return
        }
        if (noTranslateWords.includes(text)) {
            return;
        }
        let from;
        if (lang === currentAPI.ChineseLang) {
            from = currentAPI.EnglishLang;
        } else {
            from = currentAPI.ChineseLang;
        }

        let header = {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
            "accept": "*/*",
            // "X-Forwarded-For": generateRandomIP(),
            "Referer": `https://dict.hjenglish.com/app/trans`,
            "origin": "https://dict.hjenglish.com"
        }

        GM_fetch({
            method: "POST",
            url: `https://dict.hjenglish.com/v10/dict/translation/${from}/${lang}`,
            headers: header,
            data: `content=${encodeURIComponent(text)}`,
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                renderPage(res, text, node, lang)
            } else {
                console.error('访问失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });

    }


    //API分流
    function dispatchAPI(txt, node, lang) {
        if (currentAPI.name === APIConst.Baidu) {
            translateBaiduApi(txt, node, lang)
        } else if (currentAPI.name === APIConst.Microsoft) {
            translateMicrosoft(txt, node, lang)
        } else if (currentAPI.name === APIConst.Google) {
            translateGoogle(txt, node, lang)
        } else if (currentAPI.name === APIConst.SogouWeb) {
            translateSogouWeb(txt, node, lang)
        } else if (currentAPI.name === APIConst.ICIBAWeb) {
            translateICIBAWeb(txt, node, lang)
        } else if (currentAPI.name === APIConst.HujiangWeb) {
            translatHujiangWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.Youdao) {
            translatYoudaoAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.CaiyunWeb) {
            translatCaiyunWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.TransmartWeb) {
            translatTransmartWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.AlibabaWeb) {
            translatAlibabaWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.PapagoWeb) {
            translatPapagoWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.YoudaoMobileWeb) {
            translatYoudaoMobileWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.Worldlingo) {
            translatWorldlingoAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.DeepLWeb) {
            translatDeepLWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.BaiduMobileWeb) {
            translatBaiduMobileWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.FlittoWeb) {
            translatFlittoWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.YandexWeb) {
            translatYandexWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.FuxiWeb) {
            translatFuxiWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.CNKIWeb) {
            translatCNKIWebAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.Xunfei) {
            translatXunfeiAPI(txt, node, lang)
        } else if (currentAPI.name === APIConst.WPSKuaiyiWeb) {
            translatWPSKuaiyiWebAPI(txt, node, lang)
        } else {
            //default microsoft
            translateMicrosoft(txt, node, lang)
        }
    }

    //遍历
    async function traversePlus(node, lang) {
        if (!node) return;
        // 排除标签则跳过
        if (/^(pre|script|code|#comment|iframe)$/i.test(node.nodeName)) {
            return;
        }
        //排除类名
        if (/(translate-main|bbCodeCode|mathjax-tex|gpt-container|translate-span|highlight|translate-src|toast-|code|MyColorSelector)/i.test(node.className)) {
            //debugger
            //fix GitHub readme , issues.chromium.org
            if(/readme/i.test(node.id) || /B-ISSUE-DESCRIPTION/i.test(node.nodeName)){
                //do nothing
                console.warn("special case:",node.id,node.nodeName)
            }else {
                //debugger
                //intercept
                return;
            }
        }

        //shadowRoot
        if (node.shadowRoot) {
            traversePlus(node.shadowRoot, lang)
        }



        // console.error("nodeType:", node.nodeType)


        // 如果节点没有子节点，则打印节点内容
        if (node.childNodes.length === 0) {

            // 特殊标签文本处理
            if (!/^(INPUT|textarea)$/i.test(node.nodeName)) {

                if(isSupportMultiLang()){
                    if (lang === currentAPI.ChineseLang && isAllChinese(node.textContent)) {
                        //不含英文，外文
                        return;
                    }
                }else {
                    if (lang === currentAPI.EnglishLang && !hasChinese(node.textContent)) {
                        //不含中文
                        return;
                    }
                    if (lang === currentAPI.ChineseLang && !hasEnglish(node.textContent)) {
                        //if (lang === currentAPI.ChineseLang && isAllChinese(node.textContent)) {
                        //不含英文，外文
                        return;
                    }
                }


            }

            if (node.textContent) {
                //if(node.textContent.includes("checkCurrentAuth")) debugger
                const srcText = node.textContent.trim();
                if (srcText) {
                    //排除纯数字
                    if (/^\d+$/.test(srcText)) {
                        return;
                    }
                    //排除长度大于1中只有一个英文
                    if (lang === currentAPI.ChineseLang && srcText.length > 1) {
                        // debugger
                        if (/^[a-zA-Z]$/.test(srcText.replace(/[^a-zA-Z]/g, '').trim())) {
                            return;
                        }
                    }


                    //取缓存  renderPage(res, text, node, lang)


                    const txt = node.textContent.trim();

                    if (enableCache) {
                        translateFromCache(txt, node, lang, `${currentAPI.name}wordCache`)
                            .then(function (success) {
                                //缓存成功
                            }, function (reason) {
                                //缓存失败

                                //API分流
                                dispatchAPI(txt, node, lang)

                            });
                        //return;
                    }


                }

            }else if(/(input|textarea)/i.test(node.nodeName) && node.hasAttribute('placeholder')){
                dispatchAPI(node.getAttribute('placeholder'), node, lang)
            }
        } else {
            // 如果有子节点，则递归遍历子节点
            for (let i = 0; i < node.childNodes.length; i++) {
                traversePlus(node.childNodes[i], lang);
            }
        }
    }


    //鉴权
    async function auth() {
        let res = await GM_fetch({
            method: "GET",
            url: "https://edge.microsoft.com/translate/auth",
            responseType: "text",
        })
        if (res.status === 200) {
            authCode = res.responseText
        } else {
            console.error('访问失败了', res)
        }
    }

    async function authSogou() {
        let res = await GM_fetch({
            method: "GET",
            url: "https://fanyi.sogou.com",
            responseType: "text",
        })
        if (res.status === 200) {
            secretCode = secretCode || /secretCode\":(\d+)/i.exec(res.responseText)[1]
            sogou_uuid = /uuid\":\"(.*?)\"/i.exec(res.responseText)[1]
            console.warn("secretCode", secretCode)
            console.warn("sogou_uuid", sogou_uuid)
        } else {
            console.error('访问失败了', res)
        }
    }
    async function authWps() {
        wps_xcsrftoken = await GM_getValue("wps_xcsrftoken","")
        if(!wps_xcsrftoken){
            Toast.error("wps_xcsrftoken为空,请打开到https://kuaiyi.wps.cn/获取")
        }
    }

    async function authYandex() {

        yandex_uid = await GM_getValue("yandexuid") || ""
        yandex_spravka = await GM_getValue("yandexspravka") || ""

        if (!yandex_uid || !yandex_spravka) {
            Toast.error("uid或speavka不存，可能存在错误，请前往https://translate.yandex.com 获取")
        }

        let res = await GM_fetch({
            method: "GET",
            url: "https://translate.yandex.com",
            responseType: "text",
        })
        if (res.status === 200) {
            yandex_reqid = yandex_reqid || /reqid = '(.*?)'/i.exec(res.responseText)[1]
            console.warn("yandex_reqid", yandex_reqid)
        } else {
            console.error('访问失败了', res)
        }
    }


    async function authCNKI() {

        CNKI_TOKEN = await GM_getValue("CNKI_TOKEN","")

        if (!CNKI_TOKEN) {
            Toast.error("CNKI_TOKEN不存在，可能存在错误，请前往https://dict.cnki.net 获取")
        }
    }

    async function authAliBaba() {
        let res = await GM_fetch({
            method: "GET",
            url: "https://translate.alibaba.com/api/translate/csrftoken",
            responseType: "text",
        })
        if (res.status === 200) {
            ali_uuid = JSON.parse(res.responseText).token
            console.warn("ali_uuid", ali_uuid)
        } else {
            console.error('访问失败了', res)
        }
    }


    async function authBaiduMobile() {
        let res = await GM_fetch({
            method: "GET",
            url: "https://fanyi.baidu.com",
            responseType: "text",
        })
        if (res.status === 200) {
            baidu_token = /token: ('|")(.*?)('|")/.exec(res.responseText)[2];
            baidu_gtk = /('|")(\d{6}\.\d{9})('|")/.exec(res.responseText)[2];
            console.warn("baidu_token", baidu_token)
            console.warn("baidu_gtk", baidu_gtk)
        } else {
            console.error('访问失败了', res)
        }
    }

    async function authHujiang() {
        let res = await GM_fetch({
            method: "GET",
            url: "https://dict.hjenglish.com/app/trans",
            responseType: "text",
        })
    }

    function generateRandomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    //彩云鉴权
    let caiyun_Token;
    let caiyun_JWT;
    let caiyun_deviceID = generateRandomString(32);
    let caiyun_browser_id = caiyun_deviceID;

    async function authCaiyun() {

        if (caiyun_JWT && caiyun_Token) return;

        let res = await GM_fetch({
            method: "GET",
            url: "https://fanyi.caiyunapp.com/",
            responseType: "text",
        })
        if (res.status === 200) {
            const tkjs = /\/assets\/index.(.*?).js/i.exec(res.responseText)[0];
            //debugger
            let res1 = await GM_fetch({
                method: "GET",
                url: `https://fanyi.caiyunapp.com/${tkjs}`,
                responseType: "text",
            })
            if (res1.status === 200) {
                caiyun_Token = /token:.{20}/i.exec(res1.responseText)[0] || caiyun_Token;
                console.warn("caiyun_Token", caiyun_Token)
                if (caiyun_Token) await generateCaiyunJWT()
            } else {
                console.error('caiyun_Token 失败了', res1)
                return
            }
        } else {
            console.error('访问失败了', res)
            return
        }
    }

    async function generateCaiyunJWT() {
        let header = {
            "Referer": `https://fanyi.caiyunapp.com/`,
            "origin": "https://fanyi.caiyunapp.com",
            "accept": "application/json, text/plain, */*",
            "app-name": "xy",
            "content-type": "application/json;charset=UTF-8",
            "device-id": caiyun_deviceID,
            "os-type": "web",
            "os-version": "",
            "x-authorization": caiyun_Token
        }

        GM_fetch({
            method: "POST",
            url: `https://api.interpreter.caiyunai.com/v1/user/jwt/generate`,
            headers: header,
            data: JSON.stringify({
                "browser_id": caiyun_browser_id
            }),
            responseType: "text",
        }).then(function (res) {
            if (res.status === 200) {
                caiyun_JWT = JSON.parse(res.responseText).jwt || caiyun_JWT;
                console.warn("caiyun_JWT", caiyun_JWT)
            } else {
                console.error('caiyun_JWT 失败了', res)
            }
        }, function (reason) {
            console.error(`出错了`, reason)
        });
    }


    //翻译
    async function translateTo(lang, rootNode, noclear) {
        if (!noclear) {
            clearSpan(lang)
        }
        //微软鉴权
        if (currentAPI.name === APIConst.Microsoft) {
            await auth()
        }

        //搜狗鉴权
        if (currentAPI.name === APIConst.SogouWeb && !secretCode) {
            await authSogou()
        }

        //沪江鉴权
        if (currentAPI.name === APIConst.HujiangWeb) {
            await authHujiang()
        }

        //彩云鉴权
        if (currentAPI.name === APIConst.CaiyunWeb) {
            await authCaiyun()
            if (!caiyun_JWT) return;
        }

        //阿里鉴权
        if (currentAPI.name === APIConst.AlibabaWeb && !ali_uuid) {
            await authAliBaba()
            if (!ali_uuid) return;
        }

        //百度鉴权
        if (currentAPI.name === APIConst.BaiduMobileWeb && (!baidu_token || !baidu_gtk)) {
            await authBaiduMobile()
            if (!baidu_token || !baidu_gtk) return;
        }

        //Yandex 鉴权
        if (currentAPI.name === APIConst.YandexWeb && !yandex_reqid) {
            await authYandex()
            if (!yandex_reqid) return;
        }

        //CNKI 鉴权
        if (currentAPI.name === APIConst.CNKIWeb && !CNKI_TOKEN) {
            await authCNKI()
            if (!CNKI_TOKEN) return;
        }
        //wps 鉴权
        if (currentAPI.name === APIConst.WPSKuaiyiWeb && !wps_xcsrftoken) {
            await authWps()
            if (!wps_xcsrftoken) return;
        }

        console.log(`translate to....${lang} : ${currentAPI.name}`)
        let root = document.body;
        if(location.host.includes("twitter.com") || location.host.includes("x.com")){
            root = document.querySelector('div[data-testid="primaryColumn"]') || root
        }
        traversePlus(rootNode || root, lang)
    }

    //add event
    console.log("=========中英双显互译=======");
    const translatemainDom = document.querySelector(".translate-main")
    const translatearrow = document.querySelector(".translate-arrow")

    //展开
    if(!isMobile()){
        translatemainDom.addEventListener("mouseover", () => {
            console.log("--2-")
            translatemainDom.classList.add("unfold")
        })
    }else {
        translatemainDom.addEventListener("click", () => {
            console.log("--1-")
            translatemainDom.classList.add("unfold")
        })
    }


    //收起
    if(!isMobile()){
        translatearrow.addEventListener("mouseout", (event) => {
            event.stopPropagation()
            console.log("--4-")
            translatemainDom.classList.remove("unfold")
        })
        translatemainDom.addEventListener('mouseleave', function() {
            console.log("--5-")
            translatemainDom.classList.remove('unfold');
        });
    }else {
        translatearrow.addEventListener("click", (event) => {
            event.stopPropagation()
            console.log("--3-")
            translatemainDom.classList.remove("unfold")
        })

    }


    //英转中
    document.querySelector("#en2zh").addEventListener("click", async (event) => {
        event.stopPropagation()
        try {
            Toast.info(`正在翻译。。。。当前API:${currentAPI.name}`)
        } catch (e) {
        }
        translateTo(currentAPI.ChineseLang)
    })

    //中转英
    document.querySelector("#zh2en").addEventListener("click", async (event) => {
        event.stopPropagation()
        try {
            Toast.info(`正在翻译。。。。当前API:${currentAPI.name}`)
        } catch (e) {
        }
        translateTo(currentAPI.EnglishLang)
    })

    //原文
    const sourceText = document.querySelector("#sourceText")
    sourceText.addEventListener("click", (event) => {
        event.stopPropagation()
        if (sourceText.querySelector("span").innerText === '原文') {
            document.querySelectorAll(".translate-span").forEach((node) => {
                node.classList.add("hide") //hide dest text
            });

            document.querySelectorAll(".translate-src").forEach((node) => {
                node.classList.remove("hide")//show src text
            });

            sourceText.querySelector("span").innerText = '译文'
        } else {
            document.querySelectorAll(".translate-span").forEach((node) => {
                node.classList.remove("hide") //show dest text
            });

            document.querySelectorAll(".translate-src").forEach((node) => {
                node.classList.add("hide") //hide src text
            });

            sourceText.querySelector("span").innerText = '原文'
        }

    })


    //双显
    const doubleShow = document.querySelector("#doubleShow")
    doubleShow.addEventListener("click", (event) => {
        event.stopPropagation()
        if (isDoubleShow) {
            isDoubleShow = false;
            Toast.error("双显已关")
        } else {
            isDoubleShow = true;
            Toast.success("双显已开")
        }
        GM_setValue("isDoubleShow", isDoubleShow)

    })

    //高亮
    const hlBtn = document.querySelector("#highlightTranslateText")
    hlBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        if (isHighlight) {
            isHighlight = false;
            Toast.error("高亮已关")
        } else {
            isHighlight = true;
            Toast.success("高亮已开")
        }
        GM_setValue("isDoubleShow", isHighlight)

    })

    //选词
    const leftSelectModeBtn = document.querySelector("#leftSelectMode")
    leftSelectModeBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        leftSelect()
    })

    //切换api
    const switchAPIBtn = document.querySelector("#switchAPI")
    switchAPIBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        //switchAPI()
        colorSelectAndSettings()

    })

    //自动翻译
    const autoTranslateSwitchBtn = document.querySelector("#autoTranslateSwitch")
    autoTranslateSwitchBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        autoTranslateSwitch()
    })

    //切换选词语言
    const changeSelectLangBtn = document.querySelector("#changeSelectLang")
    changeSelectLangBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        changeSelectLang()
    })

    //切换右击选词语言
    const rightSelectModeBtn = document.querySelector("#rightSelectMode")
    rightSelectModeBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        rightSelectMode()
    })

    //更新
    const updateScriptBtn = document.querySelector("#updateScript")
    updateScriptBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        if(isMobile()){
            location.href = "https://greasyfork.org/zh-CN/scripts/469073"
        }else {
            GM_openInTab("https://greasyfork.org/zh-CN/scripts/469073")
        }
    })


    // 判断是不是中文网页
    function isChinesePage() {
        const lang = document.documentElement.lang
        const mainLang = document.characterSet.toLowerCase()
        const pageTitle = document.title
        return lang.substring(0, 2) === 'zh' || mainLang.substring(0, 2) === 'gb' || /[\u4E00-\u9FFF]/.test(pageTitle);
    }

    //英语自动翻译
    setTimeout(async () => {
        if (englishAutoTranslate && !isChinesePage()) {
            console.log('自动翻译')
            Toast.success('检测到外文, 正在自动翻译...', '', {timeOut: 600})
            translateTo(currentAPI.ChineseLang)

        }
    }, 2000)

    //输入框连击三下空格翻译
    setTimeout( () => {
        let spaceCount = 0;
        let lastKeyPressTime = 0;
        let timeThreshold = 300; // 时间阈值，单位为毫秒

        document.body.addEventListener('keydown', function(event) {
            if (event.key === ' ' || event.keyCode === 32) { // 按下空格键
                let currentTime = new Date().getTime();
                console.log(currentTime - lastKeyPressTime)
                if (currentTime - lastKeyPressTime < timeThreshold) {
                    spaceCount++;
                } else {
                    spaceCount = 1;
                }

                lastKeyPressTime = currentTime;

                if (spaceCount === 3) {
                    console.log('连续三次按下空格键事件已触发！',event.target.nodeName);
                    const node = event.target;
                    Toast.success(`正在翻译,如需要切换请点击"语言"..=>${selectTolang}`)
                    if(/(input|textarea)/i.test(node.nodeName)){
                        node.setAttribute("triple","triple")
                        dispatchAPI(node.innerText || node.value.trim(), node, selectTolang)
                    }
                    spaceCount = 0; // 重置空格键计数

                }
            }
        });
    }, 2000)


    //window滚动事件
    let documentHeight = document.documentElement.scrollHeight;
    function handleScroll() {
        const currentDocumentHeight = document.documentElement.scrollHeight;

        if(currentDocumentHeight > documentHeight){
            console.log("滚动事件：页面变长。", currentDocumentHeight, documentHeight)
            documentHeight = currentDocumentHeight;
            translateTo(selectTolang)
        }
        console.log('总文档距离：', documentHeight);
    }

    setTimeout(()=>{

        if(scrollTranslate){
            window.addEventListener('scroll', handleScroll);
        }
    })

})();
