/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 931a9eb717cd. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/consultant.index.js
  var consultant_index_exports = {};
  __export(consultant_index_exports, {
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

  // dist/.gen/consultant.index.js
  function legacyController(ctx) {
    var _a;
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const cssId = "fontAwesomeSource";
    if (!document.getElementById(cssId) && !document.querySelector('link[href*="fontawesome"]')) {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://use.fontawesome.com/releases/v6.5.1/css/all.min.css";
      link.crossOrigin = "anonymous";
      head.appendChild(link);
    }
    var slickReady = false;
    var slickReadyCb = null;
    var slickCdnUrl = "https://irt-cdn.multiscreensite.com/5775367238d847b8b62d126ce25c20de/files/uploaded/slick-latest.js";
    if (!document.getElementById("slickJS")) {
      var slickScript = document.createElement("script");
      slickScript.id = "slickJS";
      slickScript.src = slickCdnUrl;
      slickScript.onload = function() {
        slickReady = true;
        if (typeof slickReadyCb === "function") slickReadyCb();
      };
      document.head.appendChild(slickScript);
    } else {
      slickReady = true;
    }
    function whenSlickReady(cb) {
      if (slickReady) {
        cb();
      } else {
        slickReadyCb = cb;
      }
    }
    function loadScript(d, s, id, url, callback) {
      $("#" + id).remove();
      var fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      script = d.createElement(s);
      script.id = id;
      script.src = url;
      fjs.parentNode.insertBefore(script, fjs);
      if (script.readyState) {
        script.onreadystatechange = function() {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function() {
          callback();
        };
      }
      script.src = url;
      fjs.parentNode.insertBefore(script, fjs);
    }
    function Getdata() {
      this.checkFilters = (consultants) => {
        let filtered = consultants.filter((c) => {
          let found = true;
          console.log(c, "Consultant Data");
          return found;
        });
      };
      this.collection = (collection) => {
        return collection.map((i) => {
          let item = {};
          let uri = new URL(i.data.consultantURL || i.page_item_url);
          let path = uri.pathname.split("/").pop();
          uri.pathname = `/${dynamicPageURL}/${path}`;
          item.page_item_url = uri.toString();
          Object.keys(i.data).filter((j) => {
            item[removeSpecial(j)] = this.removeExtra(i.data[j]);
          });
          return item;
        });
      };
      this.category = (arr, category) => {
        return this.removeduplicate(arr, category).map((i) => {
          return i[category];
        });
      };
      this.removeduplicate = (array, key) => {
        return array.reduce(function(arr, item) {
          const removed = arr.filter(function(i) {
            return i[key] !== item[key];
          });
          return [...removed, item];
        }, []);
      };
      this.multifilter = (arr, filters2) => {
        const filterKeys = Object.keys(filters2);
        return arr.filter(function(eachObj) {
          return filterKeys.every(function(eachKey) {
            if (!filters2[eachKey].length) {
              return true;
            }
            if (!eachObj[eachKey]) return;
            let string = "";
            if (eachKey == "firstName") {
              return filters2[eachKey].split(",").map((i) => i == null ? void 0 : i.trim()).some((i) => new RegExp(i, "i").test(`${eachObj.firstName || ""} ${eachObj.lastName || ""}`));
            } else {
              string = eachObj[eachKey].toLowerCase().split(",").map((i) => i.trim()).join(",");
              let val = filters2[eachKey].toLowerCase().split(",").map((i) => i.trim()).join(",");
              var valarry = val.split(",");
              var value = false;
              for (var k = 0; k < valarry.length; k++) {
                if (string.includes(valarry[k]))
                  return true;
                else
                  value = false;
              }
              return value;
            }
          });
        });
      };
      this.sortObj = (arr, sortBy2) => {
        return arr.sort((a, b) => {
          let aname = `${a.firstName} ${a.firstName}`;
          let bname = `${b.firstName} ${b.firstName}`;
          if (sortBy2 == "a-z") {
            return aname > bname ? 1 : -1;
          }
          if (sortBy2 == "z-a") {
            return bname > aname ? 1 : -1;
          }
          if (sortBy2 == "category") {
            return a.category > b.category ? 1 : -1;
          }
          if (sortBy2 == "default") {
            return a.sortOrder > b.sortOrder ? 1 : -1;
          }
        });
      };
      this.removeExtra = (str) => {
        let fullText = "";
        if (str) {
          if (typeof str !== "undefined") {
            if (typeof str == "string") {
              if (!str.includes("</p>")) {
                fullText = str;
              } else {
                fullText = str.substring(str.indexOf(">") + 1).replace("</p>", "");
              }
            } else {
              fullText = str;
            }
          }
        }
        return fullText;
      };
      function removeSpecial(str) {
        let pattern = str.replace(/[^A-Z0-9]/ig, ``);
        return pattern;
      }
    }
    function Actioncall() {
      this.saveJobs = (obj) => {
        return $.ajax({
          url: "https://shazamme.io/Job-Listing/src/php/actions",
          method: "POST",
          data: JSON.stringify(obj)
        });
      };
    }
    var FilterData = function() {
      var type = this.getAttribute("data-type");
      var value = this.getAttribute("data-value");
      var classname = document.getElementsByClassName("clsbtnFilter");
      for (var i = 0; i < classname.length; i++) {
        classname[i].classList.remove("Active");
      }
      this.classList.add("Active");
      if (type == 1) {
        filters.classification = data.config.classification ? data.config.classification : "";
        filters.businessLocation = data.config.city ? data.config.city : "";
        filterConsultant(tabledata, filters);
      }
      if (type == 2) {
        filters.classification = value;
        filters.businessLocation = "";
        filterConsultant(tabledata, filters);
      }
      if (type == 3) {
        filters.classification = "";
        filters.businessLocation = value;
        filterConsultant(tabledata, filters);
      }
    };
    var AddbtnListners = function() {
      var classname = document.getElementsByClassName("clsbtnFilter");
      for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener("click", FilterData, false);
      }
    };
    let Showclssbtns = data.config.ShowClassificationButtons;
    let Showcitybtns = data.config.ShowLocationButtons;
    if (Showclssbtns || Showcitybtns) {
      $(".consultList-newfilters").append('<div class="dmWidget clsbtnFilter Active" data-value="All" data-type="1"> <span class="text">All</span></div>&nbsp;&nbsp;');
    }
    let collectionName = "Consultants";
    let dynamicPageURL = data.config.consultantPage || "consultant";
    let newTab = data.config.newTab ? "_blank" : "_self";
    let getData = new Getdata();
    let create = new Create();
    let tabledata;
    let filters = {};
    let layout = data.config.layout;
    let device = data.device;
    let consulCount = "Three";
    let sortBy = data.config.sortBy;
    let viewProfileBtnText = data.config.viewProfileBtnText;
    let justify = data.config.justify;
    let itemLayout = data.config.itemLayout;
    let filterAlignment = data.config.filterAlignment;
    let showButton = data.config.showButton;
    let btnPosition = data.config.btnPosition;
    let ShowLoc = data.config.ShowLocation;
    let showPhone = data.config.showPhone;
    let showPhoneLabel = data.config.showPhoneLabel;
    let showPhoneIcon = data.config.showPhoneIcon;
    let showMobile = data.config.showMobile;
    let showMobileLabel = data.config.showMobileLabel;
    let showMobileIcon = data.config.showMobileIcon;
    let showEmail = data.config.showEmail;
    let showEmailLabel = data.config.showEmailLabel;
    let showEmailIcon = data.config.showEmailIcon;
    let showLinkedin = data.config.showLinkedin;
    let showLinkedInLabel = data.config.showLinkedInLabel;
    let showLinkedInIcon = data.config.showLinkedInIcon;
    let showFacebook = data.config.showFacebook;
    let showFacebookLabel = data.config.showFacebookLabel;
    let showFacebookIcon = data.config.showFacebookIcon;
    let showTwitter = data.config.showTwitter;
    let showTwitterLabel = data.config.showTwitterLabel;
    let showTwitterIcon = data.config.showTwitterIcon;
    let showGoogle = data.config.showGoogle;
    let showGoogleLabel = data.config.showGoogleLabel;
    let showGoogleIcon = data.config.showGoogleIcon;
    let showWeChat = data.config.showWeChat;
    let showWeChatLabel = data.config.showWeChatLabel;
    let showWeChatIcon = data.config.showWeChatIcon;
    let dotsPagination = data.config.dotsPagination;
    let slidesToShow = parseInt(data.config.slidesToShow);
    let infinite = data.config.infinite;
    let arrows = data.config.arrows;
    let autoplay = data.config.autoplay;
    let sliderspeed = parseInt(data.config.sliderSpeed);
    let defaultClassification = data.config.classification == "All" ? "" : data.config.classification;
    let defaultConsultantGroupID = ((_a = data.config.consultantGroupID) == null ? void 0 : _a.length) > 1 ? data.config.consultantGroupID : "";
    if (!data.config.classification) {
      defaultClassification = "";
    }
    let city = data.config.city ? data.config.city : "";
    let SearchKeys = data.config.searchKeywords ? data.config.searchKeywords : "";
    let dudaAlias = data.siteId;
    if (itemLayout != "newslider") {
      var style = document.createElement("style");
      style.innerText = ".clsbottomSlider{margin:0!important;}";
      document.head.appendChild(style);
    }
    var portraitStyle = document.createElement("style");
    portraitStyle.innerText = ":where(.consultList-consultImg){border-radius:50%}";
    document.head.appendChild(portraitStyle);
    var FLUID_MIN_CARD = 220;
    var FLUID_FALLBACK_COLUMNS = 3;
    function oneLine(text) {
      return String(text == null ? "" : text).replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
    }
    function fluidColumns() {
      var maxColumns = slidesToShow > 0 ? slidesToShow : FLUID_FALLBACK_COLUMNS;
      var width = $(element).width();
      if (!width) return maxColumns;
      return Math.max(1, Math.min(maxColumns, Math.floor(width / FLUID_MIN_CARD)));
    }
    function setImportant(el, props) {
      Object.keys(props).forEach(function(name) {
        el.style.setProperty(name, props[name], "important");
      });
    }
    function fluidCards(slick) {
      var root = $(element);
      root.find(".consultList-consultantWrap .slick-slide").each(function() {
        setImportant(this, { "width": slick.slideWidth + "px", "margin-left": "0", "margin-right": "0", "max-width": "none", "padding": "0", "left": "0", "right": "auto" });
        var card = this.classList.contains("consultList-consultant") ? null : this.querySelector(".consultList-consultant");
        if (card) setImportant(card, { "width": "100%", "max-width": "none", "margin-left": "0", "margin-right": "0", "padding": "0", "left": "0", "right": "auto" });
      });
      root.find(".consultList-consultantWrap .consultList-top").each(function() {
        setImportant(this, { "width": "100%" });
      });
      fluidPortraits();
      root.find(".consultList-consultantWrap .consultList-consultName, .consultList-consultantWrap .consultList-consultPos, .consultList-consultantWrap .consultList-consultLoc").each(function() {
        setImportant(this, { "width": "100%", "padding": "0 6px", "overflow-wrap": "break-word", "word-break": "normal", "text-wrap": "balance" });
      });
    }
    var PORTRAIT_SHARE = 0.8;
    var PORTRAIT_MAX = 230;
    function fluidPortraits() {
      $(element).find(".consultList-consultant").each(function() {
        var cardWidth = this.getBoundingClientRect().width;
        if (!cardWidth) return;
        var size = Math.round(Math.min(PORTRAIT_MAX, cardWidth * PORTRAIT_SHARE)) + "px";
        $(this).find(".consultList-consultImg").each(function() {
          setImportant(this, { "width": size, "height": size, "max-width": "none", "aspect-ratio": "1 / 1", "margin-left": "auto", "margin-right": "auto", "overflow": "hidden" });
        });
      });
    }
    var GRID_MIN_CARD = 240;
    var GRID_MAX_COLUMNS = 5;
    function fluidGrid() {
      if (layout != "grid" || itemLayout == "newslider") return;
      var wrap = $(element).find(".consultList-consultantWrap");
      var cards = wrap.children(".consultList-consultant");
      var count = cards.length;
      var width = wrap.width();
      if (!count || !width) return;
      var columns = Math.max(1, Math.min(GRID_MAX_COLUMNS, Math.floor(width / GRID_MIN_CARD)));
      while (columns > 2 && count > 1 && count % columns === 1) columns--;
      setImportant(wrap.get(0), { "display": "flex", "flex-wrap": "wrap", "justify-content": "center" });
      cards.each(function() {
        setImportant(this, { "width": 100 / columns + "%", "max-width": "none", "margin-left": "0", "margin-right": "0", "padding": "0 10px", "box-sizing": "border-box", "float": "none", "left": "0", "right": "auto" });
      });
      fluidPortraits();
      wrap.find(".consultList-top").each(function() {
        setImportant(this, { "width": "100%" });
      });
      growWrapper();
    }
    function growWrapper() {
      var wrapper = element.closest ? element.closest(".widget-wrapper") : null;
      if (!wrapper) return;
      wrapper.style.setProperty("height", "auto", "important");
      wrapper.style.setProperty("min-height", Math.ceil(element.scrollHeight) + "px", "important");
    }
    function slider() {
      $(element).find(".consultList-consultantWrap").addClass("shm-fluid-slider main-review-slider-container").slick({
        dots: dotsPagination,
        slidesToShow: fluidColumns(),
        centerMode: false,
        infinite,
        arrows,
        adaptiveHeight: true,
        autoplay,
        prevArrow: '<i class="fas fa-chevron-left slick-prev"></i>',
        nextArrow: '<i class="fas fa-chevron-right slick-next"></i>'
      }).on("setPosition", function(event, slick) {
        fluidCards(slick);
        $(element).find(".consultList-consultantWrap").css("height", Math.max(slick.$slideTrack.height(), slick.$list.outerHeight()) + "px");
        growWrapper();
      });
    }
    function refitSlider() {
      if (layout == "grid") {
        fluidGrid();
        return;
      }
      var wrap = $(element).find(".consultList-consultantWrap");
      if (itemLayout == "newslider" || layout != "slider" || !wrap.hasClass("slick-initialized")) return;
      var columns = fluidColumns();
      if (wrap.slick("slickGetOption", "slidesToShow") !== columns) {
        wrap.slick("slickSetOption", "slidesToShow", columns, true);
      } else {
        wrap.slick("setPosition");
      }
    }
    if (typeof ResizeObserver !== "undefined") {
      if (element.__shmConsultantObserver) element.__shmConsultantObserver.disconnect();
      element.__shmConsultantObserver = new ResizeObserver(function() {
        refitSlider();
      });
      element.__shmConsultantObserver.observe(element);
    }
    function watchContent() {
      var content = element.querySelector(".consultList");
      if (content && element.__shmConsultantObserver) element.__shmConsultantObserver.observe(content);
    }
    $(element).find("#manageInput").change(function(e) {
      filters.classification = $(this).find("option:selected").val();
      filterConsultant(tabledata, filters);
    });
    $(element).find("#specSelect").change(function(e) {
      filters.classification = $(this).find("option:selected").val();
      filterConsultant(tabledata, filters);
    });
    $(element).find("#locSelect").change(function(e) {
      filters.businessLocation = $(this).find("option:selected").val();
      filterConsultant(tabledata, filters);
    });
    $(element).find("#keyInput").keyup(function(e) {
      var code = e.keyCode ? e.keyCode : e.which;
      filters.firstName = $(this).val();
      filterConsultant(tabledata, filters);
    });
    var activeFilter = {
      classification2: [],
      businessLocation2: []
    };
    setTimeout(() => {
      var checkE = $(element).find(".messageCheckbox");
      checkE.on("click", function(e) {
        if (e.target.checked) {
          activeFilter[e.target.name].push(e.target.value);
        }
        console.log("activeFilter", activeFilter);
      });
    }, 3e3);
    if (layout == "verticalRight" && itemLayout != "newslider") {
      $(element).find(".consultList").css("display", "flex");
      $(element).find(".consultList-rowWrap").css("flex-direction", "column");
    }
    function filterConsultant(arr, filters2) {
      let filteredStructure = create.structure(getData.multifilter(arr, filters2));
      if (itemLayout == "newslider") {
        $(element).find(".slider-for").html(filteredStructure);
        newslider();
        newsliderbottom();
      } else {
        if (layout == "grid") {
          $(element).find(".consultList-consultantWrap").html(filteredStructure);
          fluidGrid();
          return;
        } else if (layout == "vertical") {
          $(element).find(".consultList-consultantWrap").html(filteredStructure);
          fluidPortraits();
          return;
        }
        if (layout == "verticalRight") {
          $(element).find(".consultList-consultantWrap").html(filteredStructure);
          fluidPortraits();
          return;
        }
        $(element).find(".consultList-consultantWrap").slick("unslick");
        $(element).find(".consultList-consultant").addClass("consultList-consultantSlider");
        $(element).find(".consultList-consultantWrap").html(filteredStructure);
        slider();
      }
    }
    let ClassficationOutput = "";
    let CityOutput = "";
    function Create() {
      this.structure = (obj) => {
        let output = "";
        let suboutput = "";
        getData.sortObj(obj, sortBy).map((i) => {
          let link2 = "";
          try {
            let consultantPath = new URL(i["page_item_url"]).pathname.split("/").pop();
            link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dynamicPageURL}/${consultantPath}?preview=true&insitepreview=true&dm_device=${device}` : i["page_item_url"];
          } catch (e) {
            link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dynamicPageURL}/${i["page_item_url"].split("/").pop()}?preview=true&insitepreview=true&dm_device=${device}` : i["page_item_url"];
          }
          let iconPhone = showPhoneIcon ? `<i class="fas fa-phone-square"></i>` : "";
          let iconMobile = showMobileIcon ? `<i class="fas fa-mobile-alt"></i>` : "";
          let iconEmail = showEmailIcon ? `<i class="fas fa-envelope"></i>` : "";
          let iconLinkedIn = showLinkedInIcon ? `<i class="fab fa-linkedin"></i>` : "";
          let iconFacebook = showFacebookIcon ? `<i class="fab fa-facebook-square"></i>` : "";
          let iconTwitter = showTwitterIcon ? `<i class="fa-brands fa-square-x-twitter"></i>` : "";
          let iconGoogle = showGoogleIcon ? `<i class="fab fa-google-plus-square"></i>` : "";
          let iconWeChat = showWeChatIcon ? `<i class="fab fa-weixin"></i>` : "";
          let isPhone = i.phone && (showPhoneLabel || showPhoneIcon) ? `<a href="tel:${i.phone}" class="consultList-Phone" style="text-decoration:none;">${iconPhone} ${showPhoneLabel ? i.phone : ""}</a>` : "";
          let isMobile = i.mobile && (showMobileLabel || showMobileIcon) ? `<a href="sms:${i.mobile}" class="consultList-Mobile" style="text-decoration:none;">${iconMobile} ${showMobileLabel ? i.mobile : ""}</a>` : "";
          let isEmail = i.eMail && (showEmailLabel || showEmailIcon) ? `<a href="mailto:${i.eMail}" class="consultList-Email" title="${i.eMail}" style="text-decoration:none;">${iconEmail} ${showEmailLabel ? i.eMail : ""}</a>` : "";
          let isLinkedIn = i.linkedInURL && (showLinkedInLabel || showLinkedInIcon) ? `<a href="${i.linkedInURL}" target="${newTab}" class="consultList-Linkedin" title="${i.linkedInURL}" style="text-decoration:none;">${iconLinkedIn} ${showLinkedInLabel ? "View LinkedIn Profile" : ""}</a>` : "";
          let isFacebook = i.facebookURL && (showFacebookLabel || showFacebookIcon) ? `<a href="${i.facebookURL}" target="${newTab}" class="consultList-Facebook" title="${i.facebookURL}" style="text-decoration:none;">${iconFacebook} ${showFacebookLabel ? "View Facebook Profile" : ""}</a>` : "";
          let isTwitter = i.twitterURL && (showTwitterLabel || showTwitterIcon) ? `<a href="${i.twitterURL}" target="${newTab}" class="consultList-Twitter" title="${i.twitterURL}" style="text-decoration:none;">${iconTwitter} ${showTwitterLabel ? "View Twitter Profile" : ""}</a>` : "";
          let isGoogle = i.googleURL && (showGoogleLabel || showGoogleIcon) ? `<a href="${i.googleURL}" target="${newTab}" class="consultList-Google" title="${i.googleURL}" style="text-decoration:none;">${iconGoogle} ${showGoogleLabel ? "View Google+ Profile" : ""}</a>` : "";
          let isWeChat = i.weChatURL && (showWeChatLabel || showWeChatIcon) ? `<a href="${i.weChatURL}" target="${newTab}" class="consultList-WeChat" title="${i.weChatURL}" style="text-decoration:none;">${iconWeChat} ${showWeChatLabel ? "View WeChat Profile" : ""}</a>` : "";
          let iconContainer = "Hide";
          if (!showPhoneLabel || !showMobileLabel || !showEmailLabel || !showLinkedInLabel || !showFacebookLabel || !showTwitterLabel || !showGoogleLabel || !showWeChatLabel) {
          }
          let isButton = showButton ? `<a href="${link2}" target="${newTab}" class="consultList-viewProfile consultList-viewProfile${btnPosition}">
                                            <span class="text">${viewProfileBtnText}</span>
                                        </a>` : "";
          if (itemLayout == "compact") {
            output += `
                <div class="consultList-consultant consultList-consultant-${consulCount + "-" + data.device}">
                    <div class="consultList-top">
                    <a href="${link2}" target="${newTab}">
                        <div class="consultList-consultImg consultList-consultImgCompact">
                            <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" alt="" loading="lazy">
                            <div class="consultList-Contact-ContainerIcons consultList-ContactCompact">
                                ${showPhone && i.phone ? `<a href="tel:${i.phone}"><i class="fas fa-phone-square"></i></a>` : ""}
                                ${showMobile && i.mobile ? `<a href="sms:${i.mobile}"><i class="fas fa-mobile-alt"></i></a>` : ""}
                                ${showEmail && i.eMail ? `<a href="mailto:${i.eMail}"><i class="fas fa-envelope"></i><a/>` : ""}
                                ${showLinkedin && i.linkedInURL ? `<a href="${i.linkedInURL}" target="${newTab}"><i class="fab fa-linkedin"></i></a>` : ""}
                                ${showFacebook && i.facebookURL ? `<a href="${i.facebookURL}" target="${newTab}"><i class="fab fa-facebook-square"></i></a>` : ""}
                                ${showTwitter && i.twitterURL ? `<a href="${i.twitterURL}" target="${newTab}"><i class="fa-brands fa-square-x-twitter"></i></a>` : ""}
                                ${showGoogle && i.googleURL ? `<a href="${i.googleURL}" target="${newTab}"><i class="fab fa-google-plus-square"></i></a>` : ""}
                                ${showWeChat && i.weChatURL ? `<a href="${i.weChatURL}" target="${newTab}"><i class="fab fa-weixin"></i></a>` : ""}
                            </div>
                        </div>
                        </a>
                        <a href="${link2}" target="${newTab}" class="consultList-consultDetails" style="text-decoration:none"><div class="consultList-consultDetails">
                            <div class="consultList-consultName">
                                ${oneLine(`${i.firstName} ${i.lastName}`)}
                            </div>
                            <div class="consultList-consultPos">
                                ${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}
                            </div>
                            ${ShowLoc && i.businessLocation2 ? `<div class="consultList-consultLoc">${oneLine(i.businessLocation2)}</div>` : ""}
                        </div>
                        </a>
                    </div>
                </div>`;
          } else if (itemLayout == "Compact2") {
            output += `
                <div class="consultList-consultant consultList-consultant-${consulCount + "-" + data.device}">
                    <div class="consultList-top">
                    <a href="${link2}" target="${newTab}">
                        <div class="consultList-consultImg consultList-consultImgCompact">
                            <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" alt="" loading="lazy">
                            <div class="consultList-consultDetails-new">
                                <div class="consultList-consultName-new">
                                    ${oneLine(`${i.firstName} ${i.lastName}`)}
                                </div>
                                <div class="consultList-consultPos-new">
                                    ${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}
                                </div>
                                ${ShowLoc && i.businessLocation2 ? `<div class="consultList-consultLoc-new">${oneLine(i.businessLocation2)}</div>` : ""}
                            </div>
                            <div class="consultList-Contact-ContainerIcons consultList-ContactCompact">
                                ${showPhone && i.phone ? `<a href="tel:${i.phone}"><i class="fas fa-phone-square"></i></a>` : ""}
                                ${showMobile && i.mobile ? `<a href="sms:${i.mobile}"><i class="fas fa-mobile-alt"></i></a>` : ""}
                                ${showEmail && i.eMail ? `<a href="mailto:${i.eMail}"><i class="fas fa-envelope"></i><a/>` : ""}
                                ${showLinkedin && i.linkedInURL ? `<a href="${i.linkedInURL}" target="${newTab}"><i class="fab fa-linkedin"></i></a>` : ""}
                                ${showFacebook && i.facebookURL ? `<a href="${i.facebookURL}" target="${newTab}"><i class="fab fa-facebook-square"></i></a>` : ""}
                                ${showTwitter && i.twitterURL ? `<a href="${i.twitterURL}" target="${newTab}"><i class="fa-brands fa-square-x-twitter"></i></a>` : ""}
                                ${showGoogle && i.googleURL ? `<a href="${i.googleURL}" target="${newTab}"><i class="fab fa-google-plus-square"></i></a>` : ""}
                                ${showWeChat && i.weChatURL ? `<a href="${i.weChatURL}" target="${newTab}"><i class="fab fa-weixin"></i></a>` : ""}
                            </div>
                        </div>
                        </a>
                    </div>
                </div>`;
          } else if (itemLayout == "Compact3") {
            output += `
                <div class="consultList-consultant consultList-consultant-${consulCount + "-" + data.device}">
                    <div class="consultList-top">
                    <a href="${link2}" target="${newTab}">
                        <div class="consultList-consultImg consultList-consultImgCompact2">
                            <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" alt="" loading="lazy">
                            <div class="consultList-consultDetails-new2">
                                <div class="consultList-consultDetails-new2-hover">
                                    <div class="consultList-consultName-new2">
                                        ${oneLine(`${i.firstName} ${i.lastName}`)}
                                    </div>
                                    <div class="consultList-consultPos-new2">
                                        ${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}
                                    </div>
                                    ${ShowLoc && i.businessLocation2 ? `<div class="consultList-consultLoc-new2">${oneLine(i.businessLocation2)}</div>` : ""}
                                </div>
                            </div>
                        </div>
                        </a>
                    </div>
                </div>`;
          } else if (itemLayout == "default") {
            output += `
                    <div class="consultList-consultant consultList-consultant-${consulCount + "-" + data.device}">
                        <div class="consultList-top">
                            <a href="${link2}" target="${newTab}">
                                <div class="consultList-consultImg-top-part">
                                    <div class="consultList-consultImg">
                                        <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" alt="" loading="lazy">
                                    </div>
                                </div>
                            </a>
                            <div class="consultList-consultImg-bottom-part">
                                <div class="consultList-consultName">
                                    ${oneLine(`${i.firstName} ${i.lastName}`)}
                                </div>
                                <div class="consultList-consultPos">
                                    ${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}
                                </div>
                                ${ShowLoc && i.businessLocation2 ? `<div class="consultList-consultLoc">${oneLine(i.businessLocation2)}</div>` : ""}
                                <div class="consultList-Contact-Container">
                                    ${showPhone ? isPhone : ""}
                                    ${showMobile ? isMobile : ""}
                                    ${showEmail ? isEmail : ""}
                                    ${showLinkedin ? isLinkedIn : ""}
                                    ${showFacebook ? isFacebook : ""}
                                    ${showTwitter ? isTwitter : ""}
                                    ${showGoogle ? isGoogle : ""}
                                    ${showWeChat ? isWeChat : ""}
                                </div>

                                <div class="consultList-Contact-ContainerIcons consultList-Contact${iconContainer}" hidden>
                                    ${i.phone && isPhone ? `<a href="tel:${i.phone}"><i class="fas fa-phone-square"></i></a>` : ""}
                                    ${i.mobile && isMobile ? `<a href="sms:${i.mobile}"><i class="fas fa-mobile-alt"></i></a>` : ""}
                                    ${i.eMail && isEmail ? `<a href="mailto:${i.eMail}"><i class="fas fa-envelope"></i><a/>` : ""}
                                    ${i.linkedInURL && isLinkedIn ? `<a href="${i.linkedInURL}" target="${newTab}"><i class="fab fa-linkedin"></i></a>` : ""}
                                    ${i.facebookURL && isFacebook ? `<a href="${i.facebookURL}" target="${newTab}"><i class="fab fa-facebook-square"></i></a>` : ""}
                                    ${i.twitterURL && isTwitter ? `<a href="${i.twitterURL}" target="${newTab}"><i class="fa-brands fa-square-x-twitter"></i></a>` : ""}
                                    ${i.googleURL && isGoogle ? `<a href="${i.googleURL}" target="${newTab}"><i class="fab fa-google-plus-square"></i></a>` : ""}
                                    ${i.weChatURL && isWeChat ? `<a href="${i.weChatURL}" target="${newTab}"><i class="fab fa-weixin"></i></a>` : ""}
                                </div>
                                <div class="consultList-innerContainer"></div>
                                <div class="consultList-bottom">
                                    ${isButton}
                                </div>
                            </div>
                        </div>
                    </div>`;
          } else if (itemLayout == "secondaryimage") {
            output += `
                <div class="consultList-consultant consultList-consultant-${consulCount + "-" + data.device}">
                    <div class="consultList-top">
                    <a href="${link2}" target="${newTab}">
                        <div class="consultList-consultImg consultList-consultImgCompact">
                            <img src="${i.photoURL ? i.photoURL : "https://i1.wp.com/www.ignitemediasolution.com/wp-content/uploads/2017/06/profile-placeholder-male.png"}" alt="" loading="lazy">
                            <div class="consultList-Contact-ContainerIcons consultList-ContactSecondaryImage">
                               <img src="${i.secondaryImageURL ? i.secondaryImageURL : i.photoURL}" alt="">
                            </div>
                        </div>
                        </a>
                        <a href="${link2}" target="${newTab}" class="consultList-consultDetails" style="text-decoration:none"><div class="consultList-consultDetails">
                            <div class="consultList-consultName">
                                ${oneLine(`${i.firstName} ${i.lastName}`)}
                            </div>
                            <div class="consultList-consultPos">
                                ${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}
                            </div>
                            ${ShowLoc && i.businessLocation2 ? `<div class="consultList-consultLoc">${oneLine(i.businessLocation2)}</div>` : ""}

                        </div>
                        </a>
                    </div>
                </div>`;
          } else {
            output += `
                <div class="col-sm-12 clsTileDiv">
                    <div class="col-sm-12 clsTile">
                        <div class="col-sm-9 clsDescDiv">
                            <p class="con-Title">${oneLine(`${i.firstName} ${i.lastName}`)}</p>
                            <p class="con-Desg">${i.positionTitle ? oneLine(i.positionTitle) : "N/A"}</p>
                            ${ShowLoc && i.businessLocation2 ? `<p class="con-Loc">${oneLine(i.businessLocation2)}</p>` : ""}
                            <p class="con-Desc">${i.shortDescription ? i.shortDescription : " "}</p>
                            <a href="${link2}" target="${newTab}" class="clsbtnViewDetails"><span class="text">View more</span></a>
                        </div>
                        <div class="col-sm-3 clsImgDiv">
                            <br>
                            <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" class="Con-img" loading="lazy"/>
                        </div>
                    </div>
                </div>`;
            suboutput += `<div class="clsbtmSliderImgTile">
                     <img src="${i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1"}" alter="SortOrder-${i.sortOrder}" class="Con-slider-img" loading="lazy"/>
                </div>`;
          }
        });
        $(element).find(".slider-nav").html(suboutput);
        return output;
      };
      this.classificationCheckBoxes = (obj) => {
        let allclassification = obj.map((i) => {
          if (i.classification) {
            let classificationArr = JSON.parse(i.classification);
            return classificationArr.map((j) => {
              return j.Profession;
            });
          }
        });
        let classificationList = allclassification.flat();
        var uniqueItems = Array.from(new Set(classificationList)).filter((i) => {
          if (typeof i !== "undefined") return i;
        });
        let sorted = uniqueItems.sort((a, b) => {
          return a > b ? 1 : -1;
        });
        let output = "";
        sorted.map((i) => {
          let selectedLoc = i.toLowerCase().includes(defaultClassification.toLowerCase()) ? "selected" : "";
          let buttonArray = defaultClassification.toLowerCase().split(",");
          let displayBlock = "";
          for (let index = 0; index < buttonArray.length; ++index) {
            const element2 = buttonArray[index];
            displayBlock = i.toLowerCase().includes(element2.toLowerCase()) ? "" : "display:none";
            if (displayBlock == "")
              index = buttonArray.length;
          }
          output += `
           <label> <input  type="checkbox" class="messageCheckbox" name="classification2" value="${i.toLowerCase()}"> ${i}</label>`;
        });
        return output;
      };
      this.businessLocationCheckBoxes = (obj) => {
        let alllocation = obj.map((i) => {
          if (i.businessLocation) {
            let alllocation2 = JSON.parse(i.businessLocation);
            return alllocation2.map((j) => {
              return j.LocationName;
            });
          }
        });
        let locationList = alllocation.flat();
        var uniqueItems = Array.from(new Set(locationList)).filter((i) => {
          if (typeof i !== "undefined") return i;
        });
        let sorted = uniqueItems.sort((a, b) => {
          return a > b ? 1 : -1;
        });
        let output = "";
        sorted.map((i) => {
          let selectedLoc = i.toLowerCase().includes(city.toLowerCase()) ? "selected" : "";
          if (city === "") {
            selectedLoc = "";
          }
          let buttonArray = city.toLowerCase().split(",");
          let displayBlock = "";
          for (let index = 0; index < buttonArray.length; ++index) {
            const element2 = buttonArray[index];
            displayBlock = i.toLowerCase().includes(element2.toLowerCase()) ? "" : "display:none";
            if (displayBlock == "")
              index = buttonArray.length;
          }
          output += `
            <label><input class="messageCheckbox" type="checkbox" name="businessLocation2" value="${i.toLowerCase()}" />${i}</label>`;
        });
        return output;
      };
      this.classification = (obj) => {
        let allclassification = obj.map((i) => {
          if (i.classification) {
            let classificationArr = JSON.parse(i.classification);
            return classificationArr.map((j) => {
              return j.Profession;
            });
          }
        });
        let classificationList = allclassification.flat();
        var uniqueItems = Array.from(new Set(classificationList)).filter((i) => {
          if (typeof i !== "undefined") return i;
        });
        let sorted = uniqueItems.sort((a, b) => {
          return a > b ? 1 : -1;
        });
        let output = "";
        sorted.map((i) => {
          let selectedLoc = i.toLowerCase().includes(defaultClassification.toLowerCase()) ? "selected" : "";
          let buttonArray = defaultClassification.toLowerCase().split(",");
          let displayBlock = "";
          for (let index = 0; index < buttonArray.length; ++index) {
            const element2 = buttonArray[index];
            displayBlock = i.toLowerCase().includes(element2.toLowerCase()) ? "" : "display:none";
            if (displayBlock == "")
              index = buttonArray.length;
          }
          output += `<option value="${i.toLowerCase()}" ${defaultClassification !== "" && defaultClassification ? selectedLoc : ""}>${i}</option>`;
          if (Showclssbtns) {
            $(".consultList-newfilters").append(`<div class="dmWidget clsbtnFilter clsbtnFilterCls" data-value="${i}" data-type="2" style="${displayBlock}"> <span class="text">${i}</span></div>&nbsp;&nbsp;`);
          }
        });
        $(".consultList-newfilters").append(Showclssbtns ? `<br>` : "");
        return output;
      };
      this.businessLocation = (obj) => {
        let alllocation = obj.map((i) => {
          if (i.businessLocation) {
            let alllocation2 = JSON.parse(i.businessLocation);
            return alllocation2.map((j) => {
              return j.LocationName;
            });
          }
        });
        let locationList = alllocation.flat();
        var uniqueItems = Array.from(new Set(locationList)).filter((i) => {
          if (typeof i !== "undefined") return i;
        });
        let sorted = uniqueItems.sort((a, b) => {
          return a > b ? 1 : -1;
        });
        let output = "";
        sorted.map((i) => {
          let selectedLoc = i.toLowerCase().includes(city.toLowerCase()) ? "selected" : "";
          if (city === "") {
            selectedLoc = "";
          }
          let buttonArray = city.toLowerCase().split(",");
          let displayBlock = "";
          for (let index = 0; index < buttonArray.length; ++index) {
            const element2 = buttonArray[index];
            displayBlock = i.toLowerCase().includes(element2.toLowerCase()) ? "" : "display:none";
            if (displayBlock == "")
              index = buttonArray.length;
          }
          output += `<option value="${i.toLowerCase()}" ${selectedLoc}>${i}</option>`;
          if (Showcitybtns) {
            $(".consultList-newfilters").append(`<div class="dmWidget clsbtnFilter clsbtnFilterLoc" data-value="${i}" data-type="3" style="${displayBlock}"> <span class="text">${i}</span></div>&nbsp;&nbsp;`);
          }
          AddbtnListners();
        });
        return output;
      };
      this.jobFilter = (obj) => {
        let output = "";
        obj.map((i) => {
          output += `<option value=""></option>`;
        });
        return output;
      };
    }
    function newslider() {
      $(element).find(".slider-for").slick({
        autoplay,
        infinite,
        dots: false,
        slidesToShow: 1,
        initialSlide: 0,
        centerMode: false,
        arrows: false,
        speed: sliderspeed,
        adaptiveHeight: true,
        asNavFor: "#slidenav",
        responsive: [{
          breakpoint: 800,
          settings: {
            slidesToShow: 1
          }
        }]
      }).on("setPosition", function(event, slick) {
        $(element).find(".slider-for").css("height", slick.$slideTrack.height() + "px");
      });
    }
    function newsliderbottom() {
      $(element).find(".slider-nav").slick({
        autoplay,
        infinite,
        dots: false,
        slidesToShow,
        initialSlide: 0,
        centerMode: false,
        arrows: true,
        speed: sliderspeed,
        prevArrow: '<i class="fas fa-chevron-left btmleftnav slick-prev"></i>',
        nextArrow: '<i class="fas fa-chevron-right btmrightnav slick-next"></i>',
        adaptiveHeight: true,
        asNavFor: "#slidefor",
        responsive: [{
          breakpoint: 800,
          settings: {
            slidesToShow: 1
          }
        }]
      }).on("setPosition", function(event, slick) {
        $(element).find(".slider-nav").css("height", slick.$slideTrack.height() + "px");
      });
      if ($("#slidenav").find(".slick-arrow").length == 0) {
        var style2 = document.createElement("style");
        style2.innerText = "#slidenav .slick-track{transform: translate3d(0px, 0px, 0px)!important;}";
        document.head.appendChild(style2);
      }
      $("a[data-slide]").click(function(e) {
        e.preventDefault();
        var slideno = $(this).data("slide");
        $(".slider-nav").slick("slickGoTo", slideno - 1);
      });
    }
    let main = (w) => {
      let el = $(element);
      if (data.inEditor) {
        shazamme.site().then((s) => {
          el.find(".JSBEditorDiv").html('<span class="vinylbuttonlinl" style="float:right;">To edit the data connected to this widget - PLEASE DOUBLE CLICK HERE</span>');
          el.find(".vinylbuttonlinl").on("click", function() {
            window.open(`${data.config.txt_ShazammeConsole}SiteID=${s.siteID}`);
          });
        });
      }
      shazamme.fetch({ name: collectionName }).then((resp) => {
        tabledata = getData.collection(resp);
        console.log("No Jobs collecton", resp);
        let filter = {
          firstName: SearchKeys,
          businessLocation: city,
          classification: defaultClassification,
          consultantGroupID: defaultConsultantGroupID
        };
        let initialFilter = getData.multifilter(tabledata, filter);
        console.log(getData.checkFilters(tabledata), "Filtered Data check");
        let structure = create.structure(initialFilter);
        let classification = create.classification(tabledata);
        let location = create.businessLocation(tabledata);
        let jobs = create.jobFilter(tabledata);
        el.find("#specSelect").append(classification);
        el.find("#locSelect").append(location);
        let classificationCheckBoxes = create.classificationCheckBoxes(tabledata);
        el.find(".allClassificationChecks").append(classificationCheckBoxes);
        let businessLocationCheckBoxes = create.businessLocationCheckBoxes(tabledata);
        el.find(".allLocationChecks").append(businessLocationCheckBoxes);
        if (itemLayout == "newslider") {
          el.find(".slider-for").html(structure);
          whenSlickReady(function() {
            newslider();
            newsliderbottom();
          });
        } else {
          if (layout == "slider") {
            el.find(".consultList-consultantWrap").html(structure);
            el.find(".consultList-consultant").addClass("consultList-consultantSlider");
            whenSlickReady(function() {
              slider();
              el.find(".consultList-consultant").parent().css("height", "100%");
              watchContent();
            });
          } else {
            el.find(".consultList-consultantWrap").html(structure);
            fluidGrid();
            fluidPortraits();
            watchContent();
          }
          el.find(".consultList-consultantWrap").addClass(justify);
        }
      });
    };
    window.__shazLoadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(
      function() {
        shazamme.ready(data.siteId, data.page).then(() => {
          main(shazamme.register("consultant", data));
        });
      }
    );
  }
  return __toCommonJS(consultant_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["consultant"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
