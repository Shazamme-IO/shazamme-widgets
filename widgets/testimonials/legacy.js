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
        setImportant(this, { 'width': slot + 'px', 'max-width': 'none', 'margin-left': '0', 'margin-right': '0', 'padding-left': side + 'px', 'padding-right': side + 'px', 'box-sizing': 'border-box', 'height': 'auto', 'display': 'flex', 'align-items': 'flex-start' });
        var card = this.querySelector('.shmTestimonial-comments');
        if (!card) return;
        // Holders are plain blocks that follow their content: a flex holder would stretch or
        // squash the card to the Design tab container height, and a holder pinned at that px
        // height would hide a longer card behind it. The outer holder (.slick-slide > div)
        // carries that px height from the site CSS; floorHeight() reads it as the floor, the
        // card gets it as a min-height, and the holder grows with the card so Slick's own
        // adaptive height (which measures the slide) agrees with the list size set here.
        for (var holder = card.parentElement; holder && holder !== this; holder = holder.parentElement) {
            setImportant(holder, { 'width': '100%', 'padding-left': '0', 'padding-right': '0', 'margin-left': '0', 'margin-right': '0', 'box-sizing': 'border-box', 'display': 'block', 'height': 'auto' });
        }
        // Site CSS pins a 415px min-height on the card; the card should fit its text.
        // fitHeights() then equalises the cards that are on screen together and applies the floor.
        setImportant(card, { 'width': '100%', 'max-width': 'none', 'margin-left': '0', 'margin-right': '0', 'display': 'block', 'box-sizing': 'border-box', 'min-height': '0', 'height': 'auto' });
    });
}

// Slick is handed the cards as direct children on some loads and wrapped on others. Always wrap
// them, so every slide is a full-slot box with the card inside it and the gap is padding.
function wrapCards(slider){
    slider.children('.shmTestimonial-comments').each(function(){
        $(this).wrap('<div class="shm-slide"></div>');
    });
}

// Slides are found by Slick's own index (clones carry one too), so the window is right when the
// slider is about to wrap.
// The Design tab "Testimonials Container Height" is a px height the site CSS puts on
// .slick-slide > div. With the card hidden, and the inline height:auto this widget puts on the
// holder lifted for the measurement, the holder shows that height alone (0 when none is set),
// so this reads the floor without parsing stylesheets. One slide is enough: the setting is the
// same for every slide. Everything touched is put back exactly as it was.
function saveInline(el, props){
    return props.map(function(prop){ return { el: el, prop: prop, value: el.style.getPropertyValue(prop), priority: el.style.getPropertyPriority(prop) }; });
}

function restoreInline(saved){
    for (var i = 0; i < saved.length; i++) {
        if (saved[i].value) saved[i].el.style.setProperty(saved[i].prop, saved[i].value, saved[i].priority);
        else saved[i].el.style.removeProperty(saved[i].prop);
    }
}

function floorHeight(slide){
    var holder = slide && slide.firstElementChild;
    var card = slide && slide.querySelector('.shmTestimonial-comments');
    if (!holder || !card) return 0;
    var saved = saveInline(card, ['display']).concat(saveInline(holder, ['height', 'min-height']));
    try {
        holder.style.removeProperty('height');
        holder.style.removeProperty('min-height');
        card.style.setProperty('display', 'none', 'important');
        return Math.ceil(holder.getBoundingClientRect().height);
    } finally {
        restoreInline(saved);
    }
}

// The cards Slick shows for window `first`: found by Slick's own index (clones carry one too),
// so the window is right when the slider is about to wrap.
function windowCards(slick, first){
    var visible = slick.options.slidesToShow;
    var out = [];
    for (var i = first; i < first + visible; i++) {
        var slide = slick.$slideTrack.children('[data-slick-index="' + i + '"]')[0];
        var card = slide && slide.querySelector('.shmTestimonial-comments');
        if (card) out.push({ slide: slide, card: card });
    }
    return out;
}

