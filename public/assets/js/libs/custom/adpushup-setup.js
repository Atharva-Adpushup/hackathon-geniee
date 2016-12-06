// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {

    (function(ap) {
        
        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
            
            // UI templates for onboarding
            templates: {
                cmsSelection: '<div class="row"><div class="col-sm-3 col-sm-offset-3"><button class="apbtn-main-line ob-bigbtn" id="setCms" data-cms-name="wordpress"><i class="fa fa-wordpress"></i> Wordpress</button></div><div class="col-sm-3"><button class="apbtn-main ob-bigbtn" id="setCms" data-cms-name="">Other</button></div></div>',

                wordpressPlugin: '<div class="row"><div class="col-sm-4 col-sm-offset-4"><a href="https://wordpress.org/plugins/adpushup/" target="_blank" class="apbtn-main-line ob-bigbtn"><i class="fa fa-wordpress"></i> Install Plugin</a></div></div><p class="text-medium-nm text-center">After you install plugin, please configure Site ID - <strong>'+newSite.viewObjects.unSavedSiteId+'</strong> by going to <strong>Wordpress</strong> > <strong>Settings</strong> > <strong>Adpushup Settings</strong></p><div class="row"><div class="col-sm-4 col-sm-offset-4"><button id="apCheck" class="apbtn-main apbtn-cmsver">I\'ve done this</button></div></div>'
            },

            // Method to enable element-level DOM manipulation
            manipulateElem: function(container, content, type, duration) {
                switch(type) {
                    case 'html':
                        $(container).html(content);
                        break;
                    case 'css':
                        $(container).css(content);
                        break;
                    case 'class':
                        $(container).addClass(content);
                        break;
                    case 'text':
                        $(container).text(content);
                        break;
                    case 'htmlFadeIn':
                        $(container).hide().html(content).fadeIn(duration);
                        break;
                }
            },

            scrollTo: function(step, offset, duration) {
                $('html, body').animate({
                    scrollTop: $("#step"+step).offset().top - offset
                }, duration);
            },

            // CMS detection on site
            detectCms: function(site) {
                var ob = this;

                $.get('/proxy/detectCms?site='+site, {}, function(res) {
                    ob.manipulateElem('#cms-text', 'We have auto detected and selected this for you -', 'html')
                    ob.manipulateElem('#cms-res', ob.templates.cmsSelection, 'htmlFadeIn', 600);
                });
            },

            // Init code generation
            generateInitCode: function(siteId) {
                var headerCode = '!function(w,d){var adp,config,tL,siteId='+siteId+',json=null,apjQuery=null;(w.adpushup=w.adpushup||{}).configure={config:{e3Called:!1,jqLoaded:0,initVersion:1.1.1,apLoaded:0,e3Loaded:0,rand:Math.random(),pageUrl:w.location.href,referrer:d.referrer,cookieSettings:{uuidAppendStr:"UUID_",uuidKey:"apSiteUuid",cookieExpiryTime:730}}},adp=w.adpushup,config=adp.configure.config,tL=adp.timeline={},tL.tl_adpStart=+new Date,adp.utils={uniqueId:function(appendNum){var r,d=+new Date,appendMe=!appendNum||"number"==typeof appendNum&&0>appendNum?Number(1).toString(16):Number(appendNum).toString(16);return appendMe=("0000000".substr(0,8-appendMe.length)+appendMe).toUpperCase(),appendMe+"-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){return r=((d=Math.floor(d/16))+16*Math.random())%16|0,("x"===c?r:3&r|8).toString(16)})},loadScript:function(src,sC,fC){var s=d.createElement("script");s.src=src,s.type="text/javascript",s.async=!0,s.onerror=function(){"function"==typeof fC&&fC.call()},"object"==typeof d.attachEvent?s.onreadystatechange=function(){"loaded"===s.readyState||"complete"===s.readyState?s.onreadystatechange=null:null}:s.onload=function(){"function"==typeof sC?sC.call():null},(d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s)},createCookie:function(key,value,expiryDays,domain){var msDays,expires="",date=new Date;expiryDays&&(msDays=24*expiryDays*60*60*1e3,date.setTime(date.getTime()+msDays),expires="; expires="+date.toUTCString()+"; max-age="+msDays),document.cookie=key+"="+value+expires+"; path=/"+(domain?"; domain="+domain:"")},readCookie:function(key){var cookie,i,keyEQ=key+"=",cookieArr=document.cookie.split(";");for(i=0;i<cookieArr.length;i++){for(cookie=cookieArr[i];" "===cookie.charAt(0);)cookie=cookie.substring(1,cookie.length);if(0===cookie.indexOf(keyEQ))return cookie.substring(keyEQ.length,cookie.length)}},eraseCookie:function(key){this.createCookie(key,"",-1)}},adp.configure.push=function(obj){var key,cookieStr,c=this.config,ts=+new Date,cookie=c.cookie;for(key in obj)c[key]=obj[key];if(!c.e3Called&&c.siteId&&c.pageGroup&&c.packetId&&cookie){for(key in cookie)cookieStr="&"+key+"="+cookie[key];adp.utils.loadScript("//e3.adpushup.com/E3WebService/e3?ver=2&callback=e3Callback&siteId="+c.siteId+"&url="+encodeURIComponent(c.pageUrl)+"&pageGroup="+c.pageGroup+"&referrer="+encodeURIComponent(d.referrer)+"&cms="+c.cms+(c.pluginVer?"&pluginVer="+c.pluginVer:"")+"&rand="+c.rand+"&packetId="+c.packetId+cookieStr+"&_="+ts),c.e3Called=!0,tL.tl_e3Requested=ts,init()}adp.ap&&"function"==typeof adp.ap.configure&&adp.ap.configure(obj)};function init(){w.jQuery&&w.jQuery.fn.jquery.match(/^1.11./)&&!config.jqLoaded&&(tL.tl_jqLoaded=+new Date)&&(config.jqLoaded=1)&&(apjQuery=w.jQuery),"function"==typeof adp.runAp&&!config.apLoaded&&(tL.tl_apLoaded=+new Date)&&(config.apLoaded=1),!adp.configure.config.apRun&&adp.configure.config.pageGroup&&apjQuery&&"function"==typeof adp.runAp&&(adp.configure.push({apRun:!0}),adp.runAp(apjQuery)),!adp.configure.config.e3Run&&w.apjQuery&&"undefined"!=typeof adp.ap&&"function"==typeof adp.ap.triggerAdpushup&&json&&"undefined"!=typeof json&&(adp.configure.push({e3Run:!0}),adp.ap.triggerAdpushup(json))}w.e3Callback=function(){arguments[0]&&!config.e3Loaded&&(tL.tl_e3Loaded=+new Date)&&(config.e3Loaded=1),json=arguments[0],init()};function jqCallback(){config.jqLoaded?null:init(),w.jQuery&&w.jQuery.noConflict(!0)&&(w.jQuery=w.jQuery?w.jQuery:apjQuery)&&(w.$=w.$?w.$:w.jQuery)}adp.utils.loadScript("//optimize.adpushup.com/"+siteId+"/apv2.js",init),tL.tl_apRequested=+new Date,adp.utils.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",jqCallback),adp.utils.loadScript("//static.adpushup.com/js/adpushupadsv2.js"),tL.tl_jqRequested=+new Date,function(adp,utils){var config=adp.configure.config.cookieSettings,cookie={},cookieVal=utils.readCookie(config.uuidKey);cookieVal||(cookieVal=config.uuidAppendStr+utils.uniqueId(siteId),utils.createCookie(config.uuidKey,cookieVal,config.cookieExpiryTime,window.location.hostname)),cookie[config.uuidKey]=cookieVal,adp.configure.push({cookie:cookie})}(adp,adp.utils);adp.configure.push({siteId:siteId,packetId:adp.utils.uniqueId(siteId),siteDomain:w.location.hostname || "",cms:"custom"});}(window,document);';

                this.manipulateElem('#header-code', '<script data-cfasync="false" type="text/javascript">'+headerCode+'</script>', 'text')
            },

            // Check for CMS detection step in onboarding flow
            checkCmsStep: function(step) {
                this.manipulateElem('#cms-text', 'Please wait while we inspect your website...', 'htmlFadeIn', 600);
                this.detectCms(newSite.addedSite.domain);
            },
            
            // Show appropriate onboarding step
            showStep: function(step) {
                this.manipulateElem('#step' + step, 'active-step', 'class');

                if(step == 1 && newSite.addedSite) {
                    this.checkCmsStep();
                }

                // Set ticks for all other steps in UI
                for(var i = 1; i < step; i++) {
                    this.manipulateElem('#step' + parseInt(i) + '-check', 'fa-check-circle zoomIn', 'class');
                }

                // Generate header code step if all other steps are complete
                if(parseInt(step) === newSite.totalSteps || parseInt(step) === 3) {
                    this.generateInitCode(newSite.addedSite.siteId);
                }
            },

            // Goto next onboarding step
            nextStep: function(to, from, duration) {
                var ob = this;

                ob.manipulateElem('#step'+from + '-check', 'fa-check-circle zoomIn', 'class');
                setTimeout(function() {
                    $('#step'+to).addClass('active-step');
                    $('#step'+from).removeClass('active-step');

                    ob.scrollTo(to, 120, 600);
                }, duration);
            },

            // Add a new site 
            addSite: function(site, url, btn) {
                var ob = this;

                $(btn).html('Adding '+site+' ...').prop('disabled', true);
                $.post('/data/saveSite', {
                    site: url,
                    siteId: newSite.viewObjects.unSavedSiteId,
                    step: 1
                }, function(res) {
                    if(res.success) {
                        newSite.addedSite = {
                            domain: res.url,
                            siteId: res.siteId
                        };
                        $('.add-site-alt-form').hide();
                        $('#addSiteStr').fadeIn();

                        ob.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + site + '</span> has been Added!</h2>', 'htmlFadeIn', 600);

                        ob.checkCmsStep();
                    }
                    else {
                        ap.apAlert('Some error occurred!', '#apdetect', 'error', 'slideDown');
                    }
                });
            },

            // Save site platform or CMS
            saveCms: function(cmsName, siteId, btn) {
                var ob = this;

                btn.html('Saving...').prop('disabled', true);
                $.post('/data/saveCms', {
                    cmsName: cmsName,
                    siteId: siteId
                }, function(res) {
                    if(res.success) {
                        btn.html('Saved').prop('disabled', true);
                        if(cmsName !== 'wordpress') {

                            $.post('/user/setSiteStep', {
                                siteId: newSite.addedSite.siteId,
                                step: 3
                            }, function(response) {
                                if(response.success) {
                                    ob.generateInitCode(newSite.addedSite.siteId);
                                    ob.nextStep(3, 2, 1000);
                                }
                                else {
                                    alert('Some error occurred!');
                                }
                            });
                        }
                        else {
                            ob.manipulateElem('#cms-text', 'Please install the AdPushup JavaScript snippet via our Wordpress Plugin.', 'html');
                            ob.manipulateElem('#cms-res', ob.templates.wordpressPlugin, 'htmlFadeIn');
                        }                        
                    }
                    else {
                        alert('Some error occurred! Please try again later.');
                    }
                });
            },

            // AdPushup detection on site
            detectAp: function(addedSite, el, cms) {
                var ob = this;

                $.get('/proxy/detectap', {
                    'url': addedSite
                }, function(res) {
                    if (res.ap) {
                        ap.apAlert('AdPushup has been successfully detected on the website!', '#apdetect', 'success', 'slideDown');

                        ob.manipulateElem('#step3-check', 'fa-check-circle zoomIn', 'class');

                        $.post('/user/setSiteStep', {
                            siteId: newSite.addedSite.siteId,
                            step: 4
                        }, function(response) {
                            ob.manipulateElem(el, 'Verified <i class="fa fa-check"></i>', 'html');
                            if(response.success) {

                                if(window.selectedCms === 'wordpress') {
                                    ob.nextStep(3, 2, 1000);
                                    ob.generateInitCode(newSite.addedSite.siteId);
                                    setTimeout(function() {
                                        ob.manipulateElem('#step3', {opacity: .55}, 'css');
                                        ob.manipulateElem('.btn-wpdt', 'Verified <i class="fa fa-check"></i>', 'html');
                                    }, 1500);
                                    setTimeout(function() {ob.nextStep(4, 3, 1000);}, 3000);
                                }
                                else{
                                    ob.nextStep(4, 3, 1000);
                                }
                            }
                            else {
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
            }

        };
        ap.onboarding.showStep(newSite.defaultStep);



        // Trigger to add user's unsaved site
        $('#addUserSite').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            ap.onboarding.addSite(userUnsavedSite, url, $(this));
        });

        // Trigger to set cms
        $(document).on('click', '#setCms', function(){ 
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

        // Tigger to copy init code to clipboard
        $('#clipboardCopy, #header-code').click(function() {
            ap.onboarding.copyInitCode();
        });

    })(adpushup);

});