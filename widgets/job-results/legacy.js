const ActionUrl = 'https://shazamme.io/Job-Listing/src/php/actions';

// Track the first genuine user interaction. The widget calls showLoading() during its
// initial job fetch on page load, which paints a full-screen overlay on every visit. We
// suppress that overlay for the initial load but keep it for user-triggered loads
// (search, filter, paging) — those happen only after the visitor has interacted.
let _userEngaged = false;
['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach( ev =>
    window.addEventListener(ev, () => { _userEngaged = true; }, { capture: true, passive: true, once: true })
);

const Path = {
    login: "/login",
    alerts: "/job-alerts",
    dashboard: "/dashboard",
    jobApply: data.config.applicationPage || '/job-application',
    jobDetails: data.config.detailsPage || '/job-details',
};

const Collection = {
    job: {
        name: data.config.JobCollection || 'Jobs',
        action: 'Get Jobs',
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugJobCollection,
        endpoint: data.config.debugJobCollection,
    },

    locationSeo: {
        name: data.config.LocationSeoCollection || 'Location SEO',
        action: 'Get Location SEO',
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugLocationSeoCollection,
        endpoint: data.config.debugLocationSeoCollection,
    },

    workModel: {
        name: data.config.WorkModelCollection || 'Work Model',
        action: 'Get Work Models',
        useCache: true,
        debug: data.inEditor && data.config.debugMode && data.config.debugWorkModelCollection,
        endpoint: data.config.debugWorkModelCollection,
    },
}

const LocalStorage = {
    lastSearch: 'lastSearch',
}

const Subscribe = {
    auth         : 'site-auth',
    loginCancel  : 'login-dialog-cancel',
    loginSubmit  : 'login-dialog-submit',
    loginReady   : 'login-dialog-ready',
    siteReady    : 'site-config-ready',
}

const Message = {
    loginShow    : 'login-dialog-show',
    saveJob      : 'job-results-save-job',
}

function ShApi() {
    let allFilter = {}

    this.ready = () => Promise.all([
        shazamme.fetch(Collection.workModel).then( wm => {
            if (wm) {
                allFilter.workModelID = wm
                    ?.filter( i => i.data.includeInAllSearches )
                    ?.map( i => i.data.workModelID );
            }

            return Promise.resolve();
        }).catch( () => Promise.resolve() ),
    ]);

    this.getJobs = (
        pageNumber
        , pageSize
        , filters={}
        , sort={
            field: 'changedOnUTC',
            direction: 'desc',
        }) => new Promise( (resolve, reject) => {
            shazamme.fetch(Collection.job).then( jobs => {
                let filtered = [];

                if (data.config.catchAllFilter && data.config.catchAllProfession) {
                    jobs
                        .filter( j => j.data.roleID?.length > 0 && !j.data.professionID )
                        .forEach( j => {
                            j.data.category = data.config.catchAllProfession;
                            j.data.professionID = data.config.professionCatchAll;
                            j.data.professionSeo = data.config.catchAllProfessionSeo;
                            j.data.professionCatchAll = true;
                        });
                }

                if (data.config.catchAllFilter && data.config.catchAllState) {
                    jobs
                        .filter( j => j.data.city?.length > 0 && !j.data.state )
                        .forEach( j => {
                            j.data.state = data.config.catchAllState;
                            j.data.stateCatchAll = true;
                        });
                }

                if (filters) {
                    filtered = jobs.filter( j => {
                        let ok = true;

                        let isMatch = (v) => {
                            if (typeof(v) !== 'string') {
                                return false;
                            }

                            v = v.toLowerCase()

                            for (let i = 0; i < filters[f].length; i++) {
                                if (v.includes(filters[f][i].toLowerCase().trim())) {
                                    return true;
                                }
                            }

                            return false;
                        }

                        for (f in filters) {
                            switch (f) {
                                case 'salaryFrom': ok = ok && j.data[f] >= filters[f][0]; break;

                                case 'salaryTo': ok = ok && j.data[f] <= filters[f][0]; break;

                                case 'keyword': {
                                    ok = ok && (
                                        (data.config.toggleCategory === true && isMatch(j.data.category))
                                        || (data.config.toggleSubCategory === true && isMatch(j.data.subCategory))
                                        || (data.config.toggleContact === true && isMatch(j.data.contactName))
                                        || isMatch(j.data.contactEmail)
                                        || isMatch(j.data.contactPhone)
                                        || (data.config.toggleLocation === true && (isMatch(j.data.location) || isMatch(j.data.fullAddressForSearch)))
                                        || (data.config.toggleArea === true && isMatch(j.data.city))
                                        || (data.config.toggleCountry === true && isMatch(j.data.country))
                                        || (data.config.toggleFD === true && isMatch(j.data.fullDescription))
                                        || (data.config.toggleRefNo === true && isMatch(j.data.referenceNumber))
                                        || isMatch(j.data.jobName)
                                        || isMatch(j.data.tags)
                                    );

                                    break;
                                }

                                case 'location': {
                                    ok = ok && (isMatch(j.data.fullAddress) || isMatch(j.data.fullAddressForSearch));
                                    break;
                                }

                                case 'geo': {
                                    let p = { lat: parseFloat(j.data.latitude), lon: parseFloat(j.data.longitude) }
                                    let range = filters['geoRange'][0] * 1.61;
                                    let include = false;

                                    for (let i in allFilter) {
                                        include = include || allFilter[i].indexOf(j.data[i]) >= 0;
                                    }

                                    ok = ok && (include || (p.lat && p.lon && this._distance(filters[f][0], p, parseInt(data.config.proximityDiameter || '6371')) <= range));
                                    break;
                                }

                                case 'jobStartDate': {
                                    let d = new Date(filters[f][0] + 'T00:00:00');

                                    ok = ok && (isNaN(d) || (j.data.jobEndDate && d <= new Date(j.data.jobEndDate)));
                                    break;
                                }
                                case 'jobEndDate': {
                                    let d = new Date(filters[f][0] + 'T00:00:00');

                                    ok = ok && (isNaN(d) || (j.data.jobStartDate && d >= new Date(j.data.jobStartDate)));
                                    break;
                                }

                                case 'geoRange': break;
                                case 'geoAddress': break;
                                case 'geoIn': break;

                                default: ok = ok && (filters[f].length === 0 || filters[f].indexOf(j.data[f]) >= 0); break;
                            }
                        }

                        return ok;
                    });
                } else {
                    filtered.push(...jobs);
                }

                resolve({
                    values: filtered.sort( (x, y) => {
                        if (x.data[sort.field] > y.data[sort.field]) {
                            if (sort.direction === 'asc') {
                                return 1;
                            } else {
                                return -1;
                            }
                        }

                        if (x.data[sort.field] < y.data[sort.field]) {
                            if (sort.direction === 'asc') {
                                return -1;
                            } else {
                                return 1;
                            }
                        }

                        return 0;
                    }).slice(pageSize > 0 ? pageNumber * pageSize : 0, pageSize > 0 ? pageNumber * pageSize + pageSize : undefined),
                    page: {
                        pageNumber: pageNumber,
                        totalPages: parseInt(Math.ceil(filtered.length / pageSize)),
                        totalItems: filtered.length,
                    }
                });
            });
    });

    this.saveJob = (jobID, candidateID) =>
        shazamme.submit({
            action: "Save Job",
            candidateID: candidateID,
            jobID: jobID,
            isFavorite: true,
            isSaved: false,
            isAcknowledged: null,
        }, false);

    this.createSave = (d) =>
        shazamme.site().then( s =>
            shazamme.submit({
                action: "Create Job Alert",
                siteID: s.siteID,
                ...d,
            })
        );

     this.marshalSaveJob = (jobID) => {
        shazamme.store('previousApplicationPage', null);
        shazamme.store('signInAction', null);

        shazamme.store('previousApplicationPage', window.location.href);
        shazamme.store('signInAction', JSON.stringify({
            action: "Save Job",
            candidateID: '',
            jobID: jobID,
            isFavorite: true,
            isSaved: false,
            isAcknowledged: null,
        }));
     }

     this.deleteSavedJob = (id) =>
        shazamme.submit({
            action:"Delete Saved Job",
            candidateSavedJobID: id,
        }, false);

    this.getSavedJobs = (candidateID) =>
        shazamme.site().then( () =>
            shazamme.submit({
                action: "Get Saved Jobs",
                candidateID: candidateID,
            }, false)
        );

    this.getLocationSeo = () => new Promise( (resolve, reject) => {
        let seo = {}

        shazamme.fetch(Collection.locationSeo).then( r => {
            if (r.length > 0) {
                resolve(JSON.parse(r[0].data?.value || null));
            } else {
                resolve({});
            }
        });
    });

    this._distance = (p1, p2, d = 6371) => {
        let _toRadians = (d) => d * Math.PI / 180;

        let dLat = _toRadians(p2.lat - p1.lat);
        let dLon = _toRadians(p2.lon - p1.lon);

        let a = Math.sin(dLat/2)
            * Math.sin(dLat/2)
            + Math.sin(dLon/2)
            * Math.sin(dLon/2)
            * Math.cos(p1.lat)
            * Math.cos(p2.lat);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return d * c;
    }
}

