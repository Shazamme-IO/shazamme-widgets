// Job Application (application-form.js) — resume file-type check + typed resume — built 2026-11-11 14:55 AEDT (03:55 UTC) on Duda v914
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

// Resume file types (support ticket 14215). A site can narrow the list with the
// `allowedResumeTypes` setting, e.g. "pdf,docx,rtf,txt"; empty = the default list.
const DEFAULT_RESUME_EXTENSIONS = ['pdf', 'doc', 'docx', 'rtf', 'txt', 'odt'];
const BLOCKED_MIME_PREFIXES = ['image/', 'video/', 'audio/'];
const TYPED_RESUME_MIN_CHARS = 50;
const TYPED_RESUME_MAX_CHARS = 20000;
const allowedResumeTypes = parseExtensionList(data.config.allowedResumeTypes, DEFAULT_RESUME_EXTENSIONS);
const allowTypedResume = data.config.allowTypedResume === true;
let isTypingResume = false;
let uploadReadTokens = { resume: 0, cover: 0 };

$(element).find('input#resume, input#cover').attr('accept', allowedResumeTypes.map( e => `.${e}` ).join(','));
setupTypedResume();
installApplyLoader();

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

// Apply button loader. The template carries a hidden .loaderSpinner inside the
// button that nothing switched on, and the legacy .fcLoader page overlay most
// sites hide in CSS. setSubmitting() drives both from every start/stop point:
// label swaps for the spinner, button ignores clicks until the flow ends.
function installApplyLoader() {
    if (document.getElementById('shm-apply-loader-style')) {
        return;
    }

    $('<style id="shm-apply-loader-style"></style>')
        .text(
            '.submitApplicationBtn .loaderSpinner{display:none}' +
            '.submitApplicationBtn.shm-submitting .applyText{display:none}' +
            '.submitApplicationBtn.shm-submitting .loaderSpinner{display:inline-block;font-family:inherit}' +
            '.submitApplicationBtn.shm-submitting{pointer-events:none;opacity:.8;cursor:progress}' +
            '.submitApplicationBtn.shm-submitting .loaderSpinner i{display:inline-block;width:1em;height:1em;margin-right:.5em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-.15em;animation:shmApplySpin .7s linear infinite}' +
            '.submitApplicationBtn.shm-submitting .loaderSpinner i::before{content:none}' +
            '@keyframes shmApplySpin{to{transform:rotate(360deg)}}'
        )
        .appendTo(document.head);
}

function setSubmitting(on) {
    const el = $(element);
    const button = el.find('.submitApplicationBtn');

    if (on && !button.find('.loaderSpinner').length) {
        button.append('<span class="loaderSpinner"><i></i> Submitting application...</span>');
    }

    const spinner = button.find('.loaderSpinner');
    const label = data.config.submittingText || (/Submiting/.test(spinner.text()) ? 'Submitting application...' : '');

    if (on && label) {
        spinner.empty().append('<i></i> ').append(document.createTextNode(label));
    }

    button.toggleClass('shm-submitting', on);
    el.find('.fcLoader').toggleClass('fcLoadingSeek', on);
}

function isSubmitting() {
    return $(element).find('.submitApplicationBtn').hasClass('shm-submitting');
}

function parseExtensionList(value, fallback) {
    const list = String(value || '')
        .split(/[,;\s]+/)
        .map( s => s.trim().toLowerCase().replace(/^\./, '') )
        .filter( s => /^[a-z0-9]+$/.test(s) );

    return list.length ? list : fallback;
}

function fileExtension(name) {
    const m = /\.([a-z0-9]+)$/i.exec(String(name || '').trim());

    return m ? m[1].toLowerCase() : '';
}

function isAllowedResumeFile(file, allowed) {
    const list = allowed || allowedResumeTypes;
    const ext = fileExtension(file?.name);

    if (!ext || !list.includes(ext)) {
        return false;
    }

    const mime = String(file.type || '').toLowerCase();

    return !BLOCKED_MIME_PREFIXES.some( p => mime.startsWith(p) );
}