// The height the cards on screen together need: the tallest of their texts, or the Design tab
// container height when that is taller. The floor is read once, after the cards, so hiding a
// card forces one extra layout, not two.
function visibleHeight(slick, cards){
    var tallest = 0;
    for (var i = 0; i < cards.length; i++) tallest = Math.max(tallest, Math.ceil(cards[i].card.getBoundingClientRect().height));
    return Math.max(tallest, floorHeight(cards.length ? cards[0].slide : null));
}

// Fixed height mode: every card gets the visible height as a floor, so the cards on screen
// together match and a long testimonial always gets its full card.
function fitHeights(slick, first){
    var cards = slick.$slideTrack.find('.shmTestimonial-comments');
    cards.each(function(){ setImportant(this, { 'min-height': '0' }); });
    var shown = windowCards(slick, first);
    var tallest = visibleHeight(slick, shown);
    if (!tallest) return;
    cards.each(function(){ setImportant(this, { 'min-height': tallest + 'px' }); });
    sizeList(slick, shown);
}

// The list ends where the lowest card on screen ends. Measured from the card's real bottom, so
// a card that sits below the top of the list (list padding, a slide padding, a card margin) is
// never cut off. The list's own bottom padding and border are added when the box model counts
// them inside, and the top padding and border taken off when it does not.
function sizeList(slick, shown){
    var list = slick.$list[0];
    var listTop = list.getBoundingClientRect().top;
    var bottom = 0;
    for (var i = 0; i < shown.length; i++) bottom = Math.max(bottom, shown[i].card.getBoundingClientRect().bottom - listTop);
    if (!bottom) return;
    var listStyle = getComputedStyle(list);
    var px = function(v){ return parseFloat(v) || 0; };
    var extra = listStyle.boxSizing === 'border-box'
        ? px(listStyle.paddingBottom) + px(listStyle.borderBottomWidth)
        : -(px(listStyle.paddingTop) + px(listStyle.borderTopWidth));
    setImportant(list, { 'height': Math.ceil(bottom + extra) + 'px' });
}

// Adaptive height (every phone, and desktop when the config says so): the list follows the
// cards on screen, never shorter than their text or the container height, so a long testimonial
// is not cut off at the Design tab height. Called from beforeChange with the next index as
// well, so the list is already the right size when Slick starts the slide.
function fitAdaptive(slick, first){
    // Clear every card first: a floor left over from an earlier window or a wider layout would
    // be measured as text height and the list could only ever grow.
    slick.$slideTrack.find('.shmTestimonial-comments').each(function(){ setImportant(this, { 'min-height': '0' }); });
    var shown = windowCards(slick, first);
    var floor = visibleHeight(slick, shown);
    for (var i = 0; i < shown.length; i++) setImportant(shown[i].card, { 'min-height': floor + 'px' });
    sizeList(slick, shown);
}

// The widget CSS tab draws the slider dots with font glyphs (— ○ ● □ ■) in a ::before box, so
// what a visitor sees depends on which font their browser falls back to, and a Design tab
// background colour on the glyph box paints a rectangle behind the glyph (the "outline" around
// each dot). Draw the dots as CSS shapes instead. Colour, size and spacing still come from the
// cascade: the shape is sized in em of the glyph rule's font-size, drawn in its currentColor,
// and the li margins are untouched. One style element per page, appended last so it wins
// source order against the widget CSS at equal specificity.
//
// Every rule is scoped to ul.shm-dots-shaped, which shapeDots() adds only where a glyph is
// actually showing. A site that hides its dots (font-size 0 on the glyph, display none) or
// draws its own keeps exactly what it had: enterprise.co.nz hides them with font-size 0.
var DOTS_SHAPED_CLASS = 'shm-dots-shaped';
var DOT_GLYPHS = /[\u2014\u25CB\u25CF\u25A1\u25A0]/;

function isHidden(el){
    var cs = getComputedStyle(el);
    return cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0;
}

