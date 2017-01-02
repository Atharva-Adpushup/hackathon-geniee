// Global settings module script

$(document).ready(function () {
    (function (w, d) {

        // Settings module object
        var settingsModule = {

            // Settings templates
            templates: {
                headerCode: "(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/" + w.selectedSiteId + "/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);",
                closeBtn: '<span class="pull-right removeBlocklistItem"><i class="fa fa-close"></i></span>'
            },

            // Function to generate header code
            generateHeaderCode: function() {
                $('#header-code').text('<script data-cfasync="false" type="text/javascript">' + this.templates.headerCode + '</script>');
            },

            // Function to render block list items
            renderBlocklistItems: function() {
                var that = this;
                if(w.blocklist[0] !== '') {
                    $('.blocklist').html('');
                    w.blocklist.forEach(function(item) {
                        $('.blocklist').append('<li>' + item + that.templates.closeBtn + '</li>');
                    });
                }
            },

            // Function to add item to blocklist
            addToBlocklist: function(blocklistItem, input) {
                if(blocklistItem) {
                    var alreadyAdded = w.blocklist.find(function(item) {
                        return item === blocklistItem;
                    });

                    if(!alreadyAdded) {
                        w.blocklist.push(blocklistItem);
                        this.renderBlocklistItems();
                        $('#blocklistErr').html('');
                        $(input).val('');
                    }
                    else {
                        $('#blocklistErr').html('This item has already been added to the blocklist');
                    }
                }
            },

            // Function to remove item from blocklist
            removeFromBlocklist: function(item) {
                w.blocklist.splice(w.blocklist.indexOf(item), 1);
                this.renderBlocklistItems();
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
                    autoOptimise: autoOpt,
                    blocklist: JSON.stringify(w.blocklist)
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
                this.renderBlocklistItems();
                this.generateHeaderCode();
            }
        };
        settingsModule.init();



        // Auto optimise check trigger
        var autoOptimise;
        $('#autoOptimise').on('change', function () {
            autoOptimise = $(this).prop('checked');
            !autoOptimise ? $('#autoOptimiseErr').html('Auto Optimise is <strong>disabled</strong> now. Please set the traffic distribution for your variations manually to prevent unpredictable results. ') : $('#autoOptimiseErr').html('');
        });

        // Copy to clipboard trigger
        $(d).on('click', '#clipboardCopy, #header-code', function () {
            settingsModule.copyToClipboard();
        });

        // Send code to dev trigger
        $('#sendCodeForm').submit(function (e) {
            e.preventDefault();
            $('#headerCodeInput').val($('#header-code').val());

            var data = $(this).serialize(),
                btn = $('#sendCodeSubmit');
            settingsModule.sendHeaderCode(data, btn);
        });

        // Add to blocklist trigger
        $('#addBlocklistItem').on('click', function() {
            var blocklistItem = $('#blocklistItem').val();
            settingsModule.addToBlocklist(blocklistItem, '#blocklistItem');
        });

        // Remove from blocklist trigger
        $(d).on('click', '.removeBlocklistItem', function () {
            var itemToRemove = $(this).closest('li').text();
            settingsModule.removeFromBlocklist(itemToRemove);
        });

        // Save settings trigger
        $('#saveSiteSettings').on('submit', function (e) {
            e.preventDefault();

            var formValues = $(this).serializeArray();
            settingsModule.saveSiteSettings(formValues);
        });
    })(window, document);
});