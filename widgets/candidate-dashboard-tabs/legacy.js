// Tabbed candidate dashboard ("Candidate Dash v2", Duda Widget Builder id
// acea9885beda47c598603d7875403965), ported as-is from
// duda-widget/tabbed-candidate-dashboard.js at live v232 plus the
// pending-registration poll. Runs inside the build's legacy wrapper:
// `element`, `data`, `$` and `shazamme` are provided; the SDK load at the
// bottom is rewritten by the build to the shared loader.
const DocumentsUrl = 'https://shazamme.io/candidate-document';

const Path = {
    home: data.config.homePage && '/' + data.config.homePage || '/',
    deletedCandidate: data.config.deletedCandidatePage && '/' + data.config.deletedCandidatePage || '/deleted-candidate',
    jobAlerts: data.config.jobAlertsPage && '/' + data.config.jobAlertsPage || '/job-alerts',
    login: data.config.loginPage && '/' + data.config.loginPage || '/login',
    register: data.config.registerPage && '/' + data.config.registerPage || '/register',
    verify: data.config.verifyPage && '/' + data.config.verifyPage || '/forgot-password',
    searchResults: data.config.searchResultsPage && '/' + data.config.searchResultsPage || '/job-results',
    jobDetails: data.config.jobDetailsPage && '/' + data.config.jobDetailsPage || '/job-details',
    screeningAnswers: data.config.screeningAnswersPage && '/' + data.config.screeningAnswersPage || '/screening-answers',
};

const Collection = {
    job: {
        name: data.config.JobCollection || 'Jobs',
        action: 'Get Jobs',
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugJobCollection,
    },

    profession: {
        name: data.config.JobCollection || 'Professions',
        action: 'Get Professions',
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugProfessionCollection,
    },

    question: {
        name: data.config.JobCollection || 'Screening Questions',
        action: 'Get Screening Questions',
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugQuestionCollection,
    },
}

const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;

