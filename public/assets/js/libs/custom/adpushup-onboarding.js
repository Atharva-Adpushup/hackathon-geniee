// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {
    (function(ap, w, d) {

        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
            dom: null,
            // Intro modal check
            showIntro: function() {
                // var showIntro = w.localStorage.getItem('showIntro');
                var keyboardValue = false,
                    backdropValue = 'static';

                // if(newSite.addOtherSite) {
                //     keyboardValue = true;
                //     backdropValue = 'null';
                // }

                if(!w.currentUser.sites[(w.currentUser.sites.length-1)].step || newSite.showIntro) {
                    if(newSite.addOtherSite) {
                        $('#addOtherSiteModal').modal({
                            'show': true,
                            'backdrop': backdropValue,
                            'keyboard': keyboardValue
                        });
                    } else {
                        $('#intromodal').modal({
                            'show': true,
                            'backdrop': backdropValue,
                            'keyboard': keyboardValue
                        });
                    }
                    // w.localStorage.setItem('showIntro', true);
                }
            },

            // Analytics Event Emit
            analyticsEventEmitter: function(step, flag) {
                var intercom = intercomObj || null;
                if(flag) {
                    adpushupAnalyticsEvents.emit('analyticsTrack', {
                            eventName: step, 
                            obj: {
                                name: w.currentUser.firstName,
                                email: w.currentUser.email
                            },
                            intercom: intercom
                    });                    
                } else {
                    adpushupAnalyticsEvents.emit('analyticsTrack', {
                            eventName: 'onboarding', 
                            obj: {
                                action: 'click',
                                step: step
                            },
                            intercom: intercom
                    });
                }
            },

            // UI templates for onboarding
            templates: {
                checkIcon: '<i class="fa fa-check"></i>',
                otherPlatformVerification: '<div class="snippet-wrapper"> <span class="clipboard-copy"> Copied ! </span> <textarea class="snippet" id="header-code" readonly placeholder="AdPushup init code comes here.."></textarea> <div class="snippet-btn-wrapper"> <div><button data-toggle="modal" data-target="#sendToDevModal" id="sendToDev" class="snippet-btn apbtn-main-line apbtn-small"> Email Code <i class="fa fa-envelope-o"></i> </button> <button id="clipboardCopy" class="snippet-btn apbtn-main-line apbtn-small"> Copy to clipboard <i class="fa fa-clipboard"></i> </button> </div></div></div><div class="error-message detectap-error"> <span> Please make sure that the header code is present on the the specified URL </span><div id="detectapError"></div></div><div class="row"><button id="apCheck" class="apbtn-main btn-vr btn-wpdt ap-code-verify"> Verify </button> </div>',
                addOtherSite: '<form id="addSiteAltForm"> <div class="row add-site-alt-form"> <div class="col-sm-8 col-sm-offset-2"> <input name="site" class="input-box" type="url" placeholder="Enter Website URL" required> </div><div class="col-sm-6 col-sm-offset-3"> <button type="submit" class="apbtn-main mT-10"> Add Site </button> </div></div></form>',
                dashboardLink: '<div class="text-center" style="margin-top: 15px;"><a style="font-size: 1.2em;" class="link-primary" href="/user/dashboard">Go to dashboard</a></div>',
                addOtherSiteFinish: '<div class="text-center"><h2>Thank you for the information. Our team will contact you soon.</h2></div>'
            },

            // Method to enable element-level DOM manipulation
            manipulateElem: function(container, content, type, duration) {
                switch (type) {
                    case 'htmlFadeIn':
                        $(container).hide().html(content).fadeIn(duration);
                        break;
                }
            },

            anotherSiteModalOpen: function() {
                var modalBox = $('#addOtherSiteModal'),
                    contentBox = $('#add-other-site-modal-content');
                contentBox.html(this.templates.addOtherSiteFinish);
                modalBox.modal({
                    'show': true,
                    'backdrop': 'static',
                    'keyboard': false
                });
                setTimeout(function() {
                    window.location.replace('http://'+window.location.host+'/user/dashboard');
                }, 4000);
            },

            // Setup complete alert
            setupCompleteAlert: function() {
                var ob = this;
                // setTimeout(function() {
                //     $('#skipOauth').hide();
                //     $('#dsBLink').html(ob.templates.dashboardLink);
                // }, 1000);
                if(newSite.addOtherSite) {
                    ob.anotherSiteModalOpen();
                } else {
                    var url = 'http://'+window.location.host+'/thankyou';
                    window.location.replace(url);
                }
                // $('#completionmodal').modal('show');
            },

            // Smooth scrolling method
            scrollTo: function(step, offset, duration) {
                $('html, body').animate({
                    scrollTop: $("#step" + step).offset().top - offset
                }, duration);
            },

            // Init code generation
            generateInitCode: function(siteId) {
                var headerCode = "(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/" + siteId + "/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);";
                $('#header-code').text('<script data-cfasync="false" type="text/javascript">' + headerCode + '</script>');
            },

            // Right trim method
            rTrim: function(string, s) {
                return string ? string.replace(new RegExp(s + '*$'), '') : '';
            },

            // Domanize method
            domanize: function(domain) {
                return domain ? this.rTrim(domain.replace('http://', '').replace('https://', '').replace('www.', ''), '/') : '';
            },

            // Extract Website Name for Email address
            extractWebsiteName: function(domain) {
                var r = /[^.]+/,
                    url = this.domanize(domain),
                    result = url.match(r)[0];
                return result;
            },

            // Show AdPushup verification step
            apVerificationStep: function() {
                $('#platformVerificationContent').html(this.templates.otherPlatformVerification);
                this.generateInitCode(newSite.addedSite.siteId);
            },

            // Show appropriate onboarding step
            showStep: function(step) {
                step = parseInt(step);
                $('#step' + step).addClass('active-step');

                // Set appropriate cms detection check
                if (step >= 3) {
                    this.apVerificationStep();
                }

                // Set ticks for all other steps in UI
                for (var i = 1; i < step; i++) {
                    $('#step' + parseInt(i) + '-check').addClass('fa-check-circle zoomIn');
                }
                if (newSite.addedSite && step >= 2) {
                    this.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + this.domanize(newSite.addedSite.domain) + '</span> has been Added!</h2>', 'htmlFadeIn', 600);
                }
                if (newSite.addedSite && step >= 4) {
                    this.manipulateElem('#non-admin-email', '*Email* - ' + this.extractWebsiteName(newSite.addedSite.domain) + '@adpushup.com', 'htmlFadeIn', 600);
                }
                if (step > 3) {
                    $('#apCheck').html('Verified '+this.templates.checkIcon);
                }
                if (step > 4) {
                    $('#adsenseoauth').html('Google Adsense Connected '+this.templates.checkIcon);
                }

                this.scrollTo(step, 90, 1000);

                switch (step) {
                    case 1:
                        $('#platformVerificationContent').html('<p class="text-center mT-10"><img class="platform-graphic" src="/assets/images/platform.png" width="150" height="150"/></p>');
                        break;
                    // case 6:
                    //     this.setupCompleteAlert();
                    //     break;
                }
            },

            // Goto next onboarding step
            nextStep: function(to, from, duration) {
                var ob = this;
                $('#step' + from + '-check').addClass('fa-check-circle zoomIn');
                setTimeout(function() {
                    $('#step' + to).addClass('active-step');
                    $('#step' + from).removeClass('active-step');
                    ob.scrollTo(to, 100, 600);
                }, duration);
            },

            // Save site data
            saveSiteModel: function(site, url, siteId, btn) {
                var ob = this;
                $.post('/data/saveSite', {
                    site: url,
                    siteId: siteId,
                    step: 2
                }, function(res) {
                    if (res.success) {
                        newSite.addedSite = {
                            domain: res.url,
                            siteId: res.siteId
                        };
                        $('.add-site-alt-form').hide();
                        $('#addSiteStr').fadeIn();
                        ob.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + site + '</span> has been Added!</h2>', 'htmlFadeIn', 600);
                        ob.nextStep(3, 2, 1000);
                        ob.apVerificationStep();
                        ob.manipulateElem('#non-admin-email', '*Email* - ' + ob.extractWebsiteName(newSite.addedSite.domain) + '@adpushup.com', 'htmlFadeIn', 600);
                        return true;
                    } else {
                        ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                        $(btn).html('Add ' + site + ' ?').prop('disabled', false);
                        return false;
                    }
                });
            },

            // Add a new site (default)
            // site : http
            // url : without http
            addSite: function(site, url, btn, flag) {
                var ob = this,
                    response = true;
                if(!flag) {
                    $(btn).html('Adding ' + site + ' ...').prop('disabled', true);
                }
                if(newSite.addOtherSite || flag) {
                    var siteAlreadyAdded = function() {
                        for(var i in w.currentUser.sites) {
                            if(w.currentUser.sites[i].domain === site+'/') {
                                return true;
                            }
                        }
                        return false;
                    }

                    if(siteAlreadyAdded()) {
                        // console.log('if');
                        ap.apAlert(ob.domanize(url)+' has already been added! Please add a different site.', '#apdetect', 'inverted', 'slideDown');
                        // $(btn).html('Add Site').prop('disabled', false);
                        response = false;
                    } else {
                        $.ajax({
                            url: '/user/addSite',
                            type: 'POST',
                            data: {site: url},
                            async: false,
                            success: function(res) {
                                if(res.success) {
                                    if(!newSite.addOtherSite) {
                                        var status = 66;
                                        ob.updateCrmDealStatus(status);
                                        ob.analyticsEventEmitter('Added Site');                                    
                                    }
                                    $(btn).fadeOut(100);
                                    ob.saveSiteModel(site, url, res.siteId, btn);
                                    response = true;
                                } else {
                                    ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                                    $(btn).html('Lets Add ' + site + ' ?').prop('disabled', false);
                                    response = false;
                                }
                            }
                        });
                    }
                }
                else {
                    // console.log("Inside flag");
                    this.saveSiteModel(site, url, newSite.viewObjects.unSavedSiteId, btn);
                }
                return response;
            },

            // Adpushup detection success
            detectApSuccess: function(ob, el) {
                ap.apAlert('AdPushup has been successfully detected on the website!', '#apdetect', 'success', 'slideDown');
                if(newSite.addOtherSite) {
                    $(el).html('Setup Complete '+ob.templates.checkIcon).after(ob.templates.dashboardLink);
                    ob.nextStep(6, 3, 1000);
                }
                else {
                    $(el).html('Verified '+ob.templates.checkIcon);
                    ob.nextStep(4, 3, 1000);
                }
            },

            // AdPushup detection on site
            detectAp: function(addedSite, el) {
                var ob = this;
                $.get('/proxy/detectap', {
                    'url': addedSite
                }, function(res) {
                    if (res.ap) {
                        $.post('/user/setSiteStep', {
                            siteId: newSite.addedSite.siteId,
                            step: newSite.addOtherSite ? 5 : 3
                        }, function(response) {
                            if (response.success) {
                                if(!newSite.addOtherSite)
                                {
                                    var status = 67;
                                    ob.updateCrmDealStatus(status);
                                    ob.analyticsEventEmitter('Added AP Code');
                                }
                                ob.detectApSuccess(ob, el);
                            } else {
                                alert('Some error occurred!');
                            }
                        });
                    } else {
                        ap.apAlert('AdPushup was not detected on the website! Please make sure that the header code is present on the the specified URL', '#apdetect', 'inverted', 'slideDown');
                        // $('.detectap-error').fadeIn();
                        $(el).html('Verify').prop('disabled', false);
                    }
                });
            },

            // Adsense OAuth window trigger
            openOauthWindow: function() {
                var x = screen.width / 2 - 700 / 2;
                var y = screen.height / 2 - 450 / 2;
                window.open("/user/requestOauth", 'Oauth Request', 'height=485,width=700,left=' + x + ',top=' + y);
            },

            // Copy init code to clipboard
            copyInitCode: function() {
                $('.clipboard-copy').fadeIn();
                setTimeout(function() {
                    $('.clipboard-copy').fadeOut();
                }, 1500);
                $('#header-code').select();
                d.execCommand('copy');
            },

            // Send code to developer
            sendCodeToDev: function(data) {
                $('#sendCodeSubmit').prop('disabled', true).html('Sending...');
                $.post('/user/sendCode', data, function(res) {
                    if (res.success) {
                        $('#sendCodeSubmit').css('opacity', 1).html('Code sent successfully!');
                        setTimeout(function() {
                            $('#sendToDevModal').modal('toggle');
                            $('#sendCodeSubmit').prop('disabled', false).html('Send');
                        }, 2000);
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Set non-admin access check
            nonAdminAccess: function(btn) {
                var ob = this;
                btn.html('Saving...').prop('disabled', true);
                $.post('/user/setSiteStep', {
                    siteId: newSite.addedSite.siteId,
                    step: 5
                }, function(response) {
                    if (response.success) {
                        if(!newSite.addOtherSite)
                        {
                            var status = 69;
                            ob.updateCrmDealStatus(status);
                            ob.analyticsEventEmitter('Non-Admin Access');
                        }
                        ob.nextStep(6, 5, 1000);
                        // btn.html('Setup Complete '+ob.templates.checkIcon);
                        // ob.setupCompleteAlert();
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Check if new site addition card is to be shown
            showAddOtherSite: function() {
                if(newSite.addOtherSite) {
                    $('#addSiteStr').html(this.templates.addOtherSite);
                    // $('#step2').nextAll("div[id^='step']").hide();
                }
            },

            // Attach oauth post message hook
            oauthHook: function(event) {
                var ob = this;
                try {
                    JSON.parse(event.data);
                }
                catch(e) {
                    return false;
                }
                var adsense = JSON.parse(event.data);
                if(adsense.data) {
                    //$("div[id^='step']").last().removeClass('active-step');
                    $('#adsenseoauth').html('Google Adsense Connected '+ap.onboarding.templates.checkIcon).prop('disabled', true);
                    $.post('/user/setSiteStep', {
                        siteId: newSite.addedSite.siteId,
                        step: 4
                    }, function(response) {
                        if (response.success) {
                            if(!newSite.addOtherSite)
                            {
                                var status = 68;
                                ob.updateCrmDealStatus(status);
                                ob.analyticsEventEmitter('Added OAuth');
                            }
                            ob.nextStep(5, 4, 1000);
                            // ap.onboarding.setupCompleteAlert();
                        } else {
                            alert('Some error occurred!');
                        }
                    });
                }
                else {
                    ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                }
            },

            // Method to skip adsense oauth step
            skipOauth: function() {
                var ob = this;
                setTimeout(function(){$('#adsenseoauth').prop('disabled', true);}, 1000);
                $.post('/user/setSiteStep', {
                    siteId: newSite.addedSite.siteId,
                    step: 5,
                }, function(response) {
                    if (response.success) {
                        $('#step4').removeClass('active-step');
                        ob.nextStep(6, 5, 1000);
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Initialise onboarding
            init: function() {
                this.showIntro();
                this.showStep(newSite.defaultStep);
                // $('#completionmodal').modal('show');
                //this.showAddOtherSite();
            },

            // Update Crm Deal Status | Pipeline
            updateCrmDealStatus: function(status) {
                $.post('/data/updateCrmDealStatus', {
                    status: status
                });
            },

            // Update Crm Deal
            updateCrmDeal: function(data, type) {
                $.post('/data/updateCrmDeal', {
                    type: type,
                    data: data
                });
            },

            // Service selection
            serviceSelection: function(data, errorBox) {
                var url = 'http://'+window.location.host+'/thankyou',
                    servicesString = data.selectedServices.join(' | '),
                    dataToSend = {
                        servicesString: servicesString,
                        pwc: data.pwc
                    },
                    ob = this;
                
                $.post('/user/setSiteServices', {
                    'servicesString': servicesString,
                    'newSiteUnSavedDomain': newSite.viewObjects.origUnSavedDomain,
                    'newSiteSiteId': newSite.viewObjects.unSavedSiteId,
                    'newSiteDomanizedUrl': newSite.viewObjects.domanizedUrl,
                    'modeOfReach': data.pwc
                }, function(response) {
                    if (response.success) {
                        if(!newSite.addOtherSite)
                        {
                            var status = 65;
                            ob.updateCrmDealStatus(status);
                            ob.updateCrmDeal(dataToSend, 'services');
                            ob.analyticsEventEmitter('Selected Solution');
                        }
                        if (data.selectedServices.length > 1) {
                            window.location.replace(url);
                        } else if (data.selectedServices.length == 1) {
                            if (data.selectedServices[0] == 'only-adsense') {
                                $('#intromodal').modal('hide');
                                $('#completionmodal').modal('show');
                                ob.nextStep(2, 1, 1000);
                            } else {
                                window.location.replace(url);
                            }
                        }
                    } else {
                        errorBox.text('Some error has occurred');
                        return;
                    }
                });
                // }
            },

            // Adding user another site
            addAnotherSite: function(newSiteByUser, btn) {
                var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
                if(!newSiteByUser || !re.test(newSiteByUser)) {
                    ap.apAlert('Please add a valid website', '#apdetect', 'inverted', 'slideDown');
                    return false;
                }
                var response = this.addSite(this.domanize(newSiteByUser), newSiteByUser, btn, true);
                if(response) {
                    $(btn).fadeOut(300);
                    this.nextStep(3, 2, 1000);
                }
            },

            // Convert Ad Code
            base64_encode: function (data) {
                try {
                    if (window.btoa) {
                        return window.btoa(data);
                    }

                    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                        ac = 0,
                        enc = '',
                        tmp_arr = [];

                    if (!data) {
                        return data;
                    }

                    do {
                        o1 = data.charCodeAt(i++);
                        o2 = data.charCodeAt(i++);
                        o3 = data.charCodeAt(i++);

                        bits = o1 << 16 | o2 << 8 | o3;

                        h1 = bits >> 18 & 0x3f;
                        h2 = bits >> 12 & 0x3f;
                        h3 = bits >> 6 & 0x3f;
                        h4 = bits & 0x3f;

                        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                    } while (i < data.length);

                    enc = tmp_arr.join('');

                    var r = data.length % 3;

                    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
                }
                catch(err) {
                    alert("Unable to transform, Please contact our support team.");
                    return false;
                }
            },
            getAdcode: function (data) {
                var encodedAd = this.base64_encode(data);

                if(!encodedAd){
                    return false;
                }

                var newAdCode = [
                    '<ins class="adPushupAds" data-ver="2" data-siteId="' + newSite.addedSite.siteId + '" data-ac="' + encodedAd + '"><\/ins>' +
                    '<script data-cfasync="false" type="text/javascript">(function (w, d) { for (var i = 0, j = d.getElementsByTagName(\"ins\"), k = j[i]; i < j.length; k = j[++i]){ if(k.className == \"adPushupAds\" && k.getAttribute(\"data-push\") != \"1\") { ((w.adpushup = w.adpushup || {}).control = (w.adpushup.control || [])).push(k); k.setAttribute(\"data-push\", \"1\"); (((w.adpushup = w.adpushup || {}).timeline = (w.adpushup.timeline || {})).tl_cntPsh = (w.adpushup.timeline.tl_cntPsh || [])).push(+new Date); } } var s = document.createElement(\"script\"); s.type = \"text\/javascript\"; s.async = true; s.src = \"\/\/static.adpushup.com\/js\/adpushupadsv2.js\"; (d.getElementsByTagName(\"head\")[0]||d.getElementsByTagName(\"body\")[0]).appendChild(s); })(window, document);</script>',
                ];
                return newAdCode.join('\n');
            },
            isNonEmpty: function (val) {
                if(!val || typeof val == "undefined" || val == null || (val.trim && val.trim() == ""))
                    return false
                return true
            },
            runCode: function(data) {
                this.dom = $("<div>" + data + "</div>");
            },
            isCodeAdsense: function(){
                return this.dom.html().indexOf("pagead2.googlesyndication.com") != -1
            },
            isSyncAdsense: function(){
                var script = this.dom.find("script[src]"),
                    scriptTag = this.dom.find("script:not([src])");
                if(script.length == 1 && scriptTag.length == 1){
                    script = script.get(0);
                    scriptTag = scriptTag.html();
                    return script.src.trim().indexOf("pagead2.googlesyndication.com/pagead/show_ads.js") > -1 && scriptTag.indexOf('google_ad_client') > -1 && scriptTag.indexOf('google_ad_slot') > -1
                }
                return false;
            },
            isOldAdsenseCode: function(){
                var script = this.dom.find("script:not([src])");
                if(script.length == 1){
                    script = script.html();
                    return (script.indexOf('google_color_border') > -1 && script.indexOf('google_color_bg') > -1&& script.indexOf('google_color_link') > -1)
                }
                return false;
            },
            isAsyncCode: function(){
                var scriptsWithoutSrc = this.dom.find("script:not([src])"),
                    scriptsWithSrc = this.dom.find("script[src]"),
                    ins = this.dom.find("ins.adsbygoogle");
                if(scriptsWithoutSrc.length == scriptsWithSrc.length == ins.length == 1){
                    scriptsWithSrc = scriptsWithSrc.get(0);
                    return (scriptsWithSrc.src.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') > -1 && this.isNonEmpty(ins.attr("data-ad-client")) && this.isNonEmpty(ins.attr("data-ad-slot")))
                }
                return false;
            },
            getAdsenseAsyncCode: function(adConfig){
                var adCode = [];
                adCode.push('<scr' + 'ipt async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></scr' + 'ipt>');
                adCode.push('<ins class="adsbygoogle" style="display:inline-block;width:' + adConfig.width + 'px;height:' + adConfig.height + 'px" data-ad-client="' + adConfig.pubid + '" data-ad-slot="' + adConfig.adslot + '"></ins>');
                adCode.push('<scr' + 'ipt> (adsbygoogle = window.adsbygoogle || []).push({}); </scr' + 'ipt>');
                return adCode.join("\n");
            },
            changeSyncToAsync: function(){
                var scriptsWithoutSrc = this.dom.find("script:not([src])");
                if(scriptsWithoutSrc.length == 1){
                    $.globalEval(scriptsWithoutSrc.get(0).textContent);
                    if(google_ad_width && google_ad_height && google_ad_slot && google_ad_client)
                        return this.getAdsenseAsyncCode({width:google_ad_width,height:google_ad_height,pubid:google_ad_client,adslot:google_ad_slot})
                }
                return false;
            },
            toggleTransform: function (data) {
                this.runCode(data);
                if(!this.isCodeAdsense()){
                    return {
                        error: 1,
                        message: "We only support Adsense code as control."
                    };
                } else if(this.isAsyncCode()) {
                    var code = this.getAdcode(data);
                    return {
                        error: 0,
                        code: code
                    }
                } else if(this.isOldAdsenseCode()) {
                    return { 
                        error: 1,
                        message: "We don't support Old Adsense code, please use async adsense code."
                    };
                } else if(this.isSyncAdsense()){
                    var adCode = this.changeSyncToAsync();
                    return !adCode ? {error: 1, "message": "There was some issue in control conversion plz contact support"} : {error: 0, code: adCode};
                } else {
                    return {
                        error: 1,
                        message: "Some error occurred."
                    }
                }
            },
            // Code Coversion Finish
            codeCoversionProceed: function() {
                var ob = this,
                    completeOnboarding = true;

                if(newSite.addOtherSite) {
                    completeOnboarding = false;
                }

                $.post('/user/setSiteStep', {
                    siteId: newSite.addedSite.siteId,
                    step: 6,
                    completeOnboarding: completeOnboarding
                }, function(response) {
                    if (response.success) {
                        if(!newSite.addOtherSite)
                        {
                            var status = 70;
                            ob.updateCrmDealStatus(status);
                            ob.analyticsEventEmitter('Code Conversion');
                            ob.analyticsEventEmitter('App-signup-second-stage', 1);
                        }
                        ob.setupCompleteAlert();
                    } else {
                        ap.apAlert('Some error has occurred!', '#apdetect', 'inverted', 'slideDown');
                    }
                });
            },

            // Site addition modal inside dashboard
            addOtherSiteFromDashboard: function(selectedServices, site, url) {
                var ob = this,
                    errorBox = $("#addOtherSiteModal .error-message-box");
                if (selectedServices.length > 1) {
                    ob.anotherSiteModalOpen();
                } else if (selectedServices.length == 1) {
                    if (selectedServices[0] == 'only-adsense') {
                        var response = ob.addSite(url, site, null, true);
                        if(response) {
                            $('#addOtherSiteModal').modal('hide');
                            $('#apdetect').fadeOut();
                            ob.nextStep(3, 2, 1000);
                        } else {
                            errorBox.html('Site already added. Please enter another site');
                        }
                    } else {
                        ob.anotherSiteModalOpen();
                    }
                }
            },
            
            // Skipping ap verficiation
            skipApVerification: function() {
                var ob = this;
                $.post('/user/setSiteStep', {
                    siteId: newSite.addedSite.siteId,
                    step: newSite.addOtherSite ? 5 : 3
                }, function(response) {
                    if (response.success) {
                        if(!newSite.addOtherSite) {
                            var status = 67;
                            ob.updateCrmDealStatus(status);
                            ob.analyticsEventEmitter('Added AP Code');
                        }
                        if(newSite.addOtherSite) {
                            ob.nextStep(6, 3, 1000);
                        } else {
                            ob.nextStep(4, 3, 1000);
                        }
                    } else {
                        alert('Some error occurred!');
                    }
                });
            }
        };
        ap.onboarding.init();

        // Trigger to update Reach Mode value
        $('#pwc').on('change', function(e) {
            var pwcBox = $('#pwc :selected'),
                pwcInputBox = $('#pwc-value'),
                errorBox = $('.error-message-box');

            errorBox.text('');
                        
            if(pwcBox.val() == 'email') {
                pwcInputBox.val(w.currentUser.email);
                // pwcInputBox.attr('readonly', true);
            } else {
                // pwcInputBox.attr('readonly', false);
                pwcInputBox.val('');
            }
        });

        // Trigger to check user ticked options
        $('#onboarding-services-form').submit(function(e) {
            e.preventDefault();
            var selectedServices = [],
                errorBox = $('.error-message-box');
                pwcBox = $('#pwc :selected'),
                pwcBoxValue = pwcBox.val(),
                pwcInputBox = $('#pwc-value'),
                pwcInputBoxValue = pwcInputBox.val().trim();

            $('.checkbox-custom:checked').each(function() {
                selectedServices.push($(this).attr('name'));
            });
            if(!pwcInputBoxValue || pwcInputBoxValue == '') {
                errorBox.text('Please enter preferred mode of reach');
                return;                
            }
            if(selectedServices.length < 1) {
                errorBox.text('Please select atleast one Service');
                return;
            } else {
                errorBox.text('');
                var pwcFinalValue = pwcBoxValue + '-' + pwcInputBoxValue,
                    data = {
                        selectedServices: selectedServices,
                        pwc: pwcFinalValue
                    };
                ap.onboarding.serviceSelection(data, errorBox);
            }
        });

        $('#onboarding-inner-services-form').submit(function(e) {
            e.preventDefault();
            var selectedServices = [],
                errorBox = $('.error-message-box'),
                otherSite = $('#add-other-site').val();
            $('.checkbox-custom:checked').each(function() {
                selectedServices.push($(this).attr('name'));
            });

            if(selectedServices.length < 1) {
                errorBox.text('Please select atleast one Service');
                return;
            } else {
                errorBox.text('');
                var site = otherSite.replace(/\/$/, ""),
                    url = site.replace(/.*?:\/\//g, "");
                ap.onboarding.addOtherSiteFromDashboard(selectedServices, site, url);
            }           
        })

        // OAuth post message hook trigger
        window.addEventListener('message', ap.onboarding.oauthHook, false);

        // Trigger to add user's unsaved site
        $('.add-user-site').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            ap.onboarding.addSite(userUnsavedSite, url, $(this), true);
            $('#another-site-box').fadeOut('200');
        });

        // Trigger to add user's another site fadeOut / fadeIn
        $('#add-another-site').click(function(e) {
            e.preventDefault();
            $('#addSiteStr').fadeOut(100);
            $('#another-site-box').fadeIn(500);
        });

        // Trigger to add user's another site processing from onboarding step
        $('#add-another-site-submit').click(function(e) {
            e.preventDefault();
            var newSiteByUser = $('#another-site-input').val(),
                btn = $('#another-site-box');
            ap.onboarding.addAnotherSite(newSiteByUser, btn);
        });

        // Trigger to detect ap
        $(d).on('click', '#apCheck', function() {
            $(this).html('Verifying...').prop('disabled', true);
            ap.onboarding.detectAp(newSite.addedSite.domain, $(this));
        });

        // Trigger to get adsense Oauth
        $('#adsenseoauth').click(function() {
            ap.onboarding.openOauthWindow();
        });

        // Trigger to set non-admin access check
        $('.adsensenonadmin').click(function() {
            ap.onboarding.nonAdminAccess($(this));
        });

        // Tigger to copy init code to clipboard
        $(d).on('click', '#clipboardCopy, #header-code', function() {
            ap.onboarding.copyInitCode();
        });

        // Send Adpushup header code to developer
        $('#sendCodeForm').submit(function(e) {
            e.preventDefault();
            $('#headerCodeInput').val($('#header-code').val());
            var data = $(this).serialize();
            ap.onboarding.sendCodeToDev(data);
        });

        // Trigger to skip oauth
        $('#skipOauth').on('click', function() {
            ap.onboarding.skipOauth();
        });

        // Trigger to add another site
        $('#addSiteAltForm').submit(function(e) {
            e.preventDefault();
            var newsite = $(this).serializeArray(),
                url = newsite[0].value.replace(/\/$/, "");
                site = url.replace(/.*?:\/\//g, ""),
                btn = $('#addSiteAltForm button');
            ap.onboarding.addSite(site, url, btn);
        });

        // Trigger code conversion
        $('#code-conversion-button').click(function(e) {
            var inputBox = $('#code-conversion-box'),
                inputBoxValue = inputBox.val(),
                convertedCode;
            if(!inputBoxValue || inputBoxValue == '') {
                ap.apAlert('Please enter control ad code!', '#apdetect', 'inverted', 'slideDown');
                return;
            }
            resultObject = ap.onboarding.toggleTransform(inputBoxValue);
            if(resultObject.error == 0) {
                inputBox.val(resultObject.code);                
            } else {
                ap.apAlert(resultObject.message, '#apdetect', 'inverted', 'slideDown');
            }
            // convertedCode = ap.onboarding.getAdcode(inputBoxValue);
            // if(convertedCode) {
            //     // e.target.val('Convert Another');
            //     inputBox.val(convertedCode);
            // } else {
            //     ap.apAlert('Some error has occurred!', '#apdetect', 'inverted', 'slideDown');
            // }
        });

        // Trigger code conversion finish
        $('#code-conversion-finish').click(function(e) {
            e.preventDefault();
            ap.onboarding.codeCoversionProceed();
        });

        // Skip AP code verify
        $('#skip-ap-verification').click(function(e) {
            ap.onboarding.skipApVerification();
        });
    })(adpushup, window, document);
});
