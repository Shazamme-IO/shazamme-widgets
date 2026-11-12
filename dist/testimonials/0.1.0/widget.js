/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 37d54e3287de. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/testimonials.index.js
  var testimonials_index_exports = {};
  __export(testimonials_index_exports, {
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

  // dist/.gen/testimonials.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    let btnDotLayout = data.config.btnDotLayout;
    let DescriptionLength = data.config.DescriptionLength;
    let testimonialCollection = "Testimonials";
    let layout = data.config.testimonialLayout;
    let showAllTestimonials = data.config.showAllTestimonials;
    let noTestimonialShow = data.config.noTestimonialShow;
    let enableShadow = data.config.enableShadow;
    let noTestimonial = data.config.noTestimonial;
    let consultantID = data.config.consultantID;
    let pageSize = parseInt(data.config.pageSize);
    let testimonialNumber = parseInt(data.config.testimonialNumber);
    let showConsultantFilter = layout == "list" ? data.config.showConsultantFilter : false;
    let showJobsFilter = layout == "list" ? data.config.showJobsFilter : false;
    let showImage = data.config.showImage ? "block" : "none";
    let consultantCollection = "Consultants";
    let jobsCollection = "Jobs";
    let consultantPage = "consultants";
    let consultantDetailsPage = "consultant";
    let slidesToShow = data.device == "mobile" ? 1 : data.config.slidesToShow;
    let infinite = data.config.infinite;
    let arrows = data.device == "mobile" ? true : data.config.arrows;
    let autoplay = data.config.autoplay;
    let dotsPagination = data.device == "mobile" ? false : data.config.dotsPagination;
    let selectedTags = data.config.tags;
    let limitTestimonials = data.config.limitTestimonials;
    let maxTestimonials = parseInt(data.config.maxTestimonials) || 15;
    let ReadMoreOpenmodal = document.getElementById("ReadMoremyModal");
    let ReadMoremodalbtn = document.getElementById("ReadMoremyBtn");
    let ReadMoreClosespan = document.getElementsByClassName("ReadMoreclose")[0];
    let clsReadmoreDesc = $(element).find(".clsReadmoreDesc");
    var clsRDMRDECSID = $(element).find("#clsRDMRDECSID");
    let ConsultantArray = [];
    let getData = new Getdata();
    let create = new Create();
    let importData = {};
    let SLiderShadoeEnable = "ShowSliderShadow";
    if (!data.config.toggleEnableShadow) {
      SLiderShadoeEnable = "";
    }
    let ButtonLayout = "slideTwo-dots";
    if (btnDotLayout === "lines") {
      ButtonLayout = "slideTwo-dots";
    } else if (btnDotLayout === "dots") {
      ButtonLayout = "slideTwo-dotsl2";
    } else if (btnDotLayout === "squares") {
      ButtonLayout = "slideTwo-dotsl3";
    }
    let siteId = data.config.siteId && data.config.siteId !== "" ? data.config.siteId : data.siteId;
    let adaptive = data.device == "mobile" ? true : data.config.adaptive;
    let imgPos = data.config.imgPos;
    let showDate = data.config.showDate;
    function pagination(obj) {
      let limitarr;
      if (typeof obj !== "undefined") {
        let filterTags = obj.filter((i) => {
          return selectedTags.split(",").some((j) => {
            if (!i.tags) return false;
            return i.tags.toLowerCase().includes(j.toLowerCase());
          });
        });
        if (showAllTestimonials) {
          limitarr = obj;
        } else {
          limitarr = filterTags.filter((val, ind) => {
            let objNum = ind + 1;
            if (objNum <= testimonialNumber) return val;
          });
        }
      }
      if (!limitarr) {
        limitarr = [];
      }
      $(element).find(".shmTestimonialPanelMain").pagination({
        dataSource: limitarr,
        pageSize,
        callback: function(data2, pagination2) {
          if (data2.length == 0) {
            if (!noTestimonialShow) {
              $(element).find(".shmTestimonialPanelMain").addClass("shmTestimonialPanelMainHide");
            }
          }
          let createProperties = data2.length !== 0 ? create.structure(data2) : `${noTestimonial}`;
          $(element).find(".shmHoriTest").html(createProperties);
          data2.length % 3 != 2 ? null : $(element).find(".shmHoriTest").append(`<div class="shmHoriTest-wrap testiFiller"></div>`);
          if (!showAllTestimonials) {
            obj.length <= pageSize || testimonialNumber <= pageSize ? $(element).find(".paginationjs").hide() : "";
          }
        }
      });
    }
    var FLUID_MIN_CARD = 470;
    var FLUID_SINGLE_CARD_MAX = 720;
    var FLUID_GAP = 20;
    var FLUID_FALLBACK_COLUMNS = 2;
    function fluidColumns() {
      var maxColumns = parseInt(data.config.slidesToShow) > 0 ? parseInt(data.config.slidesToShow) : FLUID_FALLBACK_COLUMNS;
      var width = $(element).width();
      if (!width) return maxColumns;
      return Math.max(1, Math.min(maxColumns, Math.floor(width / FLUID_MIN_CARD)));
    }
    function setImportant(el, props) {
      Object.keys(props).forEach(function(name) {
        el.style.setProperty(name, props[name], "important");
      });
    }
    function fluidSlides(slick) {
      var gap = FLUID_GAP;
      var single = slick.options.slidesToShow === 1;
      var slot = slick.slideWidth;
      var cardWidth = Math.max(0, Math.min(slot - gap, single ? FLUID_SINGLE_CARD_MAX : slot - gap));
      var side = Math.max(0, Math.floor((slot - cardWidth) / 2));
      slick.$slideTrack.children(".slick-slide").each(function() {
        setImportant(this, { "width": slot + "px", "max-width": "none", "margin-left": "0", "margin-right": "0", "padding-left": side + "px", "padding-right": side + "px", "box-sizing": "border-box", "height": "auto", "display": "flex", "align-items": "flex-start" });
        var card = this.querySelector(".shmTestimonial-comments");
        if (!card) return;
        for (var holder = card.parentElement; holder && holder !== this; holder = holder.parentElement) {
          setImportant(holder, { "width": "100%", "padding-left": "0", "padding-right": "0", "margin-left": "0", "margin-right": "0", "box-sizing": "border-box", "display": "flex" });
        }
        setImportant(card, { "width": "100%", "max-width": "none", "margin-left": "0", "margin-right": "0", "display": "block", "box-sizing": "border-box", "min-height": "0", "height": "auto" });
      });
    }
    function wrapCards(slider2) {
      slider2.children(".shmTestimonial-comments").each(function() {
        $(this).wrap('<div class="shm-slide"></div>');
      });
    }
    function fitHeights(slick, first) {
      var visible = slick.options.slidesToShow;
      var cards = slick.$slideTrack.find(".shmTestimonial-comments");
      cards.each(function() {
        setImportant(this, { "min-height": "0" });
      });
      var tallest = 0;
      for (var i = first; i < first + visible; i++) {
        var card = slick.$slideTrack.children('[data-slick-index="' + i + '"]').find(".shmTestimonial-comments")[0];
        if (card) tallest = Math.max(tallest, Math.ceil(card.getBoundingClientRect().height));
      }
      if (!tallest) return;
      cards.each(function() {
        setImportant(this, { "min-height": tallest + "px" });
      });
      var list = slick.$list[0];
      var listStyle = getComputedStyle(list);
      var listPadding = parseFloat(listStyle.paddingTop) + parseFloat(listStyle.paddingBottom);
      setImportant(list, { "height": tallest + listPadding + "px" });
    }
    var DOTS_STYLE_ID = "shm-testimonials-dots-style";
    var DOTS_STYLE = [
      '.shmTestimonial ul[class^="slideTwo-dots"] li button{position:relative!important;display:inline-block!important;width:24px!important;height:24px!important;min-width:24px!important;padding:0!important;border:0!important;background:transparent!important;overflow:hidden!important;cursor:pointer}',
      // The shape is all border and padding round a 0x0 content box, and the background is
      // clipped to that content box: a Design tab background colour on the old glyph box can no
      // longer paint anything. The fill is an inset shadow, which paints over the padding.
      '.shmTestimonial ul[class^="slideTwo-dots"] li button::before{content:""!important;position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;box-sizing:content-box!important;width:0!important;height:0!important;padding:.2em!important;line-height:0!important;text-indent:0!important;border:2px solid currentColor!important;border-radius:0!important;background-clip:content-box!important;opacity:1}',
      ".shmTestimonial ul.slideTwo-dotsl2 li button::before{border-radius:50%!important}",
      ".shmTestimonial ul.slideTwo-dots li button::before{padding:.06em .4em!important;border:0!important;box-shadow:inset 0 0 0 1em currentColor!important;opacity:.35}",
      '.shmTestimonial ul[class^="slideTwo-dots"] li.slick-active button::before{box-shadow:inset 0 0 0 1em currentColor!important;opacity:1}',
      '.shmTestimonial ul[class^="slideTwo-dots"] li button:focus-visible{outline:2px solid currentColor!important;outline-offset:2px!important}'
    ].join("");
    function ensureDotsStyle() {
      var head2 = document.head || document.getElementsByTagName("head")[0];
      if (!head2 || document.getElementById(DOTS_STYLE_ID)) return;
      var style = document.createElement("style");
      style.id = DOTS_STYLE_ID;
      style.textContent = DOTS_STYLE;
      head2.appendChild(style);
    }
    function growWrapper() {
      var wrapper = element.closest ? element.closest(".widget-wrapper") : null;
      if (!wrapper) return;
      wrapper.style.setProperty("height", "auto", "important");
      wrapper.style.setProperty("min-height", "0px", "important");
      var panel = element.querySelector(".shmTestimonialPanelMain") || element;
      var contentHeight = panel.getBoundingClientRect().bottom - element.getBoundingClientRect().top;
      wrapper.style.setProperty("min-height", Math.ceil(contentHeight) + "px", "important");
    }
    function slider() {
      ensureDotsStyle();
      wrapCards($(element).find(".shmTestimonial"));
      $(element).find(".shmTestimonial").addClass("shm-fluid-slider main-review-slider-container").slick({
        dots: dotsPagination,
        dotsClass: ButtonLayout,
        slidesToShow: fluidColumns(),
        speed: parseFloat(data.config.ScrollSpeed) * 1e3,
        pauseOnHover: data.config.PauseOnHover,
        centerMode: false,
        infinite,
        arrows,
        adaptiveHeight: adaptive,
        autoplay,
        prevArrow: '<i class="fas fa-chevron-left slick-prev"></i>',
        nextArrow: '<i class="fas fa-chevron-right slick-next"></i>'
      }).on("beforeChange", function(event, slick, current, next) {
        if (!adaptive) fitHeights(slick, next);
        growWrapper();
      }).on("setPosition", function(event, slick) {
        fluidSlides(slick);
        setImportant(slick.$slideTrack[0], { "display": "flex", "align-items": "flex-start" });
        if (!adaptive) {
          fitHeights(slick, slick.currentSlide);
        } else {
          let newHeight = [];
          $(element).find(".slick-active>div").each(function() {
            newHeight.push($(this).outerHeight());
          });
          slick.$list.css("height", $(element).find(".slick-current>div").outerHeight() + "px");
        }
        growWrapper();
      });
      $(element).find(".shmTestimonial-comments").addClass("shmTestimonial-commentsSlider");
      watchSlider();
    }
    function settleSlider(track) {
      var slick = track.slick("getSlick");
      slick.disableTransition();
      slick.animating = false;
      track.slick("slickGoTo", slick.currentSlide, true);
      track.slick("setPosition");
    }
    var REFIT_SETTLE_MS = 400;
    var refitTimer;
    function refitSlider() {
      var track = $(element).find(".shmTestimonial");
      if (!track.hasClass("slick-initialized")) return;
      if (autoplay) track.slick("slickPause");
      var columns = fluidColumns();
      if (track.slick("slickGetOption", "slidesToShow") !== columns) {
        track.slick("slickSetOption", "slidesToShow", columns, true);
      } else {
        track.slick("setPosition");
      }
      settleSlider(track);
      clearTimeout(refitTimer);
      refitTimer = setTimeout(function() {
        settleSlider(track);
        if (autoplay) track.slick("slickPlay");
      }, REFIT_SETTLE_MS);
    }
    if (typeof ResizeObserver !== "undefined") {
      if (element.__shmTestimonialsObserver) element.__shmTestimonialsObserver.disconnect();
      element.__shmTestimonialsObserver = new ResizeObserver(function() {
        refitSlider();
      });
      element.__shmTestimonialsObserver.observe(element);
    }
    var LATE_REFIT_MS = 800;
    function watchSlider() {
      $(element).find(".shmTestimonial").each(function() {
        if (typeof ResizeObserver !== "undefined" && element.__shmTestimonialsObserver) element.__shmTestimonialsObserver.observe(this);
      });
      setTimeout(refitSlider, LATE_REFIT_MS);
    }
    let ReadMoreArray = [];
    function Create() {
      this.structure = (obj) => {
        let output = "";
        let dateFormatter = Intl.DateTimeFormat(navigator.language, { day: "numeric", month: "numeric", year: "numeric" });
        obj.map((i) => {
          let image = i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder-male.png";
          let content = i.content ? i.content : "";
          let who = i.who ? i.who : "Anonymous";
          let date = new Date(i.testimonialDate || void 0);
          let ddate = isNaN(date.getTime()) ? "" : dateFormatter.format(date);
          let description = i.content ? i.content : "";
          let PresentConsultant = i.consultantID ? i.consultantID : "";
          let castShortDescription = description;
          let ReadMoreHTML = "";
          if (DescriptionLength < castShortDescription.length) {
            ReadMoreHTML = '<div class="clsReadMoreTest" id="readmoretesti' + ReadMoreArray.length + '">Read more</div>';
            ReadMoreArray.push(castShortDescription);
            var yourString = castShortDescription;
            var maxLength = DescriptionLength;
            var trimmedString = removehtmlfromstring(yourString).substr(0, maxLength);
            trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
            castShortDescription = escapeHtmlText(trimmedString) + "...";
          }
          let ConsultantImage = "";
          let ConsultantName = "";
          var ConsultArrays = ConsultantArray;
          ConsultArrays = ConsultArrays.filter(function(value, index, arr) {
            return value.data.consultantID === PresentConsultant;
          });
          if (ConsultArrays.length > 0) {
            if (ConsultArrays[0].data.photoURL !== "" && ConsultArrays[0].data.photoURL !== null && ConsultArrays[0].data.photoURL !== void 0)
              ConsultantImage = '<img class="imgTestConsultant" src="' + ConsultArrays[0].data.photoURL + '" style="object-fit:cover;width: 70px;height: 70px;border-radius: 50px;"/>';
            ConsultantName = '<div class="clsTestConsultant">' + ConsultArrays[0].data.firstName + " " + ConsultArrays[0].data.lastName + "</div>";
          }
          let testimonialName = i.testimonialName ? i.testimonialName : "";
          var QuoteImageString = '<img class="clsQuoteImage" src="' + data.config.QuoteImage + '" style="top:-5%;left:5%;position:absolute;width:50px;height:50px;" />';
          if (data.config.QuoteImage === "" || data.config.QuoteImage === null || data.config.QuoteImage === void 0)
            QuoteImageString = "";
          let ConsultantString = "";
          if (data.config.toggleShowConsultant) {
            ConsultantString += `
                <div class="clsTestConsultant" style="display:flex;">
                    <div class="clsImgTestConsultantDIV" style="width:30%;">
                        ${ConsultantImage}
                    </div>
                    <div class="clsNameTestConsultantDIV" style="width:70%;margin:auto;text-align:center;">
                        ${ConsultantName}
                    </div>
                </div>`;
          }
          let PositionString = "";
          if (data.config.toggleShowPosition && i.position && i.position.length > 0) {
            PositionString += `
                <div class="clsTestPosition" style="display:flex;">
                    <div class="clsNameTestPositionDIV" style="width:70%;margin:auto;text-align:center;">
                        ${i.position}
                    </div>
                </div>`;
          }
          let CompanyString = "";
          if (data.config.toggleShowCompany && i.company && i.company.length > 0) {
            CompanyString += `
                <div class="clsTestCompany" style="display:flex;">
                    <div class="clsNameTestCompanyDIV" style="width:70%;margin:auto;text-align:center;">
                        ${i.company}
                    </div>
                </div>`;
          }
          if (layout !== "list") {
            output += `
                    <div class="shmTestimonial-comments ${SLiderShadoeEnable}" style="position:relative;">
                        ${QuoteImageString}
                        <div class="shmTestimonial-userDetail">
                            <div class="shmTestimonial-userImg shmTestimonial-Image-${imgPos}" style='background-image:url("${image}");display:${showImage}'>
                                <img src="${image}" alt="${testimonialName}">
                            </div>
                            <div class="shmTestimonial-userName">${who}</div>
                            <div class="shmTestimonial-date shmTestimonial-date${showDate}">${ddate}</div>
                            ${PositionString}
                            ${CompanyString}
                        </div>
                        <div class="shmTestimonial-userComment">
                            <div class="shmTestimonial-userTestimonial">
                                <p>
                                    <span class="shmTestimonial-content">${castShortDescription}</span>
                                    ${ReadMoreHTML}
                                </p>
                                ${ConsultantString}
                            </div>
                        </div>
                    </div>`;
          } else {
            output += `
                    <div class="shmHoriTest-wrap ${enableShadow ? "" : "shmHoriTest-wrap-noShadow"}" style="position:relative;">
                        ${QuoteImageString}
                        <div class="shmHoriTest-image shmTestimonial-Image-${imgPos}" style='background-image:url("${image}");display:${showImage}'>
                            <img src="${image}" alt="${testimonialName}">
                            ${PositionString}
                            ${CompanyString}
                        </div>
                        <div class="shmHoriTest-details">
                            <div class="shmHoriTest-content">
                                <p>
                                   <span class="shmTestimonial-content"> ${castShortDescription}</span>
                                   ${ReadMoreHTML}
                                </p>
                                ${ConsultantString}
                            </div>
                            <div class="shmHoriTest-date shmHoriTest-date${showDate}">${ddate}</div>
                            <div class="shmHoriTest-name">${who}</div>
                        </div>
                    </div>`;
          }
        });
        if (layout !== "list" && output == "") {
          if (noTestimonialShow) {
            output = noTestimonial;
          } else {
            output = "";
          }
        }
        return output;
      };
      this.filterStructure = (obj, key) => {
        let output = "";
        obj.map((i) => {
          if (!i[key] || typeof i[key] === "undefined") return;
          let textValue = key == "category" ? i[key] : `${i.firstName} ${i.lastName}`;
          output += `
                <option value="${key == "category" ? i.jobID : i[key]}">${textValue}</option>
            `;
        });
        return output;
      };
    }
    function Getdata() {
      this.collection = (collection) => {
        return collection.map((i) => {
          let item = {};
          item.page_item_url = consultantPage + "/" + i.page_item_url;
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
      this.multifilter = (arr, filters) => {
        const filterKeys = Object.keys(filters);
        return arr.filter(function(eachObj) {
          return filterKeys.every(function(eachKey) {
            if (!filters[eachKey].length) {
              return true;
            }
            return filters[eachKey].includes(eachObj[eachKey]);
          });
        });
      };
      this.urlparam = (name, url) => {
        if (!url) url = window.location.href;
        name = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
      };
      this.removeExtra = (str) => {
        let fullText = "";
        if (typeof str !== "undefined") {
          if (!isNaN(str) || !str.includes("</p>")) {
            fullText = str;
          } else {
            fullText = str.substring(str.indexOf(">") + 1).replace("</p>", "");
          }
        }
        return fullText;
      };
      this.salary = (obj) => {
        let min = $(element).find(".shmFilterSalaryMin input[type=number]").val();
        let max = $(element).find(".shmFilterSalaryMax input[type=number]").val();
        if (max <= 0) {
          return obj;
        } else {
          return obj.filter((i) => {
            return i.salaryFrom >= min && i.salaryFrom <= max || i.salaryTo >= min && i.salaryTo <= max;
          });
        }
      };
      function removeSpecial(str) {
        let pattern = str.replace(/[^A-Z0-9]/ig, ``);
        return pattern;
      }
    }
    function loadScript(d, s, id, url, callback) {
      if (d.getElementById(id)) {
        callback();
        return;
      }
      var fjs = d.getElementsByTagName(s)[0];
      var script = d.createElement(s);
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
    }
    if (!document.getElementById("fontAwesomeSource")) {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.id = "fontAwesomeSource";
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://use.fontawesome.com/releases/v5.5.0/css/all.css";
      link.integrity = "sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU";
      link.crossOrigin = "anonymous";
      head.appendChild(link);
    }
    if (!document.getElementById("paginationCss")) {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.id = "paginationCss";
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/paginationjs/2.1.4/pagination.css";
      link.crossOrigin = "anonymous";
      head.appendChild(link);
    }
    if (ReadMoreClosespan) {
      ReadMoreClosespan.onclick = function() {
        ReadMoreOpenmodal.style.display = "none";
      };
    }
    function OpenModel() {
      ReadMoreOpenmodal.style.display = "block";
    }
    function escapeHtmlText(text) {
      return String(text).replace(/[&<>"']/g, function(c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function removehtmlfromstring(stringhtml) {
      var html = stringhtml;
      var div = document.createElement("div");
      div.innerHTML = html;
      var text = div.textContent || div.innerText || "";
      return text;
    }
    if (layout == "slider") {
      loadScript(document, "script", "slickJS", "https://irt-cdn.multiscreensite.com/5775367238d847b8b62d126ce25c20de/files/uploaded/slick-latest.js", function() {
      });
    } else {
      loadScript(document, "script", "paginationJS", "https://irt-cdn.multiscreensite.com/8914113fe39e47bcb3040f2b64f71b02/files/uploaded/paginates.min.js", function() {
      });
    }
    let main = (w) => {
      if (data.inEditor) {
        shazamme.site().then((s) => {
          $(element).find(".JSBEditorDiv").html(`
                    <span class="vinylbuttonlinl" style="float:right;">
                        To edit the data connected to this widget - PLEASE DOUBLE CLICK HERE
                    </span>
                `).on("click", ".vinylbuttonlinl", function() {
            window.open(`${data.config.txt_ShazammeConsole}SiteID=${s.siteID}`);
          });
        });
      }
      let fetchPromises = [
        shazamme.fetch({ name: consultantCollection }),
        shazamme.fetch({ name: testimonialCollection })
      ];
      if (showJobsFilter) {
        fetchPromises.push(shazamme.site().then(
          (s) => shazamme.fetch({
            path: `/job-results/${s.siteID}`,
            useCache: true,
            isExternal: true
          })
        ));
      }
      Promise.all(fetchPromises).then((r) => {
        importData.consultants = ConsultantArray = r[0];
        let resp = getData.collection(r[1]).filter((i) => consultantID !== "" && consultantID ? i.consultantID == consultantID : i).sort((a, b) => new Date(a.testimonialDate) > new Date(b.testimonialDate) ? -1 : new Date(a.testimonialDate) < new Date(b.testimonialDate) ? 1 : 0);
        if (limitTestimonials) {
          resp = resp.slice(0, maxTestimonials);
        }
        if (showConsultantFilter) {
          let consultantArr = getData.removeduplicate(importData.consultants, "consultantID");
          let consultantFilter = create.filterStructure(consultantArr, "consultantID");
          $(element).find(".shmTestimonialFilterConsultant").html(`<option value="">All Consultants</option>${consultantFilter}`);
        }
        if (showJobsFilter && r[2]) {
          importData.jobs = getData.collection(r[2]);
          let jobsArr = getData.removeduplicate(importData.jobs, "category");
          let jobsFilter = create.filterStructure(jobsArr, "category");
          $(element).find(".shmTestimonialFilterJobs").html(`<option value="">All Jobs</option>${jobsFilter}`);
        }
        if (consultantID) {
          $(element).find(".shmTestimonialFilterJobs,.shmTestimonialFilterConsultant").hide();
        }
        if (layout !== "slider") {
          pagination(resp);
        } else {
          let initSlider2 = function() {
            if (typeof $.fn.slick !== "undefined") {
              if (!sliderStructure.includes("testimonials yet")) {
                slider();
              }
              let clsReadMoreTest = $(element).find(".clsReadMoreTest");
              clsReadMoreTest.click(function() {
                var ClickedID = $(this).attr("id").replace("readmoretesti", "");
                var FullDescription = ReadMoreArray[ClickedID];
                OpenModel();
                clsRDMRDECSID.html("");
                clsRDMRDECSID.html(FullDescription);
              });
            } else {
              setTimeout(initSlider2, 50);
            }
          };
          var initSlider = initSlider2;
          if (adaptive) {
            $(element).find(".shmTestimonialPanel").addClass("shmTestimonialPanelAdaptive");
          }
          let filterTags = resp.filter((i) => {
            return selectedTags.split(",").some((j) => {
              if (!i.tags) return false;
              return i.tags.toLowerCase().includes(j.toLowerCase());
            });
          });
          let testimonials = showAllTestimonials ? resp : filterTags;
          let sliderStructure = create.structure(testimonials);
          if (sliderStructure == "") {
            $(element).find(".shmTestimonialPanelMain").addClass("shmTestimonialPanelMainHide");
            return;
          }
          $(element).find(".shmTestimonial").html(sliderStructure);
          initSlider2();
        }
        importData.testimonials = resp;
      });
      $(element).find(".shmTestimonialFilterConsultant").change(function() {
        let value = $(this).val();
        let jobVal = showJobsFilter ? $(element).find(".shmTestimonialFilterJobs").val() : "";
        let filter = {
          consultantID: value,
          jobID: jobVal
        };
        let filtered = getData.multifilter(importData.testimonials, filter);
        pagination(filtered);
      });
      $(element).find(".shmTestimonialFilterJobs").change(function() {
        let value = $(this).val();
        let consultantVal = showConsultantFilter ? $(element).find(".shmTestimonialFilterConsultant").val() : "";
        let filter = {
          consultantID: consultantVal,
          jobID: value
        };
        let filtered = getData.multifilter(importData.testimonials, filter);
        pagination(filtered);
      });
    };
    window.__shazLoadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(
      function() {
        shazamme.ready(data.siteId, data.page).then(() => {
          main(shazamme.register("testimonials", data));
        });
      }
    );
  }
  return __toCommonJS(testimonials_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["testimonials"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