function allowedListText() {
    return allowedResumeTypes.map( e => e.toUpperCase() ).join(', ');
}

function resumeTypeWarning(type) {
    const isCover = type == "cover";
    const base = (isCover ? data.config.coverTypeWarning : data.config.resumeTypeWarning)
        || `This file format is not supported. Please upload your ${isCover ? 'cover letter' : 'resume'} in one of these formats: ${allowedListText()}.`;
    const offer = data.config.typedResumeOffer || 'Don\'t have your resume in one of these formats? Select "Type your resume" and enter it as text instead.';

    return allowTypedResume && !isCover ? `${base}\n\n${offer}` : base;
}

const UPLOAD_KEYS = { resume: ['resumeFile', 'resumeName'], cover: ['coverLetterFile', 'coverLetterFileName'] };

// A rejected or replaced file must not leave the previous one queued for submit.
function withoutUpload(files, type) {
    const drop = UPLOAD_KEYS[type] || [];

    return Object.fromEntries(Object.entries(files).filter( ([k]) => !drop.includes(k) ));
}

function nextReadToken(type) {
    uploadReadTokens = { ...uploadReadTokens, [type]: (uploadReadTokens[type] || 0) + 1 };

    return uploadReadTokens[type];
}

// Drops the queued file and invalidates any read still in flight for it.
function clearUpload(type) {
    nextReadToken(type);
    uploadedFiles = withoutUpload(uploadedFiles, type);
}