function ShApi() {
    this.savedJobs = (candidateId) =>
        shazamme.submit({
            "action":"Get Saved Jobs",
            "candidateID": candidateId
        }, false);

    this.jobApplications = (candidateId) =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action":"Get Job Applications",
                "candidateID": candidateId,
                "siteID": s.siteID,
            })
        );

    this.jobAlerts = (candidateId) =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action": "Get Job Alerts",
                "candidateID": candidateId,
                "siteID": s.siteID,
            })
        );

   this.deleteSavedJob = (id) =>
        shazamme.site().then( s =>
           shazamme.submit({
                "action":"Delete Saved Job",
                "candidateSavedJobID": id,
                "siteID": s.siteID,
            }, false)
        );

   this.deleteJobAlert = (id) =>
        shazamme.site().then( s =>
           shazamme.submit({
                "action":"Delete Job Alert",
                "candidateSearchID": id,
                "siteID": s.siteID,
            })
        );

    this.updateAlert = (alert) =>
        shazamme.submit({
            "action": "Edit Job Alerts",
            ...alert,
        });

    this.getProfile = (email) =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action": "Get Candidate",
                "eMail": email,
                "siteID": s.siteID,
            })
        );

    this.updateProfile = (profile) =>
        shazamme.site().then( s =>
            shazamme.submit({
                action: "Edit Candidate Info",
                siteID: s.siteID,
                ...profile,
            })
      );

    this.getScreeningTemplate = (screeningTemplateID) =>
        screeningTemplateID?.length > 0
            && shazamme.fetch(Collection.question).then( q =>
                Promise.resolve((q || []).filter( i => i.data.screeningTemplateID === screeningTemplateID ))
            )
            || Promise.resolve([]);

    this.getScreeningAnswers = (jobApplicationID) =>
        shazamme.site().then( s =>
            shazamme.submit({
                action: "Get Screening Answers",
                jobApplicationID: jobApplicationID,
                siteID: s.siteID,
            })
        );

    this.requestExport = (c, answers) => {
        return new Promise( (resolve, reject) => {
            shazamme.submit({
                action: "Export Screening Answers",
                templateID: data.config.exportTemplateID,
                responses: answers,
                ...c,
            }, false).then( res => {
                if (res.status && res.response.document && res.response.document.id) {
                    let documentID = res.response.document.id;
                    let tries = 0;

                    let fetch = setInterval( () =>
                        shazamme.submit({
                            action: "Get Screening Answers Export",
                            documentID: documentID,
                        }, false).then( res => {
                            if (res.status && res.response.document && res.response.document.status === 'success') {
                                clearInterval(fetch);
                                resolve(res.response.document.download_url);
                            } else if (!res.status) {
                                clearInterval(fetch);
                                reject(res);
                            } else if (tries > 5) {
                                clearInterval(fetch);
                                resolve();
                            } else {
                                tries++;
                            }
                        })
                    , 3000);
                } else {
                    reject(res);
                }
            });
        });
    }

    this.getCandidateFiles = (candidateId) =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action": "Get Candidate Files",
                "candidateID": candidateId,
                "siteID": s.siteID,
            })
        );

    this.getCandidateFileTypes = () =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action": "Get Candidate File Types",
                "siteID": s.siteID,
                "language": data.locale,
            })
        );

    this.addCandidateFile = (candidateId, name, content, type) =>
        shazamme.site().then( s =>
            shazamme.submit({
                "action": "Add Candidate File",
                "candidateID": candidateId,
                "siteID": s.siteID,
                "candidateFileName": name,
                "candidateFileContent": content,
                "siteCandidateFileTypeID": type,
            })
        );

   this.deleteCandidateFile = (id) =>
        shazamme.site().then( s =>
           shazamme.submit({
                "action":"Delete Candidate File",
                "candidateFileID": id,
                "siteID": s.siteID,
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
    }

    this.buildHref = (path, query) => {
        // A query appended after a fragment lands inside it (…#form?jobID=1), losing the
        // parameter — split the fragment off first.
        const addQuery = (href, q) => {
            let hash = href.indexOf('#');
            let base = hash === -1 ? href : href.slice(0, hash);
            let frag = hash === -1 ? '' : href.slice(hash);

            return `${base}${base.includes('?') ? '&' : '?'}${q}${frag}`;
        };

        // Restored from the deployed bundle (PR #9): drive-by web edits deleted this
        // from source, so a rebuild would ship https://clientsite.comregister.
        // An http(s) href is already a destination — prefixing it would
        // produce https://clientsite.com/https://careers.example.com/register. A
        // protocol-relative "//x" is not passed through: from a page-path config it is
        // almost always a doubled slash, and honouring it would navigate off-site.
        if (/^https?:\/\//i.test(path || '')) {
            return query ? addQuery(path, query) : path;
        }

        path = path ? ('/' + path).replace(/^\/+/, '/') : path;

        // Same fragment/existing-query hazard on this branch: a configured path may
        // carry '#' or '?' of its own.
        return data.inEditor
            ? addQuery(`/site/${data.siteId}${path}`, `preview=true&insitepreview=true&dm_device=desktop${query ? '&' + query : ''}`)
            : (query ? addQuery(`https://${window.location.hostname}${path}`, query) : `https://${window.location.hostname}${path}`);
    }

    this.savedJobEl = (save, j) => {
        if (j && j.data.jobURL) {
            let uri = new URL(j.data.jobURL);
            let path = uri.pathname.split('/').pop();

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
    }

    this.applicationEl = (app, j) => {
        if (j && j.data.jobURL) {
            let uri = new URL(j.data.jobURL);
            let path = uri.pathname.split('/').pop();

            uri.pathname = `${Path.jobDetails}/${path}`;
            j.data.regionPath = uri.toString();
        }

        return `
            <div class="entry-application" data-rel="item-application" data-id="${app.jobApplicationID}" data-job-id="${app.jobID}">
                <a href="${j && j.data.regionPath}" target="${data.config.newTab ? "_blank" : "_self"}" class="link-title" title="${j && j.data.jobName}">${j && j.data.jobName}</a>
                <div class="label-date">${this.dateFormat.format(new Date(app.appliedOn))}</div>
                ${data.config.enableApplicationEdit && '<i class="button-edit far fa-edit" data-rel="button-edit"></i>' || ''}
                ${data.config.enableApplicationExport && '<a href="javascript:return void(0);" class="button-export fas fa-file-download" data-rel="button-export"></a>' || ''}
            </div>
        `;
    }

    this.alertEl = (alert, profession) => {
        let query = [];

        let push = (f, v) => {
            (alert[f] || v) && query.push(`${f}=${encodeURI((alert[f] || v))}`);
        }

        let m = JSON.parse(alert.meta || '{}');

        push('professionID');
        push('keyword');
        push('location', alert.address || m.address);
        push('roleID');
        push('salaryFrom');
        push('salaryTo');
        push('workTypeID');
        push('city', alert.city || m.city);
        push('state');
        push('postalCode');
        push('radius');
        push('radiusIn');

        if (alert.latitude || alert.longitude) {
            let pos = [];

            alert.latitude && pos.push(alert.latitude);
            alert.longitude && pos.push(alert.longitude);

            push('geo', pos.join(','));
            push('geoRange', alert.radius);
            push('geoAddress', alert.address);
            push('geoIn', alert.radiusIn);
        }

        return `
        <div class="entry-job-alert" data-rel="item-job-alert" data-id="${alert.candidateSearchID}">
            <div>
                <a href="${this.buildHref(Path.searchResults, query.join('&'))}" class="link-title" title="${alert.searchName}">${alert.searchName}</a>
                <i class="far fa-edit" data-rel="button-edit"></i>
            </div>
            <div class="section-actions">
                <input class="button-enable" type="checkbox" ${alert.isNeedAlert ? "checked" : ""} />
                <i class="far fa-trash-alt" data-rel="button-delete"></i>
            </div>
        </div>
        `;
    }

    this.candidateFileEl = (f) => {
        return `
            <div class="grid-entry entry-candidate-file" data-rel="item-candidate-file" data-id="${f.data.candidateFileID}">
                <a href="${f.data.fileUri}" target="_blank" class="link-title column-left">${f.data.candidateFileName}</a>
                <span class="text-type column">${f.data.type || ''}</span>
                <div class="section-actions column-right">
                    <i class="button-delete far fa-trash-alt" data-rel="button-delete"></i>
                </div>
            </div>
        `;
    }

    this.enablePasswordValidation = (on = true) => {
        let sender = this;

        if (!on) {
            this.el.find('#newPass').off();
            return;
        }

        this.el.find('#newPass')
            .on('focus', function(){
                $('#passwordMessage,.arrow-bottom').css("display","flex");
            })
            .on('blur', function(){
                if ($(this).is(':not([invalid])')) {
                    $('#passwordMessage, .arrow-bottom').css("display","none");
                }
            })
            .on('keyup', function() {
                if (sender.passwordKeyupTimeout) {
                    clearTimeout(sender.passwordKeyupTimeout);
                }

                sender.passwordKeyupTimeout = setTimeout( () => {
                    let errorCount = 0;
                    let val = $(this).val();

                    let passwordInput = sender.el.find('#newPass');
                    let capital = sender.el.find("#capital");
                    let number = sender.el.find("#number");
                    let length = sender.el.find("#length");
                    let specialChar = sender.el.find("#specialChar");

                    if (!(val.length < 8)) {
                        length
                            .removeClass("invalid")
                            .addClass("valid");
                    }else{
                        length
                            .removeClass("valid")
                            .addClass("invalid");
                        errorCount++;
                    }

                    //Uppercase
                    if(val.search(/(?=.*[A-Z])/) != -1){
                        capital
                            .removeClass("invalid")
                            .addClass("valid");
                        status = true;
                    }else{
                        capital
                            .removeClass("valid")
                            .addClass("invalid");
                        errorCount++;
                    }

                    //Number
                    if (val.search(/\d/) != -1) {
                        number
                            .removeClass("invalid")
                            .addClass("valid");
                    } else {
                        number
                            .removeClass("valid")
                            .addClass("invalid");
                        errorCount++;
                    }

                    //special chars
                    if (val.search(/(?=.*[!@#$%^&*])/) != -1) {
                        specialChar
                            .removeClass("invalid")
                            .addClass("valid");
                    }else{
                        specialChar
                            .removeClass("valid")
                            .addClass("invalid");
                        errorCount++;
                    }

                    if (errorCount === 0) {
                        sender.el.find('.passwordErrorTitle').text("Your password is acceptable!");
                        sender.el.find('#passwordMessage').css("background-color","#59db5d");
                        sender.el.find('.valid,.passwordErrorTitle').css("color","#fff");
                        sender.el.find('.arrow-bottom').css({
                            "border-top":"15px solid #59db5d"
                        });

                        $(this).removeAttr('invalid');
                    }else{
                        sender.el.find('.passwordErrorTitle').text("Password must contain the following");
                        sender.el.find('#passwordMessage').css('background-color',"#ffa1a1");
                        sender.el.find('#passwordMessage,.passwordErrorTitle, .invalid').css("color","red");
                        sender.el.find('.arrow-bottom').css({
                            "border-top":"15px solid #ffa1a1"
                        });

                        $(this).attr('invalid', '');
                    }
                }, 350);
            })

    }

    this.activateTab = (tab) => {
        this.el.find('[data-rel=dashboard-tab]').hide();
        this.el.find(`[data-rel=dashboard-tab data-tab=${tab}]`).show();
    }

    this.loadScript = (src) => {
        return new Promise( (res, rej) => {
            $.getScript(
                src,
                function() { res() },
                function() { rej() }
            );
        });
    }

    this.enablePasswordValidation();
}

const shApi = new ShApi();
const ux = new UX();

let photoUpload = undefined;
let cvUpload = undefined;
let coverUpload = undefined;

let showProfile = (c) => {
    let address = [
        c?.address || '',
        c?.city || '',
        c?.state || '',
        c?.country || '',
        c?.postalCode || '',
    ]
    .join(',')
    .replace(/^(,\s?)+?\s/, '')
    .replace(/(,\s?){2,}/g, ', ')
    .replace(/(,\s?)+?$/, '');

    let photo = c?.photo && `data:image/jpeg;base64,${c?.photo}`  || 'https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1';

    ux.el.find(".accDashboard-addressDetail").text(address);
    ux.el.find(".accDashboard-accName").text(`${c?.firstName || ""} ${c?.surname || ""}`);
    ux.el.find(".accDashboard-detailEmail").text(c?.eMail || "");
    ux.el.find(".accDashboard-detailPhone").text(c?.phone || "N/A");
    ux.el.find(".accDashboard-accImg").css('background-image',`url(${photo})`);

    if (c?.cVFileContent) {
        ux.el
            .find(".accDashboard-detailResume")
            .text(c?.cVFileName || data.config.EditProfileNoResumeStatusLabel || "No Resume Uploaded")
            .attr('href', `data:;base64,${c?.cVFileContent}`)
            .attr('download', c?.cVFileName);
    }

    ux.el.find("#salutation").val(c?.salutation == "" ? "Please Select" : c?.salutation);
    ux.el.find("#candFnameText").val(c?.firstName);
    ux.el.find("#candLnameText").val(c?.surname);
    ux.el.find("#candAddress").val(c?.address);
    ux.el.find("#candCity").val(c?.city);
    ux.el.find("#candState").val(c?.state);
    ux.el.find("#candCountry").val(c?.country);
    ux.el.find("#candPostal").val(c?.postalCode);
    ux.el.find("#candPhone").val(c?.phone);
    ux.el.find("#candMobile").val(c?.mobile);
    ux.el.find("#candSkills").val(c?.skillTags);
    ux.el.find(".editCand-candImg img").attr({
        src: photo,
        alt: `${c?.firstName} ${c?.surname}`
    });
    ux.el.find(".editCand-candResumeFileName").text(c?.cVFileName || "Upload Resume");
    ux.el.find(".editCand-candCoverFileName").text(c?.coverLetterFileName || data.config.EditProfileNoCoverStatusLabel || "Upload Cover Letter");
}

//button-action="Edit Candidate Info"
ux.el.find(".accDashboard-editProfileText").click(function(){
    let isMobile = data.device == "mobile" ? "block":"flex";

    ux.el.find(".accDashboard-editAccDetails").fadeIn().css("display",isMobile);
    ux.el.find(".accDashboard-genAccDetails").hide();
    if(data.inEditor) {
        return;
    }

    if(!firebase.auth().currentUser || firebase.auth().currentUser.providerData[0].providerId !== "password"){
        ux.el.find(".editCand-candCurrent").hide();
        ux.el.find(".editCand-newPass").hide();
        ux.el.find(".editCand-confirmPass").hide();
    }
});

ux.el.find(".editCand-cancelDetails").click(function(){
    window.location.reload(true);
});

ux.el.find(".editCand-candImgUploadBtn").click(function(){
    $(this).next("#candImgUpload").trigger("click");
});

ux.el.find('#candImgUpload').on('change', function(){
    readFile(this.files[0])
        .then( b => {
            photoUpload = btoa(b);
            ux.el.find(".editCand-candImg img").attr("src",'data:image/jpeg;base64,' + photoUpload);
        });
});

ux.el.find('.editCand-candResumeFile').click(function(){
    ux.el.find('#candResumeUpload').trigger("click");
});

ux.el.find('#candResumeUpload').on('change', function(){
    let size = this.files[0]?.size;

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(this).val('');

        return;
    }

    ux.el.find(".editCand-candResumeFileName").text(this.files[0].name);
    readFile(this.files[0])
        .then( b => {
            cvUpload = btoa(b);
        });
}).each(function() {
    let size = this.files[0]?.size;

    if (this.files.length == 0) {
        return;
    }

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(this).val('');

        return;
    }

    ux.el.find(".editCand-candResumeFileName").text(this.files[0].name);
    readFile(this.files[0])
        .then( b => {
            cvUpload = btoa(b);
        });
});

ux.el.find('#candCoverUpload').on('change', function(){
    let size = this.files[0]?.size;

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(this).val('');

        return;
    }

    ux.el.find(".editCand-candCoverFileName").text(this.files[0].name);

    readFile(this.files[0])
        .then( b => {
            coverUpload = btoa(b);
        });
}).each(function() {
    let size = this.files[0]?.size;

    if (this.files.length == 0) {
        return;
    }

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(this).val('');

        return;
    }

    ux.el.find(".editCand-candCoverFileName").text(this.files[0].name);

    readFile(this.files[0])
        .then( b => {
            coverUpload = btoa(b);
        });
});

ux.el.find('.editCand-saveDetails').click(function() {
    if(ux.el.find('#newPass').val() != ux.el.find('#confirmPass').val()){
        alert('Password does not match');
        return;
    };

    ux.showLoading();

    updateProfile();
});


// OPEN DELETE MODAL
ux.el.find('.editCand-deleteAccount').click(function(){
    let user = firebase.auth().currentUser;
    let prvder = user ? user.providerData[0].providerId : '';

    if(prvder === "password"){
        ux.el.find(".editCand-deleteModal.password").fadeIn().css("display","flex");
    } else {
        ux.el.find(".editCand-deleteModal.provider").fadeIn().css("display","flex");
    }
});

// CLOSE DELETE MODAL
ux.el.find('.editCand-accountDeleteIcon').click(function(){
    ux.el.find(".editCand-deleteModal").fadeOut();
});

// SHOW ADD FILE DIALOG
ux.el.find('[data-rel=button-new-file]').click(function(){
    ux.el.find("[data-rel=modal-new-file]").fadeIn().css('display', 'flex');
});

ux.el.find("[data-rel=modal-new-file] .file-button input[type=file]")
    .on('change', function() {
        let file = this.files[0];

        ux.el.find("[data-rel=modal-new-file] .text-file-name").text(file?.name || '');
    });

ux.el.find("[data-rel=modal-new-file]")
    .on('click', '[data-rel=button-save]', function() {
        let dialog = $(this).parents("[data-rel=modal-new-file]");

        let field = dialog.find('input[type=file]');
        let file = field.get(0).files[0];

        if (file) {
            if (file.size > maxUploadSize) {
                alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
                field.val('');

                return;
            }

            ux.showLoading();

            readFile(file).then( b => {
                let type = dialog.find('[data-rel=candidate-file-type]').val();

                shazamme.user().then( u => {
                    shApi.addCandidateFile(u?.candidate?.candidateID, file.name, btoa(b), type).then( (r) => {
                        let cFile = r.status && r.response.item;

                        ux.el
                            .find('[data-rel=section-candidate-files]')
                            .append(ux.candidateFileEl({
                                data: {
                                    candidateFileID: cFile.candidateFileID,
                                    fileUri: `${DocumentsUrl}/${type}/${cFile.candidateFileID}`,
                                    candidateFileName: cFile.candidateFileName,
                                    type: dialog.find('[data-rel=candidate-file-type] option:selected').text(),
                                }
                            }));

                        ux.el
                            .find('[data-rel=item-candidate-file]')
                                .off('click')
                                .on('click', '[data-rel=button-delete]', function() {
                                    let item = $(this).parents('[data-rel=item-candidate-file]');

                                    shApi
                                        .deleteCandidateFile(item.attr('data-id'))
                                        .then( r => {
                                           if(r.status) {
                                                item.remove();
                                            }
                                        });
                                });

                            ux.showLoading(false);

                            field.val('');
                            ux.el.find("[data-rel=modal-new-file] .text-file-name").text('');

                            dialog.fadeOut();
                    });
                });
            });
        } else {
            dialog.fadeOut();
        }
    })
    .on('click', '[data-rel=button-cancel]', function() {
        ux.el.find("[data-rel=modal-new-file]").fadeOut();
        field.val('');
        ux.el.find("[data-rel=modal-new-file] .text-file-name").text('');
    });

let readFile = (file) => new Promise( resolve => {
    let reader = new FileReader();

    reader.addEventListener("load", function () {
        resolve(reader.result);
    }, false);

    if (file) {
        reader.readAsBinaryString(file);
    }
});

let updateProfile = () => {
    shazamme.user().then( u => {
        const c = u?.candidate
        let password = ux.el.find("#newPass").val() !== "" ? ux.el.find("#newPass").val() : c?.password;

        let profile = {
            "candidateID": c?.candidateID,
            "username": c?.username,
            "isActive": c?.isActive,
            "isValidated": c?.isValidated,
            "accountStatusID": c?.accountStatusID,
            "titleID": c?.titleID,
            "registrationDate": c?.registrationDate,
            "eMail": c?.eMail,
            "isSubscribed": c?.isSubscribed,

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

            "salutation": ux.el.find("#salutation").val() || ' ',
            "summary": c?.summary,
            "coverLetterExternalFilePath": c?.coverLetterExternalFilePath,
            "resumeExternalFilePath": c?.resumeExternalFilePath,
            "coverLetterContent": c?.coverLetterContent,
            "coverLetterFileName": c?.coverLetterFileName,
            "videoURL": c?.videoURL,

            "firebaseUserID": u?.firebaseUserID,
            "shazammeCandidateSource": c?.shazammeCandidateSource,
            "subscribeJobAlert": c?.subscribeJobAlert,
            "bullhornCandidateID": c?.bullhornCandidateID,
            "registrationDateTime": c?.registrationDateTime,

            "cVSum": c?.cVSum,
            "coverLetterSum": c?.coverLetterSum,

            "ableApplicantID": c?.ableApplicantID,
        };

        if (photoUpload) {
            profile.photo = photoUpload;
            profile.photoFileName = ux.el.find('#candImgUpload').get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-');
        } else {
            profile.photo = c?.photo;
            profile.photoFileName = c?.photoFileName;
        }

        if (cvUpload) {
            profile.cVFileContent = cvUpload;
            profile.cVFileName = ux.el.find('#candResumeUpload').get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-');
        } else {
            profile.cVFileContent = c?.cVFileContent;
            profile.cVFileName = c?.cVFileName;
        }

        if (coverUpload) {
            profile.coverLetterContent = coverUpload;
            profile.coverLetterFileName = ux.el.find('#candCoverUpload').get(0).files[0].name.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-');
        } else {
            profile.coverLetterContent = c?.coverLetterContent;
            profile.coverLetterFileName = c?.coverLetterFileName;
        }

        let doSave = () => {
            ux.showLoading();

            shApi
                .updateProfile(profile)
                .then(
                    r => {
                        if(r.status) {
                            window.location.reload(true);
                        }

                        ux.showLoading(false);
                    },

                    () => {
                        ux.showLoading(false);
                    }
                );
        }

        if (password !== c?.password){
            let user = firebase.auth().currentUser;
            let provider = user && user.providerData[0].providerId;

            if(provider === "password") {
                const credentials = firebase.auth.EmailAuthProvider.credential(
                   c?.eMail,
                    ux.el.find('#candCurrent').val(),
                );

                user.reauthenticateWithCredential(credentials).then(response=>{
                    user.updatePassword(password).then(function() {
                        doSave();
                    });
                })
                .catch( err => {
                    ux.showLoading(false);
                    alert(err.message);
                });
            } else {
                doSave();
            }
        }else{
                doSave();
        }
    });
}

let exportAnswers = (answers) => new Promise( (resolve, reject) => {
    if (data.inEditor) {
        resolve();
        return;
    }

    shazamme.user().then( u => {
        let c = u?.candidate;

        if (c?.customText13 && c?.customText13.length > 0) {
            answers.push({
                sortOrder: 30,
                question: 'Video Link',
                answer: c?.customText13,
            });

            answers = answers.sort( (x,y) => x.sortOrder > y.sortOrder ? 1 : x.sortOrder < y.sortOrder ? -1 : 0 );
        }

        shApi.requestExport(c, answers).then( link => {
            if (link && link.length > 0) {
                resolve(link);
            } else {
                reject();
            }
        });
    })
});


let answerValue = (question, answer) => {
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
            let o = question.options?.find( x => x.screeningQuestionOptionsID === answer.answerUUID);

            return o?.option || o?.label || answer.answerUUID;
        }

        return answer.answerUUID;
    }

    if (answer.answerBoolean) {
        return 'Yes';
    }

    return '';
}

