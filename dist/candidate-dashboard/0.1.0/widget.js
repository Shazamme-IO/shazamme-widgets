/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 7085f77622e3. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/candidate-dashboard.index.js
  var candidate_dashboard_index_exports = {};
  __export(candidate_dashboard_index_exports, {
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

  // dist/.gen/candidate-dashboard.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    let candidate = new Candidate();
    let getData = new Getdata();
    let collectionName = "Jobs";
    let dynamicPageURL = "job-details";
    let resultsPage = "job-results";
    let jobAlertsPage = "job-alerts";
    let login = "login";
    let register = "register";
    let forgotPassword = "forgot-password";
    let newTab = data.config.newTab ? "_blank" : "_self";
    let dudaAlias = data.siteId;
    let isAcceptedPassword = false;
    let passwordInput = document.getElementById("newPass");
    let capitalChecker = document.getElementById("capital");
    let numberChecker = document.getElementById("number");
    let lengthChecker = document.getElementById("length");
    let specialCharChecker = document.getElementById("specialChar");
    const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;
    let all = {};
    let importData = {};
    function Candidate() {
      this.allSavedJobs = (obj, collections) => {
        let output = "";
        obj.map((i) => {
          let jobID = i.jobID;
          collections.map((j) => {
            if (jobID == j.jobID) {
              let jobName = j.jobName;
              let link2 = j.page_item_url;
              output += `
                    <div class="accDashboard-savedJob">
                        <div class="accDashboard-savedJobName" title="${jobName}">${jobName}</div>
                        <div class="accDashboard-actionContainer">
                            <i class="far fa-trash-alt" saved-id="${i.candidateSavedJobID}"></i>
                            <a href="${link2}" target="${newTab}" class="accDashboard-savedJobAction">View</a>
                        </div>
                    </div>`;
            }
          });
        });
        return output;
      };
      this.allAppliedJobs = (obj, collections) => {
        let output = "";
        obj.map((i) => {
          let jobID = i.jobID;
          collections.map((j) => {
            if (jobID == j.jobID) {
              let jobName = j.jobName;
              let date = new Date(i.appliedOn);
              let dateApplied = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
              let link2 = j.page_item_url;
              output += `
                    <div class="accDashboard-jobApp">
                        <a href="${link2}" target="${newTab}" class="accDashboard-jobAppName" title="${jobName}">${jobName}</a>
                        <div class="accDashboard-jobAppDate">${dateApplied}</div>
                    </div>`;
            }
          });
        });
        return output;
      };
      this.allFavouriteJobs = (obj, collections) => {
        let output = "";
        obj.map((i) => {
          let jData = JSON.stringify(i);
          let query = window.location.href.includes(dudaAlias) ? "&" : "?";
          let m = JSON.parse(i.meta || "{}");
          i.address = i.address || m.address;
          i.city = i.city || m.city;
          if (data.config.modernMode) {
            if (i.professionID) {
              query += `professionID=${i.professionID}&`;
            }
            if (i.roleID) {
              query += `roleID=${i.roleID}&`;
            }
            if (i.workTypeID) {
              query += `workTypeID=${i.workTypeID}&`;
            }
          } else {
            if (i.professionID) {
              let profession = all.jobs.find((pr) => i.professionID == pr.professionID);
              if (profession) {
                query += `category=${profession.category}&`;
              }
            }
            if (i.workType) {
              query += `workType=${i.workType}&`;
            }
          }
          if (i.address) {
            query += `location=${i.address}&`;
          }
          if (i.keyword) {
            query += `keyword=${i.keyword}&`;
          }
          if (i.city) {
            query += `city=${i.city}&`;
          }
          if (i.state) {
            query += `state=${i.state}&`;
          }
          if (i.postalCode) {
            query += `postalCode=${i.postalCode}&`;
          }
          if (i.radius) {
            query += `radius=${i.radius}&`;
          }
          if (i.radiusIn) {
            query += `radiusIn=${i.radiusIn}&`;
          }
          if (i.salaryFrom) {
            query += `salaryFrom=${i.salaryFrom}&`;
          }
          if (i.salaryTo) {
            query += `salaryTo=${i.salaryTo}`;
          }
          if (i.latitude || i.longitude) {
            let pos = [];
            i.latitude && pos.push(i.latitude);
            i.longitude && pos.push(i.longitude);
            query += `&geo=${pos.join(",")}`;
            query += `&geoRange=${i.radius}`;
            query += `&geoIn=${i.radiusIn}`;
          }
          let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${resultsPage}?preview=true&insitepreview=true&dm_device=desktop${query}` : `/${resultsPage}${query}`;
          output += `
            <div class="accDashboard-jobAlert" job-data=${btoa(jData)}>
                <a href="${link2}" class="accDashboard-jobAlertName" title="${i.searchName}">${i.searchName}</a>
                <div class="accDashboard-jobAlertEmailToggle">
                    <i class="far fa-edit" data-rel="button-edit" saved-id="${i.candidateSearchID}"></i>
                    <i class="far fa-trash-alt" saved-id="${i.candidateSearchID}"></i>
                    <input type="checkbox" ${i.isNeedAlert ? "checked" : ""}>
                </div>
            </div>`;
        });
        return output;
      };
    }
    function Getdata() {
      this.collection = (collection) => {
        return collection.map((i) => {
          let item = {};
          if (i.data.jobURL) {
            let uri = new URL(i.data.jobURL);
            let path = uri.pathname.split("/").pop();
            uri.pathname = `${dynamicPageURL}/${path}`;
            item.page_item_url = uri.toString();
          }
          Object.keys(i.data).forEach((j) => {
            item[removeSpecial(j)] = this.removeExtra(i.data[j]);
          });
          return item;
        });
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
      function removeSpecial(str) {
        let pattern = str.replace(/[^A-Z0-9]/ig, ``);
        return pattern;
      }
    }
    async function getDashboardData(u) {
      let getSavedJobs = {
        "action": "Get Saved Jobs",
        "candidateID": u.candidateID
      };
      let getJobApplication = {
        "action": "Get Job Applications",
        "candidateID": u.candidateID,
        "siteID": u.siteID
      };
      let getJobAlerts = {
        "action": "Get Job Alerts",
        "candidateID": u.candidateID,
        "siteID": u.siteID
      };
      try {
        let savedJobs = await shazamme.submit(getSavedJobs, false);
        let allSavedJobs = candidate.allSavedJobs(savedJobs.response.items, all.jobs);
        $(element).find(".accDashboard-savedJobContainer").html(`${allSavedJobs !== "" ? allSavedJobs : '<div class="accDashboard-savedJobName">No Saved Jobs Yet</div>'}`);
        let jobApplication = await shazamme.submit(getJobApplication);
        let allAppliedJobs = candidate.allAppliedJobs(jobApplication.response.items, all.jobs);
        $(element).find(".accDashboard-appliedJobContainer").html(allAppliedJobs !== "" ? allAppliedJobs : `<div class="accDashboard-jobAppName">No Job Applications Yet</div>`);
        let jobAlerts = await shazamme.submit(getJobAlerts);
        let allJobAlerts = candidate.allFavouriteJobs(jobAlerts.response.items, all.jobs);
        $(element).find(".accDashboard-favoriteJobContainer").html(`${allJobAlerts !== "" ? allJobAlerts : '<div class="accDashboard-jobAlertName">No Favorite Jobs Yet</div>'}`);
      } catch (err) {
        console.log(err);
      }
    }
    function previewFile(resume, fileType) {
      var file = resume;
      let fileName = file.name.replace(/[^a-z0-9-_.]/gi, "-").replace(/-{2,}/gi, "-");
      var reader = new FileReader();
      reader.addEventListener("load", function() {
        all[`${fileType}_binary`] = reader.result;
        all[`${fileType}_name`] = fileName;
        $(element).find(".editCand-btnForm").removeClass("editCand-loading");
        sendToVinyl();
      }, false);
      if (file) {
        reader.readAsBinaryString(file);
      }
    }
    function sendToVinyl(dataFrom) {
      shazamme.user().then((u) => {
        let storedData = u.candidate;
        let salutation = $(element).find("#salutation").val();
        let firstname = $(element).find("#candFnameText").val();
        let surname = $(element).find("#candLnameText").val();
        let address = $(element).find("#candAddress").val();
        let city = $(element).find("#candCity").val();
        let state = $(element).find("#candState").val();
        let country = $(element).find("#candCountry").val();
        let postal = $(element).find("#candPostal").val();
        let phone = $(element).find("#candPhone").val();
        let mobile = $(element).find("#candMobile").val();
        let skills = $(element).find("#candSkills").val();
        let password = $(element).find("#newPass").val() !== "" ? $(element).find("#newPass").val() : storedData.password;
        let save = {
          "action": "Edit Candidate Info",
          "candidateID": storedData.candidateID,
          "siteID": storedData.siteID,
          "username": storedData.username,
          "password": password,
          "isActive": storedData.isActive,
          "isValidated": storedData.isValidated,
          "accountStatusID": storedData.accountStatusID,
          "titleID": storedData.titleID,
          "registrationDate": storedData.registrationDate,
          "firstName": firstname,
          "surname": surname,
          "eMail": storedData.eMail,
          "isSubscribed": storedData.isSubscribed,
          "photo": all.photo_binary ? btoa(all.photo_binary) : storedData.photo,
          "photoFileName": all.photo_name ? all.photo_name : storedData.photoFileName,
          "cVFileContent": all.resume_binary ? btoa(all.resume_binary) : storedData.cVFileContent,
          "cVFileName": all.resume_name ? all.resume_name : storedData.cVFileName,
          "coverLetterContent": all.cover_binary ? btoa(all.cover_binary) : storedData.coverLetterContent,
          "coverLetterFileName": all.cover_name ? all.cover_name : storedData.coverLetterFileName,
          "phone": phone,
          "mobile": mobile,
          "salutation": salutation || " ",
          "address": address,
          "state": state,
          "country": country,
          "skillTags": skills,
          "postalCode": postal,
          "city": city,
          "summary": storedData.summary,
          "coverLetterExternalFilePath": storedData.coverLetterExternalFilePath,
          "resumeExternalFilePath": storedData.resumeExternalFilePath,
          "shazammeCandidateSource": storedData.shazammeCandidateSource,
          "videoURL": storedData.videoURL,
          "subscribeJobAlert": storedData.subscribeJobAlert,
          "firebaseUserID": firebase.auth().currentUser.uid,
          "bullhornCandidateID": storedData.bullhornCandidateID,
          "registrationDateTime": storedData.registrationDateTime,
          "cVSum": storedData.cVSum,
          "coverLetterSum": storedData.coverLetterSum,
          "ableApplicantID": storedData.ableApplicantID
        };
        if (all.photo_binary) {
          $(element).find(".editCand-candImg img").attr("src", "data:image/jpeg;base64," + btoa(all.photo_binary));
        }
        if (all.resume_name) {
          $(element).find(".editCand-candResumeFileName").text(all.resume_name);
        }
        if (all.cover_name) {
          $(element).find(".editCand-candCoverFileName").text(all.cover_name);
        }
        if (dataFrom !== "save") return;
        if (password !== storedData.password) {
          let user = firebase.auth().currentUser;
          let currEmail = storedData.eMail;
          let prvder = user ? user.providerData[0].providerId : "";
          if (prvder === "password") {
            const credentials = firebase.auth.EmailAuthProvider.credential(
              currEmail,
              $(element).find("#candCurrent").val()
            );
            user.reauthenticateWithCredential(credentials).then((response) => {
              user.updatePassword(password).then(function() {
                shazamme.submit(save).then((resp) => {
                  if (resp.status) {
                    window.location.reload(true);
                  }
                  $(element).find(".editCand-btnForm").removeClass("editCand-loading");
                });
              });
            }).catch(function(error) {
              let errorCode = error.code;
              let errorMessage = error.message;
              $(element).find(".fcLoader").hide();
              alert(errorMessage);
            });
          } else {
            shazamme.submit(save).then((resp) => {
              if (resp.status) {
                window.location.reload(true);
              }
              $(element).find(".editCand-btnForm").removeClass("editCand-loading");
            });
          }
        } else {
          shazamme.submit(save).then((resp) => {
            if (resp.status) {
              window.location.reload(true);
            }
            $(element).find(".editCand-btnForm").removeClass("editCand-loading");
          });
        }
      });
    }
    var removeByAttr = function(arr, attr, value) {
      var i = arr.length;
      while (i--) {
        if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
          arr.splice(i, 1);
        }
      }
      return arr;
    };
    const cssId = "fontAwesomeSource";
    if (!document.getElementById(cssId)) {
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
    const listenForEvents = () => {
      $("#newPass").focus(function() {
        $("#passwordMessage,.arrow-bottom").css("display", "flex");
      });
      $("#newPass").blur(function() {
        $("#passwordMessage, .arrow-bottom").css("display", "none");
      });
      passwordInput.onkeyup = function() {
        let statusCount = 0;
        if (!(passwordInput.value.length < 8)) {
          lengthChecker.classList.remove("invalid");
          lengthChecker.classList.add("valid");
          statusCount += 1;
        } else {
          lengthChecker.classList.remove("valid");
          lengthChecker.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/(?=.*[A-Z])/) != -1) {
          capital.classList.remove("invalid");
          capital.classList.add("valid");
          status = true;
          statusCount += 1;
        } else {
          capital.classList.remove("valid");
          capital.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/\d/) != -1) {
          number.classList.remove("invalid");
          number.classList.add("valid");
          statusCount += 1;
        } else {
          number.classList.remove("valid");
          number.classList.add("invalid");
          statusCount -= 1;
        }
        if (passwordInput.value.search(/(?=.*[!@#$%^&*])/) != -1) {
          specialChar.classList.remove("invalid");
          specialChar.classList.add("valid");
          statusCount += 1;
        } else {
          specialChar.classList.remove("valid");
          specialChar.classList.add("invalid");
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
      $(element).find(".accDashboard-savedJobList").on("click", ".accDashboard-actionContainer i", function() {
        let jobSavedID = $(this).attr("saved-id");
        let getSavedJobs = {
          "action": "Delete Saved Job",
          "candidateSavedJobID": jobSavedID
        };
        let savedJobs = shazamme.submit(getSavedJobs, false);
        savedJobs.then((resp) => {
          if (resp.status) {
            $(this).parents(".accDashboard-savedJob").remove();
            if ($(element).find(".accDashboard-savedJob").length == 0) {
              $(element).find(".accDashboard-savedJobContainer").html(`${'<div class="accDashboard-savedJobName">No Saved Jobs Yet</div>'}`);
            }
          }
        });
      });
      $(element).find(".accDashboard-jobAlertList").on("click", ".accDashboard-jobAlertEmailToggle i", function() {
        shazamme.site().then((s) => {
          let savedID = $(this).attr("saved-id");
          let getSavedJobs = {
            "action": "Delete Job Alert",
            "candidateSearchID": savedID,
            "siteID": s.siteID
          };
          let savedJobs = shazamme.submit(getSavedJobs);
          savedJobs.then((resp) => {
            if (resp.status) {
              $(this).parents(".accDashboard-jobAlert").remove();
              if ($(element).find(".accDashboard-jobAlert").length == 0) {
                $(element).find(".accDashboard-favoriteJobContainer").html(`${'<div class="accDashboard-jobAlertName">No Favorite Jobs Yet</div>'}`);
              }
            }
          });
        });
      });
      $(element).find(".accDashboard-jobAlertList").on("change", ".accDashboard-jobAlertEmailToggle input", function() {
        shazamme.site().then((s) => {
          let jobData = JSON.parse(atob($(this).parents(".accDashboard-jobAlert").attr("job-data")));
          let isAlert = this.checked;
          let editJobAlert = {
            "action": "Edit Job Alerts",
            "candidateID": jobData.candidateID,
            "candidateSearchID": jobData.candidateSearchID,
            "searchName": jobData.searchName,
            "professionID": jobData.professionID,
            "roleID": jobData.roleID,
            "keyword": jobData.keyword,
            "address": jobData.address,
            "salaryFrom": jobData.salaryFrom,
            "salaryTo": jobData.salaryTo,
            "salaryTypeID": jobData.salaryTypeID,
            "workTypeID": jobData.workTypeID,
            "workType": jobData.workType,
            "isNeedAlert": isAlert,
            "siteID": s.siteID
          };
          let editAlert = shazamme.submit(editJobAlert);
          editAlert.then((resp) => {
            console.log(resp);
          });
        });
      });
      $(element).find(".accDashboard-jobAlertList").on("click", "[data-rel=button-edit]", function() {
        let jobData = atob($(this).parents(".accDashboard-jobAlert").attr("job-data"));
        localStorage.createAlert = jobData;
        let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${jobAlertsPage}?preview=true&insitepreview=true&dm_device=desktop` : `/${jobAlertsPage}`;
        window.location.href = link2;
      });
      $(element).find(".accDashboard-editProfileText").click(function() {
        const display = data.device === "mobile" && "block" || "flex";
        shazamme.user().then((u) => {
          var _a;
          if (!(u == null ? void 0 : u.candidate)) {
            if (data.inEditor) {
              $(element).find(".accDashboard-editAccDetails").fadeIn().css("display", display);
              $(element).find(".accDashboard-genAccDetails").hide();
            } else {
              let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${login}?preview=true&insitepreview=true&dm_device=desktop` : `/${login}`;
              window.location.href = link2;
            }
            return;
          }
          const c = u.candidate;
          const el = $(element);
          let photo = c.photo && `data:image/jpeg;base64,${c.photo}` || "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1";
          el.find(".accDashboard-editAccDetails").fadeIn().css("display", display);
          el.find(".accDashboard-genAccDetails").hide();
          el.find("#salutation").val(((_a = c.salutation) == null ? void 0 : _a.length) > 0 && c.salutation || "Please Select");
          el.find("#candFnameText").val(c.firstName);
          el.find("#candLnameText").val(c.surname);
          el.find("#candAddress").val(c.address);
          el.find("#candCity").val(c.city);
          el.find("#candState").val(c.state);
          el.find("#candCountry").val(c.country);
          el.find("#candPostal").val(c.postalCode);
          el.find("#candPhone").val(c.phone);
          el.find("#candMobile").val(c.mobile);
          el.find("#candSkills").val(c.skillTags);
          el.find(".editCand-candImg img").attr({
            src: photo,
            alt: `${c.firstname || ""} ${c.surname || ""}`
          });
          el.find(".editCand-candResumeFileName").text(c.cVFileName || "Upload Resume");
          el.find(".editCand-candCoverFileName").text(c.coverLetterFileName || data.config.EditProfileUploadCoverLabel || "Upload Cover Letter");
          if (u.isOAuth) {
            el.find(".editCand-candCurrent").hide();
            el.find(".editCand-newPass").hide();
            el.find(".editCand-confirmPass").hide();
          }
        });
      });
      $(element).find(".editCand-cancelDetails").click(function() {
        window.location.reload(true);
      });
      $(element).find(".editCand-candImgUploadBtn").click(function() {
        $(this).next("#candImgUpload").trigger("click");
      });
      $(element).find("#candImgUpload").change(function() {
        previewFile(this.files[0], "photo");
        $(element).find(".editCand-btnForm").addClass("editCand-loading");
      });
      $(element).find(".editCand-saveDetails").click(function() {
        $(element).find(".fcLoader").css("display", "flex");
        let newPass = $("#newPass").val();
        let confirmPass = $("#confirmPass").val();
        let isPasswordMatch = newPass === confirmPass;
        if (!isPasswordMatch) {
          alert("Password does not match");
          $(element).find(".fcLoader").hide();
          return;
        }
        ;
        sendToVinyl("save");
      });
      $(element).find(".editCand-deleteAccount").click(function() {
        let user = firebase.auth().currentUser;
        let prvder = user ? user.providerData[0].providerId : "";
        if (prvder === "password") {
          $(element).find(".editCand-deleteModal.password").fadeIn().css("display", "flex");
        } else {
          $(element).find(".editCand-deleteModal.provider").fadeIn().css("display", "flex");
        }
      });
      $(element).find(".editCand-accountDeleteIcon").click(function() {
        $(element).find(".editCand-deleteModal").fadeOut();
      });
      $(element).find(".editCand-candResumeFile").click(function() {
        $(element).find("#candResumeUpload").trigger("click");
      });
      $(element).find("#candResumeUpload").on("change", function() {
        var _a;
        let size = (_a = this.files[0]) == null ? void 0 : _a.size;
        if (size > maxUploadSize) {
          alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
          $(this).val("");
          return;
        }
        previewFile(this.files[0], "resume");
        $(element).find(".editCand-btnForm").addClass("editCand-loading");
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
        previewFile(this.files[0], "resume");
      });
      $(element).find(".editCand-candCoverFile").click(function() {
        $(element).find("#candCoverUpload").trigger("click");
      });
      $(element).find("#candCoverUpload").on("change", function() {
        var _a;
        let size = (_a = this.files[0]) == null ? void 0 : _a.size;
        if (size > maxUploadSize) {
          alert(data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ""}mb`);
          $(this).val("");
          return;
        }
        previewFile(this.files[0], "cover");
        $(element).find(".editCand-btnForm").addClass("editCand-loading");
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
        previewFile(this.files[0], "cover");
        $(element).find(".editCand-btnForm").addClass("editCand-loading");
      });
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
    };
    let main = (w) => {
      const fb = shazamme.firebase();
      const manage = (u) => {
        var _a;
        if (!data.inEditor) {
          if (!u) {
            let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${login}?preview=true&insitepreview=true&dm_device=desktop` : `/${login}`;
            window.location.href = link2;
            return;
          }
          if (!((_a = u.candidate) == null ? void 0 : _a.isValidated)) {
            if (confirm("Please complete your registration")) {
              let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${register}?preview=true&insitepreview=true&dm_device=desktop` : `/${register}`;
              window.location.href = link2;
            } else {
              shazamme.endSession();
              let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${login}?preview=true&insitepreview=true&dm_device=desktop` : `/${login}`;
              window.location.href = link2;
            }
            return;
          }
        }
        const c = u == null ? void 0 : u.candidate;
        if (!c) {
          return;
        }
        const el = $(element);
        let address = [
          c.address || "",
          c.city || "",
          c.state || "",
          c.country || "",
          c.postalCode || ""
        ].join(", ").replace(/^(,\s?)+?\s/, "").replace(/(,\s?){2,}/g, ", ").replace(/(,\s?)+?$/, "");
        let photo = c.photo && `data:image/jpeg;base64,${c.photo}` || "https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1";
        el.find(".accDashboard-addressDetail").text(address);
        el.find(".accDashboard-accName").text(`${c.firstName || ""} ${c.surname || ""}`);
        el.find(".accDashboard-detailEmail").text(c.eMail || "");
        el.find(".accDashboard-detailPhone").text(c.phone || "N/A");
        el.find(".accDashboard-accImg").css("background-image", `url(${photo})`);
        if (c.cVFileContent) {
          el.find(".accDashboard-detailResume").text(c.cVFileName || "No Resume Uploaded").attr("href", c.cVFileContent && `data:;base64,${c.cVFileContent}` || "").attr("download", c.cVFileName || "");
        }
        shazamme.site().then((s) => shazamme.fetch({
          path: `/job-results/${s.siteID}`,
          isExternal: true,
          useCache: true
        })).then((r) => {
          all.jobs = getData.collection(r);
          getDashboardData(c);
        });
        w.sub("site-auth", (u2) => {
          if (!u2) {
            let link2 = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${login}?preview=true&insitepreview=true&dm_device=desktop` : `/${login}`;
            window.location.href = link2;
          }
        });
        listenForEvents();
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
          $(element).find(".fcLoader").css("display", "flex");
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
            $(element).find(".fcLoader").hide();
            alert((err == null ? void 0 : err.message) || "Your acccount could not be deleted at this time");
            w.sub("site-auth", (u2) => manage(u2));
          });
        });
      };
      $(element).on("click", ".editCand-confirmDelete", function() {
        submitDeletion($(this).parents(".editCand-deleteModal"));
      });
      $(element).find(".editCand-inputBox input").keypress(function(e) {
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
    window.__shazLoadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js").then(
      function() {
        shazamme.ready(data.siteId, data.page).then(() => {
          main(shazamme.register("candidate-dashboard", data));
        });
      }
    );
  }
  return __toCommonJS(candidate_dashboard_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["candidate-dashboard"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