// Shared by the resume and cover letter inputs: type check, then size check,
// then read the file. Returns true when the file was accepted.
function acceptUpload(input, type) {
    const file = input.files?.[0];

    if (!file) {
        return false;
    }

    if (!isAllowedResumeFile(file)) {
        clearUpload(type);
        alert(resumeTypeWarning(type));
        $(input).val('');

        return false;
    }

    if (file.size > maxUploadSize) {
        clearUpload(type);
        alert( data.config.resumeSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
        $(input).val('');

        return false;
    }

    const radio = type == "resume"
        ? $('input[type=radio][name=uploadTypeResume][value=uploadResume]')
        : $('input[type=radio][name=uploadTypeCover][value=uploadCover]');
    // Switching resume mode re-reads the input itself; only read here when no switch happens.
    const alreadyUploading = type != "resume" || shouldUploadResume;

    if (radio.length) {
        radio.get(0).checked = true;
        radio.trigger('change');
    } else if (type == "resume") {
        // Layout without an "Upload a Resume" radio: picking a file is the way back out of typed mode.
        leaveTypedResume();
    }

    if (alreadyUploading) {
        convertBinaryString(input, type);
    }

    return true;
}

// Back in upload mode the input may still hold the file that was cleared from the queue.
function rereadResumeInput() {
    const input = $(element).find('input#resume').get(0);

    if (input?.files?.length) {
        convertBinaryString(input, "resume");
    }
}

function leaveTypedResume() {
    if (!isTypingResume && shouldUploadResume) {
        return;
    }

    isTypingResume = false;
    shouldUploadResume = true;
    $(element).find('#radioTypedResume').prop('checked', false);
    $(element).find('.typedResumeContainer').css('display', 'none');
    $('.fileUploadContainer').css('display', 'flex');
    rereadResumeInput();
}

// "Use existing Resume" re-sends the CV already stored on the candidate; refuse
// it when that file is in a format the site does not accept.
function existingResumeBlocked(candidate) {
    if (isTypingResume || !$(element).find('#uploadExisting').is(':checked')) {
        return false;
    }

    // No stored file name means nothing to judge; leave that to the server.
    if (!candidate?.cVFileName || isAllowedResumeFile({ name: candidate?.cVFileName })) {
        return false;
    }

    buttonAction("hide");
    setSubmitting(false);
    alert(data.config.existingResumeWarning || `The resume saved on your profile is not in a supported format (${allowedListText()}). Please upload a new one.`);

    return true;
}

// Optional "Type your resume" choice (setting `allowTypedResume`). Plain text
// only: paste and drop are blocked, control characters are stripped, length is
// capped, and the text is sent as a .txt resume file.
function setupTypedResume() {
    if (!allowTypedResume) {
        return;
    }

    const el = $(element);
    const radioRow = el.find('#radioResume, .fileUploadContainer').first().closest('.radioBtnContainer');
    const anchor = radioRow.length ? radioRow : el.find('input#resume').parent();

    if (!anchor.length) {
        return;
    }

    const row = $(
        '<div class="radioBtnContainer typedResume">' +
            '<div class="shmApplyRadio"><input type="radio" id="radioTypedResume" name="uploadTypeResume" value="typeResume"/> <label for="radioTypedResume"></label></div>' +
            '<div class="typedResumeContainer" style="display:none;flex-direction:column">' +
                '<textarea id="resumeText" rows="12" autocomplete="off" spellcheck="true" style="width:100%;box-sizing:border-box;font-family:inherit;font-size:inherit;padding:10px;resize:vertical"></textarea>' +
                '<div class="label-hint typedResume"></div>' +
            '</div>' +
        '</div>'
    );

    row.find('label').text(data.config.typedResumeLabelText || 'Type your resume');

    if (!radioRow.length) {
        // No "Upload a Resume" radio to switch back with: offer a link instead.
        $('<a href="#" class="typedResumeBack" style="display:block;margin-top:8px"></a>')
            .text(data.config.typedResumeBackText || 'Upload a file instead')
            .on('click', e => {
                e.preventDefault();
                leaveTypedResume();
            })
            .appendTo(row.find('.typedResumeContainer'));
    }
    row.find('.label-hint').text(data.config.typedResumeHint || `Type your work history, skills and qualifications (at least ${TYPED_RESUME_MIN_CHARS} characters). Pasting is not allowed.`);
    row.find('textarea')
        .attr('maxlength', TYPED_RESUME_MAX_CHARS)
        .attr('placeholder', data.config.typedResumePlaceholder || 'Type your resume here. Pasting is not allowed.')
        .on('paste drop dragover', e => e.preventDefault())
        .on('beforeinput', e => {
            if (/insertFromPaste|insertFromDrop|insertFromYank/.test(e.originalEvent?.inputType || '')) {
                e.preventDefault();
            }
        });

    anchor.after(row);
}

function sanitizeTypedResume(value) {
    return String(value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[^\P{Cc}\n\t]|[‪-‮⁦-⁩]/gu, '')
        .trim()
        .slice(0, TYPED_RESUME_MAX_CHARS);
}

function typedResumeFileName(firstName, lastName) {
    const stem = `${firstName || ''} ${lastName || ''}`
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '');

    return stem ? `${stem}-resume.txt` : 'typed-resume.txt';
}

// Same shape as FileReader.readAsBinaryString, so btoa() can encode it.
function toBinaryString(text) {
    return Array.from(new TextEncoder().encode(text), b => String.fromCharCode(b)).join('');
}

function typedResumeFile() {
    const el = $(element);
    const footer = `\n\n--\nTyped by the candidate on the website, ${new Date().toLocaleDateString('en-CA')}`;
    const text = Array.from(sanitizeTypedResume(el.find('#resumeText').val())).slice(0, TYPED_RESUME_MAX_CHARS - footer.length).join('');

    if (text.length < TYPED_RESUME_MIN_CHARS) {
        return null;
    }

    return {
        name: typedResumeFileName(el.find('#firstName').val(), el.find('#lastName').val()),
        content: toBinaryString(`${text}${footer}`),
    };
}