let enableExports = (jobApplicationID) => {
    jobApplicationID.forEach( id => {
        shApi.getScreeningAnswers(id).then ( answers => {
            if (!answers.response.items || answers.response.items.length == 0) {
                return;
            }

            let templateID = (answers.response.items.find( x => x.screeningTemplateID ) || {}).screeningTemplateID;

            shApi.getScreeningTemplate(templateID)
            .then( questions => {
                let items = answers.response.items.map( a => {
                    let q = questions.find( x => x.data.screeningQuestionID === a.screeningQuestionID);

                    return {
                        sortOrder: (q?.sortOrder) || 999,
                        question: q?.question,
                        answer: answerValue(q, a),
                    }
                });

                ux.el.find(`[data-rel=item-application][data-id=${id}] [data-rel=button-export]`)
                    .css({
                        visibility: "visible",
                    })
                    .click(function() {
                        let button = $(this);
                        let exp = [];

                        if (button.is('[ready]')) {
                            return true;
                        }

                        button
                            .addClass('fa-spinner')
                            .addClass('wait');

                        items.forEach( a => exp = exp.concat(answerWordBreak(a)) );
                        exportAnswers(exp)
                            .then( href => {
                                button
                                    .removeClass('fa-spinner')
                                    .removeClass('wait');

                                if (!href) return;

                                button
                                    .attr('ready', '1')
                                    .attr('href', href)
                                    .attr('target', '_blank');

                                    window.open(href, '_blank');
                            }, () => {
                                alert("We are sorry. We ran into an issue exporting this document. Please try again.");
                            })
                    });

                ux.el.find(`[data-rel=item-application][data-id=${id}] [data-rel=button-edit]`)
                    .css({
                        visibility: "visible",
                    })
                    .click(function() {
                        let jobID = $(this)
                            .parents('[data-rel=item-application]')
                            .attr('data-job-id');

                        window.open(ux.buildHref(Path.screeningAnswers, `jobID=${jobID}&jobApplicationID=${jobApplicationID}`), '_blank');
                    });
            });
        });
    })
}