// A glyph in a fully transparent colour is not showing either: a site that draws its dots with
// the button's own background or border and hides the glyph with color:transparent keeps them.
function isTransparent(color){
    if (!color || color === 'transparent') return true;
    var m = /^rgba?\(([^)]*)\)$/.exec(color);
    if (!m) return false;
    var parts = m[1].split(/\s*[,\/]\s*|\s+/).filter(Boolean);
    return parts.length === 4 && parseFloat(parts[3]) === 0;
}

function dotsShowGlyph(ul){
    var btn = ul.querySelector('li button');
    if (!btn) return false;
    if (isHidden(ul) || isHidden(btn)) return false;
    var before = getComputedStyle(btn, '::before');
    return DOT_GLYPHS.test(before.content || '') && parseFloat(before.fontSize) > 0 && before.visibility !== 'hidden' && parseFloat(before.opacity) !== 0 && !isTransparent(before.color);
}

// Runs after init, on every reInit (Slick rebuilds the list) and on every refit (a widget that
// initialised inside a hidden section reads no glyph until the section is shown).
function shapeDots(){
    var lists = element.querySelectorAll('ul[class*="slideTwo-dots"]');
    for (var i = 0; i < lists.length; i++) {
        lists[i].classList.remove(DOTS_SHAPED_CLASS);
        if (dotsShowGlyph(lists[i])) lists[i].classList.add(DOTS_SHAPED_CLASS);
    }
}

var DOTS_STYLE_ID = 'shm-testimonials-dots-style';
var DOTS_STYLE = [
    // The button keeps exactly the width, height and spacing the cascade gave it with the
    // glyph (the CSS tab sets none, so it is near zero wide and the glyph overflowed it), so a
    // row of 34 dots takes the room it always took; a fixed 24px button wrapped NGO's dots
    // onto two rows. The shape is centred on the button and overflows it the same way.
    '.shmTestimonial ul.shm-dots-shaped li button{position:relative!important;padding:0!important;border:0!important;background:transparent!important;text-indent:-9999px!important;overflow:visible!important;cursor:pointer}',
    // The shape is all border and padding round a 0x0 content box, and the background is
    // clipped to that content box: a Design tab background-color on the old glyph box (which
    // outranks these rules by specificity) can no longer paint anything. Only a site rule that
    // writes the `background` shorthand would reset the clip. The fill is an inset shadow,
    // which paints over the padding. The shape is centred on the button and never clipped by
    // it, so a large Design tab font-size still shows the whole shape.
    '.shmTestimonial ul.shm-dots-shaped li button::before{content:""!important;position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;box-sizing:content-box!important;width:0!important;height:0!important;padding:.2em!important;line-height:0!important;text-indent:0!important;border:2px solid currentColor!important;border-radius:0!important;background-color:transparent!important;background-image:none!important;background-clip:content-box!important;opacity:1}',
    '.shmTestimonial ul.shm-dots-shaped.slideTwo-dotsl2 li button::before{border-radius:50%!important}',
    '.shmTestimonial ul.shm-dots-shaped.slideTwo-dots li button::before{padding:.06em .4em!important;border:0!important;box-shadow:inset 0 0 0 1em currentColor!important;opacity:.5}',
    '.shmTestimonial ul.shm-dots-shaped li.slick-active button::before{box-shadow:inset 0 0 0 1em currentColor!important;opacity:1}',
    // A 24px hit area and focus ring, out of flow so the row keeps its pitch: the button itself
    // is near zero wide and the dash shape is only a couple of px tall.
    '.shmTestimonial ul.shm-dots-shaped li button::after{content:""!important;position:absolute!important;top:50%!important;left:50%!important;width:24px!important;height:24px!important;transform:translate(-50%,-50%)!important;background:transparent!important;border:0!important}',
    '.shmTestimonial ul.shm-dots-shaped li button:focus-visible{outline:none!important}',
    '.shmTestimonial ul.shm-dots-shaped li button:focus-visible::after{outline:2px solid currentColor!important;outline-offset:2px!important}'
].join('');