function UX() {
    this.el = $(element);
    this.uri = new URL(window.location.href);

    this.jobStandardEl = j => {
        let jobDate = new Date(j.changedOnUTC+'Z');
        let isNew = data.config.showNewIcon && jobDate && !isNaN(jobDate.getTime()) && (+new Date() - jobDate) / (1000 * 3600 *24) <= 1;

        let jobSalary = (j) => {
            if (data.config.useSalaryText) {
                return j.salaryText || '';
            }

            let currencySymbol = (data.config.showSalaryCurrencySymbol && j.currencySymbol) || '';
            let currencyCode = (data.config.showSalaryCurrencyCode && j.currencyCode) || '';
            let showCents = data.config.showCents;
            let fractionDigits = showCents ? 2 : 0;
            let salaryFrom = undefined;
            let salaryTo = undefined;

            let format = (salary) => !isNaN(salary) && `${currencySymbol}${salary.toLocaleString(undefined, {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits})} ${currencyCode}`

            if (j.salaryFrom >= 0) {
                salaryFrom = showCents ? j.salaryFrom : Math.floor(j.salaryFrom);
            }

            if (j.salaryTo >= 0) {
                salaryTo = showCents ? j.salaryTo : Math.floor(j.salaryTo);
            }

            return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}`
                : salaryFrom > 0 ? `${format(salaryFrom)}`
                : salaryTo > 0 ? `${format(salaryTo)}`
                : data.config.noSalaryText || '';
        }

        let details = [];
        let salary = jobSalary(j);

        let location = [];
        if (data.config.showCity && j.city?.length > 0) location.push(j.city);
        if (data.config.showState && j.state?.length > 0 && !j.stateCatchAll) location.push(j.state);
        if (data.config.showCountry && j.country?.length > 0) details.push(`<div class="shmLocation">${j.country}</div>`);
        if (location.length > 0) details.push(`<div class="shmLocation">${location.join(', ')}</div>`);

        if (data.config.showSalary && salary !== '') details.push(`<div class="shmSalary">${salary}</div>`);
        if (data.config.showBasicSalary && j.salary?.length > 0) details.push(`<div class="shmSalary">${j.salary}</div>`);
        if (data.config.showDate && !isNaN(jobDate)) details.push(`<div class="shmJobDateCreated">${jobDate.toLocaleDateString()}</div>`);

        if (data.config.showWorkType && j.workType) details.push(`<div class="work-type">${j.workType}</div>`);
        if (data.config.showWorkModel && j.workModel) details.push(`<div class="work-model">${j.workModel}</div>`);
        if (data.config.showCategory && j.category) details.push(`<div class="jobCategory">${j.category}</div>`);


        return `
            <div class="shmJobResultStd shmJobResult" style="--shaz-hover-color:${data.config.jobResultHoverColor}" data-rel="article-job-result" data-id="${j.jobID}">

                ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}
                ${data.config.themeBackground && j.pColorCode && `<div class="theme background" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}


                <div class="shmJobItemDetails">

                ${data.config.showNewIcon && isNew ? `<span class="shmTag job-new">${data.config.newIconLabel || ''}</span>` : ''}

                    ${(data.config.showTimeSincePosted && !isNaN(jobDate) && `<div class="shmTimePostedText">${(data.config.postedText || 'Posted ')} ${this._timeSince(jobDate)}</div>`) || ''}

                    <div class="shmJobItemUpper">
                        <div class="shmJobtitle">
                        <a  href="${j.detailsUri}" class="shmJobtitle" data-rel="link-job-name">${j.jobName}</a>
                        </div>

                        <div class="shmUpperRight" style="--alignSaveJobAndEmail:${data.config.alignSaveJobAndEmail}">
                            <div class="shmCTA">
                                <div class="shmSaveJob ${j.saveID ? ' active' : ''}" style="--shaz-hover-color:${data.config.saveJobHoverColor}; --shaz-email-save-uppercase:${data.config.saveAndEmailUppercase}" data-rel="${j.saveID ? 'action-unsave-job' : 'action-save-job'}" data-save-id="${j.saveID || ''}">
                                    ${data.config.actionButtonIcon ?
                                        `
                                        <span class="icon-action active">${data.config.activeSaveButtonIcon || ''}</span>
                                        <span class="icon-action inactive">${data.config.saveButtonIcon || ''}</span>
                                        `
                                    : ''}

                                    ${data.config.actionButtonText ? `
                                    <span class='active'>${data.config.unsaveJobText || 'unsave job'}</span>
                                    <span class='inactive'>${data.config.saveJobText || 'save job'}</span>
                                    ` : ''}
                                </div>

                                <div class="shmDividerContainer">
                                ${data.config.showShmDivider ? `
                                <span class="shmDivider">|</span>
                                ` : ''}
                                </div>

                                <div class="shmSendEmail" style="--shaz-hover-color:${data.config.sendEmailHoverColor}; --shaz-email-save-uppercase:${data.config.saveAndEmailUppercase}">
                                <a href="mailto:?subject=${data.config.shareEmailSubject} ${encodeURI(j.jobName)}&body=${encodeURI(data.config.emailBody || 'Have a look at this amazing job!\n\n') + encodeURI(j.detailsUri)}" class="shmSendEmail">
                                    ${data.config.actionButtonIcon ? `<span class="icon-action"><span class="text">${data.config.emailButtonIcon}</span></span>` : ''}
                                    ${data.config.actionButtonText && (data.config.sendEmailText || 'send email') || ''}
                                </a>
                                </div>
                            </div>
                            <div class="shmJobDateCreated"></div>
                        </div>
                    </div>
                    <div class="shmJobDetails">

                        <div class="shmJobDetailsPanel shmJobDetailsLeft" style="--alignJobDetails:${data.config.alignJobDetails}">
                            ${details.join(`<div class="shmDetailsDivider shmDividerEnabled">${ data.config.separatorText || '|' }</div>`)}
                        </div>

                        <div class="shmJobDetailsPanel shmJobDetailsRight">
                            <ul class="shmRequirements">
                                ${j.shortDescription || ''}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="shmButtonLinks">
                    ${data.config.applybtn && `<a class="shmGoApply" href="${j.applicationURL || ux.buildHref(Path.jobApply, 'jobID=' + j.jobID)}"><span class="text">${data.config.applyNowLabel || 'Apply Now'}</span></a>` || ''}
                    ${data.config.readmorebtn && `<a class="shmGoReadMore"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || 'Read More'}</span></a>` || ''}
                </div>
            </div>
        `;
    }

    this.jobSimpleEl = j => {
        let jobDate = new Date(j.changedOnUTC+'Z');
        let isNew = data.config.showNewIcon && jobDate && !isNaN(jobDate.getTime()) && (+new Date() - jobDate) / (1000 * 3600 *24) <= 1;

        let jobSalary = (j) => {
            if (data.config.useSalaryText) {
                return j.salaryText || '';
            }

            let currencySymbol = (data.config.showSalaryCurrencySymbol && j.currencySymbol) || '';
            let currencyCode = (data.config.showSalaryCurrencyCode && j.currencyCode) || '';
            let showCents = data.config.showCents;
            let fractionDigits = showCents ? 2 : 0;
            let salaryFrom = undefined;
            let salaryTo = undefined;

            let format = (salary) => !isNaN(salary) && `${currencySymbol}${salary.toLocaleString(undefined, {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits})} ${currencyCode}`

            if (j.salaryFrom >= 0) {
                salaryFrom = showCents ? j.salaryFrom : Math.floor(j.salaryFrom);
            }

            if (j.salaryTo >= 0) {
                salaryTo = showCents ? j.salaryTo : Math.floor(j.salaryTo);
            }

            return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}`
                : salaryFrom > 0 ? `${format(salaryFrom)}`
                : salaryTo > 0 ? `${format(salaryTo)}`
                : data.config.noSalaryText || '';
        }

        let salary = jobSalary(j);

        let location = [];
        if (data.config.showCity && j.city?.length > 0) location.push(j.city);
        if (data.config.showState && j.state?.length > 0 && !j.stateCatchAll) location.push(j.state);

        return `<div class="shmJobResultSimple flex-container"  data-rel="article-job-result" data-id="${j.jobID}">

            ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}
            ${data.config.themeBackground && j.pColorCode && `<div class="theme background" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}


            <div class="topRow">
                <div class="timeSincePostedRow">
                    <div class="newTagContainer">
                        ${data.config.showNewIcon && isNew ? `<span class="newTag">${data.config.newIconLabel || ''}</span>` : ''}
                    </div>
                    ${(data.config.showTimeSincePosted && !isNaN(jobDate) && `<div class="TimeSincePosted">${(data.config.postedText || 'Posted ')} ${this._timeSince(jobDate)}</div>`) || ''}
                </div>
                <div class="actionItemsRow">

                    <div class="shmSaveJob ${j.saveID ? ' active' : ''}" data-rel="${j.saveID ? 'action-unsave-job' : 'action-save-job'}" data-save-id="${j.saveID || ''}" title="${j.saveID ? data.config.unsaveJobText || 'unsave job' : data.config.saveJobText || 'save job'}">

                        ${data.config.actionButtonIcon ?
                            `
                            <span class="icon-action active">${data.config.activeSaveButtonIcon || ''}</span>
                            <span class="icon-action inactive">${data.config.saveButtonIcon || ''}</span>
                            `
                        : ''}

                        ${data.config.actionButtonText ? `
                        <span class='active'>${data.config.unsaveJobText || 'unsave job'}</span>
                        <span class='inactive'>${data.config.saveJobText || 'save job'}</span>
                        ` : ''}
                    </div>

                    <div class="shmDividerContainer"></div>

                    <div class="shmSendEmail">
                    <a href="mailto:?subject=${data.config.shareEmailSubject} ${encodeURI(j.jobName)}&body=${encodeURI((data.config.emailBody || 'Have a look at this amazing job!') + '\n\n') + encodeURI(j.detailsUri)}" class="shmSendEmail" title=${data.config.sendEmailText || 'send email'}>
                        ${data.config.actionButtonIcon ? `<span class="icon-action">${data.config.emailButtonIcon}</span>` : ''}
                        ${data.config.actionButtonText && (data.config.sendEmailText || 'send email') || ''}
                    </a>
                    </div>
                </div>
            </div>

            <div class="resultsContainer">
                <div class="jobResultTitle"><a  href="${j.detailsUri}" class="jobResultTitle" data-rel="link-job-name">${j.jobName}</a></div>
                ${data.config.showCategory && j.category && !j.professionCatchAll && `<div class="jobCategory">${j.category}</div>` || ''}
                <div class="flex-col">
                    ${data.config.showWorkType && j.workType && `<div class="flex-col-separator workType" style="padding-right: 0px !important; padding-left: calc(${data.config.workTypeModelSpacing}px * 2) !important; --shaz-spacing: ${data.config.workTypeModelSpacing}px;">${j.workType}</div>` || ''}
                    ${data.config.showWorkModel && j.workModel && `<div class="flex-col-separator workModel" style="padding-right: 0px !important; padding-left: calc(${data.config.workTypeModelSpacing}px * 2) !important; --shaz-spacing: ${data.config.workTypeModelSpacing}px;">${j.workModel}</div>` || ''}
                </div>
                <div class="jobDescription">${j.shortDescription || ''}</div>



                <div class="separator"></div>

                <div class="bottomRow">

                ${(location.length > 0 || data.config.showCountry) && `
                    <div class="locationContainer">
                        ${data.config.locationSalaryIcon ?
                         `<div class="locationIcon">
                            <span class="iconbottom">${data.config.locationIcon}</span>
                         </div>`
                         : ''}
                         <div class="locationText">
                             ${data.config.showCountry && `<div>${j.country || ''}</div>` || ''}
                             ${location.length > 0 && `<div>${location.join(', ')}</div>` || ''}
                         </div>
                    </div>
                    ` || ''}

                    <div class="salaryContainer">
                        ${data.config.showSalary && (j.salaryFrom > 0 || j.salaryTo > 0 || salary?.length > 0) ? `
                            ${data.config.locationSalaryIcon ?
                            `<div class="salaryIcon">
                                <span class="iconbottom">${data.config.salaryIcon}</span>
                            </div>`
                            : ''}
                            <div class="salaryText">${data.config.showSalary && salary || ''}</div>
                        ` : ''}
                    </div>

                    <div class="salaryContainer">
                        ${data.config.showBasicSalary && j.salary?.length > 0 && `
                            ${data.config.locationSalaryIcon ?
                            `<div class="salaryIcon">
                                <span class="iconbottom">${data.config.salaryIcon}</span>
                            </div>`
                            : ''}
                            <div class="salaryText">${j.salary}</div>
                        ` || ''}
                    </div>

                    <div class="actionButtonRow desktop">
                        ${data.config.applybtn && `<a class="applyActionButton" href="${j.applicationURL || ux.buildHref(Path.jobApply, 'jobID=' + j.jobID)}"><span class="text">${data.config.applyNowLabel || 'Apply Now'}</span></a>` || ''}
                        ${data.config.readmorebtn && `<a class="readMoreActionButton"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || 'Read More'}</span></a>` || ''}
                    </div>
                </div>

                <div class="actionButtonRow mobile">
                    ${data.config.applybtn && `<a class="applyActionButton" href="${j.applicationURL || ux.buildHref(Path.jobApply, 'jobID=' + j.jobID)}"><span class="text">${data.config.applyNowLabel || 'Apply Now'}</span></a>` || ''}
                    ${data.config.readmorebtn && `<a class="readMoreActionButton"  href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || 'Read More'}</span></a>` || ''}
                </div>
            </div>
        </div>`;
    }

    this.jobModernEl = j => {
        let jobdate = new Date(j.postedDate);
        let isNew = data.config.showNewIcon && jobdate && !isNaN(jobdate.getTime()) && (+new Date() - jobdate) / (1000 * 3600 *24) <= 1;
        let startDate = new Date(j.jobStartDate || undefined);
        let endDate = new Date(j.jobEndDate || undefined);

        let postedDate = (j) => {
            if (!data.config.showDate && !data.config.showTimeSincePosted) {
                return '';
            }

            let out = [];

            if (data.config.showDate && !isNaN(jobdate)) {
                out.push(j.postedDate);
            }

            if (data.config.showTimeSincePosted) {
                out.push(this._timeSince(jobdate));
            }

            return out.join(' · ');
        }

        let jobSalary = (j) => {
            if (data.config.useSalaryText) {
                return j.salaryText || '';
            }

            if (!j.isDisplaySalary) {
                return '';
            }

            let currencySymbol = (data.config.showSalaryCurrencySymbol && j.currencySymbol) || '';
            let currencyCode = (data.config.showSalaryCurrencyCode && j.currencyCode) || '';
            let showCents = data.config.showCents;
            let fractionDigits = showCents ? 2 : 0;
            let salaryFrom = undefined;
            let salaryTo = undefined;

            let format = (salary) => !isNaN(salary) && `${currencySymbol}${salary.toLocaleString(undefined, {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits})} ${currencyCode}`

            if (j.salaryFrom >= 0) {
                salaryFrom = showCents ? j.salaryFrom : Math.floor(j.salaryFrom);
            }

            if (j.salaryTo >= 0) {
                salaryTo = showCents ? j.salaryTo : Math.floor(j.salaryTo);
            }

            return salaryFrom > 0 && salaryTo > 0 ? `${format(salaryFrom)} - ${format(salaryTo)}`
                : salaryFrom > 0 ? `${format(salaryFrom)}`
                : salaryTo > 0 ? `${format(salaryTo)}`
                : data.config.noSalaryText || '';
        }

        let position = (j.positionTitle) || j.advertiserName;

        let location = [];
        if (data.config.showCity && j.city?.length > 0) location.push(j.city);
        if (data.config.showState && j.state?.length > 0 && !j.stateCatchAll) location.push(j.state);

        return `
        <div class="shmJobResultModern">

                ${data.config.useTheming && j.pColorCode && `<div class="theme" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}
                ${data.config.themeBackground && j.pColorCode && `<div class="theme backgrouond" style="--shaz-theme-color: ${j.pColorCode};"></div>` || ''}

            <div class="job-detail">
                <div class="category-meta-container">
                    <p class="job-category">${(!j.professionCatchAll && j.category) || ''}</p>

                    <div class="meta">
                        ${isNew && `<div class="meta-value">New Posting</div>` || ''}
                        ${data.config.showCountry && j.country && `<div class="meta-value">${j.country}</div>` || ''}
                        ${location.length > 0 && `<div class="meta-value">${location.join(', ')}</div>` || ''}
                        ${data.config.metaToggle && j.subCategory && `<div class="meta-value">${j.subCategory}</div>` || ''}
                    </div>
                </div>
                ${ (data.config.showWorkType && j.workType?.length > 0) || (data.config.showWorkModel && j.workModel?.length > 0) ?
                    `<div class="job-about">
                        ${data.config.showWorkType && `<span class="text">${j.workType || ''}</span>` || ''}
                        ${data.config.showWorkModel && `<span class="text">${j.workModel || ''}</span>` || ''}
                    </div>`
                : ''}
                <div class="section-main">
                    <div class="description">
                        <p class="job-title"><a href="${j.detailsUri}">${j.jobName || ''}</a></p>
                        ${j.shortDescription && `<div class="label-job-description" style="--shaz-job-result-lines: ${data.config.jobDetailsLines || 3};">${j.shortDescription}</div>` || ''}
                    </div>
                    <div class="side-bar">
                        ${j.customImageURL && j.customImageURL.length > 0 ? `<img class="image-logo" src="${j.customImageURL}" alt="company logo">` : ''}


                        ${data.config.showReadMoreButton && `<a class="button-action read-more" href="${j.detailsUri}"><span class="text">${data.config.readMoreLabel || 'Read More'}</span></a>` || ''}
                        ${data.config.showApplyButton && `<a class="button-action apply" href="${j.applicationURL || ux.buildHref(Path.jobApply, 'jobID=' + j.jobID)}"><span class="text">${data.config.applyNowLabel || 'Apply Now'}</span></a>` || ''}


                     </div>
                 </div>

                ${
                    data.config.showJobPeriod
                        &&  `
                            <div class="job-period">
                            ${!isNaN(startDate) && `<p>${data.config.startDateLabel} ${startDate.toLocaleDateString()}</p>` || ''}
                            ${!isNaN(endDate) && `<p>${data.config.endDateLabel} ${endDate.toLocaleDateString()}</p>` || ''}
                            </div>
                        ` || ''
                }

                ${data.config.showSalary && `<p class="label-salary">${jobSalary(j)}</p>` || ''}
                ${data.config.showBasicSalary && `<p class="label-salary">${j.salary || ''}</p>` || ''}
                ${(data.config.showDate || data.config.showTimeSincePosted) && `<p class="label-posted">${postedDate(j)}</p>` || ''}
            </div>

            ${data.config.showRecruiter && `
            <div class="recruiter-detail">
                <div class="section-bio">
                    ${j.consultantPhotoURL && `<img class="image-head-shot" style="--consultantImagePosition:${data.config.consultantImagePosition}" src="${j.consultantPhotoURL || ''}" alt="${j.contactName}" />` || ''}

                    <div class="bio-name">
                        ${j.contactName && `<p class="contact-name">${j.contactName}</p>` || ''}
                        ${position && `<p class="advertiser-name">${position}</p>` || ''}
                    </div>
                </div>

                <div class="section-contact">
                    ${j.contactPhone && `<a class='phone' href="tel:${j.contactPhone}">${j.contactPhone || data.config.contactPhone || 'CALL ME'}</a>`|| ''}
                    ${j.contactEmail && `<a class='email' href="mailto:${j.contactEmail}">${j.contactEmail || data.config.contactEmail || 'EMAIL ME'}</a>`|| ''}
                </div>
            </div> ` || '' }
        </div>
        `;
    }


    this.showJobResults = (html) => {
        this.el.find('[data-rel=job-results-map]').hide();

        this.el.find('[data-rel=job-results-list]')
            .empty()
            .append(html)
            .show();

        this.el.find('[data-rel=job-results-list] [data-rel=link-job-name]')
            .on('mouseenter', function() { $(this).addClass('over'); })
            .on('mouseleave', function() { $(this).removeClass('over'); });

        this.el.find('[data-rel=job-results-list] .shmJobResultStd')
            .on('mouseenter', function() { $(this).addClass('over'); })
            .on('mouseleave', function() { $(this).removeClass('over'); });
    }

    this.showJobPins = (j) => {
        let pins = j
            .filter( i => i.latitude !== null && i.longitude !== null)
            .map( i => {
                return {
                    page_item_url: i.jobURL
                    , latitude: i.latitude
                    , longitude: i.longitude
                    , state: i.state
                    , jobName: i.jobName
                    , profession: i.category ?? ''
                }
            });

        let center = new google.maps.LatLng(
            pins[0]?.latitude || -33.8678500,
            pins[0]?.longitude || 151.2073200
        );

        let map = new google.maps.Map(document.getElementById('shmMap'), {
            zoom: 8,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            rotateControl: true
        });

        let bounds = new google.maps.LatLngBounds();
        let infowindow = new google.maps.InfoWindow();

        pins.forEach( p => {
            let marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(p.latitude, p.longitude),
                map: map,
            });

            bounds.extend(marker.position);

            google.maps.event.addListener(marker, 'click', ((marker, i) => {
                let pinEl = `
                    <div class="gmapInfoContainer">
                        <div class="gmapTitle">${p.jobName}</div>
                        <div class="gmapLocation">${p.state}</div>
                        <a class="gmapReadMoreProfession" href="${p.page_item_url}" target="_blank"> <span class="text">${p.profession}</span></a>
                        <a class="gmapReadMore" href="${p.page_item_url}" target="_blank"> <span class="text">${data.config.mapReadMore || 'Read More'}</span></a>
                    </div>
                `;
                return () => {
                    infowindow.setContent(pinEl);
                    infowindow.open(map, marker);
                };
            })(marker));
        });

        this.el.find('[data-rel=job-results-list]').hide();
        this.el.find('[data-rel=job-results-map]').show();

        map.fitBounds(bounds);
    }

    this.showPages = (pageNumber, totalPages, maxVisiblePages = 5) => {
        if (totalPages < 2) {
            return;
        }

        let pages = [];

        let start = 1;

        if (pageNumber >= maxVisiblePages - 1) {
            start = pageNumber - Math.floor(maxVisiblePages / 2) + 1;
        }

        if (start + maxVisiblePages >= totalPages) {
            start = totalPages - maxVisiblePages;
        }

        if (start < 0) {
            start = 1;
        }

        let end = start + maxVisiblePages;

        if (end > totalPages) {
            end = totalPages;
        }

        let back = $("<a />")
            .addClass(`button-paging ${pageNumber <= 0 ? 'disabled' : ''}`)
            .attr('data-rel', pageNumber > 0 ? 'paging-select' : '')
            .attr('data-page-number', pageNumber - 1)
            .text('<<');

        let next = $("<a />")
            .addClass(`button-paging ${pageNumber >= totalPages - 1 ? 'disabled' : ''}`)
            .attr('data-rel', pageNumber < totalPages - 1 ? 'paging-select' : '')
            .attr('data-page-number', pageNumber + 1)
            .text('>>');

        pages.push(back);

        if (start > maxVisiblePages) {
            pages.push(
                $("<a />")
                    .addClass(`button-paging`)
                    .attr('data-rel', 'paging-select')
                    .attr('data-page-number', 0)
                    .text(1),

                $("<a />")
                    .addClass(`button-paging disabled`)
                    .text('...'),
            );
        }

        for (let i = start - 1; i < end; i++) {
            pages.push(
                $("<a />")
                    .addClass(`button-paging ${pageNumber === i ? 'active' : ''}`)
                    .attr('data-rel', 'paging-select')
                    .attr('data-page-number', i)
                    .text(i+1)
            );
        }

        if (end < totalPages) {
            pages.push(
                $("<a />")
                    .addClass(`button-paging disabled`)
                    .text('...'),

                $("<a />")
                    .addClass(`button-paging`)
                    .attr('data-rel', 'paging-select')
                    .attr('data-page-number', totalPages - 1)
                    .text(totalPages),
            );
        }

        pages.push(next);

        let resultsList = $(element).find('[data-rel=job-results-list]');

        resultsList.find('[data-rel=job-results-paging]').remove();

        $('<div></div>')
            .addClass('section-job-results-paging')
            .attr('data-rel', 'job-results-paging')
            .append(pages)
            .appendTo(resultsList);
    }

    this.showFilters = (title, filters, type, parentType, collapsible, activeFilter, validFilters) => {
        const sort = (x, y) => x?.value?.toLowerCase() > y?.value?.toLowerCase() ? 1 : -1;

        let map = {}
        let sender = this;

        filters.sort(sort).forEach( f => {
            map[f.id] = {
                count: 0,
                ...f,
            };
        });

        let html = [];
        let collapsibleIcon = 'data:image/svg+xml;base64,' + btoa(data.config.collapseIcon);

        html.push(`<p
            class="
                filter-title
                ${collapsible && 'collapsible'}"
            data-rel="filter-group"
            data-filter-type="${type}">
                ${
                    collapsible
                    ? `<span
                        class="collapse-icon"
                        style="
                            --collapse-icon-size: ${data.config.collapseIconSize}px;
                            --collapse-icon-fill: ${data.config.collapseIconFill};
                        "
                    >${data.config.collapseIcon}</span>`
                    : ''
                }
                ${title}
            </p>`);


        for (let i in map) {
            let f = map[i];

            html.push(
                 `<div class="filter-toggle ${activeFilter[type] && activeFilter[type].indexOf(f.id) >= 0 ? ' active' : ''}"
                    href="javascript:void(0)"
                    data-rel="${!defaultFilter[type] || defaultFilter[type].indexOf(f.id) === -1 ? 'filter-toggle' : ''}"
                    data-filter-type="${type}"
                    data-filter-value="${f.id}"
                    ${f.seo && `data-filter-path="${f.seo}"` || ''}
                    ${parentType && `data-filter-parent-type="${parentType}"` || ''}
                    ${f.parent && `data-filter-parent-value="${f.parent}"` || ''}>
                        <input type="checkbox" />
                        ${f.value} (${f.count})
                </div>`
            );
        }

        if (validFilters && validFilters.length > 0) {
            let map = {}

            validFilters.sort(sort).forEach( f => {
                map[f.id] = {
                    count: validFilters.filter( x => x.id === f.id ).length,
                    ...f,
                };
            });

            for (let i in map) {
                let f = map[i];

                html.push(
                     `<div class="filter-toggle more"
                        href="javascript:void(0)"
                        data-rel="filter-toggle"
                        data-filter-type="${type}"
                        data-filter-value="${f.id}"
                        ${f.seo && `data-filter-path="${f.seo}"` || ''}
                        ${parentType && `data-filter-parent-type="${parentType}"` || ''}
                        ${f.parent && `data-filter-parent-value="${f.parent}"` || ''}>

                        <input type="checkbox" />
                        ${f.value} (${f.count})
                    </div>`
                );
            }
        }

        let filterList = this.el.find('[data-rel=filter-attribute]');

        filterList.find(`[data-filter-type=${type}]`).remove();
        filterList.find(`[data-filter-parent-type=${type}]`).remove();
        filterList.append(html.join(''));

        filterList.find('.filter-toggle.active').not('[data-rel=filter-toggle]').find('input[type=checkbox]').remove();
        filterList.find('.filter-toggle.active > input[type=checkbox]').attr('checked', 'checked');

        if (collapsible) {
            filterList
                .find(`[data-rel=filter-group][data-filter-type=${type}]`)
                .click(function() {
                    filterList
                        .find(`[data-rel=filter-toggle][data-filter-type=${type}], [data-rel=filter-toggle][data-filter-parent-type=${type}].active`)
                        .toggle();
                });

            if (data.config.autoCollapse && !data.config.useSubFilters) {
                let f = filterList.find(`[data-rel=filter-toggle][data-filter-type=${type}]`);

                if (!f.is('.active')) {
                    f.css({display: 'block'});
                    f.hide();
                }
            }
        }

        setTimeout( () => {
            for (let id in map) {
                let count = filters.filter( i => i.id === id ).length;

                sender.el
                    .find(`[data-rel=filter-attribute] [data-filter-type="${type}"][data-filter-value="${id}"]`)
                    .html(`<input type="checkbox" /> ${map[id].value} (${count})`);
            }

            let filterList = sender.el.find('[data-rel=filter-attribute]');

            filterList.find('.filter-toggle.active').not('[data-rel=filter-toggle]').find('input[type=checkbox]').remove();
            filterList.find('.filter-toggle.active > input[type=checkbox]').attr('checked', 'checked');
        }, 300);
    }

    this.showSubFilters = (parentType, parent, filters, type, activeFilter) => {
        if (!(filters?.length > 0) || !parent) return;

        const sort = (x, y) => x?.value?.toLowerCase() > y?.value?.toLowerCase() ? 1 : -1;

        let map = {}

        filters.sort(sort).forEach( f => {
            map[f.id] = {
                count: filters.filter( x => x.id === f.id ).length,
                ...f,
            };
        });

        let html = [];

        for (let i in map) {
            let f = map[i];
            let active = activeFilter[type]?.indexOf(f.id) >= 0 && 'active';
            let visible = activeFilter[parentType]?.indexOf(parent.id) >= 0 && 'visible';

            html.push(`
                 <a class="filter-toggle filter-nested ${active || visible || ''}"
                    href="javascript:void(0)"
                    data-rel="${!defaultFilter[type] || defaultFilter[type].indexOf(f.id) === -1 ? 'filter-toggle' : ''}"
                    data-filter-type="${type}"
                    data-filter-parent-type="${parentType}"
                    data-filter-parent-value="${parent.id}"
                    data-filter-value="${f.id}">

                    <input type="checkbox" />
                    ${f.value} (${f.count})
                </a>
            `);
        }

        let filterList = this.el.find('[data-rel=filter-attribute]');

        filterList.find(`[data-filter-type="${type}"][data-filter-parent-type="${parentType}"][data-filter-parent-value="${parent.id}"]`).remove();

        if (html.length > 0) {
            filterList.find(`[data-filter-type="${parentType}"][data-filter-value="${parent.id}"]`)
                .addClass('collapsible')
                .attr('style', `--collapse-icon-size: ${data.config.subFilterIconSize}px; --collapse-icon:url(data:image/svg+xml;base64,${btoa(data.config.subFilterIcon)})`)
                .attr('data-filter-children', '')
                .after(html.join(''));
        } else {
            filterList.find(`[data-filter-type="${parentType}"][data-filter-value="${parent.id}"]`)
                .removeClass('collapsible');
        }

        filterList.find('.filter-toggle.active').not('[data-rel=filter-toggle]').find('input[type=checkbox]').remove();
        filterList.find('.filter-toggle.active > input[type=checkbox]').attr('checked', 'checked');
    }

    this.showSalaryFilter = (opts) => {
        return new SalaryFilter(opts)
            .renderTo(this.el.find('[data-rel=filter-salary]'));
    }

    this.showLoading = (showing = true) => {
        // Skip the load-time overlay before the visitor interacts (see _userEngaged);
        // keep it for user-triggered loads (search, filter, paging).
        if (showing && !_userEngaged) {
            return;
        }

        if (showing) {
            this.el.find("[data-rel=modal-loading]")
                .css({
                    'display': 'flex',
                })
                .show();
        } else {
            this.el.find("[data-rel=modal-loading]").hide();
        }
    }

    this.buildHref = (path, query) => {
        if (path && path.charAt(0) !== '/') path = '/' + path;
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

    this._timeSince = (d) => {
        if (!d || isNaN(d.getTime())) {
            return null;
        }

        const day = 1000 * 3600 * 24;
        const hour = 1000 * 3600;
        const minute = 1000 * 60;

        let since = (+new Date() - d); // / (1000 * 3600 * 24);
        let denom = data.config.timeSinceDay || 'day';

        if (since / day >= 1) {
            since = since / day;
            denom = data.config.timeSinceDay || 'day';
        } else if (since / hour >= 1) {
            since = since / hour;
            denom = data.config.timeSinceHour || 'hour';
        } else if (since / minute >= 1) {
            since = since / minute;
            denom = data.config.timeSinceMinute || 'minute';
        } else {
            since = 0;
            denom = data.config.timeSinceNow || 'just now';
        }

        return `${since > 0 ? Math.floor(since) : ''} ${denom}${Math.floor(since) > 1 && data.config.timeSinceUsePluralization ? 's ' : ' '} ${since > 0 ? data.config.timeSinceAgo || 'ago' : ''}`;
    }
}

function SalaryFilter(opts) {
    let sender = this;

    opts = opts || {};

    this.onChange = (cb) => {
        this._afterChange = cb;

        return this;
    }

    this.min = () => {
        return opts.min || this._defaultMin;
    }

    this.max = () => {
        return opts.max || this._defaultMax;
    }

    this.step = () => {
        return opts.step || this._defaultStep;
    }

    this.set = (vals) => {
        if (!isNaN(vals.min)) {
            this._lowerSlider.val(vals.min);
        }

        if (!isNaN(vals.max)) {
            this._upperSlider.val(vals.max);
        }

        this._adjustColorRange();
        this._adjustRangeDisplay();
        this._setSalary();

        return this;
    }

    this.renderTo = (parent) => {
        this._el = $(`
            <div class="control-salary-slider" data-rel="salary-slider">
                <div class="slider">
                   <input class="range" data-rel="range-set-lower" type="range" min="${this.min()}" max="${this.max()}" value="${this.min()}" step="${this.step()}">
                     <span class="section-color" data-rel="range-color"></span>
                   <input class="range" data-rel="range-set-upper" type="range" min="${this.min()}" max="${this.max()}" value="${this.max()}" step="${this.step()}">
               </div>
               <div class="label-display" data-rel="salary-display"></div>
            </div>
        `);

        parent.find('[data-rel=salary-slider]').remove();
        parent.append(this._el);

        this._lowerSlider = this._el.find('[data-rel=range-set-lower]'); //Lower value slider
        this._upperSlider = this._el.find('[data-rel=range-set-upper]'); //Upper value slider
        this._rangeColor = this._el.find('[data-rel=range-color]'); //Range color

        this._addHandlers();
        this._adjustRangeDisplay();

        return this;
    }

    this._defaultMin = 0;
    this._defaultMax = parseInt(data.config.salaryRangeMax) || 500000;
    this._defaultStep = parseInt(data.config.salaryRangeStep) || 1000;

    this._formatter = Intl.NumberFormat(navigator.language);
    this._setSalaryTimeout = null;
    this._afterChange = undefined;

    this._addHandlers = function() {
        this._upperSlider.on("input", function() {
           let lowerVal = parseInt(sender._lowerSlider.val()) || 0; //Get lower slider value
           let upperVal = parseInt(sender._upperSlider.val()) || 0; //Get upper slider value
           let step = parseInt(sender._upperSlider.attr("step"));

           //If the upper value slider is LESS THAN the lower value slider plus one.
           if (upperVal < lowerVal + step) {
              //The lower slider value is set to equal the upper value slider minus one.
              sender._lowerSlider.val(upperVal - step);
              //If the lower value slider equals its set minimum.
              if (lowerVal == sender._lowerSlider.attr("min")) {
                 //Set the upper slider value to equal 1.
                 sender._upperSlider.val(step);
              }
           }

            sender._adjustColorRange();
            sender._adjustRangeDisplay();
            sender._setSalary();
        });

        this._lowerSlider.on("input", function() {
           let lowerVal = parseInt(sender._lowerSlider.val()) || 0; //Get lower slider value
           let upperVal = parseInt(sender._upperSlider.val()) || 0; //Get upper slider value
           let step = parseInt(sender._upperSlider.attr("step"));

           //If the lower value slider is GREATER THAN the upper value slider minus one.
           if (lowerVal > upperVal - step) {
              //The upper slider value is set to equal the lower value slider plus one.
              _upperSlider.val(lowerVal + step);

              //If the upper value slider equals its set maximum.
              if (upperVal == sender._upperSlider.attr("max")) {
                 //Set the lower slider value to equal the upper value slider's maximum value minus one.
                 sender._lowerSlider.val(parseInt(sender._upperSlider.attr("max")) - step);
              }

           }

            sender._adjustColorRange();
            sender._adjustRangeDisplay();
            sender._setSalary();
        });
    }

    this._adjustColorRange = function() {
       //Setting the margin left of the middle range color.
       //Taking the value of the lower value times 10 and then turning it into a percentage.
       sender._rangeColor.css({
            marginLeft: (sender._lowerSlider.val() / parseInt(sender._lowerSlider.attr("max")) * 100) + '%',
            width: (sender._upperSlider.val() / parseInt(sender._upperSlider.attr("max")) * 100) - (sender._lowerSlider.val() / parseInt(sender._lowerSlider.attr("max")) * 100) + '%',
       });
    }

    this._adjustRangeDisplay = function() {
        sender._el.find("[data-rel=salary-display]").text(`${sender._formatter.format(parseInt(sender._lowerSlider.val()))} - ${sender._formatter.format(parseInt(sender._upperSlider.val()))}`);
    }

    this._setSalary = function() {
        if (sender._setSalaryTimeout) {
            clearTimeout(sender._setSalaryTimeout);
        }

        sender._setSalaryTimeout = setTimeout(function() {
            if (typeof(sender._afterChange) === 'function') {
                   sender._afterChange(sender, {
                       min: parseInt(sender._lowerSlider.val()), //Get lower slider value
                       max: parseInt(sender._upperSlider.val()), //Get upper slider value
                   });
            }

            sender._setSalaryTimeout = null;
        }, 1000);
    }
}

const ux = new UX();
const shApi = new ShApi();
const jobResultsPageSize = parseInt(data.config.pageSize) || 20;

let activeFilter = {};
let defaultFilter = {};
let validFilter = {};
let activeSort = JSON.parse(data.config.defaultSort || null)
    ||
    {
        field: 'changedOnUTC',
        direction: 'desc',
    };

let savedJobs = [];

let mergedFilters = () => {
    let filters = {};

    for (let fType in defaultFilter) {
        if (typeof(defaultFilter[fType]) === 'string') {
            filters[fType] = defaultFilter[fType];
        } else if (typeof(defaultFilter[fType]) === 'number' && !isNaN(defaultFilter[fType])) {
            filters[fType] = defaultFilter[fType];
        } else {
            filters[fType] = [...defaultFilter[fType] || [], ...activeFilter[fType] || []];
        }
    }

    for (let fType in activeFilter) {
        if (typeof(activeFilter[fType]) === 'string') {
            filters[fType] = activeFilter[fType];
        } else if (typeof(activeFilter[fType]) === 'number' && !isNaN(activeFilter[fType])) {
            filters[fType] = activeFilter[fType];
        } else {
            filters[fType] = [...activeFilter[fType] || [], ...defaultFilter[fType] || []];
        }
    }

    return filters;
}

let showJobs = (pageNumber) => {
    let activeView = ux.el.find('[data-rel=button-toggle][data-toggle=results-view].active');
    let showMap = activeView.is('[data-view=Map]');

    shApi.getJobs(pageNumber, showMap ? 999 : jobResultsPageSize, mergedFilters(), activeSort).then( col => {

        if (showMap) {
            ux.showJobPins(col.values.map( j => j.data ));
            return;
        }

        let op = () => {
            switch(data.config.layout) {
                case "simple": return ux.jobSimpleEl;
                case "standard": return ux.jobStandardEl;
                case "modern": return ux.jobModernEl;
                default: return ux.jobStandardEl;
            }
        }

        let html = col.values.map( j => op()({
            ...j.data,
            saveID: (savedJobs.find( s => s.jobID === j.data.jobID ) || {}).candidateSavedJobID,
            detailsUri: ux.buildHref(`${Path.jobDetails}/${new URL(j.data.jobURL).pathname.split('/').pop()}`),
        }) );

        ux.showJobResults(html);
        ux.showPages(col.page.pageNumber, col.page.totalPages);

        let params = window.location.hash.replace('#', '').split('/').filter( p => p.indexOf('pg-') === -1 );
        if (pageNumber > 0) {
            params.push(`pg-${pageNumber + 1}`);
        }

        let last = `#${params.join('/')}`.replace(/\/{2,}/g, '/');

        shazamme.store(LocalStorage.lastSearch, JSON.stringify({
            ...JSON.parse(shazamme.store(LocalStorage.lastSearch)),
            path: last,
            page: pageNumber,
        }));

        window.location = `${last}`;

        ux.el.find('[data-rel=paging-select]').click(function() {
            let button = $(this);
            let pageNumber = parseInt(button.attr('data-page-number'));

            showJobs(pageNumber);

            ux.el.get(0).scrollIntoView({behavior: 'smooth'});
        });

        ux.el
            .find(`[data-rel=article-job-result] [data-rel=action-save-job], [data-rel=article-job-result] [data-rel=action-unsave-job]`)
            .on('click', function() {
                let button = $(this);

                shazamme.pub(Message.saveJob, {
                    sender: button,
                    jobID: button
                        .parents('[data-rel=article-job-result]')
                        .attr('data-id'),
                    saveID: button.attr('data-save-id'),
                });
            });

        ux.el.find('[data-rel=label-results-count]').text(col.page.totalItems).parent().show();

        if (col.page.totalItems == 1) {
            ux.el.find('[data-rel=label-results-message]').text(data.config.resultMessage);
        } else {
            ux.el.find('[data-rel=label-results-message]').text(data.config.resultMessagePlural || data.config.resultMessage);
        }
    });

    if (data.inEditor && Object.keys(activeFilter).length > 0) {
        ux.el.find('[data-rel=default-filter]').show();
    } else {
        ux.el.find('[data-rel=default-filter]:not([data-default-filter=show])').hide();
    }
}

