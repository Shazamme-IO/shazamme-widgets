let btnDotLayout=data.config.btnDotLayout;
let DescriptionLength=data.config.DescriptionLength;
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
let showImage = data.config.showImage ? "block":"none";
let consultantCollection = "Consultants";
let jobsCollection = "Jobs";
let consultantPage  = "consultants";
let consultantDetailsPage  = "consultant";
let slidesToShow = data.device == "mobile"? 1:data.config.slidesToShow;
let infinite = data.config.infinite;
let arrows = data.device == "mobile" ? true:data.config.arrows;
let autoplay = data.config.autoplay;
let dotsPagination = data.device=="mobile" ? false:data.config.dotsPagination;
let selectedTags = data.config.tags;
let limitTestimonials = data.config.limitTestimonials;
let maxTestimonials = parseInt(data.config.maxTestimonials) || 15;
let ReadMoreOpenmodal = document.getElementById("ReadMoremyModal");
let ReadMoremodalbtn = document.getElementById("ReadMoremyBtn");
let ReadMoreClosespan = document.getElementsByClassName("ReadMoreclose")[0];
let clsReadmoreDesc=$(element).find('.clsReadmoreDesc');
var clsRDMRDECSID=$(element).find('#clsRDMRDECSID');
let ConsultantArray=[];
let getData = new Getdata();
let create = new Create();
let importData = {};
let SLiderShadoeEnable="ShowSliderShadow";
if(!data.config.toggleEnableShadow){
    SLiderShadoeEnable="";
}
let ButtonLayout='slideTwo-dots';
if(btnDotLayout==='lines'){
    ButtonLayout='slideTwo-dots';
}
else if(btnDotLayout==='dots'){
    ButtonLayout='slideTwo-dotsl2';
}
else if(btnDotLayout==='squares'){
    ButtonLayout='slideTwo-dotsl3';
}
let siteId = (data.config.siteId && data.config.siteId !== "") ? data.config.siteId: data.siteId;

let adaptive = data.device == "mobile" ? true : data.config.adaptive;

let imgPos = data.config.imgPos;
let showDate = data.config.showDate;

function pagination(obj){
    let limitarr;
    if(typeof obj !== "undefined"){
        let filterTags = obj.filter(i=>{
            return selectedTags.split(",").some(j=>{
                if(!i.tags) return false;
                return i.tags.toLowerCase().includes(j.toLowerCase());
            });
        });

        if(showAllTestimonials){
            limitarr = obj
        }else{
            limitarr = filterTags.filter((val,ind)=>{
                let objNum = ind + 1;
                if(objNum <= testimonialNumber) return val;
            });
        }
    }

    if(!limitarr){
        limitarr = []
    }

    $(element).find('.shmTestimonialPanelMain').pagination({
        dataSource: limitarr,
        pageSize:pageSize,
        callback: function(data, pagination) {
            if(data.length == 0){
                if(!noTestimonialShow){
                    $(element).find('.shmTestimonialPanelMain').addClass("shmTestimonialPanelMainHide");
                }
            }
            let createProperties = data.length !== 0 ? create.structure(data):`${noTestimonial}`;
            $(element).find('.shmHoriTest').html(createProperties);
            data.length % 3 != 2 ? null:$(element).find('.shmHoriTest').append(`<div class="shmHoriTest-wrap testiFiller"></div>`);
            if(!showAllTestimonials){
                ( obj.length <= pageSize || testimonialNumber <= pageSize) ? $(element).find(".paginationjs").hide():"";
            }
        }
    });
}

var FLUID_MIN_CARD = 470;
var FLUID_SINGLE_CARD_MAX = 720;
var FLUID_GAP = 20;
var FLUID_FALLBACK_COLUMNS = 2;

function fluidColumns(){
    var maxColumns = parseInt(data.config.slidesToShow) > 0 ? parseInt(data.config.slidesToShow) : FLUID_FALLBACK_COLUMNS;
    var width = $(element).width();
    if (!width) return maxColumns;
    return Math.max(1, Math.min(maxColumns, Math.floor(width / FLUID_MIN_CARD)));
}

function setImportant(el, props){
    Object.keys(props).forEach(function(name){
        el.style.setProperty(name, props[name], 'important');
    });
}

