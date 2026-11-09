// Job Schema — the JobPosting JSON-LD on a job details page. Moved from an inline
// Duda paste (widget v38) to a hosted bundle.
//
// v38 re-parsed the JSON the HTML tab interpolates. Handlebars HTML-escapes every value
// and leaves newlines and backslashes alone, so one line break in a description made
// JSON.parse throw, the catch swallowed it, and the page kept an unparseable block. This
// builds the object from data.config (the raw values) and writes it with JSON.stringify.
//
// Runs inside the generated legacyController(ctx), which binds element and data the way
// Duda's function(element, data, api) wrapper did. Needs no Shazamme SDK (.no-sdk).
var cfg = (data && data.config) || {};
var host = element && element.jquery ? element[0] : element;
if (!host) { return; }

var EDITOR_LABEL = 'SCHEMA MARKUP ( This text will only show on the editor. )';
var EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'];
var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Country names as the job feed sends them, lower-cased, to ISO 3166-1 alpha-2.
var COUNTRY_CODES = {
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD', 'angola': 'AO', 'argentina': 'AR',
  'armenia': 'AM', 'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ', 'bahamas': 'BS', 'bahrain': 'BH',
  'bangladesh': 'BD', 'barbados': 'BB', 'belarus': 'BY', 'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ',
  'bhutan': 'BT', 'bolivia': 'BO', 'bosnia and herzegovina': 'BA', 'botswana': 'BW', 'brazil': 'BR', 'brunei': 'BN',
  'bulgaria': 'BG', 'burkina faso': 'BF', 'burundi': 'BI', 'cambodia': 'KH', 'cameroon': 'CM', 'canada': 'CA',
  'cape verde': 'CV', 'central african republic': 'CF', 'chad': 'TD', 'chile': 'CL', 'china': 'CN', 'colombia': 'CO',
  'comoros': 'KM', 'congo': 'CG', 'costa rica': 'CR', 'croatia': 'HR', 'cuba': 'CU', 'cyprus': 'CY',
  'czech republic': 'CZ', 'czechia': 'CZ', 'denmark': 'DK', 'djibouti': 'DJ', 'dominica': 'DM', 'dominican republic': 'DO',
  'ecuador': 'EC', 'egypt': 'EG', 'el salvador': 'SV', 'equatorial guinea': 'GQ', 'eritrea': 'ER', 'estonia': 'EE',
  'eswatini': 'SZ', 'ethiopia': 'ET', 'fiji': 'FJ', 'finland': 'FI', 'france': 'FR', 'gabon': 'GA',
  'gambia': 'GM', 'georgia': 'GE', 'germany': 'DE', 'ghana': 'GH', 'greece': 'GR', 'grenada': 'GD',
  'guatemala': 'GT', 'guinea': 'GN', 'guyana': 'GY', 'haiti': 'HT', 'honduras': 'HN', 'hong kong': 'HK',
  'hungary': 'HU', 'iceland': 'IS', 'india': 'IN', 'indonesia': 'ID', 'iraq': 'IQ', 'ireland': 'IE',
  'israel': 'IL', 'italy': 'IT', 'ivory coast': 'CI', 'jamaica': 'JM', 'japan': 'JP', 'jordan': 'JO',
  'kazakhstan': 'KZ', 'kenya': 'KE', 'kiribati': 'KI', 'kosovo': 'XK', 'kuwait': 'KW', 'kyrgyzstan': 'KG',
  'laos': 'LA', 'latvia': 'LV', 'lebanon': 'LB', 'lesotho': 'LS', 'liberia': 'LR', 'libya': 'LY',
  'liechtenstein': 'LI', 'lithuania': 'LT', 'luxembourg': 'LU', 'macau': 'MO', 'madagascar': 'MG', 'malawi': 'MW',
  'malaysia': 'MY', 'maldives': 'MV', 'mali': 'ML', 'malta': 'MT', 'marshall islands': 'MH', 'mauritania': 'MR',
  'mauritius': 'MU', 'mexico': 'MX', 'micronesia': 'FM', 'moldova': 'MD', 'monaco': 'MC', 'mongolia': 'MN',
  'montenegro': 'ME', 'morocco': 'MA', 'mozambique': 'MZ', 'myanmar': 'MM', 'namibia': 'NA', 'nauru': 'NR',
  'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ', 'nicaragua': 'NI', 'niger': 'NE', 'nigeria': 'NG',
  'north macedonia': 'MK', 'norway': 'NO', 'oman': 'OM', 'pakistan': 'PK', 'palau': 'PW', 'palestine': 'PS',
  'panama': 'PA', 'papua new guinea': 'PG', 'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH', 'poland': 'PL',
  'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO', 'russia': 'RU', 'rwanda': 'RW', 'saint kitts and nevis': 'KN',
  'saint lucia': 'LC', 'samoa': 'WS', 'san marino': 'SM', 'saudi arabia': 'SA', 'senegal': 'SN', 'serbia': 'RS',
  'seychelles': 'SC', 'sierra leone': 'SL', 'singapore': 'SG', 'slovakia': 'SK', 'slovenia': 'SI', 'solomon islands': 'SB',
  'somalia': 'SO', 'south africa': 'ZA', 'south korea': 'KR', 'south sudan': 'SS', 'spain': 'ES', 'sri lanka': 'LK',
  'sudan': 'SD', 'suriname': 'SR', 'sweden': 'SE', 'switzerland': 'CH', 'taiwan': 'TW', 'tajikistan': 'TJ',
  'tanzania': 'TZ', 'thailand': 'TH', 'timor-leste': 'TL', 'togo': 'TG', 'tonga': 'TO', 'trinidad and tobago': 'TT',
  'tunisia': 'TN', 'turkey': 'TR', 'turkmenistan': 'TM', 'tuvalu': 'TV', 'uganda': 'UG', 'ukraine': 'UA',
  'united arab emirates': 'AE', 'united kingdom': 'GB', 'united states': 'US', 'uruguay': 'UY', 'uzbekistan': 'UZ', 'vanuatu': 'VU',
  'vatican city': 'VA', 'venezuela': 'VE', 'vietnam': 'VN', 'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW',
  // Common short forms the list above does not carry.
  'usa': 'US', 'united states of america': 'US', 'uk': 'GB', 'great britain': 'GB', 'uae': 'AE'
};

