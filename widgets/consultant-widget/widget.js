const Path = {
}

const Collection = {
    consultant: {
        name: 'Consultants',
        action: 'Get Consultants',
        useCache: true,
        debug: data.inEditor && data.config.debugMode,
        endpoint: data.config.debugConsultantCollection,
    }
}

function UX() {
    const linkTarget = data.config.newTab && '_blank' || '_self';

    const toPath = (p, d) => {
        if (p?.type === 'dynamic_page') {
            let seg = p.href.split('/');

            seg.splice(-1, 1);

            return seg.join('/');
        }

        return p?.href || d || '';
    }

    this.el = $(element);
    this.uri = new URL(window.location.href);


    this.navigationEl = (i) => `
        <div class="clsbtmSliderImgTile">
             <img src="${i.data.photoURL|| 'https://shazamme.io/Job-Listing/src/img/profile-placeholder.png?fit=1000%2C1000&ssl=1'}" alter="SortOrder-${i.data.sortOrder}" class="Con-slider-img" />
        </div>
    `;

    this.standardEl = (c) => `
        <div class="widget-5dd67b layout_1" data-rel="article-consultant">
            <div class="container-default-card" ${data.config.showShadowDefaultCard && `style=" box-shadow: 6px 9px 8px ${data.config.cardShadowColor};"` || ''}>
            <div class="container-overlay">
              <!-- <div class="container-default-card-inner"> -->
                  <div class="container-default-card-front${data.config.toggleShowOverlay ? ' has-overlay' : ''}" ${data.config.toggleShowOverlay && `style="--overlay-angle:${data.config.gradientDegreeAngle}; --overlay-color:${data.config.gradientColorPick}; --overlay-stop:${data.config.gradientPercentColor}%;"` || ''}>
                    <div class="ordering-content-default-layout">

                      <!-- Consultant Image -->
                      ${data.config.toggleConsultantImage && `
                      <ion-row style="order: ${data.config.defaultImageOrder}">
                        <ion-col>
                          <div class="container-consultant-image-front" style="justify-content: ${data.config.cardAlignment}">
                            <img src="${c.data.photoURL}" class="consultant-image-front"/>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Consultant Name -->
                      ${data.config.toggleConsultantName && `
                      <ion-row style="order: ${data.config.defaultNameOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-name" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-consultant-name">${c.data.fullName}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Consultant Title -->
                      ${data.config.toggleConsultantTitle && `
                      <ion-row style="order: ${data.config.defaultTitleOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-title" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-consultant-title">${c.data.positionTitle || 'N/A'}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Location -->
                      ${data.config.toggleLocationAll && `
                      <ion-row style="order: ${data.config.defaultLocationOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-location" style="justify-content: ${data.config.cardAlignment}">
                            ${data.config.toggleLocationIcon && `
                            <div class="flex-items-icon-location">
                              <i class="${data.config.faIconLocation}">&nbsp;</i>
                            </div>
                            ` || '' }
                            ${data.config.toggleLocationCity && `
                            <div class="flex-items-location-city">${c.data.businessLocation2 || ''}</div>
                            ` || '' }
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Custom Field 1 -->
                      ${data.config.toggleCustomField1 && `
                      <ion-row style="order: ${data.config.defaultCustomField1Order}">
                        <ion-col>
                          <div class="flex-container-custom-field-front" style="justify-content: ${data.config.cardAlignment}">
                            <a href="${toPath(data.config.customField1Link)}" target="${data.config.customField1Link?.target || linkTarget}">
                            <div class="flex-items-custom-field-front">${data.config.customField1Text}</div>
                            </a>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Short Bio -->
                      ${data.config.toggleConsultantShortBio && `
                      <ion-row style="order: ${data.config.defaultShortBioOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-bio" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-consultant-bio">${c.data.fullDescription || ''}</div>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Category and Subcategory -->
                      ${data.config.toggleConsultantCategoryAll && `
                      <ion-row style="order: ${data.config.defaultCategoryOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-category-subcategory" style="justify-content: ${data.config.cardAlignment}">
                            ${data.config.toggleConsultantCategoryIcon && `
                            <div class="flex-items-icon-category">
                              <i class="${data.config.faIconCategory}">&nbsp;</i>
                            </div>
                            ` || '' }

                            ${data.config.toggleConsultantCategory && (c.data.classification2 || '').split(',').map( s => s.trim() ).filter(Boolean).map( (i, idx) => `
                              ${idx > 0 && data.config.toggleConsultantCategorySeparator && `<div class="flex-items-separator">&nbsp;&nbsp;${data.config.textSeparatorAll}&nbsp;&nbsp;</div>` || ''}
                              <div class="flex-items-consultant-category">${i}</div>
                            `).join('') || ''}
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Horizontal Rule -->
                      ${data.config.toggleCustomRule && `
                      <div class="container-rule" style="order: ${data.config.defaultCustomRuleOrder}">
                        <hr class="custom-rule" style="border-style: ${data.config.customRuleStyle}">
                      </div>
                      ` || '' }

                      <!-- Email -->
                      ${data.config.toggleConsultantEmailAll && `
                      <ion-row style="order: ${data.config.defaultEmailOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-email" style="justify-content: ${data.config.cardAlignment}">
                            ${data.config.toggleConsultantEmailIcon && `
                            <div class="flex-items-icon-email">
                              <i class="${data.config.faIconEmail}">&nbsp;</i>
                            </div>
                            ` || '' }
                            ${data.config.toggleConsultantEmail && `
                            <div class="flex-items-consultant-email">${c.data.email || ''}</div>
                            ` || '' }
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Office Phone -->
                      ${data.config.toggleConsultantPhoneAll && `
                      <ion-row style="order: ${data.config.defaultPhoneOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-office-phone" style="justify-content: ${data.config.cardAlignment}">
                            ${data.config.toggleConsultantPhoneIcon && `
                            <div class="flex-items-icon-phone">
                              <i class="${data.config.faIconPhone}">&nbsp;</i>
                            </div>
                            ` || '' }
                            ${data.config.toggleConsultantPhone && `
                            <div class="flex-items-consultant-phone">${c.data.phone || ''}</div>
                            ` || '' }
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Mobile Phone -->
                      ${data.config.toggleConsultantMobileAll && `
                      <ion-row style="order: ${data.config.defaultMobileOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-mobile-phone" style="justify-content: ${data.config.cardAlignment}">
                            ${data.config.toggleConsultantMobileIcon && `
                            <div class="flex-items-icon-mobile">
                              <i class="${data.config.faIconMobilePhone}">&nbsp;</i>
                            </div>
                            ` || '' }
                            ${data.config.toggleConsultantMobile && `
                            <div class="flex-items-consultant-mobile">${c.data.mobile || ''}</div>
                            ` || '' }
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Social Icons -->
                      ${data.config.toggleConsultanSocialIconsAll && `
                      <ion-row style="order: ${data.config.defaultSocialIconsOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-social-icons" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-icon-social">
                              ${data.config.toggleConsultanSocialIconsFacebook && `
                              <i class="${data.config.faIconFacebook}">&nbsp;</i>
                              ` || '' }
                              ${data.config.toggleConsultanSocialIconsInstagram && `
                              <i class="${data.config.faIconInstagram}">&nbsp;</i>
                              ` || '' }
                              ${data.config.toggleConsultanSocialIconsX && `
                              <i class="${data.config.faIconX}">&nbsp;</i>
                              ` || '' }
                              ${data.config.toggleConsultanSocialIconsLinkedin && `
                              <i class="${data.config.faIconLinkedin}">&nbsp;</i>
                              ` || '' }
                              ${data.config.toggleConsultanSocialIconsYoutube && `
                              <i class="${data.config.faIconYoutube}">&nbsp;</i>
                              ` || '' }
                            </div>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Custom Field 2 -->
                      ${data.config.toggleCustomField2 && `
                      <ion-row style="order: ${data.config.defaultCustomField2Order}">
                        <ion-col>
                          <div class="flex-container-custom-field-back" style="justify-content: ${data.config.cardAlignment}">
                            <a href="${toPath(data.config.customField2Link)}" target="${data.config.customField2Link?.target || linkTarget}">
                            <div class="flex-items-custom-field-back"><span>${data.config.customField2Text}</span></div>
                            </a>
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                      <!-- Buttons -->
                      ${data.config.toggleButtonsAll && `
                      <ion-row style="order: ${data.config.defaultButtonsOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-buttons" style="flex-direction:${data.config.buttonFlexDirection}; align-items:${data.config.stackedButtonAlignment}; justify-content:${data.config.sideBySideButtonAlignment}">
                            ${data.config.toggleButtonA && `
                            <a href="${toPath(data.config.buttonALink)}" target="${data.config.buttonALink?.target || linkTarget}">
                            <button class="flex-items-consultant-button-A">
                              <span class="text">${data.config.buttonAText}</span>
                            </button>
                            </a>
                            ` || '' }
                            ${data.config.toggleButtonsB && `
                            <div class="flex-items-consultant-button-spacer"></div>
                            <a href="${toPath(data.config.buttonBLink)}" target="${data.config.buttonBLink?.target || linkTarget}">
                            <button class="flex-items-consultant-button-B">
                              <span class="text">${data.config.buttonBText}</span>
                            </button>
                            </a>
                            ` || '' }
                          </div>
                        </ion-col>
                      </ion-row>
                      ` || '' }

                    <!-- </div> -->
                  </div>
                </div>
              </div>
            </div>
        </div>
    `;

    this.slideOutEl = (c) => `
        <div class="widget-5dd67b layout_2" data-rel="article-consultant">
          <ion-grid>
            <div class="container-slideout-card" ${data.config.showShadowDefaultCard && `style="box-shadow: 6px 9px 8px ${data.config.cardShadowColor};"` || ''}>
              <div class="container-slideout-card-inner">
                <div class="container-overlay" data-rel="link" data-link="${toPath(data.config.buttonALink)}" data-target="${data.config.buttonALink?.target || linkTarget}">
                  <div class="container-slideout-card-front${data.config.toggleShowOverlay ? ' has-overlay' : ''}" ${data.config.toggleShowOverlay && `style="--overlay-angle:${data.config.gradientDegreeAngle}; --overlay-color:${data.config.gradientColorPick}; --overlay-stop:${data.config.gradientPercentColor}%;"` || ''}>
                    <div class="ordering-content-slideout-layout">

                      <!-- Consultant Image -->
                      ${data.config.toggleConsultantImage &&
                      `<ion-row style="order: ${data.config.slideOutImageOrder}">
                        <ion-col>
                          <div class="container-consultant-image-front" style="justify-content: ${data.config.cardAlignment}">
                            <img src="${c.data.photoURL}" class="consultant-image-front"/>
                          </div>
                        </ion-col>
                      </ion-row>`
                      || ''}

                      <!-- Consultant Name -->
                      ${data.config.toggleConsultantName &&
                      `<ion-row style="order: ${data.config.slideOutNameOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-name" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-consultant-name">${c.data.fullName}</div>
                          </div>
                        </ion-col>
                      </ion-row>`
                      || ''}

                      <!-- Consultant Title -->
                      ${data.config.toggleConsultantTitle &&
                      `<ion-row style="order: ${data.config.slideOutTitleOrder}">
                        <ion-col>
                          <div class="flex-container-consultant-title" style="justify-content: ${data.config.cardAlignment}">
                            <div class="flex-items-consultant-title">${c.data.positionTitle || 'N/A'}</div>
                          </div>
                        </ion-col>
                      </ion-row>`
                      || ''}

                    </div>
                  </div>
                </div>

                <!-- Accordion Button -->
                <ion-row style="order: 4">
                  <ion-col>
                    <div class="accordion">
                      <div class="top" data-rel="action-accordion">
                        <div class="text">${data.config.slideOutActionText}</div>
                        <i class="${data.config.slideOutOpenCloseIcon}"></i>
                      </div>

                      <div class="bottom" data-accordion>

                        <!-- Location -->
                        ${data.config.toggleLocationAll &&
                        `<ion-row style="order: ${data.config.slideOutLocationOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-location" style="justify-content: ${data.config.cardAlignment}">
                              ${data.config.toggleLocationIcon &&
                              `<div class="flex-items-icon-location" style="justify-content: ${data.config.cardAlignment}">
                                <i class="${data.config.faIconLocation}">&nbsp;</i>
                              </div>`
                              || ''}
                              ${data.config.toggleLocationCity &&
                              `<div class="flex-items-location-city">${c.data.businessLocation2 || ''}</div>`
                              || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Custom Field 1 -->
                        ${data.config.toggleCustomField1 &&
                        `<ion-row style="order: ${data.config.slideOutCustomField1Order}">
                          <ion-col>
                            <div class="flex-container-custom-field-front" style="justify-content: ${data.config.cardAlignment}">
                              <a href="${toPath(data.config.customField1Link)}" target="${data.config.customField1Link?.target || linkTarget}">
                              <div class="flex-items-custom-field-front">${data.config.customField1Text}</div>
                              </a>
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Short Bio -->
                        ${data.config.toggleConsultantShortBio &&
                        `<ion-row style="order: ${data.config.slideOutShortBioOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-bio" style="justify-content: ${data.config.cardAlignment}">
                              <div class="flex-items-consultant-bio">${c.data.fullDescription || ''}</div>
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Category and Subcategory -->
                        ${data.config.toggleConsultantCategoryAll &&
                        `<ion-row style="order: ${data.config.slideOutCategoryOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-category-subcategory" style="justify-content: ${data.config.cardAlignment}">
                              ${data.config.toggleConsultantCategoryIcon &&
                              `<div class="flex-items-icon-category">
                                <i class="${data.config.faIconCategory}">&nbsp;</i>
                              </div>`
                              || ''}
                              ${data.config.toggleConsultantCategory && (c.data.classification2 || '').split(',').map( s => s.trim() ).filter(Boolean).map( (i, idx) => `
                                ${idx > 0 && data.config.toggleConsultantCategorySeparator && `<div class="flex-items-separator">&nbsp;&nbsp;${data.config.textSeparatorAll}&nbsp;&nbsp;</div>` || ''}
                                <div class="flex-items-consultant-category">${i}</div>
                              `).join('') || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Horizontal Rule -->
                        ${data.config.toggleCustomRule &&
                        `<div class="container-rule" style="order: ${data.config.slideOutCustomRuleOrder}">
                          <hr class="custom-rule">
                        </div>`
                        || ''}

                        <!-- Email -->
                        ${data.config.toggleConsultantEmailAll &&
                        `<ion-row style="order: ${data.config.slideOutEmailOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-email" style="justify-content: ${data.config.cardAlignment}">
                              ${data.config.toggleConsultantEmailIcon &&
                              `<div class="flex-items-icon-email">
                                <i class="${data.config.faIconEmail}">&nbsp;</i>
                              </div>`
                              || ''}
                              ${data.config.toggleConsultantEmail &&
                              `<div class="flex-items-consultant-email">${c.data.email || ''}</div>`
                              || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Office Phone -->
                        ${data.config.toggleConsultantPhoneAll &&
                        `<ion-row style="order: ${data.config.slideOutPhoneOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-office-phone" style="justify-content: ${data.config.cardAlignment}">
                              ${data.config.toggleConsultantPhoneIcon &&
                              `<div class="flex-items-icon-phone">
                                <i class="${data.config.faIconPhone}">&nbsp;</i>
                              </div>`
                              || ''}
                              ${data.config.toggleConsultantPhone &&
                              `<div class="flex-items-consultant-phone">${c.data.phone || ''}</div>`
                              || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Mobile Phone -->
                        ${data.config.toggleConsultantMobileAll &&
                        `<ion-row style="order: ${data.config.slideOutMobileOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-mobile-phone" style="justify-content: ${data.config.cardAlignment}">
                              ${data.config.toggleConsultantMobileIcon &&
                              `<div class="flex-items-icon-mobile">
                                <i class="${data.config.faIconMobilePhone}">&nbsp;</i>
                              </div>`
                              || ''}
                              ${data.config.toggleConsultantMobile &&
                              `<div class="flex-items-consultant-phone">${c.data.mobile || ''}</div>`
                              || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Social Icons -->
                        ${data.config.toggleConsultanSocialIconsAll &&
                        `<ion-row style="order: ${data.config.slideOutSocialIconsOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-social-icons" style="justify-content: ${data.config.cardAlignment}">
                              <div class="flex-items-icon-social">
                                ${data.config.toggleConsultanSocialIconsFacebook &&
                                `<i class="${data.config.faIconFacebook}">&nbsp;</i>`
                                || ''}
                                ${data.config.toggleConsultanSocialIconsInstagram &&
                                `<i class="${data.config.faIconInstagram}">&nbsp;</i>`
                                || ''}
                                ${data.config.toggleConsultanSocialIconsX &&
                                `<i class="${data.config.faIconX}">&nbsp;</i>`
                                || ''}
                                ${data.config.toggleConsultanSocialIconsLinkedin &&
                                `<i class="${data.config.faIconLinkedin}">&nbsp;</i>`
                                || ''}
                                ${data.config.toggleConsultanSocialIconsYoutube &&
                                `<i class="${data.config.faIconYoutube}">&nbsp;</i>`
                                || ''}
                              </div>
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Custom Field 2 -->
                        ${data.config.toggleCustomField2 &&
                        `<ion-row style="order: ${data.config.slideOutCustomField2Order}">
                          <ion-col>
                            <div class="flex-container-custom-field-back" style="justify-content: ${data.config.cardAlignment}">
                              <a href="${toPath(data.config.customField2Link)}" target="${data.config.customField2Link?.target || linkTarget}">
                              <div class="flex-items-custom-field-back"><span>${data.config.customField2Text}</span></div>
                              </a>
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                        <!-- Buttons -->
                        ${data.config.toggleButtonsAll &&
                        `<ion-row style="order: ${data.config.slideOutButtonsOrder}">
                          <ion-col>
                            <div class="flex-container-consultant-buttons" style="flex-direction:${data.config.buttonFlexDirection}; align-items:${data.config.stackedButtonAlignment}; justify-content:${data.config.sideBySideButtonAlignment}">
                              ${data.config.toggleButtonA &&
                              `<a href="${toPath(data.config.buttonALink)}" target="${data.config.buttonALink?.target || linkTarget}">
                              <button class="flex-items-consultant-button-A">
                                <span>${data.config.buttonAText}</span>
                              </button>
                              </a>`
                              || ''}
                              ${data.config.toggleButtonsB &&
                              `<div class="flex-items-consultant-button-spacer"></div>
                              <a href="${toPath(data.config.buttonBLink)}" target="${data.config.buttonBLink?.target || linkTarget}">
                              <button class="flex-items-consultant-button-B">
                                <span>${data.config.buttonBText}</span>
                              </button>
                              </a>`
                              || ''}
                            </div>
                          </ion-col>
                        </ion-row>`
                        || ''}

                      </div>
                    </div>
                  </ion-col>
                </ion-row>

              </div>
            </div>
          </ion-grid>
        </div>
        <!-- END LAYOUT 2: SLIDE OUT -->
    `;

    this.flipCardEl = (c) => `
        <!-- BEGIN LAYOUT 3: FLIP CARD -->
        <div class="widget-5dd67b layout_3" data-rel="article-consultant">
          <ion-grid>
            <div class="container-flip-card" ${data.config.showShadowDefaultCard && `style=" box-shadow: 6px 9px 8px ${data.config.cardShadowColor};"` || ''}>
              <div class="container-flip-card-inner">

                <!-- CARD FRONT -->
                <div class="container-flip-card-front${data.config.toggleShowOverlay ? ' has-overlay' : ''}" ${data.config.toggleShowOverlay && `style="--overlay-angle:${data.config.gradientDegreeAngle}; --overlay-color:${data.config.gradientColorPick}; --overlay-stop:${data.config.gradientPercentColor}%;"` || ''}>
                  <div class="ordering-content-front">

                    <!-- Consultant Image -->
                    ${data.config.toggleConsultantImage && `
                    <ion-row style="order: ${data.config.flipCardImageOrder}">
                      <ion-col>
                        <div class="container-consultant-image-front" style="justify-content: ${data.config.cardAlignment}">
                          <img src="${c.data.photoURL}" class="consultant-image-front"/>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Consultant Name -->
                    ${data.config.toggleConsultantName && `
                    <ion-row style="order: ${data.config.flipCardNameOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-name" style="justify-content: ${data.config.cardAlignment}">
                          <div class="flex-items-consultant-name">${c.data.fullName}</div>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Consultant Title -->
                    ${data.config.toggleConsultantTitle && `
                    <ion-row style="order: ${data.config.flipCardTitleOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-title" style="justify-content: ${data.config.cardAlignment}">
                          <div class="flex-items-consultant-title">${c.data.positionTitle || 'N/A'}</div>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Location -->
                    ${data.config.toggleLocationAll && `
                    <ion-row style="order: ${data.config.flipCardLocationOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-location" style="justify-content: ${data.config.cardAlignment}">
                          ${data.config.toggleLocationIcon && `
                          <div class="flex-items-icon-location">
                            <i class="${data.config.faIconLocation}">&nbsp;</i>
                          </div>
                          ` || ''}
                          ${data.config.toggleLocationCity && `
                          <div class="flex-items-location-city">${c.data.businessLocation2 || ''}</div>
                          ` || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Custom Field 1 -->
                    ${data.config.toggleCustomField1 && `
                    <ion-row style="order: ${data.config.flipCardCustomField1Order}">
                      <ion-col>
                        <div class="flex-container-custom-field-front" style="justify-content: ${data.config.cardAlignment}">
                          <a href="${toPath(data.config.customField1Link)}" target="${data.config.customField1Link?.target || linkTarget}">
                          <div class="flex-items-custom-field-front">${data.config.customField1Text}</div>
                          </a>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                  </div>
                </div>

                <!-- CARD BACK -->
                <div class="container-flip-card-back">
                  <div class="ordering-content-back">

                    <!-- Short Bio -->
                    ${data.config.toggleConsultantShortBio && `
                    <ion-row style="order: ${data.config.flipCardShortBioOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-bio" style="justify-content: ${data.config.cardAlignment}">
                          <div class="flex-items-consultant-bio">${c.data.fullDescription || ''}</div>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Category and Subcategory -->
                    ${data.config.toggleConsultantCategoryAll && `
                    <ion-row style="order: ${data.config.flipCardCategoryOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-category-subcategory" style="justify-content: ${data.config.cardAlignment}">
                          ${data.config.toggleConsultantCategoryIcon && `
                          <div class="flex-items-icon-category">
                            <i class="${data.config.faIconCategory}">&nbsp;</i>
                          </div>
                          ` || ''}
                          ${data.config.toggleConsultantCategory && (c.data.classification2 || '').split(',').map( s => s.trim() ).filter(Boolean).map( (i, idx) => `
                            ${idx > 0 && data.config.toggleConsultantCategorySeparator && `<div class="flex-items-separator">&nbsp;&nbsp;${data.config.textSeparatorAll}&nbsp;&nbsp;</div>` || ''}
                            <div class="flex-items-consultant-category">${i}</div>
                          `).join('') || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Horizontal Rule -->
                    ${data.config.toggleCustomRule && `
                    <div class="container-rule" style="order: ${data.config.flipCardCustomRuleOrder}">
                      <hr class="custom-rule">
                    </div>
                    ` || ''}

                    <!-- Email -->
                    ${data.config.toggleConsultantEmailAll && `
                    <ion-row style="order: ${data.config.flipCardEmailOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-email" style="justify-content: ${data.config.cardAlignment}">
                          ${data.config.toggleConsultantEmailIcon && `
                          <div class="flex-items-icon-email">
                            <i class="${data.config.faIconEmail}">&nbsp;</i>
                          </div>
                          ` || ''}
                          ${data.config.toggleConsultantEmail && `
                          <div class="flex-items-consultant-email">${c.data.email || ''}</div>
                          ` || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Office Phone -->
                    ${data.config.toggleConsultantPhoneAll && `
                    <ion-row style="order: ${data.config.flipCardPhoneOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-office-phone" style="justify-content: ${data.config.cardAlignment}">
                          ${data.config.toggleConsultantPhoneIcon && `
                          <div class="flex-items-icon-phone">
                            <i class="${data.config.faIconPhone}">&nbsp;</i>
                          </div>
                          ` || ''}
                          ${data.config.toggleConsultantPhone && `
                          <div class="flex-items-consultant-phone">${c.data.phone || ''}</div>
                          ` || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Mobile Phone -->
                    ${data.config.toggleConsultantMobileAll && `
                    <ion-row style="order: ${data.config.flipCardMobileOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-mobile-phone" style="justify-content: ${data.config.cardAlignment}">
                          ${data.config.toggleConsultantMobileIcon && `
                          <div class="flex-items-icon-mobile">
                            <i class="${data.config.faIconMobilePhone}">&nbsp;</i>
                          </div>
                          ` || ''}
                          ${data.config.toggleConsultantMobile && `
                          <div class="flex-items-consultant-phone">${c.data.mobile || ''}</div>
                          ` || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Social Icons -->
                    ${data.config.toggleConsultanSocialIconsAll && `
                    <ion-row style="order: ${data.config.flipCardSocialIconsOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-social-icons" style="justify-content: ${data.config.cardAlignment}">
                          <div class="flex-items-icon-social">
                            ${data.config.toggleConsultanSocialIconsFacebook && `
                            <i class="${data.config.faIconFacebook}">&nbsp;</i>
                            ` || ''}
                            ${data.config.toggleConsultanSocialIconsInstagram && `
                            <i class="${data.config.faIconInstagram}">&nbsp;</i>
                            ` || ''}
                            ${data.config.toggleConsultanSocialIconsX && `
                            <i class="${data.config.faIconX}">&nbsp;</i>
                            ` || ''}
                            ${data.config.toggleConsultanSocialIconsLinkedin && `
                            <i class="${data.config.faIconLinkedin}">&nbsp;</i>
                            ` || ''}
                            ${data.config.toggleConsultanSocialIconsYoutube && `
                            <i class="${data.config.faIconYoutube}">&nbsp;</i>
                            ` || ''}
                          </div>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Custom Field 2 -->
                    ${data.config.toggleCustomField2 && `
                    <ion-row style="order: ${data.config.slideOutCustomField2Order}">
                      <ion-col>
                        <div class="flex-container-custom-field-back" style="justify-content: ${data.config.cardAlignment}">
                          <a href="${toPath(data.config.customField2Link)}" target="${data.config.customField2Link?.target || linkTarget}">
                          <div class="flex-items-custom-field-back"><span>${data.config.customField2Text}</span></div>
                          </a>
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                    <!-- Buttons -->
                    ${data.config.toggleButtonsAll && `
                    <ion-row style="order: ${data.config.slideOutButtonsOrder}">
                      <ion-col>
                        <div class="flex-container-consultant-buttons" style="flex-direction:${data.config.buttonFlexDirection}; align-items:${data.config.stackedButtonAlignment}; justify-content:${data.config.sideBySideButtonAlignment}">
                          ${data.config.toggleButtonA && `
                          <a href="${toPath(data.config.buttonALink)}" target="${data.config.buttonALink?.target || linkTarget}">
                          <button class="flex-items-consultant-button-A">
                            <span>${data.config.buttonAText}</span>
                          </button>
                          </a>
                          ` || ''}
                          ${data.config.toggleButtonsB && `
                          <div class="flex-items-consultant-button-spacer"></div>
                          <a href="${toPath(data.config.buttonBLink)}" target="${data.config.buttonBLink?.target || linkTarget}">
                          <button class="flex-items-consultant-button-B">
                            <span>${data.config.buttonBText}</span>
                          </button>
                          </a>
                          ` || ''}
                        </div>
                      </ion-col>
                    </ion-row>
                    ` || ''}

                  </div>
                </div>

              </div>
            </div>
          </ion-grid>
        </div>
    `;

    this.popupEl = (c) => `
        <div class="widget-5dd67b layout_4" data-rel="article-consultant">
          <ion-grid>
            <div class="container-flip-card" ${data.config.showShadowDefaultCard && `style=" box-shadow: 6px 9px 8px ${data.config.cardShadowColor};"` || ''}>
              <div class="container-flip-card-front${data.config.toggleShowOverlay ? ' has-overlay' : ''}" ${data.config.toggleShowOverlay && `style="--overlay-angle:${data.config.gradientDegreeAngle}; --overlay-color:${data.config.gradientColorPick}; --overlay-stop:${data.config.gradientPercentColor}%;"` || ''}>
                <div class="ordering-content-front">

                  <!-- Consultant Image -->
                  ${data.config.toggleConsultantImage && `
                  <ion-row style="order: ${data.config.popUpImageOrder}">
                    <ion-col class="heading">
                        <div class="container-consultant-image-front" style="justify-content: ${data.config.cardAlignment}">
                            <img src="${c.data.photoURL}" class="consultant-image-front" />
                        </div>
                        <div class="flex-container-modal-trigger">
                            <button class="modal-popup-icon" data-rel="show-modal" data-consultant-id="${c.data.consultantID}"><i class="${data.config.faIconModalPopup}"></i></button>
                        </div>
                </ion-col>
                  </ion-row>
                  ` || ''}

                  <!-- Consultant Name -->
                  ${data.config.toggleConsultantName && `
                  <ion-row style="order: ${data.config.popUpNameOrder}">
                    <ion-col>
                      <div class="flex-container-consultant-name" style="justify-content: ${data.config.cardAlignment}">
                        <div class="flex-items-consultant-name">${c.data.fullName}</div>
                      </div>
                    </ion-col>
                  </ion-row>
                  ` || ''}

                  <!-- Consultant Title -->
                  ${data.config.toggleConsultantTitle && `
                  <ion-row style="order: ${data.config.popUpTitleOrder}">
                    <ion-col>
                      <div class="flex-container-consultant-title" style="justify-content: ${data.config.cardAlignment}">
                        <div class="flex-items-consultant-title">${c.data.positionTitle || 'N/A'}</div>
                      </div>
                    </ion-col>
                  </ion-row>
                  ` || ''}

                  <!-- Social Icons -->
                  ${data.config.toggleConsultanSocialIconsAll && `
                  <ion-row style="order: ${data.config.popUpSocialIconsOrder}">
                    <ion-col>
                      <div class="flex-container-consultant-social-icons" style="justify-content: ${data.config.cardAlignment}">
                        <div class="flex-items-icon-social">
                          ${data.config.toggleConsultanSocialIconsFacebook && `
                          <i class="${data.config.faIconFacebook}">&nbsp;</i>
                          ` || ''}
                          ${data.config.toggleConsultanSocialIconsInstagram && `
                          <i class="${data.config.faIconInstagram}">&nbsp;</i>
                          ` || ''}
                          ${data.config.toggleConsultanSocialIconsX && `
                          <i class="${data.config.faIconX}">&nbsp;</i>
                          ` || ''}
                          ${data.config.toggleConsultanSocialIconsLinkedin && `
                          <i class="${data.config.faIconLinkedin}">&nbsp;</i>
                          ` || ''}
                          ${data.config.toggleConsultanSocialIconsYoutube && `
                          <i class="${data.config.faIconYoutube}">&nbsp;</i>
                          ` || ''}
                        </div>
                      </div>
                    </ion-col>
                  </ion-row>
                  ` || ''}

                  <!-- Custom Field 1 -->
                  ${data.config.toggleCustomField1 && `
                  <ion-row style="order: ${data.config.popUpCustomField1Order}">
                    <ion-col>
                      <div class="flex-container-custom-field-front" style="justify-content: ${data.config.cardAlignment}">
                        <a href="${toPath(data.config.customField1Link)}" target="${data.config.customField1Link?.target || linkTarget}">
                        <div class="flex-items-custom-field-front">${data.config.customField1Text}</div>
                        </a>
                      </div>
                    </ion-col>
                  </ion-row>
                  ` || ''}
                </div>
              </div>
            </div>
          </ion-grid>
        </div>
     `;

    this.modalEl = (c) => `
        <div data-rel="consultant-modal" class="modal">
          <div class="modal-content">
            <span class="close"><i class="${data.config.faIconModalClose}"></i></span>

            <div class="ordering-content-front">

              <!-- Short Bio -->
              ${data.config.toggleConsultantShortBio && `
              <ion-row style="order: ${data.config.popUpShortBioOrder}">
                <ion-col>
                  <div class="flex-container-consultant-bio" style="justify-content: ${data.config.cardAlignment}">
                    <div class="flex-items-consultant-bio">${c.data.fullDescription || ''}</div>
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Category and Subcategory -->
              ${data.config.toggleConsultantCategoryAll && `
              <ion-row style="order: ${data.config.popUpCategoryOrder}">
                <ion-col>
                  <div class="flex-container-consultant-category-subcategory" style="justify-content: ${data.config.cardAlignment}">
                    ${data.config.toggleConsultantCategoryIcon && `
                    <div class="flex-items-icon-category">
                      <i class="${data.config.faIconCategory}">&nbsp;</i>
                    </div>
                    ` || ''}
                    ${data.config.toggleConsultantCategory && (c.data.classification2 || '').split(',').map( s => s.trim() ).filter(Boolean).map( (i, idx) => `
                      ${idx > 0 && data.config.toggleConsultantCategorySeparator && `<div class="flex-items-separator">&nbsp;&nbsp;${data.config.textSeparatorAll}&nbsp;&nbsp;</div>` || ''}
                      <div class="flex-items-consultant-category">${i}</div>
                    `).join('') || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Location -->
              ${data.config.toggleLocationAll && `
              <ion-row style="order: ${data.config.popUpLocationOrder}">
                <ion-col>
                  <div class="flex-container-consultant-location" style="justify-content: ${data.config.cardAlignment}">
                    ${data.config.toggleLocationIcon && `
                    <div class="flex-items-icon-location">
                      <i class="${data.config.faIconLocation}">&nbsp;</i>
                    </div>
                    ` || ''}
                    ${data.config.toggleLocationCity && `
                    <div class="flex-items-location-city">${c.data.businessLocation2 || ''}</div>
                    ` || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Horizontal Rule -->
              ${data.config.toggleCustomRule && `
              <div class="container-rule" style="order: ${data.config.popUpCustomRuleOrder}">
                <hr class="custom-rule">
              </div>
              ` || ''}

              <!-- Email -->
              ${data.config.toggleConsultantEmailAll && `
              <ion-row style="order: ${data.config.popUpEmailOrder}">
                <ion-col>
                  <div class="flex-container-consultant-email" style="justify-content: ${data.config.cardAlignment}">
                    ${data.config.toggleConsultantEmailIcon && `
                    <div class="flex-items-icon-email">
                      <i class="${data.config.faIconEmail}">&nbsp;</i>
                    </div>
                    ` || ''}
                    ${data.config.toggleConsultantEmail && `
                    <div class="flex-items-consultant-email">${c.data.email || ''}</div>
                    ` || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Office Phone -->
              ${data.config.toggleConsultantPhoneAll && `
              <ion-row style="order: ${data.config.popUpPhoneOrder}">
                <ion-col>
                  <div class="flex-container-consultant-office-phone" style="justify-content: ${data.config.cardAlignment}">
                    ${data.config.toggleConsultantPhoneIcon && `
                    <div class="flex-items-icon-phone">
                      <i class="${data.config.faIconPhone}">&nbsp;</i>
                    </div>
                    ` || ''}
                    ${data.config.toggleConsultantPhone && `
                    <div class="flex-items-consultant-phone">${c.data.phone || ''}</div>
                    ` || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Mobile Phone -->
              ${data.config.toggleConsultantMobileAll && `
              <ion-row style="order: ${data.config.popUpMobileOrder}">
                <ion-col>
                  <div class="flex-container-consultant-mobile-phone" style="justify-content: ${data.config.cardAlignment}">
                    ${data.config.toggleConsultantMobileIcon && `
                    <div class="flex-items-icon-mobile">
                      <i class="${data.config.faIconMobilePhone}">&nbsp;</i>
                    </div>
                    ` || ''}
                    ${data.config.toggleConsultantMobile && `
                    <div class="flex-items-consultant-phone">${c.data.mobile || ''}</div>
                    ` || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Custom Field 2 -->
              ${data.config.toggleCustomField2 && `
              <ion-row style="order: ${data.config.popUpCustomField2Order}">
                <ion-col>
                  <div class="flex-container-custom-field-back" style="justify-content: ${data.config.cardAlignment}">
                    <a href="${toPath(data.config.customField2Link)}" target="${data.config.customField2Link?.target || linkTarget}">
                    <div class="flex-items-custom-field-back"><span>${data.config.customField2Text}</span></div>
                    </a>
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}

              <!-- Buttons -->
              ${data.config.toggleButtonsAll && `
              <ion-row style="order: ${data.config.popUpButtonsOrder}">
                <ion-col>
                  <div class="flex-container-consultant-buttons" style="flex-direction:${data.config.buttonFlexDirection}; align-items:${data.config.stackedButtonAlignment}; justify-content:${data.config.sideBySideButtonAlignment}">
                    ${data.config.toggleButtonA && `
                    <a href="${toPath(data.config.buttonALink)}" target="${data.config.buttonALink?.target || linkTarget}">
                    <button class="flex-items-consultant-button-A">
                      <span>${data.config.buttonAText}</span>
                    </button>
                    </a>
                    ` || ''}
                    ${data.config.toggleButtonsB && `
                    <div class="flex-items-consultant-button-spacer"></div>
                    <a href="${toPath(data.config.buttonBLink)}" target="${data.config.buttonBLink?.target || linkTarget}">
                    <button class="flex-items-consultant-button-B">
                      <span>${data.config.buttonBText}</span>
                    </button>
                    </a>
                    ` || ''}
                  </div>
                </ion-col>
              </ion-row>
              ` || ''}
            </div>
          </div>
        </div>
    `;

    this.setDisplayMode = () => {
        let className = [];

        switch (data.config.Consultant_Layouts) {
            case 'layout_2': { className.push('grid'); break; }
            case 'layout_3': { className.push('grid'); break; }
            case 'layout_4': { className.push('grid'); break; }
            default: break;
        }

        className.push(data.config.gridSize);

        this.el.find('[data-rel=consultant-list]').addClass(className);
    }

    this.loadSlides = () => {
        const sender = this;

        return Promise.all([
            shazamme.script('https://sdk.shazamme.io/js/plugin/splide/v4/js/splide.min.js'),
            shazamme.style('https://sdk.shazamme.io/js/plugin/splide/v4/css/splide.min.css'),
        ]).then( () => {
            sender.el
                .find('[data-rel=consultant-list]')
                .addClass('splide')
                .children().first()
                .addClass('splide__track')
                .append('<div class="splide__list">');

            sender.el
                .find('[data-rel=article-consultant]')
                .addClass('splide__slide')
                .css({ 'flex-basis': 'auto' })
                .detach()
                .appendTo(sender.el.find('.splide__list'));

            // Arrows on/off the cards (default: off = sitting just outside the track)
            sender.el
                .find('[data-rel=consultant-list]')
                .toggleClass('arrows-on-card', !!data.config.slideArrowsOnCard);

            if (data.config.showSlideArrows && data.config.slideArrow) {
                // ONE .splide__arrows container with both buttons so Splide centres them
                // vertically and the cards sit centred between them.
                sender.el
                    .find('[data-rel=consultant-list]')
                    .prepend(`
                        <div class="splide__arrows">
                            <button class="splide__arrow splide__arrow--prev" type="button" aria-label="Previous">
                                ${data.config.slideArrow}
                            </button>
                            <button class="splide__arrow splide__arrow--next" type="button" aria-label="Next">
                                ${data.config.slideArrow}
                            </button>
                        </div>
                    `)
            }

            // Clamp to a positive integer, else fall back — never let a bad config value
            // silently collapse the slider to a single card.
            const clampPerPage = (v, d) => {
                const n = parseInt(v, 10);
                return Number.isFinite(n) && n > 0 ? n : d;
            };

            const desktopPerPage = clampPerPage(data.config.slidePerPage, 3);
            const tabletPerPage = clampPerPage(data.config.slidePerPageTablet, Math.min(desktopPerPage, 2));

            let slides = new Splide(sender.el.find('.splide').get(0), {
                type: data.config.slideType || 'slide',
                direction: data.config.slideDirection || 'ltr',
                // Base = desktop count. Actual per-device count is resolved by real
                // viewport width in `breakpoints` below, NOT by data.device (which can
                // be mis-detected and was collapsing the slider to 1).
                perPage: data.config.slideType === 'fade' ? 1 : desktopPerPage,
                breakpoints: data.config.slideType === 'fade' ? {} : {
                    1024: { perPage: Math.min(tabletPerPage, desktopPerPage) },
                    768:  { perPage: Math.min(tabletPerPage, 2) },
                    576:  { perPage: 1 },
                },
                autoplay: data.config.slideAutoPlay,
                interval: parseInt(data.config.slideInterval) * 1000 || 3000,
                pagination: data.config.slideShowPages,
                fixedHeight: data.config.slideHeight || null,
                fixedWidth: data.config.slideWidth || null,
                arrows: data.config.showSlideArrows === undefined ? true : data.config.showSlideArrows,
                gap: `${data.config.slideGap}px`,
            });

            slides.mount();

            return Promise.resolve(slides);
        });
    }

    this.buildHref = (path, query) => {
        return data.inEditor ? `/site/${data.siteId}${path}?preview=true&insitepreview=true&dm_device=desktop${query ? '&' + query : ''}`:`https://${this.uri.hostname}${path}${query ? '?' + query : ''}`;
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

let main = (w) => {
    let slides = null;

    shazamme.fetch(Collection.consultant).then( c => {
        const isMatch = (i, f, v) => {
            if (!v || v.length === 0) return true;

            if (typeof(i.data[f]) === 'string') {
                return v
                    .split(',')
                    .map( x => x.trim() )
                    .some( x => new RegExp(x, 'i').test(i.data[f]) );
            }

            if (typeof(i.data[f]) === 'object') {
                return v
                    .toLowerCase()
                    .split(',')
                    .some( x =>
                        i.data[f]?.find( y => {
                            for (let p in y) {
                                if (y[p].toLowerCase() === x.trim()) return y
                            }
                        })
                    );
            }

            return false;
        }

        const list = c;

        list
            .forEach( i => {
                let uri = new URL(i.data.consultantURL || i.page_item_url);
                let path = uri.pathname.split('/').pop();

                uri.pathname = `/${data.config.consultantPage || 'consultant'}/${path}`;
                i.page_item_url = uri.toString();

                i.data.fullName = `${i.data.firstName || ''}${i.data.lastName || ''}`;
                i.data.businessLocation = JSON.parse(i.data.businessLocation);
                i.data.classification = JSON.parse(i.data.classification);

                for (let x in i.data) {
                    let p = i.data[x];

                    if (typeof(p) === 'string') {
                        if (p.includes("</p>")) {
                            i.data[x] = p.substring(p.indexOf(">") + 1).replace("</p>", '');
                        }
                    }
                }
            });

        let filter = {
            firstName: data.config.filterFirstName,
            businessLocation: data.config.filterBusinessLocation,
            classification: !(data.config.filterClassification === '-') && data.config.filterClassification,
        }

        const show = () => {
            let html = list
                .filter( i => {
                    let ok = true;

                    for (let f in filter) {
                        ok = ok && isMatch(i, f, filter[f]);
                    }

                    return ok;
                })
                .map( i => {
                    switch (data.config.Consultant_Layouts) {
                        case 'layout_2': return ux.slideOutEl(i);
                        case 'layout_3': return ux.flipCardEl(i);
                        case 'layout_4': return ux.popupEl(i);
                        default: return ux.standardEl(i);
                    }
                });


            slides?.destroy();

            if (data.config.Consultant_Layouts === 'layout_1' && data.config.useSlides && list?.length > 0) {
                let container = $('<div />').append(html);

                ux.el.find('[data-rel=consultant-list]')
                    .empty()
                    .append(container)
                    .addClass(ux.setDisplayMode());

                ux.loadSlides().then( s => slides = s );
            } else {
                ux.el.find('[data-rel=consultant-list]')
                    .html(html)
                    .addClass(ux.setDisplayMode());
            }

            ux.el.find('[data-rel=link]')
                .on('click', function() {
                    let e = $(this);
                    let href = e.attr('data-link');
                    let target = e.attr('data-target');

                    if (target === '_blank') {
                        window.open(href);
                    } else {
                        window.location = href;
                    }
                });
        }

        show();

        ux.el.find('[data-rel=show-modal]').on('click', function() {
            let button = $(this);

            ux.el.find('[data-rel=consultant-modal]').remove();
            ux.el.find('[data-rel=consultant-list]')
            .append(
                ux.modalEl(list.find( i => i.data.consultantID === button.attr('data-consultant-id') ))
            );

            ux.el.find('[data-rel=consultant-modal]')
                .show()
                .on('click', function() {
                    $(this).remove();
                });
        });

        ux.el.find('[data-rel=action-accordion]').on('click', function() {
            let f = $(this).parent();
            let accordion = f.parents('[data-rel=article-consultant]').find('[data-accordion]');

            f.toggleClass('active');

            if (f.is('.active')) {
                accordion.css({maxHeight: `${accordion.get(0).scrollHeight}px`});
            } else {
                accordion.css({maxHeight: null});
            }
        });
    });
}

dmAPI.runOnReady('consultantWidget', () => {
    ux.loadScript('https://sdk.shazamme.io/js/shazamme-1.0.3.min.js')
        .then( () => Promise.all([
            shazamme.ready(data.siteId, data.page),
            shazamme.script('https://kit.fontawesome.com/6aeaeb21af.js'),
        ])).then( () => {
            main(shazamme.register('consultant-modern', data));
        });
});

