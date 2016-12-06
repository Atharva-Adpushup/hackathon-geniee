// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {

    (function(ap) {
        
        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
            
            templates: {
                cmsWordpress: '<button class="apbtn-main-line ob-bigbtn" id="setCms" data-cms-name="wordpress"><i class="fa fa-wordpress"></i> Wordpress</button>',

                cmsOther: '<button class="apbtn-main ob-bigbtn" id="setCms" data-cms-name="">Other</button>',

                wordpressPlugin: '<div class="row"><div class="col-sm-4 col-sm-offset-4"><a href="https://wordpress.org/plugins/adpushup/" target="_blank" class="apbtn-main-line ob-bigbtn"><i class="fa fa-wordpress"></i> Install Plugin</a></div></div><p class="text-medium-nm text-center">After you install plugin, please configure Site ID - <strong>'+newSite.viewObjects.unSavedSiteId+'</strong> by going to <strong>Wordpress</strong> > <strong>Settings</strong> > <strong>Adpushup Settings</strong></p><div class="row"><div class="col-sm-4 col-sm-offset-4"><button id="wpCheck" class="apbtn-main">I\'ve done this</button></div></div>'
            },

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

            detectCms: function(site) {
                var ob = this;

                $.get('/proxy/detectCms?site='+site, {}, function(res) {
                    ob.manipulateElem('#cms-text', 'We have auto detected and selected this for you.', 'html')
                    $('#ob-loader').remove();

                    if(!res.wordpress && !res.ap) {
                        ob.manipulateElem('#cms-res', '<div class="row"><div class="col-sm-4 col-sm-offset-2">'+ob.templates.cmsWordpress+'</div><div class="col-sm-4">'+ob.templates.cmsOther+'</div></div>', 'htmlFadeIn', 600)
                    }
                    else if(res.wordpress) {
                        ob.manipulateElem('#cms-res', '<div class="row"><div class="col-sm-4 col-sm-offset-4">'+ob.templates.cmsWordpress+'</div></div>', 'htmlFadeIn', 600);
                    }
                });
            },

            checkCmsStep: function() {
                ap.showLoader('#ob-loader', 'ob-loader');
                this.manipulateElem('#cms-text', 'Please wait while we inspect your website...', 'html');
                this.detectCms(newSite.addedSite.domain);
            },
            
            showStep: function(step) {
                $('#step' + step + ' .ob-content').show();

                switch(parseInt(step)) {
                    case 2:
                        this.checkCmsStep();
                        break;
                }

                // Set ticks for all other steps in UI
                for(var i = 1; i < step; i++) {
                    this.manipulateElem('#step' + parseInt(i) + ' > .ob-heading', {'border-bottom': 'none', 'padding-bottom': 0}, 'css');
                    this.manipulateElem('#step' + parseInt(i) + '-check', 'fa-check-circle zoomIn', 'class');
                }

                // Generate header code step if all other steps are complete
                if(parseInt(step) === this.totalSteps) {

                    // Generate header code with site id
                    var headerCode = '!function(w,d){var adp,config,tL,siteId='+newSite.addedSite.siteId;
                    
                    // Populate header code in textarea
                    this.manipulateElem('#header-code', '<script data-cfasync="false" type="text/javascript">'+headerCode+'</script>', 'text');
                }
            },

            nextStep: function(to, from, duration) {
                var ob = this;

                ob.manipulateElem('#step'+from + '-check', 'fa-check-circle zoomIn', 'class');
                setTimeout(function() {
                    ob.manipulateElem('#step' + from + ' > .ob-heading', {'border-bottom': 'none', 'padding-bottom': 0}, 'css');
                    $('#step'+to + ' .ob-content').slideDown();
                    $('#step'+from + ' .ob-content').slideUp();
                }, duration);

                switch(to) {
                    case 2:
                        this.checkCmsStep();
                        break;
                }
            },

            addSite: function(site, url) {
                var ob = this;

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

                        ob.manipulateElem('#addSiteStr', '<h2 class="text-appear"><span>' + site + '</span> has been Added!</h2>', 'html');

                        ob.nextStep(2, 1, 1000);
                    }
                    else {
                        ap.apAlert('Some error occurred!', '#apdetect', 'error', 'slideDown');
                    }
                });
            },

            saveCms: function(cmsName, siteId, btn) {
                var ob = this;

                btn.html('Saving...').prop('disabled', true);
                $.post('/data/saveCms', {
                    cmsName: cmsName,
                    siteId: siteId
                }, function(res) {
                    if(res.success) {
                        if(cmsName !== 'wordpress') {
                            ob.nextStep(3, 2, 1000);
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
                            step: window.selectedCms === 'wordpress' ? 4 : 3
                        }, function(response) {
                            if(response.success) {

                                if(window.selectedCms === 'wordpress') {
                                    ob.nextStep(4, 2, 1000);
                                }
                                else{
                                    ob.nextStep(3, 2, 1000);
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

            openOauthWindow: function() {
                var x = screen.width / 2 - 700 / 2;
                var y = screen.height / 2 - 450 / 2;

                window.open("/user/requestOauth", 'Oauth Request', 'height=485,width=700,left=' + x + ',top=' + y);
            }

        };
        ap.onboarding.showStep(newSite.defaultStep);

            
       
        

      

       



        

        // Add user's unsaved site
        $('#addUserSite').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            ap.onboarding.addSite(userUnsavedSite, url);
        });

        // Trigger to set cms
        $(document).on('click', '#setCms', function(){ 
            var btn = $(this),
                cms = btn.attr('data-cms-name');
                window.selectedCms = cms;
            ap.onboarding.saveCms(cms, newSite.addedSite.siteId, btn);
        });

        // Trigger to detect ap
        $(document).on('click', '#wpCheck', function() {
            $(this).html('Verifying...').prop('disabled', true);
            ap.onboarding.detectAp(newSite.addedSite.domain, $(this));
        });

        // Trigger to get adsense Oauth
        $('#adsenseoauth').click(function() {
            ap.onboarding.openOauthWindow();
        });

    })(adpushup);

});