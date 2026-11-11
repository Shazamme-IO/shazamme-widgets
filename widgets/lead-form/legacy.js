// Lead Form — legacy port of the Duda Widget Builder widget 49d66be920ac41458fdecd1af4b625b9
// (captured live from chandlermacleod.com at version 144 on 11 Nov 2026), plus:
//   - duda-widget 38d59da / e504cf7: screeningTemplateIdManual text field (never pasted live)
//   - screening-question plugin pin 1.0.10 ({{page.*}} auto-fields, Freshdesk #13297)
//   - buildHref hardened to the shared contract (widgets/legacy-url-guards*.test.ts)
// Built by build/build.mjs into dist/lead-form/<version>/widget.min.js; Duda keeps the
// HTML/CSS tabs and a loader stub (duda-paste*.js). The SDK load below is rewritten by
// the build to the shared window.__shazLoadScript.
const Path = {
    jobResults: data.config.searchResultPage?.href || '/job-results',
    thankYou: data.config.thankyouPage?.href || '/thank-you',
    dashboard: data.config.dashboardPage?.href || '/dashboard',
};

const Collection = {
    questions: {
        name: data.config.collectionQuestions || 'Screening Questions',
        action: 'Get Screening Questions',
        endpoint: data.config.screeningQuestionsCollection,
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
    },
}

// Free / personal email providers. When the widget's `blockFreeEmail` toggle is
// on, an email whose domain is in this set is rejected (business emails only).
// Grouped by provider family incl. the country variants that show up in AU/UK/
// NZ data. Extend as needed — matching is exact domain, case-insensitive.
const FREE_EMAIL_DOMAINS = new Set([
    // Microsoft (hotmail / outlook / live / msn) + country variants
    'hotmail.com', 'hotmail.co.uk', 'hotmail.com.au', 'hotmail.co.nz', 'hotmail.ca',
    'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
    'outlook.com', 'outlook.com.au', 'outlook.co.uk', 'outlook.co.nz',
    'outlook.fr', 'outlook.de', 'outlook.it', 'outlook.es',
    'live.com', 'live.com.au', 'live.co.uk', 'live.co.nz', 'live.ca',
    'live.fr', 'live.de', 'live.it', 'live.nl',
    'msn.com', 'msn.com.au', 'windowslive.com', 'passport.com',
    // Google
    'gmail.com', 'googlemail.com',
    // Yahoo (incl. Australian Yahoo!7 legacy y7mail)
    'yahoo.com', 'yahoo.com.au', 'yahoo.co.uk', 'yahoo.co.nz', 'yahoo.ca',
    'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'yahoo.it', 'yahoo.es', 'yahoo.com.br',
    'ymail.com', 'rocketmail.com', 'y7mail.com',
    // Apple
    'icloud.com', 'me.com', 'mac.com',
]);

const emailDomain = (e) => String(e || '').trim().toLowerCase().split('@').pop();
const isFreeEmail = (e) => FREE_EMAIL_DOMAINS.has(emailDomain(e));

