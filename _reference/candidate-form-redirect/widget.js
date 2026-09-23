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

function UX() {
    this.el = $(element);
    this.uri = new URL(window.location.href);

    this.fileEl = (f) =>
        $(`
            <article class="item-file">
                <span class="text">${f.name || '(unknown)'}</span>
                <button class="action-remove" data-rel="action-remove"><span class="text">X</span></button>
            </article>
        `);

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

const ux = new UX();

let fileUpload = {}

// After a successful apply, redirect to THIS job's dynamic brochure page.
// The job slug is already in the form URL, e.g. ?jobId=head-of-...-jobs-1441026
const brochureUrl = () => {
    const slug = (ux.uri.searchParams.get('jobId') || '').trim();
    if (!slug) return null;                                     // no job in URL -> normal thank-you

    const base = '/' + ((data.config.BrochurePagePath || '/dynamic-brochure') + '').replace(/^\/+|\/+$/g, '');
    return `https://${window.location.hostname}${base}/${slug}`;
};

const main = (w) => {
    const maxUploadSize = (data.config.maxUploadSize || 10) * 1024 * 1024;
    let site = shazamme.bag('site-config');

    const listenForEvents = () => {
        ux.el.find('input[type=file][data-field]')
            .off('change')
            .on('change', function() {

                let field = $(this);
                let f = this.files[0];

                if (f.size > maxUploadSize) {
                    let warning = data.config.warningFileSize || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`;

                    site?.alertDialog({
                        title: data.config.warningFileSizeTitle || 'File Too Large',
                        message: warning,
                    })?.appendTo(ux.el) || alert($(`<div>${warning}</div>`).text());

                    $(this).val('');

                    return;
                }

                field
                    .parent()
                    .find('[data-rel=file-remove]')
                    .removeClass('hidden')
                    .off('click')
                    .on('click', function() {
                        field.val('');
                        $(this).addClass('hidden');
                    });
            });

        ux.el.find('[data-rel=action-apply]')
            .off('click')
            .on('click', function() {
                onSubmit();
            });
    }

    const showScreeningQuestions = () => {
        let el = ux.el.find('[data-rel=data-screening-questions]');

        if (el.length > 0 && data.config.screeningTemplateId?.length > 0) {
            let js = data.config.screeningVersion || 'https://sdk.shazamme.io/js/plugin/screening-question/1.0.0/plugin.min.js';

            return shazamme
                .script(js)
                .then(
                    () => shazamme.plugin.screeningQuestions(w, {
                        config: {
                            ...data.config,
                            pagingButtonAlignment: data.config.screeningPagingButtonAlignment,
                            readMoreAlign: data.config.screeningReadMoreAlign,
                            showMoreShadowColor: data.config.screeningShowMoreShadowColor,
                            warningScreeningQuestions: data.config.warningScreeningQuestions,
                            warningScreeningQuestionTitle: data.config.warningScreeningQuestionTitle                                ,
                        },
                        collection: Collection,
                        editing: data.inEditor,
                        container: el,
                        tid: data.config.screeningTemplateId,
                    })
                ).then( sq => {
                    w.bag('plugin-sq', sq);
                    w.sub(sq.message.submit, () =>{ onSubmit(); });

                    return Promise.resolve();
                });
        }

        return Promise.resolve();
    }

    showScreeningQuestions().then();
    listenForEvents();

    let onSubmit = () => {
        let loading = site?.loadingDialog()?.appendTo(ux.el);

        isValid(w)
            .then( () => candidate(w) )
            .then( () => {
                if (data.inEditor) {
                    loading?.remove();
                    return;
                }

                loading?.remove();
                window.location = brochureUrl() || ux.buildHref(Path.thankYou);
            })
            .catch( () => {
                loading?.remove();
            });
    }

    w.sub('site-config-ready', () => {
        site = shazamme.bag('site-config');

        Path.jobResults = site?.configuration?.pathJobResults || Path.jobResults;
        Path.dashboard  = site?.configuration?.pathDashboard  || Path.dashboard;
    });
}

let candidate = (w) => {
    let c = {
        ReferralSource: ux.uri.searchParams.get("utm_source") || shazamme.session('referralSource'),
        ReferralMedium: ux.uri.searchParams.get("utm_medium") || shazamme.session('referralMedium'),
        ReferralTerm: ux.uri.searchParams.get("utm_term") || shazamme.session('referralTerm'),
        ReferralCampaign: ux.uri.searchParams.get("jobId") || ux.uri.searchParams.get("jobID") || ux.uri.searchParams.get("utm_campaign") || shazamme.session('referralCampaign'),
        ReferralContent: ux.uri.searchParams.get("utm_content") || shazamme.session('referralContent'),
        ScreeningTemplateID: data.config.screeningTemplateId,
        screeningAnswers: w.bag('plugin-sq')?.answers(),
    }

    ux.el.find('[data-rel=collection-fields] [data-field]:visible').each( (_, f) => {
        let field = $(f);

        if (field.attr('data-field')?.length > 0 && field.attr('data-field') !== 'file' && !field.attr('data-field').startsWith('--')) {
            c[field.attr('data-field')] = (field.is(':checkbox') && field.is(':checked')) || field.val()?.replace(/["«»‘’‚‛“”„‟‹›❛❜❝❞❮❯〝〞〟＂❟❠⹂🙶🙷🙸＇]/g, '') || undefined;
        }
    });

    return Promise.all(
        ux.el.find('input[type=file][data-field]')
            .toArray()
            .map( i => {
                let f = $(i);

                return {
                    isResume: f.attr('data-file-resume')?.length > 0,
                    isCover: f.attr('data-file-cover')?.length > 0,
                    file: i.files[0],
                }
            })
            .map( f =>
                f.file
                    ? readFile(f.file).then( b => Promise.resolve({
                        name: f.file.name?.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-'),
                        isResume: f.isResume,
                        isCover: f.isCover,
                        content: btoa(b),
                    }) )
                    : Promise.resolve(null)
            )
    )
    .then( f => {
        let files = (f || []).filter( u => u != null );
        let resume = files.find( u => u.isResume );
        let cover = files.find( u => u.isCover );

        if (resume && !c.cVFileContent) {
            c.cVFileName = resume.name
            c.cVFileContent = resume.content;
        }

        if (cover && !c.coverLetterFileContent) {
            c.coverLetterFileName = cover.name
            c.coverLetterFileContent = cover.content;
        }

        if (data.inEditor) {
            shazamme.log('submit candidate', c);
            return Promise.resolve();
        }

        return shazamme.firebase().validateEmail(c.email)
            .then( () => shazamme.submit({
                    action: 'Submit Candidate',
                    dudaSiteID: data.siteId,
                    ...c
                })
            );
    });

}

let readFile = (file) => new Promise( resolve => {
    let reader = new FileReader();

    reader.addEventListener("load", function () {
        resolve(reader.result);
    }, false);

    if (file) {
        reader.readAsBinaryString(file);
    }
});

let isValid = (w) => new Promise( (resolve, reject) => {
    const fb = shazamme.firebase();
    const site = shazamme.bag('site-config');

    let m = [];

    if (w.bag('plugin-sq')) {
        const sq = w.bag('plugin-sq');

        if (!sq.knockout() || !sq.validate()) {
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
                (field.is('[type=file]') && !(field.get(0).files?.length > 0))
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

            site?.alertDialog({
                title: data.config.warningRequiredTitle || 'Please Complete the Following',
                message: warning.replace(/\n/g, '<br/>'),
            })?.appendTo(ux.el) || alert(warning);

            reject();
        } else {
            resolve();
        }
    });
});

ux.el
    .addClass('candidate-form')
    .attr('style', 'height: auto !important');

// Inject asterisk inline after last character of agreement text
(function() {
    var agreementSpan = ux.el.find('.agreement-text.required');
    if (agreementSpan.length) {
        // Find the deepest last element that contains text
        var lastEl = agreementSpan[0];
        var walker = document.createTreeWalker(lastEl, NodeFilter.SHOW_TEXT, null, false);
        var lastTextNode = null;
        var node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim().length > 0) {
                lastTextNode = node;
            }
        }
        if (lastTextNode) {
            var sup = document.createElement('sup');
            sup.className = 'agreement-asterisk';
            sup.textContent = '*';
            lastTextNode.parentNode.insertBefore(sup, lastTextNode.nextSibling);
        }
    }
})();

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.2.min.js')
    .then( () => Promise.all([
        shazamme.ready(data.siteId, data.page),
        shazamme.script('https://sdk.shazamme.io/js/plugin/libphonenumber/1.10.54/plugin.min.js'),
    ]))
    .then( () => {
        main(shazamme.register('candidate-form', data));
    });

