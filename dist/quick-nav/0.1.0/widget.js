/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 2e49140960ab. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/quick-nav.index.js
  var quick_nav_index_exports = {};
  __export(quick_nav_index_exports, {
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

  // dist/.gen/quick-nav.index.js
  function legacyController(ctx) {
    var _a, _b;
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const Path = {
      home: data.config.pathHome || "home",
      register: ((_a = data.config.registerURL) == null ? void 0 : _a.href) || "/register"
    };
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.loadScript = (src) => window.__shazLoadScript(src);
      ;
    }
    const ux = new UX();
    let main = (w) => {
      shazamme.user().then((u) => {
        const manage = (u2) => {
          var _a2, _b2, _c;
          if (u2 == null ? void 0 : u2.isVerified) {
            let ttl = /* @__PURE__ */ new Date();
            ttl.setMinutes(ttl.getMinutes() + 2);
            let user = {
              photo: `data:image/jpeg;base64,${(_a2 = u2.candidate) == null ? void 0 : _a2.photo}`,
              greeting: ((_b2 = u2 == null ? void 0 : u2.candidate) == null ? void 0 : _b2.firstName) || (u2 == null ? void 0 : u2.firstName) || "Welcome",
              is: u2.is,
              ttl
            };
            shazamme.store(data.elementId, btoa(unescape(encodeURIComponent(JSON.stringify(user)))));
            ux.el.find(".uqlItem,.uqlDivider").addClass("uqlHideLink");
            ux.el.find(".uqlControlLinks").removeClass("uqlHideLink");
            ux.el.find(".uqprofilePic").attr("src", user.photo);
            ux.el.find(".uqlCandidateInfo").empty().append(document.createTextNode(user.greeting), ' <b class="boardy-caret"></b>');
            ux.el.find("[data-user-role]").hide();
            (_c = user.is) == null ? void 0 : _c.forEach((r) => {
              ux.el.find(`[data-user-role]`).each((_, i) => {
                let el = $(i);
                if (r.startsWith(el.attr("data-user-role"))) {
                  el.show();
                }
              });
            });
          } else {
            shazamme.store(data.elementId, null);
            ux.el.find(".uqlItem").removeClass("uqlHideLink");
            ux.el.find(".uqlControlLinks").addClass("uqlHideLink");
            ux.el.find(".uqlLoggedInItemsContainer").addClass("uqlHideLink");
          }
        };
        w.sub("site-auth", (u2) => {
          manage(u2);
        });
        manage(u);
      });
      ux.el.find(".uqlProfileContainer").on("click", function() {
        $(".uqlLoggedInItemsContainer").toggleClass("uqlHideLink");
      });
      ux.el.find(".uqlSignOut").click(function() {
        shazamme.firebase().signOut();
      });
      ux.el.find(".loggedInContainer").on("mouseenter", function() {
        $(this).find(".uqlLoginBtn").addClass("uqlLoginBtnActive");
      }).on("mouseleave", function() {
        $(this).find(".uqlLoginBtn").removeClass("uqlLoginBtnActive");
      });
      ux.el.find(".registerContainer").on("mouseenter", function() {
        $(this).find(".uqlRegisterBtn").addClass("uqlRegisterBtnActive");
      }).on("mouseleave", function() {
        $(this).find(".uqlRegisterBtn").removeClass("uqlRegisterBtnActive");
      });
      ux.el.find("[data-href]").each((_, i) => {
        let a = $(i);
        let link = data.config[a.attr("data-href")];
        if (link) {
          a.attr({
            href: link.href,
            label: link.label,
            raw_url: link.raw_url,
            type: link.type,
            page: link.page
          });
        }
      });
      if (shazamme.bag("login-dialog-ready")) {
        ux.el.find(".uqlLoginBtn").on("click", function() {
          w.pub("login-dialog-show", { title: data.config.loginDialogTitle });
          return false;
        });
      }
      w.sub("login-dialog-ready", () => {
        ux.el.find(".uqlLoginBtn").on("click", function() {
          w.pub("login-dialog-show", { title: data.config.loginDialogTitle });
          return false;
        });
      });
    };
    try {
      let user = JSON.parse(decodeURIComponent(escape(atob(localStorage[data.elementId]))));
      if (new Date(user.ttl) > /* @__PURE__ */ new Date()) {
        ux.el.find(".uqlItem,.uqlDivider").addClass("uqlHideLink");
        ux.el.find(".uqlControlLinks").removeClass("uqlHideLink");
        ux.el.find(".uqprofilePic").attr("src", user.photo);
        ux.el.find(".uqlCandidateInfo").empty().append(document.createTextNode(user.greeting), ' <b class="boardy-caret"></b>');
        ux.el.find("[data-user-role]").hide();
        (_b = user.is) == null ? void 0 : _b.forEach((r) => {
          ux.el.find(`[data-user-role]`).each((_, i) => {
            let el = $(i);
            if (r.startsWith(el.attr("data-user-role"))) {
              el.show();
            }
          });
        });
      }
    } catch (e) {
    }
    ux.el.find(".uqlMainContainer").show();
    ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.2.min.js").then(() => shazamme.ready(data.siteId, data.page)).then(() => {
      main(shazamme.register("quick-nav", data));
    });
  }
  return __toCommonJS(quick_nav_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["quick-nav"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
