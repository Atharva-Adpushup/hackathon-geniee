/*
    [
    {
        type: 'coutnry',
        name: 'US',
        info: {
            '336x280': [{
                    'pulsepoint': {
                        cf: 'test',
                        ct: 'test'
                    }
                }
            }]
    }
}
*/

// Header Bidding setup module script

$(document).ready(function() {
    (function(ap) {
        ap.headerBiddingSetup = {
            defaults: {
                country: 'IN'
            },

            setGeoSubSelect: function(geo) {
                switch(geo) {
                    case 'country':
                        $('#select-geo-'+geo).show();
                        $('select option[value=' + this.defaults.country + ']').attr('selected', true);
                        $('#select-geo-continent').hide();
                        break;
                    case 'continent':
                        $('#select-geo-'+geo).show();
                        $('#select-geo-country').hide();
                        break;
                    case 'all':
                        $('div[id^="select-geo"]').hide();
                        break;
                }   
            },
            
            init: function() {
                this.setGeoSubSelect('country');
            }
        };
        ap.headerBiddingSetup.init();
        
        $('#geo-selector').on('change', function() {
            var geo = $(this).val();
            ap.headerBiddingSetup.setGeoSubSelect(geo);
        });
    })(adpushup);
});