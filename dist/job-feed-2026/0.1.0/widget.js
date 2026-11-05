/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 251629d4aa46. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/job-feed-2026.index.js
  var job_feed_2026_index_exports = {};
  __export(job_feed_2026_index_exports, {
    default: () => legacyController
  });

  // core/script-loader.ts
  var CANONICAL_SDK_URL = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s2 = document.createElement("script");
      s2.src = src;
      s2.onload = () => resolve();
      s2.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(s2);
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

  // dist/.gen/job-feed-2026.index.js
  function legacyController(ctx) {
    var _a, _b;
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const Path = {
      jobDetails: ((_a = data.config.detailsPage) == null ? void 0 : _a.href) || "/job-details",
      jobApply: ((_b = data.config.applicationPage) == null ? void 0 : _b.href) || "/job-application"
    };
    const Collection = {
      job: {
        name: data.config.JobCollection || "Jobs",
        action: "Get Jobs",
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugJobCollection,
        endpoint: data.config.debugJobCollection
      }
    };
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.dateFormat = Intl.DateTimeFormat(navigator.language, { day: "numeric", month: "numeric", year: "numeric" });
      this.buildHref = (path, query) => {
        const addQuery = (href, q) => {
          let hash = href.indexOf("#");
          let base = hash === -1 ? href : href.slice(0, hash);
          let frag = hash === -1 ? "" : href.slice(hash);
          return `${base}${base.includes("?") ? "&" : "?"}${q}${frag}`;
        };
        if (/^https?:\/\//i.test(path || "")) {
          return query ? addQuery(path, query) : path;
        }
        path = path ? ("/" + path).replace(/^\/+/, "/") : path;
        return data.inEditor ? addQuery(`/site/${data.siteId}${path}`, `preview=true&insitepreview=true&dm_device=desktop${query ? "&" + query : ""}`) : query ? addQuery(`https://${window.location.hostname}${path}`, query) : `https://${window.location.hostname}${path}`;
      };
      this.loadScript = (src) => window.__shazLoadScript(src);
      this.jobElStandard = (j) => {
        let jobDate = /* @__PURE__ */ new Date(j.changedOnUTC + "Z");
        let isNew = jobDate && !isNaN(jobDate.getTime()) && (+/* @__PURE__ */ new Date() - jobDate) / (1e3 * 3600 * 24) <= 1;
        let startDate = new Date(j.jobStartDate || void 0);
        let endDate = new Date(j.jobEndDate || void 0);
        return `
            <ion-grid data-rel="entry-job">
              <div class="container-card" style="${data.config.toggleShowShadow && `box-shadow: 6px 9px 8px ${data.config.overlayShadowColor}` || ""}; ">
                <div class="container-overlay" style="${data.config.toggleShowOverlay && `background: linear-gradient(to bottom, transparent ${data.config.sliderOverlayTransparency}%, ${data.config.gradientColorPick} ${data.config.sliderOverlayBottomColor}%)` || ""}">
                  <div class="container-card-content">
                    <!-- Begin Vertical text row -->
                    <ion-row>
                      <ion-col>
                        <!-- begin vertical text left -->
                        ${data.config.toggleVertTextLeft && `
                        <div class="ion-text-start">
                          <div class="flex-container-vert-text">
                            <div class="flex-items-vert-text-left">
                              <!--begin job posted time-->
                              <div class="flex-container-job-posted">
                                ${data.config.toggleVertLeftNewLabel && !isNaN(isNew) && `

                                <div class="flex-items-job-posted-newlabel-vert">${data.config.newIconLabel || ""}</div>
                                ` || ""}
                                &nbsp;&nbsp;
                                ${data.config.toggleVertLeftJobPosted && jobDate > 0 && `
                                <div class="flex-items-job-posted">${this._timeSince(jobDate)}</div>
                                ` || ""}
                              </div>
                              <!--end job posted time-->
                            </div>
                          </div>
                        </div>
                        <!-- end vertical text left -->
                        ` || ""}
                      </ion-col>
                      <ion-col>
                        <!-- begin vertical text right -->
                        ${data.config.toggleVertTextRight && `
                        <div class="ion-float-right">
                          <div class="flex-items-vert-text-right">
                            <!-- begin worktype and workmodel -->
                            <div class="flex-container-worktype-workmodel">
                              ${data.config.toggleVertWorkType && j.workType && `
                              <div class="flex-items-job-types-worktype">${j.workType || ""}</div>
                              ` || ""}
                              ${data.config.toggleVertRightSeparator && j.workType && j.workModel && `
                              <div class="flex-items-vert-text-separator">&nbsp;&nbsp;${data.config.vertTextRightSeparator}&nbsp;&nbsp;</div>
                              ` || ""}
                              ${data.config.toggleVertWorkModel && j.workModel && `
                              <div class="flex-items-job-types-workmodel">${j.workModel}</div>
                              ` || ""}
                            </div>
                            <!-- end worktype and workmodel -->
                          </div>
                        </div>
                        ` || ""}
                        <!-- end vertical text right -->
                      </ion-col>
                    </ion-row>
                    <!-- End Vertical text row -->

                    <!-- Begin Bottom Section -->

                     <div class="ordering-content">
                      <!-- start new label and posted since date -->
                      ${data.config.toggleNewLabelAndPostedSinceDateBottom && `
                      <ion-row style="order: ${data.config.NewLabelAndPostedDateBottomOrder}">
                        <ion-col>
                          <div class="flex-container-new-label-and-posted-since-date-bottom" style="justify-content: var(--shaz-item-alignment);" >
                            ${data.config.toggleNewLabelBottom && !isNaN(isNew) && `
                            <div class="flex-items-new-label-bottom">${data.config.newIconLabel || ""}</div>
                            ` || ""}
                            ${data.config.togglePostedSinceDateBottom && jobDate > 0 && `
                            <div class="flex-items-jobs-posted-bottom">${this._timeSince(jobDate)}</div>
                            ` || ""}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}


                      <!-- end new label and posted since date -->

                      <ion-row style="order: ${data.config.jobNameOrder}">
                        <!-- begin Job Name -->
                        <ion-col>
                          <div class="flex-container-jobname" style="justify-content: var(--shaz-item-alignment);">
                            <a class="flex-items-jobname-text" style="text-align: var(--shaz-item-alignment);" href="${j.detailsUri}" target="${data.config.jobLinkButtonABlank ? "_blank" : "_self"}"><span class="text">${j.jobName || ""}</span></a>
                          </div>
                        </ion-col>
                      </ion-row>
                      <!-- end job name -->
                      <!-- start job category and subcategory -->
                      ${data.config.toggleCategorySubCategory && `
                      <ion-row style="order: ${data.config.CategorySubCategoryOrder}">
                        <ion-col>
                          <div class="flex-container-job-category-subcategory" style="justify-content: var(--shaz-item-alignment);" >

                           ${data.config.toggleCategoryIcon && `
                            <div class="flex-items-icon-location">
                              <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                            <span class="svg-location-icon">${data.config.svgCategoryIcon}</span>
                            </div>
                            ` || ""}
                            ${data.config.toggleJobCategory && j.category && `
                            <div class="flex-items-job-types-category">${j.category || ""}</div>
                            ` || ""}
                            ${data.config.toggleCategorySubcategorySeparator && j.category && j.subCategory && `
                            <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                            ` || ""}
                            ${data.config.toggleJobSubcategory && j.subCategory && `
                            <div class="flex-items-job-types-subcategory">${j.subCategory || ""}</div>
                            ` || ""}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                      <!-- end job category and subcategory -->

                      <!-- begin hr -->
                      ${data.config.toggleCustomRule && `
                      <ion-row style="order: ${data.config.CustomRuleOrder}">
                        <ion-col>
                          <div class="container-rule" style="align-content: var(--shaz-item-alignment);">
                            <hr class="custom-rule" style="border-style: ${data.config.customRuleStyle}">
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                      <!-- end hr -->

                      <!--begin job location-->
                      ${data.config.toggleLocationAll && `
                      <ion-row style="order: ${data.config.LocationAllOrder}">
                        <ion-col>
                          <div class="flex-container-location" style="justify-content: var(--shaz-item-alignment);">
                            ${data.config.toggleLocationIcon && `
                                <div class="flex-items-icon-location">
                                    <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                                    <span class="svg-location-icon">${data.config.svgLocationIcon}</span>
                                </div>
                            ` || ""}
                            ${data.config.toggleLocationCity && j.city && `
                                <div class="flex-items-location-city">${j.city || ""}</div>
                            ` || ""}
                            ${data.config.toggleLocationCitySeparator && j.city && `
                                <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                            ` || ""}
                            ${data.config.toggleLocationState && j.state && `
                                <div class="flex-items-location-state">${j.state || ""}</div>
                            ` || ""}
                            ${data.config.toggleLocationStateSeparator && (j.state || j.city) && `
                                <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                            ` || ""}
                            ${data.config.toggleLocationCountry && j.country && `
                                <div class="flex-items-location-country">${j.country || ""}</div>
                            ` || ""}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                      <!--end job location-->

                      <!--begin job types-->
                      ${data.config.toggleJobTypesWorkModel && `
                      <ion-row style="order: ${data.config.JobTypesWorkModelOrder}">
                        <ion-col>
                          <div class="flex-container-job-types" style="justify-content: var(--shaz-item-alignment);">

                           ${data.config.toggleJobTypesIcon && `
                                <div class="flex-items-icon-location">
                                    <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                                    <span class="svg-location-icon">${data.config.svgJobTypesIcon}</span>
                                </div>
                            ` || ""}
                            ${data.config.toggleJobType && j.jobType && `
                                <div class="flex-items-job-types-jobtype" style="justify-content: var(--shaz-item-alignment);">${j.jobType || ""}</div>
                            ` || ""}
                            ${data.config.toggleJobTypeSeparator && `
                                <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                            ` || ""}
                            ${data.config.toggleWorkTypeIcon && `
                                <div class="flex-items-icon-location">
                                    <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                                    <span class="svg-location-icon">${data.config.svgWorkTypeIcon}</span>
                                </div>
                            ` || ""}
                            ${data.config.toggleWorkType && j.workType && `
                                <div class="flex-items-job-types-worktype">${j.workType || ""}</div>
                            ` || ""}
                            ${data.config.toggleWorkTypeSeparator && `
                                <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                            ` || ""}
                            ${data.config.toggleWorkModel && j.workModel && `
                                <div class="flex-items-job-types-workmodel">${j.workModel || ""}</div>
                            ` || ""}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                      <!--end job types-->

                      <!--begin job salary-->
                      ${data.config.toggleSalaryAll && `
                      <ion-row style="order: ${data.config.salaryAllOrder}">
                        <ion-col>
                          <div class="flex-container-job-salary" style="justify-content: var(--shaz-item-alignment);">

                            ${data.config.toggleSalaryIcon && `
                                <div class="flex-items-job-salary">
                                    <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                                    <span class="svg-location-icon">${data.config.svgSalaryIcon}</span>
                                </div>
                            ` || ""}<span class="text">
                            ${this._salary(j)}
                            </span>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                      <!--end job salary-->

                         <!-- begin job posted date -->
                     ${data.config.toggleJobPostedDate && j.postedDate && `
                      <ion-row style="order: ${data.config.jobPostedDateOrder}">
                        <ion-col>
                          <div class="flex-container-job-posted-date" style="justify-content: var(--shaz-item-alignment);">

                           ${data.config.toggleJobPostedDateIcon && `
                            <div class="flex-items-icon-location">
                              <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                            <span class="svg-location-icon">${data.config.svgJobPostedDateIcon}</span>
                            </div>
                            ` || ""}

                            <div class="flex-items-job-posted-date">${j.postedDate || ""}</div>

                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                    <!-- end job posted date -->

                     <!-- begin job start and end date -->
                     ${data.config.toggleStartDateEndDate && `
                      <ion-row style="order: ${data.config.startDateEndDateOrder}">
                        <ion-col>
                          <div class="flex-container-job-dates" style="justify-content: var(--shaz-item-alignment);">

                           ${data.config.toggleStartDateIcon && `
                            <div class="flex-items-icon-location">
                              <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                            <span class="svg-location-icon">${data.config.svgStartDateIcon}</span>
                            </div>
                            ` || ""}

                            ${data.config.toggleStartDate && !isNaN(startDate) && `
                            <div class="flex-items-job-startdate">${startDate.toLocaleDateString()}</div>
                            ` || ""}
                                ${data.config.toggleStartDateSeparator && !isNaN(startDate) && `
                                <div class="flex-items-bottom-section-separator">&nbsp;&nbsp;${data.config.bottomSectionSeparator}&nbsp;&nbsp;</div>
                                ` || ""}
                            ${data.config.toggleEndDate && !isNaN(endDate) && `
                            <div class="flex-items-job-enddate">${endDate.toLocaleDateString()}</div>
                            ` || ""}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || ""}
                    <!-- end job start and end date -->

                    <!--begin job short description-->
                    ${data.config.toggleShortDescription && j.shortDescription && `
                      <ion-row style="order: ${data.config.shortDescriptionOrder}">
                        <ion-col>
                          <div class="flex-container-job-short-description" style="justify-content: var(--shaz-item-alignment);">
                            <div class="flex-items-job-short-description" >${j.shortDescription || ""}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                    ` || ""}
                    <!--end job description-->


                    <!--begin job description-->
                    ${data.config.toggleLongDescription && j.fullDescription && `
                      <ion-row style="order: ${data.config.longDescriptionOrder}">
                        <ion-col>
                          <div class="flex-container-job-long-description" style="justify-content: var(--shaz-item-alignment);">
                            <div class="flex-items-job-long-description" >${j.fullDescription || ""}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                    ` || ""}
                    <!--end job description-->

                     <!--begin custom Field 1-->
                    ${data.config.toggleCustomField1 && j.customField1 && `
                      <ion-row style="order: ${data.config.customField1Order}">
                        <ion-col>
                          <div class="flex-container-custom-field-1" style="justify-content: var(--shaz-item-alignment);">
                            <div class="flex-items-custom-field-1" >${j.customField1 || ""}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                    ` || ""}
                    <!--end Custom Field 1-->

                     <!--begin custom Field 2-->
                    ${data.config.toggleCustomField2 && j.customField2 && `
                      <ion-row style="order: ${data.config.customField2Order}">
                        <ion-col>
                          <div class="flex-container-custom-field-2" style="justify-content: var(--shaz-item-alignment);">
                            <div class="flex-items-custom-field-2">${j.customField2 || ""}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                    ` || ""}
                    <!--end Custom Field 2-->

                    <!-- begin job tags -->
                    ${data.config.toggleJobTags && j.tags && `
                      <ion-row style="order: ${data.config.jobTagsOrder}">
                        <ion-col>
                          <div class="flex-container-job-tags" style="justify-content: var(--shaz-item-alignment);">

                           ${data.config.toggleTagsIcon && `
                            <div class="flex-items-icon-location">
                              <!--<i class="fa-solid fa-location-dot">&nbsp;</i>-->
                            <span class="svg-location-icon">${data.config.svgTagsIcon}</span>
                            </div>
                            ` || ""}

                            <div class="flex-items-job-tags" >${j.tags || ""}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                    ` || ""}
                    <!-- end job tags -->


                    </div>
                     </div>

                     ${data.config.togglejobLinkButtonsAll && `
                    <!-- begin button -->
                    <div class="bottom-div">
                      <ion-row style="order: ${data.config.jobLinkButtonOrder}">
                        <ion-col>
                          <div class="flex-container-joblink-buttons" style="justify-content:${data.config.jobLinkButtonsAlignment}; align-items:${data.config.buttonColumnAlignment}; flex-direction:${data.config.buttonFlexDirection}">

                             ${data.config.toggleJobLinkButtonA && `
                              <a href="${j.detailsUri}" target="${data.config.jobLinkButtonABlank ? "_blank" : "_self"}" class="flex-items-joblink-button-A"><span class="text">${data.config.btnTextJobLinkA}</span></a>
                             ` || ""}
                             <div class="flex-items-joblink-button-spacer"></div>
                             ${data.config.toggleJobLinkButtonB && `
                              <a href="${j.applicationURL || ux.buildHref(Path.jobApply, "jobID=" + j.jobID)}" target="${data.config.jobLinkButtonBBlank ? "_blank" : "_self"}" class="flex-items-joblink-button-B"><span class="text">${data.config.btnTextJobLinkB}</span></a>
                             ` || ""}

                          </div>
                        </ion-col>
                      </ion-row>
                    </div>
                    <!-- end button -->
                    ` || ""}

                  </div>
                  <!--End Bottom Section-->

                ${this._jobBg(j)}
              </div>
            </ion-grid>
        `;
      };
      const FLUID_STEPS = [[1320, 4], [1e3, 3], [560, 2]];
      const FLUID_FALLBACK_PER_PAGE = 3;
      this.fluidPerPage = (splideEl) => {
        if (data.config.slideType === "fade") return 1;
        const maxPerPage = parseInt(data.config.slidePerPage) || FLUID_FALLBACK_PER_PAGE;
        const width = $(splideEl).width() || this.el.width();
        if (!width) return maxPerPage;
        const step = FLUID_STEPS.find(([minWidth]) => width >= minWidth);
        return Math.min(maxPerPage, step ? step[1] : 1);
      };
      this.fluidSlides = (slides) => {
        const share = `calc(100% / ${slides.options.perPage || 1})`;
        this.el.find(".splide__slide").each(function() {
          this.style.setProperty("width", share, "important");
          this.style.setProperty("flex", `0 0 ${share}`, "important");
          this.style.setProperty("max-width", share, "important");
        });
        this.growWrapper();
      };
      this.growWrapper = () => {
        const wrapper = this.el.get(0).closest(".widget-wrapper");
        if (!wrapper) return;
        wrapper.style.setProperty("height", "auto", "important");
      };
      this.watchWidth = (slides, splideEl) => {
        var _a2;
        if (typeof ResizeObserver === "undefined") return;
        (_a2 = this.widthObserver) == null ? void 0 : _a2.disconnect();
        this.widthObserver = new ResizeObserver(() => {
          const perPage = this.fluidPerPage(splideEl);
          if (slides.options.perPage !== perPage) {
            slides.options = { perPage };
          } else {
            this.fluidSlides(slides);
          }
        });
        this.widthObserver.observe(splideEl);
      };
      this.loadSlides = () => {
        const sender = this;
        return Promise.all([
          shazamme.script("https://sdk.shazamme.io/js/plugin/splide/v4/js/splide.min.js"),
          shazamme.style("https://sdk.shazamme.io/js/plugin/splide/v4/css/splide.min.css")
        ]).then(() => {
          sender.el.find("[data-rel=content-main]").addClass("splide").children().first().addClass("splide__track").append('<div class="splide__list">');
          sender.el.find("[data-rel=entry-job]").addClass("splide__slide").css({ "flex-basis": "auto" }).detach().appendTo(sender.el.find(".splide__list"));
          if (data.config.showSlideArrows && data.config.slideArrow) {
            sender.el.find("[data-rel=content-main]").prepend(`
                        <div class="splide__arrows">
                            <button class="splide__arrow splide__arrow--prev">
                                ${data.config.slideArrow}
                            </button>
                        </div>
                        <div class="splide__arrows">
                            <button class="splide__arrow splide__arrow--next">
                                ${data.config.slideArrow}
                            </button>
                        </div>
                    `);
          }
          const splideEl = sender.el.find(".splide").get(0);
          let slides = new Splide(splideEl, {
            type: data.config.slideType || "slide",
            direction: data.config.slideDirection || "ltr",
            perPage: sender.fluidPerPage(splideEl),
            autoplay: data.config.slideAutoPlay,
            interval: parseInt(data.config.slideInterval) * 1e3 || 3e3,
            pagination: data.config.slideShowPages,
            fixedHeight: data.config.slideHeight || null,
            fixedWidth: data.config.slideWidth || null,
            arrows: data.config.showSlideArrows === void 0 ? true : data.config.showSlideArrows,
            rewind: !!data.config.loopArrowAtEnds
          });
          slides.on("mounted resized refresh", () => sender.fluidSlides(slides));
          slides.mount();
          sender.fluidSlides(slides);
          sender.watchWidth(slides, splideEl);
          if (!data.config.loopArrowAtEnds) {
            const updateArrowStates = () => {
              const el = sender.el.find(".splide").get(0);
              const prevBtn = el == null ? void 0 : el.querySelector(".splide__arrow--prev");
              const nextBtn = el == null ? void 0 : el.querySelector(".splide__arrow--next");
              const index = slides.index;
              const perPage = slides.options.perPage || 1;
              const total = slides.length;
              const isStart = index <= 0;
              const isEnd = index + perPage >= total;
              if (prevBtn) {
                prevBtn.disabled = isStart;
                prevBtn.classList.toggle("is-disabled-end", isStart);
              }
              if (nextBtn) {
                nextBtn.disabled = isEnd;
                nextBtn.classList.toggle("is-disabled-end", isEnd);
              }
            };
            slides.on("mounted moved refresh", updateArrowStates);
            updateArrowStates();
          }
          return Promise.resolve(slides);
        });
      };
      this.noJobsMessage = () => `
            <div class="message-empty">
                ${data.config.noJobMessage || "No Jobs Available"}
            </div>
        `;
      this._timeSince = (d) => {
        if (!(d > 0)) {
          return null;
        }
        const day = 1e3 * 3600 * 24;
        const hour = 1e3 * 3600;
        const minute = 1e3 * 60;
        let since = +/* @__PURE__ */ new Date() - d;
        let denom = data.config.timeSinceDay || "day";
        let plural = Math.floor(since) > 1;
        if (since / day >= 1) {
          since = since / day;
          denom = plural ? data.config.timeSinceDayPlural || "days" : data.config.timeSinceDay || "day";
        } else if (since / hour >= 1) {
          since = since / hour;
          denom = plural ? data.config.timeSinceHourPlural || "hours" : data.config.timeSinceHour || "hour";
        } else if (since / minute >= 1) {
          since = since / minute;
          denom = plural ? data.config.timeSinceMinutePlural || "minutes" : data.config.timeSinceMinute || "minute";
        } else {
          since = 0;
          denom = data.config.timeSinceNow || "just now";
        }
        return `${since > 0 ? Math.floor(since) : ""} ${denom} ${since > 0 ? data.config.timeSinceAgo || "ago" : ""}`;
      };
      this._jobBg = (j) => {
        let media = "";
        let decoration = "";
        let color = "transparent";
        switch (data.config.customBackground) {
          case "standard-image":
            media = j.customImageURL && `<img src="${j.customImageURL}" loading="lazy" />` || "";
            break;
          case "standard-video":
            media = j.customVideoURL && `<video autoplay playsinline loop oncanplay="this.play();" onloadedmetadata = "this.muted = true" poster="${j.customImageURL || ""}"><source src="${j.customVideoURL}" type="video/mp4" /></video>` || "";
            break;
          case "profession-image":
            media = j.pImageURL && `<img src="${j.pImageURL}" loading="lazy" />` || "";
            break;
          case "profession-video":
            media = j.pVideoURL && `<video autoplay playsinline loop oncanplay="this.play();" onloadedmetadata = "this.muted = true" poster="${j.pImageURL || ""}"><source src="${j.pVideoURL}" type="video/mp4" /></video>` || "";
            break;
          case "profession-color": {
            decoration = "full";
            color = j.pColorCode || "transparent";
            break;
          }
          case "profession-border": {
            decoration = "border";
            color = j.pColorCode || "transparent";
            break;
          }
          case "role-color": {
            decoration = "full";
            color = j.rColorCode || "transparent";
            break;
          }
          case "role-border": {
            decoration = "border";
            color = j.rColorCode || "transparent";
            break;
          }
          case "role-image":
            media = j.rImageURL && `<img src="${j.rImageURL}" loading="lazy" />` || "";
            break;
          case "role-video":
            media = j.rVideoURL && `<video autoplay playsinline loop oncanplay="this.play();" onloadedmetadata = "this.muted = true" poster="${j.rImageURL || ""}"><source src="${j.rVideoURL}" type="video/mp4" /></video>` || "";
            break;
        }
        return `
          <div class="container-card-background ${decoration}" style="--shaz-custom-color: ${color}; --shaz-custom-border-top-width: ${data.config.customBorderTopWidth || 3}px; --shaz-custom-border-left-width: ${data.config.customBorderLeftWidth || 3}px; --shaz-custom-border-bottom-width: ${data.config.customBorderBottomWidth || 3}px; --shaz-custom-border-right-width: ${data.config.customBorderRightWidth || 3}px; --shaz-custom-border-top-left-radius: ${data.config.customBorderTopLeftRadius || 0}px; --shaz-custom-border-top-right-radius: ${data.config.customBorderTopRightRadius || 0}px; --shaz-custom-border-bottom-left-radius: ${data.config.customBorderBottomLeftRadius || 0}px; --shaz-custom-border-bottom-right-radius: ${data.config.customBorderBottomRightRadius || 0}px;">
              ${media}
          </div>
        `;
      };
      this._salary = (j) => {
        if (data.config.useSalaryText) {
          return data.config.salaryText || data.config.noSalaryText || "";
        }
        let currencySymbol = data.config.showSalaryCurrencySymbol && j.currencySymbol || "";
        let currencyCode = data.config.showSalaryCurrencyCode && j.currencyCode || "";
        let showCents = data.config.showCents;
        let fractionDigits = showCents ? 2 : 0;
        let salaryFrom = void 0;
        let salaryTo = void 0;
        let parts = [];
        if (data.config.toggleSalaryGeneral && j.salary) {
          parts.push(j.salary);
        }
        let format = (salary) => !isNaN(salary) && `${currencySymbol}${salary.toLocaleString(void 0, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${currencyCode}`;
        if (j.salaryFrom >= 0) {
          salaryFrom = showCents ? j.salaryFrom : Math.floor(j.salaryFrom);
        }
        if (j.salaryTo >= 0) {
          salaryTo = showCents ? j.salaryTo : Math.floor(j.salaryTo);
        }
        if (data.config.toggleSalaryFromSalaryTo) {
          let range = salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}` : salaryFrom > 0 ? `${format(salaryFrom)}` : salaryTo > 0 ? `${format(salaryTo)}` : "";
          if (range) {
            parts.push(range);
          }
        }
        if (data.config.toggleSalaryType && j.salaryType) {
          parts.push(j.salaryType);
        }
        if (data.config.toggleSalaryText && j.salaryText) {
          parts.push(j.salaryText);
        }
        return parts.length > 0 ? parts.join(" ") : data.config.noSalaryText || "";
      };
    }
    const ux = new UX();
    let main = (w) => {
      var _a2, _b2;
      let slides = null;
      const toPath = (p, d) => {
        if ((p == null ? void 0 : p.type) === "dynamic_page") {
          let seg = p.href.split("/");
          seg.splice(-1, 1);
          return seg.join("/");
        }
        return (p == null ? void 0 : p.href) || d;
      };
      Path.jobDetails = toPath((_a2 = data.config.detailsPage) == null ? void 0 : _a2.href, "/job-details");
      Path.jobApply = toPath((_b2 = data.config.applicationPage) == null ? void 0 : _b2.href, "/job-application");
      Promise.all([
        shazamme.site(),
        activeFilters()
      ]).then((r) => {
        var _a3, _b3;
        s = r[0];
        filters = r[1];
        if (!data.config.useDudaJobCollection) {
          Collection.job = {
            path: `/job-results/${s.siteID}`,
            filter: filters,
            useCache: true,
            isExternal: true
          };
        }
        const reload = () => {
          shazamme.fetch(Collection.job).then((c) => {
            let container = $("<div />");
            let jobs = c.filter((j) => filteredJob(j, filters)).slice(0, parseInt(data.config.jobLimit || "1"));
            let hasJobs = jobs.length > 0;
            if (hasJobs) {
              container.append(
                jobs.map((j) => {
                  return {
                    ...j.data,
                    detailsUri: ux.buildHref(`${Path.jobDetails}/${new URL(j.data.jobURL).pathname.split("/").pop()}`)
                  };
                }).map((j) => {
                  switch (data.config.layout) {
                    case "Layout 1":
                      return ux.jobElStandard(j);
                    default:
                      return ux.jobElStandard(j);
                  }
                })
              ).css({
                "--shaz-item-alignment": data.config.cardBottomAlignment
              });
            } else {
              container.append(ux.noJobsMessage());
            }
            slides == null ? void 0 : slides.destroy();
            ux.el.find("[data-rel=content-main]").empty().append(container);
            if (data.config.useSlides && hasJobs) {
              ux.loadSlides().then((s2) => slides = s2);
            }
          });
        };
        w.sub((_b3 = (_a3 = shazamme.bag("site")) == null ? void 0 : _a3.message) == null ? void 0 : _b3.ready, () => {
          var _a4, _b4, _c, _d;
          const site = shazamme.bag("site-config");
          Path.jobDetails = ((_a4 = site == null ? void 0 : site.configuration) == null ? void 0 : _a4.pathJobDetails) || Path.jobDetails;
          Path.jobApply = ((_b4 = site == null ? void 0 : site.configuration) == null ? void 0 : _b4.pathJobApply) || Path.jobApply;
          if (!data.config.useDudaJobCollection) {
            Collection.job = {
              path: `/job-results/${s.siteID}`,
              useCache: true,
              isExternal: true,
              lang: ((_c = site == null ? void 0 : site.configuration) == null ? void 0 : _c.jobLocalization) && data.locale,
              fieldMap: (_d = site == null ? void 0 : site.configuration) == null ? void 0 : _d.jobFieldMap
            };
            reload();
          }
        });
        reload();
      });
    };
    const activeFilters = () => {
      var _a2, _b2, _c, _d, _e, _f;
      let filters2 = {};
      let add = (filter, value) => {
        if ((value == null ? void 0 : value.length) > 0 && value != "-") {
          filters2[filter] = value.toLowerCase().split(",");
        }
      };
      add("keyword", data.config.filterKeyword);
      add("tags", data.config.filterTag);
      add("professionID", data.config.boundProfessionID);
      add("category", (_a2 = data.config.filterProfession) == null ? void 0 : _a2.toLowerCase());
      add("roleID", data.config.boundRoleID);
      add("subCategory", (_b2 = data.config.filterRole) == null ? void 0 : _b2.toLowerCase());
      add("advertiserID", data.config.filterAdvertiser);
      add("city", data.config.filterCity);
      add("state", data.config.filterState);
      add("country", data.config.filterCountry);
      add("workType", (_c = data.config.filterWorkType) == null ? void 0 : _c.toLowerCase());
      add("workModel", (_d = data.config.filterWorkModel) == null ? void 0 : _d.toLowerCase());
      add("jobType", (_e = data.config.filterJobtype) == null ? void 0 : _e.toLowerCase());
      add("contactEmail", data.config.boundContactEmail);
      add("contactEmail", data.config.boundContactEmail);
      (_f = data.config.filterCustom) == null ? void 0 : _f.forEach((f2) => {
        add(`customField${f2.field}`, f2.filter);
      });
      if (data.config.boundJobID) {
        add("ignoreJobID", data.config.boundJobID);
        return shazamme.site().then(
          (s2) => shazamme.fetch(
            {
              path: `/job-results/${s2.siteID}/${data.config.boundJobID}`,
              useCache: true,
              isExternal: true
            }
          )
        ).then(
          (j) => {
            if (j == null ? void 0 : j.data) {
              if (data.config.bindContactEmail) add("contactEmail", j.data.contactEmail);
              if (data.config.bindProfessionID) add("professionID", j.data.professionID);
              if (data.config.bindRoleID) add("roleID", j.data.roleID);
            }
            return Promise.resolve(filters2);
          },
          () => Promise.resolve(filters2)
        );
      }
      return Promise.resolve(filters2);
    };
    const filteredJob = (j, filters2) => {
      var _a2;
      let ok = true;
      let isMatch = (v, f2) => {
        if (typeof v !== "string") {
          return false;
        }
        return filters2[f2].find((i) => v.toLowerCase().includes(i.trim())) !== void 0;
      };
      let isAnyValue = (v, f2) => {
        if (typeof v !== "string") {
          return false;
        }
        let values = v.toLowerCase().split(",").map((s2) => s2.trim());
        return filters2[f2].find((i) => values.includes(i.trim())) !== void 0;
      };
      for (f in filters2) {
        switch (f) {
          case "keyword": {
            ok = ok && (isMatch(j.data.jobName, f) || isMatch(j.data.category, f) || isMatch(j.data.subCategory, f) || isMatch(j.data.fullDescription, f));
            break;
          }
          case "tags":
            ok = ok && isMatch(j.data.tags, f);
            break;
          case "ignoreJobID": {
            ok = ok && !isMatch(j.data.jobID, f);
            break;
          }
          default: {
            if (f.startsWith("customField")) {
              ok = ok && (filters2[f].length === 0 || isAnyValue(j.data[f], f));
            } else {
              ok = ok && (filters2[f].length === 0 || filters2[f].indexOf((_a2 = j.data[f]) == null ? void 0 : _a2.toLowerCase()) >= 0);
            }
            break;
          }
        }
      }
      return ok;
    };
    ux.el.addClass("job-feed").css({
      height: "100ch",
      overflow: "auto"
    });
    Promise.all([
      ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(() => shazamme.ready(data.inEditor && data.config.debugSiteID || data.siteId, data.page)),
      //shazamme.script('https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js'),
      ux.loadScript("https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js")
      // Ionic CSS turned off due to page scrolling conflict in Duda
      // shazamme.style('https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css'),
    ]).then(() => {
      main(shazamme.register("job-feed-modern", data));
    });
  }
  return __toCommonJS(job_feed_2026_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-feed-2026"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
