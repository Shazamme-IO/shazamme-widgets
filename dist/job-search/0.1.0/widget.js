/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-08-28T01:31:33.843Z. Registers window.ShazammeWidget["<name>"].
 */
"use strict";
var module = module || {};
module.exports = (() => {
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

  // dist/.gen/job-search.index.js
  var job_search_index_exports = {};
  __export(job_search_index_exports, {
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

  // dist/.gen/job-search.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    const Path = {
      jobResults: data.config.customPageLink && data.config.searchResultPage || "job-results"
    };
    const Collection = {
      jobResults: {
        name: "Jobs",
        action: "Get Jobs",
        endpoint: data.config.jobResultsCollection,
        useCache: true,
        debug: data.inEditor && data.config.debugMode
      }
    };
    function ShApi() {
      this.getJobs = (pageNumber, pageSize, filters = {}, sort = {
        field: "changedOnUTC",
        direction: "desc"
      }) => new Promise((resolve, reject) => {
        shazamme.fetch(Collection.jobResults).then((jobs) => {
          let filtered = [];
          if (filters) {
            filtered = jobs.filter((j) => {
              let ok = true;
              let isMatch = (v) => {
                if (typeof v !== "string") {
                  return false;
                }
                return filters[f].map((i) => i == null ? void 0 : i.toLowerCase()).filter((i) => i.indexOf(v.toLowerCase())).length > 0;
              };
              for (f in filters) {
                switch (f) {
                  case "salaryFrom":
                    ok = ok && j.data[f] >= filters[f];
                    break;
                  case "salaryTo":
                    ok = ok && j.data[f] <= filters[f];
                    break;
                  case "keyword": {
                    ok = ok && (data.config.toggleCategorys === true && isMatch(j.data.category) || data.config.toggleSubCategory === true && isMatch(j.data.subCategory) || data.config.toggleContact === true && isMatch(j.data.contactName) || isMatch(j.data.contactEmail) || isMatch(j.data.contactPhone) || data.config.toggleLocation === true && isMatch(j.data.location) || data.config.toggleArea === true && isMatch(j.data.city) || data.config.toggleCountry === true && isMatch(j.data.country) || data.config.toggleDescription === true && isMatch(j.data.fullDescription) || data.config.toggleReferenceNumber === true && isMatch(j.data.referenceNumber) || data.config.toggleJobName === true && isMatch(j.data.jobName) || isMatch(j.data.tags));
                    break;
                  }
                  case "location": {
                    ok = ok && isMatch(j.data.fullAddress);
                    break;
                  }
                  case "geo":
                    break;
                  case "geoRange":
                    break;
                  case "geoAddress":
                    break;
                  default:
                    ok = ok && (filters[f].length === 0 || filters[f].indexOf(j.data[f]) >= 0);
                    break;
                }
              }
              return ok;
            });
          } else {
            filtered.push(...jobs);
          }
          resolve({
            values: filtered.sort((x, y) => {
              if (x.data[sort.field] > y.data[sort.field]) {
                if (sort.direction === "asc") {
                  return 1;
                } else {
                  return -1;
                }
              }
              if (x.data[sort.field] < y.data[sort.field]) {
                if (sort.direction === "asc") {
                  return -1;
                } else {
                  return 1;
                }
              }
              return 0;
            }).slice(pageSize > 0 ? pageNumber * pageSize : 0, pageSize > 0 ? pageNumber * pageSize + pageSize : void 0),
            page: {
              pageNumber,
              totalPages: parseInt(Math.ceil(filtered.length / pageSize)),
              totalItems: filtered.length
            }
          });
        });
      });
    }
    function UX() {
      this.el = $(element);
      this.uri = new URL(window.location.href);
      this.showLoading = (showing = true) => {
        if (showing) {
          $(element).find(".client-answers-loading").show();
        } else {
          $(element).find(".client-answers-loading").hide();
        }
      };
      this.buildHref = (path, query) => {
        if (path && path.charAt(0) !== "/") path = "/" + path;
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? "&" + query : ""}` : `https://${window.location.hostname}${path}${query ? "?" + query : ""}`;
      };
      this.loadScript = (src) => window.__shazLoadScript(src);
    }
    const shApi = new ShApi();
    const ux = new UX();
    const main = (w) => {
      let activeFilter = {};
      let fuseSettings = {
        default: {
          caseSensitive: false,
          shouldSort: true,
          threshold: 0.2,
          tokenize: true,
          matchAllTokens: true,
          location: 0,
          distance: 1e3,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          includeMatches: true
        },
        keys: {
          keyword: [
            data.config.togglePredictiveJobName ? "jobName" : void 0,
            data.config.togglePredictiveCategory ? "category" : void 0,
            data.config.togglePredictiveSubCategory ? "subCategory" : void 0,
            data.config.togglePredictiveContact ? "contactName" : void 0,
            data.config.togglePredictiveLocation ? "location" : void 0,
            data.config.togglePredictiveLocation ? "city" : void 0,
            data.config.togglePredictiveDescription ? "shortDescription" : void 0,
            data.config.togglePredictiveReferenceNumber ? "referenceNumber" : void 0,
            data.config.togglePredictiveCountry === true ? "country" : void 0
          ],
          location: [
            "country",
            "state",
            "city",
            "postalCode"
          ],
          city: [
            "city"
          ]
        }
      };
      ux.el.find(".searchBtn").click(function() {
        submitSearch();
      });
      ux.el.find("[data-filter]").on("change", function() {
        var _a;
        let field = $(this);
        if (((_a = field.val()) == null ? void 0 : _a.length) > 0) {
          activeFilter[field.attr("data-filter")] = [field.val()];
        } else {
          delete activeFilter[field.attr("data-filter")];
        }
        fetchValues();
      });
      if (data.config.googleApiKey && data.config.showGeoSearch) {
        const places = new google.maps.places.PlacesService(document.querySelector(".gapi-map"));
        const autocomplete = new google.maps.places.AutocompleteService();
        ux.el.find("[data-gapi]").on("keyup", function() {
          const field = $(this);
          const range = field.siblings("[data-filter=geoRange]");
          const menu = field.siblings("[data-prediction]");
          clearTimeout(this._debounce);
          field.siblings("[data-prediction]").hide();
          this._debounce = setTimeout(() => {
            let value = field.val();
            delete activeFilter[field.attr("data-gapi")];
            delete activeFilter[range.attr("data-filter")];
            delete activeFilter[field.attr("data-gapi-text")];
            field.attr("_last", "");
            if (value.length == 0) {
              fetchValues();
              return;
            }
            autocomplete.getPlacePredictions({ input: value }, (r) => {
              if ((r == null ? void 0 : r.length) > 0) {
                menu.empty().append(`<a href="javascript: void(0);" class="resultText close" data-value="">x</a>`).show().on("click", "[data-value]", function() {
                  let opt = $(this);
                  let value2 = opt.attr("data-value");
                  field.val(opt.text());
                  opt.parents("[data-prediction]").hide();
                  if (value2.length > 0) {
                    activeFilter[field.attr("data-gapi")] = [value2];
                    activeFilter[field.attr("data-gapi-text")] = [opt.text()];
                    activeFilter[range.attr("data-filter")] = [range.val()];
                    field.attr("_last", opt.text());
                  }
                  fetchValues();
                });
                r.forEach((p) => {
                  places.getDetails({ placeId: p.place_id, fields: ["geometry"] }, (d) => {
                    menu.append(`<a href="javascript: void(0);" class="resultText" data-value="${d.geometry.location.lat()},${d.geometry.location.lng()}">${p.description}</a>`);
                  });
                });
              }
            });
          }, 500);
        }).on("blur", function() {
          let field = $(this);
          setTimeout(() => {
            field.val(field.attr("_last")).siblings("[data-prediction]").hide();
            fetchValues();
          }, 300);
        });
      }
      ux.el.find("[data-autocomplete]").on("keyup", function() {
        let field = $(this);
        let filter = field.attr("data-autocomplete");
        if (field.val().length == 0) {
          delete activeFilter[filter];
          fetchValues();
          return;
        }
        let keys = fuseSettings.keys[filter];
        let unique = (value, index, self) => self.indexOf(value) === index;
        let settings = {
          ...fuseSettings.default,
          keys: keys.filter((k) => (k == null ? void 0 : k.length) > 0)
        };
        let matches = [];
        new Fuse(jobs.map((j) => j.data), settings).search(field.val()).forEach((m) => {
          matches.push(...m.matches.map((i) => {
            let last = 0;
            let v = [];
            i.indices.forEach((x) => {
              v.push(i.value.slice(last, x[0]));
              v.push(`<b>${i.value.slice(x[0], x[1])}</b>`);
              last = x[1];
            });
            v.push(i.value.slice(last));
            return `<a href="javascript: void(0);" class="resultText" data-value="${i.value}">${v.join("")}</a>`;
          }));
        });
        if (matches.length > 0) {
          field.siblings("[data-prediction]").empty().append(`<a href="javascript: void(0);" class="resultText close" data-value="">x</a>`).append(matches.filter(unique).join("")).show().on("click", "[data-value]", function() {
            let opt = $(this);
            let value = opt.attr("data-value");
            field.val(value);
            opt.parents("[data-prediction]").hide();
          });
        } else {
          field.siblings("[data-prediction]").hide();
        }
      }).on("blur", function() {
        let field = $(this);
        setTimeout(() => {
          field.siblings("[data-prediction]").hide();
          let value = field.val();
          if (value.length > 0) {
            activeFilter[field.attr("data-autocomplete")] = value.split(",");
          } else {
            delete activeFilter[field.attr("data-autocomplete")];
          }
          fetchValues();
        }, 250);
      }).on("change", function() {
        let field = $(this);
        if (field.val().length > 0) {
          activeFilter[field.attr("data-autocomplete")] = field.val().split(",");
        } else {
          delete activeFilter[field.attr("data-autocomplete")];
        }
        fetchValues();
      });
      ux.el.find("input[data-submit]").on("keypress", function(e) {
        switch (e.which) {
          case 13:
            let field = $(this);
            let filter = field.attr("data-autocomplete") || field.attr("data-filter");
            let value = field.val();
            if (value.length > 0) {
              activeFilter[filter] = value.split(",");
            } else {
              delete activeFilter[filter];
            }
            field.blur();
            field.siblings("[data-prediction]").hide();
            submitSearch();
            break;
        }
      });
      let fetchValues = () => new Promise((resolve, reject) => {
        let values = {
          professionID: {
            all: data.config.ClassificationPlaceholder || "All Categories",
            list: []
          },
          roleID: {
            all: data.config.SubClassificationsPlaceholder || "All Sub Categories",
            list: []
          },
          workTypeID: {
            all: data.config.WorkTypesPlaceholder || "All Work Types",
            list: []
          },
          workModelID: {
            all: data.config.WorkModelsPlaceholder || "All Work Models",
            list: []
          },
          state: {
            all: data.config.LocationsPlaceholder || "All Locations",
            list: []
          },
          city: {
            all: data.config.CityPlaceholder || "All Cities",
            list: []
          },
          country: {
            all: data.config.CountryPlaceholder || "All Countries",
            list: []
          },
          category: {
            all: data.config.ClassificationPlaceholder || "All Categories",
            list: []
          },
          subCategory: {
            all: data.config.SubClassificationsPlaceholder || "All Sub Categories",
            list: []
          },
          workType: {
            all: data.config.WorkTypesPlaceholder || "All Work Types",
            list: []
          },
          workModel: {
            all: data.config.WorkModelsPlaceholder || "All Work Models",
            list: []
          }
        };
        let unique = (value, index, self) => self.indexOf(value) === index;
        let sort = (x, y) => x.text.toLowerCase() < y.text.toLowerCase() ? -1 : 1;
        let push = (l, vl) => {
          vl.map((i) => i.id).filter((i) => i).filter(unique).forEach((id) => {
            var _a;
            l[id] = {
              text: vl.find((i) => i.id === id).text,
              count: (((_a = l[id]) == null ? void 0 : _a.count) || 0) + vl.filter((i) => i.id === id).length
            };
          });
        };
        jobs = [];
        let fetch = (pageNumber) => {
          shApi.getJobs(pageNumber, 0, activeFilter).then((j) => {
            push(values.professionID.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.professionID, text: (_a = i.data.category) != null ? _a : "" });
            }));
            push(values.roleID.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.roleID, text: (_a = i.data.subCategory) != null ? _a : "" });
            }));
            push(values.workTypeID.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.workTypeID, text: (_a = i.data.workType) != null ? _a : "" });
            }));
            push(values.workModelID.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.workModelID, text: (_a = i.data.workModel) != null ? _a : "" });
            }));
            push(values.state.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.state, text: (_a = i.data.state) != null ? _a : "" });
            }));
            push(values.city.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.city, text: (_a = i.data.city) != null ? _a : "" });
            }));
            push(values.country.list, j.values.map((i) => {
              var _a;
              return new Object({ id: i.data.country, text: (_a = i.data.country) != null ? _a : "" });
            }));
            if (data.config.legacyMode) {
              push(values.category.list, j.values.map((i) => {
                var _a;
                return new Object({ id: i.data.category, text: (_a = i.data.category) != null ? _a : "" });
              }));
              push(values.subCategory.list, j.values.map((i) => {
                var _a;
                return new Object({ id: i.data.subCategory, text: (_a = i.data.subCategory) != null ? _a : "" });
              }));
              push(values.workType.list, j.values.map((i) => {
                var _a;
                return new Object({ id: i.data.workType, text: (_a = i.data.workType) != null ? _a : "" });
              }));
              push(values.workModel.list, j.values.map((i) => {
                var _a;
                return new Object({ id: i.data.workModel, text: (_a = i.data.workModel) != null ? _a : "" });
              }));
            }
            jobs.push(...j.values);
            for (let v in values) {
              let l = values[v].list;
              let opt = [];
              for (let i in l) {
                if (typeof l[i] === "object") {
                  opt.push({
                    id: i,
                    text: l[i].text,
                    count: l[i].count
                  });
                }
              }
              ux.el.find(`[data-filter=${v}]`).empty().append(`<option value="">${values[v].all}</option`).append(opt.sort(sort).map((o) => `<option value="${o.id}">${o.text} (${o.count})</option>`)).val(activeFilter[v] || "");
            }
            for (let i in fuseSettings.keys) {
              jobs.forEach((j2) => fuseSettings.keys[i].forEach((k) => j2.data[k] = j2.data[k] || ""));
            }
            resolve();
          });
        };
        fetch(0);
      });
      let submitSearch = () => {
        let push = (p, n, v) => {
          if ((v == null ? void 0 : v.length) > 0) {
            if (data.config.useRedirect) {
              p.push(`${n}=${encodeURIComponent(v)}`);
            } else {
              p[n] = v;
            }
          }
        };
        let params = [];
        for (let i in activeFilter) {
          push(params, i, activeFilter[i]);
        }
        if (params.length == 0) {
          push(params, "keyword", data.config.txt_KeywordFilter);
          push(params, "category", data.config.txt_ClassificationFilter);
          push(params, "subcategory", data.config.txt_SubClassifyFilter);
          push(params, "workType", data.config.txt_WorkTypeFilter);
          push(params, "workModel", data.config.txt_WorkModelFilter);
          push(params, "location", data.config.txt_LocationFilter);
          push(params, "country", data.config.txt_CountryFilter);
          push(params, "advertiserID", data.config.txt_Advertisers);
        }
        if (data.config.useRedirect) {
          window.location = ux.buildHref("/" + Path.jobResults, params.join("&"));
        } else {
          w.pub("job-search-submit", params);
        }
      };
      let jobs = [];
      w.log("widget ready", w).sub("job-search-set", (p) => {
        var _a, _b;
        for (let i in p) {
          ux.el.find(`[data-filter=${i}]`).val(p[i][0] || "");
          ux.el.find(`[data-autocomplete=${i}]`).val(p[i].join(", "));
          ux.el.find(`[data-gapi-text=${i}]`).val(p[i].join(", "));
        }
        if (!(((_a = p == null ? void 0 : p.keyword) == null ? void 0 : _a.length) > 0)) {
          ux.el.find(`[data-autocomplete=keyword]`).val("");
        }
        if (!(((_b = p == null ? void 0 : p.geo) == null ? void 0 : _b.length) > 0)) {
          ux.el.find(`[data-gapi=geo]`).val("");
        }
        ux.el.find("[data-filter], [data-autocomplete]").trigger("change");
      });
      w.sub("site-config-ready", () => {
        var _a, _b;
        const site = shazamme.bag("site-config");
        if (((_a = site == null ? void 0 : site.configuration) == null ? void 0 : _a.jobLocalization) || ((_b = site == null ? void 0 : site.configuration) == null ? void 0 : _b.jobFieldMap)) {
          shazamme.site().then((s) => {
            var _a2, _b2;
            Collection.jobResults = {
              path: `/job-results/${s.siteID}`,
              useCache: true,
              isExternal: true,
              lang: ((_a2 = site == null ? void 0 : site.configuration) == null ? void 0 : _a2.jobLocalization) && data.locale,
              fieldMap: (_b2 = site == null ? void 0 : site.configuration) == null ? void 0 : _b2.jobFieldMap
            };
            fetchValues();
          });
        }
      });
      return shazamme.site().then((s) => {
        Collection.jobResults = {
          path: `/job-results/${s.siteID}`,
          useCache: true,
          isExternal: true
        };
        return Promise.resolve({ fetchValues });
      });
    };
    Promise.all([
      ux.loadScript("https://cdn.jsdelivr.net/npm/fuse.js@6.4.0").then(),
      ux.loadScript("https://sdk.shazamme.io/js/shazamme-1.0.3.min.js")
    ]).then(() => shazamme.ready(data.inEditor && data.config.debugSiteID || data.siteId, data.page)).then(() => data.config.googleApiKey && data.config.showGeoSearch && shazamme.gapi(data.config.googleApiKey).maps(["places"]) || Promise.resolve()).then(() => {
      main(shazamme.register("job-search", data)).then((w) => w.fetchValues()).then(() => {
        ux.el.find("#searchBox").val(ux.uri.searchParams.get("keyword"));
        ux.el.find("#jobCategories").val(ux.uri.searchParams.get("category"));
        ux.el.find("#location").val(ux.uri.searchParams.get("location"));
        ux.el.find("#city").val(ux.uri.searchParams.get("city"));
        ux.el.find("#country").val(ux.uri.searchParams.get("country"));
        ux.el.find("#jobWorkType").val(ux.uri.searchParams.get("workType"));
        ux.el.find("#jobWorkModel").val(ux.uri.searchParams.get("workModel"));
        ux.el.find("#jobSubCategories").val(ux.uri.searchParams.get("subcategory"));
        ux.el.find("[data-filter=keyword]").val(ux.uri.searchParams.get("keyword"));
        ux.el.find("[data-filter=professionID]").val(ux.uri.searchParams.get("professionID"));
        ux.el.find("[data-filter=state]").val(ux.uri.searchParams.get("state"));
        ux.el.find("[data-filter=city]").val(ux.uri.searchParams.get("city"));
        ux.el.find("[data-filter=country]").val(ux.uri.searchParams.get("country"));
        ux.el.find("[data-filter=workTypeID]").val(ux.uri.searchParams.get("workTypeID"));
        ux.el.find("[data-filter=workModelID]").val(ux.uri.searchParams.get("workModelID"));
        ux.el.find("[data-filter=roleID]").val(ux.uri.searchParams.get("roleID"));
        ux.el.find("[data-filter=category]").val(ux.uri.searchParams.get("category"));
        ux.el.find("[data-filter=subCategory]").val(ux.uri.searchParams.get("subCategory"));
        ux.el.find("[data-filter=workType]").val(ux.uri.searchParams.get("workType"));
        ux.el.find("[data-filter=workModel]").val(ux.uri.searchParams.get("workModel"));
        ux.el.find("[data-autocomplete=keyword]").val(ux.uri.searchParams.get("keyword"));
        ux.el.find("[data-autocomplete=professionID]").val(ux.uri.searchParams.get("professionID"));
        ux.el.find("[data-autocomplete=state]").val(ux.uri.searchParams.get("state"));
        ux.el.find("[data-autocomplete=city]").val(ux.uri.searchParams.get("city"));
        ux.el.find("[data-autocomplete=country]").val(ux.uri.searchParams.get("country"));
        ux.el.find("[data-autocomplete=workTypeID]").val(ux.uri.searchParams.get("workTypeID"));
        ux.el.find("[data-autocomplete=workModelID]").val(ux.uri.searchParams.get("workModelID"));
        ux.el.find("[data-autocomplete=roleID]").val(ux.uri.searchParams.get("roleID"));
        ux.el.find("[data-filter], [data-autocomplete]").trigger("change");
      });
    });
  }
  return __toCommonJS(job_search_index_exports);
})();
(function(){
  var reg = (typeof module !== 'undefined' && module.exports) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["job-search"] = controller;
  }
})();