let showFilters = () => {
    let category = [];
    let subCategory = [];
    let workType = [];
    let workModel = [];
    let state = [];
    let city = [];
    let country = [];
    let custom1 = [];
    let custom2 = [];
    let active = mergedFilters();

    let professionSeo = [];
    let roleSeo = [];
    let workTypeSeo = [];
    let locationSeo = [];
    let citySeo = [];
    let stateSeo = [];
    let countrySeo = [];

    let isSet = f => f?.id?.length > 0;

    let fetch = (pageNumber) => {
        shApi.getJobs(0, 0, active).then( jobs => {
            if (jobs.values && jobs.values.length > 0) {
                const toIndex = (v, i, s, p) => new Object({
                    value: v,
                    id: i || v,
                    seo: s || i,
                    parent: p,
                });

                const locationSeo = (n, v) => validFilter[n].find( x => x?.value?.toLowerCase() === v?.toLowerCase() )?.seo;

                const createSubFilter = (f, fType, groupType) => {
                    let group = [];
                    var p;

                    if (f?.length > 0) {
                        f
                            .filter( x => x.parent )
                            .sort( (x, y) => x.parent > y.parent ? 1 : -1 )
                            .forEach( c => {
                                if (p?.id !== c.parent) {
                                    ux.showSubFilters(groupType, p, group, fType, active);

                                    p = validFilter[groupType].find( x => x.id === c.parent );
                                    group = [];
                                }

                                group.push(c);
                            });
                    }

                    ux.showSubFilters(groupType, p, group, fType, active);
                }

                const enableEv = (ev) => {
                    let filter = $(ev.target);

                    if (!filter.is('[data-rel=filter-toggle]')) {
                        filter = filter.parents('[data-rel=filter-toggle]');
                    }

                    let fType = filter.attr('data-filter-type');
                    let fValue = filter.attr('data-filter-value');
                    let active = activeFilter[fType] || [];
                    let activeIndex = active.indexOf(fValue);

                    if (activeIndex >= 0) {
                        // toggle filter off...
                        active.splice(activeIndex, 1);

                        if (active.length === 0) {
                            delete activeFilter[fType];
                        }

                        // toggle off any child filters...
                        ux.el
                            .find(`[data-rel=filter-toggle][data-filter-parent-type="${fType}"][data-filter-parent-value="${fValue}"]`)
                            .hide()
                            .each( (_, x) => {
                                let f = $(x);
                                let childType = f.attr('data-filter-type');
                                let childValue = f.attr('data-filter-value');
                                let childActive = activeFilter[childType] || [];
                                let childActiveIndex = childActive.indexOf(childValue);

                                if (childActiveIndex >= 0) {
                                    childActive.splice(childActiveIndex, 1);

                                    if (childActive.length === 0) {
                                        delete activeFilter[childType];
                                    } else {
                                        activeFilter[childType] = childActive;
                                    }
                                }
                            });
                    } else {
                        // toggle filter on...
                        active.push(fValue);

                        // toggle on any parent filter...
                        if (filter.is('[data-filter-parent-type]')) {
                            let parentType = filter.attr('data-filter-parent-type');
                            let parentValue = filter.attr('data-filter-parent-value');
                            let parentActive = activeFilter[parentType] || [];
                            let parentActiveIndex = parentActive.indexOf(parentValue);

                            if (parentActiveIndex === -1) {
                                parentActive.push(parentValue);
                            }

                            activeFilter[parentType] = parentActive;
                        }
                    }

                    if (active.length > 0) {
                        activeFilter[fType] = active;
                    } else {
                        delete activeFilter[fType];
                    }

                    showJobs(0);
                    showFilters();
                    shazamme.pub('job-results-filter-change', activeFilter);
                }

                category.push(...jobs.values.filter( j => j.data.professionID?.length > 0 ).map( j => toIndex(j.data.category, j.data.professionID, j.data.professionSeo)));
                subCategory.push(...jobs.values.filter( j => j.data.roleID?.length > 0 ).map( j => toIndex(j.data.subCategory, j.data.roleID, j.data.roleSeo, data.config.showClassificationFilter && j.data.professionID)));
                workType.push(...jobs.values.filter( j => j.data.workTypeID?.length > 0 ).map( j => toIndex(j.data.workType, j.data.workTypeID, j.data.workTypeSeo)));
                workModel.push(...jobs.values.filter( j => j.data.workModelID?.length > 0 ).map( j => toIndex(j.data.workModel, j.data.workModelID, j.data.workModelSeo)));
                state.push(...jobs.values.filter( j => j.data.state?.length > 0 ).map( j => toIndex(j.data.state, j.data.state, locationSeo('state', j.data.state))));
                city.push(...jobs.values.filter( j => j.data.state?.length > 0 ).map( j => toIndex(j.data.city, j.data.city, locationSeo('city', j.data.city), data.config.showLocationFilter && j.data.state)));
                country.push(...jobs.values.filter( j => j.data.country?.length > 0 ).map( j => toIndex(j.data.country, j.data.country, locationSeo('country', j.data.country))));
                custom1.push(...jobs.values.filter( j => j.data.customField1?.length > 0 ).map( j => j.data.customField1 && toIndex(j.data.customField1)));
                custom2.push(...jobs.values.filter( j => j.data.customField2?.length > 0 ).map( j => j.data.customField2 && toIndex(j.data.customField2)));

                const validList = (type, isChild = false) => Object.keys(active).length <= (isChild ? 2 : 1) && validFilter[type]?.filter( v => active[type]?.indexOf(v.id) === -1 );

                active.professionID = active?.professionID?.filter( x => category.find( y => y.id === x ));
                active.roleID = active?.roleID?.filter( x => subCategory.find( y => y.id === x ));
                active.workTypeID = active?.workTypeID?.filter( x => workType.find( y => y.id === x ));
                active.workModelID = active?.workModelID?.filter( x => workModel.find( y => y.id === x ));
                active.state = active?.state?.filter( x => state.find( y => y.id === x ));
                active.city = active?.city?.filter( x => city.find( y => y.id === x ));
                active.country = active?.country?.filter( x => country.find( y => y.id === x ));
                active.custom1 = active?.custom1?.filter( x => custom1.find( y => y.id === x ));
                active.custom2 = active?.custom2?.filter( x => custom2.find( y => y.value === x ));

                for (let x in active) {
                    if (active[x] === undefined || active[x].length === 0) {
                        delete(active[x]);
                    }
                }

                data.config.showClassificationFilter && ux.showFilters(data.config.classification || 'Classification', category, 'professionID', null, data.config.classificationCollapse, active, []);
                !data.config.useSubFilters && data.config.showSubClassificationFilter && ux.showFilters(data.config.subclassification || 'Sub Classification', subCategory, 'roleID', data.config.showClassificationFilter && 'professionID', data.config.subclassificationCollapse, active, []);
                data.config.showLocationFilter && ux.showFilters(data.config.location || 'Location', state, 'state', null, data.config.locationCollapse, active, []);
                !data.config.useSubFilters && data.config.showAreaFilter && ux.showFilters(data.config.area || 'Area', city, 'city', data.config.showLocationFilter && 'state', data.config.areaCollapse, active, []);
                data.config.showCountryFilter && ux.showFilters(data.config.country || 'Country', country, 'country', null, data.config.countryCollapse, active, []);
                data.config.showWorkTypeFilter && ux.showFilters(data.config.worktype || 'Work Type', workType, 'workTypeID', null, data.config.workTypeCollapse, active, []);
                data.config.showWorkModelFilter && ux.showFilters(data.config.workModel || 'Work Model', workModel, 'workModelID', null, data.config.workModelCollapse, active, []);
                data.config.showCustomField1Filter && ux.showFilters(data.config.customField1 || 'Custom Field 1', custom1, 'customField1', null, data.config.customField1Collapse, active, []);
                data.config.showCustomField2Filter && ux.showFilters(data.config.customField2 || 'Custom Field 1', custom2, 'customField2', null, data.config.customField2Collapse, active, []);

                if (data.config.useSubFilters) {
                    if (data.config.showAreaFilter) {
                        setTimeout( () => {
                            createSubFilter(validFilter.city, 'city', 'state');

                            ux.el.find("[data-rel=filter-toggle]")
                                .off('click', enableEv)
                                .on('click', enableEv);
                        }, 300);
                    }

                    if (data.config.showSubClassificationFilter) {
                        setTimeout( () => {
                            createSubFilter(validFilter.roleID, 'roleID', 'professionID');

                            ux.el.find("[data-rel=filter-toggle]")
                                .off('click', enableEv)
                                .on('click', enableEv);
                        }, 300);
                    }
                }

                data.config.enableSeo && seoNavigate();

                ux.el.find("[data-rel=filter-toggle]").on('click', enableEv);
            }
        });
    }

    fetch(0);
}

