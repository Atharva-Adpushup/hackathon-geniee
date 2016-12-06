// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {

    (function(ap) {
        // Use new site object + show the default step in UI
        var newSite = ap.newSite;

        // Function to show next step in site addition
        newSite.showStep = function(step) {
            $('#step' + step + ' .ob-content').show();

             // Set ticks for all other steps in UI
            for(var i = 1; i < step; i++) {
                $('#step' + parseInt(i) + ' > .ob-heading').css({
                    'border-bottom': 'none',
                    'padding-bottom': 0
                });
                $('#step' + parseInt(i) + '-check').addClass('fa-check-circle zoomIn');
            }
            
            // Generate header code step if all other steps are complete
            if(parseInt(step) === this.totalSteps) {

                // Generate header code with site id
                var headerCode = '!function(w,d){var adp,config,tL,siteId='+newSite.addedSite.siteId+',json=null,apjQuery=null;(w.adpushup=w.adpushup||{}).configure={config:{e3Called:!1,jqLoaded:0,initVersion:1.1.1,apLoaded:0,e3Loaded:0,rand:Math.random(),pageUrl:w.location.href,referrer:d.referrer,cookieSettings:{uuidAppendStr:"UUID_",uuidKey:"apSiteUuid",cookieExpiryTime:730}}},adp=w.adpushup,config=adp.configure.config,tL=adp.timeline={},tL.tl_adpStart=+new Date,adp.utils={uniqueId:function(appendNum){var r,d=+new Date,appendMe=!appendNum||"number"==typeof appendNum&&0>appendNum?Number(1).toString(16):Number(appendNum).toString(16);return appendMe=("0000000".substr(0,8-appendMe.length)+appendMe).toUpperCase(),appendMe+"-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){return r=((d=Math.floor(d/16))+16*Math.random())%16|0,("x"===c?r:3&r|8).toString(16)})},loadScript:function(src,sC,fC){var s=d.createElement("script");s.src=src,s.type="text/javascript",s.async=!0,s.onerror=function(){"function"==typeof fC&&fC.call()},"object"==typeof d.attachEvent?s.onreadystatechange=function(){"loaded"===s.readyState||"complete"===s.readyState?s.onreadystatechange=null:null}:s.onload=function(){"function"==typeof sC?sC.call():null},(d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s)},createCookie:function(key,value,expiryDays,domain){var msDays,expires="",date=new Date;expiryDays&&(msDays=24*expiryDays*60*60*1e3,date.setTime(date.getTime()+msDays),expires="; expires="+date.toUTCString()+"; max-age="+msDays),document.cookie=key+"="+value+expires+"; path=/"+(domain?"; domain="+domain:"")},readCookie:function(key){var cookie,i,keyEQ=key+"=",cookieArr=document.cookie.split(";");for(i=0;i<cookieArr.length;i++){for(cookie=cookieArr[i];" "===cookie.charAt(0);)cookie=cookie.substring(1,cookie.length);if(0===cookie.indexOf(keyEQ))return cookie.substring(keyEQ.length,cookie.length)}},eraseCookie:function(key){this.createCookie(key,"",-1)}},adp.configure.push=function(obj){var key,cookieStr,c=this.config,ts=+new Date,cookie=c.cookie;for(key in obj)c[key]=obj[key];if(!c.e3Called&&c.siteId&&c.pageGroup&&c.packetId&&cookie){for(key in cookie)cookieStr="&"+key+"="+cookie[key];adp.utils.loadScript("//e3.adpushup.com/E3WebService/e3?ver=2&callback=e3Callback&siteId="+c.siteId+"&url="+encodeURIComponent(c.pageUrl)+"&pageGroup="+c.pageGroup+"&referrer="+encodeURIComponent(d.referrer)+"&cms="+c.cms+(c.pluginVer?"&pluginVer="+c.pluginVer:"")+"&rand="+c.rand+"&packetId="+c.packetId+cookieStr+"&_="+ts),c.e3Called=!0,tL.tl_e3Requested=ts,init()}adp.ap&&"function"==typeof adp.ap.configure&&adp.ap.configure(obj)};function init(){w.jQuery&&w.jQuery.fn.jquery.match(/^1.11./)&&!config.jqLoaded&&(tL.tl_jqLoaded=+new Date)&&(config.jqLoaded=1)&&(apjQuery=w.jQuery),"function"==typeof adp.runAp&&!config.apLoaded&&(tL.tl_apLoaded=+new Date)&&(config.apLoaded=1),!adp.configure.config.apRun&&adp.configure.config.pageGroup&&apjQuery&&"function"==typeof adp.runAp&&(adp.configure.push({apRun:!0}),adp.runAp(apjQuery)),!adp.configure.config.e3Run&&w.apjQuery&&"undefined"!=typeof adp.ap&&"function"==typeof adp.ap.triggerAdpushup&&json&&"undefined"!=typeof json&&(adp.configure.push({e3Run:!0}),adp.ap.triggerAdpushup(json))}w.e3Callback=function(){arguments[0]&&!config.e3Loaded&&(tL.tl_e3Loaded=+new Date)&&(config.e3Loaded=1),json=arguments[0],init()};function jqCallback(){config.jqLoaded?null:init(),w.jQuery&&w.jQuery.noConflict(!0)&&(w.jQuery=w.jQuery?w.jQuery:apjQuery)&&(w.$=w.$?w.$:w.jQuery)}adp.utils.loadScript("//optimize.adpushup.com/"+siteId+"/apv2.js",init),tL.tl_apRequested=+new Date,adp.utils.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",jqCallback),adp.utils.loadScript("//static.adpushup.com/js/adpushupadsv2.js"),tL.tl_jqRequested=+new Date,function(adp,utils){var config=adp.configure.config.cookieSettings,cookie={},cookieVal=utils.readCookie(config.uuidKey);cookieVal||(cookieVal=config.uuidAppendStr+utils.uniqueId(siteId),utils.createCookie(config.uuidKey,cookieVal,config.cookieExpiryTime,window.location.hostname)),cookie[config.uuidKey]=cookieVal,adp.configure.push({cookie:cookie})}(adp,adp.utils);adp.configure.push({siteId:siteId,packetId:adp.utils.uniqueId(siteId),siteDomain:w.location.hostname || "",cms:"custom"});}(window,document);';

                // Populate header code in textarea
                $('#header-code').text('<script data-cfasync="false" type="text/javascript">'+headerCode+'</script>');
            }
        };
        newSite.showStep(newSite.defaultStep);

        // Function to detect CMS type
        var cmsWp = '<button class="apbtn-main-line ob-bigbtn" id="setCms" data-cms-name="wordpress"><i class="fa fa-wordpress"></i> Wordpress</button>'
        var cmsOther = '<button class="apbtn-main ob-bigbtn" id="setCms" data-cms-name="">Other</button>';

        newSite.detectCms = function(site) {
            $.get('/proxy/detectCms?site='+site, {}, function(res) {
                $('#cms-text').html('We have auto detected and selected this for you.');

                $('#ob-loader').remove();
                if(!res.wordpress && !res.ap) {
                    $('#cms-res').hide().html('<div class="row"><div class="col-sm-4 col-sm-offset-2">'+cmsWp+'</div><div class="col-sm-4">'+cmsOther+'</div></div>').fadeIn();
                }
                else if(res.wordpress) {
                    $('#cms-res').hide().html('<div class="row"><div class="col-sm-4 col-sm-offset-4">'+cmsWp+'</div></div>').fadeIn();
                }
            });
        };
    
        // Function to set website platform
        newSite.setCms = function(cmsName, siteId, btn) {
            btn.html('Saving...').prop('disabled', true);
            $.post('/data/saveCms', {
                cmsName: cmsName,
                siteId: siteId
            }, function(res) {
                if(res.success) {
                    if(cmsName !== 'wordpress') {
                        newSite.nextStep(3, 2, 1000);
                    }
                    else {
                        $('#cms-text').html('Please install the AdPushup JavaScript snippet via our Wordpress Plugin.');
                        var wpPluginHtml = '<div class="row"><div class="col-sm-4 col-sm-offset-4"><a href="https://wordpress.org/plugins/adpushup/" target="_blank" class="apbtn-main-line ob-bigbtn"><i class="fa fa-wordpress"></i> Install Plugin</a></div></div><p class="text-medium-nm text-center">After you install plugin, please configure Site ID - <strong>'+newSite.viewObjects.unSavedSiteId+'</strong> by going to <strong>Wordpress</strong> > <strong>Settings</strong> > <strong>Adpushup Settings</strong></p><div class="row"><div class="col-sm-4 col-sm-offset-4"><button id="wpCheck" class="apbtn-main">I\'ve done this</button></div></div>';
                        $('#cms-res').hide().html(wpPluginHtml).fadeIn();
                    }
                    
                }
                else {
                    alert('Some error occurred! Please try again later.');
                }
            });
        };

        // Function to traverse to next step
        newSite.nextStep = function(to, from, duration) {
            $('#step'+from + '-check').addClass('fa-check-circle zoomIn');
            setTimeout(function() {
                $('#step' + from + ' > .ob-heading').css({
                    'border-bottom': 'none',
                    'padding-bottom': 0
                });
                $('#step'+to + ' .ob-content').slideDown();
                $('#step'+from + ' .ob-content').slideUp();
            }, duration);

            switch(to) {
                case 2:
                    ap.showLoader('#ob-loader', 'ob-loader');
                    $('#cms-text').html('Please wait while we inspect your website...');
                    this.detectCms(newSite.addedSite.domain);
                    break;
            }
        };

        // Function to add new site
        newSite.addSite = function(site, url) {

            // Create site model for user site
            $.post('/data/saveSite', {
                site: url,
                siteId: newSite.viewObjects.unSavedSiteId,
                step: 2
            }, function(res) {
                if(res.success) {
                    newSite.addedSite = {
                        domain: res.url,
                        siteId: res.siteId
                    };
                    $('.add-site-alt-form').hide();
                    $('#addSiteStr').fadeIn();
                    $('#addSiteStr').html('<h2 class="text-appear"><span>' + site + '</span> has been Added!</h2>');

                    // Generate header code with site id
                    var headerCode = '!function(w,d){var adp,config,tL,siteId='+newSite.addedSite.siteId+',json=null,apjQuery=null;(w.adpushup=w.adpushup||{}).configure={config:{e3Called:!1,jqLoaded:0,initVersion:1.1.1,apLoaded:0,e3Loaded:0,rand:Math.random(),pageUrl:w.location.href,referrer:d.referrer,cookieSettings:{uuidAppendStr:"UUID_",uuidKey:"apSiteUuid",cookieExpiryTime:730}}},adp=w.adpushup,config=adp.configure.config,tL=adp.timeline={},tL.tl_adpStart=+new Date,adp.utils={uniqueId:function(appendNum){var r,d=+new Date,appendMe=!appendNum||"number"==typeof appendNum&&0>appendNum?Number(1).toString(16):Number(appendNum).toString(16);return appendMe=("0000000".substr(0,8-appendMe.length)+appendMe).toUpperCase(),appendMe+"-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){return r=((d=Math.floor(d/16))+16*Math.random())%16|0,("x"===c?r:3&r|8).toString(16)})},loadScript:function(src,sC,fC){var s=d.createElement("script");s.src=src,s.type="text/javascript",s.async=!0,s.onerror=function(){"function"==typeof fC&&fC.call()},"object"==typeof d.attachEvent?s.onreadystatechange=function(){"loaded"===s.readyState||"complete"===s.readyState?s.onreadystatechange=null:null}:s.onload=function(){"function"==typeof sC?sC.call():null},(d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s)},createCookie:function(key,value,expiryDays,domain){var msDays,expires="",date=new Date;expiryDays&&(msDays=24*expiryDays*60*60*1e3,date.setTime(date.getTime()+msDays),expires="; expires="+date.toUTCString()+"; max-age="+msDays),document.cookie=key+"="+value+expires+"; path=/"+(domain?"; domain="+domain:"")},readCookie:function(key){var cookie,i,keyEQ=key+"=",cookieArr=document.cookie.split(";");for(i=0;i<cookieArr.length;i++){for(cookie=cookieArr[i];" "===cookie.charAt(0);)cookie=cookie.substring(1,cookie.length);if(0===cookie.indexOf(keyEQ))return cookie.substring(keyEQ.length,cookie.length)}},eraseCookie:function(key){this.createCookie(key,"",-1)}},adp.configure.push=function(obj){var key,cookieStr,c=this.config,ts=+new Date,cookie=c.cookie;for(key in obj)c[key]=obj[key];if(!c.e3Called&&c.siteId&&c.pageGroup&&c.packetId&&cookie){for(key in cookie)cookieStr="&"+key+"="+cookie[key];adp.utils.loadScript("//e3.adpushup.com/E3WebService/e3?ver=2&callback=e3Callback&siteId="+c.siteId+"&url="+encodeURIComponent(c.pageUrl)+"&pageGroup="+c.pageGroup+"&referrer="+encodeURIComponent(d.referrer)+"&cms="+c.cms+(c.pluginVer?"&pluginVer="+c.pluginVer:"")+"&rand="+c.rand+"&packetId="+c.packetId+cookieStr+"&_="+ts),c.e3Called=!0,tL.tl_e3Requested=ts,init()}adp.ap&&"function"==typeof adp.ap.configure&&adp.ap.configure(obj)};function init(){w.jQuery&&w.jQuery.fn.jquery.match(/^1.11./)&&!config.jqLoaded&&(tL.tl_jqLoaded=+new Date)&&(config.jqLoaded=1)&&(apjQuery=w.jQuery),"function"==typeof adp.runAp&&!config.apLoaded&&(tL.tl_apLoaded=+new Date)&&(config.apLoaded=1),!adp.configure.config.apRun&&adp.configure.config.pageGroup&&apjQuery&&"function"==typeof adp.runAp&&(adp.configure.push({apRun:!0}),adp.runAp(apjQuery)),!adp.configure.config.e3Run&&w.apjQuery&&"undefined"!=typeof adp.ap&&"function"==typeof adp.ap.triggerAdpushup&&json&&"undefined"!=typeof json&&(adp.configure.push({e3Run:!0}),adp.ap.triggerAdpushup(json))}w.e3Callback=function(){arguments[0]&&!config.e3Loaded&&(tL.tl_e3Loaded=+new Date)&&(config.e3Loaded=1),json=arguments[0],init()};function jqCallback(){config.jqLoaded?null:init(),w.jQuery&&w.jQuery.noConflict(!0)&&(w.jQuery=w.jQuery?w.jQuery:apjQuery)&&(w.$=w.$?w.$:w.jQuery)}adp.utils.loadScript("//optimize.adpushup.com/"+siteId+"/apv2.js",init),tL.tl_apRequested=+new Date,adp.utils.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",jqCallback),adp.utils.loadScript("//static.adpushup.com/js/adpushupadsv2.js"),tL.tl_jqRequested=+new Date,function(adp,utils){var config=adp.configure.config.cookieSettings,cookie={},cookieVal=utils.readCookie(config.uuidKey);cookieVal||(cookieVal=config.uuidAppendStr+utils.uniqueId(siteId),utils.createCookie(config.uuidKey,cookieVal,config.cookieExpiryTime,window.location.hostname)),cookie[config.uuidKey]=cookieVal,adp.configure.push({cookie:cookie})}(adp,adp.utils);adp.configure.push({siteId:siteId,packetId:adp.utils.uniqueId(siteId),siteDomain:w.location.hostname || "",cms:"custom"});}(window,document);';

                    // Populate header code in textarea
                    $('#header-code').text('<script data-cfasync="false" type="text/javascript">'+headerCode+'</script>');

                    // Go to next step
                    newSite.nextStep(2, 1, 1000);
                }
                else {
                    //alert(res.error);
                    ap.apAlert('Some error occurred!', '#apdetect', 'error', 'slideDown');
                }
            });
        };

        // Function to add other website - on user onboarding
        newSite.showAddOtherSite = function() {

            // Check if the flag is valid and show appropriate section in UI
            if (!this.addOtherSite) {
                $('.add-site-alt-form').hide(); // Hide add other website section
            } else {
                $('#addSiteStr').hide(); // Hide add existing website section 
                var addSiteForm = $('.add-site-alt-form');
                $(addSiteForm).find(' .col-sm-8').removeClass('col-sm-8').addClass('col-sm-9');
                $(addSiteForm).find('.col-sm-2:last-child').remove();
                $(addSiteForm).find('.col-sm-2:last-child').attr('class', 'col-sm-3').css('padding-right', 0);
            }
        };
        newSite.showAddOtherSite();

        // Function to send header code email to developer
        newSite.sendCodeToDev = function(data) {
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
        };

        // Function to detect Adpushup on added website
        newSite.detectAp = function(addedSite, el, cms) {
            $.get('/proxy/detectap', {
                'url': addedSite
            }, function(res) {
                if (res.ap) {
                   

                            // // Set site status as verified
                            // $.post('/user/verifySite', {
                            //     siteId: newSite.addedSite.siteId,
                            //     measure: newSite.adRecoverPreferences.measure,
                            //     monetize: newSite.adRecoverPreferences.monetize,
                            //     step: 4
                            // }, function(response) {
                            //     if(response.success) {
                                    ap.apAlert('AdPushup has been successfully detected on the website!', '#apdetect', 'success', 'slideDown');

                                    if(window.selectedCms === 'wordpress') {
                                        $('#step3-check').addClass('fa-check-circle zoomIn');
                                        newSite.nextStep(4, 2, 1000);
                                    }
                                    else {
                                        newSite.nextStep(4, 3, 1000);
                                    }
                                    
                                   
                                   
                            //         $('#completeSetup').html('Setup Complete! <div>Our advisors will get in touch with you soon. <br/> You can also contact us at <a href="mailto:contact@adrecover.com">contact@adrecover.com</a></div><a class="arbtn-main" style="font-size: 1em;" href="/user/dashboard">Go to Dashboard</a>').prop('disabled', true).css('opacity', 1).addClass('btn-setup-complete');
                            //         $('#step'+ newSite.totalSteps + '-check').addClass('fa-check-circle zoomIn');
                            //         $('.detectap-error').slideUp();
                            //     }
                            //     else {
                            //         alert('Some error occurred!');
                            //     }
                            // });
                        
                
                } else {
                    ap.apAlert('AdPushup was not detected on the website!', '#apdetect', 'inverted', 'slideDown');

                    $('.detectap-error').fadeIn();
                    $(el).html('Verify').prop('disabled', false);
                }
            });
        };

        // Function to return host - for matching added site with updated site
        newSite.getHost = function(site) {
            var a = document.createElement('a');
            a.href = site;
            return a.hostname;
        };

        // Function to add updated website - if hosts match 
        newSite.addAnotherSite = function(updatedSite, form) {
            if (this.getHost(this.addedSite.domain) === this.getHost(updatedSite)) {
                $(form).find('button[type=submit]').html('Adding...').prop('disabled', true);
                $('#detectapError').html('');

                // If hosts match then detect Adrecover on updated website
                this.detectAdRecover(updatedSite, 'update');
            } else {
                $('#detectapError').html('<p>The domain of the updated URL must match the added URL</p>');
            }
        };



        // Adrecover add new site - user interaction methods
        //=======================================================

        // Copy header code to clipboard
        $('#clipboardCopy, #header-code').click(function() {
            $('.clipboard-copy').fadeIn();
            setTimeout(function() {
                $('.clipboard-copy').fadeOut();
            }, 1500);
            $('#header-code').select();
            document.execCommand('copy');
        });

        // Add user's unsaved site
        $('#addUserSite').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            newSite.addSite(userUnsavedSite, url);
        });

        // Set adrecover preference
        $('#preference-form').submit(function(e) {
            e.preventDefault();
            var data = $(this).serializeArray(),
                sitePreference = {};
            if(parseInt(data[0].value) === 1) {
                sitePreference.measure = true;
                sitePreference.monetize = false;
            }
            else {
                sitePreference.measure = true;
                sitePreference.monetize = true;
            }
            newSite.setSitePreference(sitePreference);
        });

        // Add user's new/other site
        $('#addSiteAltForm').submit(function(e) {
            e.preventDefault();
            var newsite = $(this).serializeArray(),
                url = newsite[0].value.replace(/\/$/, "");
                site = url.replace(/.*?:\/\//g, "");
            newSite.addSite(site, url);
        });

        // Show/Hide add new site button based on state
        $('.site-add-alt').click(function() {
            $('#addSiteStr').hide();
            $('.add-site-alt-form').fadeIn();
        });
        $('#siteAltCancel').click(function() {
            $('#addSiteStr').fadeIn();
            $('.add-site-alt-form').hide();
        });

        // Send AdRecover header code to developer
        $('#sendCodeForm').submit(function(e) {
            e.preventDefault();
            $('#headerCodeInput').val($('#header-code').val());
            var data = $(this).serialize();
            newSite.sendCodeToDev(data);
        });

        // Steps complete trigger
        $('#completeSetup').click(function() {
            $(this).html('Verifying...').prop('disabled', true);
            newSite.detectAp(newSite.addedSite.domain, $(this));
        });
        $(document).on('click', '#wpCheck', function() {
            $(this).html('Verifying...').prop('disabled', true);
            newSite.detectAp(newSite.addedSite.domain, $(this));
        });

        // Trigger to set cms
        $(document).on('click', '#setCms', function(){ 
            var btn = $(this),
                cms = btn.attr('data-cms-name');
                window.selectedCms = cms;
            newSite.setCms(cms, newSite.addedSite.siteId, btn);
        });

        // Add updated url
        $('#addUpdatedUrl').submit(function(e) {
            e.preventDefault();
            var updatedSite = $(this).serializeArray()[0].value;
            newSite.addAnotherSite(updatedSite, $(this));
        });

    })(adpushup);

});