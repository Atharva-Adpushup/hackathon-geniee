/*
    {
        type: 'country',
        name: 'US',
        info: {
            '336x280': [
                [
                    {
                        bidder: pulsepoint,
                        params: {
                            cf: 123123123,
                            ct: 432534563445
                        }
                    }, 
                    {
                        bidder: wideorbit,
                        params: {
                            cf: 6785453,
                            ct: 123231
                        }
                    }
                ],
            ]
        }
    }
}
*/

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

            // Dynamic UI templates
            templates: {
                selectBoxes: {
                    geoSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select type of Geography</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="geoType" required="required" class="geo-selector"> <option value="country">Country</option> <option value="continent">Continent</option> <option value="all">All</option> </select> </div></div></div>',
                    countrySelect: '<div class="row select-geo-country"> <div class="col-sm-3"> <div class="input-name">Select Country</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="country" required="required" class="geo-country"></select> </div></div></div>',
                    continentSelect: '<div class="row select-geo-continent"> <div class="col-sm-3"> <div class="input-name">Select Continent</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="continent" required="required" class="geo-continent"></select> </div></div></div>',
                    adSizesSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select Ad Size</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="adSize" required="required" class="ad-size"></select> </div></div></div>',
                    hbPartnerSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select Header Bidding Partner</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select class="hb-partner text-capitalize" name="hbPartner" required="required"></select> </div></div></div>'
                }
            },

            // Set geo select box data
            setGeoSelectBoxOptions: function (countrySelect, continentSelect) {
                w.countries.forEach(function (country) {
                    $(countrySelect).append('<option value=' + country.code + '>' + country.name + '</option>');
                });
                $('select option[value=' + this.defaults.country + ']').attr('selected', true);

                w.continents.forEach(function (continent) {
                    $(continentSelect).append('<option value=' + continent.code + '>' + continent.name + '</option>');
                });
            },

            // Set adsize select box data 
            setAdSizeSelectBoxOptions: function (adSizesSelect) {
                w.adSizes.forEach(function (size) {
                    $(adSizesSelect).append('<option value=' + size + '>' + size + '</option>');
                });
            },

            // Set hb partners select box data
            setHbPartnersSelectBoxData: function (hbPartnerSelect) {
                w.hbPartners.forEach(function (partner) {
                    $(hbPartnerSelect).append('<option value=' + partner + '>' + partner + '</option>');
                });
                $(hbPartnerSelect).prepend('<option selected value="">Select partner</option>');
            },

            // Function to render partner options pane
            generatePartnerSpecificOptionsPane: function(pt) {
                var partnerInputTempl = {};

                function getInputTemplate(obj, i) {
                    var g = obj[i],
                        type = g.validations && g.validations.type ? g.validations.type : 'text',
                        required = g.validations && g.validations.required ? '" required="' + g.validations.required : ""
                        readonly = 'isEditable' in g && !g.isEditable ? '" readonly="' + g.isEditable : ""
                        value = g.default ? g.default : '',
                        name = i;

                    var input = '<input class="form-control" type="' + type + required + readonly + '" value="' + value + '" name="' + name + '" placeholder="Please enter '+g.alias+'"/>';
                    return '<div class="row"><div class="col-sm-3 input-name">' + g.alias + '</div><div class="col-sm-3">' + input + '</div></div>';
                };

                for (var p in w.hbConfig) {
                    var partner = w.hbConfig[p], globals = '', locals = '';

                    if (partner.isHb) {
                        for (var global in partner.global) {
                            globals += getInputTemplate(partner.global, global);
                        }

                        for (var local in partner.local) {
                            locals += getInputTemplate(partner.local, local);
                        }
                    }

                    partnerInputTempl[p] = {
                        globalTempl : globals,
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

            // Function to render hb partner setup panel
            renderHbPartnerSetupPanel: function (el, type) {
                var w = $('<div class="hb-config-pane mT-10">' + this.templates.selectBoxes.hbPartnerSelect + '<div class="partner-settings"></div></div>');
                switch(type) {
                    case 'insertBefore':
                        w.insertBefore(el);
                        break;
                    default:
                        el.append(w);
                        break;
                }
                var hbPartner = w.find('.hb-partner');
                this.setHbPartnersSelectBoxData(hbPartner);
            },

            // Function to render multi-config panel
            renderMultiConfigPanel: function(el, action) {
                var w = $('<div class="hb-config-pane mT-10 select-partner"></div>');

                switch(action) {
                    case 'insertBefore':
                        $(w).insertBefore(el);
                        break;
                    default:
                        el.append(w);
                        break;
                }
                
                this.renderHbPartnerSetupPanel(w);
                $(w).append('<button type="button" class="add-partner mT-10 btn btn-lightBg btn-default">Add another partner</button>');

                if(el.children('.select-partner').length === 1) {
                    el.append('<button type="button" class="add-setup mT-10 btn btn-lightBg btn-default">Add another Setup</button>')
                } 
            },

            // Function to render ad size setup panel
            renderAdSizeSetupPanel: function (el, action) {
                var w = $('<div class="hb-config-pane mT-10 select-size">'),
                    s = this.templates.selectBoxes.adSizesSelect;
                w.append(s);

                switch (action) {
                    case 'append':
                        $(el).append(w);
                        break;
                    case 'insertBefore':
                        $(w).insertBefore(el);
                        break;
                }

                var adSize = w.find('.ad-size');
                this.setAdSizeSelectBoxOptions(adSize);
                //this.renderHbPartnerSetupPanel(w);
                //$(w).append('<button type="button" class="add-partner mT-10 btn btn-lightBg btn-default">Add another Setup</button>');

                this.renderMultiConfigPanel(w);
            },

            // Function to render geo setup panel
            renderGeoSetupPanel: function () {
                var s = this.templates.selectBoxes,
                    w = $('<div class="hb-config-pane mb-30">');

                w.append(s.geoSelect + s.countrySelect + s.continentSelect);
                $('#hbform-render').append(w);

                var country = w.find('.geo-country'),
                    continent = w.find('.geo-continent');
                this.setGeoSelectBoxOptions(country, continent);

                this.setGeoSubSelect(this.defaults.geo, $('.geo-selector'));
                this.renderAdSizeSetupPanel(w, 'append');
                $(w).append('<button type="button" class="add-size mT-10 btn btn-lightBg btn-default">Add another size</button>');
            },

            // Functon to convert serialized array to json with header bidding config specific checks
            arrayToJson: function (arr) {
                var json = {}, isCountry, isContinent;

                for (var i = 0; i < arr.length; i++) {
                    var data = arr[i];
                    console.log(data);
                    // switch (data.name) {
                    //     case 'geoType':
                    //         if (data.value === 'country') {
                    //             isCountry = true; isContinent = false;
                    //         }
                    //         else if (data.value === 'continent') {
                    //             isCountry = false; isContinent = true;
                    //         }

                    //         json[data.name] = data.value
                    //         break;
                    //     case 'country':
                    //         isCountry ? json[data.name] = data.value : null;
                    //         break;
                    //     case 'continent':
                    //         isContinent ? json[data.name] = data.value : null;
                    //         break;
                    //     default:
                    //         json[data.name] = data.value;
                    //         break;
                    // }
                }
                //console.log(json);
            },

            // Switch geo selection dropdown in UI
            setGeoSubSelect: function (geo, els) {
                var that = this;
                [].slice.call(els).forEach(function (el) {
                    var geoSelect = $(el).closest('.row').siblings('.select-geo-' + geo);
                    switch (geo) {
                        case 'country':
                            geoSelect.show();
                            geoSelect.find('option[value=' + that.defaults.country + ']').attr('selected', true);
                            geoSelect.siblings('.select-geo-continent').hide();
                            break;
                        case 'continent':
                            geoSelect.show();
                            geoSelect.siblings('.select-geo-country').hide();
                            break;
                        case 'all':
                            $(el).closest('.row').siblings('.select-geo-country').hide()
                            $(el).closest('.row').siblings('.select-geo-continent').hide();
                            break;
                    }
                });
            },

            openPartnerSettingsForm: function (partner) {
                $('#cogs').hide();
                $('#hbForms').show();

                $('div[id^=hbform]').not('#hbform-' + partner).addClass('hide');
                $('#hbform-' + partner).removeClass('hide');
            },

            setHeaderBiddingPartner: function (partner) {
                if (partner) {
                    $('#cogs').show();
                    $('#hbForms').hide();
                    $('#selected-hb').html('Opening settings for ' + partner.toUpperCase());

                    this.openPartnerSettingsForm(partner);
                }
            },

            saveHeaderBiddingSetup: function (data) {
                this.arrayToJson(data);
            },

            // Initialise header bidding setup
            init: function () {
                this.renderGeoSetupPanel();
            }
        };
        ap.headerBiddingSetup.init();

        $('body').on('change', '.geo-selector', function (e) {
            var geo = $(this).val();
            ap.headerBiddingSetup.setGeoSubSelect(geo, $(this)[0]);
        });

        $('body').on('change', '.hb-partner', function (e) {
            var hbPartner = $(this).val(),
                topMostConfigWrapper = $(this).closest('.hb-config-pane');

            hbPartner ? ap.headerBiddingSetup.renderPartnerSetupPanel(hbPartner, topMostConfigWrapper) : null;
        });

        $('#hbform').on('submit', function (e) {
            e.preventDefault();
            var data = $(this).serializeArray();
            ap.headerBiddingSetup.saveHeaderBiddingSetup(data);
        });

        $('#addgeo').on('click', function () {
            ap.headerBiddingSetup.renderGeoSetupPanel();
        });

        $('body').on('click', '.add-size', function () {
            ap.headerBiddingSetup.renderAdSizeSetupPanel($(this), 'insertBefore');
        });

        $('body').on('click', '.add-partner', function () {
            ap.headerBiddingSetup.renderHbPartnerSetupPanel($(this), 'insertBefore');
        });

        $('body').on('click', '.add-setup', function () {
            ap.headerBiddingSetup.renderMultiConfigPanel($(this), 'insertBefore');
        });

    })(adpushup, window);
});