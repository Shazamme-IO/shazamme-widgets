cssLibrary('slickCSSTheme', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.css');
cssLibrary('slickCSS', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.css');

let $widgetElement = $(element).find('.main-review-slider-container');
let slidestoshow = parseInt(data.config.slidestoshow ? data.config.slidestoshow : 5);
let speed = data.config.speed;

// Logos per view come from the strip's own width, never below MIN_LOGO_SLOT wide, so phones
// show 2 or 3 readable logos instead of six slivers (AS-9, AS-19).
var MIN_LOGO_SLOT = 110;
var MIN_PER_VIEW = 2;
var FADE_EDGE = 20;
var LOGO_VIEW_CLASS = 'shm-logo-slider';

function perView() {
    var width = $(element).width();
    if (!width) return Math.max(MIN_PER_VIEW, slidestoshow);
    return Math.max(MIN_PER_VIEW, Math.min(slidestoshow, Math.floor(width / MIN_LOGO_SLOT)));
}

// A marquee always has a logo crossing each edge. Fade the edges so a passing logo dissolves
// instead of being cut off by the widget box.
function injectStyle() {
    if (document.getElementById('shm-logo-slider-style')) return;
    var style = document.createElement('style');
    style.id = 'shm-logo-slider-style';
    var mask = 'linear-gradient(90deg, transparent 0, #000 ' + FADE_EDGE + 'px, #000 calc(100% - ' + FADE_EDGE + 'px), transparent 100%)';
    style.textContent = '.' + LOGO_VIEW_CLASS + ' .slick-list{-webkit-mask-image:' + mask + ';mask-image:' + mask + ';}'
        + '.' + LOGO_VIEW_CLASS + ' .slick-slide{height:auto !important;}';
    document.head.appendChild(style);
}

// Duda gives the widget's wrapper a fixed pixel height. Follow the strip so no empty band is left under it.
function growWrapper() {
    var wrapper = element.closest ? element.closest('.widget-wrapper') : null;
    if (!wrapper) return;
    wrapper.style.setProperty('height', 'auto', 'important');
    wrapper.style.setProperty('min-height', '0px', 'important');
}

function refit() {
    var strip = $(element).find('.main-review-slider-container');
    if (!strip.hasClass('slick-initialized')) return;
    var columns = perView();
    if (strip.slick('slickGetOption', 'slidesToShow') !== columns) {
        strip.slick('slickSetOption', 'slidesToShow', columns, true);
    }
    growWrapper();
}

injectStyle();
$(element).addClass(LOGO_VIEW_CLASS);

dmAPI.loadScript('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js', function () {

    $(element).find('.slider-loader').hide();
    $widgetElement.fadeIn();

    $(element).find('.main-review-slider-container').slick({
        slidesToShow: perView(),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: speed,
        pauseOnHover: false,
        cssEase: 'linear',
    });

    growWrapper();

    if (typeof ResizeObserver !== 'undefined') {
        if (element.__shmLogoSliderObserver) element.__shmLogoSliderObserver.disconnect();
        element.__shmLogoSliderObserver = new ResizeObserver(function () { refit(); });
        element.__shmLogoSliderObserver.observe(element);
    }
});

function cssLibrary(id, href) {
    if (!document.getElementById(id)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
    }
}
