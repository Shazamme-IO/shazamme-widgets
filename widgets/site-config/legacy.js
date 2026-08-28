const Message = {
    addTool: 'site-config-add-tool',
    uploadSupport: 'site-upload-file-support',
    uploadShow: 'site-upload-file-show',
    uploadSubmit: 'site-upload-file-submit',
    uploadCancel: 'site-upload-file-cancel',
    iconPicker: 'site-icon-picker',
    iconChanged: 'site-icon-changed',
    iconCancelled: 'site-icon-cancelled',
    loadingShow: 'site-loading-show',
    loadingHide: 'site-loading-hide',
    alertShow: 'site-alert-show',
    toast: 'site-toast',
    ready: 'site-config-ready',
}

function UX() {
    this.el = $(element);
    this.uri = new URL(window.location.href);

    this.showLoading = (showing = true) => {
        if (showing) {
            this.el.find("[data-rel=modal-loading]").show();
        } else {
            this.el.find("[data-rel=modal-loading]").hide();
        }
    }

    this.buildHref = (path, query) => {
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? '&' + query : ''}`:`https://${window.location.hostname}${path}${query ? '?' + query : ''}`;
    }

    this.loadScript = (src) => new Promise( (res, rej) => {
            $.getScript(
                src,
                function() { res() },
                function() { rej() }
            );
        });
}

const ux = new UX();

let _toast = [];
let _toastTimeout = undefined;

let _alertDialogT = undefined;
let _loadingDialogT = undefined;
let _toastT = undefined;