function convertBinaryString(fileUpload,type){
    var file = fileUpload.files[0];
    let fileName = file.name.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-');
    var reader = new FileReader();
    let fileType = type == "resume" ? "resumeFile":"coverLetterFile";
    let name = type == "resume" ? "resumeName":"coverLetterFileName";
    const token = nextReadToken(type);
    reader.addEventListener("load", function () {
        // A later rejection or mode switch cleared this slot; drop the stale read.
        if (token !== uploadReadTokens[type]) {
            return;
        }

        uploadedFiles[fileType] = reader.result;
        uploadedFiles[name] = fileName;
    }, false);
    if (file) {
        reader.readAsBinaryString(file);
    }
}

// Bound before the file inputs so a restored file on page load reaches the mode switch.
$('input[type=radio][name=uploadTypeResume]').change(function(){
    const wasUploading = shouldUploadResume;

    isTypingResume = this.value == 'typeResume';
    shouldUploadResume = this.value == 'uploadResume';

    if (!shouldUploadResume) {
        // Leaving upload mode: the chosen file must not ride along with a typed or existing resume.
        clearUpload('resume');
    } else if (!wasUploading) {
        rereadResumeInput();
    }

    $('.fileUploadContainer').css('display', shouldUploadResume ? 'flex' : 'none');
    $(element).find('.typedResumeContainer').css('display', isTypingResume ? 'flex' : 'none');
});

$(element).find("input#resume").on('change', function(){
    acceptUpload(this, "resume");
}).each(function() {
    acceptUpload(this, "resume");
});