let seoNavigate = () => {
    let seoPath = [];
    let seoName = [];

    let unique = (v, i, self) => self.indexOf(v) === i;

    for (let i in activeFilter) {
        let n = [];

        activeFilter[i].filter(unique).forEach( x => {
            let f = validFilter[i]?.find( y => y.id === x );

            if (f) {
                n.push(f.value);
                seoPath.push(f.seo);
            }
        });

        if (n.length > 0) {
            seoName.push(n.join(', '));
        }
    }

    let lastSearch = {
        ...JSON.parse(shazamme.store(LocalStorage.lastSearch)),
        name: seoName.join(' < '),
    }
    let path = `#/${seoPath.join('/')}${lastSearch.page > 0 ? `/pg-${lastSearch.page}` : ''}`;

    lastSearch.path = path;

    shazamme.store(LocalStorage.lastSearch, JSON.stringify(lastSearch));

    window.location = path;
}

let toggleView = (view) => {
    if (view?.length > 0) {
        ux.el.find('[data-rel=action-toggle-view]')
            .each( (_, i) => {
                let off = $(i);

                ux.el.find('[data-rel=job-results-list]').removeClass(off.attr('data-view'));
                off.removeClass('active');
            });

        ux.el.find(`[data-rel=action-toggle-view][data-view=${view}]`).addClass('active');
        ux.el.find('[data-rel=job-results-list]').addClass(view);
    }
}

