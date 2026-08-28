const Path = {
    jobResults: (data.config.customPageLink && data.config.searchResultPage) || 'job-results',
};

const Collection = {
    jobResults: {
        name: 'Jobs',
        action: 'Get Jobs',
        endpoint: data.config.jobResultsCollection,
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
    },
}

function ShApi(){
    this.getJobs = (
        pageNumber
        , pageSize
        , filters={}
        , sort={
            field: 'changedOnUTC',
            direction: 'desc',
        }) => new Promise( (resolve, reject) => {
            shazamme.fetch(Collection.jobResults).then( jobs => {
                let filtered = [];

                if (filters) {
                    filtered = jobs.filter( j => {
                        let ok = true;

                        let isMatch = (v) => {
                            if (typeof(v) !== 'string') {
                                return false;
                            }

                            return filters[f]
                                .map( i => i?.toLowerCase() )
                                .some( i => i.includes(v.toLowerCase()) );
                        }

                        for (f in filters) {
                            switch (f) {
                                case 'salaryFrom': ok = ok && j.data[f] >= filters[f]; break;

                                case 'salaryTo': ok = ok && j.data[f] <= filters[f]; break;

                                case 'keyword': {
                                    ok = ok && (
                                        (data.config.toggleCategorys === true && isMatch(j.data.category))
                                        || (data.config.toggleSubCategory === true && isMatch(j.data.subCategory))
                                        || (data.config.toggleContact === true && isMatch(j.data.contactName))
                                        || isMatch(j.data.contactEmail)
                                        || isMatch(j.data.contactPhone)
                                        || (data.config.toggleLocation === true && isMatch(j.data.location))
                                        || (data.config.toggleArea === true && isMatch(j.data.city))
                                        || (data.config.toggleCountry === true && isMatch(j.data.country))
                                        || (data.config.toggleDescription === true && isMatch(j.data.fullDescription))
                                        || (data.config.toggleReferenceNumber === true && isMatch(j.data.referenceNumber))
                                        || (data.config.toggleJobName === true && isMatch(j.data.jobName))
                                        || isMatch(j.data.tags)
                                    );

                                    break;
                                }

                                case 'location': {
                                    ok = ok && isMatch(j.data.fullAddress);
                                    break;
                                }

                                case 'geo': break;
                                case 'geoRange': break;
                                case 'geoAddress': break;

                                default: ok = ok && (filters[f].length === 0 || filters[f].indexOf(j.data[f]) >= 0); break;
                            }
                        }

                        return ok;
                    });
                } else {
                    filtered.push(...jobs);
                }

                const sorted = pageSize > 0 ? filtered.sort( (x, y) => {
                        if (x.data[sort.field] > y.data[sort.field]) return sort.direction === 'asc' ? 1 : -1;
                        if (x.data[sort.field] < y.data[sort.field]) return sort.direction === 'asc' ? -1 : 1;
                        return 0;
                    }).slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)
                    : filtered;

                resolve({
                    values: sorted,
                    page: {
                        pageNumber: pageNumber,
                        totalPages: parseInt(Math.ceil(filtered.length / pageSize)),
                        totalItems: filtered.length,
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
    }

    this.buildHref = (path, query) => {
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? '&' + query : ''}`:`https://${window.location.hostname}${path}${query ? '?' + query : ''}`;
    }

    this.loadScript = (src) => {
        return new Promise( (res, rej) => {
            $.getScript(
                src,
                function() { res() },
                function() { rej() }
            );
        });
    }
}

const shApi = new ShApi();
const ux = new UX();

const main = (w) => {
    let activeFilter = {}

    let fuseSettings = {
        default: {
            caseSensitive: false,
            shouldSort: true,
            threshold: 0.2,
            tokenize: true,
            matchAllTokens: true,
            location: 0,
            distance: 1000,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            includeMatches: true,
        },

        keys: {
            keyword: [
                data.config.togglePredictiveJobName ? 'jobName' : undefined,
                data.config.togglePredictiveCategory ? 'category' : undefined,
                data.config.togglePredictiveSubCategory ? 'subCategory' : undefined,
                data.config.togglePredictiveContact ? 'contactName' : undefined,
                data.config.togglePredictiveLocation ? 'location' : undefined,
                data.config.togglePredictiveLocation ? 'city' : undefined,
                data.config.togglePredictiveDescription ? 'shortDescription' : undefined,
                data.config.togglePredictiveReferenceNumber ? 'referenceNumber' : undefined,
                data.config.togglePredictiveCountry === true ? 'country' : undefined
            ],

            location: [
                'country',
                'state',
                'city',
                'postalCode'
            ],

            city: [
                'city',
            ],
        },
    }

    ux.el.find('.searchBtn').click(function() {
        submitSearch();
    });

    ux.el.find('[data-filter]').on('change', function() {
        let field = $(this);
        let filterKey = field.attr('data-filter');

        if (field.val()?.length > 0) {
            activeFilter[filterKey] = [field.val()];
        } else {
            delete activeFilter[filterKey];
        }

        // When the category changes, reset and re-filter the sub-category dropdown
        if (filterKey === 'professionID' || filterKey === 'category') {
            let subFilterKey = filterKey === 'professionID' ? 'roleID' : 'subCategory';
            delete activeFilter[subFilterKey];
            ux.el.find(`[data-filter=${subFilterKey}]`).val('');
        }

        updateSubCategoryLock();
        fetchValues();
    });

    if (data.config.googleApiKey && data.config.showGeoSearch) {
        const places = new google.maps.places.PlacesService(document.querySelector('.gapi-map'));
        const autocomplete = new google.maps.places.AutocompleteService();

        ux.el.find('[data-gapi]').on('keyup', function() {
            const field = $(this);
            const range = field.siblings('[data-filter=geoRange]');
            const menu = field.siblings('[data-prediction]');

            clearTimeout(this._debounce);
            field.siblings('[data-prediction]').hide();

            this._debounce = setTimeout( () => {
                let value = field.val();

                delete activeFilter[field.attr('data-gapi')];
                delete activeFilter[range.attr('data-filter')];
                delete activeFilter[field.attr('data-gapi-text')];

                field.attr('_last', '');

                if (value.length == 0) {
                    fetchValues();
                    return;
                }

                autocomplete.getPlacePredictions({ input: value }, r => {
                    if (r?.length > 0) {
                        menu.empty()
                            .append(`<a href="javascript: void(0);" class="resultText close" data-value="">x</a>`)
                            .show()
                            .on('click', '[data-value]', function() {
                                let opt = $(this);
                                let value = opt.attr('data-value');

                                field.val(opt.text());
                                opt.parents('[data-prediction]').hide();

                                if (value.length > 0) {
                                    activeFilter[field.attr('data-gapi')] = [value];
                                    activeFilter[field.attr('data-gapi-text')] = [opt.text()];
                                    activeFilter[range.attr('data-filter')] = [range.val()];
                                    field.attr('_last', opt.text());
                                }

                                fetchValues();
                            });

                        r.forEach( p => {
                            places.getDetails({ placeId: p.place_id, fields: ['geometry' ]}, d => {
                                menu.append(`<a href="javascript: void(0);" class="resultText" data-value="${d.geometry.location.lat()},${d.geometry.location.lng()}">${p.description}</a>`);
                            });
                        });
                    }
                });
            }, 500);

        })
        .on('blur', function() {
            let field = $(this);

            setTimeout( () => {
                field
                    .val(field.attr('_last'))
                    .siblings('[data-prediction]')
                    .hide();

                fetchValues();
            }, 300);
        });
    }

    ux.el.find('[data-autocomplete]').on('keyup', function() {
        let field = $(this);
        let filter = field.attr('data-autocomplete');

        if (field.val().length == 0) {
            delete activeFilter[filter];
            fetchValues();

            return;
        }

        let keys = fuseSettings.keys[filter];
        let unique = (value, index, self) => self.indexOf(value) === index;
        let settings = {
            ...fuseSettings.default,
            keys: keys.filter( k => k?.length > 0 ),
        }

        let matches = [];

        new Fuse(jobs.map( j => j.data ), settings).search(field.val()).forEach( m => {
            matches.push(...m.matches.map( i => {
                let last = 0;
                let v = [];

                i.indices.forEach( x => {
                    v.push(i.value.slice(last, x[0]));
                    v.push(`<b>${i.value.slice(x[0], x[1])}</b>`);

                    last = x[1];
                });

                v.push(i.value.slice(last));

                return `<a href="javascript: void(0);" class="resultText" data-value="${i.value}">${v.join('')}</a>`;
            }));
        });

        if (matches.length > 0) {
            field.siblings('[data-prediction]')
                .empty()
                .append(`<a href="javascript: void(0);" class="resultText close" data-value="">x</a>`)
                .append(matches.filter(unique).join(''))
                .show()
                .on('click', '[data-value]', function() {
                    let opt = $(this);
                    let value = opt.attr('data-value');

                    field.val(value);
                    opt.parents('[data-prediction]').hide();
                });
        } else {
            field.siblings('[data-prediction]').hide();
        }
    }).on('blur', function() {
        let field = $(this);

        setTimeout( () => {
            field
                .siblings('[data-prediction]')
                .hide();

            let value = field.val();

            if (value.length > 0) {
                activeFilter[field.attr('data-autocomplete')] = value.split(',');
            } else {
                delete activeFilter[field.attr('data-autocomplete')];
            }

            fetchValues();
        }, 250);
    }).on('change', function() {
        let field = $(this);

        if (field.val().length > 0) {
            activeFilter[field.attr('data-autocomplete')] = field.val().split(',');
        } else {
            delete activeFilter[field.attr('data-autocomplete')];

        }

        fetchValues();
    });

    ux.el.find('input[data-submit]')
        .on('keypress', function(e) {
            switch (e.which) {
                case 13 : // Enter key
                    let field = $(this);
                    let filter = field.attr('data-autocomplete') || field.attr('data-filter');
                    let value = field.val();

                    if (value.length > 0) {
                        activeFilter[filter] = value.split(',');
                    } else {
                        delete activeFilter[filter];
                    }

                    field.blur();
                    field.siblings('[data-prediction]').hide();

                    submitSearch();
                    break;
            }
        })

    // Lock/unlock the sub-category dropdown based on whether a category is selected
    let updateSubCategoryLock = () => {
        let hasCategoryFilter =
            (activeFilter['professionID'] && activeFilter['professionID'][0]) ||
            (activeFilter['category']     && activeFilter['category'][0]);

        let subSelects = ux.el.find('[data-filter=roleID], [data-filter=subCategory]');

        if (hasCategoryFilter) {
            subSelects.removeClass('subcategory-disabled').prop('disabled', false);
        } else {
            subSelects.addClass('subcategory-disabled').prop('disabled', true);
        }
    };

    let fetchDebounceTimer = null;
    let pendingFetchResolvers = [];
    let isFetching = false;
    let allJobsCache = null;  // in-memory cache of the full unfiltered job list

    let fetchValues = () => new Promise( (resolve, reject) => {
        // Debounce: cancel any pending fetch and wait 80ms before running
        if (fetchDebounceTimer) {
            clearTimeout(fetchDebounceTimer);
        }

        fetchDebounceTimer = setTimeout( () => {
            fetchDebounceTimer = null;
            _doFetch().then(resolve).catch(reject);
        }, 80);
    });

    let _doFetch = () => new Promise( (resolve, reject) => {
        // If a fetch is already in flight, queue this resolve to fire when it completes
        if (isFetching) {
            pendingFetchResolvers.push(resolve);
            return;
        }
        isFetching = true;

        let values = {
            professionID: {
                all: data.config.ClassificationPlaceholder || 'All Categories',
                list: [],
            },

            roleID: {
                all: data.config.SubClassificationsPlaceholder || 'All Sub Categories',
                list: [],
            },

            workTypeID: {
                all: data.config.WorkTypesPlaceholder || 'All Work Types',
                list: [],
            },

            workModelID: {
                all: data.config.WorkModelsPlaceholder || 'All Work Models',
                list: [],
            },

            state: {
                all: data.config.LocationsPlaceholder || 'All Locations',
                list: [],
            },

            city: {
                all: data.config.CityPlaceholder || 'All Cities',
                list: [],
            },

            country: {
                all: data.config.CountryPlaceholder || 'All Countries',
                list: [],
            },


            category: {
                all: data.config.ClassificationPlaceholder || 'All Categories',
                list: [],
            },

            subCategory: {
                all: data.config.SubClassificationsPlaceholder || 'All Sub Categories',
                list: [],
            },

            workType: {
                all: data.config.WorkTypesPlaceholder || 'All Work Types',
                list: [],
            },

            workModel: {
                all: data.config.WorkModelsPlaceholder || 'All Work Models',
                list: [],
            },
        }

        let unique = (value, index, self) => self.indexOf(value) === index;
        let sort = (x, y) => x.text.toLowerCase() < y.text.toLowerCase() ? -1 : 1;

        let push = (l, vl) => {

            vl
                .map( i => i.id )
                .filter( i => i )
                .filter(unique)
                .forEach( id => {
                    l[id] = {
                        text: vl.find( i => i.id === id ).text,
                        count: (l[id]?.count || 0)  + vl.filter( i => i.id === id ).length
                    };
                });
        }

        jobs = [];

        // Determine the selected category/profession so we can filter sub-categories
        let selectedProfessionID = (activeFilter['professionID'] || [])[0] || null;
        let selectedCategory     = (activeFilter['category']    || [])[0] || null;

        let _flushResolvers = () => {
            isFetching = false;
            resolve();
            // drain any resolvers that queued while this fetch was in flight
            let pending = pendingFetchResolvers.splice(0);
            if (pending.length > 0) {
                _doFetch().then( () => pending.forEach( r => r() ) );
            }
        };

        let processJobs = (j) => {
            push(values.professionID.list, j.map( i => new Object({ id: i.data.professionID, text: i.data.category ?? '' })));

            // Sub-category: only show options whose parent category matches the current category filter
            let subCategorySource = j;
            if (selectedProfessionID) {
                subCategorySource = subCategorySource.filter( i => i.data.professionID === selectedProfessionID );
            }
            push(values.roleID.list, subCategorySource.map( i => new Object({ id: i.data.roleID, text: i.data.subCategory ?? '' })));

            push(values.workTypeID.list, j.map( i => new Object({ id: i.data.workTypeID, text: i.data.workType ?? '' })));
            push(values.workModelID.list, j.map( i => new Object({ id: i.data.workModelID, text: i.data.workModel ?? '' })));
            push(values.state.list, j.map( i => new Object({ id: i.data.state, text: i.data.state ?? '' })));
            push(values.city.list, j.map( i => new Object({ id: i.data.city, text: i.data.city ?? '' })));
            push(values.country.list, j.map( i => new Object({ id: i.data.country, text: i.data.country ?? '' })));

            if (data.config.legacyMode) {
                push(values.category.list, j.map( i => new Object({ id: i.data.category, text: i.data.category ?? '' })));

                // Legacy sub-category: filter by selected category text
                let legacySubSource = j;
                if (selectedCategory) {
                    legacySubSource = legacySubSource.filter( i => i.data.category === selectedCategory );
                }
                push(values.subCategory.list, legacySubSource.map( i => new Object({ id: i.data.subCategory, text: i.data.subCategory ?? '' })));

                push(values.workType.list, j.map( i => new Object({ id: i.data.workType, text: i.data.workType ?? '' })));
                push(values.workModel.list, j.map( i => new Object({ id: i.data.workModel, text: i.data.workModel ?? '' })));
            }

            jobs.push(...j);

            for (let v in values) {
                let l = values[v].list;
                let opt = [];

                for (let i in l) {
                    if (typeof(l[i]) === 'object') {
                        opt.push({
                            id: i,
                            text: l[i].text,
                            count: l[i].count,
                        });
                    }
                }

                ux.el.find(`[data-filter=${v}]`)
                    .empty()
                    .append(`<option value="">${values[v].all}</option`)
                    .append(opt.sort(sort).map( o => `<option value="${o.id}">${o.text} (${o.count})</option>`))
                    .val(activeFilter[v] || '');
            }

            for (let i in fuseSettings.keys) {
                jobs.forEach( j => fuseSettings.keys[i].forEach( k => j.data[k] = j.data[k] || '' ));
            }

            _flushResolvers();
        };

        // Apply sub-category lock state after each render
        updateSubCategoryLock();

        // Use the in-memory cache when only filters have changed — avoids a network round-trip
        if (allJobsCache) {
            // Filter the cached full list locally, no fetch needed
            shApi.getJobs(0, 0, activeFilter, { field: 'changedOnUTC', direction: 'desc' }).then( j => {
                processJobs(j.values);
            });
        } else {
            // First load: fetch from network, populate cache
            shazamme.fetch(Collection.jobResults).then( rawJobs => {
                allJobsCache = rawJobs;
                shApi.getJobs(0, 0, activeFilter, { field: 'changedOnUTC', direction: 'desc' }).then( j => {
                    processJobs(j.values);
                });
            });
        }
    });

    let submitSearch = () => {
        let push = (p, n, v) => {
            if (v?.length > 0) {
                if (data.config.useRedirect) {
                    p.push(`${n}=${encodeURIComponent(v)}`);
                } else {
                    p[n] = v;
                }
            }
        }

        let params = [];

        for (let i in activeFilter) {
            push(params, i, activeFilter[i]);
        }

        if(params.length == 0) {
            push(params, 'keyword', data.config.txt_KeywordFilter);
            push(params, 'category', data.config.txt_ClassificationFilter);
            push(params, 'subcategory', data.config.txt_SubClassifyFilter);
            push(params, 'workType', data.config.txt_WorkTypeFilter);
            push(params, 'workModel', data.config.txt_WorkModelFilter);
            push(params, 'location', data.config.txt_LocationFilter);
            push(params, 'country', data.config.txt_CountryFilter);
            push(params, 'advertiserID', data.config.txt_Advertisers);
        }

        if (data.config.useRedirect) {
            window.location = ux.buildHref('/' + Path.jobResults, params.join('&'));
        } else {
            w.pub('job-search-submit', params);

        }
    }

    let jobs = [];

    w
        .log('widget ready', w)
        .sub('job-search-set', p => {
            for (let i in p) {
                ux.el.find(`[data-filter=${i}]`).val(p[i][0] || '');
                ux.el.find(`[data-autocomplete=${i}]`).val(p[i].join(', '));
                ux.el.find(`[data-gapi-text=${i}]`).val(p[i].join(', '));
            }

            if (!(p?.keyword?.length > 0)) {
                ux.el.find(`[data-autocomplete=keyword]`).val('');
            }

            if (!(p?.geo?.length > 0)) {
                ux.el.find(`[data-gapi=geo]`).val('');
            }

            ux.el.find("[data-filter], [data-autocomplete]").trigger('change');
        });

    w.sub('site-config-ready', () => {
        const site = shazamme.bag('site-config');

        if (site?.configuration?.jobLocalization || site?.configuration?.jobFieldMap) {
            shazamme.site().then( s => {
                Collection.jobResults = {
                    path: `/job-results/${s.siteID}`,
                    useCache: true,
                    isExternal: true,
                    lang: site?.configuration?.jobLocalization && data.locale,
                    fieldMap: site?.configuration?.jobFieldMap,
                }

                allJobsCache = null; // invalidate cache — collection endpoint changed
                fetchValues();
            });
        }
    })

    return shazamme.site().then( s => {
        Collection.jobResults = {
            path: `/job-results/${s.siteID}`,
            useCache: true,
            isExternal: true,
        }

        return Promise.resolve({ fetchValues, })
    });
}

Promise.all([
    ux.loadScript('https://cdn.jsdelivr.net/npm/fuse.js@6.4.0').then(),
    ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.3.min.js'),
])
    .then( () => shazamme.ready((data.inEditor && data.config.debugSiteID) || data.siteId, data.page) )
    .then( () => (data.config.googleApiKey && data.config.showGeoSearch && shazamme.gapi(data.config.googleApiKey).maps(['places'])) || Promise.resolve() )
    .then( () => {
        main(shazamme.register('job-search', data))
            .then( w => w.fetchValues() )
            .then( () => {
                // Apply initial sub-category lock on page load
                ux.el.find('[data-filter=roleID], [data-filter=subCategory]').addClass('subcategory-disabled').prop('disabled', true);
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

                ux.el.find("[data-filter], [data-autocomplete]").trigger('change');
            });
    });
