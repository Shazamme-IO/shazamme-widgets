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

  // dist/.gen/job-app-sq-sr.index.js
  var job_app_sq_sr_index_exports = {};
  __export(job_app_sq_sr_index_exports, {
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

  // dist/.gen/job-app-sq-sr.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    let action = new Action();
    let uploadedFiles = {};
    let isRequiredResume = false;
    let isRequiredCover = false;
    let dudaAlias = data.siteId;
    let importData = {};
    let thankYouPage = "thank-you";
    let dashboardPage = "dashboard";
    let registerPage = "register";
    let loginFrom;
    if (data.config.toggleThankyouPage) {
      thankYouPage = data.config.txt_Thankyoupageurl;
    }
    let shouldUploadResume = data.config.showResume === true;
    let shouldUploadCover = data.config.applicationLayout !== "simpleForm" && data.config.showCoverLetter;
    let showSubscription = data.config.showSubscription === "true";
    const uri = new URL(window.location.href);
    let isAcceptedPassword = false;
    let passwordInput = document.getElementById("passwordInput");
    const Message = {
      submit: "application-screening-form-submit"
    };
    const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;
    if (data.config.showScreeningQuestions) {
      showScreeningQuestions();
    }
    $("#passwordInput").focus(function() {
      $("#passwordMessage,.arrow-bottom").css("display", "flex");
    });
    $("#passwordInput").blur(function() {
      if (isAcceptedPassword) {
        $("#passwordMessage, .arrow-bottom").css("display", "none");
      }
    });
    if (data.config.useSmartLogin && !hasLoggedInUser()) {
      var loginTimeout = null;
      $(element).find(".smart-login-login, .smart-login-register").hide();
      $("#emailLogin").keyup(function() {
        if (loginTimeout) {
          clearTimeout(loginTimeout);
        }
        loginTimeout = setTimeout(() => {
          let id = $(this).val().trim();
          if (id.length === 0) {
            $(element).find(".smart-login-login, .smart-login-register").hide();
            return;
          }
          firebase.auth().fetchSignInMethodsForEmail(id).then((res) => {
            $(element).find(".smart-login-login, .smart-login-register").hide();
            if (res.length > 0) {
              $(element).find(".smart-login-login").show();
            } else {
              $(element).find(".smart-login-register").show();
              $("#emailAddress").val(id);
            }
          }).catch(() => {
            $(element).find(".smart-login-login").hide();
            $(element).find(".smart-login-register").show();
          });
          loginTimeout = null;
        }, 500);
      });
    }
    if (passwordInput) {
      let capitalChecker = document.getElementById("capital");
      let numberChecker = document.getElementById("number");
      let lenthChecker = document.getElementById("length");
      let specialCharChecker = document.getElementById("specialChar");
      passwordInput.onkeyup = function() {
        let statusCount = 0;
        if (!(passwordInput.value.length < 8)) {
          lenthChecker.classList.remove("invalid");
          lenthChecker.classList.add("valid");
          statusCount += 1;
        } else {
          lenthChecker.classList.remove("valid");
          lenthChecker.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/(?=.*[A-Z])/) != -1) {
          capitalChecker.classList.remove("invalid");
          capitalChecker.classList.add("valid");
          status = true;
          statusCount += 1;
        } else {
          capitalChecker.classList.remove("valid");
          capitalChecker.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/\d/) != -1) {
          numberChecker.classList.remove("invalid");
          numberChecker.classList.add("valid");
          statusCount += 1;
        } else {
          numberChecker.classList.remove("valid");
          numberChecker.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/(?=.*[!@#$%^&*])/) != -1) {
          specialCharChecker.classList.remove("invalid");
          specialCharChecker.classList.add("valid");
          statusCount += 1;
        } else {
          specialCharChecker.classList.remove("valid");
          specialCharChecker.classList.add("invalid");
          statusCount -= 1;
        }
        if (statusCount === 4) {
          $(".passwordErrorTitle").text("Your password is acceptable!");
          $("#passwordMessage").css("background-color", "#59db5d");
          $(".valid,.passwordErrorTitle").css("color", "#fff");
          $(".arrow-bottom").css({
            "border-top": "15px solid #59db5d"
          });
          isAcceptedPassword = true;
          return;
        } else {
          $(".passwordErrorTitle").text("Password must contain the following");
          $("#passwordMessage").css("background-color", "#ffa1a1");
          $("#passwordMessage,.passwordErrorTitle, .invalid").css("color", "red");
          $(".arrow-bottom").css({
            "border-top": "15px solid #ffa1a1"
          });
          isAcceptedPassword = false;
          return false;
        }
      };
    }
    function convertBinaryString(fileUpload, type) {
      var file = fileUpload.files[0];
      let fileName = file.name.replace(/[^a-z0-9-_.]/gi, "-").replace(/-{2,}/gi, "-");
      var reader = new FileReader();
      let fileType = type == "resume" ? "resumeFile" : "coverLetterFile";
      let name = type == "resume" ? "resumeName" : "coverLetterFileName";
      reader.addEventListener("load", function() {
        uploadedFiles[fileType] = reader.result;
        uploadedFiles[name] = fileName;
      }, false);
      if (file) {
        reader.readAsBinaryString(file);
      }
    }
    $(element).find("input#resume").on("change", function() {
      var _a;
      let file = this;
      let size = (_a = file.files[0]) == null ? void 0 : _a.size;
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(file).val("");
        return;
      }
      convertBinaryString(file, "resume");
    }).each(function() {
      var _a;
      let file = this;
      let size = (_a = file.files[0]) == null ? void 0 : _a.size;
      if (file.files.length == 0) {
        return;
      }
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(file).val("");
        return;
      }
      convertBinaryString(file, "resume");
    });
    $(element).find("input#cover").on("change", function() {
      var _a;
      let file = this;
      let size = (_a = file.files[0]) == null ? void 0 : _a.size;
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(file).val("");
        return;
      }
      convertBinaryString(file, "cover");
    }).each(function() {
      var _a;
      let file = this;
      let size = (_a = file.files[0]) == null ? void 0 : _a.size;
      if (file.files.length == 0) {
        return;
      }
      if (size > maxUploadSize) {
        alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
        $(file).val("");
        return;
      }
      convertBinaryString(file, "cover");
    });
    $("input[type=radio][name=uploadTypeResume]").change(function() {
      if (this.value == "uploadResume") {
        $(".fileUploadContainer").css("display", "flex");
        shouldUploadResume = true;
      } else {
        $(".fileUploadContainer").css("display", "none");
        shouldUploadResume = false;
      }
    });
    $("input[type=radio][name=uploadTypeCover]").change(function() {
      if (this.value == "uploadCover") {
        $(".coverUploadContainer").css("display", "flex");
        shouldUploadCover = true;
      } else {
        $(".coverUploadContainer").css("display", "none");
        shouldUploadCover = false;
      }
    });
    $("#loginBtn").click(function() {
      let email = $("#emailLogin").val();
      let password = $("#passwordLogin").val();
      loginFrom = "loginForm";
      action.nativeLogin(email, password);
    });
    $(".container-item").click(function() {
      $(".registerTxt").hide();
      switch ($(this).attr("data-provider")) {
        case "facebook": {
          action.loginOrRegisterUsingProvider(facebookProvider);
          break;
        }
        case "google": {
          action.loginOrRegisterUsingProvider(googleProvider);
          break;
        }
        case "linkedin": {
          shazamme.oauth("linkedinProvider");
          break;
        }
        case "seek": {
          shazamme.oauth("seekProvider");
          break;
        }
      }
    });
    function checkFileUploaded(element2, shouldUpload, file) {
      if (shouldUpload) {
        let notif = file == "resume" ? data.config.warningResume || "Please upload your resume" : data.config.warningCoverLetter || `Please upload your cover letter, or tick the "I don't have cover letter"`;
        let fileToBeUploaded = element2.files[0];
        if (fileToBeUploaded == void 0) {
          buttonAction("stop");
          $(element2).find(".fcLoader").removeClass("fcLoadingSeek");
          alert(notif);
          throw new Error(notif);
          return null;
        }
        return element2.files[0];
      }
      return null;
    }
    function addUploadedToGlobal(file, key) {
      if (!file) return;
      uploadedFiles[key] = file;
    }
    function Action() {
      this.clearKeys = () => {
        let keysToDelete = [
          "seekAuthorizationCode",
          "authProvider",
          "currentJobViewed",
          "linkedIncode",
          "jobID"
        ];
        for (const key of keysToDelete) {
          shazamme.store(key, null);
        }
      };
      this.nativeRegister = (candidateInfo2) => new Promise((resolve, reject) => {
        let email = candidateInfo2.eMail;
        let password = candidateInfo2.password;
        shazamme.firebase().create(email, password).then((u) => {
          shazamme.submit({
            action: "Register Candidate",
            firebaseUserID: u.uid,
            ...candidateInfo2
          }).then(() => shazamme.auth(email)).then((u2) => resolve(u2));
        }).catch((err) => {
          if (err.code === "auth/invalid-email") {
            alert(data.config.warningEmail || "Please use a valid email address");
            reject(err);
            return;
          }
          if (err.code == "auth/email-already-in-use") {
            if (data.config.showPassword) {
              if (window.confirm("The email is already an existing account please login instead.")) {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                });
                $(element).find(".submitApplicationBtn").css("pointer-events", "auto");
                $(element).find(".applyText").show();
                $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              }
              ;
              reject(err);
              return;
            }
            shazamme.auth(email).then((u) => resolve(u));
          }
          buttonAction("hide");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
        });
      });
      this.nativeLogin = (uid, secret) => {
        shazamme.firebase().auth(uid, secret).then(() => {
          if (data.inEditor) {
            return;
          }
          if (loginFrom == "loginForm") {
            window.location.reload();
            return;
          }
          if (loginFrom == "registrationForm") {
            let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${thankYouPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${thankYouPage}`;
            window.location.href = link;
            return;
          }
          let previousApplicationPage = shazamme.store("previousApplicationPage");
          if (previousApplicationPage) {
            window.location.href = previousApplicationPage;
            return;
          }
          window.location.href = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${thankYouPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${thankYouPage}`;
        }).catch((error) => {
          alert(error.msg);
        });
      };
      this.loginOrRegisterUsingProvider = (p) => {
        shazamme.firebase().oauth(p).then((u) => {
          if (u.isNew) {
            shazamme.submit({
              action: "Register Candidate",
              salutation: " ",
              firstName: u.firstName,
              surname: u.lastName,
              eMail: u.email,
              password: shazamme.uuid(),
              candidateID: shazamme.uuid(),
              firebaseUserID: u.firebaseUserID,
              isActive: true,
              isValidated: true,
              isSubscribed: showSubscription && $(element).find("[data-rel=checkbox-subscribe]:checked").length > 0,
              dudaSiteID: data.siteId
            }).then((r) => {
              r.status && !data.inEditor && shazamme.auth(u.email, true).then(() => {
                window.location.reload();
              });
            });
          } else {
            window.location.reload();
          }
        }).catch((err) => {
          alert(err.msg);
        });
      };
      this.submitExperience = (candidateID) => {
        let e = [];
        $(element).find("[data-rel=container-experience] [data-rel=job-experience]").each(function(_, i) {
          let answers = {};
          $(i).find("[data-rel=field]").each(function(_2, j) {
            let el = $(j);
            if (el.is("[type=checkbox]")) {
              answers[el.attr("data-field")] = el.is(":checked");
            } else if (el.val().length > 0) {
              answers[el.attr("data-field")] = el.val();
            }
          });
          e.push(answers);
        });
        return shazamme.submit({
          action: "Submit Experience",
          candidateID,
          experience: e
        });
      };
      this.submitEducation = (candidateID) => {
        let e = [];
        $(element).find("[data-rel=container-education] [data-rel=education]").each(function(_, i) {
          let answers = {};
          $(i).find("[data-rel=field]").each(function(_2, j) {
            let el = $(j);
            if (el.is("[type=checkbox]")) {
              answers[el.attr("data-field")] = el.is(":checked");
            } else if (el.val().length > 0) {
              answers[el.attr("data-field")] = el.val();
            }
          });
          e.push(answers);
        });
        return shazamme.submit({
          action: "Submit Education",
          candidateID,
          education: e
        });
      };
      this.getExperience = (candidateID) => shazamme.submit({
        action: "Get Experience",
        candidateID
      });
      this.getEducation = (candidateID) => shazamme.submit({
        action: "Get Education",
        candidateID
      });
    }
    function showOrHideForms(s) {
      const el = $(element);
      if (s) {
        el.find("#salutation").val(s.salutation || "");
        el.find("#firstName").val(s.firstName || "");
        el.find("#lastName").val(s.surname || "");
        el.find("#emailAddress").val(s.eMail || "").attr("readonly", "readonly");
        el.find("#phoneNumber").val(s.phone || "");
        if (s.isNew) {
          el.find(".shmLoginContainer,.applyMainSocial,.subscriptionContainer").show();
          el.find(".greeting-message").hide();
        } else {
          el.find(".shmLoginContainer,.applyMainSocial,.subscriptionContainer").hide();
          el.find(".greeting-message").show().text(`${data.config.greeting || "Welcome back"} ${s.firstName || ""} ${s.surname || ""}!`);
        }
      } else {
        el.find(".shmregistrationContainer,.shmLoginContainer,.applyMainSocial,.subscriptionContainer").show();
        el.find(".greeting-message").hide().text("");
        el.find("#salutation").val("");
        el.find("#firstName").val("");
        el.find("#lastName").val("");
        el.find("#emailAddress").val("").removeAttr("readonly");
        el.find("#phoneNumber").val("");
      }
      if (data.inEditor) {
        el.find(".greeting-message").show().text(`${data.config.greeting || "Welcome back"}!`);
      }
      if (!(s == null ? void 0 : s.cVFileContent)) {
        $(element).find(".uploadExisting").css("display", "none");
      }
      if (data.config.showScreeningQuestions) {
        showScreeningQuestions();
      }
    }
    function hasLoggedInUser() {
      return window.localStorage.vinylResponse;
    }
    function getJobID() {
      let getURL = new URL(window.location.href);
      return getURL.searchParams.get("jobID") || data.config.useSingleJob && data.config.jobID || shazamme.store("jobID");
    }
    function isObjectComplete(object) {
      if (typeof object !== "object") console.warn("not object by objectChecker");
      for (const property in object) {
        if (object[property] === "") {
          return false;
        }
      }
      return true;
    }
    function buttonAction(action2) {
      if (action2 == "apply") {
        $(".submitApplicationBtn, .applyText").css("pointer-events", "none");
        return;
      }
      $(".submitApplicationBtn, .applyText").css("pointer-events", "auto");
      $(".applyText").show();
    }
    function showScreeningQuestions() {
      let jobID = getJobID();
      shazamme.site().then((s) => shazamme.fetch({
        path: `/job-results/${s.siteID}/${getJobID()}`,
        isExternal: true,
        useCache: true
      })).then((j) => {
        var _a;
        if ((_a = j == null ? void 0 : j.data) == null ? void 0 : _a.screeningTemplateID) {
          shazamme.submit({
            action: "Get Screening Questions",
            templateID: j.data.screeningTemplateID
          }).then((res) => {
            if (!res.status) {
              return;
            }
            let el = res.response.map((q) => questionElement(q));
            $(element).find("[data-rel=screening-fields]").empty().append(el);
          });
        }
      });
    }
    function questionElement(q) {
      switch (q.questionType) {
        case "Text":
          return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="text" autocomplete="nope" data-qtype="text" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;
        case "Number":
          return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="number" autocomplete="nope" data-qtype="number" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;
        case "Date":
          return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="date" autocomplete="nope" data-qtype="date" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;
        case "Boolean":
          return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="checkbox" autocomplete="nope" data-qtype="bool" data-qid="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;
        case "List": {
          let opts = q.options.map((o) => `<option value="${o.screeningQuestionOptionsID}">${o.option}</option>`);
          return `
                 <div class="input-field-container">
                    <p>${q.question}</p>
                    <select data-qtype="list" data-qid="${q.screeningQuestionID}">${opts.join("")}</select>
                 </div>
            `;
        }
        case "Radio": {
          let opts = q.options.map((o) => `<label><input type="radio" data-qtype="radio" name="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" value="${o.screeningQuestionOptionsID}" />${o.option}</label>`);
          return `
                 <div class="input-field-container">
                    <p> ${q.question}</p>
                    ${opts.join("")}
                 </div>
            `;
        }
        default:
          return "";
      }
    }
    function validateScreeningQuestions() {
      let isOk = true;
      $(element).find("[data-rel=screening-fields] input, [data-rel=screening-fields] select").each((i, el) => {
        let field = $(el);
        switch (field.attr("data-qtype")) {
          case "text":
          case "select": {
            let val = field.val();
            isOk = isOk && val && val.trim().length > 0;
            break;
          }
          case "number": {
            isOK = isOk && !isNaN(field.val());
            break;
          }
          case "date": {
            let val = Date.parse(field.val());
            isOk = isOk && !isNaN(val);
            break;
          }
        }
      });
      return isOk;
    }
    function checkForDuplicate(candidateID) {
      return shazamme.site().then(
        (s) => s.isLive && shazamme.submit({
          action: "Get Job Applications",
          candidateID
        }).then((r) => {
          var _a, _b;
          return (r == null ? void 0 : r.status) && ((_b = (_a = r == null ? void 0 : r.response) == null ? void 0 : _a.items) == null ? void 0 : _b.find((x) => x.jobID === getJobID()));
        }) || Promise.resolve(false)
      );
    }
    function screeningQuestions(candidateID) {
      this.pageNumber = 0;
      this.isValid = true;
      this.candidateID = candidateID;
      this.nextPage = () => {
        this._showQuestions(this.pageNumber + 1);
      };
      this.prevPage = () => {
        this._showQuestions(this.pageNumber - 1);
      };
      this.answers = () => {
        let data2 = [];
        this._recordAnswers();
        for (let i in this._answers) {
          data2.push(this._answers[i]);
        }
        return data2;
      };
      this._pages = [];
      this._maxPage = 0;
      this._answers = [];
      this._screeningTemplateID = void 0;
      this._mock = ``;
      this._fetchQuestions = () => {
        let container = $(element).find("[data-rel=screening-fields]");
        let jobID = getJobID();
        let sender = this;
        return new Promise((resolve) => {
          let page = 1;
          shazamme.submit({
            action: "Get Screening Questions - SR",
            jobID
          }).then((res) => {
            if (!res || !res.items || res.items.length == 0) {
              resolve();
              return;
            }
            if (!sender._pages[0]) sender._pages[0] = [];
            sender._pages[0] = sender._pages[0].concat(res.items);
            resolve();
          });
        });
      };
      this._showQuestions = (page, scrollIntoView = true) => {
        if (page > this.pageNumber && !this._validate()) {
          alert("Please answer all questions");
          return;
        }
        this._recordAnswers();
        if (page > this._maxPage) {
          this._maxPage = page;
        }
        let sender = this;
        let container = $(element).find("[data-rel=screening-fields]");
        let el = (this._pages[page] || []).map((q) => sender._questionElement(q.data));
        container.empty().append(el).append(sender._pagingElements(page));
        container.find(".sq-help-text[collapsible]").each(function(_, i) {
          let helpText = $(i);
          let height = $(helpText).outerHeight();
          helpText.find(".text-main").attr("style", `--shaz-help-text-lines: ${data.config.helpTextLines || 3}`);
          if (helpText.outerHeight() < height) {
            helpText.addClass("collapsible").on("click", "[data-rel=button-show-more]", function() {
              let button = $(this);
              if (helpText.hasClass("expanded")) {
                helpText.find(".text-main").css({
                  display: "-webkit-box"
                });
                helpText.removeClass("expanded");
              } else {
                helpText.find(".text-main").css({
                  display: "block"
                });
                helpText.addClass("expanded");
              }
            });
          }
        });
        container.find("[data-rel=screening-page-index]").click(function() {
          let page2 = parseInt($(this).attr("data-page")) || 0;
          sender._showQuestions(page2);
        });
        container.find("[data-rel=screening-apply]").click(function() {
          if (!sender._validate()) {
            alert("Please answer all questions");
            return;
          }
          shazamme.pub(Message.submit);
        });
        container.find();
        if (scrollIntoView) {
          container.get(0).scrollIntoView();
          window.scrollBy({ top: -200, behavior: "smooth" });
        }
        this._restoreAnswers();
        this.pageNumber = page;
      };
      this._questionElement = (q) => {
        switch (q.questionType) {
          case "INPUT_TEXT":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                            <input class="sq-input-text-style" type="text" maxlength=${q.length || -1} autocomplete="nope" data-qtype="text" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""} />
                        </p>
                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "TEXTAREA":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                            <textarea class="sq-input-text-style" type="text" maxlength=${q.length || -1} autocomplete="nope" data-qtype="text" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""} ></textarea>
                        </p>
                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "NUMBER":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                            <input type="number" autocomplete="nope" data-qtype="number" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""} />
                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "DATE":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                         </p>
                            <input type="date" autocomplete="nope" data-qtype="date" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""} />

                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "CHECKBOX":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                            <input type="checkbox" autocomplete="nope" data-qtype="bool" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""}  />

                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "SINGLE_SELECT": {
            let opts = q.options.map((o) => `<option value="${o.value}">${o.label || o.option}</option>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-list-question">${q.question}</p>
                        <select data-qtype="list" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""}>${opts.join("")}</select>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                     </div>
                `;
          }
          case "MULTI_SELECT": {
            let opts = q.options.map((o) => `<label><input type="checkbox" autocomplete="nope" data-qtype="check-list" data-qid="${q.sRQuestionsID}" data-value="${o.value}" />${o.label || o.option}</label>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-checklist-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ${opts.join("")}
                     </div>
                `;
          }
          case "RADIO": {
            let opts = q.options.map((o) => `<label class="sq-question-option"><input type="radio" data-qtype="radio" name="${q.sRQuestionsID}" data-qid="${q.sRQuestionsID}" value="${o.value}" ${q.isMandatory ? "required" : ""} />${o.label || o.option}</label>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-radio-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        <div class="sq-opt-list">${opts.join("")}</div>
                     </div>
                `;
          }
          case "INFORMATION": {
            return `
                     <div class="input-field-container">
                        <p class="sq-radio-question">
                            ${q.question}
                        </p>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                     </div>
                `;
          }
          case "FILE":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                            <input type="file" autocomplete="nope" data-qtype="file" data-qid="${q.sRQuestionsID}" ${q.isMandatory ? "required" : ""} />
                        </label>
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                    </div>
                `;
          case "HEADER":
            return `<div class='screening-question-heading'><h3>${q.question}</h3</div>`;
          default:
            return "";
        }
      };
      this._pagingElements = (page) => {
        let out = [];
        out.push("<div data-rel='screening-pages' class='screening-pages-container'>");
        if (page > 0) {
          out.push(`<a href='javascript:void(0);' class="button-page-nav back" data-rel='screening-page-index' data-page='${page - 1}'>Back</a>`);
        }
        if (this._pages.length > 0 && page < this._pages.length - 1) {
          out.push(`<a href='javascript:void(0);' class="button-page-nav forward" data-rel='screening-page-index' data-page='${page + 1}'>Next</a>`);
        } else {
          out.push(`<a href='javascript:void(0);' class="button-page-nav forward apply" data-rel='screening-apply'>Apply</a>`);
        }
        if (this._pages.length > 1) {
          let buttons = new Array(this._maxPage + 1);
          for (let i = 0; i < buttons.length; i++) {
            buttons[i] = `<a href='javascript:void(0);' class="button-page-index ${i === page ? "active" : ""}" data-rel='screening-page-index' data-page='${i}'></a>`;
          }
          for (let i = buttons.length; i < this._pages.length; i++) {
            buttons[i] = `<a href='javascript:void(0);' class="button-page-index disabled"></a>`;
          }
          out.push(`<div class="sq-pages-index">${buttons.join("")}</div>`);
        }
        out.push("</div>");
        return out.join("");
      };
      this._presentList = (options) => {
        let opts = options.map((o) => `
            <div>
                <input type="checkbox" data-value="${o.value}" />
                ${o.label || o.option}
            </div>
        `);
        let dialog = `
            <div data-rel="dialog-answer-list">
                <div class="list-options">${ops.join("")}</div>
                <input type="button">OK</button>
            </div>
        `;
        $(dialog).appendTo($(element));
      };
      this._recordAnswers = () => {
        let sender = this;
        $(element).find("[data-rel=screening-fields] input, [data-rel=screening-fields] select").each((i, el) => {
          let field = $(el);
          switch (field.attr("data-qtype")) {
            case "text": {
              sender._answers[field.attr("data-qid")] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: field.val(),
                candidateID: sender.candidateID
              };
              break;
            }
            case "number": {
              sender._answers[field.attr("data-qid")] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: parseInt(field.val()),
                candidateID: sender.candidateID
              };
              break;
            }
            case "date": {
              sender._answers[field.attr("data-qid")] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: field.val(),
                candidateID: sender.candidateID
              };
              break;
            }
            case "bool": {
              sender._answers[field.attr("data-qid")] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: field.is(":checked"),
                candidateID: sender.candidateID
              };
              break;
            }
            case "list": {
              sender._answers[field.attr("data-qid")] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: field.val(),
                candidateID: sender.candidateID
              };
              break;
            }
            case "check-list": {
              sender._answers[`${field.attr("data-qid")}:${field.attr("data-value")}`] = {
                sRQuestionID: field.attr("data-qid"),
                key: "Value",
                value: field.attr("data-value"),
                candidateID: sender.candidateID
              };
              break;
            }
            case "radio": {
              if (field.is(":checked")) {
                sender._answers[field.attr("data-qid")] = {
                  sRQuestionID: field.attr("data-qid"),
                  key: "Value",
                  value: field.attr("value"),
                  candidateID: sender.candidateID
                };
              }
              break;
            }
            case "file": {
              let file = field.get(0).files.length > 0 && field.get(0).files[0];
              if (file) {
                sender._readFile(file).then((val) => {
                  sender._answers[field.attr("data-qid")] = {
                    sRQuestionID: field.attr("data-qid"),
                    key: "Value",
                    value: val,
                    candidateID: sender.candidateID,
                    answerFileName: file.name
                  };
                });
              }
              break;
            }
          }
        });
      };
      this._restoreAnswers = () => {
        let sender = this;
        for (let qid in sender._answers) {
          let ans = sender._answers[qid];
          qid = qid.split(":")[0];
          let field = $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}]`);
          switch (field.attr("data-qtype")) {
            case "text":
            case "number":
            case "date": {
              field.val(ans.value);
              break;
            }
            case "bool": {
              field.attr("checked", true);
              break;
            }
            case "list":
            case "check-list":
            case "radio": {
              $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}][value=${ans.value}]`).attr("checked", true);
              $(element).find(`[data-rel=screening-fields] select[data-qid=${qid}]`).val(ans.value);
              break;
            }
            case "file": {
              field.val(this._fileBlob(ans.value));
              break;
            }
          }
        }
      };
      this._validate = () => {
        let isOk = true;
        $(element).find("[data-rel=screening-fields] input[required], [data-rel=screening-fields] select[required]").each((i, el) => {
          let field = $(el);
          switch (field.attr("data-qtype")) {
            case "text":
            case "select": {
              let val = field.val();
              isOk = isOk && val && val.trim().length > 0;
              break;
            }
            case "bool": {
              isOk = isOk && field.is(":checked");
              break;
            }
            case "number": {
              isOk = isOk && !isNaN(field.val());
              break;
            }
            case "date": {
              let val = Date.parse(field.val());
              isOk = isOk && !isNaN(val);
              break;
            }
            case "radio": {
              isOk = isOk && $(element).find(`[data-rel=screening-fields] input[type=radio][name=${field.attr("name")}]`).is(":checked");
              break;
            }
            case "file": {
              isOk = isOk && field.get(0).files.length > 0;
              break;
            }
          }
        });
        return isOk;
      };
      this._readFile = (file) => {
        return new Promise((res) => {
          let reader = new FileReader();
          reader.addEventListener("load", () => {
            res(btoa(reader.result));
          }, false);
          reader.readAsBinaryString(file);
        });
      };
      this._fileBlob = (b64Data, contentType = "", sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
      };
      this._fetchQuestions().then(() => {
        this._showQuestions(-1, false);
      });
      return this;
    }
    function experienceEl() {
      return `
        <div class="section-experience" data-rel="job-experience">
            <div class="input-field-container">
                <label class="required">${data.config.experienceTitle}</label>
                <input data-rel="field" data-field="title" data-required />
            </div>

            <div class="input-field-container">
                <label>${data.config.experienceCompany}</label>
                <input data-rel="field" data-field="company" />
            </div>

            <div class="input-field-container input-field-spacer">
                <label>${data.config.experienceLocation}</label>
                <input data-rel="field" data-field="location" />
            </div>

            <div class="input-field-container input-field-spacer">
                <label>${data.config.experienceDescription}</label>
                <textarea rows="5" cols="50" data-rel="field" data-field="description" data-required></textarea>
            </div>

            <div class="input-field-container">
                <label class="required">${data.config.experienceStartDate}</label>
                <input type="date" data-rel="field" data-field="startDate" data-required />
            </div>

            <div class="input-field-container">
                <label class="required">${data.config.experienceEndDate}</label>
                <input type="date" data-rel="field" data-field="endDate" data-required />
            </div>

            <div class="radioBtnContainer">
                <label>${data.config.experienceCurrent}</label>
                <input type="checkbox" data-rel="field" data-field="current" data-required />
            </div>

            <div class="button-set add">
                <button data-rel="button-action" data-action="cancel">${data.config.experienceCancelButton || "Cancel"}</button>
                <button data-rel="button-action" data-action="save">${data.config.experienceSaveButton || "Save"}</button>
            </div>

            <div class="button-set edit">
                <button data-rel="button-action" data-action="delete">${data.config.experienceDeleteButton || "Delete"}</button>
                <button data-rel="button-action" data-action="edit">${data.config.experienceEditButton || "Edit"}</button>
            </div>
        </div>
    `;
    }
    function educationEl() {
      return `
        <div class="section-education" data-rel="education">
            <div class="input-field-container">
                <label class="required">${data.config.educationInstitution}</label>
                <input data-rel="field" data-field="institution" data-required />
            </div>

            <div class="input-field-container">
                <label>${data.config.educationMajor}</label>
                <input data-rel="field" data-field="major" />
            </div>

            <div class="input-field-container input-field-spacer">
                <label>${data.config.educationDegree}</label>
                <input data-rel="field" data-field="degree" />
            </div>

            <div class="input-field-container input-field-spacer">
                <label>${data.config.educationDescription}</label>
                <textarea rows="5" cols="50" data-rel="field" data-field="description" data-required></textarea>
            </div>

            <div class="input-field-container">
                <label class="required">${data.config.educationStartDate}</label>
                <input type="date" data-rel="field" data-field="startDate" data-required />
            </div>

            <div class="input-field-container">
                <label class="required">${data.config.educationEndDate}</label>
                <input type="date" data-rel="field" data-field="endDate" data-required />
            </div>

            <div class="radioBtnContainer">
                <label>${data.config.educationCurrent}</label>
                <input type="checkbox" data-rel="field" data-field="current" data-required />
            </div>

            <div class="button-set add">
                <button data-rel="button-action" data-action="cancel">${data.config.educationCancelButton || "Cancel"}</button>
                <button data-rel="button-action" data-action="save">${data.config.educationSaveButton || "Save"}</button>
            </div>


            <div class="button-set edit">
                <button data-rel="button-action" data-action="delete">${data.config.educationDeleteButton || "Delete"}</button>
                <button data-rel="button-action" data-action="edit">${data.config.educationEditButton || "Edit"}</button>
            </div>
        </div>
    `;
    }
    if (data.config.showExperience) {
      let addExperienceEl2 = () => {
        let el = $(experienceEl());
        $(element).find("[data-rel=container-experience]").append(el);
        el.find("[data-rel=button-remove]").on("click", function() {
          el.remove();
        });
        el.find("[data-rel=button-action][data-action=save]").on("click", function() {
          let isValid = true;
          el.find("[data-required]").each(function(_, i) {
            let el2 = $(i);
            let v = el2.val();
            if (!v || v.length === 0) {
              isValid = false;
              el2.addClass("invalid");
            } else {
              el2.removeClass("invalid");
            }
          });
          if (!isValid) {
            alert("Please the complete the required fields");
          } else {
            el.addClass("saved").find("input, textarea").attr("readonly", "readonly");
          }
        });
        el.find("[data-rel=button-action][data-action=cancel], [data-rel=button-action][data-action=delete]").on("click", function() {
          el.remove();
        });
        el.find("[data-rel=button-action][data-action=edit]").on("click", function() {
          el.removeClass("saved").find("input, textarea").removeAttr("readonly");
        });
        return el;
      };
      $(element).find("[data-rel=button-add-experience]").on("click", function() {
        addExperienceEl2();
      });
      if (hasLoggedInUser()) {
        let session = JSON.parse(window.localStorage.vinylResponse).response;
        action.getExperience(session.candidateID).then((r) => {
          if (r.status && r.response && r.response.items) {
            r.response.items.forEach((exp) => {
              let el = addExperienceEl2();
              for (let i in exp) {
                let field = el.find(`[data-field=${i}]`);
                if (field.is("[type=checkbox]") && exp[i] === true) {
                  field.attr("checked", "true");
                } else {
                  field.val(exp[i]);
                }
              }
            });
          }
        });
      }
    }
    if (data.config.showEducation) {
      let addEducationEl = () => {
        let el = $(educationEl());
        $(element).find("[data-rel=container-education]").append(el);
        el.find("[data-rel=button-remove]").on("click", function() {
          el.remove();
        });
        el.find("[data-rel=button-action][data-action=save]").on("click", function() {
          let isValid = true;
          el.find("[data-required]").each(function(_, i) {
            let el2 = $(i);
            let v = el2.val();
            if (!v || v.length === 0) {
              isValid = false;
              el2.addClass("invalid");
            } else {
              el2.removeClass("invalid");
            }
          });
          if (!isValid) {
            alert("Please the complete the required fields");
          } else {
            el.addClass("saved");
          }
        });
        el.find("[data-rel=button-action][data-action=cancel], [data-rel=button-action][data-action=delete]").on("click", function() {
          el.remove();
        });
        el.find("[data-rel=button-action][data-action=edit]").on("click", function() {
          el.removeClass("saved");
        });
        return el;
      };
      $(element).find("[data-rel=button-add-education]").on("click", function() {
        addEducationEl();
      });
      if (hasLoggedInUser()) {
        let session = JSON.parse(window.localStorage.vinylResponse).response;
        action.getEducation(session.candidateID).then((r) => {
          if (r.status && r.response && r.response.items) {
            r.response.items.forEach((exp) => {
              let el = addExperienceEl();
              for (let i in exp) {
                let field = el.find(`[data-field=${i}]`);
                if (field.is("[type=checkbox]") && exp[i] === true) {
                  field.attr("checked", "true");
                } else {
                  field.val(exp[i]);
                }
              }
            });
          }
        });
      }
    }
    if (data.config.showCountry) {
      $.getScript("https://shazamme.io/resource/country-select/js/countrySelect.min.js", function() {
        $("head").append($("<link rel='stylesheet' href='https://shazamme.io/resource/country-select/css/countrySelect.min.css' type='text/css' media='screen' />"));
        $(element).find("#country").countrySelect({
          responsiveDropdown: true,
          preferredCountries: ["au", "us"]
        });
      });
    }
    const main = (w) => {
      const screening = screeningQuestions();
      const register = () => {
        let candidateInfo2 = collectRegisterFormValues();
        let isCompleteFields = isObjectComplete(candidateInfo2);
        let acceptablePassword = isAcceptedPassword;
        if (!isCompleteFields) {
          buttonAction("hide");
          alert(data.config.warningFields || "Please complete all required fields");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          return Promise.reject();
        }
        if (shouldUploadResume && !candidateInfo2.cVFileContent) {
          alert(data.config.warningResume || "Please upload your resume");
          return Promise.reject();
        }
        if (!acceptablePassword) {
          buttonAction("hide");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          alert(data.config.warningPassword || "Please follow the password pattern!");
          return Promise.reject();
        }
        if (!/^\b[A-Za-z0-9._%+-~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b$/.test(candidateInfo2.eMail)) {
          buttonAction("hide");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          alert(data.config.warningEmail || "Please supply a valid email.");
          return Promise.reject();
        }
        let email = candidateInfo2.eMail;
        candidateInfo2.candidateID = shazamme.uuid();
        if (data.config.showPassword || !data.config.useAnonymous) {
          return action.nativeRegister(candidateInfo2);
        } else {
          return firebase.auth().fetchSignInMethodsForEmail(email).then(() => shazamme.auth(email)).then((u) => {
            if (u == null ? void 0 : u.candidate) {
              shazamme.endSession();
              candidateInfo2.candidateID = u.candidate.candidateID;
              return checkForDuplicate(candidateInfo2.candidateID).then((exists) => {
                if (exists) {
                  if (confirm(data.config.duplicateWarning || "DUPLICATE WARNING MESSAGE")) {
                    let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dashboardPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${registerPage}`;
                    window.location.href = link;
                  } else {
                    window.location.reload();
                  }
                  return Promise.reject();
                } else {
                  return Promise.resolve(u);
                }
              });
            } else {
              return shazamme.submit({
                action: "Register Candidate",
                ...candidateInfo2,
                isValidated: false
              }).then(() => shazamme.auth(email)).then((u2) => {
                shazamme.endSession();
                return Promise.resolve(u2);
              });
            }
          });
        }
      };
      const collectRegisterFormValues = () => {
        let password = $("#passwordInput").val() || "";
        const el = $(element);
        if (!data.config.showPassword) {
          password = shazamme.uuid();
          isAcceptedPassword = true;
        }
        let r = {
          salutation: $(element).find("#salutation").val() || " ",
          firstName: el.find("#firstName").val() || "",
          surname: el.find("#lastName").val() || "",
          eMail: el.find("#emailAddress").val() || "",
          phone: data.config.showPhoneNumber && el.find("#phoneNumber").val() || (!data.config.requirePhone ? void 0 : ""),
          password,
          isActive: true,
          isValidated: true,
          isSubscribed: showSubscription && el.find("[data-rel=checkbox-subscribe]:checked").length > 0,
          dudaSiteID: data.siteId,
          cVFileContent: uploadedFiles.resumeFile && btoa(uploadedFiles.resumeFile),
          cVFileName: uploadedFiles.resumeName
        };
        if (w && data.config.enableTracing && (!uploadedFiles.resumeFile || !uploadedFiles.coverLetterFile)) {
          w.warn("file(s) missing", r);
          w.warn("file(s) missing (contains uploads)", uploadedFiles);
        }
        if (data.config.validatePhoneNumber) {
          r.defaultPhoneCountry = data.config.defaultPhoneCountry || "AU";
          r.validatePhone = true;
        }
        return r;
      };
      w.sub(Message.submit, () => {
        if (!getJobID()) {
          alert(data.config.warningNoJob || "No job selected!");
          return;
        }
        let hasResumeFileElement = document.querySelector("input#resume[type=file]");
        let hasCoverFileElement = document.querySelector("input#cover[type=file]");
        let hasItemsTobeUploaded = shouldUploadResume || shouldUploadCover || Object.keys(uploadedFiles).length || $(element).find("#uploadExisting").is(":checked");
        $(element).find(".fcLoader").addClass("fcLoadingSeek");
        shazamme.store("previousApplicationPage", null);
        if (!screening.isValid) {
          buttonAction("hide");
          alert(data.config.warningQuestions || "Please complete all of the screening questions");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          return;
        }
        if (data.config.requireApproval === true && !$(element).find("[data-rel=field-approve]").is(":checked")) {
          buttonAction("hide");
          alert(data.config.approvalWarning || "Please confirm approval of the terms");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          return;
        }
        const invalidName = (n, p) => (p == null ? void 0 : p.length) > 0 && p || (n == null ? void 0 : n.length) > 0 && n || "";
        let invalid = $(element).find("input.invalid").map((_, e) => `- ${invalidName($(e).attr("data-name"), $(e).attr("placeholder"))}`).toArray();
        if (invalid.length > 0) {
          buttonAction("hide");
          alert(`${data.config.warningValidation || "Please correct the following:"}
${invalid.join("\n")}`);
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          return;
        }
        let apply = (u) => {
          var _a, _b, _c, _d;
          let referralSource = {
            referralSource: uri.searchParams.get("utm_source") || shazamme.session("referralSource"),
            referralMedium: uri.searchParams.get("utm_medium") || shazamme.session("referralMedium"),
            referralTerm: uri.searchParams.get("utm_term") || shazamme.session("referralTerm"),
            referralCampaign: uri.searchParams.get("utm_campaign") || shazamme.session("referralCampaign"),
            referralContent: uri.searchParams.get("utm_content") || shazamme.session("referralContent")
          };
          let a = {
            action: "Apply Job",
            jobID: getJobID(),
            candidateID: (_a = u == null ? void 0 : u.candidate) == null ? void 0 : _a.candidateID,
            dudaSiteID: data.siteId,
            screeningAnswers: screening.answers(),
            ...referralSource
          };
          if (hasItemsTobeUploaded) {
            if ($("#uploadExisting").is(":checked") && ((_b = u == null ? void 0 : u.candidate) == null ? void 0 : _b.cVFileContent)) {
              a.resumeFile = (_c = u == null ? void 0 : u.candidate) == null ? void 0 : _c.cVFileContent;
              a.resumeFileName = (_d = u == null ? void 0 : u.candidate) == null ? void 0 : _d.cVFileName;
            } else {
              try {
                let resume = checkFileUploaded(hasResumeFileElement, shouldUploadResume, "resume");
                a.resumeFile = resume && btoa(uploadedFiles.resumeFile);
                a.resumeFileName = resume && uploadedFiles.resumeName;
                a.resumeUpdatedOn = resume && /* @__PURE__ */ new Date();
              } catch (e) {
                $(element).find(".fcLoader").removeClass("fcLoadingSeek");
                return;
              }
            }
            try {
              let cover = checkFileUploaded(hasCoverFileElement, shouldUploadCover, "coverLetter");
              a.coverLetterFile = cover && btoa(uploadedFiles.coverLetterFile);
              a.coverLetterFileName = cover && uploadedFiles.coverLetterFileName;
              a.coverLetterUpdatedOn = cover && /* @__PURE__ */ new Date();
            } catch (e) {
              $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              return;
            }
            if (hasResumeFileElement && shouldUploadResume && !a.resumeFile) {
              alert(data.config.warningResume || "Please upload your resume");
              return;
            }
            if (hasCoverFileElement && shouldUploadCover && !a.coverLetterFile) {
              alert(data.config.warningCoverLetter || `Please upload your cover letter, or tick the "I don't have cover letter"`);
              return;
            }
          }
          if (data.config.showGender) {
            a.customField1 = $("#gender").val();
          }
          if (data.config.showAboriginal) {
            a.customField2 = $("#aboriginal").is(":checked");
          }
          if (data.config.enableTracing) {
            a.session = shazamme.uuid(), w.log("apply", {
              candidate: candidateInfo,
              application: a
            });
          }
          shazamme.submit(a).then(() => {
            buttonAction("stop");
            action.clearKeys();
            let path = `/${thankYouPage}`;
            if (data.config.includeLastSearch) {
              shazamme.site().then((s) => shazamme.fetch({
                path: `/job-results/${s.siteID}/${getJobID()}`,
                isExternal: true,
                useCache: true
              })).then((j) => {
                let query = [];
                let push = (n) => {
                  let v = j == null ? void 0 : j.data[n];
                  if ((v == null ? void 0 : v.length) > 0) {
                    query.push(`${n}=${encodeURIComponent(v)}`);
                  }
                };
                data.config.redirectJobField.forEach((i) => {
                  push(i.field);
                });
                window.location.href = `/${thankYouPage}?${query.join("&")}`;
              });
            } else {
              window.location.href = path;
            }
          });
        };
        shazamme.currentUser().then((u) => {
          if (u == null ? void 0 : u.candidate) {
            checkForDuplicate(u.candidate.candidateID).then((exists) => {
              if (exists) {
                if (confirm(data.config.duplicateWarning || "DUPLICATE WARNING MESSAGE")) {
                  let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dashboardPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${dashboardPage}`;
                  window.location.href = link;
                } else {
                  window.location.reload();
                }
                return;
              }
              apply(u);
            });
          } else {
            buttonAction("apply");
            register().then((u2) => {
              if (u2) {
                loginFrom = "registrationForm";
                buttonAction("hide");
                apply(u2);
              }
            }).catch(() => {
              $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              buttonAction("hide");
            });
            return;
          }
        });
      });
      $(element).find(".eye").on("click", function() {
        let i = $(this);
        i.toggleClass("fa-eye-slash").toggleClass("fa-eye").siblings("input").attr("type", function(i2, v) {
          return v === "text" ? "password" : "text";
        });
      });
      if (data.config.validatePhoneNumber && typeof libphonenumber === "object") {
        $(element).find("input[type=telephone]").on("change", function() {
          const f = $(this);
          f.removeClass("invalid");
          if (f.val().trim().length === 0) {
            return;
          }
          try {
            const tel = libphonenumber.parsePhoneNumber(f.val(), data.config.defaultPhoneCountry || "AU");
            if (!tel.country || !tel.isValid()) {
              f.addClass("invalid");
            } else {
              f.val(tel.formatInternational());
            }
          } catch (e) {
            f.addClass("invalid");
          }
        });
      }
      shazamme.store("applicationURL", window.location.href);
      shazamme.store("jobID", getJobID());
      shazamme.site().then((s) => shazamme.fetch({
        path: `/job-results/${s.siteID}/${getJobID()}`,
        isExternal: true,
        useCache: true
      })).then((j) => {
        var _a;
        if (j == null ? void 0 : j.data) {
          shazamme.store("currentJobViewed", JSON.stringify(j));
          if (((_a = j.data.applicationURL) == null ? void 0 : _a.length) > 0) {
            window.location = j.data.applicationURL;
          }
        }
      });
      const handleUser = (u) => {
        if (u == null ? void 0 : u.isNew) {
          showOrHideForms({
            salutation: " ",
            firstName: u.firstName,
            surname: u.lastName,
            eMail: u.email,
            phone: "",
            isNew: true
          });
          return;
        }
        let session = u == null ? void 0 : u.candidate;
        showOrHideForms(session);
        (session == null ? void 0 : session.candidateID) && checkForDuplicate(session.candidateID).then((exists) => {
          if (exists) {
            if (confirm(data.config.duplicateWarning || "DUPLICATE WARNING MESSAGE")) {
              let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dashboardPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${dashboardPage}`;
              window.location.href = link;
            } else {
              window.location.reload();
            }
          }
        });
      };
      shazamme.currentUser().then((u) => {
        handleUser(u);
      });
      w.sub("site-auth", (u) => {
        handleUser(u);
      });
      if ((data.config.showExperience || data.config.showEducation) && data.config.dynamicOrdering) {
        dmAPI.getCollection({ collectionName: "Jobs" }).then((j) => {
          var _a;
          let job = j.find((x) => x.data.jobID === getJobID());
          if (job) {
            (_a = data.config.dynamicOrderRequirment) == null ? void 0 : _a.forEach((i) => {
              if (job.data[i.field] === i.value) {
                $(element).find("[data-rel=screening-fields]").hide();
                $(element).find("[data-rel=screening-fields][screening-fields=pre]").show();
                $(element).find("[data-rel=screening-apply][screening-apply=post]").show().on("click", function() {
                  if (!screening._validate()) {
                    alert("Please answer all questions");
                    return;
                  }
                  shazamme.pub(Message.submit);
                });
              }
            });
          }
        });
      }
    };
    $("head").append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/fontawesome.min.css" crossorigin="anonymous" />')).append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/regular.min.css" crossorigin="anonymous" />'));
    window.__shazLoadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(
      function() {
        Promise.all([
          shazamme.ready(data.siteId, data.page),
          shazamme.script("https://sdk.shazamme.io/js/plugin/libphonenumber/1.10.54/plugin.min.js")
        ]).then(() => {
          main(shazamme.register("application-screening-form-sr", data, true));
        });
      }
    );
  }
  return __toCommonJS(job_app_sq_sr_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-app-sq-sr"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