function ensureDotsStyle(){
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head || document.getElementById(DOTS_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = DOTS_STYLE_ID;
    style.textContent = DOTS_STYLE;
    head.appendChild(style);
}

// Duda gives the widget's wrapper a fixed pixel height. Follow the real content so
// the section grows with it and nothing placed below overlaps.
function growWrapper(){
    var wrapper = element.closest ? element.closest('.widget-wrapper') : null;
    if (!wrapper) return;
    wrapper.style.setProperty('height', 'auto', 'important');
    // Ancestor groups can still squeeze the wrapper, so also floor it at the content height.
    // Clear the old floor first so the wrapper shrinks again when the content does.
    wrapper.style.setProperty('min-height', '0px', 'important');
    var panel = element.querySelector('.shmTestimonialPanelMain') || element;
    var contentHeight = panel.getBoundingClientRect().bottom - element.getBoundingClientRect().top;
    wrapper.style.setProperty('min-height', Math.ceil(contentHeight) + 'px', 'important');
}

function slider(){

    ensureDotsStyle();
    wrapCards($(element).find(".shmTestimonial"));
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
    }).on('beforeChange', function (event, slick, current, next) {
        if(!adaptive) fitHeights(slick, next);
        else fitAdaptive(slick, next);
        growWrapper();
    }).on('setPosition', function (event, slick) {
        fluidSlides(slick);
        setImportant(slick.$slideTrack[0], { 'display': 'flex', 'align-items': 'flex-start' });
        if(!adaptive){
            fitHeights(slick, slick.currentSlide);
        }else{
            fitAdaptive(slick, slick.currentSlide);
        }
        growWrapper();
    });
    $(element).find(".shmTestimonial-comments").addClass("shmTestimonial-commentsSlider");
    $(element).find(".shmTestimonial").off('reInit.shmDots').on('reInit.shmDots', shapeDots);
    shapeDots();
    watchSlider();
}

// A resize while the track is mid-animation leaves its CSS transition running towards the old
// slot, so the card comes to rest off position. Drop the transition and snap to the current slide.
function settleSlider(track){
    var slick = track.slick('getSlick');
    slick.disableTransition();
    slick.animating = false;
    track.slick('slickGoTo', slick.currentSlide, true);
    track.slick('setPosition');
}

var REFIT_SETTLE_MS = 400;
var refitTimer;

function refitSlider(){
    var track = $(element).find('.shmTestimonial');
    if (!track.hasClass('slick-initialized')) return;
    if (autoplay) track.slick('slickPause');
    var columns = fluidColumns();
    if (track.slick('slickGetOption', 'slidesToShow') !== columns) {
        track.slick('slickSetOption', 'slidesToShow', columns, true);
    } else {
        track.slick('setPosition');
    }
    settleSlider(track);
    shapeDots();
    clearTimeout(refitTimer);
    refitTimer = setTimeout(function(){
        settleSlider(track);
        if (autoplay) track.slick('slickPlay');
    }, REFIT_SETTLE_MS);
}

if (typeof ResizeObserver !== 'undefined') {
    if (element.__shmTestimonialsObserver) element.__shmTestimonialsObserver.disconnect();
    element.__shmTestimonialsObserver = new ResizeObserver(function(){ refitSlider(); });
    element.__shmTestimonialsObserver.observe(element);
}

// The slider's own box can change without the widget's width changing (late fonts, section
// reveal), which strands the slides at the width Slick measured at init. Watch it too.
var LATE_REFIT_MS = 800;

function watchSlider(){
    $(element).find('.shmTestimonial').each(function(){
        if (typeof ResizeObserver !== 'undefined' && element.__shmTestimonialsObserver) element.__shmTestimonialsObserver.observe(this);
    });
    setTimeout(refitSlider, LATE_REFIT_MS);
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
                castShortDescription=escapeHtmlText(trimmedString)+'...';
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
        name = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
function escapeHtmlText(text){
    return String(text).replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
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
