// ==UserScript==
// @name         MissAV 去广告脚本
// @namespace    https://github.com/qiu7c/Ad-close-user.js
// @version      1.12.0
// @author       qiu7c
// @description  去除 MissAV 网站弹窗广告 + 独立收藏夹页面
// @homepage     https://github.com/qiu7c/Ad-close-user.js
// @supportURL   https://github.com/qiu7c/Ad-close-user.js/issues
// @updateURL    https://cdn.jsdelivr.net/gh/qiu7c/Ad-close-user.js@main/Missav.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/qiu7c/Ad-close-user.js@main/Missav.user.js
// @match        *://*.missav.ai/*
// @match        *://*.missav.ws/*
// @match        *://*.missav.com/*
// @match        *://*.thisav.com/*
// @icon         https://missav.ai/favicon.ico
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    /* ============================================================
     *  配置区 — 广告选择器 & 黑名单域名
     *  发现新广告时在此增删选择器即可
     * ============================================================ */

    const CONFIG = {
        // ---- CSS 选择器：匹配的元素会被 display:none 隐藏（不留空白） ----
        adSelectors: [
            // --- 页面横幅/网格广告容器 ---
            'div[class="space-y-6 mb-6"]',
            'div[class="grid md:grid-cols-2 gap-8"]',
            'div[class="space-y-5 mb-5"]',
            'ul[class="mb-4 list-none text-nord14 grid grid-cols-2 gap-2"]',

            // --- 广告占位容器 (mobile: 300x100 / desktop: 728x90) ---
            'div[class="mx-auto"][style*="300px"][style*="100px"]',
            'div[class="mx-auto"][style*="728px"][style*="90px"]',

            // --- 右下角浮窗广告 ---
            'div[class*="root--"][class*="bottomRight--"]',
            'div[class="fixed right-2 bottom-2"]',
            'img[src*="partwithner.com"]',

            // --- Spot 直播广告挂件 (creative.myavlive.com) ---
            'div[class*="root--26"]',
            'div[class*="rootFullscreen--"]',
            'div[class*="ctaButton--"]',

            // --- 浮窗广告四个角落 ---
            'div[class*="root--"][class*="topLeft--"]',
            'div[class*="root--"][class*="topRight--"]',
            'div[class*="root--"][class*="bottomLeft--"]',

            // --- 通用 iframe 广告 ---
            'iframe[src*="ads"]',
            'iframe[src*="banner"]',
            'iframe[src*="pop"]',
            'iframe[src*="ad."]',
            'iframe[src*=".ad"]',
            'iframe[src*="/ad/"]',
            'iframe[data-ad]',
            'iframe[id*="ads"]',
            'iframe[id*="ad-"]',
            'iframe[class*="ads"]',
            'iframe[class*="ad-"]',
            'iframe[name*="ad"]',

            // --- 右下角图片/iframe 浮动广告 (partwithner.com 等) ---
            'a[href*="bit.ly"] > img',
            'a[href*="tinyurl"] > img',

            // --- 第三方广告 script（移除后阻止其执行） ---
            'script[src*="exoclick.com"]',
            'script[src*="juicyads.com"]',
            'script[src*="popads.net"]',
            'script[src*="adsterra.com"]',
            'script[src*="trafficjunky.com"]',
            'script[src*="adnium.com"]',
            'script[src*="ad-maven.com"]',
            'script[src*="propellerads.com"]',
            'script[src*="cpmstar.com"]',
            'script[src*="tsyndicate.com"]',
            'script[src*="adsco.re"]',
            'script[src*="adscpm.site"]',
            'script[src*="a-ads.com"]',
            'script[src*="ad-delivery.net"]',
            'script[src*="outbrain.com"]',
            'script[src*="taboola.com"]',
            'script[src*="mgid.com"]',
            'script[src*="revcontent.com"]',
            'script[src*="adnxs.com"]',
            'script[src*="pubmatic.com"]',
            'script[src*="rubiconproject.com"]',
            'script[src*="openx.net"]',
            'script[src*="criteo.com"]',
            'script[src*="doubleclick.net"]',
            'script[src*="myavlive.com"]',
            'script[src*="creative.myavlive"]',
            'script[src*="partwithner.com"]',

            // --- 弹窗 / 遮罩层 ---
            'div[class*="popup"]',
            'div[class*="pop-up"]',
            'div[id*="popup"]',
            'div[id*="pop-up"]',
            'div[class*="overlay"][class*="ad"]',
            'div[id*="overlay"][id*="ad"]',
            'div[class*="modal"][class*="ad"]',
            'div[id*="modal"][id*="ad"]',

            // --- 浏览器升级骗局弹窗 ---
            'div[class*="browser-update"]',
        ],

        // ---- 按文本内容匹配的导航栏广告（CSS 做不到，用 JS 扫描） ----
        adTextPatterns: [
            '色色主播',
            '无广告免费漫画',
            '我的收藏',
            '更多好站',
        ],

        // ---- 自定义样式注入 ----
        customStyles: [
            { selector: 'body', styles: 'background-color: #000000 !important;' },
            { selector: 'div[class="my-2 text-sm text-nord4 truncate"]', styles: 'white-space: normal !important;' },
            { selector: 'div[class*="z-max"]', styles: 'z-index: 9000 !important;' },
        ],

        // ---- XHR / fetch / iframe src 黑名单域名 ----
        blockedUrlPatterns: [
            'exoclick.com', 'juicyads.com', 'popads.net', 'adsterra.com',
            'trafficjunky.com', 'adnium.com', 'ad-maven.com', 'propellerads.com',
            'cpmstar.com', 'tsyndicate.com', 'syndication.exosrv.com',
            'ads.exosrv.com', 'cdn.tsyndicate.com', 'adsco.re', 'adscpm.site',
            'a-ads.com', 'ad-delivery.net', 'outbrain.com', 'taboola.com',
            'mgid.com', 'revcontent.com', 'adnxs.com', 'pubmatic.com',
            'rubiconproject.com', 'openx.net', 'criteo.com', 'doubleclick.net',
            'googleadservices.com', 'googlesyndication.com', 'google-analytics.com',
            'googletagmanager.com', 'browser-update.org', 'mopvip.icu',
            'toppages.pw', 'adsafeprotected.com', 'moatads.com',
            'scorecardresearch.com', 'bluekai.com', 'demdex.net',
            'adobe.com/ads', 'facebook.com/tr', 'connect.facebook.net',
            'creative.myavlive.com', 'myavlive.com', 'partwithner.com',
        ],
    };

    /* ============================================================
     *  工具函数
     * ============================================================ */

    /** 保存原生的 window.open（RequestBlocker 会覆盖它） */
    var _nativeOpen = window.open;

    function shouldBlockUrl(url) {
        if (typeof url !== 'string' || !url) return false;
        var lower = url.toLowerCase();
        for (var i = 0; i < CONFIG.blockedUrlPatterns.length; i++) {
            if (lower.indexOf(CONFIG.blockedUrlPatterns[i]) !== -1) return true;
        }
        return false;
    }

    /** 将所有广告选择器拼接成一条 CSS 规则，命中即 display:none */
    function buildAdBlockCSS() {
        return CONFIG.adSelectors.join(',\n') + ' {\n'
            + '    display: none !important;\n'
            + '    visibility: hidden !important;\n'
            + '    width: 0 !important;\n'
            + '    height: 0 !important;\n'
            + '    min-width: 0 !important;\n'
            + '    min-height: 0 !important;\n'
            + '    max-width: 0 !important;\n'
            + '    max-height: 0 !important;\n'
            + '    margin: 0 !important;\n'
            + '    padding: 0 !important;\n'
            + '    border: none !important;\n'
            + '    overflow: hidden !important;\n'
            + '    opacity: 0 !important;\n'
            + '    pointer-events: none !important;\n'
            + '    position: absolute !important;\n'
            + '    z-index: -9999 !important;\n'
            + '}\n';
    }

    /* ============================================================
     *  模块 1：CSS 注入器（核心 — 阻止广告占位）
     * ============================================================ */

    const CSSInjector = {
        _styleEl: null,

        /** 在 <head> 最前面插入广告隐藏 CSS，在页面渲染前生效 */
        inject() {
            var style = document.createElement('style');
            style.id = 'missav-adblock-css';
            style.textContent = buildAdBlockCSS();

            // 同时添加自定义样式
            style.textContent += '\n/* 自定义美化 */\n';
            style.textContent += CONFIG.customStyles.map(function (item) {
                return item.selector + ' { ' + item.styles + ' }';
            }).join('\n');

            // 插入到 <head> 最前面，确保优先级最高
            var head = document.head || document.documentElement;
            if (head.firstChild) {
                head.insertBefore(style, head.firstChild);
            } else {
                head.appendChild(style);
            }
            this._styleEl = style;
        },

        /** 动态更新 CSS（当配置变更时使用） */
        update() {
            if (this._styleEl) {
                this._styleEl.textContent = buildAdBlockCSS();
            }
        },
    };

    /* ============================================================
     *  模块 2：DOM 元素清理器（辅助 — 兜底移除漏网元素）
     * ============================================================ */

    const DomCleaner = {
        /** 移除匹配广告选择器的元素（CSS 已隐藏，此处物理删除） */
        removeAdElements() {
            for (var s = 0; s < CONFIG.adSelectors.length; s++) {
                try {
                    var nodes = document.querySelectorAll(CONFIG.adSelectors[s]);
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].remove();
                    }
                } catch (_) { /* 忽略无效选择器 */ }
            }
        },

        /** 按文本内容删除导航栏广告链接（匹配后移除整个 <a> 或其父级 <li>） */
        removeByText() {
            var patterns = CONFIG.adTextPatterns;
            if (!patterns.length) return;
            // 只扫描导航区域的链接，避免误杀正文
            var links = document.querySelectorAll('header a, nav a, [class*="nav"] a, [class*="header"] a, [class*="menu"] a');
            for (var i = 0; i < links.length; i++) {
                var text = links[i].textContent || '';
                for (var p = 0; p < patterns.length; p++) {
                    if (text.indexOf(patterns[p]) !== -1) {
                        // 优先删除父级 li，否则删自身
                        var parent = links[i].closest('li');
                        if (parent) {
                            try { parent.remove(); } catch (_) {}
                        } else {
                            try { links[i].remove(); } catch (_) {}
                        }
                        break;
                    }
                }
            }
        },

        /** 清理非播放器的 iframe */
        cleanIframes(iframes) {
            iframes = iframes || document.getElementsByTagName('iframe');
            for (var i = iframes.length - 1; i >= 0; i--) {
                var src = iframes[i].src || '';
                if (src && src.indexOf('plyr.io') === -1) {
                    try { iframes[i].remove(); } catch (_) {}
                }
            }
        },
    };

    /* ============================================================
     *  模块 3：DOM 变化观察器（实时防御动态插入的广告）
     * ============================================================ */

    const DomObserver = {
        _observer: null,
        _timer: null,
        _pendingAd: false,
        _pendingIframe: false,

        start() {
            if (this._observer) return;
            var self = this;

            this._observer = new MutationObserver(function (mutations) {
                var hasNodes = false, hasIframe = false;
                for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    if (!added.length) continue;
                    hasNodes = true;
                    for (var j = 0; j < added.length; j++) {
                        if (added[j].nodeName === 'IFRAME') { hasIframe = true; break; }
                    }
                    if (hasIframe) break;
                }
                if (hasNodes) self._pendingAd = true;
                if (hasIframe) self._pendingIframe = true;

                if ((self._pendingAd || self._pendingIframe) && !self._timer) {
                    self._timer = setTimeout(function () {
                        if (self._pendingAd) { DomCleaner.removeAdElements(); DomCleaner.removeByText(); }
                        if (self._pendingIframe) DomCleaner.cleanIframes();
                        self._pendingAd = false;
                        self._pendingIframe = false;
                        self._timer = null;
                    }, 50);
                }
            });

            this._observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        },

        stop() {
            if (this._observer) { this._observer.disconnect(); this._observer = null; }
            if (this._timer) { clearTimeout(this._timer); this._timer = null; }
        },
    };

    /* ============================================================
     *  模块 4：网络请求拦截器
     * ============================================================ */

    const RequestBlocker = {
        _blockXHR() {
            var orig = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (_method, url) {
                if (shouldBlockUrl(url)) {
                    this.send = function () {};
                    this.addEventListener = function () {};
                    this.onload = null;
                    this.onerror = null;
                    return;
                }
                return orig.apply(this, arguments);
            };
        },

        _blockFetch() {
            var orig = window.fetch;
            window.fetch = function (url, _opts) {
                var target = typeof url === 'string' ? url : (url instanceof Request ? url.url : '');
                if (shouldBlockUrl(target)) {
                    return Promise.resolve(new Response('', {
                        status: 200,
                        statusText: 'OK',
                        headers: { 'Content-Type': 'text/plain' },
                    }));
                }
                return orig.apply(this, arguments);
            };
        },

        _blockIframeSrc() {
            var origCE = document.createElement;
            document.createElement = function (tagName) {
                var el = origCE.call(document, tagName);
                if (tagName.toLowerCase() === 'iframe') {
                    var _src = el.src;
                    Object.defineProperty(el, 'src', {
                        get: function () { return _src; },
                        set: function (val) {
                            if (!shouldBlockUrl(val)) _src = val;
                        },
                        configurable: true,
                    });
                    var origSA = el.setAttribute;
                    el.setAttribute = function (name, val) {
                        if (name === 'src' && shouldBlockUrl(val)) return;
                        return origSA.call(this, name, val);
                    };
                }
                return el;
            };
        },

        _blockPopups() {
            window.open = function () { return null; };
            if (typeof unsafeWindow !== 'undefined') {
                try { unsafeWindow.open = function () { return null; }; } catch (_) {}
            }
        },

        start() {
            this._blockIframeSrc();
            this._blockXHR();
            this._blockFetch();
            this._blockPopups();
        },
    };

    /* ============================================================
     *  模块 5：反广告拦截检测
     * ============================================================ */

    const AntiDetection = {
        apply() {
            var fakes = {
                AdBlock: false, adblock: false, canRunAds: true,
                adblockActive: false, adBlockActive: false, adBlockDetected: false,
                adsbygoogle: { loaded: true, push: function () {} },
                __adblocker: false, google_ad_status: 1,
            };
            for (var k in fakes) {
                if (fakes.hasOwnProperty(k)) {
                    try { window[k] = fakes[k]; } catch (_) {}
                }
            }
            if (typeof unsafeWindow !== 'undefined') {
                for (var k2 in fakes) {
                    if (fakes.hasOwnProperty(k2)) {
                        try { unsafeWindow[k2] = fakes[k2]; } catch (_) {}
                    }
                }
            }
        },
    };

    /* ============================================================
     *  模块 6：定时清理
     * ============================================================ */

    const PeriodicCleaner = {
        _id: null,
        start() {
            this._id = setInterval(function () {
                DomCleaner.removeAdElements();
                DomCleaner.removeByText();
            }, 2000);
        },
        stop() {
            if (this._id) { clearInterval(this._id); this._id = null; }
        },
    };

    /* ============================================================
     *  模块 7：收藏夹功能 (GM_setValue/GM_getValue)
     * ============================================================ */

    const Favorites = {
        STORAGE_PREFIX: 'fav_',

        _key(url) {
            return this.STORAGE_PREFIX + url;
        },

        /** 获取全部收藏 */
        getAll() {
            var keys = GM_listValues();
            var result = [];
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.STORAGE_PREFIX) === 0) {
                    try {
                        result.push(JSON.parse(GM_getValue(keys[i], '{}')));
                    } catch (_) {}
                }
            }
            return result;
        },

        /** 是否已收藏 */
        exists(url) {
            return GM_getValue(this._key(url), null) !== null;
        },

        /** 添加收藏 */
        add(item) {
            GM_setValue(this._key(item.url), JSON.stringify(item));
        },

        /** 删除收藏 */
        remove(url) {
            GM_deleteValue(this._key(url));
        },

        /** 切换收藏状态，返回新状态 (true=已收藏) */
        toggle(item) {
            if (this.exists(item.url)) {
                this.remove(item.url);
                return false;
            } else {
                this.add(item);
                return true;
            }
        },

        /** 提取当前页视频信息 */
        getVideoInfo() {
            var url = window.location.href;
            var title = document.title.replace(/ - MissAV| - Missav| - .*$/i, '').trim()
                || document.title.trim()
                || url.split('/').pop()
                || '视频';
            var ogImg = document.querySelector('meta[property="og:image"]');
            var thumb = ogImg ? ogImg.content : '';
            return { url: url, title: title, thumb: thumb };
        },

        /** SVG 图标 */
        _svgs: {
            bookmark: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
            folderOpen: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
            trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
            heart: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
            heartEmpty: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        },

        /** 清除 site localStorage 中的历史记录（推送用） */
        clearWatchHistory() {
            var keysToCheck = [
                'watchHistory', 'history', 'recently', 'recent', 'viewed',
                'watch', 'playHistory', 'record', 'track', 'behavior',
                'recommend', 'recommendation',
            ];
            var cleared = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (!key) continue;
                var lower = key.toLowerCase();
                for (var j = 0; j < keysToCheck.length; j++) {
                    if (lower.indexOf(keysToCheck[j].toLowerCase()) !== -1) {
                        try {
                            localStorage.removeItem(key);
                            cleared.push(key);
                        } catch (_) {}
                        break;
                    }
                }
            }
            // 也尝试清 indexedDB（部分站存那）
            try {
                var req = indexedDB.deleteDatabase('missav');
            } catch (_) {}
            try {
                var req2 = indexedDB.deleteDatabase('MissAV');
            } catch (_) {}
            return cleared;
        },

        /** 创建浮动按钮组（水平排列，文字+SVG图标） */
        injectButtons() {
            var self = this;

            var makeUI = function () {
                var c = document.createElement('div');
                c.id = 'missav-fav-group';

                var btnCommon = 'display:inline-flex;align-items:center;gap:4px;'
                    + 'cursor:pointer;text-decoration:none;user-select:none;'
                    + 'border:none;outline:none;font-family:inherit;'
                    + 'border-radius:6px;padding:6px 10px;font-size:12px;'
                    + 'transition:background .2s,opacity .2s;';

                // 收藏按钮
                var info = self.getVideoInfo();
                var fb = document.createElement('a');
                fb.id = 'missav-fav-btn';
                fb.innerHTML = (info && self.exists(info.url))
                    ? self._svgs.heart + ' 已收藏'
                    : self._svgs.heartEmpty + ' 收藏';
                fb.title = '收藏/取消收藏';
                fb.style.cssText = btnCommon + 'background:#e9405e;color:#fff;';
                fb.addEventListener('mouseenter', function () { fb.style.opacity = '0.85'; });
                fb.addEventListener('mouseleave', function () { fb.style.opacity = '1'; });
                fb.addEventListener('click', function (e) {
                    e.preventDefault();
                    var info = self.getVideoInfo();
                    if (!info) return;
                    fb.innerHTML = self.toggle(info)
                        ? self._svgs.heart + ' 已收藏'
                        : self._svgs.heartEmpty + ' 收藏';
                });
                c.appendChild(fb);

                // 收藏夹按钮
                var ob = document.createElement('a');
                ob.id = 'missav-fav-open';
                ob.innerHTML = self._svgs.folderOpen + ' 收藏夹';
                ob.title = '打开收藏夹';
                ob.style.cssText = btnCommon + 'background:#2a2a2a;color:#ccc;';
                ob.addEventListener('mouseenter', function () { ob.style.background = '#333'; });
                ob.addEventListener('mouseleave', function () { ob.style.background = '#2a2a2a'; });
                ob.addEventListener('click', function (e) {
                    e.preventDefault();
                    self.openPage();
                });
                c.appendChild(ob);

                // 清除历史按钮
                var hb = document.createElement('a');
                hb.id = 'missav-fav-clear';
                hb.innerHTML = self._svgs.trash + ' 清除记忆';
                hb.title = '清除浏览历史，重置首页推荐';
                hb.style.cssText = btnCommon + 'background:#2a2a2a;color:#ccc;';
                hb.addEventListener('mouseenter', function () { hb.style.background = '#333'; });
                hb.addEventListener('mouseleave', function () { hb.style.background = '#2a2a2a'; });
                hb.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!confirm('确定清除浏览历史？首页推荐将重置。')) return;
                    var cleared = self.clearWatchHistory();
                    hb.innerHTML = self._svgs.trash + ' 已清除';
                    hb.style.background = '#1a3a1a';
                    hb.style.color = '#4caf50';
                    setTimeout(function () {
                        hb.innerHTML = self._svgs.trash + ' 清除记忆';
                        hb.style.background = '#2a2a2a';
                        hb.style.color = '#ccc';
                    }, 2000);
                });
                c.appendChild(hb);

                return c;
            };

            var tryInject = function () {
                if (!document.body) return false;
                if (document.getElementById('missav-fav-group')) return true;
                var c = makeUI();
                if (!c) return false;
                c.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:99999;display:flex;flex-wrap:wrap;gap:6px;';
                document.body.appendChild(c);
                return true;
            };

            if (tryInject()) return;
            var timer = setInterval(function () { if (tryInject()) clearInterval(timer); }, 300);
            setTimeout(function () { clearInterval(timer); }, 15000);
        },

        /** 构建收藏夹独立页面（内嵌数据），新标签页打开 */
        openPage() {
            var items = this.getAll();

            var thumbHtml = function (item) {
                return item.thumb
                    ? '<img class="thumb" src="' + item.thumb + '" alt="" loading="lazy" />'
                    : '<div class="no-thumb">无封面</div>';
            };

            var cardsHtml = items.length
                ? items.map(function (item) {
                    var safeUrl = item.url.replace(/"/g, '&quot;');
                    var safeTitle = (item.title || '').replace(/"/g, '&quot;');
                    return '<div class="fav-card" data-url="' + safeUrl + '">'
                        + '<button class="del-btn" data-url="' + safeUrl + '">&times;</button>'
                        + '<a href="' + item.url + '" target="_blank">'
                        + thumbHtml(item)
                        + '<div class="info"><div class="title">' + safeTitle + '</div></div>'
                        + '</a></div>';
                }).join('')
                : '<div class="empty-state"><div class="icon">📂</div><p>还没有收藏任何视频</p></div>';

            var html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>我的收藏 - MissAV</title>'
                + '<style>'
                + '*{margin:0;padding:0;box-sizing:border-box}'
                + 'body{background:#0a0a0a;color:#eee;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;min-height:100vh}'
                + 'header{background:#111;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #222;position:sticky;top:0;z-index:100}'
                + 'header h1{font-size:20px;font-weight:600;color:#e9405e}'
                + 'header .count{color:#888;font-size:14px;font-weight:400;margin-left:8px}'
                + 'header .actions{display:flex;gap:10px;align-items:center}'
                + '.btn-clear{background:#2a2a2a;color:#ccc;border:1px solid #333;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .2s}'
                + '.btn-clear:hover{background:#3a1a1a;border-color:#e9405e;color:#e9405e}'
                + '.btn-back{background:#e9405e;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;text-decoration:none;transition:opacity .2s}'
                + '.btn-back:hover{opacity:.85}'
                + 'main{max-width:1200px;margin:0 auto;padding:24px}'
                + '#fav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}'
                + '.fav-card{background:#161616;border-radius:10px;overflow:hidden;transition:transform .2s,box-shadow .2s;position:relative}'
                + '.fav-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.4)}'
                + '.fav-card .thumb{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#222}'
                + '.fav-card .no-thumb{width:100%;aspect-ratio:16/9;background:#222;display:flex;align-items:center;justify-content:center;color:#555;font-size:14px}'
                + '.fav-card .info{padding:10px 12px 12px}'
                + '.fav-card .title{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ddd}'
                + '.fav-card .del-btn{position:absolute;top:8px;right:8px;width:28px;height:28px;background:rgba(0,0,0,.7);border:none;border-radius:50%;color:#fff;font-size:16px;cursor:pointer;display:none;align-items:center;justify-content:center;line-height:1;z-index:2}'
                + '.fav-card:hover .del-btn{display:flex}'
                + '.fav-card .del-btn:hover{background:#e9405e}'
                + '.empty-state{grid-column:1/-1;text-align:center;padding:100px 20px;color:#555}'
                + '.empty-state .icon{font-size:48px;margin-bottom:16px}'
                + '.empty-state p{font-size:16px}'
                + 'a{color:inherit;text-decoration:none}'
                + '</style></head><body>'
                + '<header><div><h1>我的收藏 <span class="count" id="count">' + items.length + '</span></h1></div>'
                + '<div class="actions"><button class="btn-clear" id="btn-clear-history">清除记忆</button>'
                + '<button class="btn-clear" id="btn-clear">清空全部</button>'
                + '<a class="btn-back" href="https://missav.ai" target="_blank">去 MissAV</a></div></header>'
                + '<main><div id="fav-grid">' + cardsHtml + '</div></main>'
                + '<script>'
                + 'document.getElementById("fav-grid").addEventListener("click",function(e){'
                + 'var btn=e.target.closest(".del-btn");if(!btn)return;'
                + 'var url=btn.getAttribute("data-url");'
                + 'if(!confirm("确定删除这个收藏?"))return;'
                + 'btn.closest(".fav-card").remove();'
                + 'var c=document.getElementById("count");if(c)c.textContent=document.querySelectorAll(".fav-card").length;'
                + 'window.opener.postMessage({type:"missav-fav-delete",url:url},"*");'
                + '});'
                + 'document.getElementById("btn-clear").addEventListener("click",function(){'
                + 'if(!confirm("确定清空全部收藏?"))return;'
                + 'document.getElementById("fav-grid").innerHTML="<div class=\\"empty-state\\"><div class=\\"icon\\">📂</div><p>还没有收藏任何视频</p></div>";'
                + 'document.getElementById("count").textContent="0";'
                + 'window.opener.postMessage({type:"missav-fav-clear"},"*");'
                + '});'
                + 'document.getElementById("btn-clear-history").addEventListener("click",function(){'
                + 'if(!confirm("确定清除浏览历史?"))return;'
                + 'window.opener.postMessage({type:"missav-clear-history"},"*");'
                + '});'
                + '<\/script></body></html>';

            var blob = new Blob([html], { type: 'text/html' });
            var url = URL.createObjectURL(blob);
            var win = _nativeOpen(url, '_blank');
            if (win) {
                var msgHandler = function (e) {
                    if (e.data && e.data.type === 'missav-fav-delete') {
                        Favorites.remove(e.data.url);
                    } else if (e.data && e.data.type === 'missav-fav-clear') {
                        var all = Favorites.getAll();
                        for (var i = 0; i < all.length; i++) {
                            Favorites.remove(all[i].url);
                        }
                    } else if (e.data && e.data.type === 'missav-clear-history') {
                        Favorites.clearWatchHistory();
                    }
                };
                window.addEventListener('message', msgHandler);
                var checkClosed = setInterval(function () {
                    if (win.closed) {
                        clearInterval(checkClosed);
                        window.removeEventListener('message', msgHandler);
                    }
                }, 2000);
            }
        },

        init() {
            // 两个浮动按钮：❤️收藏 + ⭐打开收藏夹
            this.injectButtons();
            // 用 MutationObserver 守护：按钮被 SPA 清掉时自动恢复
            var self = this;
            var guard = new MutationObserver(function () {
                if (document.body && !document.getElementById('missav-fav-group')) {
                    self.injectButtons();
                }
            });
            if (document.body) {
                guard.observe(document.body, { childList: true, subtree: true });
            } else {
                var waitBody = setInterval(function () {
                    if (document.body) {
                        guard.observe(document.body, { childList: true, subtree: true });
                        clearInterval(waitBody);
                    }
                }, 200);
            }
        },
    };

    /* ============================================================
     *  主入口
     * ============================================================ */

    function main() {
        // ① 第一时间注入隐藏 CSS —— 广告元素从渲染起就不占空间
        CSSInjector.inject();

        // ② 尽早拦截网络请求
        RequestBlocker.start();

        // ③ 反广告拦截检测
        AntiDetection.apply();

        // ④ DOM 就绪后的兜底清理
        function onReady() {
            DomCleaner.removeAdElements();
            DomCleaner.removeByText();
            DomCleaner.cleanIframes();
            DomObserver.start();
            PeriodicCleaner.start();
            Favorites.init();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    main();
})();
