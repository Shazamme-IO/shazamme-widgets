const Path = {
    home: data.config.pathHome || 'home',
    register: data.config.registerURL?.href || '/register',
}

function UX() {
    this.el = $(element);
    this.uri = new URL(window.location.href);

    this.loadScript = (src) => new Promise( (res, rej) => {
            $.getScript(
                src,
                function() { res() },
                function() { rej() }
            );
        });

    this.greet = (name) => {
        let decoder = document.createElement('textarea');

        decoder.innerHTML = name ?? '';

        this.el.find('.uqlCandidateInfo')
            .text(` ${decoder.value} `)
            .append('<b class="boardy-caret"></b>');
    };
}

const ux = new UX();

let main = (w) => {
    shazamme.user().then(u => {
        const manage = (u) => {
            if (u?.isVerified) {
                let ttl = new Date();

                ttl.setMinutes(ttl.getMinutes() + 2);

                let user = {
                    photo: `data:image/jpeg;base64,${u.candidate?.photo}`,
                    greeting: u?.candidate?.firstName || u?.firstName || 'Welcome',
                    is: u.is,
                    ttl: ttl,
                }

                shazamme.store(data.elementId, btoa(unescape(encodeURIComponent(JSON.stringify(user)))));

                ux.el.find('.uqlItem,.uqlDivider').addClass('uqlHideLink');
                ux.el.find('.uqlControlLinks').removeClass('uqlHideLink');

                ux.el.find('.uqprofilePic').attr('src',user.photo);
                ux.greet(user.greeting);

                ux.el.find('[data-user-role]').hide();

                user.is?.forEach(r => {
                    ux.el.find(`[data-user-role]`).each( (_, i) => {
                        let el = $(i);

                        if (r.startsWith(el.attr('data-user-role'))) {
                            el.show();
                        }
                    })
                });

            } else {
                shazamme.store(data.elementId, null);

                ux.el.find('.uqlItem').removeClass('uqlHideLink');
                ux.el.find('.uqlControlLinks').addClass('uqlHideLink');
                ux.el.find('.uqlLoggedInItemsContainer').addClass('uqlHideLink');
            }
        }

        w.sub('site-auth', u => {
            manage(u);
        });

        manage(u);
    });

    ux.el.find('.uqlProfileContainer').on('click', function(){
        $('.uqlLoggedInItemsContainer').toggleClass('uqlHideLink');
    });

    ux.el.find('.uqlSignOut').click(function(){
         shazamme.firebase().signOut();
    });

    ux.el.find('.loggedInContainer')
        .on('mouseenter', function() {
            $(this).find('.uqlLoginBtn').addClass('uqlLoginBtnActive');
        })
        .on('mouseleave', function(){
            $(this).find('.uqlLoginBtn').removeClass('uqlLoginBtnActive');
        });

    ux.el.find('.registerContainer')
        .on('mouseenter', function() {
            $(this).find('.uqlRegisterBtn').addClass('uqlRegisterBtnActive');
        })
        .on('mouseleave', function() {
            $(this).find('.uqlRegisterBtn').removeClass('uqlRegisterBtnActive');
        });

    ux.el.find('[data-href]').each( (_, i) => {
        let a = $(i);
        let link = data.config[a.attr('data-href')];

        if (link) {
            a.attr({
                href: link.href,
                label: link.label,
                raw_url: link.raw_url,
                type: link.type,
                page: link.page,
            });
        }
    })

    if (shazamme.bag('login-dialog-ready')) {
        ux.el.find('.uqlLoginBtn').on('click', function() {
            w.pub('login-dialog-show', { title: data.config.loginDialogTitle });
            return false;
        });
    }

    w.sub('login-dialog-ready', () => {
        ux.el.find('.uqlLoginBtn').on('click', function() {
            w.pub('login-dialog-show', { title: data.config.loginDialogTitle });
            return false;
        });
    });
}

try {
    let user = JSON.parse(decodeURIComponent(escape(atob(localStorage[data.elementId]))));

    if (new Date(user.ttl) > new Date()) {
        ux.el.find('.uqlItem,.uqlDivider').addClass('uqlHideLink');
        ux.el.find('.uqlControlLinks').removeClass('uqlHideLink');

        ux.el.find('.uqprofilePic').attr('src', user.photo);
        ux.greet(user.greeting);

        ux.el.find('[data-user-role]').hide();

        user.is?.forEach(r => {
            ux.el.find(`[data-user-role]`).each( (_, i) => {
                let el = $(i);

                if (r.startsWith(el.attr('data-user-role'))) {
                    el.show();
                }
            })
        });
    }
} catch {}

ux.el.find('.uqlMainContainer').show();

ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.2.min.js')
    .then( () => shazamme.ready(data.siteId, data.page) )
    .then( () => {
        main(shazamme.register('quick-nav', data))
    });

