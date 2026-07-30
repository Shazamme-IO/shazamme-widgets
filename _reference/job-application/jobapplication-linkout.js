let action = new Action();

//THIS WILL HOLD THE UPLOADED FILES
let uploadedFiles = {};

let isRequiredResume = false;
let isRequiredCover = false;//true
let dudaAlias = data.siteId;//data.siteId;
let importData = {};
let thankYouPage = "thank-you";
let dashboardPage = "dashboard";
let registerPage = "register";
let loginFrom;
if(data.config.toggleThankyouPage)
{
    thankYouPage=data.config.txt_Thankyoupageurl;
}
//If the layout is the layout 2 we dont need the resume to be uploaded so we need to set it to false;
let shouldUploadResume = data.config.showResume === true;
let shouldUploadCover = data.config.applicationLayout !== "simpleForm" && data.config.showCoverLetter;
let showSubscription = data.config.showSubscription === 'true';

const uri = new URL(window.location.href);

let isAcceptedPassword = false;
let passwordInput = document.getElementById('passwordInput');

const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;

if (data.config.showScreeningQuestions) {
    showScreeningQuestions();
}

// EVENTS
$('#passwordInput').focus(function(){
    $('#passwordMessage,.arrow-bottom').css("display","flex");
});

$('#passwordInput').blur(function(){
    if (isAcceptedPassword) {
        $('#passwordMessage, .arrow-bottom').css("display","none");
    }
});

