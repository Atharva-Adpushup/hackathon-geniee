// Header Bidding setup module script

$(document).ready(function () {
    (function (ap, w) {

        // Header bidding setup object
        ap.headerBiddingSetup = {

            // Default config options
            defaults: {
                country: 'IN',
                geo: 'country'
            },

            // Setup UI templates and selectors
            templates: {
                selectBoxes: {
                    geoSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select type of Geography</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="geoType" required="required" class="geo-selector"> <option value="country">Country</option> <option value="continent">Continent</option> <option value="all">All</option> </select> </div></div></div>',
                    countrySelect: '<div class="row select-geo-country"> <div class="col-sm-3"> <div class="input-name">Select Country</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="country" required="required" class="geo-country"></select> </div></div></div>',
                    continentSelect: '<div class="row select-geo-continent"> <div class="col-sm-3"> <div class="input-name">Select Continent</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="continent" required="required" class="geo-continent"></select> </div></div></div>',
                    adSizesSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select Ad Size</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="adSize" required="required" class="ad-size"></select> </div></div></div>',
                    hbPartnerSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select Header Bidding Partner</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select class="hb-partner text-capitalize" name="hbPartner" required="required"></select> </div></div></div>'
                },
                closeBtn: '<button type="button" class="close hb-close-pane">x</button>',
                defaultSelectBoxOption: '<option selected value="">Select partner</option>',
                buttons: {
                    addPartner: '<button type="button" class="add-partner btn-hb-pane btn btn-lightBg btn-default">Add another partner</button>',
                    addSetup: '<button type="button" class="add-setup btn-hb-pane btn btn-lightBg btn-default">Add another Setup</button>',
                    addSize: '<button type="button" class="add-size btn-hb-pane btn btn-lightBg btn-default">Add another size</button>'
                },
                selectors: {
                    country: '.select-geo-country',
                    continent: '.select-geo-continent'
                }
            },

            // Set geo select box data
            setGeoSelectBoxOptions: function (el, countrySelect, continentSelect, geoSelection) {
                w.countries.forEach(function (country) {
                    $(countrySelect).append('<option value=' + country.code + '>' + country.name + '</option>');
                });
                w.continents.forEach(function (continent) {
                    $(continentSelect).append('<option value=' + continent.code + '>' + continent.name + '</option>');
                });

                if(geoSelection) {
                    $(el).find('select option[value=' + geoSelection + ']').attr('selected', true)
                }
                else {
                    $(el).find('select option[value=' + this.defaults.country + ']').attr('selected', true);
                }
            },

            // Set adsize select box data 
            setAdSizeSelectBoxOptions: function (adSizesSelect, size) {
                w.adSizes.forEach(function (size) {
                    $(adSizesSelect).append('<option value=' + size + '>' + size + '</option>');
                });
                size ? $(adSizesSelect).find(' option[value=' + size + ']').attr('selected', true) : null;
            },

            // Set hb partners select box data
            setHbPartnersSelectBoxData: function (hbPartnerSelect) {
                w.hbPartners.forEach(function (partner) {
                    $(hbPartnerSelect).append('<option value=' + partner + '>' + partner + '</option>');
                });
                $(hbPartnerSelect).prepend(this.templates.defaultSelectBoxOption);
            },

            // Function to dynamically generate input templates for given partner config
            generateInputTemplate: function (obj, i) {
                var g = obj[i],
                    type = g.validations && g.validations.type ? g.validations.type : 'text',
                    required = g.validations && g.validations.required ? '" required="' + g.validations.required : ""
                readonly = 'isEditable' in g && !g.isEditable ? '" readonly="' + g.isEditable : ""
                value = g.default ? g.default : '',
                    name = i;

                var input = '<input class="form-control" type="' + type + required + readonly + '" value="' + value + '" name="' + name + '" placeholder="Please enter ' + g.alias + '"/>';
                return '<div class="row"><div class="col-sm-3 input-name">' + g.alias + '</div><div class="col-sm-3">' + input + '</div></div>';
            },

            // Function to render partner options pane
            generatePartnerSpecificOptionsPane: function (pt) {
                var partnerInputTempl = {};

                for (var p in w.hbConfig) {
                    var partner = w.hbConfig[p], globals = '', locals = '';

                    if (partner.isHb) {
                        for (var global in partner.global) {
                            globals += this.generateInputTemplate(partner.global, global);
                        }

                        for (var local in partner.local) {
                            locals += this.generateInputTemplate(partner.local, local);
                        }
                    }

                    partnerInputTempl[p] = {
                        globalTempl: globals,
                        localTempl: locals
                    };
                }

                return partnerInputTempl[pt];
            },

            // Function to render hb partner specific options
            renderPartnerSetupPanel: function (hbPartner, wrapper) {
                var inputs = this.generatePartnerSpecificOptionsPane(hbPartner);
                wrapper.find('.partner-settings').html(inputs.globalTempl + inputs.localTempl);
            },

            // Generic function to render new setting panel
            renderNewPanel: function (el, wrapper, action, selector, otherEl) {
                if (otherEl) {
                    wrapper.append(otherEl);
                }

                switch (action) {
                    case 'insertBefore':
                        wrapper.insertBefore(el);
                        break;
                    default:
                        el.append(wrapper);
                        break;
                }

                if (!$(el).children().length) {
                    var otherPanels = $(el).parent().children(selector);

                    for (var i = 1; i < otherPanels.length; i++) {
                        $(otherPanels[i]).prepend(this.templates.closeBtn);
                    }
                }
            },

            // Function to render hb partner setup panel
            renderHbPartnerSetupPanel: function (el, action) {
                var w = $('<div class="hb-config-pane mT-20 select-partner-settings">' + this.templates.selectBoxes.hbPartnerSelect + '<div class="partner-settings"></div></div>');
                this.renderNewPanel(el, w, action, '.select-partner-settings');

                var hbPartner = w.find('.hb-partner');
                this.setHbPartnersSelectBoxData(hbPartner);
            },

            // Function to render multi-config panel
            renderMultiConfigPanel: function (el, action) {
                var w = $('<div class="hb-config-pane mT-20 select-partner"></div>');
                this.renderNewPanel(el, w, action, '.select-partner');

                this.renderHbPartnerSetupPanel(w);
                $(w).append(this.templates.buttons.addPartner);

                if (el.children('.select-partner').length === 1) {
                    el.append(this.templates.buttons.addSetup);
                }
            },

            // Function to render ad size setup panel
            renderAdSizeSetupPanel: function (el, adSizeSetup, action) {
                if(adSizeSetup) {
                    for(var size in adSizeSetup) {
                        var w = $('<div class="hb-config-pane mT-20 select-size">'),
                            s = this.templates.selectBoxes.adSizesSelect;
                        this.renderNewPanel(el, w, action, '.select-size', s);

                        var adSize = w.find('.ad-size');
                        this.setAdSizeSelectBoxOptions(adSize, size);
                        this.renderMultiConfigPanel(w);
                    }
                }
                
                // var w = $('<div class="hb-config-pane mT-20 select-size">'),
                //     s = this.templates.selectBoxes.adSizesSelect;
                // this.renderNewPanel(el, w, action, '.select-size', s);

                // var adSize = w.find('.ad-size');
                // this.setAdSizeSelectBoxOptions(adSize, size);
                // this.renderMultiConfigPanel(w);
            },

            // Function to render geo setup panel
            renderGeoSetupPanel: function (geoSetup) {
                var s = this.templates.selectBoxes,
                    w = $('<div class="hb-config-pane select-geo-wrapper mb-30">'),
                    geoSelection = geoSetup ? geoSetup.type : this.defaults.geo;

                w.append(s.geoSelect + s.countrySelect + s.continentSelect);
                $('#hbform-render').append(w);
                $('select option[value=' + geoSelection + ']').attr('selected', true);

                var country = w.find('.geo-country'),
                    continent = w.find('.geo-continent'),
                    geoValue = geoSetup ? (geoSetup.type === 'country' ? geoSetup.country : geoSetup.continent) : null; 
                this.setGeoSelectBoxOptions(w, country, continent, geoValue);

                var otherPanels = $(w).parent().children('.select-geo-wrapper');

                for (var i = 1; i < otherPanels.length; i++) {
                    $(otherPanels[i]).prepend(this.templates.closeBtn);
                }

                this.setGeoSubSelect(geoSelection, $('.geo-selector'), geoValue);

                var adSizeSetup = geoSetup ? geoSetup.info : null;
                this.renderAdSizeSetupPanel(w, adSizeSetup);
                $(w).append(this.templates.buttons.addSize);
            },

            // Load setup data from server 
            loadSetupData: function(hbConfig) {
                var that = this;
                hbConfig.forEach(function(config) {
                    that.renderGeoSetupPanel(config);
                });
            },

            // Function to parse header bidding form data
            parseHbFormData: function (form) {
                var data = [];
                [].slice.call(form.find('.select-geo-wrapper')).forEach(function (geoWrapper) {
                    var obj = {},
                        geo = $(geoWrapper).find('.geo-selector').val();

                    obj['type'] = geo;
                    switch (geo) {
                        case 'country':
                            obj[geo] = $(geoWrapper).find('.geo-country').val();
                            break;
                        case 'continent':
                            obj[geo] = $(geoWrapper).find('.geo-continent').val();
                            break;
                    }

                    obj['info'] = {};
                    [].slice.call($(geoWrapper).find('.select-size')).forEach(function (sizeWrapper) {
                        var size = $(sizeWrapper).find('.ad-size').val();

                        var setups = [];
                        [].slice.call($(sizeWrapper).find('.select-partner')).forEach(function (partnerWrapper) {

                            var arr = [];
                            [].slice.call($(partnerWrapper).find('.select-partner-settings')).forEach(function (partnerSetting) {

                                [].slice.call($(partnerSetting).find('.partner-settings')).forEach(function (partnerData) {
                                    var params = {};

                                    [].slice.call($(partnerData).children()).forEach(function (setting) {
                                        var key = $(setting).find('input').attr('name'),
                                            value = $(setting).find('input').val();

                                        params[key] = value;
                                    });

                                    var data = {
                                        bidder: $(partnerSetting).find('.hb-partner').val(),
                                        params: params
                                    };

                                    arr.push(data);
                                });
                            });
                            setups.push(arr);
                        });
                        obj.info[size] = setups;
                    });
                    data.push(obj);
                });

                return data;
            },

            // Switch geo selection dropdown in UI
            setGeoSubSelect: function (geo, els, geoValue) {
                var that = this;
                [].slice.call(els).forEach(function (el) {
                    var geoSelect = $(el).closest('.row').siblings('.select-geo-' + geo);
                    switch (geo) {
                        case 'country':
                            geoSelect.show();
                            geoSelect.find('option[value=' + geoValue ? geoValue : that.defaults.country + ']').attr('selected', true);
                            geoSelect.siblings(that.templates.selectors.continent).hide();
                            break;
                        case 'continent':
                            geoSelect.show();
                            geoSelect.siblings(that.templates.selectors.country).hide();
                            break;
                        case 'all':
                            $(el).closest('.row').siblings(that.templates.selectors.country).hide();
                            $(el).closest('.row').siblings(that.templates.selectors.continent).hide();
                            break;
                    }
                });
            },

            saveHeaderBiddingSetup: function (form) {
                var data = this.parseHbFormData(form);
                $.ajax({
                    method: 'POST',
                    url: 'saveHeaderBiddingSetup',
                    data: { hbConfig: JSON.stringify(data) }
                }).done(function (res) {
                    if(res.success) {
                        ap.apAlert('Header bidding setup has been saved successfully!', '#hbalert', 'success', 'slideDown');
                    } else {
                        ap.apAlert('Some error occurred! Please try again later.', '#hbalert', 'error', 'slideDown');
                    }
                });
            },

            // Initialise header bidding setup
            init: function () {
                !w.hbSetupData ? this.renderGeoSetupPanel() : this.loadSetupData(w.hbSetupData);
            }
        };
        ap.headerBiddingSetup.init();



        // Header bidding setup triggers

        // Geo-selector change trigger
        $('body').on('change', '.geo-selector', function (e) {
            var geo = $(this).val();
            ap.headerBiddingSetup.setGeoSubSelect(geo, $(this)[0]);
        });

        // Hb partner selection change trigger
        $('body').on('change', '.hb-partner', function (e) {
            var hbPartner = $(this).val(),
                topMostConfigWrapper = $(this).closest('.hb-config-pane');

            hbPartner ? ap.headerBiddingSetup.renderPartnerSetupPanel(hbPartner, topMostConfigWrapper) : null;
        });

        // Geo panel addition trigger
        $('#addgeo').on('click', function () {
            ap.headerBiddingSetup.renderGeoSetupPanel();
        });

        // Size panel addition trigger
        $('body').on('click', '.add-size', function () {
            ap.headerBiddingSetup.renderAdSizeSetupPanel($(this), null, 'insertBefore');
        });

        // Partner panel addition trigger
        $('body').on('click', '.add-partner', function () {
            ap.headerBiddingSetup.renderHbPartnerSetupPanel($(this), 'insertBefore');
        });

        // Setup panel addition trigger
        $('body').on('click', '.add-setup', function () {
            ap.headerBiddingSetup.renderMultiConfigPanel($(this), 'insertBefore');
        });

        // Close panel trigger
        $('body').on('click', '.hb-close-pane', function () {
            $(this).parent().remove();
        });

        // Setup form submit trigger
        $('#hbform').on('submit', function (e) {
            e.preventDefault();
            ap.headerBiddingSetup.saveHeaderBiddingSetup($(this));
        });

    })(adpushup, window);
});