let fetchValidFilters = () => new Promise( (resolve, reject) => {
    let category = [];
    let subCategory = [];
    let workType = [];
    let workModel = [];
    let state = [];
    let city = [];
    let country = [];
    let custom1 = [];
    let custom2 = [];

    let toIndex = (v, i, s, p) => {
        return {
            value: v,
            id: (i || v),
            seo: (s || i || v).toLowerCase().replace(/[^a-z0-9-._]/g, '-').replace(/-{2,}/g, '-'),
            parent: p,
        }
    }

    let seo = {}
    let seoIndex = (n, v) => seo[n]?.find( x => x?.value?.toLowerCase() === v?.toLowerCase() )?.seo;

    let fetch = (pageNumber) => {
        shApi.getJobs(0, 0, defaultFilter).then( jobs => {
            if (jobs.values && jobs.values.length > 0) {
                category.push(...jobs.values.filter( j => j.data.professionID?.length > 0 ).map( j => toIndex(j.data.category, j.data.professionID, j.data.professionSeo)));
                subCategory.push(...jobs.values.filter( j => j.data.roleID?.length > 0 ).map( j => toIndex(j.data.subCategory, j.data.roleID, j.data.roleSeo, j.data.professionID)));
                workType.push(...jobs.values.filter( j => j.data.workTypeID?.length > 0 ).map( j => toIndex(j.data.workType, j.data.workTypeID, j.data.workTypeSeo)));
                workModel.push(...jobs.values.filter( j => j.data.workModelID?.length > 0 ).map( j => toIndex(j.data.workModel, j.data.workModelID, j.data.workModelSeo)));
                state.push(...jobs.values.filter( j => j.data.state?.length > 0 ).map( j => toIndex(j.data.state, j.data.state, seoIndex('state', j.data.state))));
                city.push(...jobs.values.filter( j => j.data.city?.length > 0 ).map( j => j.data.state && j.data.city && toIndex(j.data.city, j.data.city, seoIndex('city', j.data.city), j.data.state)));
                country.push(...jobs.values.filter( j => j.data.country?.length > 0 ).map( j => toIndex(j.data.country, j.data.country, seoIndex('country', j.data.country))));
                custom1.push(...jobs.values.filter( j => j.data.customField1?.length > 0 ).map( j => j.data.customField1 && toIndex(j.data.customField1)));
                custom2.push(...jobs.values.filter( j => j.data.customField2?.length > 0 ).map( j => j.data.customField2 && toIndex(j.data.customField2)));


                resolve({
                    professionID: category.filter( v => v?.value),
                    roleID: subCategory.filter( v => v?.value),
                    workTypeID: workType.filter( v => v?.value),
                    workModelID: workModel.filter( v => v?.value),
                    state: state.filter( v => v?.value),
                    city: city.filter( v => v?.value),
                    country: country.filter( v => v?.value),
                    customField1: custom1.filter( v => v?.value),
                    customField2: custom2.filter( v => v?.value),
                });
            } else {
                resolve({});
            }
        });
    }

    if (data.config.enableSeo) {
        shazamme.fetch(Collection.locationSeo).then( r => {
            if (r.length > 0) {
                return Promise.resolve(JSON.parse(r[0].data?.value || null));
            } else {
                return Promise.resolve({});
            }
        }).then( r => {
            seo.city = r?.city?.map( v => new Object({value: v.city, seo: v.seo}) );
            seo.state = r?.state?.map( v => new Object({value: v.state, seo: v.seo}) );
            seo.country = r?.country?.map( v => new Object({value: v.country, seo: v.seo}) );

            if (data.config.catchAllFilter && data.config.catchAllState && data.config.catchAllStateSeo) {
                seo.state = seo.state || [];
                seo.state.push({value: data.config.catchAllState, seo: data.config.catchAllStateSeo});
            }

            fetch(0);
        });
    } else {
        fetch(0);
    }
});

