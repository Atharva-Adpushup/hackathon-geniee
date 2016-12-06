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
                var headerCode = "(function(w, d) { var s = d.createElement('script'); s.src = '//delivery.adrecover.com/" + newSite.addedSite.siteId + "/adRecover.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);";

                // Populate header code in textarea
                $('#header-code').text('<script type="text/javascript">'+headerCode+'</script>');
            }
        };
        newSite.showStep(newSite.defaultStep);

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
                    var headerCode = "(function(w, d) { var s = d.createElement('script'); s.src = '//delivery.adrecover.com/" + newSite.addedSite.siteId + "/adRecover.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);";

                    // Populate header code in textarea
                    $('#header-code').text('<script type="text/javascript">'+headerCode+'</script>');

                    // Go to next step
                    newSite.nextStep(2, 1, 1000);
                }
                else {
                    //alert(res.error);
                    ap.apAlert(res.error, '#ardetect', 'error', 'slideDown');
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

        // Function to detect Adrecover on added website
        newSite.detectAdRecover = function(addedSite, update) {
            $.get('/proxy/detectap', {
                'url': addedSite
            }, function(res) {
                if (res.ar) {
                    var d = new Date();

                    // If adrecover is detected then create entry in ops sheet
                    $.post('https://hooks.zapier.com/hooks/catch/547126/4knzhs', {
                        siteId: newSite.addedSite.siteId,
                        domainname: addedSite,
                        currentstatus: 'Pending',
                        timeofentrygmt: d.toDateString()
                    }, function(resp) {
                        if (resp.status === 'success') {

                            // Set site status as verified
                            $.post('/user/verifySite', {
                                siteId: newSite.addedSite.siteId,
                                measure: newSite.adRecoverPreferences.measure,
                                monetize: newSite.adRecoverPreferences.monetize,
                                step: 4
                            }, function(response) {
                                if(response.success) {
                                    ap.apAlert('AdRecover has been successfully detected on the website!', '#ardetect', 'success', 'slideDown');
                                   
                                    $('#completeSetup').html('Setup Complete! <div>Our advisors will get in touch with you soon. <br/> You can also contact us at <a href="mailto:contact@adrecover.com">contact@adrecover.com</a></div><a class="arbtn-main" style="font-size: 1em;" href="/user/dashboard">Go to Dashboard</a>').prop('disabled', true).css('opacity', 1).addClass('btn-setup-complete');
                                    $('#step'+ newSite.totalSteps + '-check').addClass('fa-check-circle zoomIn');
                                    $('.detectap-error').slideUp();
                                }
                                else {
                                    alert('Some error occurred!');
                                }
                            });
                        }
                        else {
                            alert('Some error occurred!');
                        }
                    });
                } else {
                    ap.apAlert('AdRecover was not detected on the website!', '#ardetect', 'error', 'slideDown');

                    $('.detectap-error').fadeIn();
                    $('#completeSetup').html('Verify').prop('disabled', false);
                    if (update !== '') {
                        $('#addUpdatedUrlBtn').html('Add').prop('disabled', false);
                    }
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
            newSite.detectAdRecover(newSite.addedSite.domain);
        });

        // Add updated url
        $('#addUpdatedUrl').submit(function(e) {
            e.preventDefault();
            var updatedSite = $(this).serializeArray()[0].value;
            newSite.addAnotherSite(updatedSite, $(this));
        });

    })(adpushup);

});