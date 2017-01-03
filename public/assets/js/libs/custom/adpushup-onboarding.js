// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {
    (function(ap, w, d) {

        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
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
                                name: window.currentUser.firstName,
                                email: window.currentUser.email
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
                var headerCode = '!function(w,d){var adp,config,tL,siteId=' + siteId + ',json=null,apjQuery=null;(w.adpushup=w.adpushup||{}).configure={config:{e3Called:!1,jqLoaded:0,initVersion:1.1.1,apLoaded:0,e3Loaded:0,rand:Math.random(),pageUrl:w.location.href,referrer:d.referrer,cookieSettings:{uuidAppendStr:"UUID_",uuidKey:"apSiteUuid",cookieExpiryTime:730}}},adp=w.adpushup,config=adp.configure.config,tL=adp.timeline={},tL.tl_adpStart=+new Date,adp.utils={uniqueId:function(appendNum){var r,d=+new Date,appendMe=!appendNum||"number"==typeof appendNum&&0>appendNum?Number(1).toString(16):Number(appendNum).toString(16);return appendMe=("0000000".substr(0,8-appendMe.length)+appendMe).toUpperCase(),appendMe+"-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){return r=((d=Math.floor(d/16))+16*Math.random())%16|0,("x"===c?r:3&r|8).toString(16)})},loadScript:function(src,sC,fC){var s=d.createElement("script");s.src=src,s.type="text/javascript",s.async=!0,s.onerror=function(){"function"==typeof fC&&fC.call()},"object"==typeof d.attachEvent?s.onreadystatechange=function(){"loaded"===s.readyState||"complete"===s.readyState?s.onreadystatechange=null:null}:s.onload=function(){"function"==typeof sC?sC.call():null},(d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s)},createCookie:function(key,value,expiryDays,domain){var msDays,expires="",date=new Date;expiryDays&&(msDays=24*expiryDays*60*60*1e3,date.setTime(date.getTime()+msDays),expires="; expires="+date.toUTCString()+"; max-age="+msDays),document.cookie=key+"="+value+expires+"; path=/"+(domain?"; domain="+domain:"")},readCookie:function(key){var cookie,i,keyEQ=key+"=",cookieArr=document.cookie.split(";");for(i=0;i<cookieArr.length;i++){for(cookie=cookieArr[i];" "===cookie.charAt(0);)cookie=cookie.substring(1,cookie.length);if(0===cookie.indexOf(keyEQ))return cookie.substring(keyEQ.length,cookie.length)}},eraseCookie:function(key){this.createCookie(key,"",-1)}},adp.configure.push=function(obj){var key,cookieStr,c=this.config,ts=+new Date,cookie=c.cookie;for(key in obj)c[key]=obj[key];if(!c.e3Called&&c.siteId&&c.pageGroup&&c.packetId&&cookie){for(key in cookie)cookieStr="&"+key+"="+cookie[key];adp.utils.loadScript("//e3.adpushup.com/E3WebService/e3?ver=2&callback=e3Callback&siteId="+c.siteId+"&url="+encodeURIComponent(c.pageUrl)+"&pageGroup="+c.pageGroup+"&referrer="+encodeURIComponent(d.referrer)+"&cms="+c.cms+(c.pluginVer?"&pluginVer="+c.pluginVer:"")+"&rand="+c.rand+"&packetId="+c.packetId+cookieStr+"&_="+ts),c.e3Called=!0,tL.tl_e3Requested=ts,init()}adp.ap&&"function"==typeof adp.ap.configure&&adp.ap.configure(obj)};function init(){w.jQuery&&w.jQuery.fn.jquery.match(/^1.11./)&&!config.jqLoaded&&(tL.tl_jqLoaded=+new Date)&&(config.jqLoaded=1)&&(apjQuery=w.jQuery),"function"==typeof adp.runAp&&!config.apLoaded&&(tL.tl_apLoaded=+new Date)&&(config.apLoaded=1),!adp.configure.config.apRun&&adp.configure.config.pageGroup&&apjQuery&&"function"==typeof adp.runAp&&(adp.configure.push({apRun:!0}),adp.runAp(apjQuery)),!adp.configure.config.e3Run&&w.apjQuery&&"undefined"!=typeof adp.ap&&"function"==typeof adp.ap.triggerAdpushup&&json&&"undefined"!=typeof json&&(adp.configure.push({e3Run:!0}),adp.ap.triggerAdpushup(json))}w.e3Callback=function(){arguments[0]&&!config.e3Loaded&&(tL.tl_e3Loaded=+new Date)&&(config.e3Loaded=1),json=arguments[0],init()};function jqCallback(){config.jqLoaded?null:init(),w.jQuery&&w.jQuery.noConflict(!0)&&(w.jQuery=w.jQuery?w.jQuery:apjQuery)&&(w.$=w.$?w.$:w.jQuery)}adp.utils.loadScript("//optimize.adpushup.com/"+siteId+"/apv2.js",init),tL.tl_apRequested=+new Date,adp.utils.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",jqCallback),adp.utils.loadScript("//static.adpushup.com/js/adpushupadsv2.js"),tL.tl_jqRequested=+new Date,function(adp,utils){var config=adp.configure.config.cookieSettings,cookie={},cookieVal=utils.readCookie(config.uuidKey);cookieVal||(cookieVal=config.uuidAppendStr+utils.uniqueId(siteId),utils.createCookie(config.uuidKey,cookieVal,config.cookieExpiryTime,window.location.hostname)),cookie[config.uuidKey]=cookieVal,adp.configure.push({cookie:cookie})}(adp,adp.utils);adp.configure.push({siteId:siteId,packetId:adp.utils.uniqueId(siteId),siteDomain:w.location.hostname || "",cms:"custom"});}(window,document);';
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

                this.scrollTo(step, 0, 1000);

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
                    ob.scrollTo(to, 120, 600);
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
            addSite: function(site, url, btn, flag) {
                var ob = this,
                    response = true;
                if(!flag) {
                    $(btn).html('Adding ' + site + ' ...').prop('disabled', true);
                }
                if(newSite.addOtherSite || flag) {
                    // console.log("Inside newSite");
                    var siteAlreadyAdded = function() {
                        for(var i in w.currentUser.sites) {
                            // console.log(w.currentUser.sites[i].domain);
                            // console.log(site);
                            // console.log(url);
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
                    //     $.post('/user/addSite', {
                    //         site: url
                    //     }, function(res) {
                    //         if(res.success) {
                    //             if(!newSite.addOtherSite)
                    //             {
                    //                 var status = 66;
                    //                 ob.updateCrmDealStatus(status);
                    //                 ob.analyticsEventEmitter('Added Site');                                    
                    //             }
                    //             $(btn).fadeOut(100);
                    //             ob.saveSiteModel(site, url, res.siteId, btn);
                    //             return true;
                    //         }
                    //         else {
                    //             ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                    //             $(btn).html('Lets Add ' + site + ' ?').prop('disabled', false);
                    //             return false;
                    //         }
                    //     });
                    // }
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
                //this.showAddOtherSite();
            },

            // Update Crm Deal Status | Pipeline
            updateCrmDealStatus: function(status) {
                $.post('/data/updateCrmDealStatus', {
                    status: status
                });
            },

            // Service selection
            serviceSelection: function(selectedServices, errorBox) {
                var url = 'http://'+window.location.host+'/thankyou',
                    servicesString = selectedServices.join(' | '),
                    ob = this;
                
                // if(newSite.addOtherSite) {
                //         if (selectedServices.length > 1) {
                //             // Show pop up
                //         } else if (selectedServices.length == 1) {
                //             if (selectedServices[0] == 'only-adsense') {
                //                 w.localStorage.setItem('selectedServices', selectedServices);
                //                 $('#intromodal').modal('hide');
                //                 ob.nextStep(2, 1, 1000);
                //             } else {
                //                 // Show pop up
                //             }
                //         }
                // } else {
                $.post('/user/setSiteServices', {
                    'servicesString': servicesString,
                    'newSiteUnSavedDomain': newSite.viewObjects.origUnSavedDomain,
                    'newSiteSiteId': newSite.viewObjects.unSavedSiteId,
                    'newSiteDomanizedUrl': newSite.viewObjects.domanizedUrl,
                }, function(response) {
                    if (response.success) {
                        if (selectedServices.length > 1) {
                            window.location.replace(url);
                        } else if (selectedServices.length == 1) {
                            if (selectedServices[0] == 'only-adsense') {
                                if(!newSite.addOtherSite)
                                {
                                    var status = 65;
                                    ob.updateCrmDealStatus(status);
                                    ob.analyticsEventEmitter('Selected Solution');
                                }
                                $('#intromodal').modal('hide');
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
                var response = this.addSite(newSiteByUser, this.domanize(newSiteByUser), btn, true);
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
            }
        };
        ap.onboarding.init();

        // Trigger to check user ticked options
        $('#onboarding-services-form').submit(function(e) {
            e.preventDefault();
            var selectedServices = [],
                errorBox = $('.error-message-box');
            $('.checkbox-custom:checked').each(function() {
                selectedServices.push($(this).attr('name'));
            });

            if(selectedServices.length < 1) {
                errorBox.text('Please select atleast one Service');
                return;
            } else {
                errorBox.text('');
                ap.onboarding.serviceSelection(selectedServices, errorBox);
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
                var url = otherSite.replace(/\/$/, ""),
                    site = url.replace(/.*?:\/\//g, "");
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

        // Trigger to add user's another site processing
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
            convertedCode = ap.onboarding.getAdcode(inputBoxValue);
            if(convertedCode) {
                // e.target.val('Convert Another');
                inputBox.val(convertedCode);
            } else {
                ap.apAlert('Some error has occurred!', '#apdetect', 'inverted', 'slideDown');
            }      
        });

        // Trigger code conversion finish
        $('#code-conversion-finish').click(function(e) {
            e.preventDefault();
            ap.onboarding.codeCoversionProceed();
        });
    })(adpushup, window, document);
});
