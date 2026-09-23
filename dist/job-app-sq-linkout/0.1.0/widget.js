/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 61b98f91a932. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/job-app-sq-linkout.index.js
  var job_app_sq_linkout_index_exports = {};
  __export(job_app_sq_linkout_index_exports, {
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

  // dist/.gen/job-app-sq-linkout.index.js
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
      let opt = $("input[type=radio][name=uploadTypeResume][value=uploadResume]");
      opt.get(0).checked = true;
      opt.trigger("change");
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
      let opt = $("input[type=radio][name=uploadTypeResume][value=uploadResume]");
      opt.get(0).checked = true;
      opt.trigger("change");
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
      let opt = $("input[type=radio][name=uploadTypeCover][value=uploadCover]");
      opt.get(0).checked = true;
      opt.trigger("change");
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
      let opt = $("input[type=radio][name=uploadTypeCover][value=uploadCover]");
      opt.get(0).checked = true;
      opt.trigger("change");
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
    $("input[type=radio][name=uploadTypeCover]").on("change", function() {
      if (this.value == "uploadCover") {
        $(".coverUploadContainer").css("display", "flex");
        shouldUploadCover = true;
      } else {
        $(".coverUploadContainer").css("display", "none");
        shouldUploadCover = false;
      }
    }).first().attr("checked", "checked").trigger("change");
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
              r.status && !data.inEditor && shazamme.auth(u.email, u.firebaseUserID, true).then(() => {
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
    }
    function showOrHideForms(s) {
      const el = $(element);
      if (s) {
        el.find("#salutation").val(s.salutation || "");
        el.find("#firstName").val(s.firstName || "");
        el.find("#lastName").val(s.surname || "");
        el.find("#emailAddress").val(s.eMail || "").attr("readonly", "readonly");
        el.find("#phoneNumber").val(s.phone || "");
        el.find("#mobileNumber").val(s.mobile || "");
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
        el.find("#mobileNumber").val("");
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
      var _a, _b;
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
          let opts = (_a = q.options) == null ? void 0 : _a.map((o) => `<option value="${o.screeningQuestionOptionsID}">${o.option}</option>`);
          return `
                 <div class="input-field-container">
                    <p>${q.question}</p>
                    <select data-qtype="list" data-qid="${q.screeningQuestionID}">${(opts == null ? void 0 : opts.join("")) || ""}</select>
                 </div>
            `;
        }
        case "Radio": {
          let opts = (_b = q.options) == null ? void 0 : _b.map((o) => `<label><input type="radio" data-qtype="radio" name="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" value="${o.screeningQuestionOptionsID}" />${o.option}</label>`);
          return `
                 <div class="input-field-container">
                    <p> ${q.question}</p>
                    ${(opts == null ? void 0 : opts.join("")) || ""}
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
        }).then(
          (r) => {
            var _a, _b;
            return (r == null ? void 0 : r.status) && ((_b = (_a = r == null ? void 0 : r.response) == null ? void 0 : _a.items) == null ? void 0 : _b.find(
              (x) => x.jobID === getJobID() && x.jobApplicationID !== new URL(window.location).searchParams.get("jobApplicationID")
            ));
          }
        ) || Promise.resolve(false)
      );
    }
    function screeningQuestions(w, edit) {
      const sender = this;
      this.pageNumber = 0;
      this.isValid = true;
      this.nextPage = () => {
        this._showQuestions(this.pageNumber + 1);
      };
      this.prevPage = () => {
        this._showQuestions(this.pageNumber - 1);
      };
      this.answers = () => this._recordAnswers().then(() => {
        let data2 = [];
        for (let i in this._answers) {
          data2.push({ ...this._answers[i] });
        }
        return Promise.resolve(data2);
      });
      this.knockout = (answers) => {
        return answers.map(
          (a) => sender._ko.find(
            (i) => {
              var _a, _b, _c;
              return i.screeningQuestionID === a.screeningQuestionID && (i.questionType === "Text" && ((_a = a.answerText) == null ? void 0 : _a.toLowerCase()) === ((_b = i.knockOutText) == null ? void 0 : _b.toLowerCase()) || i.questionType === "Number" && a.answerNum === i.knockOutNumber || i.questionType === "Date" && a.answerDate === i.knockOutDate || i.questionType === "Boolean" && a.answerBoolean === i.knockOutBoolean || i.questionType === "List" && a.answerUUID === i.knockOutList || i.questionType === "Multiselect Checkbox" && (((_c = a.answerUUID) == null ? void 0 : _c.indexOf(i.knockOutList)) >= 0 || a.answerBoolean === i.knockOutBoolean) || i.questionType === "Radio" && a.answerUUID === i.knockOutList);
            }
          )
        ).filter((a) => a);
      };
      this._pages = [];
      this._maxPage = 0;
      this._answers = [];
      this._screeningTemplateID = void 0;
      this._mock = `{"status": true,"response":{"items":[{"screeningQuestionID": "ce7c381b-395f-4e85-9137-7ace979f896f","question": "Step 1","questionType": "Header","helpText": "This is some helpful text","sortOrder": 1,"isMandatory": false,"options":[]},{"screeningQuestionID": "91275432-36b1-4b2b-a5c2-4c7197387b35","question": "Date of Birth","questionType": "Date","helpText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","sortOrder": 6,"isMandatory": false,"options":[]},{"screeningQuestionID": "9973387a-f3d2-4b24-a8bb-b51cf5cdb525","question": "Employee ID","questionType": "Number","helpText": "This is some helpful text","sortOrder": 7,"isMandatory": false,"options":[]},{"screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","question": "Transaction Type","questionType": "List","helpText": "This is some helpful text","sortOrder": 8,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "b896ace1-41a7-437a-bf41-e5fe10b6b82a","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "B","sortOrder": 1},{"screeningQuestionOptionsID": "933faa87-0c4e-4fbd-9a5d-ae42e096eb20","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "C","sortOrder": 2},{"screeningQuestionOptionsID": "23b1656b-8de0-41e9-871a-fff5837c4195","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "D","sortOrder": 3},{"screeningQuestionOptionsID": "5df2baff-d500-4dfb-bb4a-731dd991e013","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "E","sortOrder": 4},{"screeningQuestionOptionsID": "f94db25d-b7ac-48cd-a003-26b8b40d7a96","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "G","sortOrder": 5},{"screeningQuestionOptionsID": "de59cf91-2e4f-4909-b998-406d0a4b8a37","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "H","sortOrder": 6},{"screeningQuestionOptionsID": "98c63643-1959-4692-af50-9a16de84e529","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "I","sortOrder": 7},{"screeningQuestionOptionsID": "df9a7fff-ef42-44f2-9b98-476910d922f8","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "J","sortOrder": 8},{"screeningQuestionOptionsID": "a4c61c72-6a86-4631-9de9-452cf36e5047","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "P","sortOrder": 9},{"screeningQuestionOptionsID": "0f68394f-acef-4d6e-a168-6dfa6b38c4f9","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "Q","sortOrder": 10},{"screeningQuestionOptionsID": "86024583-5818-45fd-96eb-ea6f5c8f5ee3","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "R","sortOrder": 11},{"screeningQuestionOptionsID": "0321642c-a25b-4907-8d98-073634a5a034","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "S","sortOrder": 12},{"screeningQuestionOptionsID": "9f5dd644-571b-4c1b-a754-a8075ade117c","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "W","sortOrder": 13},{"screeningQuestionOptionsID": "cdba5367-f492-49b5-90dc-7937e1070dd9","screeningQuestionID": "ee2139a7-d8dd-478f-b181-efdec59d8329","option": "Z","sortOrder": 14}]},{"screeningQuestionID": "563774e1-0dce-4647-9e7f-64fa032729ed","question": "Home Address","questionType": "Text","helpText": "This is some helpful text","sortOrder": 9,"isMandatory": false,"options":[]},{"screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","question": "Substantive Fraction of Time","questionType": "List","helpText": "This is some helpful text","sortOrder": 10,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "d8a64302-1f96-4151-87f0-9296e9a782c3","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.1","sortOrder": 1},{"screeningQuestionOptionsID": "ddda9c72-6ef7-4764-a338-b40f49bdd5a7","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.2","sortOrder": 2},{"screeningQuestionOptionsID": "5a7e10fb-242e-4057-af75-031721fb8e9c","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.3","sortOrder": 3},{"screeningQuestionOptionsID": "10bc6ff5-47b8-41bb-b6ef-1701cfb5853f","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.4","sortOrder": 4},{"screeningQuestionOptionsID": "a6fae6d8-69e7-415f-8ee6-01f101b4e157","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.5","sortOrder": 5},{"screeningQuestionOptionsID": "1fc43494-dd80-4269-b273-90308517d810","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.6","sortOrder": 6},{"screeningQuestionOptionsID": "0ceafb91-87b9-4507-aed6-b9b24596c1d2","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.7","sortOrder": 7},{"screeningQuestionOptionsID": "de68da8d-8ba2-4df6-870f-10766a65a821","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.8","sortOrder": 8},{"screeningQuestionOptionsID": "0c9f240a-b1b7-499e-96bd-a7692c83fdda","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "0.9","sortOrder": 9},{"screeningQuestionOptionsID": "f978d098-9745-40d5-9e0b-39161e5eae7d","screeningQuestionID": "5d0ebb2b-8962-46cc-a2b0-6a50e08b627c","option": "1.0","sortOrder": 10}]},{"screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","question": "Preferred Fraction of Time","questionType": "List","helpText": "This is some helpful text","sortOrder": 11,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "ec317984-8b88-4772-9cd6-24f0809a9344","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.1","sortOrder": 1},{"screeningQuestionOptionsID": "81cecbbe-0eed-45ea-9d07-81f4a74a7cfd","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.2","sortOrder": 2},{"screeningQuestionOptionsID": "f7df0994-c1d7-4a2f-a961-f245c0d549cf","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.3","sortOrder": 3},{"screeningQuestionOptionsID": "567b47ec-7d7a-4f85-907d-3d4867eab46f","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.4","sortOrder": 4},{"screeningQuestionOptionsID": "d7b20724-33cb-4524-8c40-90f1a043a8f1","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.5","sortOrder": 5},{"screeningQuestionOptionsID": "9028304b-54b7-484d-bf0c-3e02bfa94304","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.6","sortOrder": 6},{"screeningQuestionOptionsID": "c5b208ba-13fc-4b34-ae65-d1879402f6e2","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.7","sortOrder": 7},{"screeningQuestionOptionsID": "9fc69267-382d-4c12-8b98-b989681b2702","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.8","sortOrder": 8},{"screeningQuestionOptionsID": "4466ec89-30aa-4ffe-a76e-e4d04f25ee65","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "0.9","sortOrder": 9},{"screeningQuestionOptionsID": "41e92e75-ca76-458a-92bd-03117aeb6f1d","screeningQuestionID": "1c24c5a8-c8aa-4ac1-b148-6be79fb2deb6","option": "1.0","sortOrder": 10}]},{"screeningQuestionID": "d1de3ca8-e932-4381-9ce1-e81c0ea9f20f","question": "Current school site","questionType": "Text","helpText": "This is some helpful text","sortOrder": 12,"isMandatory": false,"options":[]},{"screeningQuestionID": "1160cd5f-3cee-4499-991e-149b69661643","question": "Qualifications","questionType": "Text","helpText": "Please add 350 words","sortOrder": 21,"isMandatory": false,"options":[]},{"screeningQuestionID": "ce9e43d3-ced7-4b24-8421-a4b19c7d9053","question": "Experience","questionType": "Text","helpText": "Please add 350 words ","sortOrder": 22,"isMandatory": false,"options":[]},{"screeningQuestionID": "c4a955a3-5643-4025-bd59-92bd1da6631a","question": "What, in your opinion, are the key ingredients in guiding and maintaining successful relationships, with colleagues, leadership, students and the broader school community? Give examples of how you made these work for you.","questionType": "Text","helpText": "Please add 350 words ","sortOrder": 23,"isMandatory": false,"options":[]},{"screeningQuestionID": "c04e78ed-6537-4648-91bd-5fd141bfda0c","question": "Employment Status","questionType": "List","helpText": "This is some helpful text","sortOrder": 100,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "521183bd-8320-4fdd-83b4-db7ead8f6512","screeningQuestionID": "c04e78ed-6537-4648-91bd-5fd141bfda0c","option": "Permanent","sortOrder": null},{"screeningQuestionOptionsID": "9396e375-d5ca-40cb-905f-bad4cbcfe0b1","screeningQuestionID": "c04e78ed-6537-4648-91bd-5fd141bfda0c","option": "Casual","sortOrder": null},{"screeningQuestionOptionsID": "ceba6fe2-04fc-4800-90bf-6c9715640f40","screeningQuestionID": "c04e78ed-6537-4648-91bd-5fd141bfda0c","option": "Temporary Relief Teacher","sortOrder": null}]},{"screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","question": "Subject Preference - 1st Selection","questionType": "Radio","helpText": "Select up to 4 ","sortOrder": 113,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "b6ec25ba-cef5-4eac-9452-685e72ef7381","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Aboriginal Education - AN","sortOrder": 10},{"screeningQuestionOptionsID": "c4fb041e-f0d9-49bf-8e2a-0b3e9b9ee08d","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Aboriginal Studies - AB ","sortOrder": 20},{"screeningQuestionOptionsID": "429ea8de-3e72-4426-91cc-ab9e57f9da32","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Accounting - AC","sortOrder": 30},{"screeningQuestionOptionsID": "b8c22e2d-a174-4d12-b639-47eb837ebbac","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Agriculture & Horticulture - AG","sortOrder": 40},{"screeningQuestionOptionsID": "677f8ea6-de86-4f03-b34e-1b633ab37f36","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Ancient Studies - AS","sortOrder": 50},{"screeningQuestionOptionsID": "8102d1e5-7be3-4cf8-a3db-3fe350fe719b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Art - AT","sortOrder": 60},{"screeningQuestionOptionsID": "74ed3800-9002-46a2-b583-12b0d002242b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Australian Indigenous Languages - AV","sortOrder": 70},{"screeningQuestionOptionsID": "3ef9c039-14d0-4875-af7a-76b55b6144b6","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Biology - BL","sortOrder": 80},{"screeningQuestionOptionsID": "67cb3611-ed1e-40f2-9721-d32f434bdf07","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Birth to Preschool - BP0B","sortOrder": 90},{"screeningQuestionOptionsID": "dc6ba079-4ea9-4ef7-8bdd-f62c42c5ba15","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Business Studies - BS","sortOrder": 100},{"screeningQuestionOptionsID": "119b992f-3df7-49c5-8eec-50d379c1d14e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Chemistry - CH","sortOrder": 110},{"screeningQuestionOptionsID": "710b93a2-b5ab-410a-a3c9-29d188d6c433","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Child Studies  - CZ","sortOrder": 120},{"screeningQuestionOptionsID": "52372722-aeb7-4de5-80f4-08e20fe30904","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Chinese - CI","sortOrder": 130},{"screeningQuestionOptionsID": "a86d2c00-b663-46b2-8e27-8cebad6acc91","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Classical Studies - CS","sortOrder": 140},{"screeningQuestionOptionsID": "a5785c76-d8f5-4c56-a6dc-6ce172cc2440","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Community Studies - CY","sortOrder": 150},{"screeningQuestionOptionsID": "000f681a-d787-4897-9740-9e07a0faeada","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Computer/Aided Design/Manufacture - CX","sortOrder": 160},{"screeningQuestionOptionsID": "5b9abb59-91c6-4615-aa32-43482c6bab1f","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Construction Technology - CT","sortOrder": 170},{"screeningQuestionOptionsID": "f1378e76-76ff-4143-8dbe-f067b45c3d85","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Counselling - CG","sortOrder": 180},{"screeningQuestionOptionsID": "cfca283b-c436-47c0-8542-14618b4ebaed","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Dance - DA","sortOrder": 190},{"screeningQuestionOptionsID": "cbc174e2-b84d-4e46-a80d-ae2879858d30","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Design - DE","sortOrder": 200},{"screeningQuestionOptionsID": "65781253-8ac5-4425-8226-bc55168df6c0","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Design and Technology Materials - DT","sortOrder": 210},{"screeningQuestionOptionsID": "dd96a980-9db2-497b-9cc0-b50056a8d1a8","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Design and Technology Systems - ET","sortOrder": 220},{"screeningQuestionOptionsID": "ca4980c4-46d0-4c54-91be-986c5a0c1d2e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Drama - DR","sortOrder": 230},{"screeningQuestionOptionsID": "68ed5999-2928-4bb4-9027-b0998c76c16a","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Economics - EC","sortOrder": 240},{"screeningQuestionOptionsID": "fc136731-7a1d-4d0b-be81-c629f74d6cfd","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Education of children / students who are Vision Impaired - VI","sortOrder": 250},{"screeningQuestionOptionsID": "8840ac31-9694-4b32-9b52-2c129eddce1e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Education of children / students with Intellectual Disabilities - ID","sortOrder": 260},{"screeningQuestionOptionsID": "58d57207-6178-4e94-a05f-624c4b77aff1","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Education of children / students with Multiple Disabilities - MY","sortOrder": 270},{"screeningQuestionOptionsID": "67820147-185e-421c-a872-1a68402eea21","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Electronic Media - ME","sortOrder": 280},{"screeningQuestionOptionsID": "72c5b79b-2fc6-40bc-a92e-f7c4dfb9dcdd","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "English - EG","sortOrder": 290},{"screeningQuestionOptionsID": "7ca7c122-2027-418f-8412-107365713d97","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "English as a Second Language - TL","sortOrder": 300},{"screeningQuestionOptionsID": "e04d2dc5-0d24-443c-a913-11a0242a5569","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "English as a Second Language - TX","sortOrder": 310},{"screeningQuestionOptionsID": "02b7d15c-021a-4347-8d01-84a15c83e3a8","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Environmental Education - EY","sortOrder": 320},{"screeningQuestionOptionsID": "80f9c4b3-124b-417e-941a-2dc3df7e01d9","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Family Studies  - FZ","sortOrder": 330},{"screeningQuestionOptionsID": "c9100271-82b6-4c2d-a6bc-0255ffe4566e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Food & Hospitality  - FH","sortOrder": 340},{"screeningQuestionOptionsID": "e14938af-ea38-4fab-ae0e-393a32d73d77","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "French - FR","sortOrder": 350},{"screeningQuestionOptionsID": "22f1e2b8-0103-4ebd-9759-25db13e7af75","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Geography - GG","sortOrder": 360},{"screeningQuestionOptionsID": "929caf56-de13-4650-9b79-454b4bbc3ce8","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Geology - GL","sortOrder": 370},{"screeningQuestionOptionsID": "9a240a56-54ef-42fe-a4bf-d5b8ce196815","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "German - GM","sortOrder": 380},{"screeningQuestionOptionsID": "04fbabcf-9921-4fac-860d-69864e51363f","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Health and Personal Development - HQ","sortOrder": 390},{"screeningQuestionOptionsID": "c2767d20-f570-4c98-a295-9d1b63539695","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Health Education - HA","sortOrder": 400},{"screeningQuestionOptionsID": "8cbe2b2c-a7e0-4368-92e2-0761ffd61790","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "History - HI","sortOrder": 410},{"screeningQuestionOptionsID": "4124185f-caee-4b46-9a77-36fdb9097506","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "History, Australian - HU","sortOrder": 420},{"screeningQuestionOptionsID": "347bf5da-bf80-47ac-8c47-88d2dd47873b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "History, Modern - HZ","sortOrder": 430},{"screeningQuestionOptionsID": "0c9a5c5c-e2f0-429f-b16e-3ee9eb0ba3d8","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Home Economics - HE","sortOrder": 440},{"screeningQuestionOptionsID": "6f2f49bd-5d28-4a74-89f0-cec373a469af","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Indonesian - IN","sortOrder": 450},{"screeningQuestionOptionsID": "d0655204-8d5d-4250-8972-f192eb5f00b9","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Information Processing & Publishing - IQ","sortOrder": 460},{"screeningQuestionOptionsID": "60a01d22-0697-45db-b790-8790247ddfa2","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Information Technology - IF","sortOrder": 470},{"screeningQuestionOptionsID": "a3760e51-b3e9-49c8-9023-4c91bf03edee","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Instrumental Music - MI","sortOrder": 480},{"screeningQuestionOptionsID": "ca37bc3d-f86a-4d7d-b178-8a7d7add651e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Italian - IT","sortOrder": 490},{"screeningQuestionOptionsID": "6cbdb804-aed1-4985-81ae-c0130cf8937e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Japanese - JA","sortOrder": 500},{"screeningQuestionOptionsID": "64bccc2a-e1da-4b8a-bde0-136334d21b23","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Junior Primary - JP00 ","sortOrder": 510},{"screeningQuestionOptionsID": "e15ba51f-c6d3-405a-8ba4-d52a72490d17","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Legal Studies - LG","sortOrder": 520},{"screeningQuestionOptionsID": "bcf66907-5bc4-4792-b5b8-81692d230564","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Mathematical Applications - MX","sortOrder": 530},{"screeningQuestionOptionsID": "a69458f9-3755-402d-a440-d51c1bcff6a9","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Mathematical Studies / Methods - YX","sortOrder": 540},{"screeningQuestionOptionsID": "19407503-4837-4101-a201-6681271c99a3","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Mathematics - MA","sortOrder": 550},{"screeningQuestionOptionsID": "ad02e15f-a314-43de-a7cb-bc4bc5872fd4","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Media Studies - FV","sortOrder": 560},{"screeningQuestionOptionsID": "5084fc28-cc5b-4b38-9793-240530984855","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Middle Schooling - MM09","sortOrder": 570},{"screeningQuestionOptionsID": "6ce04daa-4531-4fec-98b4-34b98bf63171","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Modern Greek - GK","sortOrder": 580},{"screeningQuestionOptionsID": "dab2960a-d929-41d1-b1a6-aff309c27138","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Music - MU","sortOrder": 590},{"screeningQuestionOptionsID": "852646d2-a4bd-4322-8716-ed31ecb6cb73","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "New Arrivals Program - TZ","sortOrder": 600},{"screeningQuestionOptionsID": "7b5c107f-1c44-4e17-95b1-30d96e04da10","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Nutrition - NT","sortOrder": 610},{"screeningQuestionOptionsID": "66898d8d-a687-4295-8cbb-fd41af3ecdc2","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Other Languages - ZL","sortOrder": 620},{"screeningQuestionOptionsID": "fad46f01-cae7-4df6-9432-633ed7cd4467","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Other Technologies - ZV","sortOrder": 630},{"screeningQuestionOptionsID": "f41925a3-fda0-426f-8de0-4474b2765b55","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Outdoor Education - OE","sortOrder": 640},{"screeningQuestionOptionsID": "1dfee643-55f5-4bb5-b525-2ccc22aee08b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Philosophy - PZ","sortOrder": 650},{"screeningQuestionOptionsID": "957063a9-b73f-45ab-a130-539e9d42b387","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Photography - PH","sortOrder": 660},{"screeningQuestionOptionsID": "20173b85-1002-4527-81b4-0cf675ea4f1f","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Physical Education - PE","sortOrder": 670},{"screeningQuestionOptionsID": "93acee50-4cf2-483d-bf4a-3ff7dcad1a8c","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Physics - PC","sortOrder": 680},{"screeningQuestionOptionsID": "87dbe785-f14c-4b30-8c83-6aa7bfa2b8e3","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Politics - PG","sortOrder": 690},{"screeningQuestionOptionsID": "fceffcd1-35e9-4ee1-8ba5-f8a06ce83a1c","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Preschool - PS0P","sortOrder": 700},{"screeningQuestionOptionsID": "52054688-4672-42b4-973f-6d07459bc8be","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Primary - PR00 ","sortOrder": 710},{"screeningQuestionOptionsID": "34ba1881-d4e4-48f2-aa21-47210729b82a","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Psychology - PW","sortOrder": 720},{"screeningQuestionOptionsID": "c0c3a1ce-cf39-42de-9d2a-a37497aa61f4","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Science - SC","sortOrder": 730},{"screeningQuestionOptionsID": "c2d37c2f-2401-4327-bd42-486ad54e7c52","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Society & Culture - SS ","sortOrder": 740},{"screeningQuestionOptionsID": "04f37727-d336-42d6-a1dd-30573ff2238b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Society & Environment - SV","sortOrder": 750},{"screeningQuestionOptionsID": "0ca1b71c-a646-4756-8f88-25a2e4f7accb","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Spanish - SP","sortOrder": 760},{"screeningQuestionOptionsID": "45f9b941-52ac-406d-af56-bcbb14402793","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Special Education (School / Preschool Based) - SL","sortOrder": 770},{"screeningQuestionOptionsID": "4f7a491b-a060-41de-8732-82f87051e62b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Special Education (Special Class) - SZ","sortOrder": 780},{"screeningQuestionOptionsID": "4ad465cb-c27a-4020-90d2-a57d5040c00b","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Specialist Mathematics - YZ","sortOrder": 790},{"screeningQuestionOptionsID": "ca8da535-8738-4657-acba-d4bf0ddb8adf","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Sustainable Futures - SF","sortOrder": 800},{"screeningQuestionOptionsID": "4938f09c-c00d-497e-8208-4fa0006148de","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Teacher Librarian - LI","sortOrder": 810},{"screeningQuestionOptionsID": "7a0fdc2d-0e0a-4c2a-97fa-afabe661e4da","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Technology - TP","sortOrder": 820},{"screeningQuestionOptionsID": "db799827-2dc3-402c-bcba-2f8e464e88fd","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "The Arts - ZD","sortOrder": 830},{"screeningQuestionOptionsID": "15bb3d65-eef7-48a7-8f99-a88499bf50da","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Tourism - TU","sortOrder": 840},{"screeningQuestionOptionsID": "dac85405-2084-4ceb-aef7-4d023b5c794a","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Vietnamese - VT","sortOrder": 850},{"screeningQuestionOptionsID": "24f3808b-8d18-44a1-9f0b-b223bd3cff9a","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Vocational Education and Training - VE","sortOrder": 860},{"screeningQuestionOptionsID": "f6e900f0-7cfc-43d0-81e2-07e92685ba5e","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Women\u2019s Studies - WS","sortOrder": 870},{"screeningQuestionOptionsID": "426f2f58-b5b7-48a3-9706-024385bbe99d","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Work Education - WD","sortOrder": 880},{"screeningQuestionOptionsID": "f2f9f112-ba81-477a-beef-26bfa7e7c1bd","screeningQuestionID": "c5ca6809-2009-4a00-8d24-3c6a1e59318f","option": "Working with children / students with Hearing Impairments - TO","sortOrder": 890}]},{"screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","question": "Year Levels 1st Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 114,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "4b5a695d-bc7b-41d7-a164-f9e074d9abe1","screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","option": "R - 2","sortOrder": 1},{"screeningQuestionOptionsID": "a6c498b1-5782-40a8-a49d-5e62c180d3c3","screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","option": "R - 6","sortOrder": 2},{"screeningQuestionOptionsID": "431c790d-42b7-4607-bf5e-fee5f9d403db","screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","option": "7 - 9","sortOrder": 3},{"screeningQuestionOptionsID": "7c52ce34-2a02-48a0-85cc-14069c6fa2d8","screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","option": "10 - 12","sortOrder": 4},{"screeningQuestionOptionsID": "9163be25-1f2c-4e46-99bb-7afe2ca53618","screeningQuestionID": "56a50730-42bd-461e-93fa-ab96133c8355","option": "7 - 12","sortOrder": 5}]},{"screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","question": "Subject Preference - 2nd Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 215,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "c0911bbc-3fc9-4fc8-9046-b0315d80f576","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Aboriginal Education - AN","sortOrder": 10},{"screeningQuestionOptionsID": "116f9e78-edb5-4f99-9fe7-af30738957ae","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Aboriginal Studies - AB ","sortOrder": 20},{"screeningQuestionOptionsID": "4a72ad21-bb2b-488c-a00c-ffd94a71e083","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Accounting - AC","sortOrder": 30},{"screeningQuestionOptionsID": "eaaf171b-2869-4148-9449-191429591633","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Agriculture & Horticulture - AG","sortOrder": 40},{"screeningQuestionOptionsID": "cda9e416-9e85-48c1-947d-0f321c1032a3","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Ancient Studies - AS","sortOrder": 50},{"screeningQuestionOptionsID": "0861e605-3fdb-4c5e-a475-ade7b67dd9a8","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Art - AT","sortOrder": 60},{"screeningQuestionOptionsID": "6fe35024-3408-46a9-9855-91d681b868f1","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Australian Indigenous Languages - AV","sortOrder": 70},{"screeningQuestionOptionsID": "7ffa1b80-9085-4308-83ed-1ee9dc7e640e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Biology - BL","sortOrder": 80},{"screeningQuestionOptionsID": "a9f0e9c8-d659-4a97-ab2c-0567b96e1236","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Birth to Preschool - BP0B","sortOrder": 90},{"screeningQuestionOptionsID": "838f7d73-31d9-4fa1-9b52-03c1d4fd5f1d","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Business Studies - BS","sortOrder": 100},{"screeningQuestionOptionsID": "516278a9-4aa6-44dc-a3d7-c8af70c3b1c8","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Chemistry - CH","sortOrder": 110},{"screeningQuestionOptionsID": "890a14b7-2a08-477d-b704-dbc67fe7f047","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Child Studies  - CZ","sortOrder": 120},{"screeningQuestionOptionsID": "8a0e8a6b-3b3f-4892-9617-48bbd4728330","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Chinese - CI","sortOrder": 130},{"screeningQuestionOptionsID": "2278a99c-da52-45df-b961-456cab43902a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Classical Studies - CS","sortOrder": 140},{"screeningQuestionOptionsID": "b96f9cca-925a-4f7c-8a47-10e64898ef9a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Community Studies - CY","sortOrder": 150},{"screeningQuestionOptionsID": "955d3ebf-776c-4de5-aee7-32f6795dd104","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Computer/Aided Design/Manufacture - CX","sortOrder": 160},{"screeningQuestionOptionsID": "148a6bb4-d608-4100-ad07-bb6af6c1646a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Construction Technology - CT","sortOrder": 170},{"screeningQuestionOptionsID": "2ced36c4-89cf-4d5b-ada4-dd4cc54ca872","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Counselling - CG","sortOrder": 180},{"screeningQuestionOptionsID": "511f3fcc-ca6c-48c4-b91d-767026ae11d2","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Dance - DA","sortOrder": 190},{"screeningQuestionOptionsID": "2ae3e7cd-022c-4144-a040-b03152ecdf8b","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Design - DE","sortOrder": 200},{"screeningQuestionOptionsID": "26edfb8d-6f05-43a3-a275-400a8811a146","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Design and Technology Materials - DT","sortOrder": 210},{"screeningQuestionOptionsID": "2f12ad76-49e5-44ce-b03c-9926cdb1d2e5","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Design and Technology Systems - ET","sortOrder": 220},{"screeningQuestionOptionsID": "11b9b709-e0d7-435d-b019-25b700c92688","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Drama - DR","sortOrder": 230},{"screeningQuestionOptionsID": "6c520d2b-8bc8-44da-a2ad-144b877fdede","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Economics - EC","sortOrder": 240},{"screeningQuestionOptionsID": "e4ca1592-ccec-4d41-978f-0c4ea031bdf1","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Education of children / students who are Vision Impaired - VI","sortOrder": 250},{"screeningQuestionOptionsID": "95ff211a-dcce-4431-abd6-201e20924bf0","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Education of children / students with Intellectual Disabilities - ID","sortOrder": 260},{"screeningQuestionOptionsID": "e8985963-ff92-4d09-b956-97bb5eab3914","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Education of children / students with Multiple Disabilities - MY","sortOrder": 270},{"screeningQuestionOptionsID": "754069b4-a43a-467a-8744-b8697805c907","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Electronic Media - ME","sortOrder": 280},{"screeningQuestionOptionsID": "97a28468-33b7-4c40-99b3-6c7afd890e26","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "English - EG","sortOrder": 290},{"screeningQuestionOptionsID": "85744df6-f7d2-4cc3-bb9e-4be1ed52b9cf","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "English as a Second Language - TL","sortOrder": 300},{"screeningQuestionOptionsID": "f9f54bc0-5e5f-4893-9785-f9a8593aa032","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "English as a Second Language - TX","sortOrder": 310},{"screeningQuestionOptionsID": "722bf983-4d5d-4aa4-a099-3bf2eca7dd79","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Environmental Education - EY","sortOrder": 320},{"screeningQuestionOptionsID": "dcec4679-796d-461a-a235-ac456a20539f","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Family Studies  - FZ","sortOrder": 330},{"screeningQuestionOptionsID": "5f413918-9427-47a9-825b-3e3b2ba924f8","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Food & Hospitality  - FH","sortOrder": 340},{"screeningQuestionOptionsID": "e04e9159-c045-442e-8537-835c2bcf8af3","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "French - FR","sortOrder": 350},{"screeningQuestionOptionsID": "d0da0766-ee24-4de6-808d-2f433989e04a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Geography - GG","sortOrder": 360},{"screeningQuestionOptionsID": "7d38aada-0196-49c6-90d4-b775f20aa5d8","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Geology - GL","sortOrder": 370},{"screeningQuestionOptionsID": "4076fd01-0336-46d1-be87-73e447cd2f0e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "German - GM","sortOrder": 380},{"screeningQuestionOptionsID": "f5831804-5b38-4c91-b412-799423edd5be","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Health and Personal Development - HQ","sortOrder": 390},{"screeningQuestionOptionsID": "f77a6864-07a2-4c6c-98f8-340202a6a25a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Health Education - HA","sortOrder": 400},{"screeningQuestionOptionsID": "dde6374c-f90e-4a96-b463-ae4cfab7216c","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "History - HI","sortOrder": 410},{"screeningQuestionOptionsID": "7e971f62-c808-44f2-b83e-3110940c64d3","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "History, Australian - HU","sortOrder": 420},{"screeningQuestionOptionsID": "cc01857e-2139-4f30-b6bb-186cfc460c48","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "History, Modern - HZ","sortOrder": 430},{"screeningQuestionOptionsID": "c9509864-0d8d-41af-b840-a6e20895f4d3","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Home Economics - HE","sortOrder": 440},{"screeningQuestionOptionsID": "509e2c3d-5e7d-43f5-9962-b814f9d0bc9a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Indonesian - IN","sortOrder": 450},{"screeningQuestionOptionsID": "b1cdd3ce-49a5-44c2-94c9-df637e93b974","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Information Processing & Publishing - IQ","sortOrder": 460},{"screeningQuestionOptionsID": "221fe17d-e26a-40f1-9a89-dbe8d582baa6","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Information Technology - IF","sortOrder": 470},{"screeningQuestionOptionsID": "c6f3b339-3417-42e8-bd48-69e9b26ab670","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Instrumental Music - MI","sortOrder": 480},{"screeningQuestionOptionsID": "89ce657a-8af7-4bc5-8efa-1948565447e6","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Italian - IT","sortOrder": 490},{"screeningQuestionOptionsID": "3929b887-8cfe-4e3d-a726-585ba8202c1c","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Japanese - JA","sortOrder": 500},{"screeningQuestionOptionsID": "80d30657-057d-4905-ad33-de63e1b8b905","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Junior Primary - JP00 ","sortOrder": 510},{"screeningQuestionOptionsID": "49b5aae9-5862-4318-a54e-895e09500261","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Legal Studies - LG","sortOrder": 520},{"screeningQuestionOptionsID": "d497667b-67a1-4d3d-8692-3d0e442cddfb","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Mathematical Applications - MX","sortOrder": 530},{"screeningQuestionOptionsID": "01c491aa-10e1-4e40-a2c4-7e4f9476ca14","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Mathematical Studies / Methods - YX","sortOrder": 540},{"screeningQuestionOptionsID": "e9809096-aeac-4ada-83f4-2f3ec1d58c12","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Mathematics - MA","sortOrder": 550},{"screeningQuestionOptionsID": "c1004282-907b-4103-8933-d608305eabb8","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Media Studies - FV","sortOrder": 560},{"screeningQuestionOptionsID": "1934527d-dd39-455a-94bc-4b417e5b3782","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Middle Schooling - MM09","sortOrder": 570},{"screeningQuestionOptionsID": "e640fbc8-3e81-4b41-bfc3-5d46c0fe2b74","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Modern Greek - GK","sortOrder": 580},{"screeningQuestionOptionsID": "ead1f878-870a-400a-9376-1776b0c8f0de","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Music - MU","sortOrder": 590},{"screeningQuestionOptionsID": "cac7d012-ed39-45e1-9607-b94241d50c17","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "New Arrivals Program - TZ","sortOrder": 600},{"screeningQuestionOptionsID": "e9584437-058d-412b-8ab9-1b00a1b1008a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Nutrition - NT","sortOrder": 610},{"screeningQuestionOptionsID": "60123712-455a-4336-83de-1c0396319e0e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Other Languages - ZL","sortOrder": 620},{"screeningQuestionOptionsID": "74b9e280-4731-4c74-9de3-a6734187267a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Other Technologies - ZV","sortOrder": 630},{"screeningQuestionOptionsID": "2552db74-a96c-41cf-92f0-05010fb15feb","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Outdoor Education - OE","sortOrder": 640},{"screeningQuestionOptionsID": "df15a261-2705-4e7c-a059-ef6c6fa2db6a","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Philosophy - PZ","sortOrder": 650},{"screeningQuestionOptionsID": "2aee06e0-6a81-41f3-94c3-119a3b9c9cb4","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Photography - PH","sortOrder": 660},{"screeningQuestionOptionsID": "f25c1c01-4a5b-4506-9847-084f3f8df4e0","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Physical Education - PE","sortOrder": 670},{"screeningQuestionOptionsID": "3d7978f2-0519-4305-b684-71e291aeaffa","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Physics - PC","sortOrder": 680},{"screeningQuestionOptionsID": "51421f76-1f68-49f1-9051-e7812370d498","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Politics - PG","sortOrder": 690},{"screeningQuestionOptionsID": "eed115e9-faa0-4abb-bd64-d64889db43ad","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Preschool - PS0P","sortOrder": 700},{"screeningQuestionOptionsID": "d33e2033-dd6a-4be3-af81-9fde7cbaac5f","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Primary - PR00 ","sortOrder": 710},{"screeningQuestionOptionsID": "d8809987-3995-4147-9b0b-9e800f4d05a1","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Psychology - PW","sortOrder": 720},{"screeningQuestionOptionsID": "a32fa277-16a1-4259-9fcb-37544c096ff5","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Science - SC","sortOrder": 730},{"screeningQuestionOptionsID": "06c46ec3-10d6-4202-92cd-5209cc6f7084","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Society & Culture - SS ","sortOrder": 740},{"screeningQuestionOptionsID": "8c575ce1-6401-41b4-a359-141a5aef7b64","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Society & Environment - SV","sortOrder": 750},{"screeningQuestionOptionsID": "76214199-35fe-4298-ba4b-30a03cfd76c3","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Spanish - SP","sortOrder": 760},{"screeningQuestionOptionsID": "9dbd35e3-81f8-4443-9b79-aef79f4f7d6b","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Special Education (School / Preschool Based) - SL","sortOrder": 770},{"screeningQuestionOptionsID": "95406c0c-3574-40f1-b9fa-b9f32c141255","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Special Education (Special Class) - SZ","sortOrder": 780},{"screeningQuestionOptionsID": "c35dd7f5-0245-4d9a-88fe-6fd8e7d20d20","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Specialist Mathematics - YZ","sortOrder": 790},{"screeningQuestionOptionsID": "58dbda33-cd7d-46a3-bd87-a06d511e494d","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Sustainable Futures - SF","sortOrder": 800},{"screeningQuestionOptionsID": "fca81e85-8a3d-4383-9f3e-cfb32b43c454","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Teacher Librarian - LI","sortOrder": 810},{"screeningQuestionOptionsID": "3109af1a-7cef-4842-adf7-50dfc760043e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Technology - TP","sortOrder": 820},{"screeningQuestionOptionsID": "f6d3c174-0985-41f8-b608-5d6abd3d76dc","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "The Arts - ZD","sortOrder": 830},{"screeningQuestionOptionsID": "4b33fc1f-e672-4c1c-b646-640444d11725","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Tourism - TU","sortOrder": 840},{"screeningQuestionOptionsID": "b50425bf-2e4c-4edb-a10d-fe4c3be6023e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Vietnamese - VT","sortOrder": 850},{"screeningQuestionOptionsID": "4f0cf940-ac89-4375-97a4-aa09f6ce502d","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Vocational Education and Training - VE","sortOrder": 860},{"screeningQuestionOptionsID": "04467571-56ff-487a-a837-f8d50b588c37","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Women\u2019s Studies - WS","sortOrder": 870},{"screeningQuestionOptionsID": "60399f19-23b1-4b37-b957-b761f3e33a94","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Work Education - WD","sortOrder": 880},{"screeningQuestionOptionsID": "fef472b0-ce08-4b10-b0e2-06dda13f802e","screeningQuestionID": "f99e47ea-ae40-4408-b6e5-d602ea21aab0","option": "Working with children / students with Hearing Impairments - TO","sortOrder": 890}]},{"screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","question": "Year Levels 2nd Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 216,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "eef014aa-428a-427b-91e9-ad867248ba70","screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","option": "R - 2","sortOrder": 1},{"screeningQuestionOptionsID": "0b5ddf22-3be2-4aa2-8746-2083b1300a90","screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","option": "R - 6","sortOrder": 2},{"screeningQuestionOptionsID": "e109b23a-c120-4263-91d4-827cb0492b76","screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","option": "7 - 9","sortOrder": 3},{"screeningQuestionOptionsID": "23e3808f-e317-4f39-9c50-3e56456b48e1","screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","option": "10 - 12","sortOrder": 4},{"screeningQuestionOptionsID": "64c3207d-a79e-4db4-9af3-e141295449ed","screeningQuestionID": "3fc4ec9f-51c8-4206-a4dc-7f1888eaca0d","option": "7 - 12","sortOrder": 5}]},{"screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","question": "Subject Preference - 3rd Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 317,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "a83455cb-e1b2-4e43-a92f-855a0a20d5a3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Aboriginal Education - AN","sortOrder": 10},{"screeningQuestionOptionsID": "f3f8908c-4fdb-4f58-820a-c6a63324fcc3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Aboriginal Studies - AB ","sortOrder": 20},{"screeningQuestionOptionsID": "65ce0ff4-5241-4fd2-804b-bdad2d3b32bc","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Accounting - AC","sortOrder": 30},{"screeningQuestionOptionsID": "408dd3fd-7ca6-49f1-a062-063bf4d11d4f","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Agriculture & Horticulture - AG","sortOrder": 40},{"screeningQuestionOptionsID": "2e38e8a6-2960-4128-a3b4-73c8fe98b47b","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Ancient Studies - AS","sortOrder": 50},{"screeningQuestionOptionsID": "49a6851b-7df3-480a-a828-d01b227a349a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Art - AT","sortOrder": 60},{"screeningQuestionOptionsID": "73c4edb1-d4cf-48c0-b4b6-720284931fef","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Australian Indigenous Languages - AV","sortOrder": 70},{"screeningQuestionOptionsID": "1582b1df-9d1e-4e5f-ad38-efebaa2729cf","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Biology - BL","sortOrder": 80},{"screeningQuestionOptionsID": "9c20c831-a6b4-457a-8520-466695c57872","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Birth to Preschool - BP0B","sortOrder": 90},{"screeningQuestionOptionsID": "dbd17baa-f96d-4eb9-b768-19380c0787a0","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Business Studies - BS","sortOrder": 100},{"screeningQuestionOptionsID": "f8eea791-ba5b-4f76-94ad-b778ad005d4d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Chemistry - CH","sortOrder": 110},{"screeningQuestionOptionsID": "05b0fbd5-9fbb-4271-ab04-e65922f30ede","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Child Studies  - CZ","sortOrder": 120},{"screeningQuestionOptionsID": "1985146c-9598-4aae-8ae7-ebd19773856b","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Chinese - CI","sortOrder": 130},{"screeningQuestionOptionsID": "0d4e160c-c979-4748-ab7e-a49537f6e1a5","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Classical Studies - CS","sortOrder": 140},{"screeningQuestionOptionsID": "528366b6-e1bf-45db-9e4a-6bb7cca44657","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Community Studies - CY","sortOrder": 150},{"screeningQuestionOptionsID": "26002701-5701-4f64-a4ed-597535e71467","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Computer/Aided Design/Manufacture - CX","sortOrder": 160},{"screeningQuestionOptionsID": "6154103e-baad-4396-b944-5e2714c03c7d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Construction Technology - CT","sortOrder": 170},{"screeningQuestionOptionsID": "6f65bef8-466c-4b2c-a017-d1b777d48f6f","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Counselling - CG","sortOrder": 180},{"screeningQuestionOptionsID": "9e26d81d-b399-4d6c-ad8d-38634ce7fb98","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Dance - DA","sortOrder": 190},{"screeningQuestionOptionsID": "625682f3-f482-455e-9043-fa87bfe0c8ef","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Design - DE","sortOrder": 200},{"screeningQuestionOptionsID": "4601a000-92e1-4853-ab20-764edce5dc6c","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Design and Technology Materials - DT","sortOrder": 210},{"screeningQuestionOptionsID": "978534ad-b5b2-45f2-a189-3a4b84cdd48d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Design and Technology Systems - ET","sortOrder": 220},{"screeningQuestionOptionsID": "c6f0ee59-75fe-4c48-b511-3148016715c1","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Drama - DR","sortOrder": 230},{"screeningQuestionOptionsID": "ea3469a3-bedb-45fd-8916-d04ffe726767","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Economics - EC","sortOrder": 240},{"screeningQuestionOptionsID": "ffe1838b-8d65-4eeb-8afe-4b4a22b79af3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Education of children / students who are Vision Impaired - VI","sortOrder": 250},{"screeningQuestionOptionsID": "59c4a111-96bc-4ada-895b-56fa74bc4537","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Education of children / students with Intellectual Disabilities - ID","sortOrder": 260},{"screeningQuestionOptionsID": "e5338b45-88f4-420e-86a8-be77cefcdc2a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Education of children / students with Multiple Disabilities - MY","sortOrder": 270},{"screeningQuestionOptionsID": "18a90575-50ed-43b6-a806-f89f25e9cd89","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Electronic Media - ME","sortOrder": 280},{"screeningQuestionOptionsID": "b7b3c9ba-0d55-44b2-b6a7-ccf9c35f911f","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "English - EG","sortOrder": 290},{"screeningQuestionOptionsID": "44d26501-5170-4288-9cd7-49f66040dd6d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "English as a Second Language - TL","sortOrder": 300},{"screeningQuestionOptionsID": "4ddd2daa-f53b-403d-b444-c6497710bc8d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "English as a Second Language - TX","sortOrder": 310},{"screeningQuestionOptionsID": "b4cfbc73-3e9d-4b74-be4f-92601b59b4ad","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Environmental Education - EY","sortOrder": 320},{"screeningQuestionOptionsID": "a8dd4d11-ac27-4401-bd9d-d058e454d74b","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Family Studies  - FZ","sortOrder": 330},{"screeningQuestionOptionsID": "6b4c0efc-3fd7-4721-aeb4-0dc0995ba3b7","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Food & Hospitality  - FH","sortOrder": 340},{"screeningQuestionOptionsID": "6870b8ba-3fdf-48e0-bbfc-d7fe14fced59","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "French - FR","sortOrder": 350},{"screeningQuestionOptionsID": "27e0e505-c8f9-44dd-8991-9a715c0ce15d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Geography - GG","sortOrder": 360},{"screeningQuestionOptionsID": "cdf698d9-6f58-4a3a-bdf5-da2376720b4b","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Geology - GL","sortOrder": 370},{"screeningQuestionOptionsID": "00279d01-d69f-48e1-be2a-ddbcfa1a1136","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "German - GM","sortOrder": 380},{"screeningQuestionOptionsID": "9cc3278f-d58a-48eb-939e-525bc4392327","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Health and Personal Development - HQ","sortOrder": 390},{"screeningQuestionOptionsID": "b62844b1-4b65-4467-8b9d-1d301ff381fd","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Health Education - HA","sortOrder": 400},{"screeningQuestionOptionsID": "75469e5d-b247-4d6e-b6b8-dda4d428a659","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "History - HI","sortOrder": 410},{"screeningQuestionOptionsID": "75cb710b-30bd-4623-8c3d-be47aa17713e","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "History, Australian - HU","sortOrder": 420},{"screeningQuestionOptionsID": "69209348-55e3-47e9-809a-2c6ed4d03418","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "History, Modern - HZ","sortOrder": 430},{"screeningQuestionOptionsID": "10614d56-fb2b-4fab-a3c2-b70568e3fa53","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Home Economics - HE","sortOrder": 440},{"screeningQuestionOptionsID": "19562ffa-f486-415a-954e-24111112eaf3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Indonesian - IN","sortOrder": 450},{"screeningQuestionOptionsID": "cb77c86f-fb86-4589-a61d-48c7008b0acf","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Information Processing & Publishing - IQ","sortOrder": 460},{"screeningQuestionOptionsID": "c8f788d1-647f-45c8-b223-39d8b984c0f0","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Information Technology - IF","sortOrder": 470},{"screeningQuestionOptionsID": "c77cc8c2-bcff-4b9a-9679-cbe185b30e76","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Instrumental Music - MI","sortOrder": 480},{"screeningQuestionOptionsID": "c3665936-785d-4085-9e35-01b133f92b2f","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Italian - IT","sortOrder": 490},{"screeningQuestionOptionsID": "01d6d153-7221-4c3c-8dab-237cc5bb05ab","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Japanese - JA","sortOrder": 500},{"screeningQuestionOptionsID": "a10dddf0-c775-402c-9611-b90dac9fb82d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Junior Primary - JP00 ","sortOrder": 510},{"screeningQuestionOptionsID": "5c886bb0-49ad-429c-b828-5c0f4d9e6a00","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Legal Studies - LG","sortOrder": 520},{"screeningQuestionOptionsID": "933b6212-93c0-48d6-abc1-9424d8d1afe3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Mathematical Applications - MX","sortOrder": 530},{"screeningQuestionOptionsID": "e191bfed-8f2d-4c33-9e3c-4e281a783baa","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Mathematical Studies / Methods - YX","sortOrder": 540},{"screeningQuestionOptionsID": "91609c1a-c87f-41b5-90e8-255773414f12","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Mathematics - MA","sortOrder": 550},{"screeningQuestionOptionsID": "2fcc67c3-cb39-476a-9a2b-b77cd18f6b87","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Media Studies - FV","sortOrder": 560},{"screeningQuestionOptionsID": "9528c6f3-3b10-4387-a4c1-e388b593b86a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Middle Schooling - MM09","sortOrder": 570},{"screeningQuestionOptionsID": "3b69d6d0-91d9-483a-8071-023450aa82f0","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Modern Greek - GK","sortOrder": 580},{"screeningQuestionOptionsID": "0b0026fa-cc93-4cbc-bcc2-db4da99161f1","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Music - MU","sortOrder": 590},{"screeningQuestionOptionsID": "4c8ba775-f106-49d8-a278-ec1b976b37d8","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "New Arrivals Program - TZ","sortOrder": 600},{"screeningQuestionOptionsID": "c0a0bf11-da10-4b8d-8cb5-9b833b3de93e","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Nutrition - NT","sortOrder": 610},{"screeningQuestionOptionsID": "5f35c168-be0b-4138-b70e-55bed4f33857","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Other Languages - ZL","sortOrder": 620},{"screeningQuestionOptionsID": "6655da6a-a138-470a-b5b4-4d0263030995","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Other Technologies - ZV","sortOrder": 630},{"screeningQuestionOptionsID": "070570cf-0c4f-4ec7-830d-0d2d39eb9b12","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Outdoor Education - OE","sortOrder": 640},{"screeningQuestionOptionsID": "a9dda2a0-c231-41a5-851f-e5bbd4ae788d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Philosophy - PZ","sortOrder": 650},{"screeningQuestionOptionsID": "36ff6d9c-7ce8-497b-982e-4d4ddff21f60","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Photography - PH","sortOrder": 660},{"screeningQuestionOptionsID": "f0ef3e59-2e8c-4836-bd65-58c7b1ceb45a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Physical Education - PE","sortOrder": 670},{"screeningQuestionOptionsID": "c336b0e6-6eef-4250-ad2f-4476f5f3a851","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Physics - PC","sortOrder": 680},{"screeningQuestionOptionsID": "2142c04c-a1bb-4e6f-a8c8-95f29abeece3","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Politics - PG","sortOrder": 690},{"screeningQuestionOptionsID": "f54c5625-a064-47cc-b537-5cc9c90eebea","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Preschool - PS0P","sortOrder": 700},{"screeningQuestionOptionsID": "232b635e-3faa-4b7b-a254-1c898cee8fca","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Primary - PR00 ","sortOrder": 710},{"screeningQuestionOptionsID": "0250120e-abf1-4751-8402-0180668ccfed","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Psychology - PW","sortOrder": 720},{"screeningQuestionOptionsID": "245609f0-4bac-4972-bfbe-c0077b62c68d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Science - SC","sortOrder": 730},{"screeningQuestionOptionsID": "77737534-2716-433a-a9a4-9b426dc26c76","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Society & Culture - SS ","sortOrder": 740},{"screeningQuestionOptionsID": "3506f4eb-8780-4092-8d84-db98ebec6efe","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Society & Environment - SV","sortOrder": 750},{"screeningQuestionOptionsID": "3006670f-5a3e-45ec-b5f4-c45a8d1c4a4d","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Spanish - SP","sortOrder": 760},{"screeningQuestionOptionsID": "62a7e686-b6f8-4822-b089-81a986c52805","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Special Education (School / Preschool Based) - SL","sortOrder": 770},{"screeningQuestionOptionsID": "31a1b09b-2831-452b-819a-c84647602e66","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Special Education (Special Class) - SZ","sortOrder": 780},{"screeningQuestionOptionsID": "d1e48001-3981-43bd-825c-179e736f317e","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Specialist Mathematics - YZ","sortOrder": 790},{"screeningQuestionOptionsID": "2498425b-2175-406b-8391-aeac87173d9a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Sustainable Futures - SF","sortOrder": 800},{"screeningQuestionOptionsID": "4701e6f8-c282-4c41-9905-b93503eca296","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Teacher Librarian - LI","sortOrder": 810},{"screeningQuestionOptionsID": "3588bb12-07ed-48e5-b8b0-2574ff0be041","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Technology - TP","sortOrder": 820},{"screeningQuestionOptionsID": "36a06ed4-51dd-488e-ac85-b839b64b18c7","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "The Arts - ZD","sortOrder": 830},{"screeningQuestionOptionsID": "f65cbf36-baa8-453a-b5e5-807d71fa144a","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Tourism - TU","sortOrder": 840},{"screeningQuestionOptionsID": "97a8c763-1816-4d81-8854-1d97db3aaec1","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Vietnamese - VT","sortOrder": 850},{"screeningQuestionOptionsID": "9055c84e-295f-497e-b1f2-d84284e01ecf","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Vocational Education and Training - VE","sortOrder": 860},{"screeningQuestionOptionsID": "eb86c602-c607-4c65-a73c-56425dd5d477","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Women\u2019s Studies - WS","sortOrder": 870},{"screeningQuestionOptionsID": "a6b406eb-27bf-4232-8f3e-25b091caa8e7","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Work Education - WD","sortOrder": 880},{"screeningQuestionOptionsID": "2f0e3716-9353-4ebd-afca-f567641d3544","screeningQuestionID": "780f88e3-3e3f-4ad0-b1fa-25fd975f625a","option": "Working with children / students with Hearing Impairments - TO","sortOrder": 890}]},{"screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","question": "Year Levels 3rd Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 318,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "f4dddbc1-8a8d-41b3-a856-ab0a318b161a","screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","option": "R - 2","sortOrder": 1},{"screeningQuestionOptionsID": "c46e6e86-1153-4517-8402-ce78b0f08994","screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","option": "R - 6","sortOrder": 2},{"screeningQuestionOptionsID": "f3bd1c3a-5a9a-4aa8-a981-7f838ca99895","screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","option": "7 - 9","sortOrder": 3},{"screeningQuestionOptionsID": "6904783b-893c-47f8-add7-4b0c32767614","screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","option": "10 - 12","sortOrder": 4},{"screeningQuestionOptionsID": "c88dbf46-0d21-4001-a59d-df59be32700c","screeningQuestionID": "1fcbfb21-af69-46e3-b639-1e935233673b","option": "7 - 12","sortOrder": 5}]},{"screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","question": "Subject Preference - 4th Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 419,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "77c60e74-badf-457f-89ca-30214ad1b6fd","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Aboriginal Education - AN","sortOrder": 10},{"screeningQuestionOptionsID": "1033c4aa-c02f-4ae5-91ef-a88713e788bb","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Aboriginal Studies - AB ","sortOrder": 20},{"screeningQuestionOptionsID": "017957a4-f1b0-42c3-8c76-015c1bb7ac34","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Accounting - AC","sortOrder": 30},{"screeningQuestionOptionsID": "57a572b9-3a9e-4673-b758-272982fcac4a","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Agriculture & Horticulture - AG","sortOrder": 40},{"screeningQuestionOptionsID": "b7055bbf-7404-45aa-97aa-d89e4febc31f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Ancient Studies - AS","sortOrder": 50},{"screeningQuestionOptionsID": "f41aa3a9-ce34-4bef-913a-3fa95378bda5","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Art - AT","sortOrder": 60},{"screeningQuestionOptionsID": "9c48617d-4003-45da-a70a-0bf8f599b262","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Australian Indigenous Languages - AV","sortOrder": 70},{"screeningQuestionOptionsID": "d2ef0e64-8457-4939-80aa-4ffaa536b4b5","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Biology - BL","sortOrder": 80},{"screeningQuestionOptionsID": "9dc957d1-e432-42b7-abdc-4ebc68655fd0","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Birth to Preschool - BP0B","sortOrder": 90},{"screeningQuestionOptionsID": "c934441f-fbe9-4248-9ef0-138b533e682f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Business Studies - BS","sortOrder": 100},{"screeningQuestionOptionsID": "8b20942d-5ab3-44ab-a573-718f4f61f8a5","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Chemistry - CH","sortOrder": 110},{"screeningQuestionOptionsID": "0cbbd208-f587-45f4-b36f-cdc79ba16c7d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Child Studies  - CZ","sortOrder": 120},{"screeningQuestionOptionsID": "d7105208-b502-47a2-97c8-f728047edcdb","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Chinese - CI","sortOrder": 130},{"screeningQuestionOptionsID": "b76d0bbe-fcd6-4f53-ab9d-4dca8477f578","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Classical Studies - CS","sortOrder": 140},{"screeningQuestionOptionsID": "ed4d5fd9-2195-46b6-be56-4ee815d6b919","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Community Studies - CY","sortOrder": 150},{"screeningQuestionOptionsID": "d21f652b-dc94-46a7-9fdc-823ebfc45c99","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Computer/Aided Design/Manufacture - CX","sortOrder": 160},{"screeningQuestionOptionsID": "66775871-716c-432d-835f-fb49bf3dbf45","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Construction Technology - CT","sortOrder": 170},{"screeningQuestionOptionsID": "a02dcccc-5b1e-40ac-9e66-882b404949af","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Counselling - CG","sortOrder": 180},{"screeningQuestionOptionsID": "15771bb6-9ee6-46f8-b753-f0b338b8f25d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Dance - DA","sortOrder": 190},{"screeningQuestionOptionsID": "05a53a63-678f-438a-8a07-7248b9f13e76","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Design - DE","sortOrder": 200},{"screeningQuestionOptionsID": "93c18164-fa6b-47f2-9fb0-1dfa37a12a0b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Design and Technology Materials - DT","sortOrder": 210},{"screeningQuestionOptionsID": "d9e22441-b097-4799-bd88-7fd8edd30467","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Design and Technology Systems - ET","sortOrder": 220},{"screeningQuestionOptionsID": "b89ed3b8-83ea-4c7c-8d51-66dd3c4470da","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Drama - DR","sortOrder": 230},{"screeningQuestionOptionsID": "f96cef97-0787-42b5-8580-e8740715aac9","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Economics - EC","sortOrder": 240},{"screeningQuestionOptionsID": "a8f0aa48-cbbd-4317-8ad0-2cd7b4ab2908","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Education of children / students who are Vision Impaired - VI","sortOrder": 250},{"screeningQuestionOptionsID": "27f0cd71-cbb2-4e39-ad0e-c1882298ce1f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Education of children / students with Intellectual Disabilities - ID","sortOrder": 260},{"screeningQuestionOptionsID": "21581c64-fc7f-4017-af48-9852289f6eae","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Education of children / students with Multiple Disabilities - MY","sortOrder": 270},{"screeningQuestionOptionsID": "99c07af9-a1b0-4969-8060-51e8cdd9f9ff","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Electronic Media - ME","sortOrder": 280},{"screeningQuestionOptionsID": "77c8a14e-9b94-4a5f-9d8d-862cdaecea4b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "English - EG","sortOrder": 290},{"screeningQuestionOptionsID": "7d449d7e-eb0c-4862-b3f4-9a3a5e9b8891","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "English as a Second Language - TL","sortOrder": 300},{"screeningQuestionOptionsID": "68469d68-61cc-41f7-abd5-e7363369c3d3","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "English as a Second Language - TX","sortOrder": 310},{"screeningQuestionOptionsID": "aed20324-6d27-4a5d-a412-89c543e8d16d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Environmental Education - EY","sortOrder": 320},{"screeningQuestionOptionsID": "b87dee0a-32ae-4aeb-b91f-a065142770ff","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Family Studies  - FZ","sortOrder": 330},{"screeningQuestionOptionsID": "00e7f545-3c2e-4017-86a6-8428d3d59ba4","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Food & Hospitality  - FH","sortOrder": 340},{"screeningQuestionOptionsID": "d5a64840-30c6-444e-bfe3-60e0c673100b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "French - FR","sortOrder": 350},{"screeningQuestionOptionsID": "1fe4f5a6-65c1-4ff7-8ead-eb547b16ae5f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Geography - GG","sortOrder": 360},{"screeningQuestionOptionsID": "2e61a769-0e5e-429a-af15-db364f43633f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Geology - GL","sortOrder": 370},{"screeningQuestionOptionsID": "d0e21e5e-e981-4baf-b70e-059926543190","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "German - GM","sortOrder": 380},{"screeningQuestionOptionsID": "53843a2b-ba2e-4446-9828-560fb789c24f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Health and Personal Development - HQ","sortOrder": 390},{"screeningQuestionOptionsID": "44639bed-0ee2-452f-a6b6-2ba8478850ee","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Health Education - HA","sortOrder": 400},{"screeningQuestionOptionsID": "c1d5382e-2249-48bc-922c-ef637abe8044","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "History - HI","sortOrder": 410},{"screeningQuestionOptionsID": "5f128e02-3cbc-4d52-9ccd-76335a9a7bd2","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "History, Australian - HU","sortOrder": 420},{"screeningQuestionOptionsID": "155dd914-e60e-4403-94b4-c74b24b7fd15","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "History, Modern - HZ","sortOrder": 430},{"screeningQuestionOptionsID": "15b829f2-41ff-4d28-b9c0-68ddea4d27c9","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Home Economics - HE","sortOrder": 440},{"screeningQuestionOptionsID": "02934ce9-aa74-4bf5-b7af-439b9b2ba46e","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Indonesian - IN","sortOrder": 450},{"screeningQuestionOptionsID": "d8656768-a7ac-4e39-afbd-ff9e94bee27e","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Information Processing & Publishing - IQ","sortOrder": 460},{"screeningQuestionOptionsID": "5b9f00ff-b81d-4ef2-99f0-5f9dc753831d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Information Technology - IF","sortOrder": 470},{"screeningQuestionOptionsID": "d161f6fe-bb9c-4e58-b023-e51bf35be4d9","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Instrumental Music - MI","sortOrder": 480},{"screeningQuestionOptionsID": "7bd6c09b-9246-4794-9859-5e55d5d274d1","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Italian - IT","sortOrder": 490},{"screeningQuestionOptionsID": "39146ba0-435c-4ada-91b1-69326d1b69e3","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Japanese - JA","sortOrder": 500},{"screeningQuestionOptionsID": "2114176b-5ad3-45be-b7ee-3ca6f2b4e44b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Junior Primary - JP00 ","sortOrder": 510},{"screeningQuestionOptionsID": "1728e2b2-842b-4347-8f2e-677e864e7f03","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Legal Studies - LG","sortOrder": 520},{"screeningQuestionOptionsID": "6fd7afe9-d5eb-4048-aeda-2d1384caf6cd","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Mathematical Applications - MX","sortOrder": 530},{"screeningQuestionOptionsID": "a749f419-e8fe-458d-bb41-14449b56ee6e","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Mathematical Studies / Methods - YX","sortOrder": 540},{"screeningQuestionOptionsID": "75109543-f586-46f7-8642-f97d487cd96c","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Mathematics - MA","sortOrder": 550},{"screeningQuestionOptionsID": "260112dc-9a04-4e74-9391-0b9beb030b5b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Media Studies - FV","sortOrder": 560},{"screeningQuestionOptionsID": "28f81e04-ca2b-428b-a32b-5998e8daec17","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Middle Schooling - MM09","sortOrder": 570},{"screeningQuestionOptionsID": "321d038e-a43b-4b22-b9ee-d61014afb819","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Modern Greek - GK","sortOrder": 580},{"screeningQuestionOptionsID": "1859844d-8e6d-4bb9-8fa0-22f154039647","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Music - MU","sortOrder": 590},{"screeningQuestionOptionsID": "1c1c9282-481a-47cd-9384-20d97bed0560","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "New Arrivals Program - TZ","sortOrder": 600},{"screeningQuestionOptionsID": "57ded899-79f3-40d6-aae3-78c57d256c62","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Nutrition - NT","sortOrder": 610},{"screeningQuestionOptionsID": "6e779997-11b7-43ff-83a8-e797e06c0544","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Other Languages - ZL","sortOrder": 620},{"screeningQuestionOptionsID": "4ef6632f-7d3b-4da2-abdd-efcd173c8bbc","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Other Technologies - ZV","sortOrder": 630},{"screeningQuestionOptionsID": "8b408f33-d5a3-4010-ab0d-0533ffdf7850","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Outdoor Education - OE","sortOrder": 640},{"screeningQuestionOptionsID": "b6b6fded-7a3c-45f7-86c0-5da661e5030c","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Philosophy - PZ","sortOrder": 650},{"screeningQuestionOptionsID": "cdf3af9b-612d-4b23-8486-352211f78b17","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Photography - PH","sortOrder": 660},{"screeningQuestionOptionsID": "cb8d5799-4733-44bd-bdae-fe1c0d9cfdd1","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Physical Education - PE","sortOrder": 670},{"screeningQuestionOptionsID": "be31e20f-9e4b-4c8a-b3a5-a4338e27219e","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Physics - PC","sortOrder": 680},{"screeningQuestionOptionsID": "97a57f5b-0c30-4ddd-92cd-220acf5be782","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Politics - PG","sortOrder": 690},{"screeningQuestionOptionsID": "7d008464-f79a-485f-87f1-847c4455e41d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Preschool - PS0P","sortOrder": 700},{"screeningQuestionOptionsID": "62371c6b-9d51-467f-846a-d19eaabb95be","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Primary - PR00 ","sortOrder": 710},{"screeningQuestionOptionsID": "79bab8d5-92de-4552-b93e-7c8d73131efb","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Psychology - PW","sortOrder": 720},{"screeningQuestionOptionsID": "d1cb0c1d-db58-44e9-b6e5-8fdba2c50bbc","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Science - SC","sortOrder": 730},{"screeningQuestionOptionsID": "f08b6ebd-f5c6-498d-801c-52f9b5052418","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Society & Culture - SS ","sortOrder": 740},{"screeningQuestionOptionsID": "fa247f01-4100-40c8-b3cc-c1d03c818edc","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Society & Environment - SV","sortOrder": 750},{"screeningQuestionOptionsID": "59a88215-d54c-4317-ab8c-d6d4d317afa6","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Spanish - SP","sortOrder": 760},{"screeningQuestionOptionsID": "00442117-168e-4f2c-98b5-729d661bf57a","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Special Education (School / Preschool Based) - SL","sortOrder": 770},{"screeningQuestionOptionsID": "7a9f979b-8048-4739-989c-44c0e2fdc19a","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Special Education (Special Class) - SZ","sortOrder": 780},{"screeningQuestionOptionsID": "4de09aec-6592-4464-a124-deaf084c625f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Specialist Mathematics - YZ","sortOrder": 790},{"screeningQuestionOptionsID": "58613131-a0e4-499b-a976-939e96300494","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Sustainable Futures - SF","sortOrder": 800},{"screeningQuestionOptionsID": "995af581-cb65-4985-a7a3-5446dbb4ad39","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Teacher Librarian - LI","sortOrder": 810},{"screeningQuestionOptionsID": "d3d329b2-33ed-48c3-a809-0032ab378e2f","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Technology - TP","sortOrder": 820},{"screeningQuestionOptionsID": "717344a5-c729-4292-a6d9-57a7f2444380","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "The Arts - ZD","sortOrder": 830},{"screeningQuestionOptionsID": "406f7a07-1a33-4dfd-a953-fe48d054694d","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Tourism - TU","sortOrder": 840},{"screeningQuestionOptionsID": "da69cd9d-e983-4e75-a8a6-eba6c00c475b","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Vietnamese - VT","sortOrder": 850},{"screeningQuestionOptionsID": "a68dc710-ae46-4ede-96f4-bf6786ccaa79","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Vocational Education and Training - VE","sortOrder": 860},{"screeningQuestionOptionsID": "c19c41ab-c5d8-4b14-b028-9688ac561bc6","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Women\u2019s Studies - WS","sortOrder": 870},{"screeningQuestionOptionsID": "bdd5f99a-09d6-47f2-951f-00b64269b0b0","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Work Education - WD","sortOrder": 880},{"screeningQuestionOptionsID": "67ae4f60-56ed-416f-bfc0-3bcec1076a71","screeningQuestionID": "455e23db-688f-4c09-af14-f019d8fc4ba9","option": "Working with children / students with Hearing Impairments - TO","sortOrder": 890}]},{"screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","question": "Year Levels 4th Selection","questionType": "Radio","helpText": "This is some helpful text","sortOrder": 420,"isMandatory": false,"options":[{"screeningQuestionOptionsID": "0e15ce26-cff5-4a50-b65a-1cf56e6528bf","screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","option": "R - 2","sortOrder": 1},{"screeningQuestionOptionsID": "bbfe796f-7ece-48b0-a08b-7d7bc135a325","screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","option": "R - 6","sortOrder": 2},{"screeningQuestionOptionsID": "9da9821c-0255-4c27-9019-e16d73d80636","screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","option": "7 - 9","sortOrder": 3},{"screeningQuestionOptionsID": "a171e5cf-fa9c-49d1-989c-9784e48f735b","screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","option": "10 - 12","sortOrder": 4},{"screeningQuestionOptionsID": "d841d2de-4ce5-4961-b31a-c647805dec90","screeningQuestionID": "0c7d5474-89ad-49ba-816d-310c54fbe820","option": "7 - 12","sortOrder": 5}]},{"screeningQuestionID": "8c59ec30-1c9d-46e4-8a1e-b16ba2973920","question": "Give an example of how you've worked collaboratively as a member of a team to accomplish a team / site goal?  What was your role in the outcome?","questionType": "Text","helpText": "Please add 350 words ","sortOrder": 624,"isMandatory": false,"options":[]}]}}`;
      this._fetchQuestions = () => {
        let container = $(element).find("[data-rel=screening-fields]");
        let jobID = data.inEditor && data.config.sampleJobID || getJobID();
        container.append($(`
            <div class="fcLoader fcLoadingSeek">
                <img src="https://irp.cdn-website.com/af796061/dms3rep/multi/Animation+-+1731553137869.gif" alt="">
            </div>
        `));
        return new Promise((resolve) => {
          let fetchTemplate = new Promise((resolve2, reject) => {
            if (data.inEditor && !jobID) {
              resolve2(JSON.parse(sender._mock));
              return;
            }
            dmAPI.loadCollectionsAPI().then((collections) => {
              collections.data("Jobs").where("jobID", "EQ", jobID).get().then((j) => {
                let screeningTemplateID = j.values.length > 0 && j.values[0].data.screeningTemplateID;
                if (screeningTemplateID) {
                  sender._screeningTemplateID = screeningTemplateID;
                  collections.data("Screening Questions").where("screeningTemplateID", "EQ", screeningTemplateID).get().then((q) => {
                    resolve2({
                      response: {
                        items: q.values.map((i) => i.data)
                      }
                    });
                  }, (err) => {
                    reject(err);
                  });
                } else {
                  resolve2({});
                }
              });
            });
          });
          fetchTemplate.then((res) => {
            if (!res || !res.response || !res.response.items || res.response.items.length == 0) {
              resolve();
              return;
            }
            res.response.items.forEach((q) => {
              pIndex = Math.floor((parseInt(q.sortOrder) || 0) / 100);
              sender._pages[pIndex] = sender._pages[pIndex] || [];
              sender._pages[pIndex].push(q);
            });
            for (let i = 0; i < sender._pages.length; i++) {
              if (!sender._pages[i]) {
                sender._pages.splice(i, 1);
              }
            }
            sender._ko = res.response.items.filter((q) => q.knockOutDate || q.knockOutList || q.knockOutText || q.knockOutNumber || q.knockOutBoolean !== null);
            resolve();
          });
        });
      };
      this._showQuestions = (page, scrollIntoView = true) => {
        if (page > this.pageNumber && !this._validate()) {
          alert("Please answer all questions");
          return;
        }
        this._recordAnswers().then(() => {
          var _a;
          if (page > this._maxPage) {
            this._maxPage = page;
          }
          let container = $(element).find("[data-rel=screening-fields]");
          let p = (this._pages[page] || []).filter((q) => !q.parentQuestionID || sender._answers[q.parentQuestionID]);
          let el = p.map((q) => {
            var _a2;
            return sender._questionElement({
              ...q,
              options: (_a2 = q.options) == null ? void 0 : _a2.filter((o) => {
                var _a3;
                return !q.parentQuestionID || ((_a3 = sender._answers[q.parentQuestionID].answerUUID) == null ? void 0 : _a3.indexOf(o.parentOptionID)) >= 0;
              })
            });
          });
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
          if ((_a = this._pages[page]) == null ? void 0 : _a.find((q) => q.parentQuestionID)) {
            container.find("input, select").on("change", function() {
              if (!$(this).is("[data-qtype=date]")) {
                sender._recordAnswers().then(() => {
                  sender._showQuestions(page, false);
                });
              }
            });
          }
          container.find("[data-rel=screening-apply]").click(function() {
            if (!sender._validate()) {
              alert("Please answer all questions");
              return;
            }
            shazamme.pub(Message.submit);
          });
          if (scrollIntoView) {
            container.get(0).scrollIntoView();
            window.scrollBy({ top: -200, behavior: "smooth" });
          }
          this._restoreAnswers(p.map((q) => q.screeningQuestionID));
          this.pageNumber = page;
        });
      };
      this._questionElement = (q) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
        if (((_a = q.parentQuestionID) == null ? void 0 : _a.length) > 0 && !(((_b = q.options) == null ? void 0 : _b.length) > 0)) {
          return "";
        }
        switch (q.questionType) {
          case "Text":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                            <input tabindex="30" class="sq-input-text-style" type="text" maxlength=${q.length || -1} autocomplete="nope" data-qtype="text" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""} />
                        </p>
                        </label>
                        ${((_c = q.helpText) == null ? void 0 : _c.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                    </div>
                `;
          case "Number":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                            <input tabindex="30" type="number" autocomplete="nope" data-qtype="number" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""} />
                        </label>
                        ${((_d = q.helpText) == null ? void 0 : _d.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                    </div>
                `;
          case "Date":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                         </p>
                            <input tabindex="30" type="date" autocomplete="nope" data-qtype="date" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""} />

                        </label>
                        ${((_e = q.helpText) == null ? void 0 : _e.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}; --shaz-showMoreShadowColor: ${data.config.showMoreShadowColor}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                    </div>
                `;
          case "Boolean":
            return `
                     <div class="input-field-container">
                        <label>
                            <p class="sq-boolean-question">
                                <input tabindex="30" type="checkbox" autocomplete="nope" data-qtype="bool" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""}  />
                                ${q.question}
                                ${q.isMandatory ? "*" : ""}
                            </p>
                        </label>
                        ${((_f = q.helpText) == null ? void 0 : _f.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                    </div>
                `;
          case "List": {
            let opts = (_g = q.options) == null ? void 0 : _g.map((o) => `<option value="${o.screeningQuestionOptionsID}">${o.label || o.option}</option>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-list-question">${q.question}</p>
                        <select data-qtype="list" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""}>${(opts == null ? void 0 : opts.join("")) || ""}</select>
                        ${((_h = q.helpText) == null ? void 0 : _h.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                     </div>
                `;
          }
          case "Multiselect Checkbox": {
            let opts = (_i = q.options) == null ? void 0 : _i.map((o) => `<label><input tabindex="30" type="checkbox" autocomplete="nope" data-qtype="check-list" data-qid="${q.screeningQuestionID}" data-value="${o.screeningQuestionOptionsID}" ${q.isMandatory ? "required" : ""} />${o.label || o.option}</label>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-checklist-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                        ${((_j = q.helpText) == null ? void 0 : _j.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                        ${(opts == null ? void 0 : opts.join("")) || ""}
                     </div>
                `;
          }
          case "Radio": {
            let opts = (_k = q.options) == null ? void 0 : _k.map((o) => `<label class="sq-question-option"><input tabindex="30" type="radio" data-qtype="radio" name="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" value="${o.screeningQuestionOptionsID}" ${q.isMandatory ? "required" : ""} />${o.label || o.option}</label>`);
            return `
                     <div class="input-field-container">
                        <p class="sq-radio-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                        ${((_l = q.helpText) == null ? void 0 : _l.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                        <div class="sq-opt-list">${(opts == null ? void 0 : opts.join("")) || ""}</div>
                     </div>
                `;
          }
          case "File":
            return `
                     <div class="input-field-container">
                        <label>
                        <p class="sq-list-question">
                            ${q.question}
                            ${q.isMandatory ? "*" : ""}
                        </p>
                            <input tabindex="30" type="file" autocomplete="nope" data-qtype="file" data-qid="${q.screeningQuestionID}" ${q.isMandatory ? "required" : ""} />
                        </label>
                        ${((_m = q.helpText) == null ? void 0 : _m.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                    </div>
                `;
          case "Header":
            return `
                    <div class='screening-question-heading'>
                        <h3>${q.question}</h3>
                        ${((_n = q.helpText) == null ? void 0 : _n.length) > 0 && `
                        <div class="sq-help-text" ${q.isHelpTextCollapse ? "collapsible" : ""}>
                            <p class="text-main">${q.helpText || ""}</p>
                            <div class="section-read-more" style="text-align: ${data.config.readMoreAlign}">
                                <a href="javascript: void(0);" class="button-show-more" data-rel="button-show-more">${data.config.showMoreHelpText}</a>
                            </div>
                        </div>
                        ` || ""}
                </div>
                `;
          default:
            return "";
        }
      };
      this._pagingElements = (page) => {
        let out = [];
        out.push(`<div data-rel="screening-pages" class="screening-pages-container" style="--shaz-text-align: ${data.config.PagingButtonAlignment}">`);
        if (page > 0) {
          out.push(`<a href='javascript:void(0);' class="button-page-nav back" data-rel='screening-page-index' data-page='${page - 1}'><span class="text">${data.config.pageBack || "Back"}</span></a>`);
        }
        if (page < this._pages.length - 1) {
          out.push(`<a href='javascript:void(0);' class="button-page-nav forward" data-rel='screening-page-index' data-page='${page + 1}'><span class="text">${data.config.pageNext || "Next"}</span></a>`);
        } else {
          out.push(`<a href='javascript:void(0);' class="button-page-nav forward" data-rel='screening-apply'><span class="text">${data.config.applyTextBtn || "Apply"}</span></a>`);
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
                <input type="checkbox" data-value="${o.screeningQuestionOptionsID}" />
                ${o.option}
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
      this._recordAnswers = () => Promise.all(
        $(element).find("[data-rel=screening-fields] input, [data-rel=screening-fields] select").map((_, el) => {
          var _a;
          let field = $(el);
          switch (field.attr("data-qtype")) {
            case "text": {
              if (field.val()) {
                sender._answers[field.attr("data-qid")] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerText: field.val(),
                  screeningTemplateID: sender._screeningTemplateID
                };
              } else {
                delete sender._answers[field.attr("data-qid")];
              }
              return Promise.resolve();
            }
            case "number": {
              if (field.val()) {
                sender._answers[field.attr("data-qid")] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerNum: parseInt(field.val()),
                  screeningTemplateID: sender._screeningTemplateID
                };
              } else {
                delete sender._answers[field.attr("data-qid")];
              }
              return Promise.resolve();
            }
            case "date": {
              if (field.val()) {
                sender._answers[field.attr("data-qid")] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerDate: field.val(),
                  screeningTemplateID: sender._screeningTemplateID
                };
              } else {
                delete sender._answers[field.attr("data-qid")];
              }
              return Promise.resolve();
            }
            case "bool": {
              sender._answers[field.attr("data-qid")] = {
                screeningQuestionID: field.attr("data-qid"),
                answerBoolean: field.is(":checked") ? 1 : 0,
                screeningTemplateID: sender._screeningTemplateID
              };
              return Promise.resolve();
            }
            case "list": {
              if (field.val()) {
                sender._answers[field.attr("data-qid")] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerUUID: [field.val()],
                  screeningTemplateID: sender._screeningTemplateID
                };
              } else {
                delete sender._answers[field.attr("data-qid")];
              }
              return Promise.resolve();
            }
            case "check-list": {
              let id = field.attr("data-qid");
              let a = ((_a = sender._answers[id]) == null ? void 0 : _a.answerUUID) || [];
              if (field.is(":checked")) {
                a.indexOf(field.attr("data-value")) < 0 && a.push(field.attr("data-value"));
              } else if (a.indexOf(field.attr("data-value")) >= 0) {
                a.splice(a.indexOf(field.attr("data-value")), 1);
              }
              if (a.length === 0) {
                delete sender._answers[field.attr("data-qid")];
              } else {
                sender._answers[id] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerUUID: a,
                  screeningTemplateID: sender._screeningTemplateID
                };
              }
              return Promise.resolve();
            }
            case "radio": {
              if (field.is(":checked")) {
                sender._answers[field.attr("data-qid")] = {
                  screeningQuestionID: field.attr("data-qid"),
                  answerUUID: [field.attr("value")],
                  screeningTemplateID: sender._screeningTemplateID
                };
              }
              return Promise.resolve();
            }
            case "file": {
              let file = field.get(0).files.length > 0 && field.get(0).files[0];
              if (file) {
                return sender._readFile(file).then((val) => {
                  sender._answers[field.attr("data-qid")] = {
                    screeningQuestionID: field.attr("data-qid"),
                    answerFile: val,
                    answerFileName: file.name,
                    screeningTemplateID: sender._screeningTemplateID
                  };
                  return Promise.resolve();
                });
              } else {
                delete sender._answers[field.attr("data-qid")];
                return Promise.resolve();
              }
            }
            default:
              return Promise.resolve();
          }
        })
      );
      this._restoreAnswers = (q) => {
        for (let qid in sender._answers) {
          let ans = sender._answers[qid];
          qid = qid.split(":")[0];
          if (q.indexOf(qid) < 0) {
            continue;
          }
          if ($(element).find(`[data-rel=screening-fields] input[data-qid=${qid}]:visible, [data-rel=screening-fields] select[data-qid=${qid}]:visible`).length === 0) {
            delete sender._answers[qid];
            continue;
          }
          if (ans.answerText || ans.answerNum || ans.answerDate) {
            $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}]`).val(ans.answerText || ans.answerNum || ans.answerDate);
          } else if (ans.answerBoolean && !ans.answerUUID) {
            $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}]`).attr("checked", true);
          } else if (ans.answerUUID) {
            if (typeof ans.answerUUID === "string") {
              ans.answerUUID = ans.answerUUID.split(",");
            }
            ans.answerUUID.forEach((v) => {
              $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}][data-value=${v.trim()}]`).attr("checked", true);
              $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}][value=${v.trim()}]`).attr("checked", true);
              $(element).find(`[data-rel=screening-fields] select[data-qid=${qid}]`).val(v.trim());
            });
          } else if (ans.answerFile) {
            $(element).find(`[data-rel=screening-fields] input[data-qid=${qid}]`).val(this._fileBlob(ans.answerFile));
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
              let val = field.val();
              isOk = isOk && val && val.trim().length > 0 && !isNaN(val);
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
            case "check-list": {
              isOk = isOk && $(element).find(`[data-rel=screening-fields] input[data-qtype=check-list][data-qid=${field.attr("data-qid")}]`).is(":checked");
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
      this._showEditor = () => {
        const option = (q) => {
          var _a, _b;
          if (q.knockOutDate) {
            return new Date(q.knockOutDate).toLocaleDateString();
          }
          if (q.knockOutList) {
            return (_b = (_a = q.options) == null ? void 0 : _a.find((i) => i.screeningQuestionOptionsID === q.knockOutList)) == null ? void 0 : _b.option;
          }
          if (q.knockOutText) {
            return q.knockOutText;
          }
          if (q.knockOutNumber) {
            return q.knockOutNumber;
          }
          if (q.knockOutBoolean !== null) {
            return q.knockOutBoolean ? "Yes" : "No";
          }
          return "";
        };
        const el = (q) => {
          var _a, _b;
          return `
            <article data-rel="knockout" data-id="${q.screeningQuestionID}">
                <div class="row">
                    <label>${q.question}</label>
                    <label>${option(q)}</label>
                </div>

                <div class="row">
                    <label>
                        Message
                        <input type="text" data-rel="alert" placeholder="Sorry, we can accept you at this time." value="${q.alert || ""}" />
                    </label>

                    <label>
                        Redirect (Leave blank for no redirect)
                        <input type="text" data-rel="redirect" placeholder="/reject" value="${q.redirect || ""}" />
                    </label>
                </div>

                <div class="row">
                    <label>
                        Enable
                        <input type="checkbox" data-rel="enable" ${((_a = q.alert) == null ? void 0 : _a.length) > 0 || ((_b = q.redirect) == null ? void 0 : _b.length) > 0 ? 'checked="checked"' : ""} />
                    </label>
                </div>
            </article>
        `;
        };
        if (sender._ko.length === 0) {
          return;
        }
        w.config().then((c) => {
          const dialog = $(element).find("[data-dialog=knockout]");
          dialog.find("[data-rel=dialog-content]").empty().append(sender._ko.map((q) => {
            var _a;
            return el({
              ...q,
              ...(_a = c == null ? void 0 : c.knockout) == null ? void 0 : _a.find((i) => i.screeningQuestionID === q.screeningQuestionID)
            });
          }));
          $(element).find("[data-rel=screening-fields] .button-editor").remove();
          $("<button />").text("Edit Knockout Handling").addClass("button-editor").on("click", function() {
            dialog.toggle();
          }).prependTo($(element).find("[data-rel=screening-fields]"));
          const toggleEnable = (e) => {
            let toggle = $(e.target);
            $("<input />").attr({
              "type": "checkbox",
              "data-rel": "enable",
              "checked": toggle.is(":checked") ? "checked" : null
            }).on("click", toggleEnable).appendTo(toggle.parent());
            toggle.remove();
          };
          dialog.find("[data-rel=enable]").on("click", toggleEnable);
          dialog.find("[data-rel=button-submit]").on("click", function() {
            let knockout = (c == null ? void 0 : c.knockout) || [];
            dialog.find("[data-rel=dialog-content] article [data-rel=enable]").each((_, i) => {
              let el2 = $(i).parents("article");
              let s = knockout.find((i2) => i2.screeningQuestionID === el2.attr("data-id"));
              if (s) {
                knockout.splice(knockout.indexOf(s), 1);
              }
              if ($(i).is(":checked")) {
                knockout.push({
                  screeningQuestionID: el2.attr("data-id"),
                  alert: el2.find("[data-rel=alert]").val(),
                  redirect: el2.find("[data-rel=redirect]").val()
                });
              }
            });
            w.config().then(
              (c2) => w.config({
                ...c2,
                knockout
              })
            ).then(() => {
              c.knockout = knockout;
            });
            dialog.toggle();
          });
          dialog.find("[data-rel=button-dismiss]").on("click", function() {
            dialog.toggle();
            dialog.find("[data-rel=dialog-content]").empty().append(sender._ko.map((q) => {
              var _a;
              return el({
                ...q,
                ...(_a = c == null ? void 0 : c.knockout) == null ? void 0 : _a.find((i) => i.screeningQuestionID === q.screeningQuestionID)
              });
            }));
            dialog.find("[data-rel=enable]").on("click", toggleEnable);
          });
        });
      };
      this._fetchAnswers = (id) => shazamme.site().then((s) => shazamme.submit({
        "action": "Get Screening Answers",
        "siteID": s.siteID,
        "jobApplicationID": id
      })).then((a) => {
        var _a, _b;
        let answers = [];
        (_b = (_a = a == null ? void 0 : a.response) == null ? void 0 : _a.items) == null ? void 0 : _b.forEach((i) => {
          answers[i.screeningQuestionID] = i;
        });
        return Promise.resolve(answers);
      });
      this._fetchQuestions().then(() => {
        this._showQuestions(0, false);
        if (data.inEditor) {
          this._showEditor();
        }
      });
      if (edit) {
        this._fetchAnswers(edit).then((a) => {
          let p = this._pages[0] || [];
          this._answers = a;
          this._restoreAnswers(p.map((q) => q.screeningQuestionID));
        });
      }
      return this;
    }
    const main = (w) => {
      const screening = screeningQuestions(w, new URL(window.location).searchParams.get("jobApplicationID"));
      const register = () => {
        let candidateInfo = collectRegisterFormValues();
        let isCompleteFields = isObjectComplete(candidateInfo);
        let acceptablePassword = isAcceptedPassword;
        if (!isCompleteFields) {
          buttonAction("hide");
          alert(data.config.warningFields || "Please complete all required fields");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          return Promise.reject();
        }
        if (shouldUploadResume && !candidateInfo.cVFileContent) {
          alert(data.config.warningResume || "Please upload your resume");
          return Promise.reject();
        }
        if (!acceptablePassword) {
          buttonAction("hide");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          alert(data.config.warningPassword || "Please follow the password pattern!");
          return Promise.reject();
        }
        return shazamme.firebase().validateEmail(candidateInfo.eMail).then(() => {
          candidateInfo.candidateID = shazamme.uuid();
          if (data.config.showPassword || !data.config.useAnonymous) {
            return shazamme.firebase().create(candidateInfo.eMail, candidateInfo.password).then((u) => Promise.resolve({
              ...candidateInfo,
              firebaseUserID: u.uid
            })).catch((err) => {
              buttonAction("hide");
              $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              if (err.code === "auth/invalid-email") {
                alert(data.config.warningEmail || "Please use a valid email address");
              } else if (err.code == "auth/email-already-in-use") {
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
                }
              }
              return Promise.reject(err);
            });
          } else {
            return Promise.resolve({
              ...candidateInfo,
              isValidated: false
            });
          }
        }).catch(() => {
          buttonAction("hide");
          $(element).find(".fcLoader").removeClass("fcLoadingSeek");
          alert(data.config.warningEmail || "Please supply a valid email.");
          return Promise.reject();
        });
      };
      const collectRegisterFormValues = () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let password = $("#passwordInput").val() || "";
        const el = $(element);
        if (!data.config.showPassword) {
          password = shazamme.uuid();
          isAcceptedPassword = true;
        }
        let r = {
          salutation: $(element).find("#salutation").val() || " ",
          firstName: ((_b = (_a = el.find("#firstName").val()) == null ? void 0 : _a.trim()) == null ? void 0 : _b.replace(/["«»‘’‚‛“”„‟‹›❛❜❝❞❮❯〝〞〟＂❟❠⹂🙶🙷🙸＇]/g, "")) || "",
          surname: ((_d = (_c = el.find("#lastName").val()) == null ? void 0 : _c.trim()) == null ? void 0 : _d.replace(/["«»‘’‚‛“”„‟‹›❛❜❝❞❮❯〝〞〟＂❟❠⹂🙶🙷🙸＇]/g, "")) || "",
          eMail: ((_e = el.find("#emailAddress").val()) == null ? void 0 : _e.trim()) || "",
          phone: data.config.showPhoneNumber && ((_f = el.find("#phoneNumber").val()) == null ? void 0 : _f.trim()) || (!data.config.requirePhone ? void 0 : ""),
          mobile: data.config.showMobileNumber && ((_g = el.find("#mobileNumber").val()) == null ? void 0 : _g.trim()) || (!data.config.requireMobile ? void 0 : ""),
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
        screening.answers().then((answers) => {
          let ko = screening.knockout(answers);
          if ((ko == null ? void 0 : ko.length) > 0) {
            w.config().then((c) => {
              ko.forEach((i) => {
                var _a, _b, _c;
                let handle = (_a = c == null ? void 0 : c.knockout) == null ? void 0 : _a.find((x) => x.screeningQuestionID === i.screeningQuestionID);
                if (((_b = handle == null ? void 0 : handle.alert) == null ? void 0 : _b.length) > 0) {
                  alert(handle.alert);
                }
                if (((_c = handle == null ? void 0 : handle.redirect) == null ? void 0 : _c.length) > 0) {
                  let link = data.inEditor ? `/site/${dudaAlias}${handle.redirect}?preview=true&insitepreview=true&dm_device=desktop` : handle.redirect;
                  window.location = link;
                }
              });
            });
            $(element).find(".fcLoader").removeClass("fcLoadingSeek");
            return;
          }
          let updateCandidate = (u) => {
            var _a, _b;
            let c = collectRegisterFormValues();
            if (!isObjectComplete(c)) {
              buttonAction("hide");
              alert(data.config.warningFields || "Please complete all required fields");
              $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              return Promise.reject();
            }
            if (shouldUploadResume && !c.cVFileContent) {
              buttonAction("hide");
              alert(data.config.warningResume || "Please upload your resume");
              $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              return Promise.reject();
            } else {
              c.cVFileContent = (_a = c.cVFileContent) != null ? _a : u.candidate.cVFileContent;
              c.cVFileName = (_b = c.cVFileName) != null ? _b : u.candidate.cVFileName;
            }
            c.phone = c.phone || u.candidate.phone || null;
            c.mobile = c.mobile || u.candidate.mobile || null;
            delete c.dudaSiteID;
            delete c.defaultPhoneCountry;
            delete c.validatePhone;
            return shazamme.submit({
              action: "Edit Candidate Info",
              ...u.candidate,
              ...c
            }).then((r) => r.status && shazamme.user(true) || Promise.reject());
          };
          let apply = (u) => {
            var _a, _b, _c, _d, _e;
            let referralSource = {
              referralSource: uri.searchParams.get("utm_source") || shazamme.session("referralSource"),
              referralMedium: uri.searchParams.get("utm_medium") || shazamme.session("referralMedium"),
              referralTerm: uri.searchParams.get("utm_term") || shazamme.session("referralTerm"),
              referralCampaign: uri.searchParams.get("utm_campaign") || shazamme.session("referralCampaign"),
              referralContent: uri.searchParams.get("utm_content") || shazamme.session("referralContent")
            };
            let a = {
              jobID: getJobID(),
              screeningAnswers: answers,
              ...referralSource
            };
            if (hasItemsTobeUploaded) {
              if ($("#uploadExisting").is(":checked") && ((_a = u == null ? void 0 : u.candidate) == null ? void 0 : _a.cVFileContent)) {
                a.resumeFile = (_b = u == null ? void 0 : u.candidate) == null ? void 0 : _b.cVFileContent;
                a.resumeFileName = (_c = u == null ? void 0 : u.candidate) == null ? void 0 : _c.cVFileName;
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
                candidate: u,
                application: a
              });
            }
            let jobViewed;
            try {
              jobViewed = JSON.parse(shazamme.store("currentJobViewed"));
            } catch (e) {
            }
            let dest;
            let linkoutUrl = (_d = jobViewed == null ? void 0 : jobViewed.data) == null ? void 0 : _d.applicationURL;
            if ((linkoutUrl == null ? void 0 : linkoutUrl.length) > 0) {
              dest = linkoutUrl;
            } else {
              dest = `/${thankYouPage}`;
              if (data.config.includeLastSearch && (jobViewed == null ? void 0 : jobViewed.data)) {
                let query = [];
                (data.config.redirectJobField || []).forEach((i) => {
                  let v = jobViewed.data[i.field];
                  if ((v == null ? void 0 : v.length) > 0) {
                    query.push(`${i.field}=${encodeURIComponent(v)}`);
                  }
                });
                if (query.length) {
                  dest = `/${thankYouPage}?${query.join("&")}`;
                }
              }
            }
            let applyPayload = {
              action: "Apply Job",
              dudaSiteID: data.siteId,
              application: a,
              candidate: u
            };
            if (a.resumeFile || a.coverLetterFile) {
              shazamme.submit(applyPayload).then(() => {
                buttonAction("stop");
                action.clearKeys();
                window.location.href = dest;
              }).catch(() => {
                buttonAction("hide");
                alert(data.config.warningApply || "Sorry, your application could not be submitted. Please try again.");
                $(element).find(".fcLoader").removeClass("fcLoadingSeek");
              });
              return;
            }
            let actionUrl = ((_e = shazamme._site) == null ? void 0 : _e.RegionalUrl) || "https://shazamme.io/Job-Listing/src/php/regional/actions";
            try {
              fetch(actionUrl, {
                method: "POST",
                keepalive: true,
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: JSON.stringify(applyPayload)
              });
            } catch (e) {
            }
            buttonAction("stop");
            action.clearKeys();
            window.location.href = dest;
          };
          let softCandidate = collectRegisterFormValues();
          if (!isObjectComplete(softCandidate)) {
            buttonAction("hide");
            alert(data.config.warningFields || "Please complete all required fields");
            $(element).find(".fcLoader").removeClass("fcLoadingSeek");
            return;
          }
          if (shouldUploadResume && !softCandidate.cVFileContent) {
            buttonAction("hide");
            alert(data.config.warningResume || "Please upload your resume");
            $(element).find(".fcLoader").removeClass("fcLoadingSeek");
            return;
          }
          softCandidate.candidateID = shazamme.uuid();
          apply(softCandidate);
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
        if (j == null ? void 0 : j.data) {
          shazamme.store("currentJobViewed", JSON.stringify(j));
          if (j.data.jobID === data.config.jobID) {
            w.pub("job-application-fixed-job", j.data.jobID, true);
          }
        } else if (!data.inEditor) {
          $(".shmApplicationMainContainer").hide();
          $(".section-no-job-message").show();
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
            mobile: "",
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
      shazamme.user().then((u) => {
        handleUser(u);
      });
      w.sub("site-auth", (u) => {
        handleUser(u);
      });
    };
    $("head").append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/fontawesome.min.css" crossorigin="anonymous" />')).append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/regular.min.css" crossorigin="anonymous" />'));
    window.__shazLoadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(
      function() {
        Promise.all([
          shazamme.ready(data.siteId, data.page),
          shazamme.script("https://sdk.shazamme.io/js/plugin/libphonenumber/1.10.54/plugin.min.js")
        ]).then(() => {
          main(shazamme.register("application-screening-form", data, true));
        });
      }
    );
  }
  return __toCommonJS(job_app_sq_linkout_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-app-sq-linkout"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