answerWordBreak = (v, maxLength = 1500) => {
    if (typeof(v.answer) !== 'string') {
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
                question: question,
                answer: chunk.join(' '),
                sortOrder: v.sortOrder,
                pageBreak: true,
            });

            chunk = [];
            read = word.length;
            question = v.question + ' (Cont)';
        }

        chunk.push(word);
    }

    broken.push({
        question: question,
        answer: chunk.join(' '),
        sortOrder: v.sortOrder,
        pageBreak: true,
    });

    return broken;
}

ux.el.find('[data-rel=tab-bar]').on('click', '[data-rel=button-tab]', function() {
    let tab = $(this);
    ux.el
        .find('[data-rel=tab-bar] [data-rel=button-tab]')
        .removeClass('active');

    tab.addClass('active');

    ux.el.find('[data-rel=dashboard-tab]').hide();
    ux.el.find(`[data-rel=dashboard-tab][data-tab=${tab.attr('data-tab')}]`).show();
});

ux.el
    .find('[data-rel=overview-heading]')
    .on('click', function() {
        let tab = $(this).attr('data-tab');

        ux.el
            .find(`[data-rel=tab-bar] [data-rel=button-tab][data-tab=${tab}]`)
            .trigger('click');
    });

ux.el
    .find('[data-rel=dashboard-tab] [data-rel=button-back]')
    .on('click', function() {
        ux.el
            .find('[data-rel=tab-bar] [data-rel=button-tab]')
            .first()
            .trigger('click');
    });

