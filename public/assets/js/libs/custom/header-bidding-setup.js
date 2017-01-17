/*
    {
        type: 'country',
        name: 'US',
        info: {
            '336x280': [
                [{
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
                }],
            ]
        }
    }
}
*/

// Header Bidding setup module script

$(document).ready(function() {
    (function(ap, w) {

        // Header bidding setup object
        ap.headerBiddingSetup = {

            // Default config options
            defaults: {
                country: 'IN',
                geo: 'country'
            },

            // Dynamic UI templates
            templates: {
                selectBoxes : {
                    geoSelect: '<div class="row"> <div class="col-sm-3"> <div class="input-name">Select type of Geography</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="geoType" required="required" class="geo-selector"> <option value="country">Country</option> <option value="continent">Continent</option> <option value="all">All</option> </select> </div></div></div>',
                    countrySelect: '<div class="row select-geo-country"> <div class="col-sm-3"> <div class="input-name">Select Country</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="country" required="required" class="geo-country"></select> </div></div></div>',
                    continentSelect: '<div class="row select-geo-continent"> <div class="col-sm-3"> <div class="input-name">Select Continent</div></div><div class="col-sm-3"> <div class="styleSelect select-box-lg"> <select name="continent" required="required" class="geo-continent"></select> </div></div></div>'
                }
            },

            // Set geo select box data
            setGeoSelectBoxOptions: function() {
                w.countries.forEach(function(country) {
                    $('.geo-country').append('<option value='+country.code+'>'+country.name+'</option>');
                });
                $('select option[value=' + this.defaults.country + ']').attr('selected', true);

                w.continents.forEach(function(continent) {
                    $('.geo-continent').append('<option value='+continent.code+'>'+continent.name+'</option>');
                });
                return;
            },

            renderGeoSetupPanel: function() {
                var s = this.templates.selectBoxes;
                $('#hbform-render').append('<div class="hb-config-pane">' + s.geoSelect + s.countrySelect + s.continentSelect + '</div>');

                this.setGeoSelectBoxOptions();
                return this.setGeoSubSelect(this.defaults.geo, $('.geo-selector'));
            },

            // Functon to convert serialized array to json with header bidding config specific checks
            arrayToJson: function(arr) {
                var json = {}, isCountry, isContinent;

                for(var i = 0; i < arr.length; i ++) {
                    var data =  arr[i];
                    switch(data.name) {
                        case 'geoType':
                            if(data.value === 'country') {
                                isCountry = true; isContinent = false;
                            }
                            else if(data.value === 'continent') {
                                isCountry = false; isContinent = true;
                            }

                            json[data.name] = data.value
                            break;
                        case 'country':
                            isCountry ? json[data.name] = data.value : null;
                            break;
                        case 'continent':
                            isContinent ? json[data.name] = data.value : null;
                            break;
                        default:
                            json[data.name] = data.value;
                            break;
                    }
                }
                console.log(json);
            },

            // Switch geo selection dropdown in UI
            setGeoSubSelect: function(geo, els) {
                var that = this;
                [].slice.call(els).forEach(function(el) {
                    var geoSelect = $(el).closest('.row').siblings('.select-geo-'+geo);
                    switch(geo) {
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
                            $(el).closest('.row').siblings().hide();
                            break;
                    }   
                });
            },

            openPartnerSettingsForm: function(partner) {
                $('#cogs').hide();
                $('#hbForms').show();

                $('div[id^=hbform]').not('#hbform-'+partner).addClass('hide');
                $('#hbform-'+partner).removeClass('hide');
            },

            setHeaderBiddingPartner: function(partner) {
                if(partner) {
                    $('#cogs').show();
                    $('#hbForms').hide();
                    $('#selected-hb').html('Opening settings for '+partner.toUpperCase());

                    this.openPartnerSettingsForm(partner);
                }
            },

            saveHeaderBiddingSetup: function(data) {
                this.arrayToJson(data);
            },
            
            init: function() {
                this.renderGeoSetupPanel();
            }
        };
        ap.headerBiddingSetup.init();

        $('body').on('change', '.geo-selector', function(e){
            var geo = $(this).val();
            ap.headerBiddingSetup.setGeoSubSelect(geo, $(this)[0]);
        });

        // $('#hb-partner').on('change', function() {
        //     var hbPartner = $(this).val();
        //     ap.headerBiddingSetup.setHeaderBiddingPartner(hbPartner);
        // });

        $('#hbform').on('submit', function(e) {
            e.preventDefault();
            var data = $(this).serializeArray();
            ap.headerBiddingSetup.saveHeaderBiddingSetup(data);
        });

        $('#addgeo').on('click', function() {
            ap.headerBiddingSetup.renderGeoSetupPanel();
        });

    })(adpushup, window);
});