/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build bec307500cac. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/candidate-dashboard-tabs.index.js
  var candidate_dashboard_tabs_index_exports = {};
  __export(candidate_dashboard_tabs_index_exports, {
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

  // dist/.gen/candidate-dashboard-tabs.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const DocumentsUrl = "https://shazamme.io/candidate-document";
    const Path = {
      home: data.config.homePage && "/" + data.config.homePage || "/",
      deletedCandidate: data.config.deletedCandidatePage && "/" + data.config.deletedCandidatePage || "/deleted-candidate",
      jobAlerts: data.config.jobAlertsPage && "/" + data.config.jobAlertsPage || "/job-alerts",
      login: data.config.loginPage && "/" + data.config.loginPage || "/login",
      register: data.config.registerPage && "/" + data.config.registerPage || "/register",
      verify: data.config.verifyPage && "/" + data.config.verifyPage || "/forgot-password",
      searchResults: data.config.searchResultsPage && "/" + data.config.searchResultsPage || "/job-results",
      jobDetails: data.config.jobDetailsPage && "/" + data.config.jobDetailsPage || "/job-details",
      screeningAnswers: data.config.screeningAnswersPage && "/" + data.config.screeningAnswersPage || "/screening-answers"
    };
    const Collection = {
      job: {
        name: data.config.JobCollection || "Jobs",
        action: "Get Jobs",
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugJobCollection
      },
      profession: {
        name: data.config.JobCollection || "Professions",
        action: "Get Professions",
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugProfessionCollection
      },
      question: {
        name: data.config.JobCollection || "Screening Questions",
        action: "Get Screening Questions",
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugQuestionCollection
      }
    };
    const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;
    function ShApi() {
      this.savedJobs = (candidateId) => shazamme.submit({
        "action": "Get Saved Jobs",
        "candidateID": candidateId
      }, false);
      this.jobApplications = (candidateId) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Get Job Applications",
          "candidateID": candidateId,
          "siteID": s.siteID
        })
      );
      this.jobAlerts = (candidateId) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Get Job Alerts",
          "candidateID": candidateId,
          "siteID": s.siteID
        })
      );
      this.deleteSavedJob = (id) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Delete Saved Job",
          "candidateSavedJobID": id,
          "siteID": s.siteID
        }, false)
      );
      this.deleteJobAlert = (id) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Delete Job Alert",
          "candidateSearchID": id,
          "siteID": s.siteID
        })
      );
      this.updateAlert = (alert2) => shazamme.submit({
        "action": "Edit Job Alerts",
        ...alert2
      });
      this.getProfile = (email) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Get Candidate",
          "eMail": email,
          "siteID": s.siteID
        })
      );
      this.updateProfile = (profile) => shazamme.site().then(
        (s) => shazamme.submit({
          action: "Edit Candidate Info",
          siteID: s.siteID,
          ...profile
        })
      );
      this.getScreeningTemplate = (screeningTemplateID) => (screeningTemplateID == null ? void 0 : screeningTemplateID.length) > 0 && shazamme.fetch(Collection.question).then(
        (q) => Promise.resolve((q || []).filter((i) => i.data.screeningTemplateID === screeningTemplateID))
      ) || Promise.resolve([]);
      this.getScreeningAnswers = (jobApplicationID) => shazamme.site().then(
        (s) => shazamme.submit({
          action: "Get Screening Answers",
          jobApplicationID,
          siteID: s.siteID
        })
      );
      this.requestExport = (c, answers) => {
        return new Promise((resolve, reject) => {
          shazamme.submit({
            action: "Export Screening Answers",
            templateID: data.config.exportTemplateID,
            responses: answers,
            ...c
          }, false).then((res) => {
            if (res.status && res.response.document && res.response.document.id) {
              let documentID = res.response.document.id;
              let tries = 0;
              let fetch = setInterval(
                () => shazamme.submit({
                  action: "Get Screening Answers Export",
                  documentID
                }, false).then((res2) => {
                  if (res2.status && res2.response.document && res2.response.document.status === "success") {
                    clearInterval(fetch);
                    resolve(res2.response.document.download_url);
                  } else if (!res2.status) {
                    clearInterval(fetch);
                    reject(res2);
                  } else if (tries > 5) {
                    clearInterval(fetch);
                    resolve();
                  } else {
                    tries++;
                  }
                }),
                3e3
              );
            } else {
              reject(res);
            }
          });
        });
      };
      this.getCandidateFiles = (candidateId) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Get Candidate Files",
          "candidateID": candidateId,
          "siteID": s.siteID
        })
      );
      this.getCandidateFileTypes = () => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Get Candidate File Types",
          "siteID": s.siteID,
          "language": data.locale
        })
      );
      this.addCandidateFile = (candidateId, name, content, type) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Add Candidate File",
          "candidateID": candidateId,
          "siteID": s.siteID,
          "candidateFileName": name,
          "candidateFileContent": content,
          "siteCandidateFileTypeID": type
        })
      );
      this.deleteCandidateFile = (id) => shazamme.site().then(
        (s) => shazamme.submit({
          "action": "Delete Candidate File",
          "candidateFileID": id,
          "siteID": s.siteID
        })
      );
    }
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.dateFormat = Intl.DateTimeFormat(navigator.language, { day: "numeric", month: "numeric", year: "numeric" });
      this.showLoading = (showing = true) => {
        if (showing) {
          this.el.find("[data-rel=modal-loading]").show();
        } else {
          this.el.find("[data-rel=modal-loading]").hide();
        }
      };
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
      this.savedJobEl = (save, j) => {
        if (j && j.data.jobURL) {
          let uri = new URL(j.data.jobURL);
          let path = uri.pathname.split("/").pop();
          uri.pathname = `${Path.jobDetails}/${path}`;
          j.data.regionPath = uri.toString();
        }
        return `
            <div class="entry-saved-job" data-rel="item-saved-job" data-id="${save.candidateSavedJobID}">
                <a href="${j && j.data.regionPath}" target="${data.config.newTab ? "_blank" : "_self"}" class="link-title">${j && j.data.jobName}</a>
                <div class="section-actions">
                    <a href="${j && j.data.regionPath}" target="${data.config.newTab ? "_blank" : "_self"}" class="button-view"><i class="far fa-eye"></i></a>
                    <i class="button-delete far fa-trash-alt" data-rel="button-delete"></i>
                </div>
            </div>
        `;
      };
      this.applicationEl = (app, j) => {
        if (j && j.data.jobURL) {
          let uri = new URL(j.data.jobURL);
          let path = uri.pathname.split("/").pop();
          uri.pathname = `${Path.jobDetails}/${path}`;
          j.data.regionPath = uri.toString();
        }
        return `
            <div class="entry-application" data-rel="item-application" data-id="${app.jobApplicationID}" data-job-id="${app.jobID}">
                <a href="${j && j.data.regionPath}" target="${data.config.newTab ? "_blank" : "_self"}" class="link-title" title="${j && j.data.jobName}">${j && j.data.jobName}</a>
                <div class="label-date">${this.dateFormat.format(new Date(app.appliedOn))}</div>
                ${data.config.enableApplicationEdit && '<i class="button-edit far fa-edit" data-rel="button-edit"></i>' || ""}
                ${data.config.enableApplicationExport && '<a href="javascript:return void(0);" class="button-export fas fa-file-download" data-rel="button-export"></a>' || ""}
            </div>
        `;
      };
      this.alertEl = (alert2, profession) => {
        let query = [];
        let push = (f, v) => {
          (alert2[f] || v) && query.push(`${f}=${encodeURI(alert2[f] || v)}`);
        };
        let m = JSON.parse(alert2.meta || "{}");
        push("professionID");
        push("keyword");
        push("location", alert2.address || m.address);
        push("roleID");
        push("salaryFrom");
        push("salaryTo");
        push("workTypeID");
        push("city", alert2.city || m.city);
        push("state");
        push("postalCode");
        push("radius");
        push("radiusIn");
        if (alert2.latitude || alert2.longitude) {
          let pos = [];
          alert2.latitude && pos.push(alert2.latitude);
          alert2.longitude && pos.push(alert2.longitude);
          push("geo", pos.join(","));
          push("geoRange", alert2.radius);
          push("geoAddress", alert2.address);
          push("geoIn", alert2.radiusIn);
        }
        return `
        <div class="entry-job-alert" data-rel="item-job-alert" data-id="${alert2.candidateSearchID}">
            <div>
                <a href="${this.buildHref(Path.searchResults, query.join("&"))}" class="link-title" title="${alert2.searchName}">${alert2.searchName}</a>
                <i class="far fa-edit" data-rel="button-edit"></i>
            </div>
            <div class="section-actions">
                <input class="button-enable" type="checkbox" ${alert2.isNeedAlert ? "checked" : ""} />
                <i class="far fa-trash-alt" data-rel="button-delete"></i>
            </div>
        </div>
        `;
      };
      this.candidateFileEl = (f) => {
        return `
            <div class="grid-entry entry-candidate-file" data-rel="item-candidate-file" data-id="${f.data.candidateFileID}">
                <a href="${f.data.fileUri}" target="_blank" class="link-title column-left">${f.data.candidateFileName}</a>
                <span class="text-type column">${f.data.type || ""}</span>
                <div class="section-actions column-right">
                    <i class="button-delete far fa-trash-alt" data-rel="button-delete"></i>
                </div>
            </div>
        `;
      };
      this.enablePasswordValidation = (on = true) => {
        let sender = this;
        if (!on) {
          this.el.find("#newPass").off();
          return;
        }
        this.el.find("#newPass").on("focus", function() {
          $("#passwordMessage,.arrow-bottom").css("display", "flex");
        }).on("blur", function() {
          if ($(this).is(":not([invalid])")) {
            $("#passwordMessage, .arrow-bottom").css("display", "none");
          }
        }).on("keyup", function() {
          if (sender.passwordKeyupTimeout) {
            clearTimeout(sender.passwordKeyupTimeout);
          }
          sender.passwordKeyupTimeout = setTimeout(() => {
            let errorCount = 0;
            let val = $(this).val();
            let passwordInput = sender.el.find("#newPass");
            let capital = sender.el.find("#capital");
            let number = sender.el.find("#number");
            let length = sender.el.find("#length");
            let specialChar = sender.el.find("#specialChar");
            if (!(val.length < 8)) {
              length.removeClass("invalid").addClass("valid");
            } else {
              length.removeClass("valid").addClass("invalid");
              errorCount++;
            }
            if (val.search(/(?=.*[A-Z])/) != -1) {
              capital.removeClass("invalid").addClass("valid");
              status = true;
            } else {
              capital.removeClass("valid").addClass("invalid");
              errorCount++;
            }
            if (val.search(/\d/) != -1) {
              number.removeClass("invalid").addClass("valid");
            } else {
              number.removeClass("valid").addClass("invalid");
              errorCount++;
            }
            if (val.search(/(?=.*[!@#$%^&*])/) != -1) {
              specialChar.removeClass("invalid").addClass("valid");
            } else {
              specialChar.removeClass("valid").addClass("invalid");
              errorCount++;
            }
            if (errorCount === 0) {
              sender.el.find(".passwordErrorTitle").text("Your password is acceptable!");
              sender.el.find("#passwordMessage").css("background-color", "#59db5d");
              sender.el.find(".valid,.passwordErrorTitle").css("color", "#fff");
              sender.el.find(".arrow-bottom").css({
                "border-top": "15px solid #59db5d"
              });
              $(this).removeAttr("invalid");
            } else {
              sender.el.find(".passwordErrorTitle").text("Password must contain the following");
              sender.el.find("#passwordMessage").css("background-color", "#ffa1a1");
              sender.el.find("#passwordMessage,.passwordErrorTitle, .invalid").css("color", "red");
              sender.el.find(".arrow-bottom").css({
                "border-top": "15px solid #ffa1a1"
              });
              $(this).attr("invalid", "");
            }
          }, 350);
        });
      };
      this.activateTab = (tab) => {
        this.el.find("[data-rel=dashboard-tab]").hide();
        this.el.find(`[data-rel=dashboard-tab data-tab=${tab}]`).show();
      };
      this.loadScript = (src) => window.__shazLoadScript(src);
      this.enablePasswordValidation();
    }
    const shApi = new ShApi();
    const ux = new UX();
    let photoUpload = void 0;
    let cvUpload = void 0;
    let coverUpload = void 0;
    let showProfile = (c) => {
      let address = [
        (c == null ? void 0 : c.address) || "",
        (c == null ? void 0 : c.city) || "",
        (c == null ? void 0 : c.state) || "",
        (c == null ? void 0 : c.country) || "",
        (c == null ? void 0 : c.postalCode) || ""
      ].join(",").replace(/^(,\s?)+?\s/, "").replace(/(,\s?){2,}/g, ", ").replace(/(,\s?)+?$/, "");
      let photo = (c == null ? void 0 : c.photo) && `data:image/jpeg;base64,${c == null ? void 0 : c.photo}` || "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1";
      ux.el.find(".accDashboard-addressDetail").text(address);
      ux.el.find(".accDashboard-accName").text(`${(c == null ? void 0 : c.firstName) || ""} ${(c == null ? void 0 : c.surname) || ""}`);
      ux.el.find(".accDashboard-detailEmail").text((c == null ? void 0 : c.eMail) || "");
      ux.el.find(".accDashboard-detailPhone").text((c == null ? void 0 : c.phone) || "N/A");
      ux.el.find(".accDashboard-accImg").css("background-image", `url(${photo})`);
      if (c == null ? void 0 : c.cVFileContent) {
        ux.el.find(".accDashboard-detailResume").text((c == null ? void 0 : c.cVFileName) || data.config.EditProfileNoResumeStatusLabel || "No Resume Uploaded").attr("href", `data:;base64,${c == null ? void 0 : c.cVFileContent}`).attr("download", c == null ? void 0 : c.cVFileName);
      }
      ux.el.find("#salutation").val((c == null ? void 0 : c.salutation) == "" ? "Please Select" : c == null ? void 0 : c.salutation);
      ux.el.find("#candFnameText").val(c == null ? void 0 : c.firstName);
      ux.el.find("#candLnameText").val(c == null ? void 0 : c.surname);
      ux.el.find("#candAddress").val(c == null ? void 0 : c.address);
      ux.el.find("#candCity").val(c == null ? void 0 : c.city);
      ux.el.find("#candState").val(c == null ? void 0 : c.state);
      ux.el.find("#candCountry").val(c == null ? void 0 : c.country);
      ux.el.find("#candPostal").val(c == null ? void 0 : c.postalCode);
      ux.el.find("#candPhone").val(c == null ? void 0 : c.phone);
      ux.el.find("#candMobile").val(c == null ? void 0 : c.mobile);
      ux.el.find("#candSkills").val(c == null ? void 0 : c.skillTags);
      ux.el.find(".editCand-candImg img").attr({
        src: photo,
        alt: `${c == null ? void 0 : c.firstName} ${c == null ? void 0 : c.surname}`
      });
      ux.el.find(".editCand-candResumeFileName").text((c == null ? void 0 : c.cVFileName) || "Upload Resume");
      ux.el.find(".editCand-candCoverFileName").text((c == null ? void 0 : c.coverLetterFileName) || data.config.EditProfileNoCoverStatusLabel || "Upload Cover Letter");
    };
    ux.el.find(".accDashboard-editProfileText").click(function() {
      let isMobile = data.device == "mobile" ? "block" : "flex";
      ux.el.find(".accDashboard-editAccDetails").fadeIn().css("display", isMobile);
      ux.el.find(".accDashboard-genAccDetails").hide();
      if (data.inEditor) {
        return;
      }
      if (!firebase.auth().currentUser || firebase.auth().currentUser.providerData[0].providerId !== "password") {
        ux.el.find(".editCand-candCurrent").hide();
        ux.el.find(".editCand-newPass").hide();
        ux.el.find(".editCand-confirmPass").hide();
      }
    });
    ux.el.find(".editCand-cancelDetails").click(function() {
      window.location.reload(true);
    });
    ux.el.find(".editCand-candImgUploadBtn").click(function() {
      $(this).next("#candImgUpload").trigger("click");
    });
    ux.el.find("#candImgUpload").on("change", function() {
      readFile(this.files[0]).then((b) => {
        photoUpload = btoa(b);
        ux.el.find(".editCand-candImg img").attr("src", "data:image/jpeg;base64," + photoUpload);
      });
    });
    ux.el.find(".editCand-candResumeFile").click(function() {
      ux.el.find("#candResumeUpload").trigger("click");
    });
    ux.el.find("#candResumeUpload").on("change", function() {
      var _a;
      let size = (_a = this.files[0]) == null ? void 0 : _a.size;
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(this).val("");
        return;
      }
      ux.el.find(".editCand-candResumeFileName").text(this.files[0].name);
      readFile(this.files[0]).then((b) => {
        cvUpload = btoa(b);
      });
    }).each(function() {
      var _a;
      let size = (_a = this.files[0]) == null ? void 0 : _a.size;
      if (this.files.length == 0) {
        return;
      }
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(this).val("");
        return;
      }
      ux.el.find(".editCand-candResumeFileName").text(this.files[0].name);
      readFile(this.files[0]).then((b) => {
        cvUpload = btoa(b);
      });
    });
    ux.el.find("#candCoverUpload").on("change", function() {
      var _a;
      let size = (_a = this.files[0]) == null ? void 0 : _a.size;
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(this).val("");
        return;
      }
      ux.el.find(".editCand-candCoverFileName").text(this.files[0].name);
      readFile(this.files[0]).then((b) => {
        coverUpload = btoa(b);
      });
    }).each(function() {
      var _a;
      let size = (_a = this.files[0]) == null ? void 0 : _a.size;
      if (this.files.length == 0) {
        return;
      }
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(this).val("");
        return;
      }
      ux.el.find(".editCand-candCoverFileName").text(this.files[0].name);
      readFile(this.files[0]).then((b) => {
        coverUpload = btoa(b);
      });
    });
    ux.el.find(".editCand-saveDetails").click(function() {
      if (ux.el.find("#newPass").val() != ux.el.find("#confirmPass").val()) {
        alert("Password does not match");
        return;
      }
      ;
      ux.showLoading();
      updateProfile();
    });
    ux.el.find(".editCand-deleteAccount").click(function() {
      let user = firebase.auth().currentUser;
      let prvder = user ? user.providerData[0].providerId : "";
      if (prvder === "password") {
        ux.el.find(".editCand-deleteModal.password").fadeIn().css("display", "flex");
      } else {
        ux.el.find(".editCand-deleteModal.provider").fadeIn().css("display", "flex");
      }
    });
    ux.el.find(".editCand-accountDeleteIcon").click(function() {
      ux.el.find(".editCand-deleteModal").fadeOut();
    });
    ux.el.find("[data-rel=button-new-file]").click(function() {
      ux.el.find("[data-rel=modal-new-file]").fadeIn().css("display", "flex");
    });
    ux.el.find("[data-rel=modal-new-file] .file-button input[type=file]").on("change", function() {
      let file = this.files[0];
      ux.el.find("[data-rel=modal-new-file] .text-file-name").text((file == null ? void 0 : file.name) || "");
    });
    ux.el.find("[data-rel=modal-new-file]").on("click", "[data-rel=button-save]", function() {
      let dialog = $(this).parents("[data-rel=modal-new-file]");
      let field2 = dialog.find("input[type=file]");
      let file = field2.get(0).files[0];
      if (file) {
        if (file.size > maxUploadSize) {
          alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
          field2.val("");
          return;
        }
        ux.showLoading();
        readFile(file).then((b) => {
          let type = dialog.find("[data-rel=candidate-file-type]").val();
          shazamme.user().then((u) => {
            var _a;
            shApi.addCandidateFile((_a = u == null ? void 0 : u.candidate) == null ? void 0 : _a.candidateID, file.name, btoa(b), type).then((r) => {
              let cFile = r.status && r.response.item;
              ux.el.find("[data-rel=section-candidate-files]").append(ux.candidateFileEl({
                data: {
                  candidateFileID: cFile.candidateFileID,
                  fileUri: `${DocumentsUrl}/${type}/${cFile.candidateFileID}`,
                  candidateFileName: cFile.candidateFileName,
                  type: dialog.find("[data-rel=candidate-file-type] option:selected").text()
                }
              }));
              ux.el.find("[data-rel=item-candidate-file]").off("click").on("click", "[data-rel=button-delete]", function() {
                let item = $(this).parents("[data-rel=item-candidate-file]");
                shApi.deleteCandidateFile(item.attr("data-id")).then((r2) => {
                  if (r2.status) {
                    item.remove();
                  }
                });
              });
              ux.showLoading(false);
              field2.val("");
              ux.el.find("[data-rel=modal-new-file] .text-file-name").text("");
              dialog.fadeOut();
            });
          });
        });
      } else {
        dialog.fadeOut();
      }
    }).on("click", "[data-rel=button-cancel]", function() {
      ux.el.find("[data-rel=modal-new-file]").fadeOut();
      field.val("");
      ux.el.find("[data-rel=modal-new-file] .text-file-name").text("");
    });
    let readFile = (file) => new Promise((resolve) => {
      let reader = new FileReader();
      reader.addEventListener("load", function() {
        resolve(reader.result);
      }, false);
      if (file) {
        reader.readAsBinaryString(file);
      }
    });
    let updateProfile = () => {
      shazamme.user().then((u) => {
        const c = u == null ? void 0 : u.candidate;
        let password = ux.el.find("#newPass").val() !== "" ? ux.el.find("#newPass").val() : c == null ? void 0 : c.password;
        let profile = {
          "candidateID": c == null ? void 0 : c.candidateID,
          "username": c == null ? void 0 : c.username,
          "isActive": c == null ? void 0 : c.isActive,
          "isValidated": c == null ? void 0 : c.isValidated,
          "accountStatusID": c == null ? void 0 : c.accountStatusID,
          "titleID": c == null ? void 0 : c.titleID,
          "registrationDate": c == null ? void 0 : c.registrationDate,
          "eMail": c == null ? void 0 : c.eMail,
          "isSubscribed": c == null ? void 0 : c.isSubscribed,
          "firstName": ux.el.find("#candFnameText").val(),
          "surname": ux.el.find("#candLnameText").val(),
          "address": ux.el.find("#candAddress").val(),
          "city": ux.el.find("#candCity").val(),
          "state": ux.el.find("#candState").val(),
          "country": ux.el.find("#candCountry").val(),
          "postalCode": ux.el.find("#candPostal").val(),
          "phone": ux.el.find("#candPhone").val(),
          "mobile": ux.el.find("#candMobile").val(),
          "skillTags": ux.el.find("#candSkills").val(),
          "password": password,
          "salutation": ux.el.find("#salutation").val() || " ",
          "summary": c == null ? void 0 : c.summary,
          "coverLetterExternalFilePath": c == null ? void 0 : c.coverLetterExternalFilePath,
          "resumeExternalFilePath": c == null ? void 0 : c.resumeExternalFilePath,
          "coverLetterContent": c == null ? void 0 : c.coverLetterContent,
          "coverLetterFileName": c == null ? void 0 : c.coverLetterFileName,
          "videoURL": c == null ? void 0 : c.videoURL,
          "firebaseUserID": u == null ? void 0 : u.firebaseUserID,
          "shazammeCandidateSource": c == null ? void 0 : c.shazammeCandidateSource,
          "subscribeJobAlert": c == null ? void 0 : c.subscribeJobAlert,
          "bullhornCandidateID": c == null ? void 0 : c.bullhornCandidateID,
          "registrationDateTime": c == null ? void 0 : c.registrationDateTime,
          "cVSum": c == null ? void 0 : c.cVSum,
          "coverLetterSum": c == null ? void 0 : c.coverLetterSum,
          "ableApplicantID": c == null ? void 0 : c.ableApplicantID
        };
        if (photoUpload) {
          profile.photo = photoUpload;
          profile.photoFileName = ux.el.find("#candImgUpload").get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, "-").replace(/-{2,}/gi, "-");
        } else {
          profile.photo = c == null ? void 0 : c.photo;
          profile.photoFileName = c == null ? void 0 : c.photoFileName;
        }
        if (cvUpload) {
          profile.cVFileContent = cvUpload;
          profile.cVFileName = ux.el.find("#candResumeUpload").get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, "-").replace(/-{2,}/gi, "-");
        } else {
          profile.cVFileContent = c == null ? void 0 : c.cVFileContent;
          profile.cVFileName = c == null ? void 0 : c.cVFileName;
        }
        if (coverUpload) {
          profile.coverLetterContent = coverUpload;
          profile.coverLetterFileName = ux.el.find("#candCoverUpload").get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, "-").replace(/-{2,}/gi, "-");
        } else {
          profile.coverLetterContent = c == null ? void 0 : c.coverLetterContent;
          profile.coverLetterFileName = c == null ? void 0 : c.coverLetterFileName;
        }
        let doSave = () => {
          ux.showLoading();
          shApi.updateProfile(profile).then(
            (r) => {
              if (r.status) {
                window.location.reload(true);
              }
              ux.showLoading(false);
            },
            () => {
              ux.showLoading(false);
            }
          );
        };
        if (password !== (c == null ? void 0 : c.password)) {
          let user = firebase.auth().currentUser;
          let provider = user && user.providerData[0].providerId;
          if (provider === "password") {
            const credentials = firebase.auth.EmailAuthProvider.credential(
              c == null ? void 0 : c.eMail,
              ux.el.find("#candCurrent").val()
            );
            user.reauthenticateWithCredential(credentials).then((response) => {
              user.updatePassword(password).then(function() {
                doSave();
              });
            }).catch((err) => {
              ux.showLoading(false);
              alert(err.message);
            });
          } else {
            doSave();
          }
        } else {
          doSave();
        }
      });
    };
    let exportAnswers = (answers) => new Promise((resolve, reject) => {
      if (data.inEditor) {
        resolve();
        return;
      }
      shazamme.user().then((u) => {
        let c = u == null ? void 0 : u.candidate;
        if ((c == null ? void 0 : c.customText13) && (c == null ? void 0 : c.customText13.length) > 0) {
          answers.push({
            sortOrder: 30,
            question: "Video Link",
            answer: c == null ? void 0 : c.customText13
          });
          answers = answers.sort((x, y) => x.sortOrder > y.sortOrder ? 1 : x.sortOrder < y.sortOrder ? -1 : 0);
        }
        shApi.requestExport(c, answers).then((link2) => {
          if (link2 && link2.length > 0) {
            resolve(link2);
          } else {
            reject();
          }
        });
      });
    });
    let answerValue = (question, answer) => {
      var _a;
      let text = answer.answerText || answer.answerNum || answer.answerFileName;
      if (text && (text.length > 0 || !isNaN(text))) {
        return text;
      }
      if (answer.answerDate && answer.answerDate.length > 0) {
        let date = new Date(answer.answerDate);
        return date.toLocaleDateString();
      }
      if (answer.answerUUID && answer.answerUUID.length > 0) {
        if (question) {
          let o = (_a = question.options) == null ? void 0 : _a.find((x) => x.screeningQuestionOptionsID === answer.answerUUID);
          return (o == null ? void 0 : o.option) || (o == null ? void 0 : o.label) || answer.answerUUID;
        }
        return answer.answerUUID;
      }
      if (answer.answerBoolean) {
        return "Yes";
      }
      return "";
    };
    let enableExports = (jobApplicationID) => {
      jobApplicationID.forEach((id) => {
        shApi.getScreeningAnswers(id).then((answers) => {
          if (!answers.response.items || answers.response.items.length == 0) {
            return;
          }
          let templateID = (answers.response.items.find((x) => x.screeningTemplateID) || {}).screeningTemplateID;
          shApi.getScreeningTemplate(templateID).then((questions) => {
            let items = answers.response.items.map((a) => {
              let q = questions.find((x) => x.data.screeningQuestionID === a.screeningQuestionID);
              return {
                sortOrder: (q == null ? void 0 : q.sortOrder) || 999,
                question: q == null ? void 0 : q.question,
                answer: answerValue(q, a)
              };
            });
            ux.el.find(`[data-rel=item-application][data-id=${id}] [data-rel=button-export]`).css({
              visibility: "visible"
            }).click(function() {
              let button = $(this);
              let exp = [];
              if (button.is("[ready]")) {
                return true;
              }
              button.addClass("fa-spinner").addClass("wait");
              items.forEach((a) => exp = exp.concat(answerWordBreak(a)));
              exportAnswers(exp).then((href) => {
                button.removeClass("fa-spinner").removeClass("wait");
                if (!href) return;
                button.attr("ready", "1").attr("href", href).attr("target", "_blank");
                window.open(href, "_blank");
              }, () => {
                alert("We are sorry. We ran into an issue exporting this document. Please try again.");
              });
            });
            ux.el.find(`[data-rel=item-application][data-id=${id}] [data-rel=button-edit]`).css({
              visibility: "visible"
            }).click(function() {
              let jobID = $(this).parents("[data-rel=item-application]").attr("data-job-id");
              window.open(ux.buildHref(Path.screeningAnswers, `jobID=${jobID}&jobApplicationID=${jobApplicationID}`), "_blank");
            });
          });
        });
      });
    };
    answerWordBreak = (v, maxLength = 1500) => {
      if (typeof v.answer !== "string") {
        return [v];
      }
      if (v.answer.length <= maxLength) {
        return [v];
      }
      let question = v.question;
      let broken = [];
      let words = v.answer.match(/\b(\w+)\b/g);
      let chunk = [];
      let read = 0;
      while (true) {
        let word = words.shift();
        if (!word) {
          break;
        }
        read += word.length;
        if (read >= maxLength) {
          broken.push({
            question,
            answer: chunk.join(" "),
            sortOrder: v.sortOrder,
            pageBreak: true
          });
          chunk = [];
          read = word.length;
          question = v.question + " (Cont)";
        }
        chunk.push(word);
      }
      broken.push({
        question,
        answer: chunk.join(" "),
        sortOrder: v.sortOrder,
        pageBreak: true
      });
      return broken;
    };
    ux.el.find("[data-rel=tab-bar]").on("click", "[data-rel=button-tab]", function() {
      let tab = $(this);
      ux.el.find("[data-rel=tab-bar] [data-rel=button-tab]").removeClass("active");
      tab.addClass("active");
      ux.el.find("[data-rel=dashboard-tab]").hide();
      ux.el.find(`[data-rel=dashboard-tab][data-tab=${tab.attr("data-tab")}]`).show();
    });
    ux.el.find("[data-rel=overview-heading]").on("click", function() {
      let tab = $(this).attr("data-tab");
      ux.el.find(`[data-rel=tab-bar] [data-rel=button-tab][data-tab=${tab}]`).trigger("click");
    });
    ux.el.find("[data-rel=dashboard-tab] [data-rel=button-back]").on("click", function() {
      ux.el.find("[data-rel=tab-bar] [data-rel=button-tab]").first().trigger("click");
    });
    ux.el.find(".button-create-alert").on("click", function() {
      shazamme.store("createAlert", null);
      window.location = ux.buildHref(Path.jobAlerts);
    });
    if (!data.inEditor) {
      firebase.auth().onAuthStateChanged((user) => {
        if ((user && user.providerData[0].providerId) !== "password") {
          ux.el.find("[data-rel=tab-bar] [data-tab=tab-password], [data-rel=overview-heading][data-tab=tab-password]").hide();
        }
      });
    }
    const cssId = "fontAwesomeSource";
    if (!document.getElementById(cssId)) {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://use.fontawesome.com/releases/v5.5.0/css/all.css";
      link.integrity = "sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU";
      link.crossOrigin = "anonymous";
      head.appendChild(link);
    }
    if (!data.inEditor) {
      ux.el.find("[data-rel=tab-bar] [data-rel=button-tab]").first().trigger("click");
    }
    $("#currentPassEye").click(function() {
      if ($(this).hasClass("fa-eye-slash")) {
        $(this).removeClass("fa-eye-slash");
        $(this).addClass("fa-eye");
        $("#candCurrent").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");
        $(this).addClass("fa-eye-slash");
        $("#candCurrent").attr("type", "password");
      }
    });
    $("#newPassEye").click(function() {
      if ($(this).hasClass("fa-eye-slash")) {
        $(this).removeClass("fa-eye-slash");
        $(this).addClass("fa-eye");
        $("#newPass").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");
        $(this).addClass("fa-eye-slash");
        $("#newPass").attr("type", "password");
      }
    });
    let main = (w) => {
      const fb = shazamme.firebase();
      const manage = (u) => {
        var _a;
        if (!data.inEditor) {
          if (!u) {
            window.location = ux.buildHref(Path.login);
            return;
          }
          if (!((_a = u.candidate) == null ? void 0 : _a.isValidated)) {
            if (confirm("Please complete your registrion")) {
              window.location = ux.buildHref(Path.register);
            } else {
              shazamme.endSession();
              window.location = ux.buildHref(Path.login);
            }
            return;
          }
        }
        const c = u == null ? void 0 : u.candidate;
        Promise.all([
          shApi.savedJobs(c == null ? void 0 : c.candidateID),
          shApi.jobApplications(c == null ? void 0 : c.candidateID),
          shApi.jobAlerts(c == null ? void 0 : c.candidateID)
        ]).then((p) => {
          var _a2, _b, _c, _d, _e, _f;
          const saved = ((_b = (_a2 = p[0]) == null ? void 0 : _a2.response) == null ? void 0 : _b.items) || [];
          const apps = ((_d = (_c = p[1]) == null ? void 0 : _c.response) == null ? void 0 : _d.items) || [];
          const alerts = ((_f = (_e = p[2]) == null ? void 0 : _e.response) == null ? void 0 : _f.items) || [];
          let jobId = [
            ...saved.map((i) => i.jobID),
            ...apps.map((i) => i.jobID)
          ];
          let professionId = alerts.filter((i) => i.professionID).map((i) => i.professionId);
          shazamme.site().then(
            (s) => shazamme.fetch({
              path: `/job-results/${s.siteID}`,
              isExternal: true
            })
          ).then((jobs) => {
            let savedList = saved.map((i) => ux.savedJobEl(i, jobs.find((j) => j.data.jobID === i.jobID)));
            let appList = apps.map((i) => ux.applicationEl(i, jobs.find((j) => j.data.jobID === i.jobID)));
            ux.el.find("[data-rel=section-saved-jobs]").empty().append(savedList);
            ux.el.find("[data-rel=section-applications]").empty().append(appList);
            ux.el.find("[data-rel=item-saved-job]").on("click", "[data-rel=button-delete]", function() {
              let item = $(this).parents("[data-rel=item-saved-job]");
              shApi.deleteSavedJob(item.attr("data-id")).then((r) => {
                if (r.status) {
                  item.remove();
                }
              });
            });
            apps.forEach((a) => {
              if (jobs.find((j) => j.data.jobID = a.jobID && j.data.screeningTemplateID && j.data.screeningTemplateID.length > 0)) {
                ux.el.find(`[data-rel=item-application][data-id=${a.jobApplicationID}] [data-rel=button-export], [data-rel=item-application][data-id=${a.jobApplicationID}] [data-rel=button-edit]`).css({
                  visibility: "visible"
                });
              }
            });
            enableExports(apps.map((i) => i.jobApplicationID));
          });
          shazamme.fetch(Collection.profession).then((p2) => Promise.resolve((p2 || []).filter((i) => professionId.indexOf(i.data.professionID) >= 0))).then((professions) => {
            let alertList = alerts.map((i) => ux.alertEl({ profession: professions.find((p2) => p2.data.professionID === i.professionID), ...i }));
            ux.el.find("[data-rel=section-alerts]").empty().append(alertList);
            ux.el.find("[data-rel=item-job-alert]").on("click", "[data-rel=button-delete]", function() {
              let item = $(this).parents("[data-rel=item-job-alert]");
              let alert2 = alerts.find((i) => i.candidateSearchID = item.attr("data-id"));
              shApi.deleteJobAlert(item.attr("data-id")).then((r) => {
                if (r.status) {
                  item.remove();
                }
              });
            });
            ux.el.find("[data-rel=item-job-alert]").on("click", "[data-rel=button-edit]", function() {
              let item = $(this).parents("[data-rel=item-job-alert]");
              let alert2 = alerts.find((i) => i.candidateSearchID == item.attr("data-id"));
              shazamme.store("createAlert", JSON.stringify(alert2));
              window.location = ux.buildHref(Path.jobAlerts);
            });
            ux.el.find("[data-rel=item-job-alert]").on("change", "input[type=checkbox]", function() {
              let item = $(this).parents("[data-rel=item-job-alert]");
              let alert2 = alerts.find((i) => i.candidateSearchID = item.attr("data-id"));
              alert2.isNeedAlert = $(this).is(":checked");
              shApi.updateAlert(alert2).then();
            });
          });
        });
        shApi.getCandidateFiles(c == null ? void 0 : c.candidateID).then((f) => {
          shApi.getCandidateFileTypes().then((t) => {
            var _a2, _b, _c, _d;
            let fileList = (_b = (_a2 = f == null ? void 0 : f.response) == null ? void 0 : _a2.items) == null ? void 0 : _b.map((i) => {
              var _a3;
              i.data.fileUri = `${DocumentsUrl}/${i.data.siteCandidateFileTypeID}/${i.data.candidateFileID}`;
              i.data.type = (_a3 = t.response.items.find((x) => x.siteCandidateFileTypeID === i.data.siteCandidateFileTypeID)) == null ? void 0 : _a3.candidateFileType;
              return ux.candidateFileEl(i);
            });
            ux.el.find("[data-rel=section-candidate-files]").empty().append(fileList);
            ux.el.find("[data-rel=item-candidate-file]").on("click", "[data-rel=button-delete]", function() {
              let item = $(this).parents("[data-rel=item-candidate-file]");
              shApi.deleteCandidateFile(item.attr("data-id")).then((r) => {
                if (r.status) {
                  item.remove();
                }
              });
            });
            ux.el.find("[data-rel=modal-new-file] [data-rel=candidate-file-type]").empty().append((_d = (_c = t == null ? void 0 : t.response) == null ? void 0 : _c.items) == null ? void 0 : _d.map((i) => `<option value="${i.siteCandidateFileTypeID}">${i.candidateFileType}</option>`));
          });
        });
        showProfile(c);
        w.sub("site-auth", (u2) => {
          if (!u2) {
            window.location = ux.buildHref(Path.login);
          }
        });
      };
      const submitDeletion = (m) => {
        let secret = void 0;
        if (m.hasClass("password")) {
          secret = m.find(".editCand-inputBox input").val().trim();
          if (secret.length === 0) {
            alert("Please enter your password.");
            return;
          }
        } else if (m.find(".editCand-inputBox input").val() !== "DELETE") {
          alert("Please type 'DELETE' on the textbox.");
          return;
        }
        shazamme.user().then((u) => {
          const c = u == null ? void 0 : u.candidate;
          if (!c) {
            return;
          }
          w.unsub("site-auth");
          ux.showLoading();
          $(element).find(".editCand-inputBox input").val("");
          fb.delete(secret).then(() => shazamme.submit({
            "action": "Delete Candidate",
            "candidateID": c.candidateID,
            "siteID": c.siteID,
            "uid": c.firebaseUserID
          })).then((r) => {
            if (JSON.parse(r.status)) {
              shazamme.endSession();
              $.get("/deleted-candidate", function(res) {
                window.location.replace("/deleted-candidate");
              }).fail(function() {
                window.location.replace("/home");
              });
            }
          }).catch((err) => {
            ux.showLoading(false);
            alert((err == null ? void 0 : err.message) || "Your acccount could not be deleted at this time");
            w.sub("site-auth", (u2) => manage(u2));
          });
        });
      };
      ux.el.on("click", ".editCand-confirmDelete", function() {
        submitDeletion($(this).parents(".editCand-deleteModal"));
      });
      ux.el.find(".editCand-inputBox input").keypress(function(e) {
        if ((e.which || e.keyCode) == 13) {
          submitDeletion($(this).parents(".editCand-deleteModal"));
        }
      });
      let _pendingReg = null;
      try {
        _pendingReg = JSON.parse(localStorage.getItem("_pendingAuth") || "null");
      } catch (e) {
      }
      localStorage.removeItem("_pendingAuth");
      if (_pendingReg && !data.inEditor) {
        let _wait2 = function() {
          shazamme.auth(_pendingReg.email, _pendingReg.uid, _pendingReg.isOAuth).then(
            (u) => {
              if (!(u == null ? void 0 : u.candidate) && _t < MAX_TRIES) {
                retry();
                return;
              }
              if (u) shazamme.pub(shazamme.message.auth, u);
              manage(u);
            },
            () => {
              if (_t < MAX_TRIES) retry();
              else manage(null);
            }
          );
        };
        var _wait = _wait2;
        const MAX_TRIES = 20;
        const RETRY_MS = 1500;
        let _t = 0;
        const retry = () => {
          _t++;
          setTimeout(_wait2, RETRY_MS);
        };
        _wait2();
      } else {
        shazamme.user(true).then((u) => manage(u));
      }
    };
    ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(() => shazamme.ready(data.siteId, data.page)).then(() => {
      main(shazamme.register("candidate-dasboard-tabs", data));
    });
  }
  return __toCommonJS(candidate_dashboard_tabs_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["candidate-dashboard-tabs"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