ux.el.find('.button-create-alert').on('click', function() {
    shazamme.store('createAlert', null);
    window.location = ux.buildHref(Path.jobAlerts);
});

if (!data.inEditor) {
    firebase.auth().onAuthStateChanged(user => {
        if((user && user.providerData[0].providerId) !== "password") {
            ux.el
                .find('[data-rel=tab-bar] [data-tab=tab-password], [data-rel=overview-heading][data-tab=tab-password]')
                .hide();
        }
    })
}

const cssId = 'fontAwesomeSource';
if (!document.getElementById(cssId))
{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://use.fontawesome.com/releases/v5.5.0/css/all.css';
    link.integrity = 'sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU';
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
}

if (!data.inEditor) {
    ux.el
        .find('[data-rel=tab-bar] [data-rel=button-tab]')
        .first()
        .trigger('click');
}

// Toggle for to see password
$('#currentPassEye').click(function(){
    if($(this).hasClass('fa-eye-slash')){
      $(this).removeClass('fa-eye-slash');
      $(this).addClass('fa-eye');
      $('#candCurrent').attr('type','text');
    }else{
      $(this).removeClass('fa-eye');
      $(this).addClass('fa-eye-slash');
      $('#candCurrent').attr('type','password');
    }
});

$('#newPassEye').click(function(){
    if($(this).hasClass('fa-eye-slash')){
      $(this).removeClass('fa-eye-slash');
      $(this).addClass('fa-eye');
      $('#newPass').attr('type','text');
    }else{
      $(this).removeClass('fa-eye');
      $(this).addClass('fa-eye-slash');
      $('#newPass').attr('type','password');
    }
});

