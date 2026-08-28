const Message = {
    uploadShow  : 'upload-dialog-file-show',
    uploadSubmit: 'upload-dialog-file-submit',
    uploadCancel: 'upload-dialog-file-cancel',
    ready       : 'upload-dialog-ready',
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
        if (path && path.charAt(0) !== '/') path = '/' + path;
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
const dialog = ux.el.find('[data-rel=dialog][data-dialog=file]');

let main = (w) => {
    const maxUploadSize = (parseInt(data.config.maxUploadSize) || 10) * 1024 * 1024;
    let defaultTypes = [];
    let files = [];
    let site = null;

    dialog.parents('section').removeClass('hidden');

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
            dialog.find('.tab-bar').addClass('hidden');
        }

        dialog.find('[data-rel=candidate-file-type]').val(d);
        dialog.fadeIn().css('display', 'flex');
    });

    dialog.find("input[type=file]")
        .on('change', function() {
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

            files.push(f);

            dialog
                .find("[data-rel=list-files]")
                .append(
                    fileEl(f).on('click', '[data-rel=action-remove]', function() {
                        let el = $(this).parents('article');

                        files.splice(el.index(), 1);
                        el.remove();

                        if (files.length === 0) {
                            dialog.find('[data-rel=button-save]').addClass('disabled');
                        }
                    })
                );

            dialog.find('[data-rel=button-save]').removeClass('disabled');

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
                    let warning = data.config.warningFileSize || `Error! File too large, Should not exceed ${data.config.maxUploadSize || ''}mb`;

                    site?.alertDialog({
                        title: data.config.warningFileSizeTitle || 'File Too Large',
                        message: warning,
                    })?.appendTo(ux.el) || alert($(`<div>${warning}</div>`).text());

                    return;
                }

                files.push(f);

                dialog.find("[data-rel=list-files]")
                    .append(
                        fileEl(f).on('click', '[data-rel=action-remove]', function() {
                            let el = $(this).parents('article');

                            files.splice(el.index(), 1);
                            el.remove();

                            if (files.length === 0) {
                                dialog.find('[data-rel=button-save]').addClass('disabled');
                            }
                        })
                    );

                dialog.find('[data-rel=button-save]').removeClass('disabled');
            });
        });

    dialog
        .on('click', '[data-rel=button-save]', function() {
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

                    dialog.find("[data-rel=list-files]").empty();
                    dialog.find('[data-rel=button-save]').addClass('disabled');

                    dialog.fadeOut();
                });
            }
        })
        .on('click', '[data-rel=button-cancel]', function() {
            let field = dialog.find('input[type=file]');

            w.pub(Message.uploadCancel);
            files = [];

            dialog.fadeOut();
            field.val('');

            dialog.find("[data-rel=list-files]").empty();
            dialog.find('[data-rel=button-save]').addClass('disabled');

            if (data.inEditor) {
                setTimeout(() => { $(parent?.document?.body).find('.widgetCloseBtn').click(); }, 1000);
            }
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
        let el = dialog.find('[data-rel=candidate-file-type]')
            .empty()
            .append(t?.map( i => `<option value="${i.candidateFileTypeID || i.siteCandidateFileTypeID}" ${i.candidateFileTypeID && 'data-tab="files"' || ''}>${i.candidateFileType}</option>`))

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
        if (!data.inEditor && !u) {
            let activeTab = ux.el.find('[data-rel=tab][data-tab]:visible').attr('data-tab');

            dialog.find('[data-rel=candidate-file-type] option[data-tab]').hide();
            dialog.find(`[data-rel=candidate-file-type] option:not([data-tab]), [data-rel=candidate-file-type] option[data-tab=${activeTab}]`).show();

            return Promise.resolve();
        }

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

            dialog.find('[data-rel=candidate-file-type]')
                .on('change', function() {
                    const t = $(this).val();

                    dialog.find('[data-rel=candidate-file-collection]')
                        .empty()
                        .append(
                            docs
                                .filter( i => data.inEditor || i.candidateFileTypeID === t || i.siteCandidateFileTypeID === t )
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
                                dialog.find("[data-rel=list-files]").empty();
                                dialog.fadeOut();

                                dialog.find("[data-rel=list-files]").empty();
                                dialog.find('[data-rel=button-save]').addClass('disabled');

                                dialog.find('.tab-bar [data-rel=tab]').first().trigger('click');

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

                                dialog.find("[data-rel=list-files]").empty();
                                dialog.find('[data-rel=button-save]').addClass('disabled');

                                dialog.fadeOut();
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

                                    dialog.find("[data-rel=list-files]").empty();
                                    dialog.fadeOut();
                                })
                        });
                })
                .trigger('change');

            if (docs.length > 0) {
                let tabs = dialog.find('.tab-bar');

                tabs
                    .removeClass('hidden')
                    .on('click', '[data-rel=tab]', function() {
                        let tab = $(this);

                        dialog.find('.tab-bar [data-rel=tab]').removeClass('active');
                        tab.addClass('active');

                        dialog.find(`[data-tab]`).hide();
                        dialog.find(`button[data-rel=tab], [data-tab=${tab.attr('data-tab')}]`)
                            .show()
                            .removeClass('hidden');

                        dialog.find('[data-rel=candidate-file-type] option[data-tab]').hide();
                        dialog.find(`[data-rel=candidate-file-type] option:not([data-tab]), [data-rel=candidate-file-type] option[data-tab=${tab.attr('data-tab')}]`).show();

                        if (!data.inEditor && tab.is('[data-tab-limit-type]')) {
                            dialog.find('[data-rel=candidate-file-type] option').each( (_, i) => {
                                let option = $(i);
                                let v = option.attr('value');

                                if (!docs.find( x => x.candidateFileTypeID === v || x.siteCandidateFileTypeID === v )) {
                                    option.hide();
                                }
                            })

                        }
                    });

                if (!data.inEditor) {
                    tabs.find('[data-rel=tab]').first().trigger('click');
                }
            }

            return Promise.resolve();
        });
    }

    let enableEditor = () => {
        let editButton = ux.el.find('[data-rel=button-edit]');

        ux.el.find('.editor-only')
            .removeClass('hidden')
            .show();

        editButton.on('click', function() {
            w.bag('showInEditor', true);

            dialog.show();
        });

        ux.el.on('click', '[data-rel=button-dismiss]', function() {
            dialog.hide();
            w.bag('showInEditor', null);
        });

        if (w.bag('showInEditor')) {
            dialog.show();
        }

        ux.el.find('[data-rel=preview]').on('click', function() {
            w.bag('preview', $(this).attr('data-preview'));

            editButton.trigger('click');
        });

        showFiles();

        w.sub('site-config-ready', () => {
            site = shazamme.bag('site-config');

            let editButton = ux.el.find('[data-rel=button-edit]')
                .hide()
                .clone()
                .show();

            shazamme.pub(site.message.addTool, editButton);

            editButton.on('click', function() {
                w.bag('showInEditor', true);
                dialog.show();

                setTimeout(() => { $(parent?.document?.body).find('.widgetCloseBtn').click(); }, 1000);
            });
        });
    }

    shazamme.site().then(s => shazamme.submit({
            "action": "Get Candidate File Types",
            "siteID": s.siteID,
            "language": data.locale,
        })
    ).then( t => {
        defaultTypes = t?.response?.items || [];
        shazamme.bag('upload-dialog-file-type', defaultTypes);

        if (data.inEditor) {
            showTypes(defaultTypes);
        }
    });

    if (data.inEditor) {
        enableEditor();
    }

    w.pub(Message.ready, {}, true);
    shazamme.bag(Message.ready, true);
    shazamme.bag('upload-dialog', {
        message: Message,

        configuration: {
            resumeFileType: data.config.resumeFileType,
            coverLetterFileType: data.config.coverLetterFileType,
        },
    })
}

ux.el
    .addClass('upload-dialog')
    .css({
        '--shaz-button-submit-background': data.config.buttonSubmitBackground || '#000000',
        '--shaz-button-cancel-background': data.config.buttonCancelBackground || '#000000',
        '--shaz-button-submit-background-disabled': `${data.config.buttonSubmitBackground || '#000000'}60`,
        '--shaz-button-cancel-background-disabled': `${data.config.buttonCancelBackground || '#000000'}60`,
        '--shaz-tab-bar-corner-radius': `${data.config.TabCorner || '0'}px`,
        '--shaz-dialog-placement': data.config.DialogPlacement || 'center',
    });

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.1.min.js')
    .then( () => shazamme.ready(data.siteId, data.page) )
    .then( () => {
        main(shazamme.register('upload-dialog', data));
    });
