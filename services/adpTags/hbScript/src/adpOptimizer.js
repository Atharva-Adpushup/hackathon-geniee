// Network optimisation module

var xhr = require('../helpers/xhr'),
    config = require('./config'),
    logger = require('../helpers/logger'),
    utils = require('../helpers/utils'),
    init = function (w) {
        xhr('GET', config.MEDIATION_API_URL, { siteId: config.SITE_ID }, function (err, res) {
            try {
                res = JSON.parse(res);
            } catch (e) {
                logger.log(e);
                return;
            }

            if (err || !res.data) {
                logger.log('Error response from mediation API');
                return;
            }

            if(!w.adpTags.batchPrebiddingComplete) {
                // var priceFloor = res.data.priceFloor.ecpm;
                // console.log('Received price floor : ' + priceFloor);
                // w.adpTags.extendConfig({ ADX_FLOOR: { cpm: priceFloor, key: 'FP_S_A' } });

                // var adsenseCpm = res.data.adsense ? res.data.adsense.ecpm : config.ADSENSE.cpm;
                // console.log('Received adsense ecpm : ' + adsenseCpm);
                // w.adpTags.extendConfig({ ADSENSE: { cpm: adsenseCpm, bidderName: config.ADSENSE.bidderName } });

                // var adxCpm = res.data.adX ? res.data.adX.ecpm : config.ADX.cpm;
                // console.log('Received adx ecpm : ' + adxCpm);
                // w.adpTags.extendConfig({ ADX: { cpm: adxCpm, bidderName: config.ADX.bidderName, adCode: config.ADX.adCode } });

                var champion = res.data.priceFloor.champion;
                console.log('Recieved champion : ' + champion);

                var challenger = res.data.priceFloor.challenger;
                console.log('Recieved challenger : ' + challenger);

                var num = utils.getRandomNumber(1, 100),
                    cpm = num <= 50 ? champion : challenger;
            
                console.log('Selected : ' + cpm);

                w.adpTags.extendConfig({ ADX_FLOOR: { key: 'FP_S_A', cpm: cpm, championChallengerFetched: true } });
            }
        });
    };

module.exports = { init: init };