const enableFileUploads = (w) => {
    if (this._fileUploads) {
        return;
    }

    this._fileUploads = 1;

    const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;
    let defaultTypes = [];
    let files = [];

    ux.el.find("[data-rel=dialog][data-dialog=file]").parents('section').removeClass('hidden');

    w.sub(Message.uploadShow, (o) => {
        let t = o?.types || defaultTypes;
        let d = (t?.find( i => i.siteCandidateFileTypeID === o?.defaultType ) || t[0])?.siteCandidateFileTypeID;

        files = [];

        showTypes(t);

        if (data.inEditor || o?.showFiles) {
            shazamme.user()
                .then( u => showFiles(u?.candidate) )
                .then();
        } else {
            ux.el.find('[data-rel=dialog][data-dialog=file] .tab-bar').addClass('hidden');
        }

        ux.el.find('[data-rel=dialog][data-dialog=file] [data-rel=candidate-file-type]').val(d);

        ux.el.find("[data-rel=dialog][data-dialog=file]").fadeIn().css('display', 'flex');
    });

    ux.el.find("[data-rel=dialog][data-dialog=file] input[type=file]")
        .on('change', function() {
            let f = this.files[0];

            if (f.size > maxUploadSize) {
                alert( data.config.fileSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`);
                $(this).val('');

                return;
            }

            files.push(f);

            ux.el
                .find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]")
                .append(
                    fileEl(f).on('click', '[data-rel=action-remove]', function() {
                        let el = $(this).parents('article');

                        files.splice(el.index(), 1);
                        el.remove();
                    })
                );

            $(this).val('');
        })
        .on('dragleave', function(ev) {
            ev.preventDefault();

            $(this).parents('.file-button').removeClass('drop');
        })
        .on('dragover', function(ev) {
            ev.preventDefault();

            $(this).parents('.file-button').addClass('drop');
        })
        .on('drop', function(ev) {
            ev.preventDefault();

            $(this).parents('.file-button').removeClass('drop');

            [...(ev.originalEvent.dataTransfer.items || ev.originalEvent.dataTransfer.files)].forEach( i => {
                let f = i.getAsFile() || i;

                if (f.size > maxUploadSize) {
                    alert( `${data.config.fileSizeWarning || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`} (${f.name})`);

                    return;
                }

                files.push(f);
                ux.el
                    .find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]")
                    .append(
                        fileEl(f).on('click', '[data-rel=action-remove]', function() {
                            let el = $(this).parents('article');

                            files.splice(el.index(), 1);
                            el.remove();
                        })
                    );
            });
        });

    ux.el.find("[data-rel=dialog][data-dialog=file]")
        .on('click', '[data-rel=button-save]', function() {
            let dialog = $(this).parents("[data-rel=dialog][data-dialog=file]");

            if (files.length > 0) {
                ux.showLoading();

                const t = dialog.find('[data-rel=candidate-file-type]').val();

                Promise.all(files.map( f =>
                    readFile(f).then( b => Promise.resolve({
                        name: f.name?.replace(/[^a-z0-9-_.]/gi, '-').replace(/-{2,}/gi, '-'),
                        type: t,
                        content: btoa(b),
                    }) ) )
                )
                .then( r => {
                    w.pub(Message.uploadSubmit, r);
                    files = [];

                    ux.showLoading(false);

                    ux.el.find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]").empty();

                    dialog.fadeOut();
                });
            } else {
                w.pub(Message.uploadCancel);
                dialog.fadeOut();
            }
        })
        .on('click', '[data-rel=button-cancel]', function() {
            let dialog = $(this).parents("[data-rel=dialog][data-dialog=file]");
            let field = dialog.find('input[type=file]');

            w.pub(Message.uploadCancel);
            files = [];

            dialog.fadeOut();
            field.val('');
            ux.el.find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]").empty();
        })
        .removeClass('hidden');

    let readFile = (file) => new Promise( resolve => {
        let reader = new FileReader();

        reader.addEventListener("load", function () {
            resolve(reader.result);
        }, false);

        if (file) {
            reader.readAsBinaryString(file);
        }
    });

    let showTypes = (t) => {
        let el = ux.el.find('[data-rel=dialog][data-dialog=file] [data-rel=candidate-file-type]')
            .empty()
            .append(t?.map( i => `<option value="${i.siteCandidateFileTypeID}">${i.candidateFileType}</option>`))

        if (t?.length > 1) {
            el
                .parent()
                .show();
        }
    }

    let fileEl = (f) =>
        $(`
            <article class="item-file">
                <span class="text">${f.name || '(unknown)'}</span>
                <button class="action-remove" data-rel="action-remove"><span class="text">X</span></button>
            </article>
        `);

    let showFiles = (u) => {
        if (!data.inEditor && !u) return Promise.resolve();

        return (
            (data.inEditor && Promise.resolve(JSON.parse('{"response":{"items":[{"data": {"candidateFileID": "e5c290f3-5e28-456a-b00f-0686a1b28731","candidateFileName": "my-test-file.pdf","siteCandidateFileTypeID": "80743118-14f6-42be-9441-4a12c2d2af8d"}}]}}')))
            || shazamme.site().then( s =>
                shazamme.submit({
                    "action": "Get Candidate Files",
                    "candidateID": u.candidateID,
                    "siteID": s.siteID,
                })
            )).then( f => {
                const docs = (f?.response?.items || [])
                    .map( i => i.data )
                    .filter( (v, i, a) => !v.checkSum || a.indexOf(a.find( x => x.checkSum === v.checkSum )) === i );

                if (u?.cVFileContent) {
                    docs.push({
                        candidateID: u.candidateID,
                        candidateFileName: u.cVFileName,
                        candidateFileContent: u.cVFileContent,
                        siteCandidateFileTypeID: data.config.resumeFileType,
                        candidateFileID: 'resume',
                    });
                }

                if (u?.coverLetterContent) {
                    docs.push({
                        candidateID: u.candidateID,
                        candidateFileName: u.coverLetterFileName,
                        candidateFileContent: u.coverLetterContent,
                        siteCandidateFileTypeID: data.config.coverLetterFileType,
                        candidateFileID: 'cover',
                    });
                }

            ux.el.find('[data-rel=dialog][data-dialog=file] [data-rel=candidate-file-type]')
                .on('change', function() {
                    const t = $(this).val();

                    ux.el.find('[data-rel=candidate-file-collection]')
                        .empty()
                        .append(
                            docs
                                .filter( i => data.inEditor || i.siteCandidateFileTypeID === t )
                                .map( i => $(`
                                    <button class="item-file" title="${data.config.selectFile || 'Select file'}" data-id="${i.candidateFileID}" data-name="${i.candidateFileName}">
                                        <span class="text">${i.candidateFileName}</span>
                                    </button>
                                `))
                        )
                        .off('click')
                        .on('click', '.item-file', function() {
                            let el = $(this);
                            let id = el.attr('data-id');

                            if (data.inEditor) {
                                ux.el.find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]").empty();
                                el
                                    .parents("[data-rel=dialog][data-dialog=file]")
                                    .fadeOut();

                                return;
                            }

                            ux.showLoading();

                            const selected = (b64) => {
                                w.pub(Message.uploadSubmit, [{
                                    id: id,
                                    name: el.attr('data-name'),
                                    type: t,
                                    content: b64,
                                    isExisting: true,
                                }]);

                                files = [];

                                ux.showLoading(false);

                                ux.el.find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]").empty();

                                el
                                    .parents("[data-rel=dialog][data-dialog=file]")
                                    .fadeOut();
                            }

                            if (id === 'resume') {
                                selected(u?.cVFileContent);
                                return;
                            }

                            if (id === 'cover') {
                                selected(u?.coverLetterContent);
                                return;
                            }

                            shazamme.site()
                                .then( s => $.get(`${s.documentUri}/${t}/${id}?mode=b64`) )
                                .then( b64 => {
                                    selected(b64);
                                }).catch( ex => {
                                    w.ex('error retrieving candidate file', ex);

                                    ux.showLoading(false);

                                    ux.el.find("[data-rel=dialog][data-dialog=file] [data-rel=list-files]").empty();

                                    el
                                        .parents("[data-rel=dialog][data-dialog=file]")
                                        .fadeOut();
                                })
                        });
                })
                .trigger('change');

            if (docs.length > 0) {
                ux.el.find('[data-rel=dialog][data-dialog=file] .tab-bar')
                    .removeClass('hidden')
                    .on('click', '[data-rel=tab]', function() {
                        let tab = $(this);

                        ux.el.find('.tab-bar [data-rel=tab]').removeClass('active');
                        tab.addClass('active');

                        ux.el.find(`[data-rel=tab]`).hide();
                        ux.el.find(`button[data-rel=tab], [data-rel=tab][data-tab=${tab.attr('data-tab')}]`)
                            .show()
                            .removeClass('hidden');
                    })
                    .find('[data-rel=tab]').first().trigger('click');
            }

            return Promise.resolve();
        });
    }

    shazamme.site().then(s => shazamme.submit({
            "action": "Get Candidate File Types",
            "siteID": s.siteID,
            "language": data.locale,
        })
    ).then( t => {
        defaultTypes = t.response.items || [];
        shazamme.bag('site-config-file-type', defaultTypes);
    });
}