if (data.config.useSmartLogin && !hasLoggedInUser()) {
    var loginTimeout = null;

    $(element).find(".smart-login-login, .smart-login-register").hide();

    $("#emailLogin").keyup(function() {
        if (loginTimeout) {
            clearTimeout(loginTimeout);
        }

        loginTimeout = setTimeout( () => {
            let id = $(this).val().trim();

            if (id.length === 0) {
                $(element).find(".smart-login-login, .smart-login-register").hide();
                return;
            }

            firebase.auth().fetchSignInMethodsForEmail(id)
                .then( res => {
                    $(element).find(".smart-login-login, .smart-login-register").hide();

                    if (res.length > 0) {
                        $(element).find(".smart-login-login").show();
                    } else {
                        $(element).find(".smart-login-register").show();
                        $("#emailAddress").val(id);
                    }
                }).catch( () => {
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

    passwordInput.onkeyup = function(){
        let statusCount = 0;
        //lowercase
        if (!(passwordInput.value.length < 8)) {
            lenthChecker.classList.remove("invalid");
            lenthChecker.classList.add("valid");
            statusCount += 1;
        }else{
            lenthChecker.classList.remove("valid");
            lenthChecker.classList.add("invalid");
            statusCount -=1;
        }

        //Uppercase
        if(passwordInput.value.search(/(?=.*[A-Z])/) != -1){
            capitalChecker.classList.remove("invalid");
            capitalChecker.classList.add("valid");
            status = true;
            statusCount += 1;
        }else{
            capitalChecker.classList.remove("valid");
            capitalChecker.classList.add("invalid");
            statusCount -= 1;
        }

        //Number
        if (passwordInput.value.search(/\d/) != -1) {
            numberChecker.classList.remove("invalid");
            numberChecker.classList.add("valid");
            statusCount += 1;
        } else {
            numberChecker.classList.remove("valid");
            numberChecker.classList.add("invalid");
            statusCount -= 1;
        }

        //special chars
        if (passwordInput.value.search(/(?=.*[!@#$%^&*])/) != -1) {
            specialCharChecker.classList.remove("invalid");
            specialCharChecker.classList.add("valid");
            statusCount += 1;
        }else{
            specialCharChecker.classList.remove("valid");
            specialCharChecker.classList.add("invalid");
            statusCount -= 1;
        }
        //if 4 checkers are acceptable
        if(statusCount === 4){
            $('.passwordErrorTitle').text("Your password is acceptable!");
            $('#passwordMessage').css("background-color","#59db5d");
            $('.valid,.passwordErrorTitle').css("color","#fff");
            $('.arrow-bottom').css({
                "border-top":"15px solid #59db5d"
            });
            isAcceptedPassword = true;
            return ;
        }else{
            $('.passwordErrorTitle').text("Password must contain the following");
            $('#passwordMessage').css('background-color',"#ffa1a1");
            $('#passwordMessage,.passwordErrorTitle, .invalid').css("color","red");
            $('.arrow-bottom').css({
                "border-top":"15px solid #ffa1a1"
            });
            isAcceptedPassword = false;
            return false;
        }
    }
}

function convertBinaryString(fileUpload,type){
    var file = fileUpload.files[0];
    let fileName = file.name.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-');
    var reader = new FileReader();
    let fileType = type == "resume" ? "resumeFile":"coverLetterFile";
    let name = type == "resume" ? "resumeName":"coverLetterFileName";
    reader.addEventListener("load", function () {
        uploadedFiles[fileType] = reader.result;
        uploadedFiles[name] = fileName;
    }, false);
    if (file) {
        reader.readAsBinaryString(file);
    }
}

$(element).find("input#resume").on('change', function(){
    let file = this;
    let size = file.files[0]?.size;

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(file).val('');

        return;
    }

    let opt = $('input[type=radio][name=uploadTypeResume][value=uploadResume]');

    opt.get(0).checked = true;
    opt.trigger('change');

    convertBinaryString(file,"resume");
}).each(function() {
    let file = this;
    let size = file.files[0]?.size;

    if (file.files.length == 0) {
        return;
    }

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(file).val('');

        return;
    }

    let opt = $('input[type=radio][name=uploadTypeResume][value=uploadResume]');

    opt.get(0).checked = true;
    opt.trigger('change');

    convertBinaryString(file,"resume");
});

$(element).find("input#cover").on('change', function(){
    let file = this;
    let size = file.files[0]?.size;

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(file).val('');

        return;
    }

    let opt = $('input[type=radio][name=uploadTypeCover][value=uploadCover]');

    opt.get(0).checked = true;
    opt.trigger('change');

    convertBinaryString(file,"cover");
}).each(function() {
    let file = this;
    let size = file.files[0]?.size;

    if (file.files.length == 0) {
        return;
    }

    if (size > maxUploadSize) {
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(file).val('');

        return;
    }

    let opt = $('input[type=radio][name=uploadTypeCover][value=uploadCover]');

    opt.get(0).checked = true;
    opt.trigger('change');

    convertBinaryString(file,"cover");
});

$('input[type=radio][name=uploadTypeResume]').change(function(){
    if (this.value == 'uploadResume'){
        //show resume file uploader
        $('.fileUploadContainer').css('display','flex');
        shouldUploadResume = true;
    }else{
        $('.fileUploadContainer').css('display','none');

        shouldUploadResume = false;
    }
});

$('input[type=radio][name=uploadTypeCover]').change(function(){
    if (this.value == 'uploadCover'){
        $('.coverUploadContainer').css('display','flex');
        shouldUploadCover = true;
    }else{
        $('.coverUploadContainer').css('display','none');
        shouldUploadCover = false;
    }
});

$('#loginBtn').click(function(){
    let email = $('#emailLogin').val();
    let password = $('#passwordLogin').val();
    loginFrom = "loginForm";
    action.nativeLogin(email,password);
});

$('.container-item').click(function(){
    $('.registerTxt').hide();

    switch ($(this).attr('data-provider')) {
        case 'facebook': {
            action.loginOrRegisterUsingProvider(facebookProvider);
            break;
        }

        case 'google': {
            action.loginOrRegisterUsingProvider(googleProvider);
            break;
        }

        case 'linkedin': {
            shazamme.oauth('linkedinProvider');
            break;
        }

        case 'seek': {
            shazamme.oauth('seekProvider');
            break;
        }
    }
});

// END EVENTS

function checkFileUploaded(element,shouldUpload,file){
    //If the layout is the simple layout we dont need the resume file
    if(shouldUpload){

        let notif = file == "resume"? data.config.warningResume || 'Please upload your resume' : data.config.warningCoverLetter || 'Please upload your cover letter, or tick the "I don\'t have cover letter"';
        //GET THE FILE
        let fileToBeUploaded = element.files[0];
        if(fileToBeUploaded == undefined){
            buttonAction("stop");
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');
            alert(notif);
            throw new Error(notif)
            return null;
        }
        //RETURN THE FILE WHICH IS UPLOADED
        return element.files[0];
    }
    return null;
}

function addUploadedToGlobal(file,key){
    if(!file) return;
    //GLOBAL var to be added EITHER RESUME || COVER LETTER;
    uploadedFiles[key] = file;
}


function Action(){
    this.clearKeys = ()=>{
        //We create an array so we can loop through each key and delete it in local Storage
        let keysToDelete = [
            "seekAuthorizationCode",
            "authProvider",
            "currentJobViewed",
            "linkedIncode",
            "jobID",
        ];

        for(const key of keysToDelete) {
            shazamme.store(key, null);
        }
    };

    this.nativeLogin = (uid, secret) => {
        shazamme.firebase().auth(uid, secret).then( () => {
            if (data.inEditor) {
                return;
            }

            if (loginFrom == "loginForm"){
                window.location.reload();
                return;
            }

            if (loginFrom == "registrationForm"){
                let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${thankYouPage}?preview=true&insitepreview=true&dm_device=desktop`:`/${thankYouPage}`;
                window.location.href = link;
                return;
            }

            let previousApplicationPage = shazamme.store('previousApplicationPage');

            if (previousApplicationPage){
               window.location.href = previousApplicationPage;
               return;
            }

            window.location.href = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${thankYouPage}?preview=true&insitepreview=true&dm_device=desktop`:`/${thankYouPage}`;
        }).catch( error => {
            alert(error.msg);
        });
    };

    this.loginOrRegisterUsingProvider = (p) => {
        shazamme.firebase().oauth(p).then( u => {
            if (u.isNew) {
                shazamme.submit({
                    action: 'Register Candidate',
                    salutation: ' ',
                    firstName: u.firstName,
                    surname: u.lastName,
                    eMail: u.email,
                    password: shazamme.uuid(),
                    candidateID:  shazamme.uuid(),
                    firebaseUserID:  u.firebaseUserID,
                    isActive: true,
                    isValidated: true,
                    isSubscribed: showSubscription && $(element).find('[data-rel=checkbox-subscribe]:checked').length > 0,
                    dudaSiteID: data.siteId,
                }).then( r => {
                    r.status && !data.inEditor && shazamme.auth(u.email, u.firebaseUserID, true).then( () => {
                        window.location.reload() ;
                    });
                });
            } else {
                window.location.reload() ;
            }
        }).catch( (err) => {
            alert(err.msg);
        });
    }
}

function showOrHideForms(s) {
    const el = $(element);

    if(s){
        el.find('#salutation').val(s.salutation || '');
        el.find('#firstName').val(s.firstName || '');
        el.find('#lastName').val(s.surname || '');
        el.find('#emailAddress').val(s.eMail || '').attr('readonly', 'readonly');
        el.find('#phoneNumber').val(s.phone || '');
        el.find('#mobileNumber').val(s.mobile || '');

        if (s.isNew) {
            el.find('.shmLoginContainer,.applyMainSocial,.subscriptionContainer').show();
            el.find('.greeting-message').hide();
        } else {
            el.find('.shmLoginContainer,.applyMainSocial,.subscriptionContainer').hide();

            el.find('.greeting-message')
                .show()
                .text(`${data.config.greeting || 'Welcome back'} ${s.firstName || ''} ${s.surname || ''}!`);
        }
    } else {
        el.find('.shmregistrationContainer,.shmLoginContainer,.applyMainSocial,.subscriptionContainer').show();
        el.find('.greeting-message')
            .hide()
            .text('');

        el.find('#salutation').val('');
        el.find('#firstName').val('');
        el.find('#lastName').val('');
        el.find('#emailAddress').val('').removeAttr('readonly');
        el.find('#phoneNumber').val('');
        el.find('#mobileNumber').val('');
    }

    if (data.inEditor) {
        el.find('.greeting-message')
            .show()
            .text(`${data.config.greeting || 'Welcome back'}!`);
    }

    if(!s?.cVFileContent){
        $(element).find('.uploadExisting').css('display',"none");
    }

    if (data.config.showScreeningQuestions) {
        showScreeningQuestions();
    }
}

function hasLoggedInUser(){
    return window.localStorage.vinylResponse;
}

function getJobID(){
    let getURL = new URL(window.location.href);

    return getURL.searchParams.get("jobID") || (data.config.useSingleJob && data.config.jobID) || shazamme.store('jobID');
}

function isObjectComplete(object) {
     if (typeof (object) !== 'object') console.warn('not object by objectChecker');

     for (const property in object) {
         if (object[property] === '') {
             return false;
         }
     }
     return true;
 }

function buttonAction(action){
    if(action == "apply"){
        $('.submitApplicationBtn, .applyText').css('pointer-events',"none");
        //$('.applyText').hide();
        return;
    }
    $('.submitApplicationBtn, .applyText').css('pointer-events',"auto");
    $('.applyText').show();
}

function showScreeningQuestions() {
        shazamme.site()
            .then( s => shazamme.fetch({
                path: `/job-results/${s.siteID}/${getJobID()}`,
                isExternal: true,
                useCache: true,
            }) )
            .then( j => {
                if (j?.data?.screeningTemplateID) {
                    shazamme.submit({
                        action: "Get Screening Questions",
                        templateID: j?.data?.screeningTemplateID,
                    }).then( res => {
                        if (!res.status) {
                            return;
                        }

                        let el = res.response.map( q => questionElement(q) );

                        $(element).find('[data-rel=screening-fields]')
                            .empty()
                            .append(el);
                    });
                }
            });
}

function questionElement(q) {
    switch (q.questionType) {
        case 'Text':
            return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="text" autocomplete="nope" data-qtype="text" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;

        case 'Number':
            return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="number" autocomplete="nope" data-qtype="number" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;

        case 'Date':
            return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="date" autocomplete="nope" data-qtype="date" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;

        case 'Boolean':
            return `
                 <div class="input-field-container">
                    <label>
                        ${q.question}
                        <input type="checkbox" autocomplete="nope" data-qtype="bool" data-qid="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" />
                    </label>
                </div>
            `;

        case 'List': {
            let opts = q.options.map( o => `<option value="${o.screeningQuestionOptionsID}">${o.option}</option>`);

            return `
                 <div class="input-field-container">
                    <p>${q.question}</p>
                    <select data-qtype="list" data-qid="${q.screeningQuestionID}">${opts.join('')}</select>
                 </div>
            `;
        }

        case 'Radio': {
            let opts = q.options.map( o => `<label><input type="radio" data-qtype="radio" name="${q.screeningQuestionID}" data-qid="${q.screeningQuestionID}" value="${o.screeningQuestionOptionsID}" />${o.option}</label>`);

            return `
                 <div class="input-field-container">
                    <p> ${q.question}</p>
                    ${opts.join('')}
                 </div>
            `;
        }

        default: return '';

    }
}

function validateScreeningQuestions() {
    let isOk = true;

    $(element).find('[data-rel=screening-fields] input, [data-rel=screening-fields] select').each( (i, el) => {
        let field = $(el);

        switch (field.attr('data-qtype')) {
            case 'text':
            case 'select': {
                let val = field.val();

                isOk = isOk && val && val.trim().length > 0;
                break;
            }

            case 'number': {
                isOK = isOk && !isNaN(field.val());
                break;
            }

            case 'date': {
                let val = Date.parse(field.val());

                isOk = isOk && !isNaN(val);
                break;
            }
        }
    });

    return isOk;
}

function checkForDuplicate(candidateID) {
    return shazamme.site().then( s =>
        s.isLive
            && shazamme.submit({
                action: "Get Job Applications",
                candidateID,
            }).then( r => r?.status && r?.response?.items?.find( x => x.jobID === getJobID() ) )
            || Promise.resolve(false)
    );

}


const main = (w) => {
    const register = () => {
        //COLLECT INFO FROM FORM
        let candidateInfo = collectRegisterFormValues()

        //CHECK IF ALL FIELDS HAS VALUE
        let isCompleteFields = isObjectComplete(candidateInfo);
        //IS PASSWORD 8
        let acceptablePassword = isAcceptedPassword;

        if(!isCompleteFields){
            buttonAction("hide");
            alert(data.config.warningFields || 'Please complete all required fields');
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');

          return Promise.reject();
        }

        if (shouldUploadResume && !candidateInfo.cVFileContent) {
            alert(data.config.warningResume || 'Please upload your resume');

            return Promise.reject();
        }

        if(!acceptablePassword){
            //TODO add alert and remove loading seek
            buttonAction("hide");
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');
            alert(data.config.warningPassword || 'Please follow the password pattern!');

            return Promise.reject();
        }

        return shazamme
            .firebase()
            .validateEmail(candidateInfo.eMail)
            .then( () => {
                //If complete na yung details ng candidate add candidate ID
                candidateInfo.candidateID = shazamme.uuid();

                if (data.config.showPassword || !data.config.useAnonymous) {
                    //REGISTER
                    return shazamme.firebase()
                        .create(candidateInfo.eMail, candidateInfo.password)
                        .then( u => Promise.resolve({
                                ...candidateInfo,
                                firebaseUserID: u.uid,
                          }))
                        .catch( err => {
                            buttonAction("hide");
                            $(element).find('.fcLoader').removeClass('fcLoadingSeek');

                            if (err.code === 'auth/invalid-email') {
                                alert(data.config.warningEmail || "Please use a valid email address");
                            } else if (err.code == "auth/email-already-in-use") {
                                if (data.config.showPassword) {
                                    if (window.confirm('The email is already an existing account please login instead.')){
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth'
                                        });

                                        $(element).find(".submitApplicationBtn").css("pointer-events","auto");
                                        $(element).find(".applyText").show();
                                        $(element).find('.fcLoader').removeClass('fcLoadingSeek');
                                    };
                                }
                            }

                            return Promise.reject(err);
                        });
                } else {
                    //APPLY ANONYMOUSLY
                    return Promise.resolve({
                        ...candidateInfo,
                        isValidated: false,
                    });
                }
            })
            .catch( () => {
                buttonAction("hide");
                $(element).find('.fcLoader').removeClass('fcLoadingSeek');
                alert(data.config.warningEmail || 'Please supply a valid email.');

                return Promise.reject();
            });

    }

    const collectRegisterFormValues = () => {
        let password = $('#passwordInput').val() || "";

        const el = $(element);

        if (!data.config.showPassword) {
            password = shazamme.uuid();
            isAcceptedPassword = true;
        }

        let r = {
            salutation: $(element).find('#salutation').val() || ' ',
            firstName: el.find('#firstName').val()?.trim()?.replace(/["«»‘’‚‛“”„‟‹›❛❜❝❞❮❯〝〞〟＂❟❠⹂🙶🙷🙸＇]/g, '') || '',
            surname: el.find('#lastName').val()?.trim()?.replace(/["«»‘’‚‛“”„‟‹›❛❜❝❞❮❯〝〞〟＂❟❠⹂🙶🙷🙸＇]/g, '') || '',
            eMail: el.find('#emailAddress').val()?.trim() || '',
            phone: (data.config.showPhoneNumber && el.find('#phoneNumber').val()?.trim()) || (!data.config.requirePhone ? undefined : ''),
            mobile: (data.config.showMobileNumber && el.find('#mobileNumber').val()?.trim()) || (!data.config.requireMobile ? undefined : ''),
            password: password,
            isActive:true,
            isValidated: true,
            isSubscribed: showSubscription && el.find('[data-rel=checkbox-subscribe]:checked').length > 0,
            dudaSiteID: data.siteId,
            cVFileContent: uploadedFiles.resumeFile && btoa(uploadedFiles.resumeFile),
            cVFileName:uploadedFiles.resumeName,
        }

        if (w && data.config.enableTracing && (!uploadedFiles.resumeFile || !uploadedFiles.coverLetterFile)) {
            w.warn('file(s) missing', r);
            w.warn('file(s) missing (contains uploads)', uploadedFiles);
        }

        if (data.config.validatePhoneNumber) {
            r.defaultPhoneCountry = data.config.defaultPhoneCountry || 'AU';
            r.validatePhone = true;
        }

        return r;
    }

    $(element).find('.submitApplicationBtn').click(function() {
        if(!getJobID()){
            alert(data.config.warningNoJob || 'No job selected!');
            return;
        }

        //EITHER OF THE TWO SHOULD BE UPLOADED IF NOT RETURN NULL SO WE CANT PUSH IT TO GLOBAL FILE OBJECT
        let hasResumeFileElement = document.querySelector('input#resume[type=file]');//123
        let hasCoverFileElement = document.querySelector('input#cover[type=file]');//123

        //CHECK FIRST IF GLOBAL FILE HAS SOMETHING IN IT.
        let hasItemsTobeUploaded = shouldUploadResume
            || shouldUploadCover
            || Object.keys(uploadedFiles).length
            || $(element).find('#uploadExisting').is(':checked');

        //$(element).find(".shmApplicationMainContainer").addClass("loading-seek-profile");
        //loading
        $(element).find('.fcLoader').addClass('fcLoadingSeek');
        shazamme.store('previousApplicationPage', null);

        if (data.config.showScreeningQuestions && !validateScreeningQuestions()) {
            buttonAction("hide");
            alert(data.config.warningQuestions || 'Please complete all of the screening questions');
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');

            return;
        }

        if (data.config.requireApproval === true && !$(element).find('[data-rel=field-approve]').is(':checked')) {
            buttonAction("hide");
            alert(data.config.approvalWarning || 'Please confirm approval of the terms');
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');

            return;
        }

        const invalidName = (n, p) => (p?.length > 0 && p) || (n?.length > 0 && n) || '';

        let invalid = $(element)
            .find('input.invalid')
            .map( (_, e) => `- ${invalidName($(e).attr('data-name'), $(e).attr('placeholder'))}` )
            .toArray();

        if (invalid.length > 0) {
            buttonAction("hide");
            alert(`${data.config.warningValidation || 'Please correct the following:'}\n${invalid.join('\n')}`);
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');

            return;
        }

        let updateCandidate = (u) => {
            let c = collectRegisterFormValues();

            //CHECK IF ALL FIELDS HAS VALUE
            if (!isObjectComplete(c)) {
                buttonAction("hide");
                alert(data.config.warningFields || 'Please complete all required fields');
                $(element).find('.fcLoader').removeClass('fcLoadingSeek');

              return Promise.reject();
            }

            if (shouldUploadResume && !c.cVFileContent) {
                buttonAction("hide");
                alert(data.config.warningResume || 'Please upload your resume');
                $(element).find('.fcLoader').removeClass('fcLoadingSeek');

                return Promise.reject();
            } else {
                c.cVFileContent = c.cVFileContent ?? u.candidate.cVFileContent;
                c.cVFileName = c.cVFileName ?? u.candidate.cVFileName;
            }

            c.phone = c.phone || u.candidate.phone || null;
            c.mobile = c.mobile || u.candidate.mobile || null;

            delete c.dudaSiteID;
            delete c.defaultPhoneCountry;
            delete c.validatePhone;

            return shazamme.submit({
                action: 'Edit Candidate Info',
                ...u.candidate,
                ...c,
            })
            .then( r => r.status && shazamme.user(true) || Promise.reject() );
        }

        let apply = (u) => {
            let referralSource = {
                referralSource: uri.searchParams.get("utm_source") || shazamme.session('referralSource'),
                referralMedium: uri.searchParams.get("utm_medium") || shazamme.session('referralMedium'),
                referralTerm: uri.searchParams.get("utm_term") || shazamme.session('referralTerm'),
                referralCampaign: uri.searchParams.get("utm_campaign") || shazamme.session('referralCampaign'),
                referralContent: uri.searchParams.get("utm_content") || shazamme.session('referralContent'),
            };

            let a = {
                jobID: getJobID(),
                screeningAnswers: (data.config.showScreeningQuestions && screeningAnswers()) || undefined,
                ...referralSource,
            };

            if (hasItemsTobeUploaded) {
                if($('#uploadExisting').is(':checked') && u?.candidate?.cVFileContent) {
                    a.resumeFile = u?.candidate?.cVFileContent;
                    a.resumeFileName =u?.candidate?.cVFileName;
                } else {
                    try {
                        let resume = checkFileUploaded(hasResumeFileElement,shouldUploadResume,"resume");

                        a.resumeFile = resume && btoa(uploadedFiles.resumeFile);
                        a.resumeFileName = resume && uploadedFiles.resumeName;
                    } catch {
                        $(element).find('.fcLoader').removeClass('fcLoadingSeek');
                        return;
                    }
                }

                try {
                    let cover = checkFileUploaded(hasCoverFileElement,shouldUploadCover,"coverLetter");

                    a.coverLetterFile = cover && btoa(uploadedFiles.coverLetterFile);
                    a.coverLetterFileName = cover && uploadedFiles.coverLetterFileName;
                } catch {
                    $(element).find('.fcLoader').removeClass('fcLoadingSeek');
                    return;
                }

                if (hasResumeFileElement && shouldUploadResume && !a.resumeFile) {
                    alert(data.config.warningResume || 'Please upload your resume');
                    return;
                }

                if (hasCoverFileElement && shouldUploadCover && !a.coverLetterFile) {
                    alert(data.config.warningCoverLetter || 'Please upload your cover letter, or tick the "I don\'t have cover letter"');
                    return;
                }
            }

            if (data.config.showGender) {
                a.customField1 = $('#gender').val();
            }

            if (data.config.showAboriginal) {
                a.customField2 = $('#aboriginal').is(':checked');
            }

            if (data.config.enableTracing) {
                a.session = shazamme.uuid(),

                w.log('apply', {
                    candidate: u,
                    application: a,
                });
            }

            // Destination after the (soft) application: the job's external
            // linkout URL (read from the job we cached on page load), else the
            // thank-you page (with optional job-field query).
            let jobViewed;
            try { jobViewed = JSON.parse(shazamme.store('currentJobViewed')); } catch (e) {}

            let dest;
            let linkoutUrl = jobViewed?.data?.applicationURL;

            if (linkoutUrl && linkoutUrl.length > 0) {
                dest = linkoutUrl;
            } else {
                dest = `/${thankYouPage}`;

                if (data.config.includeLastSearch && jobViewed?.data) {
                    let query = [];

                    (data.config.redirectJobField || []).forEach( i => {
                        let v = jobViewed.data[i.field];

                        if (v?.length > 0) {
                            query.push(`${i.field}=${encodeURIComponent(v)}`);
                        }
                    });

                    if (query.length) {
                        dest = `/${thankYouPage}?${query.join('&')}`;
                    }
                }
            }

            let applyPayload = {
                action: 'Apply Job',
                dudaSiteID: data.siteId,
                application: a,
                candidate: u,
            };

            // A resume/cover upload makes the payload too big for a keepalive
            // send (~64KB cap), so there we keep the reliable awaited submit and
            // then redirect. For a lightweight soft-capture (no files) we fire the
            // record with keepalive — it still completes as the page navigates
            // away — and redirect IMMEDIATELY, so the loader doesn't linger on the
            // slow legacy backend. UTMs/source are in the payload either way.
            if (a.resumeFile || a.coverLetterFile) {
                shazamme.submit(applyPayload).then( () => {
                    action.clearKeys();
                    window.location.href = dest;
                });
            } else {
                let actionUrl = shazamme._site?.RegionalUrl
                    || 'https://shazamme.io/Job-Listing/src/php/regional/actions';

                try {
                    fetch(actionUrl, {
                        method: 'POST',
                        keepalive: true,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: JSON.stringify(applyPayload),
                    });
                } catch (e) {}

                buttonAction("stop");
                action.clearKeys();
                window.location.href = dest;
            }
        }

        // Fast linkout soft-capture path. The stock flow here does a user
        // lookup and then either a duplicate-check + candidate-edit (logged in)
        // or a firebase register (logged out) BEFORE applying — each a slow
        // backend/firebase call that keeps the loader spinning even after the
        // apply() below became instant. For a capture-then-linkout we don't need
        // any of that: mint a candidate straight from the form values and record
        // it. apply() fires the record via keepalive and redirects immediately,
        // so the loader barely shows.
        //   NOTE: this intentionally skips login/register + duplicate checking.
        //   A logged-in user gets a fresh soft-capture record (not their account)
        //   — fine for a soft application whose real apply happens at the linkout.
        let softCandidate = collectRegisterFormValues();

        if (!isObjectComplete(softCandidate)) {
            buttonAction("hide");
            alert(data.config.warningFields || 'Please complete all required fields');
            $(element).find('.fcLoader').removeClass('fcLoadingSeek');
            return;
        }

        softCandidate.candidateID = shazamme.uuid();

        apply(softCandidate);
    });

    $(element).find('.eye').on('click', function() {
        let i = $(this);

        i
            .toggleClass('fa-eye-slash')
            .toggleClass('fa-eye')
            .siblings('input')
            .attr('type', function(i, v) {
                return v === 'text' ? 'password' : 'text';
            });
    });

    if (data.config.validatePhoneNumber && typeof libphonenumber === 'object') {
        $(element).find('input[type=telephone]').on('change', function() {
            const f = $(this);

            f.removeClass('invalid');

            if (f.val().trim().length === 0) {
                return;
            }

            try {
                const tel = libphonenumber.parsePhoneNumber(f.val(), data.config.defaultPhoneCountry || 'AU');

                if (!tel.country || !tel.isValid()) {
                    f.addClass('invalid');
                } else {
                    f.val(tel.formatInternational());
                }
            } catch {
                f.addClass('invalid');
            }
        });
    }

    shazamme.store('applicationURL', window.location.href);
    shazamme.store("jobID", getJobID());

    if (!data.inEditor) {
        shazamme.site()
            .then( s => shazamme.fetch({
                path: `/job-results/${s.siteID}/${getJobID()}`,
                isExternal: true,
                useCache: true,
            }))
            .then( j => {
                if (j?.data) {
                    shazamme.store('currentJobViewed', JSON.stringify(j));

                    // Stock behaviour redirected straight to j.data.applicationURL
                    // HERE on page load, bouncing the candidate to the external
                    // site before they could apply. For the soft-application
                    // linkout flow we do NOT redirect on load — the candidate
                    // fills the form and we redirect after submit (see the
                    // Apply Job handler above).
                    if (j.data.jobID === data.config.jobID) {
                        w.pub('job-application-fixed-job', j.data.jobID, true);
                    }
                } else {
                    $('.shmApplicationMainContainer').hide();
                    $('.section-no-job-message').show();
                }
            });
    }

    const handleUser = (u) => {
        if (u?.isNew) {
            showOrHideForms({
                salutation: ' ',
                firstName: u.firstName,
                surname: u.lastName,
                eMail: u.email,
                phone: '',
                mobile: '',
                isNew: true,
            });

            return;
        }

        let session = u?.candidate;

        showOrHideForms(session);

        session?.candidateID && checkForDuplicate(session.candidateID).then( exists => {
            if (exists) {
                if (confirm(data.config.duplicateWarning || 'DUPLICATE WARNING MESSAGE')) {
                    let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dashboardPage}?preview=true&insitepreview=true&dm_device=desktop`:`/${dashboardPage}`;

                    window.location.href = link;
                } else {
                    window.location.reload();
                }
            }
        });
    }

    shazamme.user().then( u => {
        handleUser(u);
    });

    w.sub('site-auth', (u) => {
        handleUser(u);
    });
}

$('head')
    .append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/fontawesome.min.css" crossorigin="anonymous" />'))
    .append($('<link rel="stylesheet" type="text/css" href="https://sdk.shazamme.io/css/fontawesome/css/regular.min.css" crossorigin="anonymous" />'));

$.getScript(
    'https://sdk.shazamme.io/js/shazamme-1.0.3.min.js',

    function() {
        Promise.all([
            shazamme.ready(data.siteId, data.page),
            shazamme.script('https://sdk.shazamme.io/js/plugin/libphonenumber/1.10.54/plugin.min.js'),
        ]).then( () => {
            main(shazamme.register('application-form', data, true));
        });
    }
);

