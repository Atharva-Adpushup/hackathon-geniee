$(document).ready(function () {
    (function (w, d) {

        // Settings module object
        var settingsModule = {

            // Settings templates
            templates: {
                headerCode: "(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/" + w.selectedSiteId + "/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);"
            },

            // Function to generate header code
            generateHeaderCode: function() {
                $('#header-code').text('<script data-cfasync="false" type="text/javascript">' + this.templates.headerCode + '</script>');
            },

            // Function to render block list items
            renderBlocklistItems: function(blocklist) {
                if(blocklist.length) {
                    w.blocklist.forEach(function(item) {
                        $('.blocklist').append('<li>'+item+'</li>');
                    });
                }
            },

            // Function to parse form data
            parseFormData: function(values, type) {
                switch (type) {
                    case 'pageGroups':
                        var pageGroups = [];

                        for (var i = 0; i < values.length; i += 2) {
                            var json = {};
                            if (values[i].name === 'pageGroupPattern') {
                                json[values[i].value] = values[i + 1].value;
                                pageGroups.push(json);
                            }
                        }

                        return pageGroups;
                    case 'other':
                        var otherSettings = {};
                        for (var i = 0; i < values.length; i++) {
                            if (values[i].name !== 'pageGroupPattern') {
                                otherSettings[values[i].name] = values[i].value;
                            }
                        }

                        return otherSettings;
                };
            },

            // Function to save site settings
            saveSiteSettings: function(formValues) {
                 var autoOpt = this.parseFormData(formValues, 'other').autoOptimise ? true : false,
                    pageGroupPattern = JSON.stringify(this.parseFormData(formValues, 'pageGroups')),
                    otherSettings = JSON.stringify(this.parseFormData(formValues, 'other'));
                $.post('saveSiteSettings', {
                    pageGroupPattern: pageGroupPattern,
                    otherSettings: otherSettings,
                    autoOptimise: autoOpt
                }, function (res) {
                    if (res.success) {
                        alert('Settings saved!');
                    }
                    else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Copy header code to clipboard
            copyToClipboard: function() {
                $('.clipboard-copy').fadeIn();
                setTimeout(function () {
                    $('.clipboard-copy').fadeOut();
                }, 1500);
                $('#header-code').select();
                d.execCommand('copy');
            },

            // Send header code to developer
            sendHeaderCode: function(data, btn) {
                $(btn).prop('disabled', true).html('Sending...');
                $.post('/user/sendCode', data, function (res) {
                    if (res.success) {
                        $('#sendCodeSubmit').css('opacity', 1).html('Code sent successfully!');
                        setTimeout(function () {
                            $('#sendToDevModal').modal('toggle');
                            $(btn).prop('disabled', false).html('Send');
                        }, 2000);
                    } else {
                        alert('Some error occurred!');
                    }
                });
            },

            // Initialise settings module
            init: function(list) {
                this.renderBlocklistItems(list);
                this.generateHeaderCode();
            }
        };
        settingsModule.init(w.blocklist);



        var autoOptimise;
        $('#autoOptimise').on('change', function () {
            autoOptimise = $(this).prop('checked');
            !autoOptimise ? $('#autoOptimiseErr').html('Auto Optimise is <strong>disabled</strong> now. Please set the traffic distribution for your variations manually to prevent unpredictable results. ') : $('#autoOptimiseErr').html('');
        });

        $(d).on('click', '#clipboardCopy, #header-code', function () {
            settingsModule.copyToClipboard();
        });

        $('#sendCodeForm').submit(function (e) {
            e.preventDefault();
            $('#headerCodeInput').val($('#header-code').val());

            var data = $(this).serialize(),
                btn = $('#sendCodeSubmit');
            settingsModule.sendHeaderCode(data, btn);
        });

        $('#saveSiteSettings').on('submit', function (e) {
            e.preventDefault();

            var formValues = $(this).serializeArray();
            settingsModule.saveSiteSettings(formValues);
        });
    })(window, document);
});