// Site CSS pins slide and card widths and margins with !important, and collapses every
// .slick-slider to one visible slide below 1025px. Inline !important outranks the pins; the
// shm-fluid-slider and main-review-slider-container classes opt this slider out of the
// collapse (the site rules exclude the latter with :not()). A slide is either the card itself
// or a wrapper around it, depending on how Slick was handed the markup. Clones count too.
function fluidSlides(slick){
    var gap = FLUID_GAP;
    var single = slick.options.slidesToShow === 1;
    var slot = slick.slideWidth;
    var cardWidth = Math.max(0, Math.min(slot - gap, single ? FLUID_SINGLE_CARD_MAX : slot - gap));
    var side = Math.max(0, Math.floor((slot - cardWidth) / 2));
    slick.$slideTrack.children('.slick-slide').each(function(){
        var isCard = this.classList.contains('shmTestimonial-comments');
        if (isCard) {
            setImportant(this, { 'width': cardWidth + 'px', 'max-width': 'none', 'margin-left': side + 'px', 'margin-right': side + 'px', 'box-sizing': 'border-box' });
            return;
        }
        setImportant(this, { 'width': slot + 'px', 'max-width': 'none', 'margin-left': '0', 'margin-right': '0' });
        var holder = this.firstElementChild;
        if (holder) setImportant(holder, { 'padding-left': side + 'px', 'padding-right': side + 'px', 'box-sizing': 'border-box' });
        var card = this.querySelector('.shmTestimonial-comments');
        if (card) setImportant(card, { 'width': '100%', 'max-width': 'none', 'margin-left': '0', 'margin-right': '0', 'display': 'block', 'box-sizing': 'border-box' });
    });
}

// Duda gives the widget's wrapper a fixed pixel height. Follow the real content so
// the section grows with it and nothing placed below overlaps.
function growWrapper(){
    var wrapper = element.closest ? element.closest('.widget-wrapper') : null;
    if (!wrapper) return;
    wrapper.style.setProperty('height', 'auto', 'important');
    // Ancestor groups can still squeeze the wrapper, so also floor it at the content height.
    wrapper.style.setProperty('min-height', Math.ceil(element.scrollHeight) + 'px', 'important');
}

function slider(){

    $(element).find(".shmTestimonial").addClass('shm-fluid-slider main-review-slider-container').slick({
        dots: dotsPagination,
        dotsClass: ButtonLayout,
        slidesToShow: fluidColumns(),
        speed: parseFloat(data.config.ScrollSpeed)*1000,
        pauseOnHover:data.config.PauseOnHover,
        centerMode: false,
        infinite: infinite,
        arrows: arrows,
        adaptiveHeight:adaptive,
        autoplay: autoplay,
        prevArrow: '<i class="fas fa-chevron-left slick-prev"></i>',
        nextArrow: '<i class="fas fa-chevron-right slick-next"></i>',
    }).on('setPosition', function (event, slick) {
        fluidSlides(slick);
        if(!adaptive){
            slick.$slides.css('height', slick.$slideTrack.height() + 'px');
        }else{
            let newHeight = [];
            $(element).find('.slick-active>div').each(function(){
                newHeight.push($(this).outerHeight());
            });
            slick.$list.css('height',$(element).find('.slick-current>div').outerHeight() + 'px');

        }
        growWrapper();
    });
    $(element).find(".slick-list").css('height',$(element).find('.slick-current>div').outerHeight() + 'px');
    $(element).find(".shmTestimonial-comments").addClass("shmTestimonial-commentsSlider");
}

function refitSlider(){
    var track = $(element).find('.shmTestimonial');
    if (!track.hasClass('slick-initialized')) return;
    var columns = fluidColumns();
    if (track.slick('slickGetOption', 'slidesToShow') !== columns) {
        track.slick('slickSetOption', 'slidesToShow', columns, true);
    } else {
        track.slick('setPosition');
    }
}

if (typeof ResizeObserver !== 'undefined') {
    if (element.__shmTestimonialsObserver) element.__shmTestimonialsObserver.disconnect();
    element.__shmTestimonialsObserver = new ResizeObserver(function(){ refitSlider(); });
    element.__shmTestimonialsObserver.observe(element);
}

let ReadMoreArray=[];