let filtersFromParams = (useConfig = false) => {
    let filters = {};

    let add = (filter, value) => {
        if (value?.length > 0) {
            filters[filter] = value.split(',');
        }
    }

    if (!useConfig) {
        let params = ux.uri.searchParams;

        add('keyword', params.get('keyword')?.toLowerCase());
        add('category', params.get('category'));
        add('subCategory', params.get('subcategory'));
        add('location', params.get('location')?.toLowerCase());
        add('state', params.get('state'));
        add('city', params.get('city'));
        add('workType', params.get('workType'));
        add('workModel', params.get('workModel'));
        add('advertiserID', params.get('advertiserID'));
        add('country', params.get('country'));
        add('professionID', params.get('professionID'));
        add('roleID', params.get('roleID'));
        add('workTypeID', params.get('workTypeID'));

        let salaryFrom = parseInt(params.get('salaryFrom'));
        let salaryTo = parseInt(params.get('salaryTo'));

        if (salaryFrom > 0) filters.salaryFrom = [salaryFrom];
        if (salaryTo > 0) filters.salaryTo = [salaryTo];

        if (data.config.enableProximitySearch) {
            let geo = params.get('geo')?.split(',');

            if (geo?.length == 2) {
                filters['geo'] = [{
                    lat: parseFloat(geo[0]),
                    lon: parseFloat(geo[1]),
                }];

                filters['geoRange'] = [parseFloat(params.get('geoRange')) || 10];
                add('geoAddress', params.get('geoAddress'));
                add('geoIn', params.get('geoIn'));
            }
        }
    } else {
        add('keyword', data.config.defaultKeyword);
        add('category', data.config.defaultCategory);
        add('subCategory', data.config.defaultSubCategory);
        add('state', data.config.defaultState);
        add('city', data.config.defaultCity);
        add('advertiserID', data.config.defaultAdvertiserID);
        add('country', data.config.defaultCountry);
        add('workType', data.config.defaultWorkType);
        add('jobType', data.config.defaultJobtype);
        add('customField1', data.config.defaultCustomField1);
        add('customField2', data.config.defaultCustomField2);
        add('tags', data.config.defaultTags);
        add('industry', data.config.defaultIndustry);
    }

    return filters;
}

let filtersFromSeo = (f) => {
    let search = (index, value) => index?.filter( x => x?.seo === value )?.map( x => x.id ) || [];
    let unique = (v, i, self) => self.indexOf(v) === i;

    let seo = {
        professionID: [],
        roleID: [],
        city: [],
        state: [],
        country: [],
        workTypeID: [],
        workModelID: [],
    }

    ux.uri.hash.substring(1).split('/').forEach( x => {
        data.config.showClassificationFilter && seo.professionID.push(...search(f.professionID, x).filter(unique));
        data.config.showSubClassificationFilter && seo.roleID.push(...search(f.roleID, x).filter(unique));
        data.config.showAreaFilter && seo.city.push(...search(f.city, x).filter(unique));
        data.config.showLocationFilter && seo.state.push(...search(f.state, x).filter(unique));
        data.config.showCountryFilter && seo.country.push(...search(f.country, x).filter(unique));
        data.config.showWorkTypeFilter && seo.workTypeID.push(...search(f.workTypeID, x).filter(unique));
        data.config.showWorkModelFilter && seo.workModelID.push(...search(f.workModelID, x).filter(unique));
    });

    return seo;
}

const saveSearch = (u, n, a) =>
    shazamme.site()
        .then( s =>
            shazamme.submit({
                action: "Create Job Alert",
                siteID: s.siteID,
                candidateID: u.candidateID,
                searchName: n,
                professionID: activeFilter.professionID?.join(','),
                keyword: activeFilter.keyword?.join(','),
                roleID: activeFilter.roleID?.join(','),
                salaryFrom: activeFilter.salaryFrom?.join(','),
                salaryTo: activeFilter.salaryTo?.join(','),
                salaryTypeID: activeFilter.salaryTypeID?.join(','),
                workTypeID: activeFilter.workTypeID?.join(','),
                city: activeFilter.city?.join(','),
                state: activeFilter.state?.join(','),
                address: activeFilter.geoAddress?.join(','),
                radius: activeFilter.geoRange?.join(','),
                radiusIn: activeFilter.geoIn || 'miles',
                isNeedAlert: a,
            })
        );

