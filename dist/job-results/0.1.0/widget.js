/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-08-28T07:31:23.270Z. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/job-results.index.js
  var job_results_index_exports = {};
  __export(job_results_index_exports, {
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

  // dist/.gen/job-results.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const ActionUrl = "https://shazamme.io/Job-Listing/src/php/actions";
    const Path = {
      login: "/login",
      alerts: "/job-alerts",
      dashboard: "/dashboard",
      jobApply: data.config.applicationPage || "/job-application",
      jobDetails: data.config.detailsPage || "/job-details"
    };
    const Collection = {
      job: {
        name: data.config.JobCollection || "Jobs",
        action: "Get Jobs",
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugJobCollection,
        endpoint: data.config.debugJobCollection
      },
      locationSeo: {
        name: data.config.LocationSeoCollection || "Location SEO",
        action: "Get Location SEO",
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugLocationSeoCollection,
        endpoint: data.config.debugLocationSeoCollection
      },
      workModel: {
        name: data.config.WorkModelCollection || "Work Model",
        action: "Get Work Models",
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugWorkModelCollection,
        endpoint: data.config.debugWorkModelCollection
      }
    };
    const LocalStorage = {
      lastSearch: "lastSearch"
    };
    const Subscribe = {
      auth: "site-auth",
      loginCancel: "login-dialog-cancel",
      loginSubmit: "login-dialog-submit",
      loginReady: "login-dialog-ready",
      siteReady: "site-config-ready"
    };
    const Message = {
      loginShow: "login-dialog-show",
      saveJob: "job-results-save-job"
    };
    function ShApi() {
      let allFilter = {};
      this.ready = () => Promise.all([
        shazamme.fetch(Collection.workModel).then((wm) => {
          var _a;
          if (wm) {
            allFilter.workModelID = (_a = wm == null ? void 0 : wm.filter((i) => i.data.includeInAllSearches)) == null ? void 0 : _a.map((i) => i.data.workModelID);
          }
          return Promise.resolve();
        }).catch(() => Promise.resolve())
      ]);
      this.getJobs = (pageNumber, pageSize, filters = {}, sort = {
        field: "changedOnUTC",
        direction: "desc"
      }) => new Promise((resolve, reject) => {
        shazamme.fetch(Collection.job).then((jobs) => {
          let filtered = [];
          if (data.config.catchAllFilter && data.config.catchAllProfession) {
            jobs.filter((j) => {
              var _a;
              return ((_a = j.data.roleID) == null ? void 0 : _a.length) > 0 && !j.data.professionID;
            }).forEach((j) => {
              j.data.category = data.config.catchAllProfession;
              j.data.professionID = data.config.professionCatchAll;
              j.data.professionSeo = data.config.catchAllProfessionSeo;
              j.data.professionCatchAll = true;
            });
          }
          if (data.config.catchAllFilter && data.config.catchAllState) {
            jobs.filter((j) => {
              var _a;
              return ((_a = j.data.city) == null ? void 0 : _a.length) > 0 && !j.data.state;
            }).forEach((j) => {
              j.data.state = data.config.catchAllState;
              j.data.stateCatchAll = true;
            });
          }
          if (filters) {
            filtered = jobs.filter((j) => {
              let ok = true;
              let isMatch = (v) => {
                if (typeof v !== "string") {
                  return false;
                }
                v = v.toLowerCase();
                for (let i = 0; i < filters[f].length; i++) {
                  if (v.includes(filters[f][i].toLowerCase().trim())) {
                    return true;
                  }
                }
                return false;
              };
              for (f in filters) {
                switch (f) {
                  case "salaryFrom":
                    ok = ok && j.data[f] >= filters[f][0];
                    break;
                  case "salaryTo":
                    ok = ok && j.data[f] <= filters[f][0];
                    break;
                  case "keyword": {
                    ok = ok && (data.config.toggleCategory === true && isMatch(j.data.category) || data.config.toggleSubCategory === true && isMatch(j.data.subCategory) || data.config.toggleContact === true && isMatch(j.data.contactName) || isMatch(j.data.contactEmail) || isMatch(j.data.contactPhone) || data.config.toggleLocation === true && (isMatch(j.data.location) || isMatch(j.data.fullAddressForSearch)) || data.config.toggleArea === true && isMatch(j.data.city) || data.config.toggleCountry === true && isMatch(j.data.country) || data.config.toggleFD === true && isMatch(j.data.fullDescription) || data.config.toggleRefNo === true && isMatch(j.data.referenceNumber) || isMatch(j.data.jobName) || isMatch(j.data.tags));
                    break;
                  }
                  case "location": {
                    ok = ok && (isMatch(j.data.fullAddress) || isMatch(j.data.fullAddressForSearch));
                    break;
                  }
                  case "geo": {
                    let p = { lat: parseFloat(j.data.latitude), lon: parseFloat(j.data.longitude) };
                    let range = filters["geoRange"][0] * 1.61;
                    let include = false;
                    for (let i in allFilter) {
                      include = include || allFilter[i].indexOf(j.data[i]) >= 0;
                    }
                    ok = ok && (include || p.lat && p.lon && this._distance(filters[f][0], p, parseInt(data.config.proximityDiameter || "6371")) <= range);
                    break;
                  }
                  case "jobStartDate": {
                    let d = /* @__PURE__ */ new Date(filters[f][0] + "T00:00:00");
                    ok = ok && (isNaN(d) || j.data.jobEndDate && d <= new Date(j.data.jobEndDate));
                    break;
                  }
                  case "jobEndDate": {
                    let d = /* @__PURE__ */ new Date(filters[f][0] + "T00:00:00");
                    ok = ok && (isNaN(d) || j.data.jobStartDate && d >= new Date(j.data.jobStartDate));
                    break;
                  }
                  case "geoRange":
                    break;
                  case "geoAddress":
                    break;
                  case "geoIn":
                    break;
                  default:
                    ok = ok && (filters[f].length === 0 || filters[f].indexOf(j.data[f]) >= 0);
                    break;
                }
              }
              return ok;
            });
          } else {
            filtered.push(...jobs);
          }
          resolve({
            values: filtered.sort((x, y) => {
              if (x.data[sort.field] > y.data[sort.field]) {
                if (sort.direction === "asc") {
                  return 1;
                } else {
                  return -1;
                }
              }
              if (x.data[sort.field] < y.data[sort.field]) {
                if (sort.direction === "asc") {
                  return -1;
                } else {
                  return 1;
                }
              }
              return 0;
            }).slice(pageSize > 0 ? pageNumber * pageSize : 0, pageSize > 0 ? pageNumber * pageSize + pageSize : void 0),
            page: {
              pageNumber,
              totalPages: parseInt(Math.ceil(filtered.length / pageSize)),
              totalItems: filtered.length
            }
          });
        });
      });
      this.saveJob = (jobID, candidateID) => shazamme.submit({
        action: "Save Job",
        candidateID,
        jobID,
        isFavorite: true,
        isSaved: false,
        isAcknowledged: null
      }, false);
      this.createSave = (d) => shazamme.site().then(
        (s) => shazamme.submit({
          action: "Create Job Alert",
          siteID: s.siteID,
          ...d
        })
      );
      this.marshalSaveJob = (jobID) => {
        shazamme.store("previousApplicationPage", null);
        shazamme.store("signInAction", null);
        shazamme.store("previousApplicationPage", window.location.href);
        shazamme.store("signInAction", JSON.stringify({
          action: "Save Job",
          candidateID: "",
          jobID,
          isFavorite: true,
          isSaved: false,
          isAcknowledged: null
        }));
      };
      this.deleteSavedJob = (id) => shazamme.submit({
        action: "Delete Saved Job",
        candidateSavedJobID: id
      }, false);
      this.getSavedJobs = (candidateID) => shazamme.site().then(
        () => shazamme.submit({
          action: "Get Saved Jobs",
          candidateID
        }, false)
      );
      this.getLocationSeo = () => new Promise((resolve, reject) => {
        let seo = {};
        shazamme.fetch(Collection.locationSeo).then((r) => {
          var _a;
          if (r.length > 0) {
            resolve(JSON.parse(((_a = r[0].data) == null ? void 0 : _a.value) || null));
          } else {
            resolve({});
          }
        });
      });
      this._distance = (p1, p2, d = 6371) => {
        let _toRadians = (d2) => d2 * Math.PI / 180;
        let dLat = _toRadians(p2.lat - p1.lat);
        let dLon = _toRadians(p2.lon - p1.lon);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(p1.lat) * Math.cos(p2.lat);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return d * c;
      };
    }
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.jobStandardEl = (j) => {
        var _a, _b, _c, _d;
        let jobDate = /* @__PURE__ */ new Date(j.changedOnUTC + "Z");
        let isNew = data.config.showNewIcon && jobDate && !isNaN(jobDate.getTime()) && (+/* @__PURE__ */ new Date() - jobDate) / (1e3 * 3600 * 24) <= 1;
        let jobSalary = (j2) => {
          if (data.config.useSalaryText) {
            return j2.salaryText || "";
          }
          let currencySymbol = data.config.showSalaryCurrencySymbol && j2.currencySymbol || "";
          let currencyCode = data.config.showSalaryCurrencyCode && j2.currencyCode || "";
          let showCents = data.config.showCents;
          let fractionDigits = showCents ? 2 : 0;
          let salaryFrom = void 0;
          let salaryTo = void 0;
          let format = (salary2) => !isNaN(salary2) && `${currencySymbol}${salary2.toLocaleString(void 0, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${currencyCode}`;
          if (j2.salaryFrom >= 0) {
            salaryFrom = showCents ? j2.salaryFrom : Math.floor(j2.salaryFrom);
          }
          if (j2.salaryTo >= 0) {
            salaryTo = showCents ? j2.salaryTo : Math.floor(j2.salaryTo);
          }
          return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}` : salaryFrom > 0 ? `${format(salaryFrom)}` : salaryTo > 0 ? `${format(salaryTo)}` : data.config.noSalaryText || "";
        };
        let details = [];
        let salary = jobSalary(j);
        let location = [];
        if (data.config.showCity && ((_a = j.city) == null ? void 0 : _a.length) > 0) location.push(j.city);
        if (data.config.showState && ((_b = j.state) == null ? void 0 : _b.length) > 0 && !j.stateCatchAll) location.push(j.state);
        if (data.config.showCountry && ((_c = j.country) == null ? void 0 : _c.length) > 0) details.push(`<div class="shmLocation">${j.country}</div>`);
        if (location.length > 0) details.push(`<div class="shmLocation">${location.join(", ")}</div>`);
        if (data.config.showSalary && salary !== "") details.push(`<div class="shmSalary">${salary}</div>`);
        if (data.config.showBasicSalary && ((_d = j.salary) == null ? void 0 : _d.length) > 0) details.push(`<div class="shmSalary">${j.salary}</div>`);
        if (data.config.showDate && !isNaN(jobDate)) details.push(`<div class="shmJobDateCreated">${jobDate.toLocaleDateString()}</div>`);
        if (data.config.showWorkType && j.workType) details.push(`<div class="work-type">${j.workType}</div>`);
        if (data.config.showWorkModel && j.workModel) details.push(`<div class="work-model">${j.workModel}</div>`);
        if (data.config.showCategory && j.category) details.push(`<div class="jobCategory">${j.category}</div>`);
        return `
            <div class="shmJobResultStd shmJobResult" style="--shaz-hover-color:${data.config.jobResultHoverColor}" data-rel="article-job-result" data-id="${j.jobID}">

                ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}
                ${data.config.themeBackground && j.pColorCode && `<div class="theme background" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}


                <div class="shmJobItemDetails">

                ${data.config.showNewIcon && isNew ? `<span class="shmTag job-new">${data.config.newIconLabel || ""}</span>` : ""}

                    ${data.config.showTimeSincePosted && !isNaN(jobDate) && `<div class="shmTimePostedText">${data.config.postedText || "Posted "} ${this._timeSince(jobDate)}</div>` || ""}

                    <div class="shmJobItemUpper">
                        <div class="shmJobtitle">
                        <a  href="${j.detailsUri}" class="shmJobtitle" data-rel="link-job-name">${j.jobName}</a>
                        </div>

                        <div class="shmUpperRight" style="--alignSaveJobAndEmail:${data.config.alignSaveJobAndEmail}">
                            <div class="shmCTA">
                                <div class="shmSaveJob ${j.saveID ? " active" : ""}" style="--shaz-hover-color:${data.config.saveJobHoverColor}; --shaz-email-save-uppercase:${data.config.saveAndEmailUppercase}" data-rel="${j.saveID ? "action-unsave-job" : "action-save-job"}" data-save-id="${j.saveID || ""}">
                                    ${data.config.actionButtonIcon ? `
                                        <span class="icon-action active">${data.config.activeSaveButtonIcon || ""}</span>
                                        <span class="icon-action inactive">${data.config.saveButtonIcon || ""}</span>
                                        ` : ""}

                                    ${data.config.actionButtonText ? `
                                    <span class='active'>${data.config.unsaveJobText || "unsave job"}</span>
                                    <span class='inactive'>${data.config.saveJobText || "save job"}</span>
                                    ` : ""}
                                </div>

                                <div class="shmDividerContainer">
                                ${data.config.showShmDivider ? `
                                <span class="shmDivider">|</span>
                                ` : ""}
                                </div>

                                <div class="shmSendEmail" style="--shaz-hover-color:${data.config.sendEmailHoverColor}; --shaz-email-save-uppercase:${data.config.saveAndEmailUppercase}">
                                <a href="mailto:?subject=${data.config.shareEmailSubject} ${encodeURI(j.jobName)}&body=${encodeURI(data.config.emailBody || "Have a look at this amazing job!\n\n") + encodeURI(j.detailsUri)}" class="shmSendEmail">
                                    ${data.config.actionButtonIcon ? `<span class="icon-action"><span class="text">${data.config.emailButtonIcon}</span></span>` : ""}
                                    ${data.config.actionButtonText && (data.config.sendEmailText || "send email") || ""}
                                </a>
                                </div>
                            </div>
                            <div class="shmJobDateCreated"></div>
                        </div>
                    </div>
                    <div class="shmJobDetails">

                        <div class="shmJobDetailsPanel shmJobDetailsLeft" style="--alignJobDetails:${data.config.alignJobDetails}">
                            ${details.join(`<div class="shmDetailsDivider shmDividerEnabled">${data.config.separatorText || "|"}</div>`)}
                        </div>

                        <div class="shmJobDetailsPanel shmJobDetailsRight">
                            <ul class="shmRequirements">
                                ${j.shortDescription || ""}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="shmButtonLinks">
                    ${data.config.applybtn && `<a class="shmGoApply" href="${j.applicationURL || ux.buildHref(Path.jobApply, "jobID=" + j.jobID)}"><span class="text">${data.config.applyNowLabel || "Apply Now"}</span></a>` || ""}
                    ${data.config.readmorebtn && `<a class="shmGoReadMore"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || "Read More"}</span></a>` || ""}
                </div>
            </div>
        `;
      };
      this.jobSimpleEl = (j) => {
        var _a, _b, _c;
        let jobDate = /* @__PURE__ */ new Date(j.changedOnUTC + "Z");
        let isNew = data.config.showNewIcon && jobDate && !isNaN(jobDate.getTime()) && (+/* @__PURE__ */ new Date() - jobDate) / (1e3 * 3600 * 24) <= 1;
        let jobSalary = (j2) => {
          if (data.config.useSalaryText) {
            return j2.salaryText || "";
          }
          let currencySymbol = data.config.showSalaryCurrencySymbol && j2.currencySymbol || "";
          let currencyCode = data.config.showSalaryCurrencyCode && j2.currencyCode || "";
          let showCents = data.config.showCents;
          let fractionDigits = showCents ? 2 : 0;
          let salaryFrom = void 0;
          let salaryTo = void 0;
          let format = (salary2) => !isNaN(salary2) && `${currencySymbol}${salary2.toLocaleString(void 0, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${currencyCode}`;
          if (j2.salaryFrom >= 0) {
            salaryFrom = showCents ? j2.salaryFrom : Math.floor(j2.salaryFrom);
          }
          if (j2.salaryTo >= 0) {
            salaryTo = showCents ? j2.salaryTo : Math.floor(j2.salaryTo);
          }
          return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}` : salaryFrom > 0 ? `${format(salaryFrom)}` : salaryTo > 0 ? `${format(salaryTo)}` : data.config.noSalaryText || "";
        };
        let salary = jobSalary(j);
        let location = [];
        if (data.config.showCity && ((_a = j.city) == null ? void 0 : _a.length) > 0) location.push(j.city);
        if (data.config.showState && ((_b = j.state) == null ? void 0 : _b.length) > 0 && !j.stateCatchAll) location.push(j.state);
        return `<div class="shmJobResultSimple flex-container"  data-rel="article-job-result" data-id="${j.jobID}">

            ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}
            ${data.config.themeBackground && j.pColorCode && `<div class="theme background" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}


            <div class="topRow">
                <div class="timeSincePostedRow">
                    <div class="newTagContainer">
                        ${data.config.showNewIcon && isNew ? `<span class="newTag">${data.config.newIconLabel || ""}</span>` : ""}
                    </div>
                    ${data.config.showTimeSincePosted && !isNaN(jobDate) && `<div class="TimeSincePosted">${data.config.postedText || "Posted "} ${this._timeSince(jobDate)}</div>` || ""}
                </div>
                <div class="actionItemsRow">

                    <div class="shmSaveJob ${j.saveID ? " active" : ""}" data-rel="${j.saveID ? "action-unsave-job" : "action-save-job"}" data-save-id="${j.saveID || ""}" title="${j.saveID ? data.config.unsaveJobText || "unsave job" : data.config.saveJobText || "save job"}">

                        ${data.config.actionButtonIcon ? `
                            <span class="icon-action active">${data.config.activeSaveButtonIcon || ""}</span>
                            <span class="icon-action inactive">${data.config.saveButtonIcon || ""}</span>
                            ` : ""}

                        ${data.config.actionButtonText ? `
                        <span class='active'>${data.config.unsaveJobText || "unsave job"}</span>
                        <span class='inactive'>${data.config.saveJobText || "save job"}</span>
                        ` : ""}
                    </div>

                    <div class="shmDividerContainer"></div>

                    <div class="shmSendEmail">
                    <a href="mailto:?subject=${data.config.shareEmailSubject} ${encodeURI(j.jobName)}&body=${encodeURI((data.config.emailBody || "Have a look at this amazing job!") + "\n\n") + encodeURI(j.detailsUri)}" class="shmSendEmail" title=${data.config.sendEmailText || "send email"}>
                        ${data.config.actionButtonIcon ? `<span class="icon-action">${data.config.emailButtonIcon}</span>` : ""}
                        ${data.config.actionButtonText && (data.config.sendEmailText || "send email") || ""}
                    </a>
                    </div>
                </div>
            </div>

            <div class="resultsContainer">
                <div class="jobResultTitle"><a  href="${j.detailsUri}" class="jobResultTitle" data-rel="link-job-name">${j.jobName}</a></div>
                ${data.config.showCategory && j.category && !j.professionCatchAll && `<div class="jobCategory">${j.category}</div>` || ""}
                <div class="flex-col">
                    ${data.config.showWorkType && j.workType && `<div class="flex-col-separator workType" style="padding-right: 0px !important; padding-left: calc(${data.config.workTypeModelSpacing}px * 2) !important; --shaz-spacing: ${data.config.workTypeModelSpacing}px;">${j.workType}</div>` || ""}
                    ${data.config.showWorkModel && j.workModel && `<div class="flex-col-separator workModel" style="padding-right: 0px !important; padding-left: calc(${data.config.workTypeModelSpacing}px * 2) !important; --shaz-spacing: ${data.config.workTypeModelSpacing}px;">${j.workModel}</div>` || ""}
                </div>
                <div class="jobDescription">${j.shortDescription || ""}</div>



                <div class="separator"></div>

                <div class="bottomRow">

                ${(location.length > 0 || data.config.showCountry) && `
                    <div class="locationContainer">
                        ${data.config.locationSalaryIcon ? `<div class="locationIcon">
                            <span class="iconbottom">${data.config.locationIcon}</span>
                         </div>` : ""}
                         <div class="locationText">
                             ${data.config.showCountry && `<div>${j.country || ""}</div>` || ""}
                             ${location.length > 0 && `<div>${location.join(", ")}</div>` || ""}
                         </div>
                    </div>
                    ` || ""}

                    <div class="salaryContainer">
                        ${data.config.showSalary && (j.salaryFrom > 0 || j.salaryTo > 0 || (salary == null ? void 0 : salary.length) > 0) ? `
                            ${data.config.locationSalaryIcon ? `<div class="salaryIcon">
                                <span class="iconbottom">${data.config.salaryIcon}</span>
                            </div>` : ""}
                            <div class="salaryText">${data.config.showSalary && salary || ""}</div>
                        ` : ""}
                    </div>

                    <div class="salaryContainer">
                        ${data.config.showBasicSalary && ((_c = j.salary) == null ? void 0 : _c.length) > 0 && `
                            ${data.config.locationSalaryIcon ? `<div class="salaryIcon">
                                <span class="iconbottom">${data.config.salaryIcon}</span>
                            </div>` : ""}
                            <div class="salaryText">${j.salary}</div>
                        ` || ""}
                    </div>

                    <div class="actionButtonRow desktop">
                        ${data.config.applybtn && `<a class="applyActionButton" href="${j.applicationURL || ux.buildHref(Path.jobApply, "jobID=" + j.jobID)}"><span class="text">${data.config.applyNowLabel || "Apply Now"}</span></a>` || ""}
                        ${data.config.readmorebtn && `<a class="readMoreActionButton"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || "Read More"}</span></a>` || ""}
                    </div>
                </div>

                <div class="actionButtonRow mobile">
                    ${data.config.applybtn && `<a class="applyActionButton" href="${j.applicationURL || ux.buildHref(Path.jobApply, "jobID=" + j.jobID)}"><span class="text">${data.config.applyNowLabel || "Apply Now"}</span></a>` || ""}
                    ${data.config.readmorebtn && `<a class="readMoreActionButton"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || "Read More"}</span></a>` || ""}
                </div>
            </div>
        </div>`;
      };
      this.jobModernEl = (j) => {
        var _a, _b, _c, _d;
        let jobdate = new Date(j.postedDate);
        let isNew = data.config.showNewIcon && jobdate && !isNaN(jobdate.getTime()) && (+/* @__PURE__ */ new Date() - jobdate) / (1e3 * 3600 * 24) <= 1;
        let startDate = new Date(j.jobStartDate || void 0);
        let endDate = new Date(j.jobEndDate || void 0);
        let postedDate = (j2) => {
          if (!data.config.showDate && !data.config.showTimeSincePosted) {
            return "";
          }
          let out = [];
          if (data.config.showDate && !isNaN(jobdate)) {
            out.push(j2.postedDate);
          }
          if (data.config.showTimeSincePosted) {
            out.push(this._timeSince(jobdate));
          }
          return out.join(" \xB7 ");
        };
        let jobSalary = (j2) => {
          if (data.config.useSalaryText) {
            return j2.salaryText || "";
          }
          if (!j2.isDisplaySalary) {
            return "";
          }
          let currencySymbol = data.config.showSalaryCurrencySymbol && j2.currencySymbol || "";
          let currencyCode = data.config.showSalaryCurrencyCode && j2.currencyCode || "";
          let showCents = data.config.showCents;
          let fractionDigits = showCents ? 2 : 0;
          let salaryFrom = void 0;
          let salaryTo = void 0;
          let format = (salary) => !isNaN(salary) && `${currencySymbol}${salary.toLocaleString(void 0, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${currencyCode}`;
          if (j2.salaryFrom >= 0) {
            salaryFrom = showCents ? j2.salaryFrom : Math.floor(j2.salaryFrom);
          }
          if (j2.salaryTo >= 0) {
            salaryTo = showCents ? j2.salaryTo : Math.floor(j2.salaryTo);
          }
          return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}` : salaryFrom > 0 ? `${format(salaryFrom)}` : salaryTo > 0 ? `${format(salaryTo)}` : data.config.noSalaryText || "";
        };
        let position = j.positionTitle || j.advertiserName;
        let location = [];
        if (data.config.showCity && ((_a = j.city) == null ? void 0 : _a.length) > 0) location.push(j.city);
        if (data.config.showState && ((_b = j.state) == null ? void 0 : _b.length) > 0 && !j.stateCatchAll) location.push(j.state);
        return `
        <div class="shmJobResultModern">

                ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}
                ${data.config.themeBackground && j.pColorCode && `<div class="theme backgrouond" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ""}

            <div class="job-detail">
                <div class="category-meta-container">
                    <p class="job-category">${!j.professionCatchAll && j.category || ""}</p>

                    <div class="meta">
                        ${isNew && `<div class="meta-value">New Posting</div>` || ""}
                        ${data.config.showCountry && j.country && `<div class="meta-value">${j.country}</div>` || ""}
                        ${location.length > 0 && `<div class="meta-value">${location.join(", ")}</div>` || ""}
                        ${data.config.metaToggle && j.subCategory && `<div class="meta-value">${j.subCategory}</div>` || ""}
                    </div>
                </div>
                ${data.config.showWorkType && ((_c = j.workType) == null ? void 0 : _c.length) > 0 || data.config.showWorkModel && ((_d = j.workModel) == null ? void 0 : _d.length) > 0 ? `<div class="job-about">
                        ${data.config.showWorkType && `<span class="text">${j.workType || ""}</span>` || ""}
                        ${data.config.showWorkModel && `<span class="text">${j.workModel || ""}</span>` || ""}
                    </div>` : ""}
                <div class="section-main">
                    <div class="description">
                        <p class="job-title"><a href="${j.detailsUri}">${j.jobName || ""}</a></p>
                        ${j.shortDescription && `<div class="label-job-description" style="--shaz-job-result-lines: ${data.config.jobDetailsLines || 3};">${j.shortDescription}</div>` || ""}
                    </div>
                    <div class="side-bar">
                        ${j.customImageURL && j.customImageURL.length > 0 ? `<img class="image-logo" src="${j.customImageURL}" alt="company logo">` : ""}


                        ${data.config.showReadMoreButton && `<a class="button-action read-more" href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || "Read More"}</span></a>` || ""}
                        ${data.config.showApplyButton && `<a class="button-action apply" href="${j.applicationURL || ux.buildHref(Path.jobApply, "jobID=" + j.jobID)}"><span class="text">${data.config.applyNowLabel || "Apply Now"}</span></a>` || ""}


                     </div>
                 </div>

                ${data.config.showJobPeriod && `
                            <div class="job-period">
                            ${!isNaN(startDate) && `<p>${data.config.startDateLabel} ${startDate.toLocaleDateString()}</p>` || ""}
                            ${!isNaN(endDate) && `<p>${data.config.endDateLabel} ${endDate.toLocaleDateString()}</p>` || ""}
                            </div>
                        ` || ""}

                ${data.config.showSalary && `<p class="label-salary">${jobSalary(j)}</p>` || ""}
                ${data.config.showBasicSalary && `<p class="label-salary">${j.salary || ""}</p>` || ""}
                ${(data.config.showDate || data.config.showTimeSincePosted) && `<p class="label-posted">${postedDate(j)}</p>` || ""}
            </div>

            ${data.config.showRecruiter && `
            <div class="recruiter-detail">
                <div class="section-bio">
                    ${j.consultantPhotoURL && `<img class="image-head-shot" style="--consultantImagePosition:${data.config.consultantImagePosition}" src="${j.consultantPhotoURL || ""}" alt="${j.contactName}" />` || ""}

                    <div class="bio-name">
                        ${j.contactName && `<p class="contact-name">${j.contactName}</p>` || ""}
                        ${position && `<p class="advertiser-name">${position}</p>` || ""}
                    </div>
                </div>

                <div class="section-contact">
                    ${j.contactPhone && `<a class='phone' href="tel:${j.contactPhone}">${j.contactPhone || data.config.contactPhone || "CALL ME"}</a>` || ""}
                    ${j.contactEmail && `<a class='email' href="mailto:${j.contactEmail}">${j.contactEmail || data.config.contactEmail || "EMAIL ME"}</a>` || ""}
                </div>
            </div> ` || ""}
        </div>
        `;
      };
      this.showJobResults = (html) => {
        this.el.find("[data-rel=job-results-map]").hide();
        this.el.find("[data-rel=job-results-list]").empty().append(html).show();
        this.el.find("[data-rel=job-results-list] [data-rel=link-job-name]").on("mouseenter", function() {
          $(this).addClass("over");
        }).on("mouseleave", function() {
          $(this).removeClass("over");
        });
        this.el.find("[data-rel=job-results-list] .shmJobResultStd").on("mouseenter", function() {
          $(this).addClass("over");
        }).on("mouseleave", function() {
          $(this).removeClass("over");
        });
      };
      this.showJobPins = (j) => {
        var _a, _b;
        let pins = j.filter((i) => i.latitude !== null && i.longitude !== null).map((i) => {
          var _a2;
          return {
            page_item_url: i.jobURL,
            latitude: i.latitude,
            longitude: i.longitude,
            state: i.state,
            jobName: i.jobName,
            profession: (_a2 = i.category) != null ? _a2 : ""
          };
        });
        let center = new google.maps.LatLng(
          ((_a = pins[0]) == null ? void 0 : _a.latitude) || -33.86785,
          ((_b = pins[0]) == null ? void 0 : _b.longitude) || 151.20732
        );
        let map = new google.maps.Map(document.getElementById("shmMap"), {
          zoom: 8,
          center,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          rotateControl: true
        });
        let bounds = new google.maps.LatLngBounds();
        let infowindow = new google.maps.InfoWindow();
        pins.forEach((p) => {
          let marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(p.latitude, p.longitude),
            map
          });
          bounds.extend(marker.position);
          google.maps.event.addListener(marker, "click", ((marker2, i) => {
            let pinEl = `
                    <div class="gmapInfoContainer">
                        <div class="gmapTitle">${p.jobName}</div>
                        <div class="gmapLocation">${p.state}</div>
                        <a class="gmapReadMoreProfession" href="${p.page_item_url}" target="_blank"> <span class="text">${p.profession}</span></a>
                        <a class="gmapReadMore" href="${p.page_item_url}" target="_blank"> <span class="text">${data.config.mapReadMore || "Read More"}</span></a>
                    </div>
                `;
            return () => {
              infowindow.setContent(pinEl);
              infowindow.open(map, marker2);
            };
          })(marker));
        });
        this.el.find("[data-rel=job-results-list]").hide();
        this.el.find("[data-rel=job-results-map]").show();
        map.fitBounds(bounds);
      };
      this.showPages = (pageNumber, totalPages, maxVisiblePages = 5) => {
        if (totalPages < 2) {
          return;
        }
        let pages = [];
        let start = 1;
        if (pageNumber >= maxVisiblePages - 1) {
          start = pageNumber - Math.floor(maxVisiblePages / 2) + 1;
        }
        if (start + maxVisiblePages >= totalPages) {
          start = totalPages - maxVisiblePages;
        }
        if (start < 0) {
          start = 1;
        }
        let end = start + maxVisiblePages;
        if (end > totalPages) {
          end = totalPages;
        }
        let back = $("<a />").addClass(`button-paging ${pageNumber <= 0 ? "disabled" : ""}`).attr("data-rel", pageNumber > 0 ? "paging-select" : "").attr("data-page-number", pageNumber - 1).text("<<");
        let next = $("<a />").addClass(`button-paging ${pageNumber >= totalPages - 1 ? "disabled" : ""}`).attr("data-rel", pageNumber < totalPages - 1 ? "paging-select" : "").attr("data-page-number", pageNumber + 1).text(">>");
        pages.push(back);
        if (start > maxVisiblePages) {
          pages.push(
            $("<a />").addClass(`button-paging`).attr("data-rel", "paging-select").attr("data-page-number", 0).text(1),
            $("<a />").addClass(`button-paging disabled`).text("...")
          );
        }
        for (let i = start - 1; i < end; i++) {
          pages.push(
            $("<a />").addClass(`button-paging ${pageNumber === i ? "active" : ""}`).attr("data-rel", "paging-select").attr("data-page-number", i).text(i + 1)
          );
        }
        if (end < totalPages) {
          pages.push(
            $("<a />").addClass(`button-paging disabled`).text("..."),
            $("<a />").addClass(`button-paging`).attr("data-rel", "paging-select").attr("data-page-number", totalPages - 1).text(totalPages)
          );
        }
        pages.push(next);
        let resultsList = $(element).find("[data-rel=job-results-list]");
        resultsList.find("[data-rel=job-results-paging]").remove();
        $("<div></div>").addClass("section-job-results-paging").attr("data-rel", "job-results-paging").append(pages).appendTo(resultsList);
      };
      this.showFilters = (title, filters, type, parentType, collapsible, activeFilter2, validFilters) => {
        const sort = (x, y) => {
          var _a, _b;
          return ((_a = x == null ? void 0 : x.value) == null ? void 0 : _a.toLowerCase()) > ((_b = y == null ? void 0 : y.value) == null ? void 0 : _b.toLowerCase()) ? 1 : -1;
        };
        let map = {};
        let sender = this;
        filters.sort(sort).forEach((f2) => {
          map[f2.id] = {
            count: 0,
            ...f2
          };
        });
        let html = [];
        let collapsibleIcon = "data:image/svg+xml;base64," + btoa(data.config.collapseIcon);
        html.push(`<p
            class="
                filter-title
                ${collapsible && "collapsible"}"
            data-rel="filter-group"
            data-filter-type="${type}">
                ${collapsible ? `<span
                        class="collapse-icon"
                        style="
                            --collapse-icon-size: ${data.config.collapseIconSize}px;
                            --collapse-icon-fill: ${data.config.collapseIconFill};
                        "
                    >${data.config.collapseIcon}</span>` : ""}
                ${title}
            </p>`);
        for (let i in map) {
          let f2 = map[i];
          html.push(
            `<div class="filter-toggle ${activeFilter2[type] && activeFilter2[type].indexOf(f2.id) >= 0 ? " active" : ""}"
                    href="javascript:void(0)"
                    data-rel="${!defaultFilter[type] || defaultFilter[type].indexOf(f2.id) === -1 ? "filter-toggle" : ""}"
                    data-filter-type="${type}"
                    data-filter-value="${f2.id}"
                    ${f2.seo && `data-filter-path="${f2.seo}"` || ""}
                    ${parentType && `data-filter-parent-type="${parentType}"` || ""}
                    ${f2.parent && `data-filter-parent-value="${f2.parent}"` || ""}>
                        <input type="checkbox" />
                        ${f2.value} (${f2.count})
                </div>`
          );
        }
        if (validFilters && validFilters.length > 0) {
          let map2 = {};
          validFilters.sort(sort).forEach((f2) => {
            map2[f2.id] = {
              count: validFilters.filter((x) => x.id === f2.id).length,
              ...f2
            };
          });
          for (let i in map2) {
            let f2 = map2[i];
            html.push(
              `<div class="filter-toggle more"
                        href="javascript:void(0)"
                        data-rel="filter-toggle"
                        data-filter-type="${type}"
                        data-filter-value="${f2.id}"
                        ${f2.seo && `data-filter-path="${f2.seo}"` || ""}
                        ${parentType && `data-filter-parent-type="${parentType}"` || ""}
                        ${f2.parent && `data-filter-parent-value="${f2.parent}"` || ""}>

                        <input type="checkbox" />
                        ${f2.value} (${f2.count})
                    </div>`
            );
          }
        }
        let filterList = this.el.find("[data-rel=filter-attribute]");
        filterList.find(`[data-filter-type=${type}]`).remove();
        filterList.find(`[data-filter-parent-type=${type}]`).remove();
        filterList.append(html.join(""));
        filterList.find(".filter-toggle.active").not("[data-rel=filter-toggle]").find("input[type=checkbox]").remove();
        filterList.find(".filter-toggle.active > input[type=checkbox]").attr("checked", "checked");
        if (collapsible) {
          filterList.find(`[data-rel=filter-group][data-filter-type=${type}]`).click(function() {
            filterList.find(`[data-rel=filter-toggle][data-filter-type=${type}], [data-rel=filter-toggle][data-filter-parent-type=${type}].active`).toggle();
          });
          if (data.config.autoCollapse && !data.config.useSubFilters) {
            let f2 = filterList.find(`[data-rel=filter-toggle][data-filter-type=${type}]`);
            if (!f2.is(".active")) {
              f2.css({ display: "block" });
              f2.hide();
            }
          }
        }
        setTimeout(() => {
          for (let id in map) {
            let count = filters.filter((i) => i.id === id).length;
            sender.el.find(`[data-rel=filter-attribute] [data-filter-type="${type}"][data-filter-value="${id}"]`).html(`<input type="checkbox" /> ${map[id].value} (${count})`);
          }
          let filterList2 = sender.el.find("[data-rel=filter-attribute]");
          filterList2.find(".filter-toggle.active").not("[data-rel=filter-toggle]").find("input[type=checkbox]").remove();
          filterList2.find(".filter-toggle.active > input[type=checkbox]").attr("checked", "checked");
        }, 300);
      };
      this.showSubFilters = (parentType, parent, filters, type, activeFilter2) => {
        var _a, _b;
        if (!((filters == null ? void 0 : filters.length) > 0) || !parent) return;
        const sort = (x, y) => {
          var _a2, _b2;
          return ((_a2 = x == null ? void 0 : x.value) == null ? void 0 : _a2.toLowerCase()) > ((_b2 = y == null ? void 0 : y.value) == null ? void 0 : _b2.toLowerCase()) ? 1 : -1;
        };
        let map = {};
        filters.sort(sort).forEach((f2) => {
          map[f2.id] = {
            count: filters.filter((x) => x.id === f2.id).length,
            ...f2
          };
        });
        let html = [];
        for (let i in map) {
          let f2 = map[i];
          let active = ((_a = activeFilter2[type]) == null ? void 0 : _a.indexOf(f2.id)) >= 0 && "active";
          let visible = ((_b = activeFilter2[parentType]) == null ? void 0 : _b.indexOf(parent.id)) >= 0 && "visible";
          html.push(`
                 <a class="filter-toggle filter-nested ${active || visible || ""}"
                    href="javascript:void(0)"
                    data-rel="${!defaultFilter[type] || defaultFilter[type].indexOf(f2.id) === -1 ? "filter-toggle" : ""}"
                    data-filter-type="${type}"
                    data-filter-parent-type="${parentType}"
                    data-filter-parent-value="${parent.id}"
                    data-filter-value="${f2.id}">

                    <input type="checkbox" />
                    ${f2.value} (${f2.count})
                </a>
            `);
        }
        let filterList = this.el.find("[data-rel=filter-attribute]");
        filterList.find(`[data-filter-type="${type}"][data-filter-parent-type="${parentType}"][data-filter-parent-value="${parent.id}"]`).remove();
        if (html.length > 0) {
          filterList.find(`[data-filter-type="${parentType}"][data-filter-value="${parent.id}"]`).addClass("collapsible").attr("style", `--collapse-icon-size: ${data.config.subFilterIconSize}px; --collapse-icon:url(data:image/svg+xml;base64,${btoa(data.config.subFilterIcon)})`).attr("data-filter-children", "").after(html.join(""));
        } else {
          filterList.find(`[data-filter-type="${parentType}"][data-filter-value="${parent.id}"]`).removeClass("collapsible");
        }
        filterList.find(".filter-toggle.active").not("[data-rel=filter-toggle]").find("input[type=checkbox]").remove();
        filterList.find(".filter-toggle.active > input[type=checkbox]").attr("checked", "checked");
      };
      this.showSalaryFilter = (opts) => {
        return new SalaryFilter(opts).renderTo(this.el.find("[data-rel=filter-salary]"));
      };
      this.showLoading = (showing = true) => {
        if (showing) {
          this.el.find("[data-rel=modal-loading]").css({
            "display": "flex"
          }).show();
        } else {
          this.el.find("[data-rel=modal-loading]").hide();
        }
      };
      this.buildHref = (path, query) => {
        if (path && path.charAt(0) !== "/") path = "/" + path;
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? "&" + query : ""}` : `https://${window.location.hostname}${path}${query ? "?" + query : ""}`;
      };
      this.loadScript = (src) => window.__shazLoadScript(src);
      this._timeSince = (d) => {
        if (!d || isNaN(d.getTime())) {
          return null;
        }
        const day = 1e3 * 3600 * 24;
        const hour = 1e3 * 3600;
        const minute = 1e3 * 60;
        let since = +/* @__PURE__ */ new Date() - d;
        let denom = data.config.timeSinceDay || "day";
        if (since / day >= 1) {
          since = since / day;
          denom = data.config.timeSinceDay || "day";
        } else if (since / hour >= 1) {
          since = since / hour;
          denom = data.config.timeSinceHour || "hour";
        } else if (since / minute >= 1) {
          since = since / minute;
          denom = data.config.timeSinceMinute || "minute";
        } else {
          since = 0;
          denom = data.config.timeSinceNow || "just now";
        }
        return `${since > 0 ? Math.floor(since) : ""} ${denom}${Math.floor(since) > 1 && data.config.timeSinceUsePluralization ? "s " : " "} ${since > 0 ? data.config.timeSinceAgo || "ago" : ""}`;
      };
    }
    function SalaryFilter(opts) {
      let sender = this;
      opts = opts || {};
      this.onChange = (cb) => {
        this._afterChange = cb;
        return this;
      };
      this.min = () => {
        return opts.min || this._defaultMin;
      };
      this.max = () => {
        return opts.max || this._defaultMax;
      };
      this.step = () => {
        return opts.step || this._defaultStep;
      };
      this.set = (vals) => {
        if (!isNaN(vals.min)) {
          this._lowerSlider.val(vals.min);
        }
        if (!isNaN(vals.max)) {
          this._upperSlider.val(vals.max);
        }
        this._adjustColorRange();
        this._adjustRangeDisplay();
        this._setSalary();
        return this;
      };
      this.renderTo = (parent) => {
        this._el = $(`
            <div class="control-salary-slider" data-rel="salary-slider">
                <div class="slider">
                   <input class="range" data-rel="range-set-lower" type="range" min="${this.min()}" max="${this.max()}" value="${this.min()}" step="${this.step()}">
                     <span class="section-color" data-rel="range-color"></span>
                   <input class="range" data-rel="range-set-upper" type="range" min="${this.min()}" max="${this.max()}" value="${this.max()}" step="${this.step()}">
               </div>
               <div class="label-display" data-rel="salary-display"></div>
            </div>
        `);
        parent.find("[data-rel=salary-slider]").remove();
        parent.append(this._el);
        this._lowerSlider = this._el.find("[data-rel=range-set-lower]");
        this._upperSlider = this._el.find("[data-rel=range-set-upper]");
        this._rangeColor = this._el.find("[data-rel=range-color]");
        this._addHandlers();
        this._adjustRangeDisplay();
        return this;
      };
      this._defaultMin = 0;
      this._defaultMax = parseInt(data.config.salaryRangeMax) || 5e5;
      this._defaultStep = parseInt(data.config.salaryRangeStep) || 1e3;
      this._formatter = Intl.NumberFormat(navigator.language);
      this._setSalaryTimeout = null;
      this._afterChange = void 0;
      this._addHandlers = function() {
        this._upperSlider.on("input", function() {
          let lowerVal = parseInt(sender._lowerSlider.val()) || 0;
          let upperVal = parseInt(sender._upperSlider.val()) || 0;
          let step = parseInt(sender._upperSlider.attr("step"));
          if (upperVal < lowerVal + step) {
            sender._lowerSlider.val(upperVal - step);
            if (lowerVal == sender._lowerSlider.attr("min")) {
              sender._upperSlider.val(step);
            }
          }
          sender._adjustColorRange();
          sender._adjustRangeDisplay();
          sender._setSalary();
        });
        this._lowerSlider.on("input", function() {
          let lowerVal = parseInt(sender._lowerSlider.val()) || 0;
          let upperVal = parseInt(sender._upperSlider.val()) || 0;
          let step = parseInt(sender._upperSlider.attr("step"));
          if (lowerVal > upperVal - step) {
            _upperSlider.val(lowerVal + step);
            if (upperVal == sender._upperSlider.attr("max")) {
              sender._lowerSlider.val(parseInt(sender._upperSlider.attr("max")) - step);
            }
          }
          sender._adjustColorRange();
          sender._adjustRangeDisplay();
          sender._setSalary();
        });
      };
      this._adjustColorRange = function() {
        sender._rangeColor.css({
          marginLeft: sender._lowerSlider.val() / parseInt(sender._lowerSlider.attr("max")) * 100 + "%",
          width: sender._upperSlider.val() / parseInt(sender._upperSlider.attr("max")) * 100 - sender._lowerSlider.val() / parseInt(sender._lowerSlider.attr("max")) * 100 + "%"
        });
      };
      this._adjustRangeDisplay = function() {
        sender._el.find("[data-rel=salary-display]").text(`${sender._formatter.format(parseInt(sender._lowerSlider.val()))} - ${sender._formatter.format(parseInt(sender._upperSlider.val()))}`);
      };
      this._setSalary = function() {
        if (sender._setSalaryTimeout) {
          clearTimeout(sender._setSalaryTimeout);
        }
        sender._setSalaryTimeout = setTimeout(function() {
          if (typeof sender._afterChange === "function") {
            sender._afterChange(sender, {
              min: parseInt(sender._lowerSlider.val()),
              //Get lower slider value
              max: parseInt(sender._upperSlider.val())
              //Get upper slider value
            });
          }
          sender._setSalaryTimeout = null;
        }, 1e3);
      };
    }
    const ux = new UX();
    const shApi = new ShApi();
    const jobResultsPageSize = parseInt(data.config.pageSize) || 20;
    let activeFilter = {};
    let defaultFilter = {};
    let validFilter = {};
    let activeSort = JSON.parse(data.config.defaultSort || null) || {
      field: "changedOnUTC",
      direction: "desc"
    };
    let savedJobs = [];
    let mergedFilters = () => {
      let filters = {};
      for (let fType in defaultFilter) {
        if (typeof defaultFilter[fType] === "string") {
          filters[fType] = defaultFilter[fType];
        } else if (typeof defaultFilter[fType] === "number" && !isNaN(defaultFilter[fType])) {
          filters[fType] = defaultFilter[fType];
        } else {
          filters[fType] = [...defaultFilter[fType] || [], ...activeFilter[fType] || []];
        }
      }
      for (let fType in activeFilter) {
        if (typeof activeFilter[fType] === "string") {
          filters[fType] = activeFilter[fType];
        } else if (typeof activeFilter[fType] === "number" && !isNaN(activeFilter[fType])) {
          filters[fType] = activeFilter[fType];
        } else {
          filters[fType] = [...activeFilter[fType] || [], ...defaultFilter[fType] || []];
        }
      }
      return filters;
    };
    let showJobs = (pageNumber) => {
      let activeView = ux.el.find("[data-rel=button-toggle][data-toggle=results-view].active");
      let showMap = activeView.is("[data-view=Map]");
      shApi.getJobs(pageNumber, showMap ? 999 : jobResultsPageSize, mergedFilters(), activeSort).then((col) => {
        if (showMap) {
          ux.showJobPins(col.values.map((j) => j.data));
          return;
        }
        let op = () => {
          switch (data.config.layout) {
            case "simple":
              return ux.jobSimpleEl;
            case "standard":
              return ux.jobStandardEl;
            case "modern":
              return ux.jobModernEl;
            default:
              return ux.jobStandardEl;
          }
        };
        let html = col.values.map((j) => op()({
          ...j.data,
          saveID: (savedJobs.find((s) => s.jobID === j.data.jobID) || {}).candidateSavedJobID,
          detailsUri: ux.buildHref(`${Path.jobDetails}/${new URL(j.data.jobURL).pathname.split("/").pop()}`)
        }));
        ux.showJobResults(html);
        ux.showPages(col.page.pageNumber, col.page.totalPages);
        let params = window.location.hash.replace("#", "").split("/").filter((p) => p.indexOf("pg-") === -1);
        if (pageNumber > 0) {
          params.push(`pg-${pageNumber + 1}`);
        }
        let last = `#${params.join("/")}`.replace(/\/{2,}/g, "/");
        shazamme.store(LocalStorage.lastSearch, JSON.stringify({
          ...JSON.parse(shazamme.store(LocalStorage.lastSearch)),
          path: last,
          page: pageNumber
        }));
        window.location = `${last}`;
        ux.el.find("[data-rel=paging-select]").click(function() {
          let button = $(this);
          let pageNumber2 = parseInt(button.attr("data-page-number"));
          showJobs(pageNumber2);
          ux.el.get(0).scrollIntoView({ behavior: "smooth" });
        });
        ux.el.find(`[data-rel=article-job-result] [data-rel=action-save-job], [data-rel=article-job-result] [data-rel=action-unsave-job]`).on("click", function() {
          let button = $(this);
          shazamme.pub(Message.saveJob, {
            sender: button,
            jobID: button.parents("[data-rel=article-job-result]").attr("data-id"),
            saveID: button.attr("data-save-id")
          });
        });
        ux.el.find("[data-rel=label-results-count]").text(col.page.totalItems).parent().show();
        if (col.page.totalItems == 1) {
          ux.el.find("[data-rel=label-results-message]").text(data.config.resultMessage);
        } else {
          ux.el.find("[data-rel=label-results-message]").text(data.config.resultMessagePlural || data.config.resultMessage);
        }
      });
      if (data.inEditor && Object.keys(activeFilter).length > 0) {
        ux.el.find("[data-rel=default-filter]").show();
      } else {
        ux.el.find("[data-rel=default-filter]:not([data-default-filter=show])").hide();
      }
    };
    let showFilters = () => {
      let category = [];
      let subCategory = [];
      let workType = [];
      let workModel = [];
      let state = [];
      let city = [];
      let country = [];
      let custom1 = [];
      let custom2 = [];
      let active = mergedFilters();
      let professionSeo = [];
      let roleSeo = [];
      let workTypeSeo = [];
      let locationSeo = [];
      let citySeo = [];
      let stateSeo = [];
      let countrySeo = [];
      let isSet = (f2) => {
        var _a;
        return ((_a = f2 == null ? void 0 : f2.id) == null ? void 0 : _a.length) > 0;
      };
      let fetch = (pageNumber) => {
        shApi.getJobs(0, 0, active).then((jobs) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i;
          if (jobs.values && jobs.values.length > 0) {
            const toIndex = (v, i, s, p) => new Object({
              value: v,
              id: i || v,
              seo: s || i,
              parent: p
            });
            const locationSeo2 = (n, v) => {
              var _a2;
              return (_a2 = validFilter[n].find((x) => {
                var _a3;
                return ((_a3 = x == null ? void 0 : x.value) == null ? void 0 : _a3.toLowerCase()) === (v == null ? void 0 : v.toLowerCase());
              })) == null ? void 0 : _a2.seo;
            };
            const createSubFilter = (f2, fType, groupType) => {
              let group = [];
              var p;
              if ((f2 == null ? void 0 : f2.length) > 0) {
                f2.filter((x) => x.parent).sort((x, y) => x.parent > y.parent ? 1 : -1).forEach((c) => {
                  if ((p == null ? void 0 : p.id) !== c.parent) {
                    ux.showSubFilters(groupType, p, group, fType, active);
                    p = validFilter[groupType].find((x) => x.id === c.parent);
                    group = [];
                  }
                  group.push(c);
                });
              }
              ux.showSubFilters(groupType, p, group, fType, active);
            };
            const enableEv = (ev) => {
              let filter = $(ev.target);
              if (!filter.is("[data-rel=filter-toggle]")) {
                filter = filter.parents("[data-rel=filter-toggle]");
              }
              let fType = filter.attr("data-filter-type");
              let fValue = filter.attr("data-filter-value");
              let active2 = activeFilter[fType] || [];
              let activeIndex = active2.indexOf(fValue);
              if (activeIndex >= 0) {
                active2.splice(activeIndex, 1);
                if (active2.length === 0) {
                  delete activeFilter[fType];
                }
                ux.el.find(`[data-rel=filter-toggle][data-filter-parent-type="${fType}"][data-filter-parent-value="${fValue}"]`).hide().each((_, x) => {
                  let f2 = $(x);
                  let childType = f2.attr("data-filter-type");
                  let childValue = f2.attr("data-filter-value");
                  let childActive = activeFilter[childType] || [];
                  let childActiveIndex = childActive.indexOf(childValue);
                  if (childActiveIndex >= 0) {
                    childActive.splice(childActiveIndex, 1);
                    if (childActive.length === 0) {
                      delete activeFilter[childType];
                    } else {
                      activeFilter[childType] = childActive;
                    }
                  }
                });
              } else {
                active2.push(fValue);
                if (filter.is("[data-filter-parent-type]")) {
                  let parentType = filter.attr("data-filter-parent-type");
                  let parentValue = filter.attr("data-filter-parent-value");
                  let parentActive = activeFilter[parentType] || [];
                  let parentActiveIndex = parentActive.indexOf(parentValue);
                  if (parentActiveIndex === -1) {
                    parentActive.push(parentValue);
                  }
                  activeFilter[parentType] = parentActive;
                }
              }
              if (active2.length > 0) {
                activeFilter[fType] = active2;
              } else {
                delete activeFilter[fType];
              }
              showJobs(0);
              showFilters();
              shazamme.pub("job-results-filter-change", activeFilter);
            };
            category.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.professionID) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.category, j.data.professionID, j.data.professionSeo)));
            subCategory.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.roleID) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.subCategory, j.data.roleID, j.data.roleSeo, data.config.showClassificationFilter && j.data.professionID)));
            workType.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.workTypeID) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.workType, j.data.workTypeID, j.data.workTypeSeo)));
            workModel.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.workModelID) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.workModel, j.data.workModelID, j.data.workModelSeo)));
            state.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.state) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.state, j.data.state, locationSeo2("state", j.data.state))));
            city.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.state) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.city, j.data.city, locationSeo2("city", j.data.city), data.config.showLocationFilter && j.data.state)));
            country.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.country) == null ? void 0 : _a2.length) > 0;
            }).map((j) => toIndex(j.data.country, j.data.country, locationSeo2("country", j.data.country))));
            custom1.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.customField1) == null ? void 0 : _a2.length) > 0;
            }).map((j) => j.data.customField1 && toIndex(j.data.customField1)));
            custom2.push(...jobs.values.filter((j) => {
              var _a2;
              return ((_a2 = j.data.customField2) == null ? void 0 : _a2.length) > 0;
            }).map((j) => j.data.customField2 && toIndex(j.data.customField2)));
            const validList = (type, isChild = false) => {
              var _a2;
              return Object.keys(active).length <= (isChild ? 2 : 1) && ((_a2 = validFilter[type]) == null ? void 0 : _a2.filter((v) => {
                var _a3;
                return ((_a3 = active[type]) == null ? void 0 : _a3.indexOf(v.id)) === -1;
              }));
            };
            active.professionID = (_a = active == null ? void 0 : active.professionID) == null ? void 0 : _a.filter((x) => category.find((y) => y.id === x));
            active.roleID = (_b = active == null ? void 0 : active.roleID) == null ? void 0 : _b.filter((x) => subCategory.find((y) => y.id === x));
            active.workTypeID = (_c = active == null ? void 0 : active.workTypeID) == null ? void 0 : _c.filter((x) => workType.find((y) => y.id === x));
            active.workModelID = (_d = active == null ? void 0 : active.workModelID) == null ? void 0 : _d.filter((x) => workModel.find((y) => y.id === x));
            active.state = (_e = active == null ? void 0 : active.state) == null ? void 0 : _e.filter((x) => state.find((y) => y.id === x));
            active.city = (_f = active == null ? void 0 : active.city) == null ? void 0 : _f.filter((x) => city.find((y) => y.id === x));
            active.country = (_g = active == null ? void 0 : active.country) == null ? void 0 : _g.filter((x) => country.find((y) => y.id === x));
            active.custom1 = (_h = active == null ? void 0 : active.custom1) == null ? void 0 : _h.filter((x) => custom1.find((y) => y.id === x));
            active.custom2 = (_i = active == null ? void 0 : active.custom2) == null ? void 0 : _i.filter((x) => custom2.find((y) => y.value === x));
            for (let x in active) {
              if (active[x] === void 0 || active[x].length === 0) {
                delete active[x];
              }
            }
            data.config.showClassificationFilter && ux.showFilters(data.config.classification || "Classification", category, "professionID", null, data.config.classificationCollapse, active, []);
            !data.config.useSubFilters && data.config.showSubClassificationFilter && ux.showFilters(data.config.subclassification || "Sub Classification", subCategory, "roleID", data.config.showClassificationFilter && "professionID", data.config.subclassificationCollapse, active, []);
            data.config.showLocationFilter && ux.showFilters(data.config.location || "Location", state, "state", null, data.config.locationCollapse, active, []);
            !data.config.useSubFilters && data.config.showAreaFilter && ux.showFilters(data.config.area || "Area", city, "city", data.config.showLocationFilter && "state", data.config.areaCollapse, active, []);
            data.config.showCountryFilter && ux.showFilters(data.config.country || "Country", country, "country", null, data.config.countryCollapse, active, []);
            data.config.showWorkTypeFilter && ux.showFilters(data.config.worktype || "Work Type", workType, "workTypeID", null, data.config.workTypeCollapse, active, []);
            data.config.showWorkModelFilter && ux.showFilters(data.config.workModel || "Work Model", workModel, "workModelID", null, data.config.workModelCollapse, active, []);
            data.config.showCustomField1Filter && ux.showFilters(data.config.customField1 || "Custom Field 1", custom1, "customField1", null, data.config.customField1Collapse, active, []);
            data.config.showCustomField2Filter && ux.showFilters(data.config.customField2 || "Custom Field 1", custom2, "customField2", null, data.config.customField2Collapse, active, []);
            if (data.config.useSubFilters) {
              if (data.config.showAreaFilter) {
                setTimeout(() => {
                  createSubFilter(validFilter.city, "city", "state");
                  ux.el.find("[data-rel=filter-toggle]").off("click", enableEv).on("click", enableEv);
                }, 300);
              }
              if (data.config.showSubClassificationFilter) {
                setTimeout(() => {
                  createSubFilter(validFilter.roleID, "roleID", "professionID");
                  ux.el.find("[data-rel=filter-toggle]").off("click", enableEv).on("click", enableEv);
                }, 300);
              }
            }
            data.config.enableSeo && seoNavigate();
            ux.el.find("[data-rel=filter-toggle]").on("click", enableEv);
          }
        });
      };
      fetch(0);
    };
    let seoNavigate = () => {
      let seoPath = [];
      let seoName = [];
      let unique = (v, i, self) => self.indexOf(v) === i;
      for (let i in activeFilter) {
        let n = [];
        activeFilter[i].filter(unique).forEach((x) => {
          var _a;
          let f2 = (_a = validFilter[i]) == null ? void 0 : _a.find((y) => y.id === x);
          if (f2) {
            n.push(f2.value);
            seoPath.push(f2.seo);
          }
        });
        if (n.length > 0) {
          seoName.push(n.join(", "));
        }
      }
      let lastSearch = {
        ...JSON.parse(shazamme.store(LocalStorage.lastSearch)),
        name: seoName.join(" < ")
      };
      let path = `#/${seoPath.join("/")}${lastSearch.page > 0 ? `/pg-${lastSearch.page}` : ""}`;
      lastSearch.path = path;
      shazamme.store(LocalStorage.lastSearch, JSON.stringify(lastSearch));
      window.location = path;
    };
    let toggleView = (view) => {
      if ((view == null ? void 0 : view.length) > 0) {
        ux.el.find("[data-rel=action-toggle-view]").each((_, i) => {
          let off = $(i);
          ux.el.find("[data-rel=job-results-list]").removeClass(off.attr("data-view"));
          off.removeClass("active");
        });
        ux.el.find(`[data-rel=action-toggle-view][data-view=${view}]`).addClass("active");
        ux.el.find("[data-rel=job-results-list]").addClass(view);
      }
    };
    let fetchValidFilters = () => new Promise((resolve, reject) => {
      let category = [];
      let subCategory = [];
      let workType = [];
      let workModel = [];
      let state = [];
      let city = [];
      let country = [];
      let custom1 = [];
      let custom2 = [];
      let toIndex = (v, i, s, p) => {
        return {
          value: v,
          id: i || v,
          seo: (s || i || v).toLowerCase().replace(/[^a-z0-9-._]/g, "-").replace(/-{2,}/g, "-"),
          parent: p
        };
      };
      let seo = {};
      let seoIndex = (n, v) => {
        var _a, _b;
        return (_b = (_a = seo[n]) == null ? void 0 : _a.find((x) => {
          var _a2;
          return ((_a2 = x == null ? void 0 : x.value) == null ? void 0 : _a2.toLowerCase()) === (v == null ? void 0 : v.toLowerCase());
        })) == null ? void 0 : _b.seo;
      };
      let fetch = (pageNumber) => {
        shApi.getJobs(0, 0, defaultFilter).then((jobs) => {
          if (jobs.values && jobs.values.length > 0) {
            category.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.professionID) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.category, j.data.professionID, j.data.professionSeo)));
            subCategory.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.roleID) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.subCategory, j.data.roleID, j.data.roleSeo, j.data.professionID)));
            workType.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.workTypeID) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.workType, j.data.workTypeID, j.data.workTypeSeo)));
            workModel.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.workModelID) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.workModel, j.data.workModelID, j.data.workModelSeo)));
            state.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.state) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.state, j.data.state, seoIndex("state", j.data.state))));
            city.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.city) == null ? void 0 : _a.length) > 0;
            }).map((j) => j.data.state && j.data.city && toIndex(j.data.city, j.data.city, seoIndex("city", j.data.city), j.data.state)));
            country.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.country) == null ? void 0 : _a.length) > 0;
            }).map((j) => toIndex(j.data.country, j.data.country, seoIndex("country", j.data.country))));
            custom1.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.customField1) == null ? void 0 : _a.length) > 0;
            }).map((j) => j.data.customField1 && toIndex(j.data.customField1)));
            custom2.push(...jobs.values.filter((j) => {
              var _a;
              return ((_a = j.data.customField2) == null ? void 0 : _a.length) > 0;
            }).map((j) => j.data.customField2 && toIndex(j.data.customField2)));
            resolve({
              professionID: category.filter((v) => v == null ? void 0 : v.value),
              roleID: subCategory.filter((v) => v == null ? void 0 : v.value),
              workTypeID: workType.filter((v) => v == null ? void 0 : v.value),
              workModelID: workModel.filter((v) => v == null ? void 0 : v.value),
              state: state.filter((v) => v == null ? void 0 : v.value),
              city: city.filter((v) => v == null ? void 0 : v.value),
              country: country.filter((v) => v == null ? void 0 : v.value),
              customField1: custom1.filter((v) => v == null ? void 0 : v.value),
              customField2: custom2.filter((v) => v == null ? void 0 : v.value)
            });
          } else {
            resolve({});
          }
        });
      };
      if (data.config.enableSeo) {
        shazamme.fetch(Collection.locationSeo).then((r) => {
          var _a;
          if (r.length > 0) {
            return Promise.resolve(JSON.parse(((_a = r[0].data) == null ? void 0 : _a.value) || null));
          } else {
            return Promise.resolve({});
          }
        }).then((r) => {
          var _a, _b, _c;
          seo.city = (_a = r == null ? void 0 : r.city) == null ? void 0 : _a.map((v) => new Object({ value: v.city, seo: v.seo }));
          seo.state = (_b = r == null ? void 0 : r.state) == null ? void 0 : _b.map((v) => new Object({ value: v.state, seo: v.seo }));
          seo.country = (_c = r == null ? void 0 : r.country) == null ? void 0 : _c.map((v) => new Object({ value: v.country, seo: v.seo }));
          if (data.config.catchAllFilter && data.config.catchAllState && data.config.catchAllStateSeo) {
            seo.state = seo.state || [];
            seo.state.push({ value: data.config.catchAllState, seo: data.config.catchAllStateSeo });
          }
          fetch(0);
        });
      } else {
        fetch(0);
      }
    });
    let filtersFromParams = (useConfig = false) => {
      var _a, _b, _c;
      let filters = {};
      let add = (filter, value) => {
        if ((value == null ? void 0 : value.length) > 0) {
          filters[filter] = value.split(",");
        }
      };
      if (!useConfig) {
        let params = ux.uri.searchParams;
        add("keyword", (_a = params.get("keyword")) == null ? void 0 : _a.toLowerCase());
        add("category", params.get("category"));
        add("subCategory", params.get("subcategory"));
        add("location", (_b = params.get("location")) == null ? void 0 : _b.toLowerCase());
        add("state", params.get("state"));
        add("city", params.get("city"));
        add("workType", params.get("workType"));
        add("workModel", params.get("workModel"));
        add("advertiserID", params.get("advertiserID"));
        add("country", params.get("country"));
        add("professionID", params.get("professionID"));
        add("roleID", params.get("roleID"));
        add("workTypeID", params.get("workTypeID"));
        let salaryFrom = parseInt(params.get("salaryFrom"));
        let salaryTo = parseInt(params.get("salaryTo"));
        if (salaryFrom > 0) filters.salaryFrom = [salaryFrom];
        if (salaryTo > 0) filters.salaryTo = [salaryTo];
        if (data.config.enableProximitySearch) {
          let geo = (_c = params.get("geo")) == null ? void 0 : _c.split(",");
          if ((geo == null ? void 0 : geo.length) == 2) {
            filters["geo"] = [{
              lat: parseFloat(geo[0]),
              lon: parseFloat(geo[1])
            }];
            filters["geoRange"] = [parseFloat(params.get("geoRange")) || 10];
            add("geoAddress", params.get("geoAddress"));
            add("geoIn", params.get("geoIn"));
          }
        }
      } else {
        add("keyword", data.config.defaultKeyword);
        add("category", data.config.defaultCategory);
        add("subCategory", data.config.defaultSubCategory);
        add("state", data.config.defaultState);
        add("city", data.config.defaultCity);
        add("advertiserID", data.config.defaultAdvertiserID);
        add("country", data.config.defaultCountry);
        add("workType", data.config.defaultWorkType);
        add("jobType", data.config.defaultJobtype);
        add("customField1", data.config.defaultCustomField1);
        add("customField2", data.config.defaultCustomField2);
        add("tags", data.config.defaultTags);
        add("industry", data.config.defaultIndustry);
      }
      return filters;
    };
    let filtersFromSeo = (f2) => {
      let search = (index, value) => {
        var _a;
        return ((_a = index == null ? void 0 : index.filter((x) => (x == null ? void 0 : x.seo) === value)) == null ? void 0 : _a.map((x) => x.id)) || [];
      };
      let unique = (v, i, self) => self.indexOf(v) === i;
      let seo = {
        professionID: [],
        roleID: [],
        city: [],
        state: [],
        country: [],
        workTypeID: [],
        workModelID: []
      };
      ux.uri.hash.substring(1).split("/").forEach((x) => {
        data.config.showClassificationFilter && seo.professionID.push(...search(f2.professionID, x).filter(unique));
        data.config.showSubClassificationFilter && seo.roleID.push(...search(f2.roleID, x).filter(unique));
        data.config.showAreaFilter && seo.city.push(...search(f2.city, x).filter(unique));
        data.config.showLocationFilter && seo.state.push(...search(f2.state, x).filter(unique));
        data.config.showCountryFilter && seo.country.push(...search(f2.country, x).filter(unique));
        data.config.showWorkTypeFilter && seo.workTypeID.push(...search(f2.workTypeID, x).filter(unique));
        data.config.showWorkModelFilter && seo.workModelID.push(...search(f2.workModelID, x).filter(unique));
      });
      return seo;
    };
    const saveSearch = (u, n, a) => shazamme.site().then(
      (s) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        return shazamme.submit({
          action: "Create Job Alert",
          siteID: s.siteID,
          candidateID: u.candidateID,
          searchName: n,
          professionID: (_a = activeFilter.professionID) == null ? void 0 : _a.join(","),
          keyword: (_b = activeFilter.keyword) == null ? void 0 : _b.join(","),
          roleID: (_c = activeFilter.roleID) == null ? void 0 : _c.join(","),
          salaryFrom: (_d = activeFilter.salaryFrom) == null ? void 0 : _d.join(","),
          salaryTo: (_e = activeFilter.salaryTo) == null ? void 0 : _e.join(","),
          salaryTypeID: (_f = activeFilter.salaryTypeID) == null ? void 0 : _f.join(","),
          workTypeID: (_g = activeFilter.workTypeID) == null ? void 0 : _g.join(","),
          city: (_h = activeFilter.city) == null ? void 0 : _h.join(","),
          state: (_i = activeFilter.state) == null ? void 0 : _i.join(","),
          address: (_j = activeFilter.geoAddress) == null ? void 0 : _j.join(","),
          radius: (_k = activeFilter.geoRange) == null ? void 0 : _k.join(","),
          radiusIn: activeFilter.geoIn || "miles",
          isNeedAlert: a
        });
      }
    );
    let enableProximitySearch = () => {
      const places = new google.maps.places.PlacesService(document.getElementById("shmMap"));
      const autocomplete = new google.maps.places.AutocompleteService();
      ux.el.find("[data-gapi]").on("keyup", function() {
        let field = $(this);
        let range = field.parents(".section-keyword-search").find("[data-filter=geoRange]");
        clearTimeout(this._debounce);
        field.siblings("[data-prediction]").hide();
        this._debounce = setTimeout(async () => {
          let value = field.val();
          delete activeFilter[field.attr("data-gapi")];
          delete activeFilter[range.attr("data-filter")];
          delete activeFilter[field.attr("data-gapi-text")];
          field.attr("_last", "");
          if (value.length == 0) {
            showJobs(0);
            showFilters();
            shazamme.pub("job-results-filter-change", activeFilter);
            return;
          }
          const request = {
            input: value
          };
          autocomplete.getPlacePredictions({ input: value }, (r) => {
            const menu = field.siblings("[data-prediction]");
            r == null ? void 0 : r.forEach((p) => {
              places.getDetails({ placeId: p.place_id, fields: ["geometry"] }, (d) => {
                menu.append(`<a href="javascript: void(0);" class="result-text" data-value="${d.geometry.location.lat()},${d.geometry.location.lng()}">${p.description}</a>`);
              });
            });
            if ((r == null ? void 0 : r.length) > 0) {
              menu.empty().append(`<a href="javascript: void(0);" class="result-text close" data-value="">x</a>`).show().on("click", "[data-value]", function() {
                let opt = $(this);
                let value2 = opt.attr("data-value");
                field.val(opt.text());
                opt.parents("[data-prediction]").hide();
                if (value2.length > 0) {
                  let geo = value2.split(",");
                  activeFilter[field.attr("data-gapi")] = [{
                    lat: parseFloat(geo[0]),
                    lon: parseFloat(geo[1])
                  }];
                  activeFilter[field.attr("data-gapi-text")] = [opt.text()];
                  activeFilter[range.attr("data-filter")] = [range.val()];
                  field.attr("_last", opt.text());
                }
              });
            }
          });
        }, 500);
      }).on("blur", function() {
        let field = $(this);
        setTimeout(() => {
          field.val(field.attr("_last")).siblings("[data-prediction]").hide();
          showJobs(0);
          showFilters();
          shazamme.pub("job-results-filter-change", activeFilter);
        }, 300);
      });
    };
    let readConfiguration = (w) => w.config().then((c) => {
      if (c == null ? void 0 : c.defaultFilter) {
        defaultFilter = {
          ...defaultFilter,
          ...c == null ? void 0 : c.defaultFilter
        };
        if (data.inEditor) {
          ux.el.find("[data-rel=default-filter]").attr("data-default-filter", "show").show();
        }
      }
      return Promise.resolve();
    });
    ux.el.find("[data-rel=action-menu]").click(function(ev) {
      let menu = $(ev.target).attr("data-menu");
      ux.el.find(`[data-rel=menu][data-menu=${menu}]`).toggle();
    });
    ux.el.find("[data-rel=menu-option]").click(function(ev) {
      let opt = $(ev.target);
      let menu = opt.parents("[data-menu]").attr("data-menu");
      ux.el.find(`[data-rel=action-menu][data-menu=${menu}]`).text(opt.text());
      opt.parents("[data-rel=menu]").hide();
    });
    ux.el.find("[data-sort-field]").removeClass("active");
    ux.el.find(`[data-sort-field=${activeSort.field}][data-sort-direction=${activeSort.direction}]`).addClass("active");
    ux.el.find("[data-sort-field]").click(function(ev) {
      let opt = $(this);
      ux.el.find("[data-sort-field]").removeClass("active");
      opt.addClass("active");
      activeSort = {
        field: opt.attr("data-sort-field"),
        direction: opt.attr("data-sort-direction")
      };
      showJobs(0);
      opt.parents("[data-rel=modal]").hide();
    });
    ux.el.find("[data-rel=button-toggle]").click(function(ev) {
      let opt = $(ev.target);
      if (!opt.is("button")) {
        opt = opt.parents("button");
      }
      ux.el.find(`[data-rel=button-toggle][data-toggle=${opt.attr("data-toggle")}]`).removeClass("active");
      opt.addClass("active");
      showJobs(0);
    });
    ux.el.find("[data-rel=action-save-search]").click(function() {
      let button = $(this);
      let dialog = ux.el.find("[data-rel=modal][data-modal=favorite]");
      dialog.find("input, textarea, select").val("");
      if (button.is("[data-save-alert]") && data.config.alertUri) {
        window.location.href = data.config.alertUri.href;
        return;
      }
      if (data.config.quickSave) {
        if (button.is("[data-save-alert]")) {
          dialog.find("[data-rel=title]").text(data.config.createAlertBtn);
          dialog.find("[data-rel=description]").text(data.config.alertDescription);
          dialog.find("[data-rel=value-favorite-alert]").get(0).checked = true;
        } else {
          dialog.find("[data-rel=title]").text(data.config.favoriteSearch);
          dialog.find("[data-rel=description]").text(data.config.favoriteDescription);
          dialog.find("[data-rel=value-favorite-alert]").get(0).checked = false;
        }
        dialog.show();
      } else {
        shazamme.store("createAlert", JSON.stringify({
          ...activeFilter,
          alert: button.is("[data-save-alert]")
        }));
        shazamme.user().then((u) => {
          var _a;
          if ((_a = u == null ? void 0 : u.candidate) == null ? void 0 : _a.candidateID) {
            window.location.href = ux.buildHref(Path.alerts);
          } else {
            if (shazamme.bag(Subscribe.loginReady)) {
              let loginSubmit = shazamme.sub(Subscribe.loginSubmit, () => {
                window.location.href = ux.buildHref(Path.alerts);
              });
              let loginCancel = shazamme.sub(Subscribe.loginCancel, () => {
                shazamme.unsub(loginSubmit);
                shazamme.unsub(loginCancel);
              });
              shazamme.pub(Message.loginShow);
            } else {
              window.location.href = ux.buildHref(Path.login);
            }
          }
        });
      }
    });
    ux.el.find("[data-rel=button-toggle-filter]").on("click", function() {
      ux.el.find(".section-job-result-filter").toggleClass("active");
      ux.el.find(".section-details").toggleClass("blur");
    });
    ux.el.find("[data-rel=action-toggle-view]").on("click", function() {
      toggleView($(this).attr("data-view"));
    });
    if (data.config.apikey && data.config.apikey.length > 0) {
      ux.el.find("[data-toggle=results-view]").show();
    }
    const main = (w) => {
      var _a, _b, _c;
      activeFilter = filtersFromParams();
      defaultFilter = filtersFromParams(true);
      toggleView(ux.el.find(`[data-device-default=${data.device}]`).attr("data-view"));
      if (activeFilter.keyword) {
        ux.el.find("[data-rel=job-result-filter-keyword][data-keyword-field=keyword]").val(activeFilter.keyword);
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).show();
      }
      if (activeFilter.location) {
        ux.el.find("[data-rel=job-result-filter-keyword][data-keyword-field=location]").val(activeFilter.location);
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=location]`).show();
      }
      if (activeFilter.geoAddress) {
        ux.el.find("[data-gapi]").val(activeFilter.geoAddress[0]).parents(".section-keyword-search").find("[data-filter=geoRange]").val(activeFilter.geoRange[0]).siblings("[data-rel=geo-range-display]").text(`${activeFilter.geoRange[0]} ${data.config.proximityDiameter == "6371" ? "mi" : "km"}`);
        ux.el.find(`[data-rel=job-result-filter-gapi-clear]`).show();
      }
      if (data.config.enableProximitySearch) {
        enableProximitySearch();
      }
      ux.showLoading();
      shazamme.site().then((s) => {
        var _a2, _b2;
        const site = shazamme.bag("site-config");
        Collection.job = {
          path: `/job-results/${s.siteID}`,
          useCache: true,
          isExternal: true,
          lang: ((_a2 = site == null ? void 0 : site.configuration) == null ? void 0 : _a2.jobLocalization) && data.locale,
          fieldMap: (_b2 = site == null ? void 0 : site.configuration) == null ? void 0 : _b2.jobFieldMap
        };
        return Promise.resolve();
      }).then(() => Promise.all([
        shazamme.fetch(Collection.job),
        shApi.ready(),
        readConfiguration(w)
      ])).then(() => fetchValidFilters()).then((valid) => {
        var _a2;
        validFilter = valid;
        if (data.config.enableSeo) {
          let seo = filtersFromSeo(valid);
          for (let i in seo) {
            let s = seo[i];
            if ((s == null ? void 0 : s.length) > 0) {
              let f2 = activeFilter[i] = activeFilter[i] || [];
              f2.push(...s);
              activeFilter[i] = f2;
            }
          }
        }
        let page = parseInt((_a2 = window.location.hash.split("/").find((p) => p.indexOf("pg-") >= 0)) == null ? void 0 : _a2.substr(3)) - 1 || 0;
        showJobs(page);
        showFilters();
        w.pub("job-search-set", activeFilter);
        ux.showLoading(false);
      });
      if (data.config.showSalaryFilter) {
        ux.showSalaryFilter().onChange((sender, args) => {
          if (args.min == sender.min() && args.max == sender.max()) {
            if (activeFilter.salaryFrom || activeFilter.salaryTo) {
              delete activeFilter.salaryFrom;
              delete activeFilter.salaryTo;
              showJobs(0);
              showFilters();
              shazamme.pub("job-results-filter-change", activeFilter);
            }
          } else {
            activeFilter["salaryFrom"] = [args.min];
            activeFilter["salaryTo"] = [args.max];
            showJobs(0);
            showFilters();
            shazamme.pub("job-results-filter-change", activeFilter);
          }
        }).set({
          min: ((_a = activeFilter.salaryFrom) == null ? void 0 : _a.at(0)) > 0 ? activeFilter.salaryFrom[0] : void 0,
          max: ((_b = activeFilter.salaryTo) == null ? void 0 : _b.at(0)) > 0 ? activeFilter.salaryTo[0] : void 0
        });
      }
      w.sub("job-search-submit", (m) => {
        activeFilter = m;
        if (m.keyword) {
          ux.el.find("[data-rel=job-result-filter-keyword][data-keyword-field=keyword]").val(m.keyword);
          ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).show();
          activeFilter.keyword = m.keyword.map((k) => k.toLowerCase());
        } else {
          ux.el.find("[data-rel=job-result-filter-keyword][data-keyword-field=keyword]").val("");
          ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).hide();
        }
        if (!m.geo) {
          delete activeFilter.geoAddress;
          delete activeFilter.geoRange;
        } else {
          let geo = activeFilter.geo[0].split(",");
          if ((geo == null ? void 0 : geo.length) == 2) {
            activeFilter.geo = [{
              lat: parseFloat(geo[0]),
              lon: parseFloat(geo[1])
            }];
            activeFilter.geoRange = [parseFloat(activeFilter.geoRange[0]) || 10];
            ux.el.find("[data-gapi]").val(activeFilter.geoAddress[0] || "").parents(".section-keyword-search").find("[data-filter=geoRange]").val(activeFilter.geoRange[0]).siblings("[data-rel=geo-range-display]").text(`${activeFilter.geoRange[0]} ${data.config.proximityDiameter == "6371" ? "mi" : "km"}`);
          } else {
            delete activeFilter.geo;
            delete activeFilter.geoAddress;
            delete activeFilter.geoRange;
          }
        }
        showJobs(0);
        showFilters();
      }).sub("job-results-filter-change", (m) => {
        w.pub("job-search-set", m);
      }).sub(Message.saveJob, (m) => {
        const go = (cid) => {
          var _a2;
          let op = void 0;
          if (((_a2 = m.saveID) == null ? void 0 : _a2.length) > 0) {
            op = shApi.deleteSavedJob(m.saveID);
          } else {
            op = shApi.saveJob(m.jobID, cid);
          }
          op.then((r) => {
            if (m.saveID) {
              m.sender.removeClass("active").attr("data-save-id", "").attr("title", data.config.saveJobText || "save job");
              let i = savedJobs.findIndex((s) => s.candidateSavedJobID === m.saveID);
              if (i >= 0) {
                savedJobs.splice(i, 1);
              }
            } else {
              let saveID = r.response.item.candidateSavedJobID;
              m.sender.addClass("active").attr("data-save-id", saveID).attr("title", data.config.unsaveJobText || "unsave job");
              savedJobs.push({
                jobID: m.jobID,
                candidateSavedJobID: saveID
              });
            }
          });
        };
        shazamme.user().then((u) => {
          if (!(u == null ? void 0 : u.candidate)) {
            if (shazamme.bag(Subscribe.loginReady)) {
              w.sub(Subscribe.loginSubmit, (u2) => {
                var _a2;
                shApi.getSavedJobs((_a2 = u2 == null ? void 0 : u2.candidate) == null ? void 0 : _a2.candidateID).then((r) => {
                  var _a3, _b2, _c2;
                  if (!((_b2 = (_a3 = r == null ? void 0 : r.response) == null ? void 0 : _a3.items) == null ? void 0 : _b2.find((j) => j.jobID === m.jobID))) {
                    go((_c2 = u2 == null ? void 0 : u2.candidate) == null ? void 0 : _c2.candidateID);
                  }
                });
                w.unsub(Subscribe.loginSubmit).unsub(Subscribe.loginCancel);
              }).sub(Subscribe.loginCancel, () => {
                w.unsub(Subscribe.loginSubmit).unsub(Subscribe.loginCancel);
              });
              w.pub(Message.loginShow);
            } else {
              shApi.marshalSaveJob(m.jobID);
              window.location = ux.buildHref(Path.login);
            }
          } else {
            go(u.candidate.candidateID);
          }
        });
      });
      const manageUser = (u) => {
        if (u == null ? void 0 : u.candidate) {
          shApi.getSavedJobs(u.candidate.candidateID).then((r) => {
            let saved = [];
            r.response.items.forEach((j) => {
              saved.push({
                jobID: j.jobID,
                candidateSavedJobID: j.candidateSavedJobID
              });
              ux.el.find(`[data-rel=article-job-result][data-id=${j.jobID}] [data-rel=action-save-job]`).attr("data-rel", "action-unsave-job").attr("title", data.config.unsaveJobText || "unsave job").attr("data-save-id", j.candidateSavedJobID).addClass("active");
            });
            savedJobs = saved;
          });
          ux.el.find("[data-user-known]").hide();
          ux.el.find("[data-user-known=true]").show();
        } else {
          ux.el.find(`[data-rel=article-job-result] [data-rel=action-save-job], [data-rel=article-job-result] [data-rel=action-unsave-job]`).attr("data-rel", "action-save-job").attr("data-save-id", "").attr("title", data.config.saveJobText || "save job").removeClass("active");
          ux.el.find("[data-user-known]").hide();
          ux.el.find("[data-user-known=false]").show();
        }
      };
      shazamme.store("createAlert", null);
      if (ux.uri.hash.length === 0) {
        shazamme.store(LocalStorage.lastSearch, null);
      }
      shazamme.user().then((u) => {
        manageUser(u);
      });
      w.sub(Subscribe.auth, (u) => manageUser(u));
      w.sub(Subscribe.siteReady, () => {
        var _a2, _b2, _c2, _d, _e, _f, _g;
        const site = shazamme.bag("site-config");
        Path.login = ((_a2 = site == null ? void 0 : site.configuration) == null ? void 0 : _a2.pathLogin) || Path.login;
        Path.alerts = ((_b2 = site == null ? void 0 : site.configuration) == null ? void 0 : _b2.pathAlerts) || Path.alerts;
        Path.dashboard = ((_c2 = site == null ? void 0 : site.configuration) == null ? void 0 : _c2.pathDashboard) || Path.dashboard;
        Path.jobApply = ((_d = site == null ? void 0 : site.configuration) == null ? void 0 : _d.pathJobApply) || Path.jobApply;
        Path.jobDetails = ((_e = site == null ? void 0 : site.configuration) == null ? void 0 : _e.pathJobDetails) || Path.jobDetails;
        if ((((_f = site == null ? void 0 : site.configuration) == null ? void 0 : _f.jobLocalization) || ((_g = site == null ? void 0 : site.configuration) == null ? void 0 : _g.jobFieldMap)) && !(Collection.job.lang || Collection.job.fieldMap)) {
          shazamme.site().then((s) => {
            var _a3, _b3;
            Collection.job = {
              path: `/job-results/${s.siteID}`,
              useCache: true,
              isExternal: true,
              lang: ((_a3 = site == null ? void 0 : site.configuration) == null ? void 0 : _a3.jobLocalization) && data.locale,
              fieldMap: (_b3 = site == null ? void 0 : site.configuration) == null ? void 0 : _b3.jobFieldMap
            };
            ux.showLoading();
            shazamme.fetch(Collection.job).then(() => fetchValidFilters()).then((valid) => {
              var _a4;
              validFilter = valid;
              if (data.config.enableSeo) {
                let seo = filtersFromSeo(valid);
                for (let i in seo) {
                  let s2 = seo[i];
                  if ((s2 == null ? void 0 : s2.length) > 0) {
                    let f2 = activeFilter[i] = activeFilter[i] || [];
                    f2.push(...s2);
                    activeFilter[i] = f2;
                  }
                }
              }
              let page = parseInt((_a4 = window.location.hash.split("/").find((p) => p.indexOf("pg-") >= 0)) == null ? void 0 : _a4.substr(3)) - 1 || 0;
              showJobs(page);
              showFilters();
              w.pub("job-search-set", activeFilter);
              ux.showLoading(false);
            });
          });
        }
      });
      if (data.inEditor) {
        ux.el.find("[data-rel=action-set-default-filter]").on("click", function() {
          w.config().then(
            (c) => w.config({
              ...c,
              defaultFilter: activeFilter
            })
          ).then(() => {
            window.location.reload();
          });
        });
        ux.el.find("[data-rel=action-remove-default-filter]").on("click", function() {
          w.config().then((c) => {
            c == null ? true : delete c.defaultFilter;
            return w.config({
              ...c
            });
          }).then(() => {
            window.location.reload();
          });
        });
      }
      ux.el.addClass("shaz-job-results").find(".shmMainContainer").removeClass("hidden");
      if (((_c = data.config.dialogWaitAnimation) == null ? void 0 : _c.indexOf("lottie.host")) >= 0) {
        data.config.dialogWaitAnimation = "https://assets2.lottiefiles.com/packages/lf20_szlepvdh.json";
        ux.el.find("[data-rel=wait]").each(function() {
          let src = $(this).attr("src") || "";
          if (src.indexOf("lottie.host") >= 0) {
            $(this).attr("src", "https://assets2.lottiefiles.com/packages/lf20_szlepvdh.json");
          }
        });
      }
    };
    ux.el.find("[data-rel=job-result-filter-keyword]").val(activeFilter[$(this).attr("data-keyword-field")] || "").on("keyup", function() {
      var _a;
      clearTimeout(this.submitTimeout);
      let field = $(this).attr("data-keyword-field");
      if (((_a = this.value) == null ? void 0 : _a.length) > 0) {
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).show();
      } else {
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).hide();
      }
      this.submitTimeout = setTimeout(() => {
        let kw = $(this).val().trim();
        if (kw.length > 0) {
          activeFilter[field] = kw.toLowerCase().split(",");
        } else {
          delete activeFilter[field];
        }
        showJobs(0);
        shazamme.pub("job-results-filter-change", activeFilter);
        showFilters();
      }, 500);
    }).on("change", function() {
      var _a;
      clearTimeout(this.submitTimeout);
      let field = $(this).attr("data-keyword-field");
      if (((_a = this.value) == null ? void 0 : _a.length) > 0) {
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).show();
      } else {
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).hide();
      }
      this.submitTimeout = setTimeout(() => {
        let kw = $(this).val().trim();
        if (kw.length > 0) {
          activeFilter[field] = kw.toLowerCase().split(",");
        } else {
          delete activeFilter[field];
        }
        showJobs(0);
        shazamme.pub("job-results-filter-change", activeFilter);
        showFilters();
      }, 500);
    });
    ux.el.find("[data-rel=job-result-filter-keyword-clear]").on("click", function() {
      let field = $(this).attr("data-keyword-field");
      ux.el.find(`[data-rel=job-result-filter-keyword][data-keyword-field=${field}]`).val("");
      $(this).hide();
      delete activeFilter[field];
      showJobs(0);
      showFilters();
      shazamme.pub("job-results-filter-change", activeFilter);
    });
    ux.el.find("[data-rel=job-result-filter-gapi-clear]").on("click", function() {
      let field = ux.el.find(`[data=gapi=${$(this).attr("data-geo-field")}]`);
      let range = field.parents(".section-keyword-search").find("[data-filter=geoRange]");
      field.val("");
      $(this).hide();
      delete activeFilter[field.attr("data-gapi")];
      delete activeFilter[range.attr("data-filter")];
      delete activeFilter[field.attr("data-gapi-text")];
      showJobs(0);
      showFilters();
      shazamme.pub("job-results-filter-change", activeFilter);
    });
    ux.el.find("[data-filter=geoRange]").on("input", function() {
      let f2 = $(this);
      f2.siblings("[data-rel=geo-range-display]").text(`${f2.val()} ${data.config.proximityDiameter == "6371" ? "mi" : "km"}`);
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => {
        activeFilter[f2.attr("data-filter")] = [parseInt(f2.val())];
        showJobs(0);
        showFilters();
        shazamme.pub("job-results-filter-change", activeFilter);
      }, 500);
    }).siblings("[data-rel=geo-range-display]").text(() => `${ux.el.find("[data-filter=geoRange]").val()} ${data.config.proximityDiameter == "6371" ? "mi" : "km"}`);
    ux.el.find("[data-rel=action-mobile-save-search]").on("click", function() {
      let button = $(this);
      let dialog = ux.el.find("[data-rel=modal][data-modal=favorite]");
      dialog.find("input, textarea, select").val("");
      if (button.is("[data-save-alert]")) {
        if (data.config.alertUri) {
          window.location.href = data.config.alertUri.href;
          return;
        }
        dialog.find("[data-rel=title]").text(data.config.createAlertBtn);
        dialog.find("[data-rel=description]").text(data.config.alertDescription);
        dialog.find("[data-rel=value-favorite-alert]").get(0).checked = true;
      } else {
        dialog.find("[data-rel=title]").text(data.config.favoriteSearch);
        dialog.find("[data-rel=description]").text(data.config.favoriteDescription);
        dialog.find("[data-rel=value-favorite-alert]").get(0).checked = false;
      }
      dialog.show();
    });
    ux.el.find("[data-rel=modal][data-modal=favorite] [data-rel=action-save]").on("click", function() {
      var _a;
      const dialog = ux.el.find("[data-rel=modal][data-modal=favorite]");
      const email = dialog.find("[data-rel=value-favorite-email]");
      const site = shazamme.bag("site-config");
      if (email.is(":visible")) {
        if (email.val().length === 0) {
          let warning = data.config.warnNoEmail || "Please provide a valid email address";
          ((_a = site == null ? void 0 : site.alertDialog({
            title: data.config.warnNoEmailTitle || "No Email Provided",
            message: warning
          })) == null ? void 0 : _a.appendTo(ux.el)) || alert(warning);
          return;
        }
      }
      dialog.find("[data-rel=wait]").show();
      shazamme.user().then((u) => (u == null ? void 0 : u.candidate) && Promise.resolve(u.candidate) || shazamme.quickRegister(email.val())).then((u) => {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        let s = {
          candidateID: u == null ? void 0 : u.candidateID,
          searchName: ux.el.find("[data-rel=value-favorite-name]").val(),
          professionID: (_a2 = activeFilter.professionID) == null ? void 0 : _a2.join(","),
          keyword: (_b = activeFilter.keyword) == null ? void 0 : _b.join(","),
          roleID: (_c = activeFilter.roleID) == null ? void 0 : _c.join(","),
          salaryFrom: (_d = activeFilter.salaryFrom) == null ? void 0 : _d.join(","),
          salaryTo: (_e = activeFilter.salaryTo) == null ? void 0 : _e.join(","),
          salaryTypeID: (_f = activeFilter.salaryTypeID) == null ? void 0 : _f.join(","),
          workTypeID: (_g = activeFilter.workTypeID) == null ? void 0 : _g.join(","),
          city: (_h = activeFilter.city) == null ? void 0 : _h.join(","),
          state: (_i = activeFilter.state) == null ? void 0 : _i.join(","),
          address: (_j = activeFilter.geoAddress) == null ? void 0 : _j.join(","),
          radius: (_k = activeFilter.geoRange) == null ? void 0 : _k.join(","),
          radiusIn: activeFilter.geoIn || "miles",
          isNeedAlert: dialog.find("[data-rel=value-favorite-alert]").is(":checked")
        };
        shApi.createSave(s).then(() => {
          dialog.find("[data-rel=wait]").hide();
          dialog.find("[data-rel=okay]").show();
          setTimeout(() => {
            dialog.find("[data-rel=okay]").hide();
            dialog.hide();
          }, 1e3);
        });
      }).catch((ex) => {
        var _a2;
        let warning = (ex == null ? void 0 : ex.code) === "auth/invalid-email" ? data.config.warnBadEmail || "Please provide a valid email address" : (ex == null ? void 0 : ex.msg) || ex || data.config.warnSaveAlert || "We ran into an issue saving your search";
        ((_a2 = site == null ? void 0 : site.alertDialog({
          title: data.config.warnSaveAlertTitle || "Could Not Save",
          message: warning
        })) == null ? void 0 : _a2.appendTo(ux.el)) || alert(warning);
      });
    });
    ux.el.find("button[data-modal]").on("click", function() {
      let button = $(this);
      ux.el.find(`[data-rel=modal]`).hide();
      ux.el.find(`[data-rel=modal][data-modal=${button.attr("data-modal")}]`).show();
    });
    ux.el.find("[data-rel=modal] [data-rel=action-close]").on("click", function() {
      let dialog = $(this).parents("[data-rel=modal]");
      dialog.hide();
    });
    ux.el.find("[data-rel=modal] button .animation").hide();
    if (data.device === "mobile") {
      let toolbar = $(".toolbar-main.mobile");
      let toolbarY = toolbar.offset().top;
      let top = $(".hamburger-header ").height() || 0;
      window.onscroll = () => {
        if (toolbarY < window.pageYOffset) {
          toolbar.addClass("pinned");
          toolbar.css({
            top: `${top}px`
          });
        } else {
          toolbar.removeClass("pinned");
          toolbar.css({
            top: "unset"
          });
        }
      };
      if (data.inEditor) {
        ux.el.find("[data-rel=modal] button .animation").first().show();
      }
    }
    ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(() => shazamme.ready(data.inEditor && data.config.debugSiteID || data.siteId, data.page)).then(
      () => {
        var _a;
        return Promise.all([
          shazamme.style("https://sdk.shazamme.io/css/fontawesome/css/fontawesome.min.css"),
          shazamme.style("https://sdk.shazamme.io/css/fontawesome/css/regular.min.css"),
          ((_a = data.config.apikey) == null ? void 0 : _a.length) > 0 && shazamme.gapi(data.config.apikey).maps(["maps", data.config.enableProximitySearch && "places"]) || Promise.resolve()
        ]);
      }
    ).then(() => main(shazamme.register("job-results", data)));
    ux.loadScript("https://sdk.shazamme.io/plugin/lottie-files/lottie-player-2.0.8.js").then();
  }
  return __toCommonJS(job_results_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-results"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
