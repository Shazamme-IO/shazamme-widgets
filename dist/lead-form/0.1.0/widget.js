/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build a5c19100af9a. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/lead-form.index.js
  var lead_form_index_exports = {};
  __export(lead_form_index_exports, {
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

  // dist/.gen/lead-form.index.js
  function legacyController(ctx) {
    var _a, _b, _c;
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const Path = {
      jobResults: ((_a = data.config.searchResultPage) == null ? void 0 : _a.href) || "/job-results",
      thankYou: ((_b = data.config.thankyouPage) == null ? void 0 : _b.href) || "/thank-you",
      dashboard: ((_c = data.config.dashboardPage) == null ? void 0 : _c.href) || "/dashboard"
    };
    const Collection = {
      questions: {
        name: data.config.collectionQuestions || "Screening Questions",
        action: "Get Screening Questions",
        endpoint: data.config.screeningQuestionsCollection,
        useCache: true,
        debug: data.inEditor && data.config.debugMode
      }
    };
    const FREE_EMAIL_DOMAINS = /* @__PURE__ */ new Set([
      // Microsoft (hotmail / outlook / live / msn) + country variants
      "hotmail.com",
      "hotmail.co.uk",
      "hotmail.com.au",
      "hotmail.co.nz",
      "hotmail.ca",
      "hotmail.fr",
      "hotmail.de",
      "hotmail.it",
      "hotmail.es",
      "outlook.com",
      "outlook.com.au",
      "outlook.co.uk",
      "outlook.co.nz",
      "outlook.fr",
      "outlook.de",
      "outlook.it",
      "outlook.es",
      "live.com",
      "live.com.au",
      "live.co.uk",
      "live.co.nz",
      "live.ca",
      "live.fr",
      "live.de",
      "live.it",
      "live.nl",
      "msn.com",
      "msn.com.au",
      "windowslive.com",
      "passport.com",
      // Google
      "gmail.com",
      "googlemail.com",
      // Yahoo (incl. Australian Yahoo!7 legacy y7mail)
      "yahoo.com",
      "yahoo.com.au",
      "yahoo.co.uk",
      "yahoo.co.nz",
      "yahoo.ca",
      "yahoo.co.in",
      "yahoo.fr",
      "yahoo.de",
      "yahoo.it",
      "yahoo.es",
      "yahoo.com.br",
      "ymail.com",
      "rocketmail.com",
      "y7mail.com",
      // Apple
      "icloud.com",
      "me.com",
      "mac.com"
    ]);
    const emailDomain = (e) => String(e || "").trim().toLowerCase().split("@").pop();
    const isFreeEmail = (e) => FREE_EMAIL_DOMAINS.has(emailDomain(e));
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.buildHref = (path, query) => {
        const addQuery = (href, q) => {
          let hash = href.indexOf("#");
          let base = hash === -1 ? href : href.slice(0, hash);
          let frag = hash === -1 ? "" : href.slice(hash);
          return `${base}${base.includes("?") ? "&" : "?"}${q}${frag}`;
        };
        path = (path || "").replace(/^(https?)\/\//i, "$1://");
        if (/^https?:\/\//i.test(path)) {
          return query ? addQuery(path, query) : path;
        }
        path = path ? ("/" + path).replace(/^\/+/, "/") : path;
        return data.inEditor ? addQuery(`/site/${data.siteId}${path}`, `preview=true&insitepreview=true&dm_device=desktop${query ? "&" + query : ""}`) : query ? addQuery(`https://${window.location.hostname}${path}`, query) : `https://${window.location.hostname}${path}`;
      };
      this.loadScript = (src) => window.__shazLoadScript(src);
    }
    const ux = new UX();
    const main = (w) => {
      const getScreeningTemplateId = () => String(data.config.screeningTemplateIdManual || "").trim() || data.config.screeningTemplateId;
      let site = shazamme.bag("site-config");
      const showScreeningQuestions = () => {
        let el = ux.el.find("[data-rel=data-screening-questions]");
        const screeningTemplateId = getScreeningTemplateId();
        if (el.length > 0 && (screeningTemplateId == null ? void 0 : screeningTemplateId.length) > 1) {
          let js = "https://sdk.shazamme.io/js/plugin/screening-question/1.0.10/plugin.min.js";
          return shazamme.script(js).then(
            () => shazamme.plugin.screeningQuestions(w, {
              config: {
                ...data.config,
                screeningTemplateId,
                pagingButtonAlignment: data.config.screeningPagingButtonAlignment,
                readMoreAlign: data.config.screeningReadMoreAlign,
                showMoreShadowColor: data.config.screeningShowMoreShadowColor,
                warningScreeningQuestions: data.config.warningScreeningQuestions,
                warningScreeningQuestionTitle: data.config.warningScreeningQuestionTitle
              },
              collection: Collection,
              editing: data.inEditor,
              container: el,
              tid: screeningTemplateId
            })
          ).then((sq) => {
            w.bag("plugin-sq", sq);
            w.sub(sq.message.submit, () => {
              onSubmit();
            });
            return Promise.resolve();
          });
        }
        return Promise.resolve();
      };
      const submitBtn = ux.el.find("[data-rel=action-apply]");
      const submitBtnTextEl = submitBtn.find("> .text");
      const submitBtnOriginalText = submitBtnTextEl.text();
      const showButtonLoader = () => {
        if (data.config.showLoader === false) return;
        submitBtn.addClass("is-loading").attr("disabled", "disabled");
        submitBtnTextEl.text(data.config.ApplyButtonLoadingText || "Submitting...");
      };
      const hideButtonLoader = () => {
        submitBtn.removeClass("is-loading").removeAttr("disabled");
        submitBtnTextEl.text(submitBtnOriginalText);
      };
      let onSubmit = () => {
        let loading = null;
        showButtonLoader();
        isValid(w).then(() => {
          var _a2, _b2;
          const screeningTemplateId = getScreeningTemplateId();
          let lead = {
            screeningTemplateID: (screeningTemplateId == null ? void 0 : screeningTemplateId.length) > 1 ? screeningTemplateId : void 0,
            ReferralSource: ux.uri.searchParams.get("utm_source") || shazamme.session("referralSource"),
            ReferralMedium: ux.uri.searchParams.get("utm_medium") || shazamme.session("referralMedium"),
            ReferralTerm: ux.uri.searchParams.get("utm_term") || shazamme.session("referralTerm"),
            ReferralCampaign: ux.uri.searchParams.get("utm_campaign") || shazamme.session("referralCampaign"),
            ReferralContent: ux.uri.searchParams.get("utm_content") || shazamme.session("referralContent")
          };
          ux.el.find("[data-rel=collection-fields] [data-field]:visible").each((_, f) => {
            var _a3;
            let field = $(f);
            if (((_a3 = field.attr("data-field")) == null ? void 0 : _a3.length) > 0 && field.attr("data-field") !== "file" && !field.attr("data-field").startsWith("--")) {
              lead[field.attr("data-field")] = field.is(":checkbox") && field.is(":checked") || field.val() || void 0;
            }
          });
          if (data.inEditor) {
            shazamme.log("submit lead", {
              action: "Submit Lead",
              dudaSiteID: data.siteId,
              lead,
              screeningAnswers: (_a2 = w.bag("plugin-sq")) == null ? void 0 : _a2.answers()
            });
            hideButtonLoader();
            return Promise.resolve();
          }
          return shazamme.submit({
            action: "Submit Lead",
            dudaSiteID: data.siteId,
            lead,
            screeningAnswers: (_b2 = w.bag("plugin-sq")) == null ? void 0 : _b2.answers()
          }).then(() => {
            loading == null ? void 0 : loading.remove();
            window.location = ux.buildHref(Path.thankYou);
          }).catch(() => {
            hideButtonLoader();
          });
        }).catch(() => {
          loading == null ? void 0 : loading.remove();
          hideButtonLoader();
        });
      };
      showScreeningQuestions().then();
      ux.el.find("[data-rel=action-apply]").off("click").on("click", function() {
        onSubmit();
      });
      w.sub("site-config-ready", () => {
        var _a2, _b2, _c2;
        site = shazamme.bag("site-config");
        Path.jobResults = ((_a2 = site == null ? void 0 : site.configuration) == null ? void 0 : _a2.pathJobResults) || Path.jobResults;
        Path.dashboard = ((_b2 = site == null ? void 0 : site.configuration) == null ? void 0 : _b2.pathDashboard) || Path.dashboard;
        Path.thankYou = Path.thankYou || ((_c2 = site == null ? void 0 : site.configuration) == null ? void 0 : _c2.pathThankYou) || Path.thankYou;
      });
      ux.el.find(".main-content").show();
    };
    let isValid = (w) => new Promise((resolve, reject) => {
      const fb = shazamme.firebase();
      const site = shazamme.bag("site-config");
      let m = [];
      const showAlert = (o) => {
        const dlg = site == null ? void 0 : site.alertDialog(o);
        if (!dlg) return null;
        dlg.appendTo(ux.el);
        const box = dlg.find(".dialog-content")[0];
        if (box) {
          box.style.setProperty("border-radius", "12px", "important");
          box.style.setProperty("overflow", "hidden", "important");
        }
        dlg.find(".button-main").each((_, b) => b.style.setProperty("border-radius", "5px", "important"));
        return dlg;
      };
      if (w.bag("plugin-sq")) {
        const sq = w.bag("plugin-sq");
        if (!sq.knockout() || !sq.validate()) {
          reject();
          return;
        }
      }
      if (data.config.blockFreeEmail) {
        const usedFreeEmail = ux.el.find("[type=email][data-field]:visible").toArray().some((f) => {
          const v = $(f).val();
          return v && v.trim().length > 0 && isFreeEmail(v);
        });
        if (usedFreeEmail) {
          const msg = data.config.blockFreeEmailMessage || "Please enter your company or organisational email address.";
          showAlert({
            title: data.config.blockFreeEmailTitle || "Business email required",
            message: msg.replace(/\n/g, "<br/>")
          }) || alert(msg);
          reject();
          return;
        }
      }
      Promise.all([
        ...ux.el.find("[type=email][data-field]:visible").map((_, f) => {
          let field = $(f);
          let email = field.val();
          if ((email == null ? void 0 : email.length) > 0) {
            try {
              return new Promise((r) => {
                fb.validateEmail(email).then(() => r()).catch(() => {
                  m.push(field.parents(".field").find("label").first().text() || field.attr("placeholder") || field.attr("data-field"));
                  r();
                });
              });
            } catch (ex) {
              w.warn("Email validation failed: ", ex);
              return Promise.resolve();
            }
          } else {
            return Promise.resolve();
          }
        }).toArray(),
        ...ux.el.find("[data-rel=collection-fields] [data-field][required]:visible").map((_, f) => {
          var _a2, _b2, _c2;
          let field = $(f);
          if (field.is("[type=file]") && !(((_a2 = fileUpload[field.attr("data-file-id")]) == null ? void 0 : _a2.length) > 0) || field.is(":checkbox") && !field.is(":checked") || field.is("input") && !field.is(":checkbox") && !(((_c2 = (_b2 = field.val()) == null ? void 0 : _b2.trim()) == null ? void 0 : _c2.length) > 0)) {
            m.push(field.parents(".field").find("label.required").text() || field.attr("placeholder") || field.attr("title") || field.attr("data-field"));
          } else if (field.is("[type=tel][data-validate]") && field.val().trim() && typeof libphonenumber === "object") {
            try {
              const tel = libphonenumber.parsePhoneNumber(field.val(), field.attr("data-validate") || "AU");
              if (!tel.country || !tel.isValid()) {
                m.push(field.parents(".field").find("label.required").text() || field.attr("placeholder") || field.attr("data-field"));
              } else {
                field.val(tel.formatInternational());
              }
            } catch (e) {
              m.push(field.parents(".field").find("label.required").text() || field.attr("placeholder") || field.attr("data-field"));
            }
          }
          return Promise.resolve();
        }).toArray()
      ]).then((r) => {
        if (m.length > 0) {
          let warning = `${data.config.warningRequired || "Please complete the following fields:"}

${m.join("\n")}`;
          showAlert({
            title: data.config.warningRequiredTitle || "Please Complete the Following",
            message: warning.replace(/\n/g, "<br/>")
          }) || alert(warning);
          reject();
        } else {
          resolve();
        }
      });
    });
    ux.el.addClass("lead-form").attr("style", "height: auto !important");
    ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.2.min.js").then(() => shazamme.ready(data.siteId, data.page)).then(() => {
      main(shazamme.register("lead-form", data));
    });
  }
  return __toCommonJS(lead_form_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["lead-form"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