function UX() {
    this.el = $(element);
    this.uri = new URL(window.location.href);


    this.buildHref = (path, query) => {
        // A query appended after a fragment lands inside it (…#form?jobID=1), losing the
        // parameter — split the fragment off first.
        const addQuery = (href, q) => {
            let hash = href.indexOf('#');
            let base = hash === -1 ? href : href.slice(0, hash);
            let frag = hash === -1 ? '' : href.slice(hash);

            return `${base}${base.includes('?') ? '&' : '?'}${q}${frag}`;
        };

        // Repairs the missing colon Duda drops on "File for download" links
        // ("https//x" -> "https://x") before the absolute-href check below.
        path = (path || '').replace(/^(https?)\/\//i, '$1://');

        // An http(s) href is already a destination — prefixing it would produce
        // https://clientsite.com/https://careers.example.com/register. A
        // protocol-relative "//x" is not passed through: from a page-path config it is
        // almost always a doubled slash, and honouring it would navigate off-site.
        if (/^https?:\/\//i.test(path)) {
            return query ? addQuery(path, query) : path;
        }

        path = path ? ('/' + path).replace(/^\/+/, '/') : path;

        // Same fragment/existing-query hazard on this branch: a configured path may
        // carry '#' or '?' of its own.
        return data.inEditor
            ? addQuery(`/site/${data.siteId}${path}`, `preview=true&insitepreview=true&dm_device=desktop${query ? '&' + query : ''}`)
            : (query ? addQuery(`https://${window.location.hostname}${path}`, query) : `https://${window.location.hostname}${path}`);
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

const ux = new UX();

const main = (w) => {
    // Editor 2 fix (duda-widget 38d59da): a text field takes precedence over the
    // collection picker, trimmed and resolved lazily so a late config read still wins.
    const getScreeningTemplateId = () => String(data.config.screeningTemplateIdManual || '').trim() || data.config.screeningTemplateId;
    let site = shazamme.bag('site-config');

    const showScreeningQuestions = () => {
        let el = ux.el.find('[data-rel=data-screening-questions]');
        const screeningTemplateId = getScreeningTemplateId();

        if (el.length > 0 && screeningTemplateId?.length > 1) {
            let js = 'https://sdk.shazamme.io/js/plugin/screening-question/1.0.10/plugin.min.js'; // pinned: config was double-loading an old 1.0.2 build. 1.0.10 adds {{page.*}} auto-fields (page URL to ATS)

            return shazamme
                .script(js)
                .then(
                    () => shazamme.plugin.screeningQuestions(w, {
                        config: {
                            ...data.config,
                            screeningTemplateId,
                            pagingButtonAlignment: data.config.screeningPagingButtonAlignment,
                            readMoreAlign: data.config.screeningReadMoreAlign,
                            showMoreShadowColor: data.config.screeningShowMoreShadowColor,
                            warningScreeningQuestions: data.config.warningScreeningQuestions,
                            warningScreeningQuestionTitle: data.config.warningScreeningQuestionTitle                                ,
                        },
                        collection: Collection,
                        editing: data.inEditor,
                        container: el,
                        tid: screeningTemplateId,
                    })
                ).then( sq => {
                    w.bag('plugin-sq', sq);
                    w.sub(sq.message.submit, () =>{ onSubmit(); });

                    return Promise.resolve();
                });
        }

        return Promise.resolve();
    }

    const submitBtn = ux.el.find('[data-rel=action-apply]');
    const submitBtnTextEl = submitBtn.find('> .text');
    const submitBtnOriginalText = submitBtnTextEl.text();

    const showButtonLoader = () => {
        if (data.config.showLoader === false) return;
        submitBtn.addClass('is-loading').attr('disabled', 'disabled');
        submitBtnTextEl.text(data.config.ApplyButtonLoadingText || 'Submitting...');
    };

    const hideButtonLoader = () => {
        submitBtn.removeClass('is-loading').removeAttr('disabled');
        submitBtnTextEl.text(submitBtnOriginalText);
    };

    let onSubmit = () => {
        // Loader dialog ("ball") intentionally not shown on submit. Keep the var
        // so the loading?.remove() calls below stay safe no-ops.
        let loading = null;

        showButtonLoader();

        isValid(w)
            .then( () => {
                const screeningTemplateId = getScreeningTemplateId();
                let lead = {
                    screeningTemplateID: screeningTemplateId?.length > 1 ? screeningTemplateId : undefined,
                    ReferralSource: ux.uri.searchParams.get("utm_source") || shazamme.session('referralSource'),
                    ReferralMedium: ux.uri.searchParams.get("utm_medium") || shazamme.session('referralMedium'),
                    ReferralTerm: ux.uri.searchParams.get("utm_term") || shazamme.session('referralTerm'),
                    ReferralCampaign: ux.uri.searchParams.get("utm_campaign") || shazamme.session('referralCampaign'),
                    ReferralContent: ux.uri.searchParams.get("utm_content") || shazamme.session('referralContent'),
                }

                ux.el.find('[data-rel=collection-fields] [data-field]:visible').each( (_, f) => {
                    let field = $(f);

                    if (field.attr('data-field')?.length > 0 && field.attr('data-field') !== 'file' && !field.attr('data-field').startsWith('--')) {
                        lead[field.attr('data-field')] = (field.is(':checkbox') && field.is(':checked')) || field.val() || undefined;
                    }
                });

                if (data.inEditor) {
                    shazamme.log('submit lead', {
                        action: 'Submit Lead',
                        dudaSiteID: data.siteId,
                        lead: lead,
                        screeningAnswers: w.bag('plugin-sq')?.answers(),
                    });

                    hideButtonLoader();

                return Promise.resolve();
                }

                 return shazamme.submit({
                    action: 'Submit Lead',
                    dudaSiteID: data.siteId,
                    lead: lead,
                    screeningAnswers: w.bag('plugin-sq')?.answers(),
                }).then( () => {
                    loading?.remove();
                    window.location = ux.buildHref(Path.thankYou);
                }).catch( () => {
                    hideButtonLoader();
                });
            })
            .catch( () => {
                loading?.remove();
                hideButtonLoader();
            });
    }

    showScreeningQuestions().then();

    ux.el.find('[data-rel=action-apply]')
        .off('click')
        .on('click', function() {
            onSubmit();
        });

    w.sub('site-config-ready', () => {
        site = shazamme.bag('site-config');

        Path.jobResults = site?.configuration?.pathJobResults || Path.jobResults;
        Path.dashboard  = site?.configuration?.pathDashboard  || Path.dashboard;
        Path.thankYou  = Path.thankYou || site?.configuration?.pathThankYou  || Path.thankYou;
    });

    ux.el.find('.main-content').show();
}

let isValid = (w) => new Promise( (resolve, reject) => {
    const fb = shazamme.firebase();
    const site = shazamme.bag('site-config');

    let m = [];

    // site.alertDialog renders square corners (its copyCSS copies computed styles
    // inline). Round the box + OK button by overriding inline with !important,
    // which beats the copied inline values. overflow:hidden clips the dark title
    // band to the rounded top.
    const showAlert = (o) => {
        const dlg = site?.alertDialog(o);
        if (!dlg) return null;
        dlg.appendTo(ux.el);
        const box = dlg.find('.dialog-content')[0];
        if (box) {
            box.style.setProperty('border-radius', '12px', 'important');
            box.style.setProperty('overflow', 'hidden', 'important');
        }
        dlg.find('.button-main').each((_, b) => b.style.setProperty('border-radius', '5px', 'important'));
        return dlg;
    };

    if (w.bag('plugin-sq')) {
        const sq = w.bag('plugin-sq');

        if (!sq.knockout() || !sq.validate()) {
            reject();
            return;
        }
    }

    // Business-email-only gate. When `blockFreeEmail` is on, reject a free /
    // personal provider (Gmail, Hotmail, Outlook, Yahoo, iCloud, …) and show the
    // configurable popup. Message/title are editable in the widget settings.
    if (data.config.blockFreeEmail) {
        const usedFreeEmail = ux.el.find('[type=email][data-field]:visible').toArray()
            .some( (f) => {
                const v = $(f).val();
                return v && v.trim().length > 0 && isFreeEmail(v);
            });

        if (usedFreeEmail) {
            const msg = data.config.blockFreeEmailMessage
                || 'Please enter your company or organisational email address.';

            showAlert({
                title: data.config.blockFreeEmailTitle || 'Business email required',
                message: msg.replace(/\n/g, '<br/>'),
            }) || alert(msg);

            reject();
            return;
        }
    }

    Promise.all([
        ...ux.el.find('[type=email][data-field]:visible').map( (_, f) => {
            let field = $(f);
            let email = field.val();

            if (email?.length > 0) {
                try {
                    return new Promise( r => {
                        fb.validateEmail(email)
                            .then( () => r() )
                            .catch( () => {
                                m.push(field.parents('.field').find('label').first().text() || field.attr('placeholder') || field.attr('data-field'));
                                r();
                            });
                    });
                } catch (ex) {
                    w.warn('Email validation failed: ', ex);
                    return Promise.resolve();
                }
            } else {
                return Promise.resolve();
            }
        }).toArray(),

        ...ux.el.find('[data-rel=collection-fields] [data-field][required]:visible').map( (_, f) => {
            let field = $(f);

            if (
                (field.is('[type=file]') && !(fileUpload[field.attr('data-file-id')]?.length > 0))
                || (field.is(':checkbox') && !field.is(':checked'))
                || (field.is('input') && !field.is(':checkbox') && !(field.val()?.trim()?.length > 0))
            ) {
                m.push(field.parents('.field').find('label.required').text() || field.attr('placeholder') || field.attr('title') || field.attr('data-field'));
            } else if (field.is('[type=tel][data-validate]') && field.val().trim() && typeof libphonenumber === 'object') {
                try {
                    const tel = libphonenumber.parsePhoneNumber(field.val(), field.attr('data-validate') || 'AU');

                    if (!tel.country || !tel.isValid()) {
                         m.push(field.parents('.field').find('label.required').text() || field.attr('placeholder') || field.attr('data-field'));
                    } else {
                        field.val(tel.formatInternational());
                    }
                } catch {
                     m.push(field.parents('.field').find('label.required').text() || field.attr('placeholder') || field.attr('data-field'));
                }
            }

            return Promise.resolve();
        }).toArray(),
    ]).then( r => {
        if (m.length > 0) {
            let warning = `${data.config.warningRequired || 'Please complete the following fields:'}\n\n${m.join('\n')}`;

            showAlert({
                title: data.config.warningRequiredTitle || 'Please Complete the Following',
                message: warning.replace(/\n/g, '<br/>'),
            }) || alert(warning);

            reject();
        } else {
            resolve();
        }
    });
});

ux.el
    .addClass('lead-form')
    .attr('style', 'height: auto !important');

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.2.min.js')
    .then( () => shazamme.ready(data.siteId, data.page) )
    .then( () => {
        main(shazamme.register('lead-form', data));
    });
    
