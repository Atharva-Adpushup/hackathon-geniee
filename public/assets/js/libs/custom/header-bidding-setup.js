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
                defaultSelectBoxOption: '<option selected value="">Select partner</option>',
                buttons: {
                    addPartner: '<button type="button" class="add-partner btn-hb-pane btn btn-lightBg btn-default">Add another bidder</button>',
                    addSetup: '<button type="button" class="add-setup btn-hb-pane btn btn-lightBg btn-default">Add another Setup</button>',
                    addSize: '<button type="button" class="add-size btn-hb-pane btn btn-lightBg btn-default">Add another size</button>',
                    addDFPAdUnit: '<button type="button" id="addDFPAdUnit" class="btn btn-lightBg btn-default btn-close-static">Add another DFP Ad Unit</button>',
                    closeBtn: '<button type="button" class="close hb-close-pane">x</button>',
                    closeBtnStatic: '<button type="button" class="close hb-close-pane hb-close-pane-static">x</button>'
                },
                selectors: {
                    country: '.select-geo-country',
                    continent: '.select-geo-continent',
                    hbSettings: '.hb-settings-pane',
                    dfpTargetingPane: '.dfptargeting-pane',
                    apAlert: '.detectap-alert',
                    dfpAdUnit: '.dfp-adunit',
                    btnStatic: '.btn-close-static',
                    pbPassbackInput: '.pbpassback-input',
                    pbPassbackWrapper: '.pbpassback-wrapper'
                },
                dfpTargeting: {
                    networkId: '<div class="dfptargeting-pane row"><div class="col-sm-3 input-name">Network Id</div><div class="col-sm-4"><input class="form-control" type="text" name="networkId" placeholder="Please enter the network Id" /></div></div>',
                    adUnit: '<div class="row dfptargeting-pane dfp-adunit"><div class="col-sm-3 input-name">Ad Unit</div><div class="col-sm-4"><input class="form-control" type="text" name="dfpAdUnit" placeholder="Please enter DFP Ad unit" /></div></div>'
                },
                pbPassbackInput: '<div class="row pbpassback-input"> <div class="col-sm-3"> <input class="form-control" type="text" name="pbAdUnit" placeholder="Ad Unit"/> </div><div class="col-sm-4"> <input class="form-control" required="required" type="text" name="pbCode" placeholder="Code"/> </div><button type="button" class="close hb-close-pane hb-close-pane-static">x</button></div>'
            },

            // Check whether to show dfp panel or not
            showDFPAdUnitsTargeting: function() {
                var targetAllDfpUnits = $('input[name="targetAllDFP"]:checked').val();
                return targetAllDfpUnits === 'no' ? true : false;
            },

            // Set geo select box data
            setGeoSelectBoxOptions: function (el, countrySelect, continentSelect, geoSetup) {
                w.countries.forEach(function (country) {
                    $(countrySelect).append('<option value=' + country.code + '>' + country.name + '</option>');
                });
                w.continents.forEach(function (continent) {
                    $(continentSelect).append('<option value=' + continent.code + '>' + continent.name + '</option>');
                });

                if(geoSetup) {
                    if(geoSetup.type === 'continent') {
                        $(continentSelect).find('option[value=' + geoSetup.continent + ']').attr('selected', true);
                    }
                    else {
                        $(countrySelect).find('option[value=' + geoSetup.country + ']').attr('selected', true);
                    }
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
            setHbPartnersSelectBoxData: function (hbPartnerSelect, configParams) {
                w.hbPartners.forEach(function (partner) {
                    $(hbPartnerSelect).append('<option value=' + partner + '>' + partner + '</option>');
                });
                $(hbPartnerSelect).prepend(this.templates.defaultSelectBoxOption);

                if(configParams) {
                    var that = this;
                    setTimeout(function() {
                        var pane = $(hbPartnerSelect).closest('.hb-config-pane');
                        $(hbPartnerSelect).find(' option[value=' + configParams.bidder + ']').attr('selected', true);
                        that.renderPartnerSetupPanel(configParams.bidder, pane, configParams.params);
                    }, 0);
                }
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

            // Function to dynamically generate input templates for given partner config
            generateInputTemplate: function (obj, i, params) {
                var g = obj[i],
                    type = g.validations && g.validations.type ? g.validations.type : 'text',
                    required = g.validations && g.validations.required ? '" required="' + g.validations.required : "",
                    readonly = 'isEditable' in g && !g.isEditable ? '" readonly="' + g.isEditable : "",
                    value = g.default ? g.default : '',
                    name = i;

                for(var param in params) {
                    if(param === name) {
                        value = params[param];
                    }
                }

                var input = '<input class="form-control" type="' + type + required + readonly + '" value="' + value + '" name="' + name + '" placeholder="Please enter ' + g.alias + '"/>';
                return '<div class="row"><div class="col-sm-3 input-name">' + g.alias + '</div><div class="col-sm-3">' + input + '</div></div>';
            },

            // Function to render partner options pane
            generatePartnerSpecificOptionsPane: function (pt, params) {
                var partnerInputTempl = {};

                for (var p in w.hbConfig) {
                    var partner = w.hbConfig[p], globals = '', locals = '';

                    if (partner.isHb) {
                        for (var global in partner.global) {
                            globals += this.generateInputTemplate(partner.global, global, params);
                        }

                        for (var local in partner.local) {
                            locals += this.generateInputTemplate(partner.local, local, params);
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
            renderPartnerSetupPanel: function (hbPartner, wrapper, params) {
                var inputs = this.generatePartnerSpecificOptionsPane(hbPartner, params);
                wrapper.find('.partner-settings').html(inputs.globalTempl + inputs.localTempl);
            },
            
            // Function to render postbid passback input
            renderPbPassbackInput: function() {
                $(this.templates.selectors.pbPassbackWrapper).append(this.templates.pbPassbackInput);
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
                        $(otherPanels[i]).prepend(this.templates.buttons.closeBtn);
                    }
                }
            },

            // Function to generate partner settings template
            renderPartnerSettings: function(el, action, configParams) {
                var w = $('<div class="hb-config-pane mT-20 select-partner-settings">' + this.templates.selectBoxes.hbPartnerSelect + '<div class="partner-settings"></div></div>');
                this.renderNewPanel(el, w, action, '.select-partner-settings');

                var hbPartner = w.find('.hb-partner');
                this.setHbPartnersSelectBoxData(hbPartner, configParams);
            },

            // Function to render hb partner setup panel
            renderHbPartnerSetupPanel: function (el, action, adConfig) {
                if(adConfig) {
                    for(var config in adConfig) {
                        var configParams = adConfig[config];
                        this.renderPartnerSettings(el, action, configParams);   
                    }
                } else {
                    this.renderPartnerSettings(el, action);
                }
            },

            // Function to render select partner template
            renderSelectPartner: function(el, action, adConfig) {
                var w = $('<div class="hb-config-pane mT-20 select-partner"></div>');
                this.renderNewPanel(el, w, action, '.select-partner');

                if(adConfig) {
                    this.renderHbPartnerSetupPanel(w, null, adConfig);
                } else {
                    this.renderHbPartnerSetupPanel(w);
                }

                $(w).append(this.templates.buttons.addPartner);

                if (el.children('.select-partner').length === 1) {
                    el.append(this.templates.buttons.addSetup);
                }
            },

            // Function to render multi-config setup panel
            renderMultiConfigPanel: function (el, action, adSetups) {
                if(adSetups) {
                    for(var setup in adSetups) {
                        var adConfig = adSetups[setup];
                        
                        this.renderSelectPartner(el, action, adConfig);
                    }
                }
                else {
                    this.renderSelectPartner(el, action);
                }
            },

            // Function to render select size template
            renderSelectSize: function(el, action, adSetups, size) {
                var w = $('<div class="hb-config-pane mT-20 select-size">'),
                    s = this.templates.selectBoxes.adSizesSelect;
                this.renderNewPanel(el, w, action, '.select-size', s);

                var adSize = w.find('.ad-size');
                this.setAdSizeSelectBoxOptions(adSize, size);

                 if(adSetups) {
                    this.renderMultiConfigPanel(w, null, adSetups);
                } else {
                    this.renderMultiConfigPanel(w);
                }
            },

            // Function to render ad size setup panel
            renderAdSizeSetupPanel: function (el, adSizeSetup, action) {
                if(adSizeSetup) {
                    for(var size in adSizeSetup) {
                        var adSetups = adSizeSetup[size];
                        
                        this.renderSelectSize(el, action, adSetups, size)
                    }
                }
                else {
                    this.renderSelectSize(el, action);
                }
            },

            // Function to set geo panel options
            setGeoPanelOptions: function(w, geoSelection, geoSetup) {
                var country = w.find('.geo-country'),
                    continent = w.find('.geo-continent'),
                    geoValue = geoSetup ? geoSetup : null; 
                this.setGeoSelectBoxOptions(w, country, continent, geoValue);

                if(geoSetup) {
                    w.find('.geo-selector').find('option[value=' + geoSetup.type + ']').attr('selected', true);
                } else {
                     w.find('.geo-selector').find('option[value=' + geoSelection + ']').attr('selected', true);
                }

                var otherPanels = $(w).parent().children('.select-geo-wrapper');

                for (var i = 1; i < otherPanels.length; i++) {
                    $(otherPanels[i]).prepend(this.templates.buttons.closeBtn);
                }

                this.setGeoSubSelect(geoSelection, w.find('.geo-selector'), geoValue);

                var adSizeSetup = geoSetup ? geoSetup.info : null;
                this.renderAdSizeSetupPanel(w, adSizeSetup);
                $(w).append(this.templates.buttons.addSize);
            },

            // Function to render geo setup panel
            renderGeoSetupPanel: function (geoSetup) {
                var s = this.templates.selectBoxes,
                    w = $('<div class="hb-config-pane select-geo-wrapper mb-30">'),
                    geoSelection = geoSetup ? geoSetup.type : this.defaults.geo;

                w.append(s.geoSelect + s.countrySelect + s.continentSelect);
                $('#hbform-render').append(w);
                
                this.setGeoPanelOptions(w, geoSelection, geoSetup);
            },

            // Load setup data from server 
            loadSetupData: function(hbConfig) {
                var that = this;
                hbConfig.forEach(function(config) {
                    that.renderGeoSetupPanel(config);
                });
            },

            // Function to save Hb config settings
            saveHbConfigSettings: function() {
                var settings = {
                    'prebidTimeout': parseInt($('input[name="prebidTimeout').val(), 10),
                    'e3FeedbackUrl': $('input[name="e3FeedbackUrl"]').val()
                };
                settings.targetAllDFP = this.showDFPAdUnitsTargeting() ? false : true; 

                if(this.showDFPAdUnitsTargeting()) {
                    var networkId = parseInt($('input[name="networkId"]').val(), 10);
                    settings.dfpAdUnitTargeting = {
                        networkId: networkId ? networkId : w.defaultNetworkId
                    };

                    var dfpAdUnitInputs = $('input[name="dfpAdUnit"]'), 
                        adUnits = [];
                    dfpAdUnitInputs.each(function(i, el) {
                        var val = $(el).val();
                        val ? adUnits.push(val) : null;
                    });

                    settings.dfpAdUnitTargeting.adUnits = adUnits;
                } else {
                    delete settings['dfpAdUnitTargeting'];
                }   

                var passBacks = $('.pbpassback-input'),
                    postBidPassbacks = {};
                
                passBacks.each(function(i, p) {
                    var pbAdUnit = $(p).find('input[name="pbAdUnit"]').val(),
                        pbCode = $(p).find('input[name="pbCode"]').val();

                    (pbAdUnit && pbCode) ? postBidPassbacks[pbAdUnit] = pbCode : null;
                });
                settings.postbidPassbacks = postBidPassbacks;

                return settings;
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
                    
                return {
                    setup: data,
                    settings: this.saveHbConfigSettings()
                };
            },

            saveHeaderBiddingSetup: function (form) {
                var data = this.parseHbFormData(form),
                    operation = $('#setupOp').val(),
                    that = this;
                $.ajax({
                    method: 'POST',
                    url: 'saveHeaderBiddingSetup',
                    data: { hbConfig: JSON.stringify(data), op: operation }
                }).done(function (res) {
                    if(res.success) {
                        ap.apAlert('Header bidding setup has been saved successfully!', '#hbalert', 'success', 'slideDown');
                    } else {
                        ap.apAlert('Some error occurred! Please try again later.', '#hbalert', 'error', 'slideDown');
                    }
                });

                setTimeout(function() { $(that.templates.selectors.apAlert).slideUp() }, 2500);
            },

            // Render DFP ad unit input
            renderDFPAdUnitInput: function(adUnits, el, action) {
                if(!adUnits) {
                    action !== 'insertBefore' ? $(this.templates.selectors.hbSettings).append(this.templates.dfpTargeting.adUnit) : $(this.templates.dfpTargeting.adUnit).insertBefore(el);
                    $(this.templates.selectors.dfpAdUnit+':not(:first)').append(this.templates.buttons.closeBtnStatic);  
                } else {
                    var s = $(this.templates.selectors.dfpTargetingPane),
                        that = this;

                    if(adUnits.length) {
                        adUnits.forEach(function(adUnit, key) {
                            var dfpAdUnitInput = $(that.templates.dfpTargeting.adUnit),
                                siblings = $(s).siblings(that.templates.selectors.dfpTargetingPane);

                            if(siblings.length >= 1) {
                                dfpAdUnitInput.insertAfter(siblings[key-1]);
                                dfpAdUnitInput.append(that.templates.buttons.closeBtnStatic);
                            } else {
                                dfpAdUnitInput.insertAfter(s);
                            }

                            $(dfpAdUnitInput).find('input').val(adUnit);
                        });
                    } else {
                        $(that.templates.dfpTargeting.adUnit).insertAfter(s);
                    }
                }
            },

            // Show dfp settings pane
            showDfpTargetingPane: function(settings) {
                if(this.showDFPAdUnitsTargeting()) {
                    $(this.templates.selectors.hbSettings).append(this.templates.dfpTargeting.networkId);
                    (settings && settings.dfpAdUnitTargeting && settings.dfpAdUnitTargeting.networkId) ? $('input[name="networkId"]').val(settings.dfpAdUnitTargeting.networkId) : $('input[name="networkId"]').val(w.defaultNetworkId); 

                    if(settings && settings.dfpAdUnitTargeting && settings.dfpAdUnitTargeting.adUnits) {
                        this.renderDFPAdUnitInput(settings.dfpAdUnitTargeting.adUnits);
                    } else {
                        this.renderDFPAdUnitInput();
                    }
                    
                    $(this.templates.selectors.dfpAdUnit+':last-child').after(this.templates.buttons.addDFPAdUnit);
                } else {
                    var dfpTargetingPane = $(this.templates.selectors.dfpTargetingPane);
                    if(dfpTargetingPane) {
                        $(dfpTargetingPane).remove();
                        $(this.templates.selectors.btnStatic).remove();
                    }
                }
            },

            // Initialise header bidding setup
            init: function () {
                var setupData = w.hbSetupData ? w.hbSetupData.setup : null,
                    settings = w.hbSetupData ? w.hbSetupData.settings : null;

                this.showDfpTargetingPane(settings);
                !w.hbSetupData ? this.renderGeoSetupPanel() : this.loadSetupData(setupData);
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

        // Dfp targeting trigger
        $('input[name="targetAllDFP"]').on('change', function () {
            ap.headerBiddingSetup.showDfpTargetingPane();
        });

        // Size panel addition trigger
        $('body').on('click', '.add-size', function () {
            ap.headerBiddingSetup.renderAdSizeSetupPanel($(this), null, 'insertBefore');
        });

        // Postbid passback addition trigger
        $('#addpostbid-passback').on('click', function() {
            ap.headerBiddingSetup.renderPbPassbackInput();
        });

        // Partner panel addition trigger
        $('body').on('click', '.add-partner', function () {
            ap.headerBiddingSetup.renderHbPartnerSetupPanel($(this), 'insertBefore');
        });

        // DFP Ad unit addition trigger
        $('body').on('click', '#addDFPAdUnit', function () {
            ap.headerBiddingSetup.renderDFPAdUnitInput(null, $(this), 'insertBefore');
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