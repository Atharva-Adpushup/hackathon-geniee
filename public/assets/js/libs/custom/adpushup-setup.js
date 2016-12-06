// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {
    (function(ap, w) {

        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
            detectedPagegroups: [],
            cmsAdded: '',

            // Intro modal check
            showIntro: function() {
                var showIntro = w.localStorage.getItem('showIntro');
                if(!showIntro && newSite.showIntro) {
                    $('#intromodal').modal('show');
                    w.localStorage.setItem('showIntro', true);
                }
            },

            // UI templates for onboarding
            templates: {
                checkIcon: '<i class="fa fa-check"></i>',
                otherPlatformVerification: ' <p class="text-medium text-center" style="margin-top: -10px;">Copy and paste this snippet in the &lt;HEAD&gt; section of your website </p><div class="snippet-wrapper"> <span class="clipboard-copy"> Copied ! </span> <textarea class="snippet" id="header-code" readonly placeholder="AdPushup init code comes here.."></textarea> <div class="snippet-btn-wrapper"> <div> <button id="clipboardCopy" class="snippet-btn apbtn-main-line apbtn-small"> Copy to clipboard <i class="fa fa-clipboard"></i> </button> </div></div></div><div class="error-message detectap-error"> <p> Please make sure that the header code is present on the the specified URL </p><div id="detectapError"></div></div><div class="row"> <div class="col-sm-4 col-sm-offset-4"> <button id="apCheck" class="apbtn-main btn-vr btn-wpdt"> Verify </button> </div></div>',
                wordpressPlatformVerification: '<p class="text-medium text-center">Please install the AdPushup JavaScript snippet via our Wordpress Plugin.</p><div class="row"><div class="col-sm-4 col-sm-offset-4"><a id="wp-plugin-link" href="https://wordpress.org/plugins/adpushup/" target="_blank" class="apbtn-main-line ob-bigbtn"><i class="fa fa-wordpress"></i> Install Plugin</a></div></div><p class="text-medium-nm text-center">After you install plugin, please configure Site ID - <strong>1</strong> by going to <strong>Wordpress</strong> &gt; <strong>Settings</strong> &gt; <strong>Adpushup Settings</strong></p><div class="row"><div class="col-sm-4 col-sm-offset-4"><button id="apCheck" class="apbtn-main apbtn-cmsver">I\'ve done this</button></div></div>',
                addOtherSite: '<form id="addSiteAltForm"> <div class="row add-site-alt-form"> <div class="col-sm-8 col-sm-offset-2"> <input name="site" class="input-box" type="url" placeholder="Enter Website URL" required> </div><div class="col-sm-6 col-sm-offset-3"> <button type="submit" class="apbtn-main mT-10"> Add Site </button> </div></div></form>',
                dashboardLink: '<div class="text-center mT-10"><a class="link-primary" href="/user/dashboard">Go to dashboard</a></div>'
            },

            // Set active cms button
            setActiveCms: function(cms) {
                if(cms === 'wordpress') {
                     return '<div class="row"><div class="col-sm-3 col-sm-offset-3"><button class="apbtn-main ob-bigbtn" id="setCms" data-cms-name="wordpress"><i class="fa fa-wordpress"></i> Wordpress</button></div><div class="col-sm-3"><button class="apbtn-main-line ob-bigbtn" id="setCms" data-cms-name="">Other</button></div></div>';
                }
                else {
                    return '<div class="row"><div class="col-sm-3 col-sm-offset-3"><button class="apbtn-main-line ob-bigbtn" id="setCms" data-cms-name="wordpress"><i class="fa fa-wordpress"></i> Wordpress</button></div><div class="col-sm-3"><button class="apbtn-main ob-bigbtn" id="setCms" data-cms-name="">Other</button></div></div>';
                }
            },

            // Method to enable element-level DOM manipulation
            manipulateElem: function(container, content, type, duration) {
                switch (type) {
                    case 'htmlFadeIn':
                        $(container).hide().html(content).fadeIn(duration);
                        break;
                }
            },

            // Setup complete alert
            setupCompleteAlert: function() {
                ap.apAlert('Our advisors will get in touch with you soon. You can also contact us at <a href="mailto:support@adpushup.com">support@adpushup.com</a>', '#apdetect', 'success', 'slideDown');
            },

            // Smooth scrolling method
            scrollTo: function(step, offset, duration) {
                $('html, body').animate({
                    scrollTop: $("#step" + step).offset().top - offset
                }, duration);
            },

            // CMS detection request
            cmsRequest: function(site) {
                var request = $.get('/proxy/detectCms?site=' + site);
                return request;
            },

            // CMS detection on site
            detectCms: function(site) {
                var ob = this,
                    r = ob.cmsRequest(site);

                r.done(function(res) {
                    $('#cms-text').html('Please confirm your website’s platform -');
                    if(res.wordpress) {
                        //ob.detectedPagegroups = res.ap ? res.ap.pageGroups: [];
                        ob.manipulateElem('#cms-res', ob.setActiveCms('wordpress'), 'htmlFadeIn', 600);
                    }
                    else {
                        ob.manipulateElem('#cms-res', ob.setActiveCms('other'), 'htmlFadeIn', 600);
                    }
                });
            },

            // Init code generation
            generateInitCode: function(siteId) {
                var headerCode = '!function(w,d){var adp,config,tL,siteId=' + siteId + ',json=null,apjQuery=null;(w.adpushup=w.adpushup||{}).configure={config:{e3Called:!1,jqLoaded:0,initVersion:1.1.1,apLoaded:0,e3Loaded:0,rand:Math.random(),pageUrl:w.location.href,referrer:d.referrer,cookieSettings:{uuidAppendStr:"UUID_",uuidKey:"apSiteUuid",cookieExpiryTime:730}}},adp=w.adpushup,config=adp.configure.config,tL=adp.timeline={},tL.tl_adpStart=+new Date,adp.utils={uniqueId:function(appendNum){var r,d=+new Date,appendMe=!appendNum||"number"==typeof appendNum&&0>appendNum?Number(1).toString(16):Number(appendNum).toString(16);return appendMe=("0000000".substr(0,8-appendMe.length)+appendMe).toUpperCase(),appendMe+"-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){return r=((d=Math.floor(d/16))+16*Math.random())%16|0,("x"===c?r:3&r|8).toString(16)})},loadScript:function(src,sC,fC){var s=d.createElement("script");s.src=src,s.type="text/javascript",s.async=!0,s.onerror=function(){"function"==typeof fC&&fC.call()},"object"==typeof d.attachEvent?s.onreadystatechange=function(){"loaded"===s.readyState||"complete"===s.readyState?s.onreadystatechange=null:null}:s.onload=function(){"function"==typeof sC?sC.call():null},(d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s)},createCookie:function(key,value,expiryDays,domain){var msDays,expires="",date=new Date;expiryDays&&(msDays=24*expiryDays*60*60*1e3,date.setTime(date.getTime()+msDays),expires="; expires="+date.toUTCString()+"; max-age="+msDays),document.cookie=key+"="+value+expires+"; path=/"+(domain?"; domain="+domain:"")},readCookie:function(key){var cookie,i,keyEQ=key+"=",cookieArr=document.cookie.split(";");for(i=0;i<cookieArr.length;i++){for(cookie=cookieArr[i];" "===cookie.charAt(0);)cookie=cookie.substring(1,cookie.length);if(0===cookie.indexOf(keyEQ))return cookie.substring(keyEQ.length,cookie.length)}},eraseCookie:function(key){this.createCookie(key,"",-1)}},adp.configure.push=function(obj){var key,cookieStr,c=this.config,ts=+new Date,cookie=c.cookie;for(key in obj)c[key]=obj[key];if(!c.e3Called&&c.siteId&&c.pageGroup&&c.packetId&&cookie){for(key in cookie)cookieStr="&"+key+"="+cookie[key];adp.utils.loadScript("//e3.adpushup.com/E3WebService/e3?ver=2&callback=e3Callback&siteId="+c.siteId+"&url="+encodeURIComponent(c.pageUrl)+"&pageGroup="+c.pageGroup+"&referrer="+encodeURIComponent(d.referrer)+"&cms="+c.cms+(c.pluginVer?"&pluginVer="+c.pluginVer:"")+"&rand="+c.rand+"&packetId="+c.packetId+cookieStr+"&_="+ts),c.e3Called=!0,tL.tl_e3Requested=ts,init()}adp.ap&&"function"==typeof adp.ap.configure&&adp.ap.configure(obj)};function init(){w.jQuery&&w.jQuery.fn.jquery.match(/^1.11./)&&!config.jqLoaded&&(tL.tl_jqLoaded=+new Date)&&(config.jqLoaded=1)&&(apjQuery=w.jQuery),"function"==typeof adp.runAp&&!config.apLoaded&&(tL.tl_apLoaded=+new Date)&&(config.apLoaded=1),!adp.configure.config.apRun&&adp.configure.config.pageGroup&&apjQuery&&"function"==typeof adp.runAp&&(adp.configure.push({apRun:!0}),adp.runAp(apjQuery)),!adp.configure.config.e3Run&&w.apjQuery&&"undefined"!=typeof adp.ap&&"function"==typeof adp.ap.triggerAdpushup&&json&&"undefined"!=typeof json&&(adp.configure.push({e3Run:!0}),adp.ap.triggerAdpushup(json))}w.e3Callback=function(){arguments[0]&&!config.e3Loaded&&(tL.tl_e3Loaded=+new Date)&&(config.e3Loaded=1),json=arguments[0],init()};function jqCallback(){config.jqLoaded?null:init(),w.jQuery&&w.jQuery.noConflict(!0)&&(w.jQuery=w.jQuery?w.jQuery:apjQuery)&&(w.$=w.$?w.$:w.jQuery)}adp.utils.loadScript("//optimize.adpushup.com/"+siteId+"/apv2.js",init),tL.tl_apRequested=+new Date,adp.utils.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",jqCallback),adp.utils.loadScript("//static.adpushup.com/js/adpushupadsv2.js"),tL.tl_jqRequested=+new Date,function(adp,utils){var config=adp.configure.config.cookieSettings,cookie={},cookieVal=utils.readCookie(config.uuidKey);cookieVal||(cookieVal=config.uuidAppendStr+utils.uniqueId(siteId),utils.createCookie(config.uuidKey,cookieVal,config.cookieExpiryTime,window.location.hostname)),cookie[config.uuidKey]=cookieVal,adp.configure.push({cookie:cookie})}(adp,adp.utils);adp.configure.push({siteId:siteId,packetId:adp.utils.uniqueId(siteId),siteDomain:w.location.hostname || "",cms:"custom"});}(window,document);';
                $('#header-code').text('<script data-cfasync="false" type="text/javascript">' + headerCode + '</script>');
            },

            // Check for CMS detection step in onboarding flow
            checkCmsStep: function(step) {
                var ob = this;
                ob.manipulateElem('#cms-text', 'Please wait while we detect your website\'s platform... <div class="loader-bounce"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>', 'htmlFadeIn', 600);
                setTimeout(function(){ob.detectCms(newSite.addedSite.domain);}, 3000);
            },

            // Right trim method
            rTrim: function(string, s) {
                return string ? string.replace(new RegExp(s + '*$'), '') : '';
            },

            // Domanize method
            domanize: function(domain) {
                return domain ? this.rTrim(domain.replace('http://', '').replace('https://', '').replace('www.', ''), '/') : '';
            },

            // Show appropriate onboarding step
            showStep: function(step) {
                step = parseInt(step);
                $('#step' + step).addClass('active-step');

                // Set appropriate cms detection check
                if (step >= 2) {
                    var defaultSiteCms = currentUser.sites[0].cmsInfo.cmsName;
                    this.cmsAdded = defaultSiteCms;
                    defaultSiteCms === '' ? $('#platformVerificationContent').html(this.templates.otherPlatformVerification) : $('#platformVerificationContent').html(this.templates.wordpressPlatformVerification);
                    this.generateInitCode(newSite.addedSite.siteId);

                    var cmsSelect = defaultSiteCms === '' ? '<button class="apbtn-main ob-bigbtn cms-added" disabled> Other <i class="fa fa-check"></i> </button>' : '<button class="apbtn-main ob-bigbtn cms-added" disabled> <i class="fa fa-wordpress"></i> Wordpress <i class="fa fa-check"></i> </button>';
                    $('#cms-res').html('<p class="text-medium text-center"> Website platform selected - </p><div class="row" style="margin-top: -20px;"> <div class="col-sm-4 col-sm-offset-4">'+cmsSelect+'</div></div>');
                }

                // Set ticks for all other steps in UI
                for (var i = 1; i < step; i++) {
                    $('#step' + parseInt(i) + '-check').addClass('fa-check-circle zoomIn');
                }
                if (newSite.addedSite && step >= 1) {
                    this.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + this.domanize(newSite.addedSite.domain) + '</span> has been Added!</h2>', 'htmlFadeIn', 600);
                }
                if (step > 2) {
                    $('#apCheck').html('Verified '+this.templates.checkIcon);
                    $('#wp-plugin-link').html('<i class="fa fa-wordpress"></i> Plugin installed '+this.templates.checkIcon);
                }
                if (step >= 4) {
                    $('#adsenseoauth').html('Google Adsense Connected '+this.templates.checkIcon);
                }

                switch (step) {
                    case 1:
                        newSite.addedSite ? this.checkCmsStep() : '';
                        $('#platformVerificationContent').html('<p class="text-center mT-10"><img class="platform-graphic" src="/assets/images/platform.png" width="150" height="150"/></p>');
                        break;
                    case 4:
                        this.setupCompleteAlert();
                        break;
                    // case 5:
                    //     $('#adsensenonadmin').html('Setup Complete '+this.templates.checkIcon);
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
                    step: 1
                }, function(res) {
                    if (res.success) {
                        newSite.addedSite = {
                            domain: res.url,
                            siteId: res.siteId
                        };
                        $('.add-site-alt-form').hide();
                        $('#addSiteStr').fadeIn();
                        ob.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + site + '</span> has been Added!</h2>', 'htmlFadeIn', 600);
                        ob.checkCmsStep();
                    } else {
                        ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                        $(btn).html('Add ' + site + ' ?').prop('disabled', false);
                    }
                });
            },

            // Add a new site (default)
            addSite: function(site, url, btn) {
                $(btn).html('Adding ' + site + ' ...').prop('disabled', true);
                if(newSite.addOtherSite) {
                    var ob = this;
                    $.post('/user/addSite', {
                        site: url
                    }, function(res) {
                        if(res.success) {
                            ob.saveSiteModel(site, url, res.siteId, btn);
                        }
                        else {
                            ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                            $(btn).html('Lets Add ' + site + ' ?').prop('disabled', false);
                        }
                    });
                }
                else {
                    this.saveSiteModel(site, url, newSite.viewObjects.unSavedSiteId, btn);
                }
            },

            // Request to save CMS to site model
            saveCmsInSiteModel: function(cmsName, siteId, pageGroups) {
                var request = $.post('/data/saveCms', {
                    cmsName: cmsName,
                    siteId: siteId,
                    pageGroups: pageGroups
                });
                return request;
            },

            // Save site platform 
            saveCms: function(cmsName, siteId, btn) {
                var ob = this,
                    r = ob.saveCmsInSiteModel(cmsName, siteId, []);
                btn.html('Saving...').prop('disabled', true);

                r.done(function(res) {
                    if (res.success) {
                        ob.cmsAdded = cmsName;
                        $.post('/user/setSiteStep', {
                            siteId: newSite.addedSite.siteId,
                            step: 2
                        }, function(response) {
                            if (response.success) {
                                if (cmsName !== 'wordpress') {
                                    btn.html('Other '+ob.templates.checkIcon).prop('disabled', true);
                                    $('#platformVerificationContent').html(ob.templates.otherPlatformVerification);
                                    ob.generateInitCode(newSite.addedSite.siteId);
                                } else {
                                    btn.html('<i class="fa fa-wordpress"></i> Wordpress '+ob.templates.checkIcon).prop('disabled', true);
                                    $('#platformVerificationContent').html(ob.templates.wordpressPlatformVerification);
                                }
                                ob.nextStep(2, 1, 1000);
                            } else {
                                alert('Some error occurred!');
                            }
                        });
                    } else {
                        alert('Some error occurred! Please try again later.');
                    }
                });
            },

            // Adpushup detection success
            detectApSuccess: function(ob, el) {
                ap.apAlert('AdPushup has been successfully detected on the website!', '#apdetect', 'success', 'slideDown');
                if(newSite.addOtherSite) {
                    $(el).html('Setup Complete '+ob.templates.checkIcon).after(ob.templates.dashboardLink);
                }
                else {
                    $(el).html('Verified '+ob.templates.checkIcon);
                    ob.nextStep(3, 2, 1000);
                }
            },

            // AdPushup detection on site
            detectAp: function(addedSite, el, cms) {
                var ob = this;
                $.get('/proxy/detectap', {
                    'url': addedSite
                }, function(res) {
                    if (res.ap) {
                        $.post('/user/setSiteStep', {
                            siteId: newSite.addedSite.siteId,
                            step: newSite.addOtherSite ? 4 : 3
                        }, function(response) {
                            if (response.success) {
                                if(ob.cmsAdded === 'wordpress') {
                                    var r = ob.cmsRequest(addedSite);
                                    r.done(function(res) {
                                        r = ob.saveCmsInSiteModel(ob.cmsAdded, newSite.addedSite.siteId, JSON.stringify(res.ap.pageGroups));
                                        r.done(function() {
                                            ob.detectApSuccess(ob, el);
                                        });
                                    });
                                }
                                else {
                                    ob.detectApSuccess(ob, el);
                                }
                            } else {
                                alert('Some error occurred!');
                            }
                        });
                    } else {
                        ap.apAlert('AdPushup was not detected on the website!', '#apdetect', 'inverted', 'slideDown');
                        $('.detectap-error').fadeIn();
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
                document.execCommand('copy');
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
                        btn.html('Setup Complete '+ob.templates.checkIcon);
                        ob.setupCompleteAlert();
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Check if new site addition card is to be shown
            showAddOtherSite: function() {
                if(newSite.addOtherSite) {
                    $('#addSiteStr').html(this.templates.addOtherSite);
                    $('#step2').nextAll("div[id^='step']").hide();
                }
            },
        };
        ap.onboarding.showIntro();
        ap.onboarding.showStep(newSite.defaultStep);
        ap.onboarding.showAddOtherSite();



        // Trigger to add user's unsaved site
        $('#addUserSite').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            ap.onboarding.addSite(userUnsavedSite, url, $(this));
        });

        // Trigger to set cms
        $(document).on('click', '#setCms', function() {
            var btn = $(this),
                cms = btn.attr('data-cms-name');
            window.selectedCms = cms;
            ap.onboarding.saveCms(cms, newSite.addedSite.siteId, btn);
        });

        // Trigger to detect ap
        $(document).on('click', '#apCheck', function() {
            $(this).html('Verifying...').prop('disabled', true);
            ap.onboarding.detectAp(newSite.addedSite.domain, $(this));
        });

        // Trigger to get adsense Oauth
        $('#adsenseoauth').click(function() {
            ap.onboarding.openOauthWindow();
        });

        // Trigger to set non-admin access check
        $('#adsensenonadmin').click(function() {
            ap.onboarding.nonAdminAccess($(this));
        });

        // Tigger to copy init code to clipboard
        $(document).on('click', '#clipboardCopy, #header-code', function() {
            ap.onboarding.copyInitCode();
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
    })(adpushup, window);
});