let enableProximitySearch = () => {
    const places = new google.maps.places.PlacesService(document.getElementById('shmMap'));
    const autocomplete = new google.maps.places.AutocompleteService();

    ux.el.find('[data-gapi]').on('keyup', function() {
        let field = $(this);
        let range = field.parents('.section-keyword-search').find('[data-filter=geoRange]');

        clearTimeout(this._debounce);
        field.siblings('[data-prediction]').hide();

        this._debounce = setTimeout( async () => {
            let value = field.val();

            delete activeFilter[field.attr('data-gapi')];
            delete activeFilter[range.attr('data-filter')];
            delete activeFilter[field.attr('data-gapi-text')];

            field.attr('_last', '');

            if (value.length == 0) {
                showJobs(0);
                showFilters();
                shazamme.pub('job-results-filter-change', activeFilter);

                return;
            }

            const request = {
                input: value,
            }

            autocomplete.getPlacePredictions({ input: value }, r => {
                const menu = field.siblings('[data-prediction]');

                r?.forEach( p => {
                    places.getDetails({ placeId: p.place_id, fields: ['geometry' ]}, d => {
                        menu.append(`<a href="javascript: void(0);" class="result-text" data-value="${d.geometry.location.lat()},${d.geometry.location.lng()}">${p.description}</a>`);
                    });
                });

                if (r?.length > 0) {
                    menu
                        .empty()
                        .append(`<a href="javascript: void(0);" class="result-text close" data-value="">x</a>`)
                        .show()
                        .on('click', '[data-value]', function() {
                            let opt = $(this);
                            let value = opt.attr('data-value');

                            field.val(opt.text());
                            opt.parents('[data-prediction]').hide();

                            if (value.length > 0) {
                                let geo = value.split(',');

                               activeFilter[field.attr('data-gapi')] = [{
                                    lat: parseFloat(geo[0]),
                                    lon: parseFloat(geo[1]),
                                }];
                                activeFilter[field.attr('data-gapi-text')] = [opt.text()];
                                activeFilter[range.attr('data-filter')] = [range.val()];
                                field.attr('_last', opt.text());
                            }
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

            showJobs(0);
            showFilters();
            shazamme.pub('job-results-filter-change', activeFilter);
        }, 300);
    });
}

let readConfiguration = (w) =>
    w.config().then( c => {
        if (c?.defaultFilter) {
            defaultFilter = {
                ...defaultFilter,
                ...c?.defaultFilter,
            }

            if (data.inEditor) {
                ux.el.find('[data-rel=default-filter]')
                    .attr('data-default-filter', 'show')
                    .show();
            }
        }

        return Promise.resolve();
    });

ux.el.find('[data-rel=action-menu]').click(function(ev) {
    let menu = $(ev.target).attr('data-menu');

    ux.el.find(`[data-rel=menu][data-menu=${menu}]`).toggle();
});

ux.el.find('[data-rel=menu-option]').click(function(ev) {
    let opt = $(ev.target);
    let menu = opt.parents('[data-menu]').attr('data-menu');

    ux.el.find(`[data-rel=action-menu][data-menu=${menu}]`).text(opt.text());
    opt.parents('[data-rel=menu]').hide();
});

ux.el.find('[data-sort-field]').removeClass('active');
ux.el.find(`[data-sort-field=${activeSort.field}][data-sort-direction=${activeSort.direction}]`).addClass('active');

ux.el.find('[data-sort-field]').click(function(ev) {
    let opt = $(this);

    ux.el.find('[data-sort-field]').removeClass('active');
    opt.addClass('active');

    activeSort = {
        field: opt.attr('data-sort-field'),
        direction: opt.attr('data-sort-direction'),
    };

    showJobs(0);

    opt.parents('[data-rel=modal]').hide();
});

ux.el.find('[data-rel=button-toggle]').click(function(ev) {
    let opt = $(ev.target);

    if (!opt.is('button')) {
        opt = opt.parents('button');
    }

    ux.el
            .find(`[data-rel=button-toggle][data-toggle=${opt.attr('data-toggle')}]`)
            .removeClass('active');

    opt.addClass('active');

    showJobs(0);
});

ux.el.find('[data-rel=action-save-search]').click(function() {
    let button = $(this);
    let dialog = ux.el.find('[data-rel=modal][data-modal=favorite]');

    dialog.find('input, textarea, select').val('');

    if (button.is('[data-save-alert]') && data.config.alertUri) {
        window.location.href = data.config.alertUri.href;
        return;
    }

    if (data.config.quickSave) {
        if (button.is('[data-save-alert]')) {
            dialog.find('[data-rel=title]').text(data.config.createAlertBtn);
            dialog.find('[data-rel=description]').text(data.config.alertDescription);
            dialog.find('[data-rel=value-favorite-alert]').get(0).checked = true;
        } else {
            dialog.find('[data-rel=title]').text(data.config.favoriteSearch);
            dialog.find('[data-rel=description]').text(data.config.favoriteDescription);
            dialog.find('[data-rel=value-favorite-alert]').get(0).checked = false;
        }

        dialog.show();
    } else {
        shazamme.store('createAlert', JSON.stringify({
            ...activeFilter,
            alert: button.is("[data-save-alert]"),
        }));

        shazamme.user().then( u => {
            if(u?.candidate?.candidateID){
                window.location.href = ux.buildHref(Path.alerts);
            }else{
                if (shazamme.bag(Subscribe.loginReady)) {
                        let loginSubmit = shazamme.sub(Subscribe.loginSubmit, () => {
                            window.location.href = ux.buildHref(Path.alerts);
                        });

                        let loginCancel = shazamme.sub(Subscribe.loginCancel, () => {
                            shazamme.unsub(loginSubmit);
                            shazamme.unsub(loginCancel);
                        });

                    shazamme.pub(Message.loginShow);
                } else {
                    window.location.href = ux.buildHref(Path.login);
                }
            }
        });
    }
});

ux.el.find('[data-rel=button-toggle-filter]').on('click', function() {
    ux.el.find('.section-job-result-filter').toggleClass('active');
    ux.el.find('.section-details').toggleClass('blur');
})

ux.el.find('[data-rel=action-toggle-view]').on('click', function() {
    toggleView($(this).attr('data-view'));
})

if (data.config.apikey && data.config.apikey.length > 0) {
    ux.el.find('[data-toggle=results-view]').show();
}

const main = (w) => {
    activeFilter = filtersFromParams();
    defaultFilter = filtersFromParams(true);

    toggleView(ux.el.find(`[data-device-default=${data.device}]`).attr('data-view'));

    if (activeFilter.keyword) {
        ux.el.find('[data-rel=job-result-filter-keyword][data-keyword-field=keyword]').val(activeFilter.keyword);
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).show();
    }

    if (activeFilter.location) {
        ux.el.find('[data-rel=job-result-filter-keyword][data-keyword-field=location]').val(activeFilter.location);
        ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=location]`).show();
    }

    if (activeFilter.geoAddress) {
        ux.el.find('[data-gapi]')
            .val(activeFilter.geoAddress[0])
            .parents('.section-keyword-search').find('[data-filter=geoRange]').val(activeFilter.geoRange[0])
            .siblings('[data-rel=geo-range-display]').text(`${activeFilter.geoRange[0]} ${data.config.proximityDiameter == '6371' ? 'mi' : 'km'}`);

        ux.el.find(`[data-rel=job-result-filter-gapi-clear]`).show();
    }

    if (data.config.enableProximitySearch) {
        enableProximitySearch();
    }

    ux.showLoading();

    shazamme
        .site()
        .then( s => {
            const site = shazamme.bag('site-config');

            Collection.job = {
                path: `/job-results/${s.siteID}`,
                useCache: true,
                isExternal: true,
                lang: site?.configuration?.jobLocalization && data.locale,
                fieldMap: site?.configuration?.jobFieldMap,
            }

            return Promise.resolve();
        })
        .then( () => Promise.all([
            shazamme.fetch(Collection.job),
            shApi.ready(),
            readConfiguration(w),
        ]))
        .then( () => fetchValidFilters() )
        .then( valid => {
            validFilter = valid;

            if (data.config.enableSeo) {
                let seo = filtersFromSeo(valid);

                for (let i in seo) {
                    let s = seo[i];

                    if (s?.length > 0) {
                        let f = activeFilter[i] = (activeFilter[i] || []);

                        f.push(...s);
                        activeFilter[i] = f;
                    }
                }
            }

            let page = parseInt(window.location.hash.split('/').find( p => p.indexOf('pg-') >= 0 )?.substr(3)) - 1 || 0;

            showJobs(page);
            showFilters();

            w.pub('job-search-set', activeFilter);
            ux.showLoading(false);
        });

    if (data.config.showSalaryFilter) {
        ux.showSalaryFilter()
            .onChange( (sender, args) => {
                if (args.min == sender.min() && args.max == sender.max()) {
                    if (activeFilter.salaryFrom || activeFilter.salaryTo) {
                        delete activeFilter.salaryFrom;
                        delete activeFilter.salaryTo;

                        showJobs(0);
                        showFilters();
                        shazamme.pub('job-results-filter-change', activeFilter);
                    }
                } else {
                    activeFilter['salaryFrom'] = [args.min];
                    activeFilter['salaryTo'] = [args.max];

                    showJobs(0);
                    showFilters();
                    shazamme.pub('job-results-filter-change', activeFilter);
                }
            }).set({
                min: activeFilter.salaryFrom?.at(0) > 0 ? activeFilter.salaryFrom[0] : undefined,
                max: activeFilter.salaryTo?.at(0) > 0 ? activeFilter.salaryTo[0] : undefined,
            });
    }

    w
        .sub('job-search-submit', m => {
            activeFilter = m;

            if (m.keyword) {
                ux.el.find('[data-rel=job-result-filter-keyword][data-keyword-field=keyword]').val(m.keyword);
                ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).show();

                activeFilter.keyword = m.keyword.map( k => k.toLowerCase() );
            } else {
                ux.el.find('[data-rel=job-result-filter-keyword][data-keyword-field=keyword]').val('');
                ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=keyword]`).hide();
            }

            if (!m.geo) {
                delete activeFilter.geoAddress;
                delete activeFilter.geoRange;
            } else {
                let geo = activeFilter.geo[0].split(',');

                if (geo?.length == 2) {
                    activeFilter.geo = [{
                        lat: parseFloat(geo[0]),
                        lon: parseFloat(geo[1]),
                    }];

                    activeFilter.geoRange = [parseFloat(activeFilter.geoRange[0]) || 10];

                    ux.el.find('[data-gapi]')
                        .val(activeFilter.geoAddress[0] || '')
                        .parents('.section-keyword-search').find('[data-filter=geoRange]')
                        .val(activeFilter.geoRange[0])
                        .siblings('[data-rel=geo-range-display]').text(`${activeFilter.geoRange[0]} ${data.config.proximityDiameter == '6371' ? 'mi' : 'km'}`);
                } else {
                    delete activeFilter.geo;
                    delete activeFilter.geoAddress;
                    delete activeFilter.geoRange;
                }
            }

            showJobs(0);
            showFilters();
        })
        .sub('job-results-filter-change', m => {
            w.pub('job-search-set', m);
        })
        .sub(Message.saveJob, m => {
            const go = (cid) => {
                let op = undefined;

                if (m.saveID?.length > 0) {
                    op = shApi.deleteSavedJob(m.saveID)
                } else {
                    op = shApi.saveJob(m.jobID, cid);
                }

                op.then( r => {
                    if (m.saveID) {
                        m.sender
                            .removeClass('active')
                            .attr('data-save-id', '')
                            .attr('title', data.config.saveJobText || 'save job');

                        let i = savedJobs.findIndex( s => s.candidateSavedJobID === m.saveID );

                        if (i >= 0) {
                            savedJobs.splice(i, 1);
                        }
                    } else {
                        let saveID = r.response.item.candidateSavedJobID;

                        m.sender
                            .addClass('active')
                            .attr('data-save-id', saveID)
                            .attr('title', data.config.unsaveJobText || 'unsave job');

                        savedJobs.push({
                            jobID: m.jobID,
                            candidateSavedJobID: saveID,
                        });
                    }
                });
            }

            shazamme.user().then( u => {
                if (!u?.candidate) {
                    if (shazamme.bag(Subscribe.loginReady)) {
                        w
                            .sub(Subscribe.loginSubmit, u => {
                                shApi
                                    .getSavedJobs(u?.candidate?.candidateID)
                                    .then( r => {
                                        if (!r?.response?.items?.find( j => j.jobID === m.jobID )) {
                                            go(u?.candidate?.candidateID);
                                        }
                                    });

                                w
                                    .unsub(Subscribe.loginSubmit)
                                    .unsub(Subscribe.loginCancel);
                            })
                            .sub(Subscribe.loginCancel, () => {
                                w
                                    .unsub(Subscribe.loginSubmit)
                                    .unsub(Subscribe.loginCancel);
                            });


                        w.pub(Message.loginShow);
                    } else {
                        shApi.marshalSaveJob(m.jobID);
                        window.location = ux.buildHref(Path.login);
                    }
                } else {
                    go(u.candidate.candidateID);
                }
            });
        });

    const manageUser = (u) => {
        if (u?.candidate) {
            shApi
                .getSavedJobs(u.candidate.candidateID)
                .then( r => {
                    let saved = [];

                    r.response.items.forEach( j => {
                        saved.push({
                            jobID: j.jobID,
                            candidateSavedJobID: j.candidateSavedJobID,
                        });

                        ux.el
                            .find(`[data-rel=article-job-result][data-id=${j.jobID}] [data-rel=action-save-job]`)
                            .attr('data-rel', 'action-unsave-job')
                            .attr('title', data.config.unsaveJobText || "unsave job")
                            .attr('data-save-id', j.candidateSavedJobID)
                            .addClass('active');
                    });

                    savedJobs = saved;
                });

            ux.el.find('[data-user-known]').hide();
            ux.el.find('[data-user-known=true]').show();
        } else {
            ux.el.find(`[data-rel=article-job-result] [data-rel=action-save-job], [data-rel=article-job-result] [data-rel=action-unsave-job]`)
                .attr('data-rel', 'action-save-job')
                .attr('data-save-id', '')
                .attr('title', data.config.saveJobText || 'save job')
                .removeClass('active');

            ux.el.find('[data-user-known]').hide();
            ux.el.find('[data-user-known=false]').show();
        }
    }

    shazamme.store('createAlert', null);

    if (ux.uri.hash.length === 0) {
        shazamme.store(LocalStorage.lastSearch, null);
    }

    shazamme.user().then( u => {
        manageUser(u);
    });

    w.sub(Subscribe.auth, u => manageUser(u));

    w.sub(Subscribe.siteReady, () => {
        const site = shazamme.bag('site-config');

        Path.login      = site?.configuration?.pathLogin      || Path.login;
        Path.alerts     = site?.configuration?.pathAlerts     || Path.alerts;
        Path.dashboard  = site?.configuration?.pathDashboard  || Path.dashboard;
        Path.jobApply   = site?.configuration?.pathJobApply   || Path.jobApply;
        Path.jobDetails = site?.configuration?.pathJobDetails || Path.jobDetails;

        if ((site?.configuration?.jobLocalization || site?.configuration?.jobFieldMap) && !(Collection.job.lang || Collection.job.fieldMap)) {
            shazamme.site().then( s => {
                Collection.job = {
                    path: `/job-results/${s.siteID}`,
                    useCache: true,
                    isExternal: true,
                    lang: site?.configuration?.jobLocalization && data.locale,
                    fieldMap: site?.configuration?.jobFieldMap,
                }

                ux.showLoading();

                shazamme.fetch(Collection.job)
                    .then( () => fetchValidFilters() )
                    .then( valid => {
                        validFilter = valid;

                        if (data.config.enableSeo) {
                            let seo = filtersFromSeo(valid);

                            for (let i in seo) {
                                let s = seo[i];

                                if (s?.length > 0) {
                                    let f = activeFilter[i] = (activeFilter[i] || []);

                                    f.push(...s);
                                    activeFilter[i] = f;
                                }
                            }
                        }

                        let page = parseInt(window.location.hash.split('/').find( p => p.indexOf('pg-') >= 0 )?.substr(3)) - 1 || 0;

                        showJobs(page);
                        showFilters();

                        w.pub('job-search-set', activeFilter);
                        ux.showLoading(false);
                    });

            });
        }
    });

    if (data.inEditor) {
        ux.el.find('[data-rel=action-set-default-filter]').on('click', function() {
            w.config().then( c =>
                w.config({
                    ...c,
                    defaultFilter: activeFilter,
                })
            ).then( () => {
                window.location.reload();
            });
        });

        ux.el.find('[data-rel=action-remove-default-filter]').on('click', function() {
            w.config().then( c => {
                delete c?.defaultFilter;

                return w.config({
                    ...c,
                });
            }).then( () => {
                window.location.reload();
            });
        });
    }

    ux.el
        .addClass('shaz-job-results')
        .find('.shmMainContainer')
        .removeClass('hidden');

    if (data.config.dialogWaitAnimation?.indexOf('lottie.host') >= 0) {
        data.config.dialogWaitAnimation = 'https://assets2.lottiefiles.com/packages/lf20_szlepvdh.json';

        ux.el.find('[data-rel=wait]').each(function() {
            let src = $(this).attr('src') || '';
            if (src.indexOf('lottie.host') >= 0) {
                $(this).attr('src', 'https://assets2.lottiefiles.com/packages/lf20_szlepvdh.json');
            }
        });
    }
}