$(element).find("input#cover").on('change', function(){
    acceptUpload(this, "cover");
}).each(function() {
    acceptUpload(this, "cover");
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
            setSubmitting(false);
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
            setSubmitting(false);

          return Promise.reject();
        }

        if (shouldUploadResume && !candidateInfo.cVFileContent) {
            alert(data.config.warningResume || 'Please upload your resume');

            return Promise.reject();
        }

        if(!acceptablePassword){
            //TODO add alert and remove loading seek
            buttonAction("hide");
            setSubmitting(false);
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
                            setSubmitting(false);

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
                                        setSubmitting(false);
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
                setSubmitting(false);
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
        if (isSubmitting()) {
            return;
        }

        if(!getJobID()){
            alert(data.config.warningNoJob || 'No job selected!');
            return;
        }

        if (isTypingResume) {
            const typed = typedResumeFile();

            if (!typed) {
                alert(data.config.typedResumeWarning || `Please type your resume (at least ${TYPED_RESUME_MIN_CHARS} characters), or upload a file instead.`);
                return;
            }

            uploadedFiles = { ...uploadedFiles, resumeFile: typed.content, resumeName: typed.name };
        }

        //EITHER OF THE TWO SHOULD BE UPLOADED IF NOT RETURN NULL SO WE CANT PUSH IT TO GLOBAL FILE OBJECT
        let hasResumeFileElement = document.querySelector('input#resume[type=file]');//123
        let hasCoverFileElement = document.querySelector('input#cover[type=file]');//123

        //CHECK FIRST IF GLOBAL FILE HAS SOMETHING IN IT.
        let hasItemsTobeUploaded = isTypingResume
            || shouldUploadResume
            || shouldUploadCover
            || Object.keys(uploadedFiles).length
            || $(element).find('#uploadExisting').is(':checked');

        //$(element).find(".shmApplicationMainContainer").addClass("loading-seek-profile");
        //loading
        setSubmitting(true);
        shazamme.store('previousApplicationPage', null);

        if (data.config.showScreeningQuestions && !validateScreeningQuestions()) {
            buttonAction("hide");
            alert(data.config.warningQuestions || 'Please complete all of the screening questions');
            setSubmitting(false);

            return;
        }

        if (data.config.requireApproval === true && !$(element).find('[data-rel=field-approve]').is(':checked')) {
            buttonAction("hide");
            alert(data.config.approvalWarning || 'Please confirm approval of the terms');
            setSubmitting(false);

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
            setSubmitting(false);

            return;
        }

        let updateCandidate = (u) => {
            let c = collectRegisterFormValues();

            //CHECK IF ALL FIELDS HAS VALUE
            if (!isObjectComplete(c)) {
                buttonAction("hide");
                alert(data.config.warningFields || 'Please complete all required fields');
                setSubmitting(false);

              return Promise.reject();
            }

            if (isTypingResume) {
                // The typed text goes to this application only; the profile keeps its saved CV.
                c.cVFileContent = u.candidate.cVFileContent;
                c.cVFileName = u.candidate.cVFileName;
            } else if (shouldUploadResume && !c.cVFileContent) {
                buttonAction("hide");
                alert(data.config.warningResume || 'Please upload your resume');
                setSubmitting(false);

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
                if (isTypingResume && uploadedFiles.resumeFile) {
                    a.resumeFile = btoa(uploadedFiles.resumeFile);
                    a.resumeFileName = uploadedFiles.resumeName;
                } else if($('#uploadExisting').is(':checked') && u?.candidate?.cVFileContent) {
                    a.resumeFile = u?.candidate?.cVFileContent;
                    a.resumeFileName =u?.candidate?.cVFileName;
                } else {
                    try {
                        let resume = checkFileUploaded(hasResumeFileElement,shouldUploadResume,"resume");

                        a.resumeFile = resume && btoa(uploadedFiles.resumeFile);
                        a.resumeFileName = resume && uploadedFiles.resumeName;
                    } catch {
                        setSubmitting(false);
                        return;
                    }
                }

                try {
                    let cover = checkFileUploaded(hasCoverFileElement,shouldUploadCover,"coverLetter");

                    a.coverLetterFile = cover && btoa(uploadedFiles.coverLetterFile);
                    a.coverLetterFileName = cover && uploadedFiles.coverLetterFileName;
                } catch {
                    setSubmitting(false);
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

            shazamme.submit({
                action: 'Apply Job',
                dudaSiteID: data.siteId,
                application: a,
                candidate: u,
            }).then( () => {
                buttonAction("stop");

                action.clearKeys();

                let path = `/${thankYouPage}`;

                if (data.config.includeLastSearch) {
                    shazamme.site()
                        .then( s => shazamme.fetch({
                            path: `/job-results/${s.siteID}/${getJobID()}`,
                            isExternal: true,
                            useCache: true,
                        }))
                        .then( j => {
                            let query = [];

                            let push = (n) => {
                                let v = j?.data[n];

                                if (v?.length > 0) {
                                    query.push(`${n}=${encodeURIComponent(v)}`);
                                }
                            }

                            data.config.redirectJobField.forEach( i => {
                                push(i.field);
                            });

                            window.location.href = `/${thankYouPage}?${query.join('&')}`;
                        });
                } else {
                    window.location.href = path;
                }
            });
        }

        shazamme.user().then( u => {
            if (u?.candidate) {
                if (existingResumeBlocked(u.candidate)) {
                    return;
                }

                checkForDuplicate(u.candidate.candidateID).then( exists => {
                    if (exists) {
                        if (confirm(data.config.duplicateWarning || 'DUPLICATE WARNING MESSAGE')) {
                            let link = window.location.href.includes(dudaAlias) ? `/site/${dudaAlias}/${dashboardPage}?preview=true&insitepreview=true&dm_device=desktop`:`/${dashboardPage}`;

                            window.location.href = link;
                        } else {
                            window.location.reload();
                        }
                        return;
                    }

                    updateCandidate(u)
                        .then( () => apply(u.candidate) )
                        .catch( () => {
                            setSubmitting(false);
                        });
                });
            } else {
                buttonAction("apply");
                //register then login the candidate
                register().then( u => {
                    if (u) {
                        loginFrom = "registrationForm";
                        buttonAction("hide");

                        apply(u);
                    }
                }).catch( () => {
                    setSubmitting(false);
                    buttonAction("hide");
                });

                return;
            }
        });
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

                    if (j.data.applicationURL?.length > 0) {
                        window.location = j.data.applicationURL;
                    } else if (j.data.jobID === data.config.jobID) {
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