const enableIconPicker = (w) => {
    if (this._iconPicker) {
        return;
    }

    this._iconPicker = 1;

    let search = (s, q) => {
        $.ajax({
            url: 'https://api.fontawesome.com',
            type: 'POST',
            data: {
                query: `query { search (query: \"${q}\", first: 10, version: \"6.x\") { id, label, unicode } }`
            },
        }).then( r => {
            ux.el.find('[data-rel=icon-list]')
                .empty()
                .append(
                    r?.data?.search?.map( i => `<i class="${s} fa-${i.id}" title="${i.label}" data-id="${i.id}" data-code="${i.unicode}" data-set="${s}" />`)
                )
        });
    }

    w.sub(Message.iconPicker, () => {
        ux.el.find('[data-rel=icon-list]')
            .empty()
            .on('click', 'i', function() {
                let icon = $(this);

                w.pub(Message.iconChanged, {
                    id: icon.attr('data-id'),
                    code: icon.attr('data-code'),
                    set: icon.attr('data-set'),
                });

                ux.el.find('[data-rel=icon-search]').off('keyup');
                ux.el.find('[data-rel=icon-list]').off('click');

                ux.el.find('[data-rel=dialog][data-dialog=icons]')
                    .fadeOut();
            });

        ux.el.find('[data-rel=icon-search]')
            .val('')
            .on('keyup', function() {
                if (this._debounce) {
                    clearTimeout(this._debounce);
                }

                let value = $(this).val().trim();

                if (value.length < 3) {
                    return;
                }

                this._debounce = setTimeout(function() {
                    search(ux.el.find('[data-rel=icon-set]').val(), value);
                }, 2000);
            });

        ux.el.find('[data-rel=icon-set]').on('change', function() {
            let s = $(this).val();

            ux.el.find('[data-rel=icon-list] i').each( (_, i) => {
                let icon = $(i);

                i.className = `${s} fa-${icon.attr('data-id')}`;
                icon.attr('data-set', s);
            });
        });

        ux.el.find('[data-rel=dialog][data-dialog=icons] [data-rel=button-cancel]').on('click', function() {
            ux.el.find('[data-rel=dialog][data-dialog=icons]')
                .fadeOut();

            ux.el.find('[data-rel=icon-search]').off('keyup');
            ux.el.find('[data-rel=icon-list]').off('click');

            w.pub(Message.iconCancelled);
        });

        ux.el.find('[data-rel=dialog][data-dialog=icons]')
            .css({
                display: 'block',
                opacity: 100,
            })
            .removeClass('hidden')
            .fadeIn();
    });
}