function str(v) {
  return v == null ? '' : String(v).trim();
}
// A positive amount, or null. Zero is how the feed says "no salary set".
function amount(v) {
  var s = str(v).replace(/[$£€,\s]/g, '');
  return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) || null : null;
}
function httpUrl(v) {
  var s = str(v);
  return /^https?:\/\//i.test(s) ? s : '';
}
// Address parts are typed by recruiters: "40 Market St," and "South Melbourne,".
function addressPart(v) {
  return str(v).replace(/[\s,]+$/, '');
}
// A street address that is a filler ("NA", ".", "a") says nothing; leave it out.
function streetAddress(v) {
  var s = addressPart(v);
  return s.length < 3 || /^(n\/a|tbc|tba)$/i.test(s) ? '' : s;
}
// Drops the keys with nothing in them, so no property is sent as "".
function compact(o) {
  var out = {};
  for (var k in o) {
    if (o[k] !== '' && o[k] != null) { out[k] = o[k]; }
  }
  return out;
}

// Work type labels are named per site ("Permanent", "Temp", "Fixed Term",
// "FullTimeRegular", "Direct Hire"); Google takes only its own list. A label that names
// two types sends both. A site that needs a different answer binds the worktype input
// to a field that already holds a Google value, which is passed through.
function employmentType(raw) {
  var s = str(raw);
  if (!s) { return null; }
  var asEnum = s.toUpperCase().replace(/[\s-]+/g, '_');
  if (EMPLOYMENT_TYPES.indexOf(asEnum) > -1) { return asEnum; }
  var t = s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  var partTime = /\bpart\b/.test(t);
  var permanent = /\bperm|\bdirect (hire|placement)\b/.test(t) && !/\bnon[\s-]?perm/.test(t);
  var types = [];
  if (/\bfull\b/.test(t) || (permanent && !partTime)) { types.push('FULL_TIME'); }
  if (partTime) { types.push('PART_TIME'); }
  if (/\bcontract|\bfreelanc/.test(t)) { types.push('CONTRACTOR'); }
  if (/\btemp|\bcasual|\bfixed|\bseasonal/.test(t)) { types.push('TEMPORARY'); }
  if (/\bintern(ship)?s?\b/.test(t)) { types.push('INTERN'); }
  if (/\bvolunt/.test(t)) { types.push('VOLUNTEER'); }
  if (!types.length) { return 'OTHER'; }
  return types.length === 1 ? types[0] : types;
}

function salaryUnit(raw) {
  var t = str(raw).toLowerCase();
  if (/hour|\bhr\b/.test(t)) { return 'HOUR'; }
  if (/\bda(y|ily)\b/.test(t)) { return 'DAY'; }
  if (/week/.test(t)) { return 'WEEK'; }
  if (/month/.test(t)) { return 'MONTH'; }
  if (/year|annual|annum/.test(t)) { return 'YEAR'; }
  return '';
}

// A name the list does not know is sent as it came, as v38 did.
function countryCode(raw) {
  var s = str(raw);
  if (s.length === 2) { return s.toUpperCase(); }
  var key = s.toLowerCase();
  return Object.prototype.hasOwnProperty.call(COUNTRY_CODES, key) ? COUNTRY_CODES[key] : s;
}