ux.el.find('[data-rel=job-result-filter-keyword]')
    .val(activeFilter[$(this).attr('data-keyword-field')] || '')
    .on('keyup', function() {
        clearTimeout(this.submitTimeout);

        let field = $(this).attr('data-keyword-field')

        if (this.value?.length > 0) {
            ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).show();
        } else{
            ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).hide();
        }

        this.submitTimeout = setTimeout( () => {
            let kw = $(this).val().trim();

            if (kw.length > 0) {
                activeFilter[field] = kw.toLowerCase().split(',');
            } else {
                delete activeFilter[field];
            }

            showJobs(0);
            shazamme.pub('job-results-filter-change', activeFilter);

            showFilters();
        }, 500);
    })
    .on('change', function() {
        clearTimeout(this.submitTimeout);

        let field = $(this).attr('data-keyword-field')

        if (this.value?.length > 0) {
            ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).show();
        } else{
            ux.el.find(`[data-rel=job-result-filter-keyword-clear][data-keyword-field=${field}]`).hide();
        }

        this.submitTimeout = setTimeout( () => {
            let kw = $(this).val().trim();

            if (kw.length > 0) {
                activeFilter[field] = kw.toLowerCase().split(',');
            } else {
                delete activeFilter[field];
            }

            showJobs(0);
            shazamme.pub('job-results-filter-change', activeFilter);

            showFilters();
        }, 500);
    });

ux.el.find('[data-rel=job-result-filter-keyword-clear]').on('click', function() {
    let field = $(this).attr('data-keyword-field');

    ux.el.find(`[data-rel=job-result-filter-keyword][data-keyword-field=${field}]`).val('');
    $(this).hide();

    delete activeFilter[field];
    showJobs(0);
    showFilters();
    shazamme.pub('job-results-filter-change', activeFilter);
});

ux.el.find('[data-rel=job-result-filter-gapi-clear]').on('click', function() {
    let field = ux.el.find(`[data=gapi=${$(this).attr('data-geo-field')}]`);
    let range = field.parents('.section-keyword-search').find('[data-filter=geoRange]');

    field.val('');
    $(this).hide();

    delete activeFilter[field.attr('data-gapi')];
    delete activeFilter[range.attr('data-filter')];
    delete activeFilter[field.attr('data-gapi-text')];

    showJobs(0);
    showFilters();
    shazamme.pub('job-results-filter-change', activeFilter);
});

ux.el.find('[data-filter=geoRange]').on('input', function() {
    let f = $(this);

    f.siblings('[data-rel=geo-range-display]').text(`${f.val()} ${data.config.proximityDiameter == '6371' ? 'mi' : 'km'}`);

    clearTimeout(this._debounce);

    this._debounce = setTimeout( () => {
        activeFilter[f.attr('data-filter')] = [parseInt(f.val())];
        showJobs(0);
        showFilters();
        shazamme.pub('job-results-filter-change', activeFilter);
    }, 500);
})
    .siblings('[data-rel=geo-range-display]')
    .text( () => `${ux.el.find('[data-filter=geoRange]').val()} ${data.config.proximityDiameter == '6371' ? 'mi' : 'km'}` );

ux.el.find('[data-rel=action-mobile-save-search]').on('click', function() {
    let button = $(this);
    let dialog = ux.el.find('[data-rel=modal][data-modal=favorite]');

    dialog.find('input, textarea, select').val('');

    if (button.is('[data-save-alert]')) {
        if (data.config.alertUri) {
            window.location.href = data.config.alertUri.href;
            return;
        }

        dialog.find('[data-rel=title]').text(data.config.createAlertBtn);
        dialog.find('[data-rel=description]').text(data.config.alertDescription);
        dialog.find('[data-rel=value-favorite-alert]').get(0).checked = true;
    } else {
        dialog.find('[data-rel=title]').text(data.config.favoriteSearch);
        dialog.find('[data-rel=description]').text(data.config.favoriteDescription);
        dialog.find('[data-rel=value-favorite-alert]').get(0).checked = false;
    }

    dialog.show();
});

ux.el.find('[data-rel=modal][data-modal=favorite] [data-rel=action-save]').on('click', function() {
    const dialog = ux.el.find('[data-rel=modal][data-modal=favorite]');
    const email = dialog.find('[data-rel=value-favorite-email]');
    const site = shazamme.bag('site-config');

    if (email.is(':visible')) {
        if (email.val().length === 0) {
            let warning = data.config.warnNoEmail || 'Please provide a valid email address';

            site?.alertDialog({
                title: data.config.warnNoEmailTitle || 'No Email Provided',
                message: warning,
            })?.appendTo(ux.el)
            || alert(warning);

            return;
        }
    }

    dialog.find('[data-rel=wait]').show();

    shazamme.user()
        .then( u => u?.candidate && Promise.resolve(u.candidate) || shazamme.quickRegister(email.val()))
        .then( u => {
            let s = {
                candidateID: u?.candidateID,
                searchName: ux.el.find('[data-rel=value-favorite-name]').val(),
                professionID: activeFilter.professionID?.join(','),
                keyword: activeFilter.keyword?.join(','),
                roleID: activeFilter.roleID?.join(','),
                salaryFrom: activeFilter.salaryFrom?.join(','),
                salaryTo: activeFilter.salaryTo?.join(','),
                salaryTypeID: activeFilter.salaryTypeID?.join(','),
                workTypeID: activeFilter.workTypeID?.join(','),
                city: activeFilter.city?.join(','),
                state: activeFilter.state?.join(','),
                address: activeFilter.geoAddress?.join(','),
                radius: activeFilter.geoRange?.join(','),
                radiusIn: activeFilter.geoIn || 'miles',
                isNeedAlert: dialog.find('[data-rel=value-favorite-alert]').is(':checked'),
            }

            shApi.createSave(s).then( () => {
                dialog.find('[data-rel=wait]').hide();
                dialog.find('[data-rel=okay]').show();

                setTimeout( () => {
                    dialog.find('[data-rel=okay]').hide();
                    dialog.hide();
                }, 1000);
            });
        })
        .catch( ex => {
            let warning =
                ex?.code === 'auth/invalid-email' ? data.config.warnBadEmail || 'Please provide a valid email address'
                : ex?.msg || ex || data.config.warnSaveAlert || 'We ran into an issue saving your search';

            site?.alertDialog({
                title: data.config.warnSaveAlertTitle || 'Could Not Save',
                message: warning,
            })?.appendTo(ux.el)
            || alert(warning);
        });
});

ux.el.find('button[data-modal]').on('click', function() {
    let button = $(this);

    ux.el.find(`[data-rel=modal]`).hide();
    ux.el.find(`[data-rel=modal][data-modal=${button.attr('data-modal')}]`).show();
});

ux.el.find('[data-rel=modal] [data-rel=action-close]').on('click', function() {
    let dialog = $(this).parents('[data-rel=modal]');

    dialog.hide();
});

ux.el.find('[data-rel=modal] button .animation').hide();

if (data.device === 'mobile') {
    let toolbar = $('.toolbar-main.mobile');
    let toolbarY = toolbar.offset().top;
    let top = $('.hamburger-header ').height() || 0;

    window.onscroll = () => {
        if (toolbarY < window.pageYOffset) {
            toolbar.addClass('pinned');
            toolbar.css({
                top: `${top}px`,
            });
        } else {
            toolbar.removeClass('pinned');
            toolbar.css({
                top: 'unset',
            });
        }
    }

    if (data.inEditor) {
        ux.el.find('[data-rel=modal] button .animation')
            .first()
            .show();
    }
}

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.3.min.js')
    .then( () => shazamme.ready((data.inEditor && data.config.debugSiteID) || data.siteId, data.page) )
    .then( () => Promise.all([
            shazamme.style('https://sdk.shazamme.io/css/fontawesome/css/fontawesome.min.css'),
            shazamme.style('https://sdk.shazamme.io/css/fontawesome/css/regular.min.css'),
            data.config.apikey?.length > 0
                && shazamme.gapi(data.config.apikey).maps(['maps', data.config.enableProximitySearch && 'places' ])
                || Promise.resolve(),
        ])
    )
    .then( () => main(shazamme.register('job-results', data)) );

ux.loadScript('https://sdk.shazamme.io/plugin/lottie-files/lottie-player-2.0.8.js')
    .then();