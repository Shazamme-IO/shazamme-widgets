/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 752533f45148. Registers window.ShazammeWidget["<name>"].
 */
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

  // widgets/consultant-card/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => consultantCard
  });

  // widgets/consultant-card/settings.ts
  var SOCIAL_ORDER = ["linkedin", "facebook", "twitter", "google", "wechat"];
  var LIMITS = {
    columns: { min: 1, max: 6 },
    maxConsultants: { min: 0, max: 100 },
    descriptionLines: { min: 0, max: 20 },
    sliderSpeed: { min: 2e3, max: 2e4 }
  };
  var MODES = ["team", "job"];
  var SORTS = ["default", "name"];
  var SHOWS = ["auto", "show", "hide"];
  var AVATARS = ["initials", "photo", "photo-with-initials-fallback"];
  var ITEM_LAYOUTS = ["stacked", "side", "portrait"];
  var ALIGNS = ["left", "center"];
  var LAYOUTS = ["grid", "slider"];
  var FILTER_ALIGNS = ["left", "center", "right"];
  function toText(v, fallback = "") {
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return fallback;
  }
  function toBool(v, fallback) {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return fallback;
  }
  function toInt(v, fallback, min, max) {
    const n = typeof v === "number" ? v : parseInt(String(v != null ? v : ""), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }
  function toChoice(v, allowed, fallback) {
    const s = toText(v).toLowerCase();
    return allowed.includes(s) ? s : fallback;
  }
  function resolveShow(v, autoValue) {
    const choice = toChoice(v, SHOWS, "auto");
    return choice === "auto" ? autoValue : choice === "show";
  }
  function textOr(v, fallback) {
    return toText(v, fallback) || fallback;
  }
  function social(show, icon, label, text, fallbackText) {
    return { show: toBool(show, false), icon: toBool(icon, true), label: toBool(label, false), text: textOr(text, fallbackText) };
  }
  function readSettings(config) {
    const c = config && typeof config === "object" ? config : {};
    const mode = toChoice(c.mode, MODES, "team");
    const isTeam = mode === "team";
    const showEmail = resolveShow(c.showEmail, !isTeam);
    const showPhone = resolveShow(c.showPhone, !isTeam);
    return {
      siteId: toText(c.siteId),
      mode,
      jobId: toText(c.jobID),
      classification: toText(c.classification).toLowerCase(),
      location: toText(c.location).toLowerCase(),
      maxConsultants: toInt(c.maxConsultants, 0, LIMITS.maxConsultants.min, LIMITS.maxConsultants.max),
      sortBy: toChoice(c.sortBy, SORTS, "default"),
      columnsDesktop: toInt(c.columnsDesktop, 4, LIMITS.columns.min, LIMITS.columns.max),
      columnsTablet: toInt(c.columnsTablet, 2, LIMITS.columns.min, LIMITS.columns.max),
      columnsMobile: toInt(c.columnsMobile, 1, LIMITS.columns.min, LIMITS.columns.max),
      eyebrow: toText(c.eyebrow, "Your consultant"),
      ariaLabel: textOr(c.ariaLabel, "Our consultants"),
      showRole: toBool(c.showRole, true),
      showLiveRoles: resolveShow(c.showLiveRoles, isTeam),
      showZeroRoles: toBool(c.showZeroRoles, false),
      liveRolesOne: textOr(c.liveRolesOne, "{n} live role"),
      liveRolesMany: textOr(c.liveRolesMany, "{n} live roles"),
      showEmail,
      showPhone,
      linkProfile: toBool(c.linkProfile, true),
      noConsultantMessage: toText(c.noConsultantMessage),
      avatar: toChoice(c.avatar, AVATARS, "initials"),
      itemLayout: toChoice(c.itemLayout, ITEM_LAYOUTS, "stacked"),
      align: toChoice(c.align, ALIGNS, "left"),
      showLocation: toBool(c.showLocation, false),
      showLocationIcon: toBool(c.showLocationIcon, false),
      showSector: toBool(c.showSector, false),
      showDescription: toBool(c.showDescription, false),
      descriptionLines: toInt(c.descriptionLines, 3, LIMITS.descriptionLines.min, LIMITS.descriptionLines.max),
      showButton: toBool(c.showButton, false),
      buttonText: textOr(c.buttonText, "View profile"),
      profilePage: toText(c.profilePage).replace(/^\/+|\/+$/g, ""),
      newTab: toBool(c.newTab, false),
      phone: { show: showPhone, icon: toBool(c.showPhoneIcon, false), label: toBool(c.showPhoneLabel, true) },
      mobile: { show: toBool(c.showMobile, false), icon: toBool(c.showMobileIcon, false), label: toBool(c.showMobileLabel, true) },
      email: { show: showEmail, icon: toBool(c.showEmailIcon, false), label: toBool(c.showEmailLabel, true) },
      socials: {
        linkedin: social(c.showLinkedin, c.showLinkedinIcon, c.showLinkedinLabel, c.linkedinText, "LinkedIn"),
        facebook: social(c.showFacebook, c.showFacebookIcon, c.showFacebookLabel, c.facebookText, "Facebook"),
        twitter: social(c.showTwitter, c.showTwitterIcon, c.showTwitterLabel, c.twitterText, "X"),
        google: social(c.showGoogle, c.showGoogleIcon, c.showGoogleLabel, c.googleText, "Google"),
        wechat: social(c.showWeChat, c.showWeChatIcon, c.showWeChatLabel, c.wechatText, "WeChat")
      },
      layout: toChoice(c.layout, LAYOUTS, "grid"),
      slidesToShow: toInt(c.slidesToShow, 3, LIMITS.columns.min, LIMITS.columns.max),
      autoplay: toBool(c.autoplay, false),
      sliderSpeed: toInt(c.sliderSpeed, 5e3, LIMITS.sliderSpeed.min, LIMITS.sliderSpeed.max),
      arrows: toBool(c.arrows, true),
      infinite: toBool(c.infinite, true),
      previousLabel: textOr(c.previousLabel, "Previous consultants"),
      nextLabel: textOr(c.nextLabel, "Next consultants"),
      pauseLabel: textOr(c.pauseLabel, "Pause"),
      playLabel: textOr(c.playLabel, "Play"),
      showClassificationFilter: toBool(c.showClassificationFilter, false),
      showLocationFilter: toBool(c.showLocationFilter, false),
      showSearch: toBool(c.showSearch, false),
      filterAllText: textOr(c.filterAllText, "All"),
      classificationFilterLabel: textOr(c.classificationFilterLabel, "Filter by sector"),
      locationFilterLabel: textOr(c.locationFilterLabel, "Filter by location"),
      searchPlaceholder: textOr(c.searchPlaceholder, "Search by name"),
      noMatchText: textOr(c.noMatchText, "No consultants match your search."),
      filterAlign: toChoice(c.filterAlign, FILTER_ALIGNS, "left")
    };
  }

  // widgets/consultant-card/data.ts
  var EMAIL_PATTERN = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  function safeUrl(v) {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s || /[\\\u0000-\u001f\u007f]/.test(s)) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    return "";
  }
  function plainText(v) {
    var _a;
    const html = typeof v === "string" ? v : "";
    if (!html) return "";
    if (!/[<&]/.test(html)) return html.trim();
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style").forEach((el) => el.remove());
    return ((_a = doc.body.textContent) != null ? _a : "").trim();
  }
  function hrefPath(v) {
    const url = safeUrl(v);
    if (!url) return "";
    if (url.startsWith("/")) return url === "/" ? "" : url;
    try {
      const u = new URL(url);
      return u.pathname === "/" ? "" : `${u.pathname}${u.search}`;
    } catch (e) {
      return "";
    }
  }
  function pathKey(v) {
    const href = hrefPath(v);
    return href ? href.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase() : "";
  }
  function cleanEmail(v) {
    const s = toText(v);
    return EMAIL_PATTERN.test(s) ? s : "";
  }
  var MIN_PHONE_DIGITS = 6;
  function telHref(phone) {
    const main = phone.split(/\s*(?:ext\.?(?=\s*\d)|x(?=\s*\d)|#)/i)[0];
    const digits = main.replace(/\D/g, "");
    if (digits.length < MIN_PHONE_DIGITS) return "";
    return `tel:${main.trim().startsWith("+") ? "+" : ""}${digits}`;
  }
  function initials(name) {
    var _a, _b, _c;
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = (_b = Array.from((_a = words[0]) != null ? _a : "")[0]) != null ? _b : "";
    const last = words.length > 1 ? (_c = Array.from(words[words.length - 1])[0]) != null ? _c : "" : "";
    return (first + last).toUpperCase() || "?";
  }
  function rowData(entry) {
    if (!entry || typeof entry !== "object") return null;
    const e = entry;
    const inner = e.data;
    return inner && typeof inner === "object" ? inner : e;
  }
  function parseList(v, objectKey) {
    const raw = typeof v === "string" ? v.trim() : Array.isArray(v) ? v : "";
    if (!raw) return [];
    let items = Array.isArray(raw) ? raw : null;
    if (!items && typeof raw === "string" && raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      } catch (e) {
        items = null;
      }
    }
    const values = items ? items.map((i) => {
      var _a, _b;
      return typeof i === "string" ? i : i && typeof i === "object" ? (_b = (_a = i[objectKey]) != null ? _a : i.Name) != null ? _b : i.name : "";
    }) : String(raw).split(",");
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const value of values) {
      const text = plainText(typeof value === "string" ? value : "");
      if (text && !seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        out.push(text);
      }
    }
    return out;
  }
  function photoUrl(row) {
    return safeUrl(row.photoURL) || safeUrl(row.externalPhotoURL) || safeUrl(row.s3URL);
  }
  var SOCIAL_FIELDS = {
    linkedin: "linkedInURL",
    facebook: "facebookURL",
    twitter: "twitterURL",
    google: "googleURL",
    wechat: "weChatURL"
  };
  function socialsOf(row) {
    const out = {};
    for (const [id, field] of Object.entries(SOCIAL_FIELDS)) {
      const url = safeUrl(row[field]);
      if (/^https?:\/\//i.test(url)) out[id] = url;
    }
    return out;
  }
  function toConsultant(row, index) {
    var _a;
    if (row.isVisible === false || row.isVisible === "false") return null;
    const name = [plainText(row.firstName), plainText(row.lastName)].filter(Boolean).join(" ");
    if (!name) return null;
    const sort = typeof row.sortOrder === "number" ? row.sortOrder : parseInt(String((_a = row.sortOrder) != null ? _a : ""), 10);
    const locations = parseList(row.businessLocation, "LocationName");
    const sectors = parseList(row.classification, "Profession");
    return {
      id: toText(row.consultantID, `row-${index}`).toLowerCase() || `row-${index}`,
      name,
      role: plainText(row.positionTitle),
      email: cleanEmail(row.eMail),
      phone: plainText(row.phone) || plainText(row.mobile),
      path: hrefPath(row.consultantURL),
      key: pathKey(row.consultantURL),
      classification: toText(row.classification).toLowerCase(),
      sortOrder: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER,
      phoneOnly: plainText(row.phone),
      mobile: plainText(row.mobile),
      photo: photoUrl(row),
      locations: locations.length ? locations : parseList(row.businessLocation2, "LocationName"),
      sectors: sectors.length ? sectors : parseList(row.classification2, "Profession"),
      description: plainText(row.shortDescription),
      socials: socialsOf(row)
    };
  }
  function normaliseConsultants(entries) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    entries.forEach((entry, index) => {
      const row = rowData(entry);
      const c = row ? toConsultant(row, index) : null;
      if (c) out.push(c);
    });
    return out;
  }
  function matchesAny(want, whole, entries) {
    if (!want) return true;
    if (whole && whole === want) return true;
    const wanted = want.split(",").map((w) => w.trim()).filter(Boolean);
    return entries.some((e) => wanted.includes(e.toLowerCase()));
  }
  function selectConsultants(all, s) {
    var _a;
    const location = (_a = s.location) != null ? _a : "";
    const filtered = s.classification || location ? all.filter((c) => matchesAny(s.classification, c.classification, c.sectors) && matchesAny(location, "", c.locations)) : all.slice();
    const sorted = s.sortBy === "name" ? filtered.sort((a, b) => a.name.localeCompare(b.name)) : filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    return s.maxConsultants > 0 ? sorted.slice(0, s.maxConsultants) : sorted;
  }
  function applyFilters(items, f) {
    const query = f.query.trim().toLowerCase();
    return items.filter(
      (c) => (!f.sector || c.sectors.some((x) => x.toLowerCase() === f.sector)) && (!f.location || c.locations.some((x) => x.toLowerCase() === f.location)) && (!query || c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query))
    );
  }
  function distinctValues(items, field) {
    const byLower = /* @__PURE__ */ new Map();
    for (const c of items) for (const v of c[field]) if (!byLower.has(v.toLowerCase())) byLower.set(v.toLowerCase(), v);
    return [...byLower.values()].sort((a, b) => a.localeCompare(b));
  }
  function profileHref(c, profilePage) {
    var _a;
    if (!c.path || !profilePage) return c.path;
    const slug = (_a = c.path.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop()) != null ? _a : "";
    return slug ? `/${profilePage.split("/").map(encodeURIComponent).join("/")}/${slug}` : c.path;
  }
  function isLive(row) {
    return !(row.activeStatus === false || row.activeStatus === "false");
  }
  function countLiveRoles(jobEntries, consultants) {
    var _a, _b;
    const rows = Array.isArray(jobEntries) ? jobEntries : [];
    const byEmail = /* @__PURE__ */ new Map();
    const byKey = /* @__PURE__ */ new Map();
    for (const c of consultants) {
      if (c.email) byEmail.set(c.email.toLowerCase(), c);
      if (c.key) byKey.set(c.key, c);
    }
    const matched = /* @__PURE__ */ new Map();
    for (const entry of rows) {
      const row = rowData(entry);
      if (!row || !isLive(row)) continue;
      const email = cleanEmail(row.contactEmail).toLowerCase();
      const key = pathKey(row.consultantURL);
      const owner = email && byEmail.get(email) || key && byKey.get(key) || null;
      if (owner) matched.set(owner.id, ((_a = matched.get(owner.id)) != null ? _a : 0) + 1);
    }
    if (matched.size === 0) return { known: false, counts: /* @__PURE__ */ new Map() };
    const counts = /* @__PURE__ */ new Map();
    for (const c of consultants) if (c.email || c.key) counts.set(c.id, (_b = matched.get(c.id)) != null ? _b : 0);
    return { known: true, counts };
  }
  function findJob(entries, jobId) {
    if (!Array.isArray(entries) || !jobId) return null;
    const want = jobId.toLowerCase();
    for (const entry of entries) {
      const row = rowData(entry);
      if (row && toText(row.jobID).toLowerCase() === want) return row;
    }
    return null;
  }
  function consultantForJob(job, consultants) {
    const email = cleanEmail(job.contactEmail);
    const key = pathKey(job.consultantURL);
    const match = email && consultants.find((c) => c.email.toLowerCase() === email.toLowerCase()) || key && consultants.find((c) => c.key === key) || null;
    if (match) return match;
    const name = plainText(job.contactName);
    if (!name) return null;
    const phone = plainText(job.contactPhone);
    return {
      id: "job-contact",
      name,
      role: "",
      email,
      phone,
      path: hrefPath(job.consultantURL),
      key,
      classification: "",
      sortOrder: 0,
      phoneOnly: phone,
      mobile: "",
      photo: "",
      locations: [],
      sectors: [],
      description: "",
      socials: {}
    };
  }
  function loadRows(sdk, collection, siteId, inEditor) {
    var _a;
    if (typeof sdk.fetch !== "function") return Promise.reject(new Error("The Shazamme SDK did not load."));
    const win = window;
    const cache = win.__shmCcFetch = (_a = win.__shmCcFetch) != null ? _a : {};
    const key = `${siteId}::${collection}`;
    const hit = cache[key];
    if (!inEditor && hit) return hit;
    const p = Promise.resolve(sdk.fetch({ name: collection }));
    if (!inEditor) {
      cache[key] = p;
      p.catch(() => {
        delete cache[key];
      });
    }
    return p;
  }
  async function consultantFromApi(sdk, jobId) {
    var _a, _b;
    if (typeof sdk.site !== "function" || typeof sdk.submit !== "function") return null;
    const site = await sdk.site();
    const res = await sdk.submit({ action: "Get Consultant By Job", jobID: jobId, siteID: site == null ? void 0 : site.siteID });
    const items = (_a = res == null ? void 0 : res.response) == null ? void 0 : _a.items;
    return (_b = normaliseConsultants(items)[0]) != null ? _b : null;
  }

  // widgets/consultant-card/icons.ts
  var outline = (body) => `<svg class="shm-cc-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  var brand = (d) => `<svg class="shm-cc-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  var ICONS = {
    phone: outline('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    mobile: outline('<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'),
    email: outline('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
    location: outline('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    previous: outline('<polyline points="15 18 9 12 15 6"/>'),
    next: outline('<polyline points="9 18 15 12 9 6"/>'),
    pause: outline('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'),
    play: outline('<polygon points="5 3 19 12 5 21 5 3"/>'),
    person: outline('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')
  };
  var SOCIAL_ICONS = {
    linkedin: brand("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"),
    facebook: brand("M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"),
    twitter: brand("M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"),
    google: brand("M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"),
    wechat: brand("M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z")
  };

  // widgets/consultant-card/render.ts
  function esc(v) {
    return String(v != null ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function liveRolesText(n, s) {
    return (n === 1 ? s.liveRolesOne : s.liveRolesMany).replace(/\{n\}/g, String(n));
  }
  var NEW_TAB = ' target="_blank" rel="noopener"';
  function targetAttr(s) {
    return s.newTab ? NEW_TAB : "";
  }
  function nameHtml(c, s) {
    const href = profileHref(c, s.profilePage);
    return s.linkProfile && href ? `<a class="shm-cc-name" href="${esc(href)}"${targetAttr(s)}>${esc(c.name)}</a>` : `<span class="shm-cc-name">${esc(c.name)}</span>`;
  }
  function avatarHtml(c, s) {
    const badge = `<span class="shm-cc-badge" aria-hidden="true">${esc(initials(c.name))}</span>`;
    if (s.avatar === "initials") return badge;
    if (!c.photo) return s.avatar === "photo" ? `<span class="shm-cc-photo is-missing" aria-hidden="true">${ICONS.person}</span>` : badge;
    return `<span class="shm-cc-photo" aria-hidden="true" data-initials="${esc(initials(c.name))}"><img class="shm-cc-photo-img" src="${esc(c.photo)}" alt="" width="64" height="64" loading="lazy" decoding="async"></span>`;
  }
  function contactLink(cls, href, text, item, icon) {
    if (!href || !item.icon && !item.label) return "";
    if (!item.icon) return `<a class="${cls}" href="${esc(href)}">${esc(text)}</a>`;
    const label = item.label ? `<span class="shm-cc-text">${esc(text)}</span>` : "";
    const named = item.label ? "" : ` aria-label="${esc(text)}"`;
    return `<a class="${cls} has-icon${item.label ? "" : " is-icon-only"}" href="${esc(href)}"${named}>${icon}${label}</a>`;
  }
  function contactHtml(c, s) {
    const phone = s.mobile.show ? c.phoneOnly : c.phone;
    const shown = [
      s.phone.show && phone ? { item: s.phone, html: contactLink("shm-cc-phone", telHref(phone), phone, s.phone, ICONS.phone) } : null,
      s.mobile.show && c.mobile ? { item: s.mobile, html: contactLink("shm-cc-mobile", telHref(c.mobile), c.mobile, s.mobile, ICONS.mobile) } : null,
      s.email.show && c.email ? { item: s.email, html: contactLink("shm-cc-email", `mailto:${c.email}`, c.email, s.email, ICONS.email) } : null
    ].filter((p) => Boolean(p && p.html));
    if (!shown.length) return "";
    const iconsOnly = shown.every((p) => !p.item.label);
    return `<span class="shm-cc-contact${iconsOnly ? " is-icons" : ""}">${shown.map((p) => p.html).join("")}</span>`;
  }
  function socialHtml(c, s) {
    const links = SOCIAL_ORDER.map((id) => {
      const cfg = s.socials[id];
      const url = c.socials[id];
      if (!cfg.show || !url || !cfg.icon && !cfg.label) return "";
      const text = cfg.label ? `<span class="shm-cc-text">${esc(cfg.text)}</span>` : "";
      return `<a class="shm-cc-social-link shm-cc-${id}${cfg.label ? "" : " is-icon-only"}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${cfg.text}: ${c.name}`)}">${cfg.icon ? SOCIAL_ICONS[id] : ""}${text}</a>`;
    }).filter(Boolean);
    return links.length ? `<span class="shm-cc-social">${links.join("")}</span>` : "";
  }
  function metaHtml(c, s) {
    const location = s.showLocation && c.locations.length ? `<span class="shm-cc-meta shm-cc-location">${s.showLocationIcon ? ICONS.location : ""}<span class="shm-cc-text">${esc(c.locations.join(", "))}</span></span>` : "";
    const sector = s.showSector && c.sectors.length ? `<span class="shm-cc-meta shm-cc-sector">${esc(c.sectors.join(", "))}</span>` : "";
    return location + sector;
  }
  function descriptionHtml(c, s) {
    if (!s.showDescription || !c.description) return "";
    const attrs = s.descriptionLines > 0 ? ` class="shm-cc-desc is-clamped" style="--shm-cc-lines: ${s.descriptionLines}"` : ` class="shm-cc-desc"`;
    return `<p${attrs}>${esc(c.description)}</p>`;
  }
  function buttonHtml(c, s) {
    const href = profileHref(c, s.profilePage);
    if (!s.showButton || !href) return "";
    return `<span class="shm-cc-actions"><a class="shm-cc-button" href="${esc(href)}"${targetAttr(s)}>${esc(s.buttonText)}</a></span>`;
  }
  function liveHtml(c, s, counts) {
    if (!s.showLiveRoles || counts === null) return "";
    const n = counts.get(c.id);
    if (n === void 0 || n === 0 && !s.showZeroRoles) return "";
    return `<span class="shm-cc-live">${esc(liveRolesText(n, s))}</span>`;
  }
  function cardHtml(c, s, counts) {
    const role = s.showRole && c.role ? `<span class="shm-cc-role">${esc(c.role)}</span>` : "";
    return `<article class="shm-cc-card">` + avatarHtml(c, s) + `<span class="shm-cc-id">${nameHtml(c, s)}${role}${metaHtml(c, s)}</span>${descriptionHtml(c, s)}${contactHtml(c, s)}${socialHtml(c, s)}${liveHtml(c, s, counts)}${buttonHtml(c, s)}</article>`;
  }
  function itemsHtml(items, s, counts) {
    return items.map((c) => `<li class="shm-cc-item">${cardHtml(c, s, counts)}</li>`).join("");
  }
  function teamHtml(items, s, counts) {
    return `<ul class="shm-cc-grid" role="list" aria-label="${esc(s.ariaLabel)}">${itemsHtml(items, s, counts)}</ul>`;
  }
  function controlButton(cls, hook, label, icon) {
    return `<button type="button" class="shm-cc-arrow ${cls}" ${hook} aria-label="${esc(label)}">${icon}</button>`;
  }
  function sliderHtml(items, s, counts) {
    const pause = s.autoplay ? controlButton("shm-cc-pause", "data-shm-cc-pause", s.pauseLabel, ICONS.pause) : "";
    const arrows = s.arrows ? controlButton("shm-cc-prev", "data-shm-cc-prev", s.previousLabel, ICONS.previous) + controlButton("shm-cc-next", "data-shm-cc-next", s.nextLabel, ICONS.next) : "";
    const controls = pause || arrows ? `<div class="shm-cc-controls">${pause}${arrows}</div>` : "";
    return `<div class="shm-cc-slider" role="region" aria-roledescription="carousel" aria-label="${esc(s.ariaLabel)}"><ul class="shm-cc-grid shm-cc-track" role="list" tabindex="0" aria-label="${esc(s.ariaLabel)}" data-shm-cc-track>${itemsHtml(items, s, counts)}</ul>${controls}</div>`;
  }
  function listHtml(items, s, counts) {
    if (!items.length) return `<p class="shm-cc-empty shm-cc-nomatch">${esc(s.noMatchText)}</p>`;
    return s.layout === "slider" ? sliderHtml(items, s, counts) : teamHtml(items, s, counts);
  }
  function filterGroup(kind, label, values, s) {
    if (!values.length) return "";
    const button = (value, text, pressed) => `<button type="button" class="shm-cc-filter" aria-pressed="${pressed}" data-value="${esc(value.toLowerCase())}">${esc(text)}</button>`;
    return `<div class="shm-cc-filters" role="group" aria-label="${esc(label)}" data-shm-cc-group="${kind}">` + button("", s.filterAllText, true) + values.map((v) => button(v, v, false)).join("") + `</div>`;
  }
  function toolsHtml(uid, s, values, list) {
    const search = s.showSearch ? `<div class="shm-cc-search"><label class="shm-cc-sr" for="${uid}-q">${esc(s.searchPlaceholder)}</label><input class="shm-cc-search-input" id="${uid}-q" type="search" placeholder="${esc(s.searchPlaceholder)}" autocomplete="off" data-shm-cc-search></div>` : "";
    const sectors = s.showClassificationFilter ? filterGroup("sector", s.classificationFilterLabel, values.sectors, s) : "";
    const locations = s.showLocationFilter ? filterGroup("location", s.locationFilterLabel, values.locations, s) : "";
    return `<div class="shm-cc-tools">${search}${sectors}${locations}</div><div class="shm-cc-results" data-shm-cc-results>${list}</div><p class="shm-cc-sr" role="status" data-shm-cc-status></p>`;
  }
  function jobHtml(c, s, counts) {
    const eyebrow = s.eyebrow ? `<span class="shm-cc-eyebrow">${esc(s.eyebrow)}</span>` : "";
    return `<section class="shm-cc-job" aria-label="${esc(s.eyebrow || s.ariaLabel)}">${eyebrow}${cardHtml(c, s, counts)}</section>`;
  }

  // widgets/consultant-card/slider.ts
  var EDGE = 2;
  var noop = () => void 0;
  function prefersReducedMotion() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function moveTo(track, left, smooth) {
    if (typeof track.scrollTo === "function") track.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    else track.scrollLeft = left;
  }
  function mountSlider(scope, s) {
    const slider = scope.querySelector(".shm-cc-slider");
    const track = slider == null ? void 0 : slider.querySelector("[data-shm-cc-track]");
    if (!slider || !track) return noop;
    const prev = slider.querySelector("[data-shm-cc-prev]");
    const next = slider.querySelector("[data-shm-cc-next]");
    const pauseButton = slider.querySelector("[data-shm-cc-pause]");
    const reduced = prefersReducedMotion();
    const smooth = !reduced;
    const max = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const atStart = () => track.scrollLeft <= EDGE;
    const atEnd = () => track.scrollLeft >= max() - EDGE;
    const step = () => {
      const item = track.querySelector(".shm-cc-item");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
    };
    const sync = () => {
      const gap = getComputedStyle(track).columnGap;
      if (gap && gap !== "normal") track.style.setProperty("--shm-cc-gap-px", gap);
      const isStatic = max() <= EDGE;
      slider.classList.toggle("is-static", isStatic);
      if (isStatic) track.removeAttribute("tabindex");
      else track.setAttribute("tabindex", "0");
      if (s.infinite) return;
      prev == null ? void 0 : prev.setAttribute("aria-disabled", String(atStart()));
      next == null ? void 0 : next.setAttribute("aria-disabled", String(atEnd()));
    };
    const go = (dir, wrap) => {
      if (dir > 0 && atEnd()) {
        if (wrap) moveTo(track, 0, smooth);
        return;
      }
      if (dir < 0 && atStart()) {
        if (wrap) moveTo(track, max(), smooth);
        return;
      }
      if (typeof track.scrollBy === "function") track.scrollBy({ left: dir * step(), behavior: smooth ? "smooth" : "auto" });
      else track.scrollLeft += dir * step();
    };
    const onPrev = () => go(-1, s.infinite);
    const onNext = () => go(1, s.infinite);
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1, s.infinite);
    };
    let frame = 0;
    const onScroll = () => {
      if (typeof requestAnimationFrame !== "function") return sync();
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    prev == null ? void 0 : prev.addEventListener("click", onPrev);
    next == null ? void 0 : next.addEventListener("click", onNext);
    track.addEventListener("keydown", onKey);
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(sync) : null;
    observer == null ? void 0 : observer.observe(track);
    sync();
    const stopAutoplay = s.autoplay ? startAutoplay(slider, track, pauseButton, s, reduced, () => go(1, true)) : noop;
    return () => {
      stopAutoplay();
      observer == null ? void 0 : observer.disconnect();
      if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      prev == null ? void 0 : prev.removeEventListener("click", onPrev);
      next == null ? void 0 : next.removeEventListener("click", onNext);
      track.removeEventListener("keydown", onKey);
      track.removeEventListener("scroll", onScroll);
    };
  }
  function startAutoplay(slider, track, pauseButton, s, reduced, advance) {
    let paused = reduced;
    let hovered = false;
    let focused = false;
    const label = () => {
      if (!pauseButton) return;
      pauseButton.setAttribute("aria-label", paused ? s.playLabel : s.pauseLabel);
      pauseButton.innerHTML = paused ? ICONS.play : ICONS.pause;
      slider.classList.toggle("is-paused", paused);
    };
    const onToggle = () => {
      paused = !paused;
      label();
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = (e) => {
      focused = track.contains(e.target);
    };
    const onFocusOut = (e) => {
      focused = track.contains(e.relatedTarget);
    };
    pauseButton == null ? void 0 : pauseButton.addEventListener("click", onToggle);
    slider.addEventListener("mouseenter", onEnter);
    slider.addEventListener("mouseleave", onLeave);
    slider.addEventListener("focusin", onFocusIn);
    slider.addEventListener("focusout", onFocusOut);
    label();
    const timer = window.setInterval(() => {
      if (paused || hovered || focused || document.visibilityState === "hidden") return;
      advance();
    }, s.sliderSpeed);
    return () => {
      window.clearInterval(timer);
      pauseButton == null ? void 0 : pauseButton.removeEventListener("click", onToggle);
      slider.removeEventListener("mouseenter", onEnter);
      slider.removeEventListener("mouseleave", onLeave);
      slider.removeEventListener("focusin", onFocusIn);
      slider.removeEventListener("focusout", onFocusOut);
    };
  }

  // widgets/consultant-card/team.ts
  var instances = 0;
  function hasTools(s) {
    return s.showSearch || s.showClassificationFilter || s.showLocationFilter;
  }
  function editorNotes(s, sectors, locations) {
    const notes = [
      s.showClassificationFilter && !sectors.length ? "no consultant has a sector (classification), so the sector buttons are hidden." : "",
      s.showLocationFilter && !locations.length ? "no consultant has a location, so the location buttons are hidden." : ""
    ].filter(Boolean);
    return notes.map((n) => `<div class="shm-cc-editor-note" role="note">Consultant Card: ${esc(n)}</div>`).join("");
  }
  function mountTeam(stage, items, s, counts, inEditor) {
    if (!hasTools(s)) {
      stage.innerHTML = listHtml(items, s, counts);
      return mountSlider(stage, s);
    }
    const uid = `shm-cc-${++instances}`;
    const sectors = distinctValues(items, "sectors");
    const locations = distinctValues(items, "locations");
    const notes = inEditor ? editorNotes(s, sectors, locations) : "";
    stage.innerHTML = notes + toolsHtml(uid, s, { sectors, locations }, listHtml(items, s, counts));
    const results = stage.querySelector("[data-shm-cc-results]");
    const status = stage.querySelector("[data-shm-cc-status]");
    const tools = stage.querySelector(".shm-cc-tools");
    const search = stage.querySelector("[data-shm-cc-search]");
    let active = { sector: "", location: "", query: "" };
    let teardownSlider = mountSlider(results, s);
    const update = (next) => {
      active = next;
      teardownSlider();
      const shown = applyFilters(items, active);
      results.innerHTML = listHtml(shown, s, counts);
      status.textContent = shown.length ? "" : s.noMatchText;
      teardownSlider = mountSlider(results, s);
    };
    const onClick = (e) => {
      var _a, _b, _c;
      const button = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, ".shm-cc-filter");
      const group = button == null ? void 0 : button.closest("[data-shm-cc-group]");
      if (!button || !group) return;
      group.querySelectorAll(".shm-cc-filter").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      const value = (_c = button.getAttribute("data-value")) != null ? _c : "";
      update(group.getAttribute("data-shm-cc-group") === "sector" ? { ...active, sector: value } : { ...active, location: value });
    };
    const onInput = () => {
      var _a;
      return update({ ...active, query: (_a = search == null ? void 0 : search.value) != null ? _a : "" });
    };
    tools.addEventListener("click", onClick);
    search == null ? void 0 : search.addEventListener("input", onInput);
    return () => {
      teardownSlider();
      tools.removeEventListener("click", onClick);
      search == null ? void 0 : search.removeEventListener("input", onInput);
    };
  }

  // widgets/consultant-card/index.ts
  var WIDGET_NAME = "consultant-card";
  var CONSULTANTS = "Consultants";
  var JOBS = "Jobs";
  var GENERIC_ERROR = "The consultants could not be loaded.";
  var OPTION_CLASS_PREFIXES = ["is-mode-", "is-item-", "is-align-", "is-layout-", "is-filters-"];
  function ensureShell(element) {
    let root = element.querySelector(".shm-cc");
    if (!root) {
      root = document.createElement("div");
      root.className = "shm-cc";
      element.appendChild(root);
    }
    let stage = root.querySelector(".shm-cc-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "shm-cc-stage";
      root.appendChild(stage);
    }
    return { root, stage };
  }
  function optionClasses(s) {
    return [
      `is-mode-${s.mode}`,
      s.mode === "team" && s.itemLayout !== "stacked" ? `is-item-${s.itemLayout}` : "",
      s.align !== "left" ? `is-align-${s.align}` : "",
      s.mode === "team" && s.layout !== "grid" ? `is-layout-${s.layout}` : "",
      s.filterAlign !== "left" ? `is-filters-${s.filterAlign}` : ""
    ].filter(Boolean);
  }
  function applyShell(root, s) {
    Array.from(root.classList).filter((c) => OPTION_CLASS_PREFIXES.some((p) => c.startsWith(p))).forEach((c) => root.classList.remove(c));
    optionClasses(s).forEach((c) => root.classList.add(c));
    root.classList.remove("is-ready", "is-empty");
    root.hidden = false;
    const slider = s.mode === "team" && s.layout === "slider";
    root.style.setProperty("--shm-cc-cols-d", String(slider ? s.slidesToShow : s.columnsDesktop));
    root.style.setProperty("--shm-cc-cols-t", String(slider ? Math.min(s.columnsTablet, s.slidesToShow) : s.columnsTablet));
    root.style.setProperty("--shm-cc-cols-m", String(slider ? Math.min(s.columnsMobile, s.slidesToShow) : s.columnsMobile));
  }
  function showNote(root, stage, inEditor, message, liveMessage = "") {
    if (inEditor) stage.innerHTML = `<div class="shm-cc-editor-note" role="note">Consultant Card: ${esc(message)}</div>`;
    else stage.innerHTML = liveMessage ? `<p class="shm-cc-empty">${esc(liveMessage)}</p>` : "";
    root.classList.add("is-ready");
    if (!inEditor && !liveMessage) {
      root.classList.add("is-empty");
      root.hidden = true;
    }
  }
  function countsFrom(jobs, consultants) {
    if (jobs === null) return null;
    const result = countLiveRoles(jobs, consultants);
    return result.known ? result.counts : null;
  }
  function noMatchNote(all, s) {
    if (all.length === 0) return "the Consultants collection has no visible rows.";
    if (s.classification && s.location) return `no consultants match the Classification "${s.classification}" and the Location "${s.location}".`;
    if (s.location) return `no consultants match the Location "${s.location}".`;
    return `no consultants match the Classification "${s.classification}".`;
  }
  async function renderTeam(sdk, s, siteId, inEditor) {
    const consultantsLoad = loadRows(sdk, CONSULTANTS, siteId, inEditor);
    const countsLoad = s.showLiveRoles ? loadRows(sdk, JOBS, siteId, inEditor).catch((err) => {
      console.error("[consultant-card] live roles unavailable", err);
      return null;
    }) : Promise.resolve(null);
    const all = normaliseConsultants(await consultantsLoad);
    const items = selectConsultants(all, s);
    if (items.length === 0) return { note: noMatchNote(all, s) };
    return { team: items, counts: countsFrom(await countsLoad, all) };
  }
  async function ownerOfJob(sdk, s, siteId, inEditor) {
    const [jobRows, consultantRows] = await Promise.all([
      loadRows(sdk, JOBS, siteId, inEditor).catch((err) => {
        console.error("[consultant-card] jobs unavailable", err);
        return null;
      }),
      loadRows(sdk, CONSULTANTS, siteId, inEditor).catch(() => [])
    ]);
    const all = normaliseConsultants(consultantRows);
    const job = findJob(jobRows, s.jobId);
    const fromJob = job ? consultantForJob(job, all) : null;
    if (fromJob) return { consultant: fromJob, all, jobRows };
    return { consultant: await consultantFromApi(sdk, s.jobId).catch(() => null), all, jobRows };
  }
  async function renderJob(sdk, s, siteId, inEditor) {
    if (!s.jobId) {
      return { note: "connect the Job ID field to the page's job, so the card knows which job it is on.", live: s.noConsultantMessage };
    }
    const { consultant, all, jobRows } = await ownerOfJob(sdk, s, siteId, inEditor);
    if (!consultant) return { note: `no consultant is assigned to job ${s.jobId}.`, live: s.noConsultantMessage };
    const everyone = all.some((c) => c.id === consultant.id) ? all : [...all, consultant];
    return { html: jobHtml(consultant, s, s.showLiveRoles ? countsFrom(jobRows, everyone) : null) };
  }
  function photoErrorHandler(s) {
    return (e) => {
      var _a;
      const img = e.target;
      if (!img || img.tagName !== "IMG" || !img.classList.contains("shm-cc-photo-img")) return;
      const holder = img.parentElement;
      if (!holder) return;
      if (s.avatar === "photo-with-initials-fallback") {
        const badge = document.createElement("span");
        badge.className = "shm-cc-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = (_a = holder.getAttribute("data-initials")) != null ? _a : "";
        holder.replaceWith(badge);
      } else {
        holder.classList.add("is-missing");
        holder.innerHTML = ICONS.person;
      }
    };
  }
  var runs = /* @__PURE__ */ new WeakMap();
  async function consultantCard(ctx) {
    var _a, _b, _c, _d, _e, _f, _g;
    const element = ctx == null ? void 0 : ctx.element;
    if (!element || typeof element.querySelector !== "function") return;
    (_a = element.__shmCcDestroy) == null ? void 0 : _a.call(element);
    const data = (_b = ctx.data) != null ? _b : {};
    const inEditor = Boolean(data.inEditor);
    const s = readSettings(data.config);
    const { root, stage } = ensureShell(element);
    applyShell(root, s);
    stage.innerHTML = "";
    let teardown = () => void 0;
    const onPhotoError = photoErrorHandler(s);
    stage.addEventListener("error", onPhotoError, true);
    element.__shmCcDestroy = () => {
      teardown();
      stage.removeEventListener("error", onPhotoError, true);
      stage.innerHTML = "";
    };
    const run = ((_c = runs.get(element)) != null ? _c : 0) + 1;
    runs.set(element, run);
    const current = () => runs.get(element) === run;
    try {
      const sdk = (_d = ctx.shazamme) != null ? _d : window.shazamme;
      if (!sdk) throw new Error("The Shazamme SDK did not load.");
      const siteId = s.siteId || String((_e = data.siteId) != null ? _e : "");
      await Promise.resolve((_f = sdk.ready) == null ? void 0 : _f.call(sdk, siteId, data.page));
      (_g = sdk.register) == null ? void 0 : _g.call(sdk, WIDGET_NAME, data);
      if (!current()) return;
      const outcome = s.mode === "job" ? await renderJob(sdk, s, siteId, inEditor) : await renderTeam(sdk, s, siteId, inEditor);
      if (!current()) return;
      if ("team" in outcome) {
        teardown = mountTeam(stage, outcome.team, s, outcome.counts, inEditor);
        root.classList.add("is-ready");
      } else if ("html" in outcome) {
        stage.innerHTML = outcome.html;
        root.classList.add("is-ready");
      } else {
        showNote(root, stage, inEditor, outcome.note, outcome.live);
      }
    } catch (err) {
      if (!current()) return;
      console.error("[consultant-card]", err);
      showNote(root, stage, inEditor, err instanceof Error && err.message ? err.message : GENERIC_ERROR);
    }
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["consultant-card"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
