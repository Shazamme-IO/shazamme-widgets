/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-08-28T01:31:33.843Z. Registers window.ShazammeWidget["<name>"].
 */
"use strict";
var module = module || {};
module.exports = (() => {
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

  // dist/.gen/login-dialog.index.js
  var login_dialog_index_exports = {};
  __export(login_dialog_index_exports, {
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
    const p2 = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
    window.__shazSDKPromise = p2;
    return p2;
  }
  function loadOther(src) {
    const cache = window.__shazScriptCache = window.__shazScriptCache || {};
    const existing = cache[src];
    if (existing) return existing;
    const p2 = injectScript(src).catch((err) => {
      delete cache[src];
      throw err;
    });
    cache[src] = p2;
    return p2;
  }
  function installScriptLoader() {
    if (typeof window === "undefined" || window.__shazLoadScript) return;
    window.__shazLoadScript = (src) => SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
  }
  function ensureScriptLoader() {
    installScriptLoader();
  }

  // dist/.gen/login-dialog.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const Message = {
      show: "login-dialog-show",
      confirm: "login-dialog-confirm",
      submit: "login-dialog-submit",
      oauth: "login-dialog-oauth",
      cancel: "login-dialog-cancel",
      error: "login-dialog-error",
      ready: "login-dialog-ready"
    };
    const Subscribe = {
      auth: "site-auth",
      iconCancelled: "site-icon-cancelled",
      iconChanged: "site-icon-changed",
      iconPicker: "site-icon-picker"
    };
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.fieldElement = (f) => {
        var _a, _b;
        let el = $(`<div class='${f.fieldName === "separator" ? "field-separator" : "field"} ${f.fullRow ? "row" : ""}'></div>`);
        let field = "";
        if (f.fieldName === "separator") {
          return el;
        } else if (f.fieldName === "section-title") {
          el.addClass("row");
          el.append($(`<h1 class='field-title'>${f.fieldLabel}</h1>`));
          return el;
        } else if (f.fieldName === "section-description") {
          el.addClass("row");
          el.append($(`<p class='field-description'>${f.fieldDescription}</p>`));
          return el;
        }
        if (f.fieldName === "button") {
          field = $("<button />", {
            "class": "field-button",
            "data-button-link": ((_a = f.buttonLink) == null ? void 0 : _a.href) || f.buttonLink,
            "data-button-target": f.buttonTarget || "_self"
          });
          field.append(`<span class='text'>${f.fieldLabel}</span>`);
        } else {
          field = $("<input />", {
            "type": f.fieldName === "secret" ? "password" : "email",
            "data-field": f.fieldName,
            "title": f.fieldPlaceholder || f.fieldName,
            "placeholder": f.fieldPlaceholder
          });
          if (((_b = f.fieldLabel) == null ? void 0 : _b.length) > 0) {
            el.append($(`<label class='text'>${f.fieldLabel}</label>`));
          }
        }
        el.append(field);
        if (f.fieldName === "secret") {
          el.append(`<i class="fas fa-eye-slash password-toggle" data-rel="action-toggle-password" />`);
        }
        return el;
      };
      this.showLoading = (showing = true) => {
        if (showing) {
          this.el.find("[data-rel=modal-loading]").show();
        } else {
          this.el.find("[data-rel=modal-loading]").hide();
        }
      };
      this.buildHref = (path, query) => {
        if (path && path.charAt(0) !== "/") path = "/" + path;
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? "&" + query : ""}` : `https://${window.location.hostname}${path}${query ? "?" + query : ""}`;
      };
      this.redirectUri = (domain) => `${this.uri.protocol}//${domain}${this.uri.pathname}`;
      this.loadScript = (src) => window.__shazLoadScript(src);
    }
    const ux = new UX();
    const dialog = ux.el.find(".dialog-overlay");
    const enableIconEditor = (w2) => {
      ux.el.find("[data-rel=button-provider]").attr("title", (_, t) => `Change icon for ${t}`).on("click", function() {
        let button = this;
        w2.sub(Subscribe.iconChanged, (i) => {
          button.className = `button-icon ${i.set} fa-${i.id}`;
          w2.config().then((c) => {
            let icons = {};
            ux.el.find("[data-rel=button-provider]").each((_, el) => {
              icons[$(el).attr("data-provider")] = el.className;
            });
            w2.config({
              ...c,
              icons
            }).then();
          });
          w2.unsub(Subscribe.iconChanged);
          w2.unsub(Subscribe.iconCancelled);
        });
        w2.sub(Subscribe.iconCancelled, () => {
          w2.unsub(Subscribe.iconChanged);
          w2.unsub(Subscribe.iconCancelled);
        });
        w2.pub(Subscribe.iconPicker);
      }).on("click", "i", function() {
        let enable = $(this);
        $(enable).toggleClass("icon-check").toggleClass("icon-check-empty").attr("title", function(i, v) {
          return enable.is(".icon-check") ? "Hide on this page" : "Show on this page";
        });
        enable.parent().toggleClass("disabled");
        w2.config().then((c) => {
          let disabled = [];
          ux.el.find("[data-rel=button-provider].disabled").each((_, el) => {
            disabled.push($(el).attr("data-provider"));
          });
          w2.config({
            ...c,
            disabled
          }).then();
        });
        return false;
      });
    };
    const readConfig = (w2) => {
      ux.el.find("[data-site-enabled]").each((_, i) => {
        let el = $(i);
        if (shazamme.bag(el.attr("data-site-enabled"))) {
          el.removeClass("hidden");
        }
      });
      w2.config().then((c) => {
        ux.el.find("[data-rel=button-provider]").each((_, i) => {
          var _a;
          let el = $(i);
          i.className = ((c == null ? void 0 : c.icons) || {})[el.attr("data-provider")] || i.className;
          if (((_a = c == null ? void 0 : c.disabled) == null ? void 0 : _a.indexOf(el.attr("data-provider"))) >= 0) {
            if (data.inEditor) {
              el.addClass("disabled").find("i").toggleClass("icon-check").toggleClass("icon-check-empty").attr("title", "Show on this page");
            } else {
              el.addClass("hidden");
            }
          }
        });
      });
      if (data.inEditor) {
        let editButton = ux.el.find("[data-rel=button-edit]").hide().clone().show();
        shazamme.pub("site-config-add-tool", editButton);
        editButton.on("click", function() {
          w2.bag("showInEditor", true);
          dialog.removeClass("hidden");
          dialog.find("[data-rel=dialog]").addClass("hidden");
          dialog.find("[data-rel=dialog][data-dialog=login]").removeClass("hidden");
          setTimeout(() => {
            var _a;
            $((_a = parent == null ? void 0 : parent.document) == null ? void 0 : _a.body).find(".widgetCloseBtn").click();
          }, 1e3);
        });
      }
    };
    let main = (w) => {
      const fb = shazamme.firebase();
      let isConfirm = false;
      let useSoftReg = false;
      const manage = (u) => {
        var _a;
        ux.showLoading(false);
        if ((u == null ? void 0 : u.isOAuth) && (u == null ? void 0 : u.isNew)) {
          if (useSoftReg) {
            dialog.addClass("hidden");
            w.unsub(Subscribe.auth);
            w.pub(Message.submit, u);
          } else if (confirm(data.config.registerMessage || "It looks like this your first time here. Would you like to register?")) {
            shazamme.store("registerOAuth", JSON.stringify(u));
            window.location = ux.buildHref(shazamme.bag("_site:pathRegister") || "/register");
          } else {
            fb.user().delete();
          }
        } else if (u == null ? void 0 : u.isVerified) {
          if (isConfirm) {
            dialog.addClass("hidden");
            w.unsub(Subscribe.auth);
            w.pub(Message.confirm, u);
            return;
          }
          if (data.config.useNexus) {
            if (((_a = u.is) == null ? void 0 : _a.length) > 0 && !shazamme.cookie("shazamme.nexus.never")) {
              let nexus = dialog.find("[data-rel=dialog][data-dialog=nexus]");
              dialog.find("[data-rel=dialog][data-dialog=login]").addClass("hidden");
              if (shazamme.cookie("shazamme.nexus.next")) {
                window.location = shazamme.cookie("shazamme.nexus.next");
                return;
              }
              nexus.removeClass("hidden");
              nexus.find("[data-rel=button-nexus]").hide().each((_, i) => {
                const el = $(i);
                if (u.is.find((r) => r.startsWith(el.attr("data-nexus")))) {
                  el.show();
                }
              }).on("click", function() {
                if (nexus.find("[data-rel=nexus-default]").is(":checked")) {
                  let now = /* @__PURE__ */ new Date();
                  let exp = new Date(now.setMonth(now.getMonth() + 6));
                  shazamme.cookie("shazamme.nexus.next", $(this).attr("value"), exp);
                }
                window.location = $(this).attr("value");
              });
              nexus.find("[data-rel=button-navigate]").on("click", function() {
                if (nexus.find("[data-rel=nexus-default]").is(":checked")) {
                  let now = /* @__PURE__ */ new Date();
                  let exp = new Date(now.setMonth(now.getMonth() + 6));
                  shazamme.cookie("shazamme.nexus.next", nexus.find("[data-rel=nexus-navigation]").val(), exp);
                }
                window.location = nexus.find("[data-rel=nexus-navigation]").val();
              });
              nexus.find("[data-rel=nexus-default]").on("change", function() {
                if ($(this).is(":checked")) {
                  nexus.find("[data-rel=nexus-never]").removeAttr("checked");
                }
              });
              nexus.find("[data-rel=nexus-never]").on("change", function() {
                if ($(this).is(":checked")) {
                  nexus.find("[data-rel=nexus-default]").removeAttr("checked");
                }
              });
              nexus.find("[data-rel=button-dismiss]").on("click", function() {
                if (nexus.find("[data-rel=nexus-never]").is(":checked")) {
                  let now = /* @__PURE__ */ new Date();
                  let exp = new Date(now.setMonth(now.getMonth() + 6));
                  shazamme.cookie("shazamme.nexus.never", 1, exp);
                }
              });
              w.pub(Message.submit, u);
            } else {
              dialog.addClass("hidden");
              w.unsub(Subscribe.auth);
              w.pub(Message.submit, u);
            }
          } else {
            dialog.addClass("hidden");
            w.unsub(Subscribe.auth);
            w.pub(Message.submit, u);
          }
        } else if (u) {
          window.location = ux.buildHref(shazamme.bag("_site:pathVerify") || "/forgot-password", "mode=verifyEmail");
        }
      };
      const submit = () => {
        let uid = dialog.find("[data-field=uid]").val();
        let secret = dialog.find("[data-field=secret]").val();
        let go = () => {
          fb.auth(uid, secret).then((u) => {
            if (isConfirm) {
              dialog.addClass("hidden");
              w.pub(Message.confirm, u);
            }
          }).catch((err) => {
            if ((err == null ? void 0 : err.code) === "auth/user-not-found") {
              ux.showLoading(false);
              alert(data.config.warningUserNotFound || (err == null ? void 0 : err.msg) || " User not Found, Please use existing account or Please Register");
            } else {
              ux.showLoading(false);
              alert(data.config.warningLoginFail || (err == null ? void 0 : err.msg) || " Invalid Password, Please enter correct password");
            }
          });
        };
        if (!isConfirm && !((uid == null ? void 0 : uid.length) > 0 && (secret == null ? void 0 : secret.length) > 0)) {
          alert(data.config.warningFieldEmpty || "Please provide a user name and a password");
        } else if (isConfirm) {
          shazamme.user().then((u) => {
            if (u == null ? void 0 : u.isOAuth) {
              alert(data.config.warningUseOAuth || "Please sign in using one of the site options below");
            } else {
              go();
            }
          });
        } else {
          go();
        }
      };
      const copyConfiguration = () => {
        if (confirm("This will let you copy the current layout of this widget to a separate copy of the same widget on this page or on another page.\nProceed?")) {
          data.config.useDefaults = false;
          navigator.clipboard.writeText(btoa(JSON.stringify(data.config).replace(/[^\x00-\x7F]+/g, ""))).then();
        }
      };
      const pasteConfiguration = () => {
        navigator.clipboard.readText().then((t) => {
          try {
            let c = JSON.parse(atob(t));
            if (typeof c === "object") {
              let d = {
                surround: false,
                icon: false
              };
              d["data-widget-config"] = t, $.ajax({
                url: `${ux.uri.origin}/api/uis/pages/updateext?pageId=${Parameters.InitialPageId}&extId=custom_extension&elementId=${data.elementId}&device=${data.device}&currentPageId=${Parameters.InitialPageId}&currentEditorPageId=${Parameters.InitialPageId}`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(d)
              }).then(() => window.location.reload());
            }
          } catch (e) {
          }
        });
      };
      if (data.config.useDefaults || data.config.fieldList.length === 0) {
        w.defaults().then((c) => {
          data.config.fieldList = c.fieldList;
          ux.el.find("[data-rel=collection-fields]").prepend(data.config.fieldList.map((f) => ux.fieldElement(f))).on("keyup", "input", function(e) {
            if ((e.which || e.keyCode) === 13) {
              submit();
            }
          }).on("click", "[data-button-link]", function() {
            let b = $(this);
            window.open(b.attr("data-button-link"), b.attr("data-button-target"));
          }).on("click", "[data-rel=action-toggle-password]", function() {
            $(this).toggleClass(["fa-eye", "fa-eye-slash"]).siblings("input").attr("type", function(i, v) {
              if (v === "password") return "text";
              return "password";
            });
          });
        });
      } else {
        ux.el.find("[data-rel=collection-fields]").prepend(data.config.fieldList.map((f) => ux.fieldElement(f))).on("keyup", "input", function(e) {
          if ((e.which || e.keyCode) === 13) {
            submit();
          }
        }).on("click", "[data-button-link]", function() {
          let b = $(this);
          window.open(b.attr("data-button-link"), b.attr("data-button-target"));
        }).on("click", "[data-rel=action-toggle-password]", function() {
          $(this).toggleClass(["fa-eye", "fa-eye-slash"]).siblings("input").attr("type", function(i, v) {
            if (v === "password") return "text";
            return "password";
          });
        });
      }
      if (data.inEditor) {
        let editButton = ux.el.find("[data-rel=button-edit]");
        ux.el.find(".editor-only").removeClass("hidden").show();
        editButton.on("click", function() {
          w.bag("showInEditor", true);
          dialog.removeClass("hidden");
          dialog.find("[data-rel=dialog]").addClass("hidden");
          switch (w.bag("preview")) {
            case "nexus": {
              dialog.find("[data-rel=dialog][data-dialog=nexus]").removeClass("hidden");
              break;
            }
            case "login":
            default: {
              dialog.find("[data-rel=dialog][data-dialog=login]").removeClass("hidden");
              break;
            }
          }
        });
        ux.el.on("click", "[data-rel=button-dismiss]", function() {
          dialog.addClass("hidden");
          w.bag("showInEditor", null);
          setTimeout(() => {
            var _a;
            $((_a = parent == null ? void 0 : parent.document) == null ? void 0 : _a.body).find(".widgetCloseBtn").click();
          }, 1e3);
        });
        if (w.bag("showInEditor")) {
          dialog.removeClass("hidden");
          dialog.find("[data-rel=dialog]").addClass("hidden");
          switch (w.bag("preview")) {
            case "nexus": {
              dialog.find("[data-rel=dialog][data-dialog=nexus]").removeClass("hidden");
              break;
            }
            case "login":
            default: {
              dialog.find("[data-rel=dialog][data-dialog=login]").removeClass("hidden");
              break;
            }
          }
        }
        ux.el.find("[data-rel=preview]").on("click", function() {
          w.bag("preview", $(this).attr("data-preview"));
          editButton.trigger("click");
        });
        ux.el.find("[data-rel=dialog-title]").text("Test Title");
        enableIconEditor(w);
        ux.el.find("[data-rel=config]").on("click", function() {
          let b = $(this);
          switch (b.attr("data-config")) {
            case "copy":
              copyConfiguration();
              break;
            case "paste":
              pasteConfiguration();
              break;
          }
        });
      } else {
        ux.el.on("click", "[data-rel=button-submit]", function() {
          submit();
        }).on("click", "[data-rel=button-dismiss]", function() {
          dialog.addClass("hidden");
          w.unsub(Subscribe.auth);
          w.pub(Message.cancel);
          if (data.inEditor) {
            w.bag("showInEditor", null);
          }
        }).on("click", "[data-rel=button-provider]", function() {
          let p = $(this).attr("data-provider");
          if (p === "linkedinProvider" || p === "seekProvider") {
            shazamme.oauth(p);
            return;
          }
          try {
            if (!isConfirm) {
              fb.signOut();
            }
            fb.oauth(eval(p)).then((u) => {
              if (isConfirm) {
                dialog.addClass("hidden");
                w.pub(Message.confirm, u);
              }
            });
          } catch (err) {
            w.ex("Could not perform OAuth using", p, err);
          }
        });
      }
      ux.el.find("[data-site-enabled]").each((_, i) => {
        let el = $(i);
        if (shazamme.bag(el.attr("data-site-enabled"))) {
          el.removeClass("hidden");
        }
      });
      if (shazamme.bag("site-config-ready")) {
        readConfig(w);
      }
      shazamme.sub("site-config-ready", () => {
        readConfig(w);
      });
      w.sub(Message.show, (o) => {
        dialog.find("[data-field=uid]").val("").removeAttr("readonly");
        dialog.find("[data-field=secret]").val("");
        dialog.find("[data-rel=dialog]").addClass("hidden");
        isConfirm = false;
        useSoftReg = (o == null ? void 0 : o.useSoftReg) || false;
        if (o == null ? void 0 : o.confirm) {
          shazamme.user().then((u) => {
            if (u) {
              dialog.find("[data-field=uid]").val(u.email).attr("readonly", "readonly");
              if (u.isOAuth) {
                dialog.find("[data-field=secret]").val("").attr("disabled", "disabled");
              }
              isConfirm = true;
            }
            dialog.removeClass("hidden");
            dialog.find("[data-rel=dialog][data-dialog=login]").removeClass("hidden");
            dialog.find("input:not([readonly])").first().focus();
          });
        } else {
          w.sub(Subscribe.auth, (u) => {
            manage(u);
          });
          dialog.removeClass("hidden");
          dialog.find("[data-rel=dialog][data-dialog=login]").removeClass("hidden");
          dialog.find("input:not([readonly])").first().focus();
          if (o == null ? void 0 : o.provider) {
            fb.signOut(true);
            ux.el.find(`[data-provider=${o.provider}]`).click();
          }
        }
        ux.el.find("[data-rel=dialog-title]").text((o == null ? void 0 : o.title) || "");
      });
      w.pub(Message.ready);
      shazamme.bag(Message.ready, true);
      shazamme.bag("login-dialog", {
        message: Message
      });
    };
    dialog.addClass("hidden");
    ux.el.addClass("login-dialog");
    ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(() => shazamme.ready(data.siteId, data.page)).then(() => {
      main(shazamme.register("login-dialog", data));
    });
  }
  return __toCommonJS(login_dialog_index_exports);
})();
(function(){
  var reg = (typeof module !== 'undefined' && module.exports) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["login-dialog"] = controller;
  }
})();
