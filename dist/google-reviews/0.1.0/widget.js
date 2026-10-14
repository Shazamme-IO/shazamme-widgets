/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 6aa1d43b7d64. Registers window.ShazammeWidget["<name>"].
 */
(function(){
  if (typeof document === 'undefined') return;
  if (document.getElementById("shm-css-google-reviews")) return;
  var s = document.createElement('style');
  s.id = "shm-css-google-reviews";
  s.textContent = "/* google-reviews — Elfsight-equivalent Google Reviews widget.\n   Every colour/size comes from a custom property set on .es-embed-root from the\n   widget's theme settings (index.ts themeVars); the fallbacks here are the\n   Elfsight light-theme defaults. Class names mirror Elfsight's es-* hooks. */\n\n.es-embed-root {\n  --es-font: inherit;\n  --es-review-bg: rgba(248, 248, 248, 1);\n  --es-review-outline: rgba(17, 17, 17, 0.1);\n  --es-review-text: rgba(17, 17, 17, 1);\n  --es-read-more: rgba(0, 109, 255, 1);\n  --es-verified: rgba(0, 109, 255, 1);\n  --es-source-name: rgba(0, 109, 255, 1);\n  --es-review-radius: 8px;\n  --es-review-font-size: 16px;\n  --es-star-size: 20px;\n  --es-rating: rgba(252, 191, 2, 1);\n  --es-header-bg: transparent;\n  --es-header-text: rgba(17, 17, 17, 1);\n  --es-header-radius: 8px;\n  --es-btn-bg: rgba(0, 109, 255, 1);\n  --es-btn-text: #fff;\n  --es-btn-radius: 24px;\n  --es-arrow-bg: rgba(17, 17, 17, 0.5);\n  --es-arrow-color: #fff;\n  --es-arrow-bg-hover: rgba(17, 17, 17, 0.7);\n  --es-arrow-color-hover: #fff;\n  --es-arrow-size: 32px;\n  --es-dot: rgba(17, 17, 17, 1);\n  --es-popup-bg: #fff;\n  --es-popup-text: rgba(17, 17, 17, 1);\n  --es-popup-rating: rgba(252, 191, 2, 1);\n  --es-popup-read-more: rgba(0, 109, 255, 1);\n  --es-badge-bg: #fff;\n  --es-badge-text: rgba(17, 17, 17, 1);\n  --es-badge-rating: rgba(252, 191, 2, 1);\n  --es-badge-radius: 12px;\n  --es-more-bg: rgba(248, 248, 248, 1);\n  --es-more-text: rgb(17, 17, 17);\n  --es-more-radius: 4px;\n  --es-max-width: none;\n  --es-ease: cubic-bezier(0.25, 0.8, 0.25, 1);\n\n  font-family: var(--es-font);\n  color: var(--es-review-text);\n  line-height: 1.4;\n  box-sizing: border-box;\n}\n.es-embed-root *, .es-embed-root *::before, .es-embed-root *::after { box-sizing: border-box; }\n.es-embed-root [hidden] { display: none !important; }\n.es-embed-root button { font: inherit; }\n\n.es-main-container { max-width: var(--es-max-width); margin: 0 auto; }\n.es-widget-background-container {\n  background: var(--es-widget-bg, transparent);\n  border-radius: var(--es-widget-radius, 0);\n  padding: var(--es-widget-pad-y, 0) var(--es-widget-pad-x, 0);\n}\n\n/* ---------- title ---------- */\n.es-widget-title-container { text-align: var(--es-title-align, center); margin-bottom: 24px; }\n.es-widget-title {\n  margin: 0;\n  font-family: var(--es-font);\n  font-size: var(--es-title-size, 24px);\n  font-weight: var(--es-title-weight, 700);\n  line-height: 1.3;\n  color: var(--es-title-color, rgba(17, 17, 17, 1));\n}\n.es-widget-title-caption { margin: 8px 0 0; font-size: 16px; color: var(--es-title-caption-color, rgba(17, 17, 17, 0.7)); }\n\n/* ---------- stars ---------- */\n.es-rating-container { display: inline-flex; gap: 1.5px; vertical-align: middle; }\n.es-rating-item { position: relative; display: inline-block; width: var(--es-star-size); height: var(--es-star-size); }\n.es-rating-item svg { display: block; width: var(--es-star-size); height: var(--es-star-size); }\n.es-rating-item-unfilled path { fill: color-mix(in srgb, var(--es-review-text) 25%, transparent); }\n.es-rating-item-filled { position: absolute; inset: 0 auto 0 0; overflow: hidden; }\n.es-rating-item-filled path { fill: var(--es-rating); }\n\n/* ---------- Google marks ---------- */\n.es-google-g { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }\n.es-google-logo { font-family: 'Product Sans', 'Google Sans', Arial, sans-serif; font-weight: 500; letter-spacing: -0.01em; white-space: nowrap; }\n.es-verified-badge { display: inline-flex; margin-left: 4px; vertical-align: -2px; }\n.es-verified-badge-icon { width: 16px; height: 16px; fill: var(--es-verified); }\n\n/* ---------- header ---------- */\n.es-header-container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: 16px 24px;\n  margin-bottom: 24px;\n  color: var(--es-header-text);\n  background: var(--es-header-bg);\n  border-radius: var(--es-header-radius);\n}\n.es-header-has-bg .es-header-container { padding: 32px 40px; }\n.es-header-heading-container { display: flex; align-items: baseline; gap: 6px; font-size: 24px; font-weight: 700; line-height: 1.2; }\n.es-header-heading-text { font-size: 24px; font-weight: 700; }\n.es-header-rating-container { display: flex; align-items: center; gap: 8px; margin-top: 6px; }\n.es-header-rating-container .es-rating-value { font-size: 24px; font-weight: 700; }\n.es-header-rating { --es-star-size: 20px; }\n.es-header-rating-reviews-count { font-size: 13px; opacity: 0.6; }\n.es-header-icon { font-size: 48px; line-height: 1; display: inline-flex; }\n\n.es-header-header2 .es-header-info { display: flex; align-items: center; gap: 16px; }\n.es-header-header2 .es-header-heading-text { font-size: 24px; }\n.es-header-header2 .es-header-icon { font-size: 40px; }\n\n.es-header-header4 { justify-content: flex-start; }\n\n.es-header-header7 { justify-content: center; }\n.es-header-header7 .es-header-info { display: flex; align-items: center; gap: 12px; }\n.es-header-header7 .es-header-heading-logo { font-size: 32px; line-height: 1; }\n.es-header-header7 .es-header-rating-container { margin: 0; }\n.es-header-header7 .es-rating-value { font-size: 28px; }\n.es-header-header7 .es-header-rating { --es-star-size: 24px; }\n\n.es-header-header9 { flex-direction: column; justify-content: center; gap: 8px; }\n.es-header-header9 .es-header-icon { font-size: 34px; }\n.es-header-header9 .es-header-rating-container { margin: 0; }\n.es-header-header9 .es-rating-value { font-size: 28px; }\n.es-header-header9 .es-header-rating { --es-star-size: 21px; }\n.es-header-reviews-total { font-size: 14px; font-weight: 600; opacity: 0.55; }\n\n.es-header-write-review-button,\n.es-load-more-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: var(--es-btn-pad-y, 9px) var(--es-btn-pad-x, 21px);\n  border: 0;\n  border-radius: var(--es-btn-radius);\n  background: var(--es-btn-bg);\n  color: var(--es-btn-text);\n  font-size: var(--es-btn-font-size, 14px);\n  font-weight: 700;\n  line-height: 1.4;\n  text-decoration: none;\n  white-space: nowrap;\n  cursor: pointer;\n  transition: filter 150ms var(--es-ease), transform 150ms var(--es-ease);\n}\n.es-header-write-review-button:hover, .es-load-more-button:hover { filter: brightness(1.08); }\n.es-header-write-review-button:active, .es-load-more-button:active { transform: translateY(1px); }\n.es-header-write-review-button:focus-visible, .es-load-more-button:focus-visible { outline: 2px solid var(--es-btn-bg); outline-offset: 2px; }\n\n/* ---------- review card ---------- */\n.es-review-container { container-type: inline-size; }\n.es-review-background-container {\n  height: 100%;\n  padding: 24px;\n  background: var(--es-review-bg);\n  border: 1px solid var(--es-review-outline);\n  border-radius: var(--es-review-radius);\n  color: var(--es-review-text);\n  font-size: var(--es-review-font-size);\n}\n.es-review-author-block-container { display: flex; align-items: center; gap: 12px; min-width: 0; }\n.es-review-avatar-container { position: relative; flex: 0 0 40px; width: 40px; height: 40px; }\n.es-avatar-container { display: block; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; }\n.es-avatar-image { display: block; width: 100%; height: 100%; object-fit: cover; }\n.es-avatar-initial { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #fff; font-size: 20px; }\n.es-review-source-sticker {\n  position: absolute; right: -4px; bottom: -4px;\n  display: flex; align-items: center; justify-content: center;\n  width: 20px; height: 20px; border-radius: 50%; background: #fff; font-size: 14px;\n  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);\n}\n.es-review-info-container { display: flex; flex-direction: column; gap: 2px; min-width: 0; }\n.es-review-author-name-container { display: flex; align-items: center; min-width: 0; }\n.es-review-author-name { font-size: 15px; font-weight: 600; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.es-review-info-caption { font-size: 12px; line-height: 16px; color: color-mix(in srgb, var(--es-review-text) 55%, transparent); white-space: nowrap; }\n.es-review-info-caption .es-google-logo { font-size: 15px; }\n.es-review-info-source-link { text-decoration: none; }\n.es-review-info-source-text { color: var(--es-source-name); }\n\n.es-review-content-container { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }\n.es-review-content-rating { line-height: 0; }\n.es-review-content-text-container { display: flex; flex-direction: column; align-items: flex-start; }\n.es-text-shortener { white-space: pre-line; line-height: 1.45; overflow-wrap: anywhere; }\n.es-text-shortener.es-is-clamped { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }\n.es-text-shortener-control {\n  padding: 0; margin: 0; border: 0; background: none; cursor: pointer;\n  color: var(--es-read-more); font-size: inherit; line-height: 1.45;\n}\n.es-text-shortener-control:hover { text-decoration: underline; }\n.es-text-shortener-control:focus-visible { outline: 2px solid var(--es-read-more); outline-offset: 2px; }\n\n/* Wide classic cards align the body under the name, as Elfsight does. */\n@container (min-width: 320px) {\n  .es-review-layout-classic .es-review-author-block-container:has(.es-review-avatar-container) + .es-review-content-container { padding-left: 52px; }\n}\n\n.es-review-source-bottom { margin-top: 4px; }\n.es-source-logo .es-google-logo { font-size: 24px; }\n.es-source-posted { display: flex; align-items: center; gap: 12px; }\n.es-source-posted .es-google-g { width: 32px; height: 32px; }\n.es-source-posted-text { display: flex; flex-direction: column; line-height: 1.25; }\n.es-posted-on { font-size: 13px; color: color-mix(in srgb, var(--es-review-text) 55%, transparent); }\n.es-source-posted .es-review-info-source { color: var(--es-source-name); text-decoration: none; }\n\n.es-review-reply { margin-top: 8px; padding: 16px 20px; border-radius: 12px; background: color-mix(in srgb, var(--es-review-text) 4%, transparent); }\n.es-review-reply-head { display: flex; align-items: center; gap: 8px; }\n.es-review-reply-label {\n  padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em;\n  background: color-mix(in srgb, var(--es-review-text) 8%, transparent);\n}\n.es-review-reply .es-review-info-date { font-size: 12px; margin: 2px 0 8px; opacity: 0.55; }\n\n/* balloon */\n.es-review-layout-balloon .es-review-background-container { padding: 0; background: none; border: 0; }\n.es-review-balloon {\n  position: relative;\n  display: flex; flex-direction: column; gap: 12px;\n  padding: 24px;\n  background: var(--es-review-bg);\n  border: 1px solid var(--es-review-outline);\n  border-radius: var(--es-review-radius);\n}\n.es-review-balloon::after {\n  content: ''; position: absolute; left: 24px; bottom: -10px;\n  width: 20px; height: 20px; transform: rotate(45deg);\n  background: inherit; border-right: inherit; border-bottom: inherit; border-radius: 0 0 4px 0;\n}\n.es-review-layout-balloon .es-review-author-block-container { margin-top: 24px; padding-left: 8px; }\n\n/* spotlight */\n.es-review-layout-spotlight .es-review-background-container {\n  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 32px; text-align: center;\n}\n.es-review-layout-spotlight .es-text-shortener { font-size: calc(var(--es-review-font-size) + 2px); }\n.es-review-layout-spotlight .es-review-content-text-container { align-items: center; }\n.es-review-layout-spotlight .es-review-author-block-container { flex-direction: column; gap: 6px; }\n.es-review-layout-spotlight .es-review-info-container { align-items: center; }\n\n/* equal-height cards: carousels always (as Elfsight's do); the grid only when\n   reviewHeightNormalization is on. */\n.es-carousel-layout-item,\n.es-carousel-layout-item > .es-review-container,\n.es-normalize-height .es-grid-layout > .es-review-container { height: 100%; }\n.es-carousel-layout-item .es-review-layout-balloon .es-review-background-container,\n.es-normalize-height .es-grid-layout .es-review-layout-balloon .es-review-background-container { display: flex; flex-direction: column; }\n.es-carousel-layout-item .es-review-balloon,\n.es-normalize-height .es-grid-layout .es-review-balloon { flex: 1; }\n\n/* ---------- carousel / slider ---------- */\n.es-carousel-layout { position: relative; }\n.es-carousel-viewport { overflow: hidden; touch-action: pan-y; transition: height 300ms var(--es-ease); }\n.es-layout-slider .es-carousel-track { align-items: flex-start; }\n.es-layout-slider .es-carousel-layout-item,\n.es-layout-slider .es-carousel-layout-item > .es-review-container { height: auto; }\n.es-carousel-track { display: flex; align-items: stretch; transition-property: transform; transition-timing-function: var(--es-ease); will-change: transform; }\n.es-carousel-slide { flex: 0 0 auto; }\n.es-carousel-arrow {\n  position: absolute; top: 50%; z-index: 2;\n  display: flex; align-items: center; justify-content: center;\n  width: var(--es-arrow-size); height: var(--es-arrow-size); margin-top: calc(var(--es-arrow-size) / -2);\n  padding: 0; border: 0; border-radius: 50%; cursor: pointer;\n  background: var(--es-arrow-bg); color: var(--es-arrow-color);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n  transition: background-color 150ms var(--es-ease), color 150ms var(--es-ease), transform 150ms var(--es-ease);\n}\n.es-carousel-arrow svg { width: 60%; height: 60%; fill: currentColor; }\n.es-carousel-arrow:hover { background: var(--es-arrow-bg-hover); color: var(--es-arrow-color-hover); }\n.es-carousel-arrow:active { transform: scale(0.94); }\n.es-carousel-arrow:focus-visible { outline: 2px solid var(--es-dot); outline-offset: 2px; }\n.es-carousel-arrow-prev { left: var(--es-arrow-offset, 0px); }\n.es-carousel-arrow-prev svg { transform: rotate(180deg); }\n.es-carousel-arrow-next { right: var(--es-arrow-offset, 0px); }\n.es-carousel-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; min-height: 8px; margin-top: 24px; }\n.es-carousel-dot {\n  padding: 0; border: 0; border-radius: 50%; cursor: pointer;\n  background: var(--es-dot); opacity: 0.4;\n  transition: width 200ms var(--es-ease), height 200ms var(--es-ease), opacity 200ms var(--es-ease);\n}\n.es-carousel-dot.es-dot-main { width: 8px; height: 8px; }\n.es-carousel-dot.es-dot-near { width: 6px; height: 6px; }\n.es-carousel-dot.es-dot-far { width: 4px; height: 4px; }\n.es-carousel-dot.is-active { opacity: 1; }\n\n/* ---------- grid / list / masonry ---------- */\n.es-grid-layout { display: grid; grid-template-columns: repeat(var(--es-cols, 3), minmax(0, 1fr)); gap: var(--es-gap, 20px); }\n.es-embed-root:not(.es-normalize-height) .es-grid-layout { align-items: start; }\n.es-list-layout { display: flex; flex-direction: column; gap: var(--es-gap, 20px); }\n.es-masonry-layout { columns: var(--es-cols, 3); column-gap: var(--es-gap, 20px); }\n.es-masonry-layout > .es-review-container { break-inside: avoid; margin-bottom: var(--es-gap, 20px); }\n.es-load-more-button-container { display: flex; justify-content: center; margin-top: 24px; }\n.es-load-more-button { padding: 9px 52px; border-radius: var(--es-more-radius); background: var(--es-more-bg); color: var(--es-more-text); font-size: 13px; }\n\n/* ---------- badge ---------- */\n.es-badge-wrapper { position: relative; display: flex; }\n.es-badge-inline.es-badge-align-left { justify-content: flex-start; }\n.es-badge-inline.es-badge-align-center { justify-content: center; }\n.es-badge-inline.es-badge-align-right { justify-content: flex-end; }\n.es-badge-floating { position: fixed; z-index: 9999; }\n.es-badge {\n  display: flex; flex-direction: column; align-items: center; gap: 6px;\n  padding: 16px 22px;\n  border-radius: var(--es-badge-radius);\n  background: var(--es-badge-bg); color: var(--es-badge-text);\n  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.12);\n  font-size: 15px; text-align: center;\n}\n.es-badge[role='button'] { cursor: pointer; transition: transform 150ms var(--es-ease), box-shadow 150ms var(--es-ease); }\n.es-badge[role='button']:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16); }\n.es-badge[role='button']:focus-visible { outline: 2px solid var(--es-verified); outline-offset: 2px; }\n.es-badge-icon { font-size: 26px; line-height: 1; }\n.es-badge-label { display: flex; align-items: center; font-weight: 600; }\n.es-badge-rating { display: flex; align-items: center; gap: 6px; --es-rating: var(--es-badge-rating); --es-star-size: 15px; }\n.es-badge-rating .es-rating-value { font-size: 20px; font-weight: 700; }\n.es-badge-count { font-size: 13px; font-weight: 600; opacity: 0.5; }\n.es-badge-size-small .es-badge { padding: 12px 16px; font-size: 13px; }\n.es-badge-size-large .es-badge { padding: 20px 28px; font-size: 17px; }\n.es-badge-close {\n  position: absolute; top: -8px; right: -8px;\n  display: flex; align-items: center; justify-content: center;\n  width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; cursor: pointer;\n  background: #fff; color: #666; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);\n}\n.es-badge-close svg { width: 14px; height: 14px; fill: currentColor; }\n\n/* ---------- popup ---------- */\n.es-popup-root { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }\n.es-popup-overlay { position: absolute; inset: 0; background: rgba(17, 17, 17, 0.85); animation: es-fade 200ms var(--es-ease); }\n.es-popup-content-container {\n  position: relative;\n  width: 100%; max-width: 720px; max-height: 100%;\n  overflow-y: auto; overscroll-behavior: contain;\n  padding: 40px;\n  border-radius: 24px;\n  background: var(--es-popup-bg); color: var(--es-popup-text);\n  animation: es-pop 220ms var(--es-ease);\n}\n.es-popup-close {\n  position: absolute; top: 16px; right: 16px;\n  display: flex; padding: 4px; border: 0; background: none; cursor: pointer; color: var(--es-popup-text);\n}\n.es-popup-close svg { width: 24px; height: 24px; fill: currentColor; }\n.es-popup-content {\n  --es-review-bg: transparent; --es-review-outline: transparent; --es-review-text: var(--es-popup-text);\n  --es-header-text: var(--es-popup-text);\n  --es-rating: var(--es-popup-rating); --es-read-more: var(--es-popup-read-more);\n}\n.es-popup-content .es-header-container { padding: 0 0 24px; margin: 0; background: none; border-bottom: 1px solid color-mix(in srgb, var(--es-popup-text) 12%, transparent); border-radius: 0; }\n.es-popup-content > .es-review-container .es-review-background-container { padding: 0; }\n.es-popup-list > .es-review-container + .es-review-container { border-top: 1px solid color-mix(in srgb, var(--es-popup-text) 12%, transparent); }\n.es-popup-list .es-review-background-container { padding: 32px 0; border: 0; }\n@keyframes es-fade { from { opacity: 0; } }\n@keyframes es-pop { from { opacity: 0; transform: translateY(12px) scale(0.98); } }\n\n@media (max-width: 600px) {\n  .es-header-has-bg .es-header-container { padding: 24px; }\n  .es-popup-content-container { padding: 32px 20px; border-radius: 16px; }\n  .es-header-header7 .es-header-info { flex-wrap: wrap; justify-content: center; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .es-carousel-track { transition-duration: 0ms !important; }\n  .es-popup-overlay, .es-popup-content-container { animation: none; }\n}\n\n.es-editor-message { padding: 16px; border: 1px dashed #c0c0c0; border-radius: 8px; color: #666; font: 14px/1.4 sans-serif; }\n\n/* The popup runs text full-width under the avatar, as Elfsight's does. */\n.es-popup-content .es-review-layout-classic .es-review-content-container { padding-left: 0; }\n.es-popup-close:focus:not(:focus-visible) { outline: none; }\n.es-popup-close:focus-visible { outline: 2px solid var(--es-popup-read-more); outline-offset: 2px; }\n";
  (document.head || document.documentElement).appendChild(s);
})();
"use strict";
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

  // widgets/google-reviews/index.ts
  var index_exports = {};
  __export(index_exports, {
    columnsFor: () => columnsFor,
    default: () => googleReviews,
    pageSize: () => pageSize,
    render: () => render,
    styleAttr: () => styleAttr,
    themeVars: () => themeVars
  });

  // widgets/google-reviews/data.ts
  var PLACES_FIELDS = "displayName,rating,userRatingCount,googleMapsUri,reviews";
  var CACHE_TTL_MS = 6 * 60 * 60 * 1e3;
  var CACHE_PREFIX = "shm-greviews:";
  function writeReviewUrl(placeId) {
    return placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : "";
  }
  function toEpochSeconds(v) {
    if (typeof v === "number" && Number.isFinite(v)) return v > 1e12 ? Math.round(v / 1e3) : v;
    if (typeof v === "string" && v) {
      const ms = Date.parse(v);
      return Number.isNaN(ms) ? null : Math.round(ms / 1e3);
    }
    return null;
  }
  var text = (v) => typeof v === "string" ? v : "";
  var list = (v) => Array.isArray(v) ? v.filter((x) => Boolean(x) && typeof x === "object") : [];
  function fromPlaces(place, placeId) {
    var _a;
    const reviews = list(place == null ? void 0 : place.reviews).map((r, i) => {
      var _a2, _b, _c, _d, _e, _f;
      return {
        id: text(r.name) || `${placeId}-${i}`,
        authorName: text((_a2 = r.authorAttribution) == null ? void 0 : _a2.displayName),
        authorPhoto: text((_b = r.authorAttribution) == null ? void 0 : _b.photoUri),
        authorUrl: text((_c = r.authorAttribution) == null ? void 0 : _c.uri),
        rating: Number(r.rating) || 0,
        text: text((_d = r.text) == null ? void 0 : _d.text) || text((_e = r.originalText) == null ? void 0 : _e.text),
        publishedAt: toEpochSeconds(r.publishTime),
        relativeTime: text(r.relativePublishTimeDescription),
        url: text(r.googleMapsUri) || text((_f = r.authorAttribution) == null ? void 0 : _f.uri),
        images: [],
        reply: null
      };
    });
    return {
      business: {
        name: text((_a = place == null ? void 0 : place.displayName) == null ? void 0 : _a.text),
        rating: Number(place == null ? void 0 : place.rating) || 0,
        reviewCount: Number(place == null ? void 0 : place.userRatingCount) || reviews.length,
        reviewsUrl: text(place == null ? void 0 : place.googleMapsUri),
        writeReviewUrl: writeReviewUrl(placeId)
      },
      reviews
    };
  }
  function fromFeed(feed, placeId) {
    var _a, _b, _c, _d;
    const root = (_b = (_a = feed == null ? void 0 : feed.result) != null ? _a : feed) != null ? _b : {};
    const reviews = list((_c = root.reviews) != null ? _c : root.data).map((r, i) => {
      var _a2, _b2, _c2;
      const reply2 = r.reply && typeof r.reply === "object" ? r.reply : r.response && typeof r.response === "object" ? r.response : null;
      return {
        id: String((_a2 = r.id) != null ? _a2 : `${placeId}-${i}`),
        authorName: text(r.authorName) || text(r.reviewer_name),
        authorPhoto: text(r.authorPhoto) || text(r.reviewer_picture_url),
        authorUrl: text(r.authorUrl),
        rating: Number(r.rating) || 0,
        text: text(r.text),
        publishedAt: toEpochSeconds((_b2 = r.publishedAt) != null ? _b2 : r.published_at),
        relativeTime: text(r.relativeTime),
        url: text(r.url),
        images: (Array.isArray(r.images) ? r.images : []).map((x) => typeof x === "string" ? x : x && typeof x === "object" ? text(x.url) : "").filter(Boolean),
        reply: reply2 && text(reply2.text) ? { text: text(reply2.text), publishedAt: toEpochSeconds((_c2 = reply2.publishedAt) != null ? _c2 : reply2.published_at) } : null
      };
    });
    const b = root.business && typeof root.business === "object" ? root.business : {};
    return {
      business: {
        name: text(b.name),
        rating: Number(b.rating) || average(reviews),
        reviewCount: Number((_d = b.reviewCount) != null ? _d : b.reviews_number) || reviews.length,
        reviewsUrl: text(b.reviewsUrl),
        writeReviewUrl: text(b.writeReviewUrl) || writeReviewUrl(placeId)
      },
      reviews
    };
  }
  function average(reviews) {
    if (!reviews.length) return 0;
    return Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10;
  }
  function readCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const { at, data } = JSON.parse(raw);
      const fresh = typeof at === "number" && Date.now() - at < CACHE_TTL_MS;
      return fresh && (data == null ? void 0 : data.business) && Array.isArray(data.reviews) ? data : null;
    } catch (e) {
      return null;
    }
  }
  function writeCache(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), data }));
    } catch (e) {
    }
  }
  async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url.split("?")[0]}`);
    return res.json();
  }
  async function loadReviews(src, fetchJson = getJson) {
    const cacheKey = `${src.feedUrl || src.placeId}|${src.language}`;
    const cached = readCache(cacheKey);
    if (cached) return cached;
    let data;
    if (src.feedUrl) {
      data = fromFeed(await fetchJson(src.feedUrl), src.placeId);
    } else if (src.placeId && src.googleApiKey) {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(src.placeId)}?fields=${PLACES_FIELDS}&languageCode=${encodeURIComponent(src.language)}&key=${encodeURIComponent(src.googleApiKey)}`;
      data = fromPlaces(await fetchJson(url), src.placeId);
    } else {
      throw new Error("No review source: set a Google Place ID + API key, or a feed URL");
    }
    writeCache(cacheKey, data);
    return data;
  }
  function matches(text3, keyword) {
    return text3.toLowerCase().includes(keyword.toLowerCase());
  }
  function selectReviews(reviews, s, random = Math.random) {
    const include = s.filterIncludeKeywords.map((k) => k.keyword.trim()).filter(Boolean);
    const exclude = s.filterExcludeKeywords.map((k) => k.keyword.trim()).filter(Boolean);
    const kept = reviews.filter((r) => {
      if (r.rating < s.filterMinRating) return false;
      if (s.displayReviewsOnlyWithText && !r.text.trim()) return false;
      if (s.displayReviewsOnlyWithImages && !r.images.length) return false;
      const haystack = `${r.text} ${r.authorName}`;
      if (include.length && !include.some((k) => matches(haystack, k))) return false;
      if (exclude.some((k) => matches(haystack, k))) return false;
      return true;
    });
    const sorted = [...kept];
    if (s.sorting === "date") sorted.sort((a, b) => {
      var _a, _b;
      return ((_a = b.publishedAt) != null ? _a : 0) - ((_b = a.publishedAt) != null ? _b : 0);
    });
    else if (s.sorting === "rating") sorted.sort((a, b) => {
      var _a, _b;
      return b.rating - a.rating || ((_a = b.publishedAt) != null ? _a : 0) - ((_b = a.publishedAt) != null ? _b : 0);
    });
    else if (s.sorting === "random") {
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
    }
    return s.limitTotalNumberOfItems ? sorted.slice(0, s.totalNumberOfItems) : sorted;
  }

  // core/config.ts
  function coerceBool(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
      if (v === "false" || v === "0" || v === "no" || v === "off" || v === "") return false;
    }
    if (typeof value === "number") return value !== 0;
    return fallback;
  }

  // widgets/google-reviews/settings.ts
  var DEFAULTS = {
    sources: [],
    layout: "carousel",
    widgetWidth: { auto: true, customValue: 1280 },
    carouselColumnsMode: "auto",
    carouselColumnsDesktopLarge: 4,
    carouselColumnsDesktopMedium: 3,
    carouselColumnsDesktopSmall: 3,
    carouselColumnsTablet: 2,
    carouselColumnsMobile: 1,
    carouselItemSpacing: 20,
    carouselAutoplay: false,
    carouselAutoplayPauseOnHover: true,
    carouselAutoplayInterval: 5e3,
    carouselAnimationSpeed: 740,
    carouselPagination: true,
    carouselArrowsEnable: true,
    carouselArrowsOnMobileEnable: true,
    carouselSwipeDesktopEnable: true,
    carouselSwipeMobileEnable: true,
    sliderAutoplay: false,
    sliderAutoplayPauseOnHover: true,
    sliderAutoplayInterval: 5e3,
    sliderAnimationSpeed: 740,
    sliderPagination: true,
    sliderArrowsEnable: true,
    sliderArrowsOnMobileEnable: true,
    gridColumnsMode: "auto",
    gridColumnsDesktopLarge: 5,
    gridColumnsTablet: 2,
    gridColumnsMobile: 1,
    gridItemSpacing: 20,
    gridRows: 3,
    gridRowsOnMobile: 3,
    showLoadMoreButton: true,
    listItemSpacing: 20,
    listItemsPerPage: 8,
    listItemsPerPageOnMobile: 8,
    masonryColumnsMode: "auto",
    masonryColumnsDesktopLarge: 5,
    masonryColumnsTablet: 2,
    masonryColumnsMobile: 1,
    masonryItemSpacing: 20,
    masonryItemsPerPage: 8,
    masonryItemsPerPageOnMobile: 8,
    reviewLayout: "classic",
    reviewSourceStyle: "text",
    reviewDisplayOwnerReply: true,
    reviewDisplayAuthorName: true,
    reviewDisplayVerifiedBadge: true,
    reviewDisplayAuthorPicture: true,
    reviewDisplayDate: true,
    reviewDisplayRating: true,
    reviewDisplaySource: true,
    reviewHeightNormalization: true,
    reviewTextDisplayMode: "short",
    reviewPreviewLinesNumber: 4,
    reviewAuthorNameFormat: "fullName",
    widgetTitle: false,
    widgetTitleTitle: "What Our Customers Say",
    widgetTitleCaption: "",
    showOverallRating: true,
    headerLayout: "header1",
    headerElements: ["title", "rating", "reviewsNumber"],
    showWriteReviewButton: true,
    badgeDisplayMode: "singleInline",
    badgeInlinePosition: "center",
    badgeFloatingPosition: { position: "bottom-left", horizontalOffset: 20, verticalOffset: 20 },
    badgeSize: "medium",
    badgeLabelType: "custom",
    badgeLabelCustomText: "Google Rating",
    badgeDisplayNumberOfReviews: true,
    badgeDisplaySourceIcon: true,
    badgeDisplayVerifiedBadge: true,
    badgeDisplayRating: true,
    badgeCloseButton: true,
    badgeClickAction: "openPopup",
    displayReviewsOnlyWithText: true,
    displayReviewsOnlyWithImages: false,
    filterMinRating: 4,
    filterIncludeKeywords: [],
    filterExcludeKeywords: [],
    limitTotalNumberOfItems: false,
    totalNumberOfItems: 100,
    sorting: "date",
    enableExternalLinks: true,
    openLinksInNewTab: true,
    enableSchemaOrg: true,
    customCSS: "",
    theme: {
      themeSettings: {
        widgetTitleTitleColor: "rgba(17, 17, 17, 1)",
        widgetTitleCaptionColor: "rgba(17, 17, 17, 0.7)",
        widgetTitleAlignment: "center",
        widgetTitleTitleTextStyle: { fontSize: 24, fontWeight: "bold" },
        widgetBackground: { color: "transparent", borderRadius: 0 },
        widgetHorizontalPadding: 0,
        widgetVerticalPadding: 0,
        reviewBackgroundColor: "rgba(248, 248, 248, 1)",
        reviewOutlineColor: "rgba(17, 17, 17, 0.1)",
        reviewTextColor: "rgba(17, 17, 17, 1)",
        reviewReadMoreColor: "rgba(0, 109, 255, 1)",
        reviewVerifiedBadgeColor: "rgba(0, 109, 255, 1)",
        reviewSourceNameColor: "rgba(0, 109, 255, 1)",
        reviewCornerRadius: 8,
        reviewTextFontSize: { fontSize: 16 },
        reviewRatingSize: "medium",
        ratingColor: "rgba(252, 191, 2, 1)",
        headerBackgroundColor: "transparent",
        headerTextColor: "rgba(17, 17, 17, 1)",
        headerCornerRadius: 8,
        writeReviewButton: { color: "rgba(0, 109, 255, 1)", fontColor: "rgb(255, 255, 255)", borderRadius: 24, horizontalPadding: 21, verticalPadding: 9, font: { fontSize: 14, fontWeight: "bold" } },
        loadMoreButton: { text: "Load More", color: "rgba(248, 248, 248, 1)", fontColor: "rgb(17, 17, 17)", borderRadius: 4, font: { fontSize: 13, fontWeight: "bold" } },
        carouselArrowBackgroundColor: "rgba(17, 17, 17, 0.5)",
        carouselArrowColor: "rgba(255, 255, 255, 1)",
        carouselArrowBackgroundColorOnHover: "rgba(17, 17, 17, 0.7)",
        carouselArrowColorOnHover: "rgba(255, 255, 255, 1)",
        carouselArrowSize: 32,
        carouselPaginationColor: "rgba(17, 17, 17, 1)",
        popupBackgroundColor: "rgba(255, 255, 255, 1)",
        popupTextColor: "rgba(17, 17, 17, 1)",
        popupRatingColor: "rgba(252, 191, 2, 1)",
        popupReviewReadMoreColor: "rgba(0, 109, 255, 1)",
        badgeBackgroundColor: "rgba(255, 255, 255, 1)",
        badgeTextColor: "rgba(17, 17, 17, 1)",
        badgeRatingColor: "rgba(252, 191, 2, 1)",
        badgeCornerRadius: 12
      }
    }
  };
  function parseJson(raw) {
    var _a, _b, _c;
    if (raw && typeof raw === "object") return raw;
    if (typeof raw !== "string" || !raw.trim()) return {};
    try {
      const parsed = JSON.parse(raw);
      const settings = (_c = (_b = (_a = parsed == null ? void 0 : parsed.publishedWidgetRevision) == null ? void 0 : _a.settings) != null ? _b : parsed == null ? void 0 : parsed.settings) != null ? _c : parsed;
      return settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {};
    } catch (e) {
      console.error("[google-reviews] settingsJson is not valid JSON \u2014 using defaults", e);
      return {};
    }
  }
  function str(v) {
    return typeof v === "string" ? v.trim() : "";
  }
  function keywords(v) {
    return str(v).split(",").map((k) => k.trim()).filter(Boolean).map((keyword) => ({ keyword }));
  }
  var ENUMS = {
    layout: ["carousel", "slider", "grid", "list", "masonry", "cardBadge"],
    reviewLayout: ["classic", "balloon", "spotlight"],
    reviewSourceStyle: ["text", "logo", "icon", "logoBottom", "iconBottom"],
    headerLayout: ["header1", "header2", "header4", "header7", "header9"],
    carouselColumnsMode: ["auto", "custom"],
    gridColumnsMode: ["auto", "custom"],
    masonryColumnsMode: ["auto", "custom"],
    reviewTextDisplayMode: ["short", "full"],
    reviewAuthorNameFormat: ["fullName", "firstName", "firstNameLastInitial"],
    badgeDisplayMode: ["singleInline", "singleFloating"],
    badgeInlinePosition: ["left", "center", "right"],
    badgeSize: ["small", "medium", "large"],
    badgeLabelType: ["custom", "none"],
    badgeClickAction: ["openPopup", "openLink", "none"],
    sorting: ["date", "rating", "relevance", "random"]
  };
  var HEADER_ELEMENTS = ["title", "rating", "reviewsNumber"];
  function finite(v, fallback) {
    const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
    return Number.isFinite(n) ? n : fallback;
  }
  function keywordList(v) {
    if (!Array.isArray(v)) return [];
    return v.map((k) => typeof k === "string" ? k : k && typeof k === "object" ? k.keyword : "").filter((k) => typeof k === "string" && k.trim() !== "").map((keyword) => ({ keyword }));
  }
  function normalise(raw) {
    var _a, _b;
    const out = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      const v = raw[key];
      const allowed = ENUMS[key];
      if (allowed) out[key] = typeof v === "string" && allowed.includes(v) ? v : def;
      else if (typeof def === "number") out[key] = finite(v, def);
      else if (typeof def === "boolean") out[key] = v === void 0 || v === "" ? def : coerceBool(v, def);
      else if (typeof def === "string") out[key] = typeof v === "string" ? v : def;
      else out[key] = def;
    }
    out.filterMinRating = Math.min(5, Math.max(1, out.filterMinRating));
    out.reviewPreviewLinesNumber = Math.max(1, Math.round(out.reviewPreviewLinesNumber));
    out.sources = Array.isArray(raw.sources) ? raw.sources.map((x) => ({ url: x && typeof x === "object" && typeof x.url === "string" ? x.url.trim() : "" })) : [];
    out.filterIncludeKeywords = keywordList(raw.filterIncludeKeywords);
    out.filterExcludeKeywords = keywordList(raw.filterExcludeKeywords);
    out.headerElements = Array.isArray(raw.headerElements) ? raw.headerElements.filter((e) => HEADER_ELEMENTS.includes(e)) : DEFAULTS.headerElements;
    const ww = (_a = raw.widgetWidth) != null ? _a : {};
    out.widgetWidth = { auto: coerceBool(ww.auto, DEFAULTS.widgetWidth.auto), customValue: finite(ww.customValue, DEFAULTS.widgetWidth.customValue) };
    const fp = (_b = raw.badgeFloatingPosition) != null ? _b : {};
    out.badgeFloatingPosition = {
      position: ["top-left", "top-right", "bottom-left", "bottom-right"].includes(fp.position) ? fp.position : DEFAULTS.badgeFloatingPosition.position,
      horizontalOffset: finite(fp.horizontalOffset, DEFAULTS.badgeFloatingPosition.horizontalOffset),
      verticalOffset: finite(fp.verticalOffset, DEFAULTS.badgeFloatingPosition.verticalOffset)
    };
    return out;
  }
  function panelOverrides(c) {
    const o = {};
    for (const key of ["layout", "reviewLayout", "headerLayout", "reviewSourceStyle", "badgeDisplayMode"]) {
      if (str(c[key])) o[key] = str(c[key]);
    }
    for (const key of ["showOverallRating", "showWriteReviewButton", "widgetTitle"]) {
      if (c[key] !== void 0 && c[key] !== "") o[key] = coerceBool(c[key]);
    }
    if (c.carouselAutoplay !== void 0 && c.carouselAutoplay !== "") {
      o.carouselAutoplay = o.sliderAutoplay = coerceBool(c.carouselAutoplay);
    }
    if (str(c.widgetTitleTitle)) o.widgetTitleTitle = str(c.widgetTitleTitle);
    if (str(c.filterMinRating)) o.filterMinRating = str(c.filterMinRating);
    if (str(c.includeKeywords)) o.filterIncludeKeywords = keywords(c.includeKeywords);
    if (str(c.excludeKeywords)) o.filterExcludeKeywords = keywords(c.excludeKeywords);
    if (str(c.placeId)) o.sources = [{ url: str(c.placeId) }];
    return o;
  }
  function panelTheme(c) {
    const t = {};
    const colour = (key, set) => {
      const v = str(c[key]);
      if (v) set(v);
    };
    colour("cardBackground", (v) => {
      t.reviewBackgroundColor = v;
    });
    colour("cardTextColour", (v) => {
      t.reviewTextColor = v;
    });
    colour("starColour", (v) => {
      t.ratingColor = v;
      t.popupRatingColor = v;
      t.badgeRatingColor = v;
    });
    colour("accentColour", (v) => {
      t.reviewReadMoreColor = v;
      t.reviewVerifiedBadgeColor = v;
      t.reviewSourceNameColor = v;
      t.writeReviewButton = { color: v };
    });
    colour("fontFamily", (v) => {
      t.font = { value: v, googleFont: true };
    });
    return t;
  }
  function mergeTheme(...layers) {
    const out = {};
    for (const layer of layers) {
      if (!layer) continue;
      for (const [k, v] of Object.entries(layer)) {
        const prev = out[k];
        out[k] = v && typeof v === "object" && !Array.isArray(v) && prev && typeof prev === "object" ? { ...prev, ...v } : v;
      }
    }
    return out;
  }
  function readSettings(config = {}) {
    var _a;
    const json = parseJson(config.settingsJson);
    const merged = normalise({ ...json, ...panelOverrides(config) });
    const jsonTheme = (_a = json.theme) == null ? void 0 : _a.themeSettings;
    return {
      ...merged,
      theme: {
        themeSettings: mergeTheme(
          DEFAULTS.theme.themeSettings,
          jsonTheme && typeof jsonTheme === "object" ? jsonTheme : void 0,
          panelTheme(config)
        )
      }
    };
  }
  function readSource(config, settings) {
    var _a, _b;
    return {
      placeId: (_b = (_a = settings.sources.find((s) => s.url)) == null ? void 0 : _a.url) != null ? _b : "",
      googleApiKey: str(config.googleApiKey),
      feedUrl: str(config.feedUrl),
      language: str(config.language) || "en"
    };
  }

  // widgets/google-reviews/format.ts
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeUrl(v) {
    const s = String(v != null ? v : "").trim();
    return /^https?:\/\//i.test(s) ? esc(s) : "";
  }
  var UNITS = [
    [365 * 24 * 3600, "year"],
    [30 * 24 * 3600, "month"],
    [24 * 3600, "day"],
    [3600, "hour"],
    [60, "minute"]
  ];
  function relativeTime(epochSeconds, fallback = "", now = Date.now()) {
    if (!epochSeconds) return fallback;
    const diff = Math.max(0, Math.round(now / 1e3) - epochSeconds);
    for (const [size, unit] of UNITS) {
      const n = Math.floor(diff / size);
      if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }
  function formatName(name, format) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "Customer";
    if (format === "firstName") return parts[0];
    if (format === "firstNameLastInitial" && parts.length > 1) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    return name.trim();
  }
  function ratingWord(rating2) {
    if (rating2 >= 4.5) return "Excellent";
    if (rating2 >= 4) return "Very good";
    if (rating2 >= 3.5) return "Good";
    if (rating2 >= 2.5) return "Average";
    return "Poor";
  }
  var AVATAR_COLOURS = ["#5c6bc0", "#689f38", "#455a64", "#7b1fa2", "#c2185b", "#0288d1", "#f4511e", "#00796b", "#5d4037", "#512da8"];
  function avatarColour(name) {
    let h = 0;
    for (const ch of name) h = h * 31 + ch.charCodeAt(0) >>> 0;
    return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
  }
  var STAR_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
  function stars(rating2, cls = "") {
    const r = Math.max(0, Math.min(5, rating2));
    let html = "";
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, r - i));
      html += `<span class="es-rating-item"><svg class="es-rating-item-unfilled" viewBox="2 1.6 20 20" aria-hidden="true"><path d="${STAR_PATH}"/></svg>` + (fill > 0 ? `<span class="es-rating-item-filled" style="width:${Math.round(fill * 100)}%"><svg viewBox="2 1.6 20 20" aria-hidden="true"><path d="${STAR_PATH}"/></svg></span>` : "") + `</span>`;
    }
    return `<span class="es-rating-container ${cls}" role="img" aria-label="Rating: ${r} out of 5">${html}</span>`;
  }
  var GOOGLE_G = '<svg class="es-google-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var GOOGLE_WORDMARK = '<span class="es-google-logo" aria-label="Google"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></span>';
  var VERIFIED = '<svg class="es-verified-badge-icon" viewBox="0 0 24 24" role="img" aria-label="Verified by Google"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>';
  var CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.4 10 4l8 8-8 8-1.4-1.4L15.2 12z"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  // widgets/google-reviews/render.ts
  function linkAttrs(s) {
    return s.openLinksInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener"';
  }
  function maybeLink(s, url, inner, cls) {
    const href = s.enableExternalLinks ? safeUrl(url) : "";
    return href ? `<a class="${cls}" href="${href}"${linkAttrs(s)}>${inner}</a>` : `<span class="${cls}">${inner}</span>`;
  }
  function avatar(r, s, withSticker) {
    var _a, _b;
    if (!s.reviewDisplayAuthorPicture) return "";
    const name = r.authorName || "Customer";
    const photo = safeUrl(r.authorPhoto);
    const inner = photo ? `<img class="es-avatar-image" src="${photo}" alt="" loading="lazy" referrerpolicy="no-referrer" width="40" height="40">` : `<span class="es-avatar-initial" style="background:${avatarColour(name)}">${esc((_b = (_a = name.trim()[0]) == null ? void 0 : _a.toUpperCase()) != null ? _b : "?")}</span>`;
    const sticker = withSticker ? `<span class="es-review-source-sticker">${GOOGLE_G}</span>` : "";
    return `<span class="es-review-avatar-container">${maybeLink(s, r.authorUrl, inner, "es-avatar-container")}${sticker}</span>`;
  }
  function authorName(r, s) {
    if (!s.reviewDisplayAuthorName) return "";
    const badge2 = s.reviewDisplayVerifiedBadge ? `<span class="es-verified-badge">${VERIFIED}</span>` : "";
    return `<span class="es-review-author-name-container"><span class="es-review-author-name">${esc(formatName(r.authorName, s.reviewAuthorNameFormat))}</span>${badge2}</span>`;
  }
  function dateLine(r, ctx, withSource) {
    const { s } = ctx;
    const date = s.reviewDisplayDate ? esc(relativeTime(r.publishedAt, r.relativeTime, ctx.now)) : "";
    const mark = s.reviewSourceStyle === "logo" ? GOOGLE_WORDMARK : '<span class="es-review-info-source-text">Google</span>';
    const source = withSource && s.reviewDisplaySource ? `${date ? " on " : ""}${maybeLink(s, r.url, mark, "es-review-info-source-link")}` : "";
    if (!date && !source) return "";
    return `<span class="es-review-info-caption"><span class="es-review-info-date">${date}</span>${source}</span>`;
  }
  function text2(body, ctx) {
    const { s } = ctx;
    const clamp = !ctx.full && s.reviewTextDisplayMode === "short";
    const style = clamp ? ` style="-webkit-line-clamp:${s.reviewPreviewLinesNumber}"` : "";
    return `<div class="es-review-content-text-container"><div class="es-text-shortener${clamp ? " es-is-clamped" : ""}"${style}>${esc(body)}</div>` + (clamp ? `<button type="button" class="es-text-shortener-control" data-action="read-more" hidden>Read more</button>` : "") + `</div>`;
  }
  function reply(r, ctx) {
    var _a;
    const { s, business } = ctx;
    if (!ctx.inPopup || !s.reviewDisplayOwnerReply || !((_a = r.reply) == null ? void 0 : _a.text)) return "";
    const date = relativeTime(r.reply.publishedAt, "", ctx.now);
    return `<div class="es-review-reply"><div class="es-review-reply-head"><span class="es-review-author-name">${esc(business.name || "Owner")}</span><span class="es-review-reply-label">Owner reply</span></div>` + (date ? `<div class="es-review-info-date">${esc(date)}</div>` : "") + text2(r.reply.text, ctx) + `</div>`;
  }
  function rating(r, s) {
    return s.reviewDisplayRating ? `<div class="es-review-content-rating">${stars(r.rating)}</div>` : "";
  }
  function bottomStyle(s) {
    const inline = s.reviewSourceStyle === "text" || s.reviewSourceStyle === "logo";
    return s.reviewLayout !== "classic" && inline ? "logoBottom" : s.reviewSourceStyle;
  }
  function bottomSource(r, s) {
    if (!s.reviewDisplaySource) return "";
    const style = bottomStyle(s);
    if (style === "logoBottom") {
      return `<div class="es-review-source-bottom es-source-logo">${maybeLink(s, r.url, GOOGLE_WORDMARK, "es-review-info-source-link")}</div>`;
    }
    if (style === "iconBottom") {
      return `<div class="es-review-source-bottom es-source-posted">${GOOGLE_G}<span class="es-source-posted-text"><span class="es-posted-on">Posted on</span>${maybeLink(s, r.url, "Google", "es-review-info-source")}</span></div>`;
    }
    return "";
  }
  function author(r, ctx, withSource) {
    const { s } = ctx;
    return `<div class="es-review-author-block-container">${avatar(r, s, s.reviewSourceStyle === "icon")}<div class="es-review-info-container">${authorName(r, s)}${dateLine(r, ctx, withSource)}</div></div>`;
  }
  function reviewCard(r, ctx) {
    const { s } = ctx;
    let body;
    if (s.reviewLayout === "balloon") {
      body = `<div class="es-review-balloon">${rating(r, s)}${text2(r.text, ctx)}${bottomSource(r, s)}</div>${author(r, ctx, false)}${reply(r, ctx)}`;
    } else if (s.reviewLayout === "spotlight") {
      body = `${rating(r, s)}${text2(r.text, ctx)}${author(r, ctx, false)}${bottomSource(r, s)}${reply(r, ctx)}`;
    } else {
      body = `${author(r, ctx, s.reviewSourceStyle === "text" || s.reviewSourceStyle === "logo")}<div class="es-review-content-container">${rating(r, s)}${text2(r.text, ctx)}${reply(r, ctx)}${bottomSource(r, s)}</div>`;
    }
    return `<div class="es-review-container es-review-layout-${esc(s.reviewLayout)}" data-review-id="${esc(r.id)}"><div class="es-review-background-container">${body}</div></div>`;
  }
  function writeButton(ctx, label = "Review us on Google") {
    const href = safeUrl(ctx.business.writeReviewUrl);
    if (!ctx.s.showWriteReviewButton || !href) return "";
    return `<div class="es-header-write-review-button-container"><a class="es-header-write-review-button es-button-base-container" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></div>`;
  }
  function headerRating(ctx) {
    const { s, business } = ctx;
    const parts = [];
    if (s.headerElements.includes("rating")) {
      parts.push(`<span class="es-rating-value">${business.rating.toFixed(1)}</span>`, stars(business.rating, "es-header-rating"));
    }
    if (s.headerElements.includes("reviewsNumber")) {
      parts.push(`<span class="es-header-rating-reviews-count">(${business.reviewCount.toLocaleString("en")})</span>`);
    }
    return parts.length ? `<div class="es-header-rating-container">${parts.join("")}</div>` : "";
  }
  function header(ctx, force = false) {
    const { s, business } = ctx;
    if (!s.showOverallRating && !force) return "";
    const title = s.headerElements.includes("title");
    const layout = force ? "header1" : s.headerLayout;
    let inner;
    if (layout === "header2") {
      inner = `<div class="es-header-info"><span class="es-header-icon">${GOOGLE_G}</span><div>` + (title ? `<div class="es-header-heading-text">${ratingWord(business.rating)} on Google</div>` : "") + `${headerRating(ctx)}</div></div>${writeButton(ctx)}`;
    } else if (layout === "header7") {
      inner = `<div class="es-header-info">${title ? `<span class="es-header-heading-logo">${GOOGLE_WORDMARK}</span>` : ""}${headerRating(ctx)}</div>${writeButton(ctx, "Write a Review")}`;
    } else if (layout === "header9") {
      inner = `<span class="es-header-icon">${GOOGLE_G}</span>` + (s.headerElements.includes("rating") ? `<div class="es-header-rating-container"><span class="es-rating-value">${business.rating.toFixed(1)}</span>${stars(business.rating, "es-header-rating")}</div>` : "") + (s.headerElements.includes("reviewsNumber") ? `<div class="es-header-reviews-total">${business.reviewCount.toLocaleString("en")} reviews</div>` : "") + writeButton(ctx);
    } else {
      inner = `<div class="es-header-info">` + (title ? `<div class="es-header-heading-container"><span class="es-header-heading-logo">${GOOGLE_WORDMARK}</span><span class="es-header-heading-text">Reviews</span></div>` : "") + `${headerRating(ctx)}</div>${writeButton(ctx)}`;
    }
    return `<div class="es-header-container es-header-${esc(layout)}">${inner}</div>`;
  }
  function widgetTitle(s) {
    if (!s.widgetTitle || !s.widgetTitleTitle.trim()) return "";
    return `<div class="es-widget-title-container"><h2 class="es-widget-title">${esc(s.widgetTitleTitle)}</h2>` + (s.widgetTitleCaption ? `<p class="es-widget-title-caption">${esc(s.widgetTitleCaption)}</p>` : "") + `</div>`;
  }
  function badge(ctx) {
    const { s, business } = ctx;
    const floating = s.badgeDisplayMode === "singleFloating";
    const label = s.badgeLabelType === "custom" && s.badgeLabelCustomText ? `<div class="es-badge-label">${esc(s.badgeLabelCustomText)}${s.badgeDisplayVerifiedBadge ? `<span class="es-verified-badge">${VERIFIED}</span>` : ""}</div>` : "";
    const ratingRow = s.badgeDisplayRating ? `<div class="es-badge-rating"><span class="es-rating-value">${business.rating.toFixed(1)}</span>${stars(business.rating)}</div>` : "";
    const count = s.badgeDisplayNumberOfReviews ? `<div class="es-badge-count">${business.reviewCount.toLocaleString("en")} reviews</div>` : "";
    const close = floating && s.badgeCloseButton ? `<button type="button" class="es-badge-close" data-action="close-badge" aria-label="Close badge">${CLOSE}</button>` : "";
    const clickable = s.badgeClickAction !== "none";
    const pos = s.badgeFloatingPosition;
    const [v, h] = (pos.position || "bottom-left").split("-");
    const style = floating ? ` style="${v === "top" ? "top" : "bottom"}:${Number(pos.verticalOffset) || 0}px;${h === "right" ? "right" : "left"}:${Number(pos.horizontalOffset) || 0}px"` : "";
    return `<div class="es-badge-wrapper es-badge-${floating ? "floating" : "inline"} es-badge-align-${esc(s.badgeInlinePosition)} es-badge-size-${esc(s.badgeSize)}"${style}><div class="es-badge"${clickable ? ' role="button" tabindex="0" data-action="badge-click"' : ""} aria-label="Reviews badge">${s.badgeDisplaySourceIcon ? `<span class="es-badge-icon">${GOOGLE_G}</span>` : ""}${label}${ratingRow}${count}</div>${close}</div>`;
  }
  function schemaJsonLd(business, reviews) {
    if (!business.reviewCount || !business.rating) return "";
    const data = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name || void 0,
      aggregateRating: { "@type": "AggregateRating", ratingValue: business.rating, reviewCount: business.reviewCount, bestRating: 5, worstRating: 1 },
      review: reviews.slice(0, 20).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.authorName || "Customer" },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        reviewBody: r.text || void 0,
        datePublished: r.publishedAt ? new Date(r.publishedAt * 1e3).toISOString().slice(0, 10) : void 0
      }))
    };
    return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}<\/script>`;
  }

  // widgets/google-reviews/carousel.ts
  var MOBILE_MAX = 500;
  var TABLET_MAX = 768;
  var DESKTOP_SMALL_MAX = 1024;
  var DESKTOP_MEDIUM_MAX = 1280;
  var AUTO_MIN_CARD = 260;
  var MAX_DOTS = 5;
  var SWIPE_MIN_PX = 40;
  function carouselColumns(s, width) {
    if (s.layout === "slider") return 1;
    if (s.carouselColumnsMode === "auto") {
      return Math.max(1, Math.min(5, Math.floor((width + s.carouselItemSpacing) / (AUTO_MIN_CARD + s.carouselItemSpacing))));
    }
    if (width < MOBILE_MAX) return s.carouselColumnsMobile;
    if (width < TABLET_MAX) return s.carouselColumnsTablet;
    if (width < DESKTOP_SMALL_MAX) return s.carouselColumnsDesktopSmall;
    if (width < DESKTOP_MEDIUM_MAX) return s.carouselColumnsDesktopMedium;
    return s.carouselColumnsDesktopLarge;
  }
  function carouselOpts(s) {
    const slider = s.layout === "slider";
    return {
      columns: (w) => carouselColumns(s, w),
      gap: s.carouselItemSpacing,
      autoplay: slider ? s.sliderAutoplay : s.carouselAutoplay,
      pauseOnHover: slider ? s.sliderAutoplayPauseOnHover : s.carouselAutoplayPauseOnHover,
      interval: slider ? s.sliderAutoplayInterval : s.carouselAutoplayInterval,
      speed: slider ? s.sliderAnimationSpeed : s.carouselAnimationSpeed,
      pagination: slider ? s.sliderPagination : s.carouselPagination,
      arrows: slider ? s.sliderArrowsEnable : s.carouselArrowsEnable,
      arrowsOnMobile: slider ? s.sliderArrowsOnMobileEnable : s.carouselArrowsOnMobileEnable,
      swipeDesktop: s.carouselSwipeDesktopEnable,
      swipeMobile: s.carouselSwipeMobileEnable
    };
  }
  function carouselHtml(cards) {
    return `<div class="es-carousel-layout"><div class="es-carousel-viewport"><div class="es-carousel-track swiper-wrapper">` + cards.map((c) => `<div class="es-carousel-slide swiper-slide"><div class="es-carousel-layout-item">${c}</div></div>`).join("") + `</div></div><button type="button" class="es-carousel-arrow es-carousel-arrow-prev" aria-label="Previous reviews">${CHEVRON}</button><button type="button" class="es-carousel-arrow es-carousel-arrow-next" aria-label="Next reviews">${CHEVRON}</button><div class="es-carousel-pagination"></div></div>`;
  }
  function dotWindow(count, active) {
    if (count <= 1) return [];
    const shown = Math.min(count, MAX_DOTS);
    const start = Math.max(0, Math.min(active - Math.floor(shown / 2), count - shown));
    return Array.from({ length: shown }, (_, i) => {
      const index = start + i;
      const d = Math.abs(index - active);
      return { index, size: d === 0 ? "main" : d === 1 ? "near" : "far" };
    });
  }
  function mountCarousel(root, o, signal) {
    var _a;
    const viewport = root.querySelector(".es-carousel-viewport");
    const track = root.querySelector(".es-carousel-track");
    const slides = Array.from(track.children);
    const prev = root.querySelector(".es-carousel-arrow-prev");
    const next = root.querySelector(".es-carousel-arrow-next");
    const dots = root.querySelector(".es-carousel-pagination");
    const on = { signal };
    const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoplay = o.autoplay && !reducedMotion;
    let index = 0;
    let cols = 1;
    let step = 0;
    let timer = null;
    let hovering = false;
    let focused = false;
    let frame = 0;
    const maxIndex = () => Math.max(0, slides.length - cols);
    function paint(animate = true) {
      var _a2, _b, _c;
      const focusedDot = dots.contains(document.activeElement);
      const focusedArrow = document.activeElement === prev ? prev : document.activeElement === next ? next : null;
      track.style.transitionDuration = animate ? `${o.speed}ms` : "0ms";
      track.style.transform = `translate3d(${-index * step}px,0,0)`;
      const mobile = root.clientWidth < MOBILE_MAX;
      const showArrows = o.arrows && (!mobile || o.arrowsOnMobile) && slides.length > cols;
      prev.hidden = !showArrows || !autoplay && index === 0;
      next.hidden = !showArrows || !autoplay && index >= maxIndex();
      dots.hidden = !o.pagination || slides.length <= cols;
      dots.innerHTML = dotWindow(maxIndex() + 1, index).map((d) => `<button type="button" class="es-carousel-dot es-dot-${d.size}${d.index === index ? " is-active" : ""}" data-index="${d.index}" aria-label="Go to review ${d.index + 1}"${d.index === index ? ' aria-current="true"' : ""}></button>`).join("");
      if (focusedDot) (_a2 = dots.querySelector(".is-active")) == null ? void 0 : _a2.focus();
      if (focusedArrow == null ? void 0 : focusedArrow.hidden) (focusedArrow === prev ? next : prev).focus();
      slides.forEach((sl, i) => {
        sl.inert = i < index || i >= index + cols;
      });
      if (cols === 1) viewport.style.height = `${(_c = (_b = slides[index]) == null ? void 0 : _b.offsetHeight) != null ? _c : 0}px`;
      else viewport.style.removeProperty("height");
    }
    function layout() {
      var _a2;
      const width = viewport.clientWidth;
      if (!width) return;
      (_a2 = o.onLayout) == null ? void 0 : _a2.call(o);
      cols = Math.max(1, Math.min(o.columns(root.clientWidth), slides.length || 1));
      const slideW = (width - o.gap * (cols - 1)) / cols;
      step = slideW + o.gap;
      track.style.gap = `${o.gap}px`;
      for (const sl of slides) sl.style.width = `${slideW}px`;
      index = Math.min(index, maxIndex());
      paint(false);
    }
    function scheduleLayout() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        layout();
      });
    }
    function go(to) {
      const max = maxIndex();
      index = to > max ? autoplay ? 0 : max : to < 0 ? autoplay ? max : 0 : to;
      paint();
    }
    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function startAutoplay() {
      stopAutoplay();
      if (!autoplay || slides.length <= cols) return;
      timer = setInterval(() => {
        if (o.pauseOnHover && hovering || focused || document.hidden) return;
        go(index + 1);
      }, o.interval);
    }
    prev.addEventListener("click", () => {
      go(index - 1);
      startAutoplay();
    }, on);
    next.addEventListener("click", () => {
      go(index + 1);
      startAutoplay();
    }, on);
    dots.addEventListener("click", (e) => {
      const dot = e.target.closest("[data-index]");
      if (dot) {
        go(Number(dot.dataset.index));
        startAutoplay();
      }
    }, on);
    root.addEventListener("mouseenter", () => {
      hovering = true;
    }, on);
    root.addEventListener("mouseleave", () => {
      hovering = false;
    }, on);
    root.addEventListener("focusin", () => {
      focused = true;
    }, on);
    root.addEventListener("focusout", (e) => {
      focused = root.contains(e.relatedTarget);
    }, on);
    track.addEventListener("load", scheduleLayout, { capture: true, signal });
    let startX = 0;
    let startY = 0;
    let dragging = false;
    viewport.addEventListener("pointerdown", (e) => {
      const mobile = root.clientWidth < MOBILE_MAX;
      if (!(mobile ? o.swipeMobile : o.swipeDesktop) || e.target.closest("a,button")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
    }, on);
    viewport.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(e.clientY - startY)) {
        go(index + (dx < 0 ? 1 : -1));
        startAutoplay();
      }
    }, on);
    viewport.addEventListener("pointercancel", () => {
      dragging = false;
    }, on);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleLayout) : null;
    ro == null ? void 0 : ro.observe(root);
    ro == null ? void 0 : ro.observe(track);
    (_a = document.fonts) == null ? void 0 : _a.ready.then(scheduleLayout).catch(() => void 0);
    layout();
    startAutoplay();
    const cleanup = () => {
      stopAutoplay();
      ro == null ? void 0 : ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    signal == null ? void 0 : signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }

  // widgets/google-reviews/popup.ts
  var FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var closeCurrent = null;
  function openPopup(themeSource, contentHtml, onMount) {
    var _a, _b;
    closeCurrent == null ? void 0 : closeCurrent();
    const previousFocus = document.activeElement;
    const root = document.createElement("div");
    root.className = "es-embed-root es-popup-root";
    root.setAttribute("style", (_a = themeSource.getAttribute("style")) != null ? _a : "");
    root.innerHTML = `<div class="es-popup-overlay" data-action="close-popup"></div><div class="es-popup-content-container" role="dialog" aria-modal="true" aria-label="Google reviews" tabindex="-1"><button type="button" class="es-popup-close" data-action="close-popup" aria-label="Close">${CLOSE}</button><div class="es-popup-content">${contentHtml}</div></div>`;
    document.body.appendChild(root);
    const dialog = root.querySelector(".es-popup-content-container");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter((el) => !el.hidden);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    function close() {
      var _a2;
      document.removeEventListener("keydown", onKey);
      root.remove();
      document.body.style.overflow = prevOverflow;
      if (closeCurrent === close) closeCurrent = null;
      const target = (previousFocus == null ? void 0 : previousFocus.isConnected) ? previousFocus : themeSource;
      (_a2 = target.focus) == null ? void 0 : _a2.call(target, { preventScroll: true });
    }
    root.addEventListener("click", (e) => {
      if (e.target.closest('[data-action="close-popup"]')) close();
    });
    document.addEventListener("keydown", onKey);
    closeCurrent = close;
    (_b = root.querySelector(".es-popup-close")) == null ? void 0 : _b.focus();
    onMount == null ? void 0 : onMount(root.querySelector(".es-popup-content"));
    return close;
  }

  // widgets/google-reviews/index.ts
  var AUTO_MIN_CARD2 = 260;
  var MOBILE_MAX2 = 500;
  var TABLET_MAX2 = 768;
  var FONT_LINK_ID = "shm-greviews-font-";
  var RATING_SIZE = { small: 14, medium: 16, large: 18 };
  var px = (n) => typeof n === "number" ? `${n}px` : void 0;
  function themeVars(t, s) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    const hasBg = Boolean(((_a = t.widgetBackground) == null ? void 0 : _a.color) && t.widgetBackground.color !== "transparent");
    const vars = {
      "--es-font": ((_b = t.font) == null ? void 0 : _b.value) ? `'${t.font.value.replace(/'/g, "")}', sans-serif` : void 0,
      "--es-title-color": t.widgetTitleTitleColor,
      "--es-title-caption-color": t.widgetTitleCaptionColor,
      "--es-title-align": t.widgetTitleAlignment,
      "--es-title-size": px((_c = t.widgetTitleTitleTextStyle) == null ? void 0 : _c.fontSize),
      "--es-title-weight": (_d = t.widgetTitleTitleTextStyle) == null ? void 0 : _d.fontWeight,
      "--es-widget-bg": (_e = t.widgetBackground) == null ? void 0 : _e.color,
      "--es-widget-radius": px((_f = t.widgetBackground) == null ? void 0 : _f.borderRadius),
      "--es-widget-pad-x": hasBg ? px(t.widgetHorizontalPadding) : "0px",
      "--es-widget-pad-y": hasBg ? px(t.widgetVerticalPadding) : "0px",
      "--es-review-bg": t.reviewBackgroundColor,
      "--es-review-outline": t.reviewOutlineColor,
      "--es-review-text": t.reviewTextColor,
      "--es-read-more": t.reviewReadMoreColor,
      "--es-verified": t.reviewVerifiedBadgeColor,
      "--es-source-name": t.reviewSourceNameColor,
      "--es-review-radius": px(t.reviewCornerRadius),
      "--es-review-font-size": px((_g = t.reviewTextFontSize) == null ? void 0 : _g.fontSize),
      "--es-star-size": px(RATING_SIZE[(_h = t.reviewRatingSize) != null ? _h : "medium"]),
      "--es-rating": t.ratingColor,
      "--es-header-bg": t.headerBackgroundColor,
      "--es-header-text": t.headerTextColor,
      "--es-header-radius": px(t.headerCornerRadius),
      "--es-btn-bg": (_i = t.writeReviewButton) == null ? void 0 : _i.color,
      "--es-btn-text": (_j = t.writeReviewButton) == null ? void 0 : _j.fontColor,
      "--es-btn-radius": px((_k = t.writeReviewButton) == null ? void 0 : _k.borderRadius),
      "--es-btn-font-size": px((_m = (_l = t.writeReviewButton) == null ? void 0 : _l.font) == null ? void 0 : _m.fontSize),
      "--es-btn-pad-x": px((_n = t.writeReviewButton) == null ? void 0 : _n.horizontalPadding),
      "--es-btn-pad-y": px((_o = t.writeReviewButton) == null ? void 0 : _o.verticalPadding),
      "--es-more-bg": (_p = t.loadMoreButton) == null ? void 0 : _p.color,
      "--es-more-text": (_q = t.loadMoreButton) == null ? void 0 : _q.fontColor,
      "--es-more-radius": px((_r = t.loadMoreButton) == null ? void 0 : _r.borderRadius),
      "--es-arrow-bg": t.carouselArrowBackgroundColor,
      "--es-arrow-color": t.carouselArrowColor,
      "--es-arrow-bg-hover": t.carouselArrowBackgroundColorOnHover,
      "--es-arrow-color-hover": t.carouselArrowColorOnHover,
      "--es-arrow-size": px(t.carouselArrowSize),
      "--es-arrow-offset": hasBg && typeof t.carouselArrowSize === "number" ? `${-t.carouselArrowSize / 2}px` : "0px",
      "--es-dot": t.carouselPaginationColor,
      "--es-popup-bg": t.popupBackgroundColor,
      "--es-popup-text": t.popupTextColor,
      "--es-popup-rating": t.popupRatingColor,
      "--es-popup-read-more": t.popupReviewReadMoreColor,
      "--es-badge-bg": t.badgeBackgroundColor,
      "--es-badge-text": t.badgeTextColor,
      "--es-badge-rating": t.badgeRatingColor,
      "--es-badge-radius": px(t.badgeCornerRadius),
      "--es-max-width": s.widgetWidth.auto ? "none" : `${s.widgetWidth.customValue}px`
    };
    return Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== void 0 && v !== ""));
  }
  function styleAttr(vars) {
    return Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/[;"<>{}]/g, "")}`).join(";");
  }
  function loadFont(t) {
    var _a, _b;
    const family = (_a = t.font) == null ? void 0 : _a.value;
    if (!family || ((_b = t.font) == null ? void 0 : _b.googleFont) === false) return;
    const id = FONT_LINK_ID + family.replace(/\W+/g, "-");
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }
  function columnsFor(s, width) {
    const auto = (gap) => Math.max(1, Math.min(5, Math.floor((width + gap) / (AUTO_MIN_CARD2 + gap))));
    const pick = (mode, gap, large, tablet, mobile) => {
      if (mode === "auto") return auto(gap);
      if (width < MOBILE_MAX2) return mobile;
      if (width < TABLET_MAX2) return tablet;
      return large;
    };
    if (s.layout === "list") return 1;
    if (s.layout === "masonry") {
      return pick(s.masonryColumnsMode, s.masonryItemSpacing, s.masonryColumnsDesktopLarge, s.masonryColumnsTablet, s.masonryColumnsMobile);
    }
    return pick(s.gridColumnsMode, s.gridItemSpacing, s.gridColumnsDesktopLarge, s.gridColumnsTablet, s.gridColumnsMobile);
  }
  function pageSize(s, width) {
    const mobile = width < MOBILE_MAX2;
    if (s.layout === "list") return mobile ? s.listItemsPerPageOnMobile : s.listItemsPerPage;
    if (s.layout === "masonry") return mobile ? s.masonryItemsPerPageOnMobile : s.masonryItemsPerPage;
    return columnsFor(s, width) * (mobile ? s.gridRowsOnMobile : s.gridRows);
  }
  function revealReadMore(scope) {
    scope.querySelectorAll(".es-text-shortener.es-is-clamped").forEach((el) => {
      var _a;
      const btn = (_a = el.parentElement) == null ? void 0 : _a.querySelector(".es-text-shortener-control");
      if (btn) btn.hidden = el.scrollHeight <= el.clientHeight + 1;
    });
  }
  function bindPopupReadMore(content) {
    requestAnimationFrame(() => revealReadMore(content));
    content.addEventListener("click", (e) => {
      var _a, _b;
      const btn = e.target.closest('[data-action="read-more"]');
      if (!btn) return;
      (_b = (_a = btn.parentElement) == null ? void 0 : _a.querySelector(".es-text-shortener")) == null ? void 0 : _b.classList.remove("es-is-clamped");
      btn.hidden = true;
    });
  }
  function renderPaged(body, s, cards, width, signal) {
    var _a;
    const size = Math.max(1, pageSize(s, width));
    let shown = Math.min(size, cards.length);
    const cls = s.layout === "list" ? "es-list-layout" : s.layout === "masonry" ? "es-masonry-layout" : "es-grid-layout";
    const gap = s.layout === "list" ? s.listItemSpacing : s.layout === "masonry" ? s.masonryItemSpacing : s.gridItemSpacing;
    const label = esc(((_a = s.theme.themeSettings.loadMoreButton) == null ? void 0 : _a.text) || "Load More");
    body.innerHTML = `<div class="${cls}" style="--es-cols:${columnsFor(s, width)};--es-gap:${gap}px">${cards.slice(0, shown).join("")}</div>` + (s.showLoadMoreButton && cards.length > shown ? `<div class="es-load-more-button-container"><button type="button" class="es-load-more-button">${label}</button></div>` : "");
    const more = body.querySelector(".es-load-more-button");
    more == null ? void 0 : more.addEventListener("click", () => {
      var _a2;
      const list2 = body.querySelector(`.${cls}`);
      list2.insertAdjacentHTML("beforeend", cards.slice(shown, shown + size).join(""));
      shown += size;
      revealReadMore(list2);
      if (shown >= cards.length) (_a2 = more.parentElement) == null ? void 0 : _a2.remove();
    }, { signal });
  }
  function openableUrl(v) {
    return /^https?:\/\//i.test(v.trim()) ? v.trim() : "";
  }
  var teardowns = /* @__PURE__ */ new WeakMap();
  function render(root, s, data) {
    var _a;
    (_a = teardowns.get(root)) == null ? void 0 : _a.abort();
    const controller = new AbortController();
    teardowns.set(root, controller);
    const { signal } = controller;
    const reviews = selectReviews(data.reviews, s);
    const ctx = { s, business: data.business };
    const cards = reviews.map((r) => reviewCard(r, ctx));
    const byId = new Map(reviews.map((r) => [r.id, r]));
    const popupCtx = { ...ctx, inPopup: true, s: { ...s, reviewLayout: "classic", reviewSourceStyle: "icon", reviewTextDisplayMode: "short" } };
    const fullList = () => header(ctx, true) + `<div class="es-popup-list">${reviews.map((r) => reviewCard(r, popupCtx)).join("")}</div>`;
    root.innerHTML = `<div class="es-main-container"><div class="es-widget-background-container">${widgetTitle(s)}${s.layout === "cardBadge" ? "" : header(ctx)}<div class="es-main-content"></div></div></div>` + (s.enableSchemaOrg ? schemaJsonLd(data.business, reviews) : "");
    if (s.customCSS.trim()) {
      const style = document.createElement("style");
      style.textContent = s.customCSS;
      root.prepend(style);
    }
    const body = root.querySelector(".es-main-content");
    const width = root.clientWidth || window.innerWidth;
    if (s.layout === "cardBadge") {
      body.innerHTML = badge(ctx);
    } else if (s.layout === "carousel" || s.layout === "slider") {
      if (cards.length) {
        body.innerHTML = carouselHtml(cards);
        mountCarousel(body, { ...carouselOpts(s), onLayout: () => revealReadMore(body) }, signal);
      }
    } else {
      renderPaged(body, s, cards, width, signal);
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => revealReadMore(body));
        ro.observe(root);
        signal.addEventListener("abort", () => ro.disconnect(), { once: true });
      }
    }
    root.classList.toggle("es-normalize-height", s.reviewHeightNormalization);
    requestAnimationFrame(() => revealReadMore(root));
    root.addEventListener("click", (e) => {
      var _a2, _b, _c;
      const target = e.target;
      const readMore = target.closest('[data-action="read-more"]');
      if (readMore) {
        const review = byId.get((_b = (_a2 = readMore.closest("[data-review-id]")) == null ? void 0 : _a2.dataset.reviewId) != null ? _b : "");
        if (review) openPopup(root, reviewCard(review, { ...ctx, full: true, inPopup: true }));
        return;
      }
      if (target.closest('[data-action="close-badge"]')) {
        (_c = target.closest(".es-badge-wrapper")) == null ? void 0 : _c.remove();
        return;
      }
      if (target.closest('[data-action="badge-click"]')) {
        const link = s.enableExternalLinks ? openableUrl(data.business.reviewsUrl) : "";
        if (s.badgeClickAction === "openLink" && link) window.open(link, "_blank", "noopener");
        else openPopup(root, fullList(), bindPopupReadMore);
      }
    }, { signal });
    root.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest('[data-action="badge-click"]')) {
        e.preventDefault();
        e.target.click();
      }
    }, { signal });
  }
  function showMessage(root, inEditor, message) {
    root.innerHTML = inEditor ? `<div class="es-editor-message">Google Reviews: ${esc(message)}</div>` : "";
  }
  async function googleReviews({ element, data }) {
    var _a, _b, _c;
    const config = (_a = data == null ? void 0 : data.config) != null ? _a : {};
    const s = readSettings(config);
    const src = readSource(config, s);
    const root = (_b = element.querySelector("[data-shm-main]")) != null ? _b : element;
    root.classList.remove(...Array.from(root.classList).filter((c) => c.startsWith("es-layout-")));
    root.classList.add("es-embed-root", `es-layout-${s.layout}`);
    const headerBg = (_c = s.theme.themeSettings.headerBackgroundColor) != null ? _c : "transparent";
    root.classList.toggle("es-header-has-bg", !/^(transparent|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\))$/i.test(headerBg.trim()));
    root.setAttribute("style", styleAttr(themeVars(s.theme.themeSettings, s)));
    loadFont(s.theme.themeSettings);
    root.classList.add("shm-ready");
    try {
      render(root, s, await loadReviews(src));
    } catch (e) {
      console.error("[google-reviews]", e);
      showMessage(root, Boolean(data == null ? void 0 : data.inEditor), e.message);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["google-reviews"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