const loadingDialog = () => {
    let el = $(`
        <div class="dialog shazamme-dialog loading" data-rel="dialog" data-dialog="loading">
            <div class="dialog-content">
                <p class="title">${data.config.loadingDialogTitle}</p>

                <img src="${data.config.loadingDialogImage}" />
            </div>
        </div>
    `).copyCSS(_loadingDialogT, null, ['display']);

    el.find('.dialog-content .title').copyCSS(_loadingDialogT?.find('.dialog-content .title'));
    el.find('.dialog-content').copyCSS(_loadingDialogT?.find('.dialog-content'));

    return el;
}

const alertDialog = (o) => {
    let el = $(`
        <div class="dialog shazamme-dialog alert" data-rel="dialog" data-dialog="alert">
            <div class="dialog-content">
                <p class="title">${o?.title || 'Alert'}</p>
                <div class="message">${o?.message || ''}</div>

                <div class="dialog-buttons">
                    <button class="button-main" data-rel="action-close"><span class="text">${o?.buttonText || 'OK'}</span></button>
                </div>
            </div>
        </div>
    `)
    .copyCSS(_alertDialogT, null, ['display'])
    .on('click', '[data-rel=action-close]', function() {
        try {
            o?.onClose();
        } catch {}

        $(this).parents('[data-dialog=alert]').remove();
    });

    el.find('.dialog-content').copyCSS(_alertDialogT?.find('.dialog-content'));
    el.find('.dialog-content .title').copyCSS(_alertDialogT?.find('.dialog-content .title'));
    el.find('.dialog-content .message').copyCSS(_alertDialogT?.find('.dialog-content .message'));
    el.find('.dialog-content .button-main').copyCSS(_alertDialogT?.find('.dialog-content .button-main'));

    // Rounded corners: box 12px, OK button 5px. copyCSS above copies the
    // template's computed styles inline (square), so override inline with
    // !important to win. overflow:hidden clips the dark title band to the round.
    const _box = el.find('.dialog-content')[0];
    if (_box) {
        _box.style.setProperty('border-radius', '12px', 'important');
        _box.style.setProperty('overflow', 'hidden', 'important');
    }
    el.find('.button-main').each((_, b) => b.style.setProperty('border-radius', '5px', 'important'));

    return el;

}

const toast = (m, t = 2500) => new Promise( (res, rej) => {
    let el = $('.shazamme-toast:gt(0)');

    if (el.length === 0) {
        el = $(`
            <div class="shazamme-toast" style="opacity: 0;">
                <span class="text"></span>
                <button class="close"><span class="text">X</span></button>
            </div>
        `)
        .copyCSS(_toastT, null, ['display', 'opacity'])
        .on('click', '.close', function() {
            clearTimeout(_toastTimeout);
            show(_toast.shift());
        })
        .appendTo($('body'));
    }

    const show = (t) => {
        if (t) {
            el
                .css({
                    opacity: 100,
                })
                .find('.text')
                .first()
                .text(t.message);

            _toastTimeout = setTimeout( () => {
                show(_toast.shift())
            }, t.to);
        } else {
            _toastTimeout = undefined;

            el.css({
                opacity: 0,
            });

            setTimeout( () => el.remove(), 2000 );
        }
    }

    if (_toastTimeout) {
        _toast.push({
            message: m,
            to: t,
        });
    } else {
        show({
            message: m,
            to: t,
        });
    }
});

