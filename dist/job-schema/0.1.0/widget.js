/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build cd7a8f3d27cb. Registers window.ShazammeWidget["<name>"].
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

  // dist/.gen/job-schema.index.js
  var job_schema_index_exports = {};
  __export(job_schema_index_exports, {
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

  // dist/.gen/job-schema.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    var cfg = data && data.config || {};
    var host = element && element.jquery ? element[0] : element;
    if (!host) {
      return;
    }
    var EDITOR_LABEL = "SCHEMA MARKUP ( This text will only show on the editor. )";
    var EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY", "INTERN", "VOLUNTEER", "PER_DIEM", "OTHER"];
    var ISO_DATE = /^\d{4}-\d{2}-\d{2}/;
    var COUNTRY_CODES = {
      "afghanistan": "AF",
      "albania": "AL",
      "algeria": "DZ",
      "andorra": "AD",
      "angola": "AO",
      "argentina": "AR",
      "armenia": "AM",
      "australia": "AU",
      "austria": "AT",
      "azerbaijan": "AZ",
      "bahamas": "BS",
      "bahrain": "BH",
      "bangladesh": "BD",
      "barbados": "BB",
      "belarus": "BY",
      "belgium": "BE",
      "belize": "BZ",
      "benin": "BJ",
      "bhutan": "BT",
      "bolivia": "BO",
      "bosnia and herzegovina": "BA",
      "botswana": "BW",
      "brazil": "BR",
      "brunei": "BN",
      "bulgaria": "BG",
      "burkina faso": "BF",
      "burundi": "BI",
      "cambodia": "KH",
      "cameroon": "CM",
      "canada": "CA",
      "cape verde": "CV",
      "central african republic": "CF",
      "chad": "TD",
      "chile": "CL",
      "china": "CN",
      "colombia": "CO",
      "comoros": "KM",
      "congo": "CG",
      "costa rica": "CR",
      "croatia": "HR",
      "cuba": "CU",
      "cyprus": "CY",
      "czech republic": "CZ",
      "czechia": "CZ",
      "denmark": "DK",
      "djibouti": "DJ",
      "dominica": "DM",
      "dominican republic": "DO",
      "ecuador": "EC",
      "egypt": "EG",
      "el salvador": "SV",
      "equatorial guinea": "GQ",
      "eritrea": "ER",
      "estonia": "EE",
      "eswatini": "SZ",
      "ethiopia": "ET",
      "fiji": "FJ",
      "finland": "FI",
      "france": "FR",
      "gabon": "GA",
      "gambia": "GM",
      "georgia": "GE",
      "germany": "DE",
      "ghana": "GH",
      "greece": "GR",
      "grenada": "GD",
      "guatemala": "GT",
      "guinea": "GN",
      "guyana": "GY",
      "haiti": "HT",
      "honduras": "HN",
      "hong kong": "HK",
      "hungary": "HU",
      "iceland": "IS",
      "india": "IN",
      "indonesia": "ID",
      "iraq": "IQ",
      "ireland": "IE",
      "israel": "IL",
      "italy": "IT",
      "ivory coast": "CI",
      "jamaica": "JM",
      "japan": "JP",
      "jordan": "JO",
      "kazakhstan": "KZ",
      "kenya": "KE",
      "kiribati": "KI",
      "kosovo": "XK",
      "kuwait": "KW",
      "kyrgyzstan": "KG",
      "laos": "LA",
      "latvia": "LV",
      "lebanon": "LB",
      "lesotho": "LS",
      "liberia": "LR",
      "libya": "LY",
      "liechtenstein": "LI",
      "lithuania": "LT",
      "luxembourg": "LU",
      "macau": "MO",
      "madagascar": "MG",
      "malawi": "MW",
      "malaysia": "MY",
      "maldives": "MV",
      "mali": "ML",
      "malta": "MT",
      "marshall islands": "MH",
      "mauritania": "MR",
      "mauritius": "MU",
      "mexico": "MX",
      "micronesia": "FM",
      "moldova": "MD",
      "monaco": "MC",
      "mongolia": "MN",
      "montenegro": "ME",
      "morocco": "MA",
      "mozambique": "MZ",
      "myanmar": "MM",
      "namibia": "NA",
      "nauru": "NR",
      "nepal": "NP",
      "netherlands": "NL",
      "new zealand": "NZ",
      "nicaragua": "NI",
      "niger": "NE",
      "nigeria": "NG",
      "north macedonia": "MK",
      "norway": "NO",
      "oman": "OM",
      "pakistan": "PK",
      "palau": "PW",
      "palestine": "PS",
      "panama": "PA",
      "papua new guinea": "PG",
      "paraguay": "PY",
      "peru": "PE",
      "philippines": "PH",
      "poland": "PL",
      "portugal": "PT",
      "qatar": "QA",
      "romania": "RO",
      "russia": "RU",
      "rwanda": "RW",
      "saint kitts and nevis": "KN",
      "saint lucia": "LC",
      "samoa": "WS",
      "san marino": "SM",
      "saudi arabia": "SA",
      "senegal": "SN",
      "serbia": "RS",
      "seychelles": "SC",
      "sierra leone": "SL",
      "singapore": "SG",
      "slovakia": "SK",
      "slovenia": "SI",
      "solomon islands": "SB",
      "somalia": "SO",
      "south africa": "ZA",
      "south korea": "KR",
      "south sudan": "SS",
      "spain": "ES",
      "sri lanka": "LK",
      "sudan": "SD",
      "suriname": "SR",
      "sweden": "SE",
      "switzerland": "CH",
      "taiwan": "TW",
      "tajikistan": "TJ",
      "tanzania": "TZ",
      "thailand": "TH",
      "timor-leste": "TL",
      "togo": "TG",
      "tonga": "TO",
      "trinidad and tobago": "TT",
      "tunisia": "TN",
      "turkey": "TR",
      "turkmenistan": "TM",
      "tuvalu": "TV",
      "uganda": "UG",
      "ukraine": "UA",
      "united arab emirates": "AE",
      "united kingdom": "GB",
      "united states": "US",
      "uruguay": "UY",
      "uzbekistan": "UZ",
      "vanuatu": "VU",
      "vatican city": "VA",
      "venezuela": "VE",
      "vietnam": "VN",
      "yemen": "YE",
      "zambia": "ZM",
      "zimbabwe": "ZW",
      // Common short forms the list above does not carry.
      "usa": "US",
      "united states of america": "US",
      "uk": "GB",
      "great britain": "GB",
      "uae": "AE"
    };
    function str(v) {
      return v == null ? "" : String(v).trim();
    }
    function amount(v) {
      var s = str(v).replace(/[$£€,\s]/g, "");
      return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) || null : null;
    }
    function httpUrl(v) {
      var s = str(v);
      return /^https?:\/\//i.test(s) ? s : "";
    }
    function addressPart(v) {
      return str(v).replace(/[\s,]+$/, "");
    }
    function streetAddress(v) {
      var s = addressPart(v);
      return s.length < 3 || /^(n\/a|tbc|tba)$/i.test(s) ? "" : s;
    }
    function compact(o) {
      var out = {};
      for (var k in o) {
        if (o[k] !== "" && o[k] != null) {
          out[k] = o[k];
        }
      }
      return out;
    }
    function employmentType(raw) {
      var s = str(raw);
      if (!s) {
        return null;
      }
      var asEnum = s.toUpperCase().replace(/[\s-]+/g, "_");
      if (EMPLOYMENT_TYPES.indexOf(asEnum) > -1) {
        return asEnum;
      }
      var t = s.toLowerCase();
      var partTime = /\bpart\b/.test(t);
      var types = [];
      if (/\bfull\b/.test(t) || /\bperm/.test(t) && !partTime) {
        types.push("FULL_TIME");
      }
      if (partTime) {
        types.push("PART_TIME");
      }
      if (/\bcontract|\bfreelanc/.test(t)) {
        types.push("CONTRACTOR");
      }
      if (/\btemp|\bcasual|\bfixed|\bseasonal/.test(t)) {
        types.push("TEMPORARY");
      }
      if (/\bintern(ship)?s?\b/.test(t)) {
        types.push("INTERN");
      }
      if (/\bvolunt/.test(t)) {
        types.push("VOLUNTEER");
      }
      if (!types.length) {
        return "OTHER";
      }
      return types.length === 1 ? types[0] : types;
    }
    function salaryUnit(raw) {
      var t = str(raw).toLowerCase();
      if (/hour|\bhr\b/.test(t)) {
        return "HOUR";
      }
      if (/\bda(y|ily)\b/.test(t)) {
        return "DAY";
      }
      if (/week/.test(t)) {
        return "WEEK";
      }
      if (/month/.test(t)) {
        return "MONTH";
      }
      if (/year|annual|annum/.test(t)) {
        return "YEAR";
      }
      return "";
    }
    function countryCode(raw) {
      var s = str(raw);
      if (s.length === 2) {
        return s.toUpperCase();
      }
      return COUNTRY_CODES[s.toLowerCase()] || s;
    }
    function baseSalary() {
      var min = amount(cfg.salaryFrom);
      var max = amount(cfg.salaryTo);
      var unit = salaryUnit(cfg.salaryType);
      var currency = str(cfg.currencyCode).toUpperCase();
      if (!min && !max || !unit || !/^[A-Z]{3}$/.test(currency)) {
        return null;
      }
      var value = { "@type": "QuantitativeValue", unitText: unit };
      if (min && max && min !== max) {
        value.minValue = Math.min(min, max);
        value.maxValue = Math.max(min, max);
      } else {
        value.value = min || max;
      }
      return { "@type": "MonetaryAmount", currency, value };
    }
    function buildPosting(title2) {
      var orgName = str(cfg.companyName) || str(cfg.advertiserName);
      var posted = str(cfg.datePosted);
      var validThrough = str(cfg.validThrough);
      var jobId = str(cfg.jobID);
      var address = compact({
        streetAddress: streetAddress(cfg.address),
        addressLocality: addressPart(cfg.city),
        addressRegion: addressPart(cfg.state),
        postalCode: str(cfg.postalCode),
        addressCountry: countryCode(cfg.country)
      });
      var hasAddress = false;
      for (var key in address) {
        hasAddress = true;
      }
      var posting = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        title: title2,
        description: str(cfg.Description),
        identifier: jobId ? compact({ "@type": "PropertyValue", name: orgName, value: jobId }) : null,
        hiringOrganization: orgName ? compact({
          "@type": "Organization",
          name: orgName,
          sameAs: httpUrl(cfg.siteUri),
          logo: httpUrl(cfg.companyLogo) || httpUrl(cfg.advertiserImageURL)
        }) : null,
        employmentType: employmentType(cfg.worktype),
        datePosted: posted.indexOf("T") > -1 ? posted.split("T")[0] : posted,
        validThrough: ISO_DATE.test(validThrough) ? validThrough : "",
        jobLocation: hasAddress ? { "@type": "Place", address: Object.assign({ "@type": "PostalAddress" }, address) } : null,
        baseSalary: baseSalary()
      };
      return compact(posting);
    }
    if (data && data.inEditor) {
      var label = host.querySelector(".smSetUp");
      if (!label) {
        label = document.createElement("div");
        label.className = "smSetUp";
        label.textContent = EDITOR_LABEL;
        host.insertBefore(label, host.firstChild);
      }
      label.style.display = "block";
    }
    var title = str(cfg.jobTitle);
    if (!title) {
      return;
    }
    var script = host.querySelector("script.jobSchema");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.className = "jobSchema";
      host.appendChild(script);
    }
    script.textContent = JSON.stringify(buildPosting(title)).replace(/</g, "\\u003c");
  }
  return __toCommonJS(job_schema_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-schema"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