// An ISO 8601 date or date-time, or ''. Takes the feed's two shapes, "2026-11-05T00:38:19.567"
// (a space for the T is put right) and "09-Nov-2026", and refuses anything else: a date
// Google cannot read is reported against the posting, and "05/11/2026" cannot be read
// safely by anyone.
function isoDateTime(v) {
  var s = str(v).replace(/^(\d{4}-\d{2}-\d{2}) (?=\d{2}:)/, '$1T');
  var iso = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(s);
  if (iso) { return isCalendarDate(+iso[1], +iso[2], +iso[3]) ? s : ''; }
  var named = /^(\d{1,2})[-\s]([A-Za-z]{3})[a-z]*[-\s](\d{4})$/.exec(s);
  if (!named) { return ''; }
  var month = MONTHS.indexOf(named[2].toLowerCase()) + 1;
  if (!month || !isCalendarDate(+named[3], month, +named[1])) { return ''; }
  return named[3] + '-' + pad2(month) + '-' + pad2(+named[1]);
}
function isCalendarDate(y, m, d) {
  var date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function pad2(n) {
  return (n < 10 ? '0' : '') + n;
}

// Sent only with an amount, a unit Google knows and a currency: a baseSalary missing
// any of them is reported as an error against the whole posting.
function baseSalary() {
  var min = amount(cfg.salaryFrom);
  var max = amount(cfg.salaryTo);
  var unit = salaryUnit(cfg.salaryType);
  var currency = str(cfg.currencyCode).toUpperCase();
  if ((!min && !max) || !unit || !/^[A-Z]{3}$/.test(currency)) { return null; }
  // One bound is sent as that bound: "from 80,000" is not a salary of exactly 80,000.
  var value = { '@type': 'QuantitativeValue', unitText: unit };
  if (min && max && min !== max) {
    value.minValue = Math.min(min, max);
    value.maxValue = Math.max(min, max);
  } else if (min && max) {
    value.value = min;
  } else if (min) {
    value.minValue = min;
  } else {
    value.maxValue = max;
  }
  return { '@type': 'MonetaryAmount', currency: currency, value: value };
}

function buildPosting(title) {
  // companyName and companyLogo are optional inputs: advertiserName is the internal
  // advertiser record ("Acme Bullhorn"), which is not always the public company name.
  var orgName = str(cfg.companyName) || str(cfg.advertiserName);
  var jobId = str(cfg.jobID);
  var address = compact({
    streetAddress: streetAddress(cfg.address),
    addressLocality: addressPart(cfg.city),
    addressRegion: addressPart(cfg.state),
    postalCode: str(cfg.postalCode),
    addressCountry: countryCode(cfg.country)
  });
  var hasAddress = false;
  for (var key in address) { hasAddress = true; }

  var posting = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: title,
    description: str(cfg.Description),
    identifier: jobId ? compact({ '@type': 'PropertyValue', name: orgName, value: jobId }) : null,
    hiringOrganization: orgName
      ? compact({
          '@type': 'Organization',
          name: orgName,
          sameAs: httpUrl(cfg.siteUri),
          logo: httpUrl(cfg.companyLogo) || httpUrl(cfg.advertiserImageURL)
        })
      : null,
    employmentType: employmentType(cfg.worktype),
    datePosted: isoDateTime(cfg.datePosted).slice(0, 10),
    validThrough: isoDateTime(cfg.validThrough),
    jobLocation: hasAddress ? { '@type': 'Place', address: Object.assign({ '@type': 'PostalAddress' }, address) } : null,
    baseSalary: baseSalary()
  };
  return compact(posting);
}

// The label is added here, not rendered by the HTML tab, so it is never in a live
// page's source. An older HTML tab still renders it hidden; reuse that one. Inline
// display beats the CSS tab's display:none without that tab needing a change.
if (data && data.inEditor) {
  var label = host.querySelector('.smSetUp');
  if (!label) {
    label = document.createElement('div');
    label.className = 'smSetUp';
    label.textContent = EDITOR_LABEL;
    host.insertBefore(label, host.firstChild);
  }
  label.style.display = 'block';
}

// No job on this page (the widget dropped on a static page, or an unbound instance):
// the HTML tab has rendered a JobPosting with every value empty, which is reported as
// an invalid posting on a page that has none. Take it off the page.
var script = host.querySelector('script.jobSchema');
var title = str(cfg.jobTitle);
if (!title) {
  if (script) { script.parentNode.removeChild(script); }
  return;
}

if (!script) {
  script = document.createElement('script');
  script.type = 'application/ld+json';
  script.className = 'jobSchema';
  host.appendChild(script);
}
// "<" is escaped so a </script> inside a description can never end the block.
script.textContent = JSON.stringify(buildPosting(title)).replace(/</g, '\\u003c');