let main = (w) => {
    delete this._fileUploads;
    delete this._iconPicker;

    if (data.inEditor) {
        ux.el.find('.editor-only')
            .removeClass('hidden')
            .show();

        ux.el.find('button[data-rel=editor-message]').on('click', function() {
            let b = $(this);

            w.pub(b.attr('data-editor-message'));
        });

        ux.el.find('[data-rel=button-show-tools]').on('click', function() {
            ux.el.find('.site-configuration-toolbar')
                .toggle()
                .removeClass('hidden');
        });

        enableFileUploads(w);
        enableIconPicker(w);

        ux.el.find('[data-hide-message]').each( (_, i) => {
            let el = $(i);

            shazamme.sub(el.attr('data-hide-message'), () => el.hide());
        });

        shazamme.site().then( s => {
            ux.el.find('[data-info-site-id]')
                .text(s.siteID)
                .on('click', function() {
                    navigator.clipboard.writeText(s.siteID).then( () => {
                        toast("Site ID copied to clipboard");
                    })
                });
        });
    }

    _alertDialogT = alertDialog().appendTo(ux.el).hide();
    _loadingDialogT = loadingDialog().appendTo(ux.el).hide();

    toast('', 300);
    _toastT = $('.shazamme-toast')
        .css({
            opacity: 0,
        })
        .clone()
        .appendTo(ux.el)
        .hide();

    const toPath = (p, d) => {
        if (p?.type === 'dynamic_page') {
            let seg = p.href.split('/');

            seg.splice(-1, 1);

            return seg.join('/');
        }

        return p?.href || d ;
    }

    data.config.pathHome          = toPath(data.config.pathHome,          '/');
    data.config.pathLogin         = toPath(data.config.pathLogin,         '/login');
    data.config.pathAlerts        = toPath(data.config.pathAlerts,        '/job-alerts');
    data.config.pathRegister      = toPath(data.config.pathRegister,      '/register');
    data.config.pathDashboard     = toPath(data.config.pathDashboard,     '/dashboard');
    data.config.pathJobResults    = toPath(data.config.pathJobResults,    '/job-results');
    data.config.pathJobDetails    = toPath(data.config.pathJobDetails,    '/job-details');
    data.config.pathJobApply      = toPath(data.config.pathJobApply,      '/job-application');
    data.config.pathThankYou      = toPath(data.config.pathThankYou,      '/thank-you');
    data.config.pathVerify        = toPath(data.config.pathVerify,        '/forgot-password');
    data.config.pathPasswordReset = toPath(data.config.pathPasswordReset, '/forgot-password');

    if (data.config.jobFieldMap) {
        let m = data.config.jobFieldMap
            .filter( i => i.jobFieldFrom && i.jobFieldTo )
            .map( i => `${i.jobFieldFrom}-${i.jobFieldTo}` );

        data.config.jobFieldMap = m.join(',');
    }

    for (let c in data.config) {
        shazamme.bag(`_site:${c}`, data.config[c]);
    }

    shazamme.bag('site-config', {
        configuration: data.config,
        message: Message,
        loadingDialog: loadingDialog,
        alertDialog: alertDialog,
        toast: toast,
    });

    w.sub(Message.uploadSupport, () => {
        enableFileUploads(w);
    });

    w.sub(Message.addTool, el => {
        if (!el) {
            return;
        }

        ux.el.find(`.site-configuration-toolbar [data-config=${el.attr('data-config')}]`).remove();
        ux.el.find('.site-configuration-toolbar [data-rel=external-tool]').append($(el).addClass('button-config'));
    });

    w.sub(Message.loadingShow, () => {
        let dialog = ux.el.find('[data-rel=dialog][data-dialog=loading]:gt(0)');

        if (dialog.length > 0) {
            dialog.remove();
        }

        if (dialog.length === 0 || !data.inEditor) {
            ux.el.append(loadingDialog());
        }
    });

    w.sub(Message.loadingHide, () => {
        ux.el.find('[data-rel=dialog][data-dialog=loading]:gt(0)').remove();
    });

    w.sub(Message.alertShow, (m) => {
        let dialog = ux.el.find('[data-rel=dialog][data-dialog=alert]:gt(0)');

        if (dialog.length > 0) {
            dialog.remove();
        }

        if (dialog.length === 0 || !data.inEditor) {
            if (data.inEditor) {
                m = {
                    title: 'Test Alert',
                    message: 'This is a test alert',
                }
            }

            ux.el.append(alertDialog(m));
        }
    });

    w.sub(Message.toast, (m) => {
        if (data.inEditor) {
            toast('This is a toast message', 10000);
        } else {
            toast(m?.message || '', m?.timeout || 2500);
        }
    })

    w.pub(Message.ready, {}, true);
    shazamme.bag(Message.ready, true);
}

ux.el
    .addClass('site-config')
    .children(':first')
    .show();

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.2.min.js')
    .then( () => shazamme.ready(data.siteId, data.page) )
    .then( () => shazamme.script('https://sdk.shazamme.io/js/plugin/jquery-copycss/jquery.copycss.min.js'))
    .then( () => {
        main(shazamme.register('site-config', data));
    });

let handle = ux.el.find('.draggable');

if (handle.draggable) {
    handle.draggable({handle: '.drag-handle'});
} else {
    ux.loadScript('https://code.jquery.com/ui/1.13.2/jquery-ui.js').then( () => {
        ux.el.find('.draggable').draggable({handle: '.drag-handle'});
    });
}