let main = (w) => {
    const fb = shazamme.firebase();

    const manage = (u) => {
        if (!data.inEditor) {
            if (!u) {
                window.location = ux.buildHref(Path.login);
                return;
            }

            if (!u.candidate?.isValidated) {
                if (confirm('Please complete your registrion')) {
                    window.location = ux.buildHref(Path.register);
                } else {
                    shazamme.endSession();
                    window.location = ux.buildHref(Path.login);
                }

                return;
            }
        }

        const c = u?.candidate;

        Promise.all([
            shApi.savedJobs(c?.candidateID),
            shApi.jobApplications(c?.candidateID),
            shApi.jobAlerts(c?.candidateID),
        ]).then( p => {
            const saved = p[0]?.response?.items || [];
            const apps = p[1]?.response?.items || [];
            const alerts = p[2]?.response?.items || [];

            let jobId = [
                ...saved.map( i => i.jobID ),
                ...apps.map( i => i.jobID ),
            ];

            let professionId = alerts
                .filter( i => i.professionID)
                .map( i => i.professionId );

            shazamme.site().then( s =>
                shazamme.fetch({
                    path: `/job-results/${s.siteID}`,
                    isExternal: true,
                })
            ).then( jobs => {
                let savedList = saved.map( i => ux.savedJobEl(i, jobs.find( j => j.data.jobID === i.jobID )) );
                let appList = apps.map( i => ux.applicationEl(i, jobs.find( j => j.data.jobID === i.jobID )) );

                ux.el
                    .find('[data-rel=section-saved-jobs]')
                    .empty()
                    .append(savedList);

                ux.el
                    .find('[data-rel=section-applications]')
                    .empty()
                    .append(appList);

                ux.el
                    .find('[data-rel=item-saved-job]').on('click', '[data-rel=button-delete]', function() {
                        let item = $(this).parents('[data-rel=item-saved-job]');

                        shApi
                            .deleteSavedJob(item.attr('data-id'))
                            .then( r => {
                               if(r.status) {
                                    item.remove();
                                }
                            });
                    });

                apps.forEach( a => {
                    if (jobs.find( j => j.data.jobID = a.jobID && j.data.screeningTemplateID && j.data.screeningTemplateID.length > 0 )) {
                        ux.el.find(`[data-rel=item-application][data-id=${a.jobApplicationID}] [data-rel=button-export], [data-rel=item-application][data-id=${a.jobApplicationID}] [data-rel=button-edit]`)
                            .css({
                                visibility: "visible",
                            });
                    }
                })

                enableExports(apps.map( i => i.jobApplicationID ));
            });

            shazamme.fetch(Collection.profession)
                .then( p => Promise.resolve((p || []).filter( i => professionId.indexOf(i.data.professionID) >= 0 )) )
                .then( professions => {
                    let alertList = alerts.map( i => ux.alertEl({profession: professions.find( p => p.data.professionID === i.professionID ), ...i}) );

                    ux.el
                        .find('[data-rel=section-alerts]')
                        .empty()
                        .append(alertList);

                    ux.el
                        .find('[data-rel=item-job-alert]').on('click', '[data-rel=button-delete]', function() {
                            let item = $(this).parents('[data-rel=item-job-alert]');
                            let alert = alerts.find( i => i.candidateSearchID = item.attr('data-id') );

                            shApi
                                .deleteJobAlert(item.attr('data-id'))
                                .then( r => {
                                   if(r.status) {
                                        item.remove();
                                    }
                                });
                        });

                    ux.el
                        .find('[data-rel=item-job-alert]').on('click', '[data-rel=button-edit]', function() {
                            let item = $(this).parents('[data-rel=item-job-alert]');
                            let alert = alerts.find( i => i.candidateSearchID == item.attr('data-id') );

                            shazamme.store('createAlert', JSON.stringify(alert));
                            window.location = ux.buildHref(Path.jobAlerts);
                        });

                    ux.el
                        .find('[data-rel=item-job-alert]').on('change', 'input[type=checkbox]', function() {
                            let item = $(this).parents('[data-rel=item-job-alert]');
                            let alert = alerts.find( i => i.candidateSearchID = item.attr('data-id') );

                            alert.isNeedAlert = $(this).is(':checked');

                            shApi
                                .updateAlert(alert)
                                .then();
                        });
                });
        });

        shApi.getCandidateFiles(c?.candidateID).then( f => {
            shApi.getCandidateFileTypes().then( t => {
                let fileList = f?.response?.items?.map( i => {
                    i.data.fileUri = `${DocumentsUrl}/${i.data.siteCandidateFileTypeID}/${i.data.candidateFileID}`;
                    i.data.type = t.response.items.find( x => x.siteCandidateFileTypeID === i.data.siteCandidateFileTypeID )?.candidateFileType;

                    return ux.candidateFileEl(i);
                });

                ux.el
                    .find('[data-rel=section-candidate-files]')
                    .empty()
                    .append(fileList);

                ux.el
                    .find('[data-rel=item-candidate-file]').on('click', '[data-rel=button-delete]', function() {
                        let item = $(this).parents('[data-rel=item-candidate-file]');

                        shApi
                            .deleteCandidateFile(item.attr('data-id'))
                            .then( r => {
                               if(r.status) {
                                    item.remove();
                                }
                            });
                    });

                ux.el.find('[data-rel=modal-new-file] [data-rel=candidate-file-type]')
                    .empty()
                    .append(t?.response?.items?.map( i => `<option value="${i.siteCandidateFileTypeID}">${i.candidateFileType}</option>`));
            });
        });

        showProfile(c);

        w.sub('site-auth', u => {
            if (!u) {
                window.location = ux.buildHref(Path.login);
            }
        });

    }

    const submitDeletion = (m) => {
        let secret = undefined;

        if (m.hasClass("password")) {
            secret = m.find(".editCand-inputBox input").val().trim();

            if (secret.length === 0) {
                alert("Please enter your password.");
                return;
            }
        } else if(m.find(".editCand-inputBox input").val() !== "DELETE") {
            alert("Please type 'DELETE' on the textbox.");
            return;
        }

        shazamme.user().then( u => {
            const c = u?.candidate;

            if (!c) {
                return;
            }

            w.unsub('site-auth');

            ux.showLoading();
            $(element).find(".editCand-inputBox input").val("");

            fb.delete(secret).then( () => shazamme.submit({
                "action": "Delete Candidate",
                "candidateID": c.candidateID,
                "siteID": c.siteID,
                "uid": c.firebaseUserID,
            })).then( r => {
                if (JSON.parse(r.status)) {
                    shazamme.endSession();

                    $.get('/deleted-candidate', function(res) {
                        window.location.replace('/deleted-candidate');
                    }).fail(function() {
                        window.location.replace('/home');
                    });
                }
            }).catch( err => {
                ux.showLoading(false);
                alert(err?.message || 'Your acccount could not be deleted at this time');
                w.sub('site-auth', u => manage(u) );
            });
        });
    }

    ux.el.on('click','.editCand-confirmDelete',function(){
        submitDeletion($(this).parents(".editCand-deleteModal"));
    });

    ux.el.find(".editCand-inputBox input").keypress(function(e){
      if((e.which || e.keyCode) == 13){
        submitDeletion($(this).parents(".editCand-deleteModal"));
      }
    });

    // Boot. Normal visits go straight through. A just-registered visitor carries
    // `_pendingAuth` (set by the register widget, which hands off instantly):
    // the candidate is still being created by the async backend, so poll for
    // it here before deciding. Without this the one-shot lookup below returned
    // no candidate and bounced the new registrant to /login.
    // The key is consumed on first read so a later visitor on the same browser
    // can never replay a stale registration.
    let _pendingReg = null;
    try { _pendingReg = JSON.parse(localStorage.getItem('_pendingAuth') || 'null'); } catch (e) {}
    localStorage.removeItem('_pendingAuth');

    if (_pendingReg && !data.inEditor) {
        const MAX_TRIES = 20;
        const RETRY_MS = 1500;
        let _t = 0;
        const retry = () => { _t++; setTimeout(_wait, RETRY_MS); };

        function _wait() {
            // Two-argument then: a throw inside manage() must not re-enter the poll.
            shazamme.auth(_pendingReg.email, _pendingReg.uid, _pendingReg.isOAuth).then(
                u => {
                    if (!u?.candidate && _t < MAX_TRIES) { retry(); return; }
                    // Sibling widgets (quick-nav) rendered logged-out before this
                    // async auth finished and only refresh on the 'site-auth'
                    // broadcast, so publish it ourselves.
                    if (u) shazamme.pub(shazamme.message.auth, u);
                    manage(u);
                },
                () => { if (_t < MAX_TRIES) retry(); else manage(null); }
            );
        }
        _wait();
    } else {
        shazamme.user(true).then( u => manage(u) );
    }
}

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.3.min.js')
    .then( () => shazamme.ready(data.siteId, data.page) )
    .then( () => {
        main(shazamme.register('candidate-dasboard-tabs', data))
    });