function Create(){
    this.structure = (obj)=>{
        let output = '';
        let dateFormatter = Intl.DateTimeFormat(navigator.language, { day: "numeric", month: "numeric", year: "numeric" });

        obj.map(i=>{
            let image = i.photoURL ? i.photoURL : "https://shazamme.io/Job-Listing/src/img/profile-placeholder-male.png";
            let content = i.content ? i.content :"";
            let who = i.who ? i.who :"Anonymous";
            let date = new Date(i.testimonialDate || undefined);
            let ddate = isNaN(date.getTime()) ? "" : dateFormatter.format(date);
            let description = i.content ? i.content :"";
            let PresentConsultant=i.consultantID?i.consultantID:"";

            let castShortDescription = description;
            let ReadMoreHTML='';
            if(DescriptionLength<castShortDescription.length){
                ReadMoreHTML='<div class="clsReadMoreTest" id="readmoretesti'+ReadMoreArray.length+'">Read more</div>'
                ReadMoreArray.push(castShortDescription);
                var yourString = castShortDescription;
                var maxLength = DescriptionLength;
                var trimmedString = removehtmlfromstring(yourString).substr(0, maxLength);
                trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
                castShortDescription=trimmedString+'...';
            }

            let ConsultantImage="";
            let ConsultantName="";
            var ConsultArrays=ConsultantArray;
            ConsultArrays = ConsultArrays.filter(function(value, index, arr){
                return (value.data.consultantID)===PresentConsultant;
            });
            if(ConsultArrays.length>0){
                if(ConsultArrays[0].data.photoURL!==""&&ConsultArrays[0].data.photoURL!==null&&ConsultArrays[0].data.photoURL!==undefined)
                    ConsultantImage='<img class="imgTestConsultant" src="'+ConsultArrays[0].data.photoURL+'" style="object-fit:cover;width: 70px;height: 70px;border-radius: 50px;"/>';
                ConsultantName='<div class="clsTestConsultant">'+ConsultArrays[0].data.firstName+' '+ConsultArrays[0].data.lastName+'</div>';
            }
            let testimonialName = i.testimonialName ? i.testimonialName :"";
            var QuoteImageString='<img class="clsQuoteImage" src="'+data.config.QuoteImage+'" style="top:-5%;left:5%;position:absolute;width:50px;height:50px;" />';
            if(data.config.QuoteImage===""||data.config.QuoteImage===null||data.config.QuoteImage===undefined)
                QuoteImageString='';
            let ConsultantString='';
            if(data.config.toggleShowConsultant){
                ConsultantString+=`
                <div class="clsTestConsultant" style="display:flex;">
                    <div class="clsImgTestConsultantDIV" style="width:30%;">
                        ${ConsultantImage}
                    </div>
                    <div class="clsNameTestConsultantDIV" style="width:70%;margin:auto;text-align:center;">
                        ${ConsultantName}
                    </div>
                </div>`
            }

            let PositionString='';
            if(data.config.toggleShowPosition && i.position && i.position.length > 0){
                PositionString+=`
                <div class="clsTestPosition" style="display:flex;">
                    <div class="clsNameTestPositionDIV" style="width:70%;margin:auto;text-align:center;">
                        ${i.position}
                    </div>
                </div>`
            }
            let CompanyString='';
            if(data.config.toggleShowCompany && i.company && i.company.length > 0){
                CompanyString+=`
                <div class="clsTestCompany" style="display:flex;">
                    <div class="clsNameTestCompanyDIV" style="width:70%;margin:auto;text-align:center;">
                        ${i.company}
                    </div>
                </div>`
            }

            if(layout !== "list"){
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
                    </div>`
            }else{
                output += `
                    <div class="shmHoriTest-wrap ${enableShadow ? '':'shmHoriTest-wrap-noShadow'}" style="position:relative;">
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
                    </div>`
            }
        });

        if(layout !== "list" && output == ""){
            if(noTestimonialShow){
                output = noTestimonial;
            }else{
                output = "";
            }
        }
        return output;
    };
    this.filterStructure = (obj,key) =>{
        let output = '';
        obj.map(i=>{
            if(!i[key] || typeof i[key] === "undefined") return;

            let textValue = key == "category" ? i[key]:`${i.firstName} ${i.lastName}`;
            output += `
                <option value="${key == "category" ? i.jobID:i[key]}">${textValue}</option>
            `;
        });
        return output;
    };
}



function Getdata() {
    this.collection = (collection) => {
        return collection.map(i => {
            let item = {};
            item.page_item_url = consultantPage+'/'+i.page_item_url;

            Object.keys(i.data).filter(j => {
                item[removeSpecial(j)] = this.removeExtra(i.data[j]);
            });
            return item;
        });
    };
    this.category = (arr, category) => {
        return this.removeduplicate(arr, category).map(i => {
            return i[category];
        });
    };
    this.removeduplicate = (array, key) => {
        return array.reduce(function (arr, item) {
            const removed = arr.filter(function (i) {
                return i[key] !== item[key];
            });
            return [...removed, item];
        }, []);
    };
    this.multifilter = (arr, filters) => {
      const filterKeys = Object.keys(filters);
        return arr.filter(function(eachObj){
            return filterKeys.every(function(eachKey){
                if (!filters[eachKey].length) {
                    return true;
                }
                return filters[eachKey].includes(eachObj[eachKey]);
            });
        });
    };
    this.urlparam = (name, url) => {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };
    this.removeExtra = (str) => {
        let fullText = '';
        if (typeof str !== "undefined") {
            if (!isNaN(str) ||!str.includes("</p>")) {
                fullText = str;
            } else {
                fullText = str.substring(str.indexOf(">") + 1).replace("</p>", '');
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
            return obj.filter(i => {
                return (i.salaryFrom >= min && i.salaryFrom <= max) || (i.salaryTo >= min && i.salaryTo <= max);
            });
        }
    };

    function removeSpecial(str){
        let pattern = str.replace(/[^A-Z0-9]/ig, ``);
        return pattern;
    }
}

// Load a script only once — never remove and re-add if already present
function loadScript(d,s,id,url,callback){
    if(d.getElementById(id)){
        callback();
        return;
    }
    var fjs = d.getElementsByTagName(s)[0];
    var script = d.createElement(s);
    script.id = id;
    script.src = url;
    fjs.parentNode.insertBefore(script,fjs);

    if(script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    }else{  //Others
        script.onload = function(){
            callback();
        };
    }
}

// Inject Font Awesome once
if (!document.getElementById('fontAwesomeSource')) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id   = 'fontAwesomeSource';
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://use.fontawesome.com/releases/v5.5.0/css/all.css';
    link.integrity = 'sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU';
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
}

// Inject Pagination CSS once
if (!document.getElementById('paginationCss')) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id   = 'paginationCss';
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/paginationjs/2.1.4/pagination.css';
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
}

if (ReadMoreClosespan) {
    ReadMoreClosespan.onclick = function() {
        ReadMoreOpenmodal.style.display = "none";
    }
}
function OpenModel(){
    ReadMoreOpenmodal.style.display = "block";
}
function removehtmlfromstring(stringhtml){
    var html = stringhtml;
    var div = document.createElement("div");
    div.innerHTML = html;
    var text = div.textContent || div.innerText || "";
    return text;
}

// Start loading Slick or Pagination library immediately — in parallel with SDK load
if(layout == 'slider'){
    loadScript(document, 'script', 'slickJS', 'https://irt-cdn.multiscreensite.com/5775367238d847b8b62d126ce25c20de/files/uploaded/slick-latest.js', function(){});
}else{
    loadScript(document, "script", "paginationJS", "https://irt-cdn.multiscreensite.com/8914113fe39e47bcb3040f2b64f71b02/files/uploaded/paginates.min.js", function(){});
}

let main = (w) => {
    // Show editor helper
    if(data.inEditor) {
        shazamme.site().then( s => {
            $(element)
                .find('.JSBEditorDiv')
                .html(`
                    <span class="vinylbuttonlinl" style="float:right;">
                        To edit the data connected to this widget - PLEASE DOUBLE CLICK HERE
                    </span>
                `)
                .on('click', '.vinylbuttonlinl', function() {
                    window.open(`${data.config.txt_ShazammeConsole}SiteID=${s.siteID}`);
                });
        });
    }

    // Build all fetch promises in parallel
    let fetchPromises = [
        shazamme.fetch({ name: consultantCollection }),
        shazamme.fetch({ name: testimonialCollection }),
    ];

    // Only fetch jobs data if the jobs filter is actually enabled
    if(showJobsFilter){
        fetchPromises.push(shazamme.site().then( s =>
            shazamme.fetch({
                path: `/job-results/${s.siteID}`,
                useCache: true,
                isExternal: true,
            })
        ));
    }

    Promise.all(fetchPromises).then( r => {
        importData.consultants = ConsultantArray = r[0];

        let resp = getData
            .collection(r[1])
            .filter(i => (consultantID !== "" && consultantID) ? i.consultantID == consultantID : i)
            .sort( (a, b) => new Date(a.testimonialDate) > new Date(b.testimonialDate) ? -1 : new Date(a.testimonialDate) < new Date(b.testimonialDate) ? 1 : 0);

        // Apply the total testimonials cap if enabled
        if(limitTestimonials){
            resp = resp.slice(0, maxTestimonials);
        }

        // Populate filters now that we have all data
        if(showConsultantFilter){
            let consultantArr = getData.removeduplicate(importData.consultants, "consultantID");
            let consultantFilter = create.filterStructure(consultantArr, 'consultantID');
            $(element).find(".shmTestimonialFilterConsultant").html(`<option value="">All Consultants</option>${consultantFilter}`);
        }

        if(showJobsFilter && r[2]){
            importData.jobs = getData.collection(r[2]);
            let jobsArr = getData.removeduplicate(importData.jobs, 'category');
            let jobsFilter = create.filterStructure(jobsArr, 'category');
            $(element).find(".shmTestimonialFilterJobs").html(`<option value="">All Jobs</option>${jobsFilter}`);
        }

        if(consultantID){
            $(element).find(".shmTestimonialFilterJobs,.shmTestimonialFilterConsultant").hide();
        }

        if(layout !== "slider"){
            pagination(resp);
        }else{
            if(adaptive){
                $(element).find('.shmTestimonialPanel').addClass("shmTestimonialPanelAdaptive");
            }
            let filterTags = resp.filter(i=>{
                return selectedTags.split(",").some(j=>{
                    if(!i.tags) return false;
                    return i.tags.toLowerCase().includes(j.toLowerCase());
                });
            });
            let testimonials = showAllTestimonials ? resp : filterTags;

            let sliderStructure = create.structure(testimonials);
            if(sliderStructure == ""){
                $(element).find('.shmTestimonialPanelMain').addClass("shmTestimonialPanelMainHide");
                return;
            }

            $(element).find(".shmTestimonial").html(sliderStructure);

            // Wait for Slick to be ready before initialising
            function initSlider(){
                if(typeof $.fn.slick !== 'undefined'){
                    if(!sliderStructure.includes("testimonials yet")){
                        slider();
                    }
                    let clsReadMoreTest=$(element).find('.clsReadMoreTest');
                    clsReadMoreTest.click(function(){
                        var ClickedID=$(this).attr('id').replace('readmoretesti','');
                        var FullDescription=ReadMoreArray[ClickedID];
                        OpenModel();
                        clsRDMRDECSID.html('');
                        clsRDMRDECSID.html(FullDescription);
                    });
                }else{
                    setTimeout(initSlider, 50);
                }
            }
            initSlider();
        }

        importData.testimonials = resp;
    });

    $(element).find(".shmTestimonialFilterConsultant").change(function(){
        let value = $(this).val();
        let jobVal = showJobsFilter ? $(element).find(".shmTestimonialFilterJobs").val():"";
        let filter = {
            consultantID:value,
            jobID:jobVal
        }

        let filtered = getData.multifilter(importData.testimonials,filter);
        pagination(filtered);
    });

    $(element).find(".shmTestimonialFilterJobs").change(function(){
        let value = $(this).val();
        let consultantVal = showConsultantFilter ? $(element).find(".shmTestimonialFilterConsultant").val():"";
        let filter = {
            consultantID:consultantVal,
            jobID:value
        }

        let filtered = getData.multifilter(importData.testimonials,filter);
        pagination(filtered);
    });
}

$.getScript(
    'https://sdk.shazamme.io/js/shazamme-1.0.3.min.js',

    function() {
        shazamme.ready(data.siteId, data.page).then( () => {
            main(shazamme.register('testimonials', data));
        });
    }
);
