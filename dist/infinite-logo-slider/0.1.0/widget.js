/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 64ba9c7d52a0. Registers window.ShazammeWidget["<name>"].
 */

var __shazWidgetExport = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dist/.gen/infinite-logo-slider.index.js
  var infinite_logo_slider_index_exports = {};
  __export(infinite_logo_slider_index_exports, {
    default: () => legacyController
  });

  // core/script-loader.ts
  var CANONICAL_SDK_URL = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function loadSdk() {
    if (window.__shazSDKPromise) return window.__shazSDKPromise;
    const p = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
    window.__shazSDKPromise = p;
    return p;
  }
  function loadOther(src) {
    const cache = window.__shazScriptCache = window.__shazScriptCache || {};
    const existing = cache[src];
    if (existing) return existing;
    const p = injectScript(src).catch((err) => {
      delete cache[src];
      throw err;
    });
    cache[src] = p;
    return p;
  }
  function installScriptLoader() {
    if (typeof window === "undefined" || window.__shazLoadScript) return;
    window.__shazLoadScript = (src) => SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
  }
  function ensureScriptLoader() {
    installScriptLoader();
  }

  // dist/.gen/infinite-logo-slider.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    cssLibrary("slickCSSTheme", "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.css");
    cssLibrary("slickCSS", "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.css");
    let $widgetElement = $(element).find(".main-review-slider-container");
    let slidestoshow = parseInt(data.config.slidestoshow ? data.config.slidestoshow : 5);
    let speed = data.config.speed;
    var MIN_LOGO_SLOT = 110;
    var MIN_PER_VIEW = 2;
    var FADE_EDGE = 20;
    var LOGO_VIEW_CLASS = "shm-logo-slider";
    function perView() {
      var width = $(element).width();
      if (!width) return Math.max(MIN_PER_VIEW, slidestoshow);
      return Math.max(MIN_PER_VIEW, Math.min(slidestoshow, Math.floor(width / MIN_LOGO_SLOT)));
    }
    function injectStyle() {
      if (document.getElementById("shm-logo-slider-style")) return;
      var style = document.createElement("style");
      style.id = "shm-logo-slider-style";
      var mask = "linear-gradient(90deg, transparent 0, #000 " + FADE_EDGE + "px, #000 calc(100% - " + FADE_EDGE + "px), transparent 100%)";
      style.textContent = "." + LOGO_VIEW_CLASS + " .slick-list{-webkit-mask-image:" + mask + ";mask-image:" + mask + ";}." + LOGO_VIEW_CLASS + " .slick-slide{height:auto !important;}";
      document.head.appendChild(style);
    }
    function growWrapper() {
      var wrapper = element.closest ? element.closest(".widget-wrapper") : null;
      if (!wrapper) return;
      wrapper.style.setProperty("height", "auto", "important");
      wrapper.style.setProperty("min-height", "0px", "important");
    }
    function refit() {
      var strip = $(element).find(".main-review-slider-container");
      if (!strip.hasClass("slick-initialized")) return;
      var columns = perView();
      if (strip.slick("slickGetOption", "slidesToShow") !== columns) {
        strip.slick("slickSetOption", "slidesToShow", columns, true);
      }
      growWrapper();
    }
    injectStyle();
    $(element).addClass(LOGO_VIEW_CLASS);
    dmAPI.loadScript("https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js", function() {
      $(element).find(".slider-loader").hide();
      $widgetElement.fadeIn();
      $(element).find(".main-review-slider-container").slick({
        slidesToShow: perView(),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed,
        pauseOnHover: false,
        cssEase: "linear"
      });
      growWrapper();
      if (typeof ResizeObserver !== "undefined") {
        if (element.__shmLogoSliderObserver) element.__shmLogoSliderObserver.disconnect();
        element.__shmLogoSliderObserver = new ResizeObserver(function() {
          refit();
        });
        element.__shmLogoSliderObserver.observe(element);
      }
    });
    function cssLibrary(id, href) {
      if (!document.getElementById(id)) {
        var head = document.getElementsByTagName("head")[0];
        var link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;
        link.crossOrigin = "anonymous";
        head.appendChild(link);
      }
    }
  }
  return __toCommonJS(infinite_logo_slider_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["infinite-logo-slider"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
