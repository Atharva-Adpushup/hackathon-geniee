// Adpushup setup script - User onboarding + New site addition

$('document').ready(function() {
    (function(ap, w, d) {

        // Save new site object that is attached to adpushup global object 
        var newSite = ap.newSite;

        // Define onboarding sequence object
        ap.onboarding = {
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
                otherPlatformVerification: ' <p class="text-medium text-center" style="margin-top: -10px;">Copy and paste this snippet in the &lt;HEAD&gt; section of your website </p><div class="snippet-wrapper"> <span class="clipboard-copy"> Copied ! </span> <textarea class="snippet" id="header-code" readonly placeholder="AdPushup init code comes here.."></textarea> <div class="snippet-btn-wrapper"> <div><button data-toggle="modal" data-target="#sendToDevModal" id="sendToDev" class="snippet-btn apbtn-main-line apbtn-small"> Send Code to Developer <i class="fa fa-code"></i> </button> <button id="clipboardCopy" class="snippet-btn apbtn-main-line apbtn-small"> Copy to clipboard <i class="fa fa-clipboard"></i> </button> </div></div></div><div class="error-message detectap-error"> <p> Please make sure that the header code is present on the the specified URL </p><div id="detectapError"></div></div><div class="row"> <div class="col-sm-4 col-sm-offset-4"> <button id="apCheck" class="apbtn-main btn-vr btn-wpdt"> Verify </button> </div></div>',
                addOtherSite: '<form id="addSiteAltForm"> <div class="row add-site-alt-form"> <div class="col-sm-8 col-sm-offset-2"> <input name="site" class="input-box" type="url" placeholder="Enter Website URL" required> </div><div class="col-sm-6 col-sm-offset-3"> <button type="submit" class="apbtn-main mT-10"> Add Site </button> </div></div></form>',
                dashboardLink: '<div class="text-center" style="margin-top: 15px;"><a style="font-size: 1.2em;" class="link-primary" href="/user/dashboard">Go to dashboard</a></div>'
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
                var ob = this;
                setTimeout(function() {
                    $('#skipOauth').hide();
                    $('#dsBLink').html(ob.templates.dashboardLink);
                }, 1000);
                $('#completionmodal').modal('show');
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
                if (step >= 2) {
                    this.apVerificationStep();
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
                }
                if (step >= 4) {
                    $('#adsenseoauth').html('Google Adsense Connected '+this.templates.checkIcon);
                }

                switch (step) {
                    case 1:
                        $('#platformVerificationContent').html('<p class="text-center mT-10"><img class="platform-graphic" src="/assets/images/platform.png" width="150" height="150"/></p>');
                        break;
                    case 4:
                        this.setupCompleteAlert();
                        break;
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
                        ob.nextStep(2, 1, 1000);
                        ob.apVerificationStep();
                    } else {
                        ap.apAlert('Some error occurred! Please try again later.', '#apdetect', 'error', 'slideDown');
                        $(btn).html('Add ' + site + ' ?').prop('disabled', false);
                    }
                });
            },

            // Add a new site (default)
            addSite: function(site, url, btn) {
                var ob = this;
                $(btn).html('Adding ' + site + ' ...').prop('disabled', true);
                if(newSite.addOtherSite) {
                    var siteAlreadyAdded = function() {
                        for(var i in currentUser.sites) {
                            if(currentUser.sites[i].domain === url+'/') {
                                return true;
                            }
                        }
                        return false;
                    }

                    if(siteAlreadyAdded()) {
                        ap.apAlert(ob.domanize(url)+' has already been added! Please add a different site.', '#apdetect', 'inverted', 'slideDown');
                        $(btn).html('Add Site').prop('disabled', false);
                    }
                    else {
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
                }
                else {
                    this.saveSiteModel(site, url, newSite.viewObjects.unSavedSiteId, btn);
                }
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
            detectAp: function(addedSite, el) {
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
                                ob.detectApSuccess(ob, el);
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

            // Attach oauth post message hook
            oauthHook: function(event) {
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
                            ap.onboarding.setupCompleteAlert();
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
                var ob = this;
                $.post('/user/setSiteStep', {
                    siteId: newSite.addedSite.siteId,
                    step: 4,
                    completeOnboarding: true
                }, function(response) {
                    if (response.success) {
                        ob.setupCompleteAlert();
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Initialise onboarding
            init: function() {
                this.showIntro();
                this.showStep(newSite.defaultStep);
                this.showAddOtherSite();
            } 
        };
        ap.onboarding.init();



        // OAuth post message hook trigger
        window.addEventListener('message', ap.onboarding.oauthHook, false);

        // Trigger to add user's unsaved site
        $('#addUserSite').click(function(e) {
            var userUnsavedSite = newSite.viewObjects.domanizedUrl,
                userUnsavedSiteId = newSite.viewObjects.unSavedSiteId,
                url = newSite.viewObjects.origUnSavedDomain;
            ap.onboarding.addSite(userUnsavedSite, url, $(this));
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
        $('#adsensenonadmin').click(function() {
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
    })(adpushup, window, document);
});
