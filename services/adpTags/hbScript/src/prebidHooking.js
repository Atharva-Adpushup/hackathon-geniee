// Prebid hooking module for adsense and adx

var config = require('./config'),
    utils = require('../helpers/utils'),
    pushFakeBidToPrebid = function (adpSlot, pbjsParams, bidParams) {
        var date = Date.now(),
            adId = utils.generateUUID(null),
            width = adpSlot.size[0],
            height = adpSlot.size[1],
            requestId = pbjsParams._bidsReceived.length ? pbjsParams._bidsReceived[0].requestId : utils.generateUUID(null),
            cpm = pbjs.getPriceBucketString(bidParams.cpm).dense;        

        pbjsParams._bidsReceived.push({
            ad: bidParams.ad,
            adId: adId,
            adUnitCode: adpSlot.containerId,
            adserverTargeting: {
                hb_adid: adId,
                hb_bidder: bidParams.bidderName,
                hb_pb: cpm,
                hb_size: width + 'x' + height
            },
            bidder: bidParams.bidderName,
            bidderCode: bidParams.bidderName,
            cpm: cpm,
            height: height,
            pbAg: "0.00",
            pbCg: "",
            pbDg: cpm,
            pbHg: cpm,
            pbLg: "0.0",
            pbMg: "0.0",
            requestId: requestId,
            requestTimestamp: date,
            responseTimestamp: date,
            size: width + 'x' + height,
            statusMessage: "Bid available",
            timeToRespond: 2,
            width: width
        });
    },
    applyAdxHook = function (adpSlot, pbjsParams) {
        var cpm = config.ADX.cpm,
            ad = config.ADX.adCode
                .replace('__SIZE_W__', adpSlot.size[0])
                .replace('__SIZE_H__', adpSlot.size[1]),
            bidParams = {
                ad: ad,
                cpm: config.ADX.cpm.toFixed(2),
                bidderName: config.ADX.bidderName
            };

        pushFakeBidToPrebid(adpSlot, pbjsParams, bidParams);
    },
    applyAdsenseHook = function (adpSlot, pbjsParams) {
        var cpm = config.ADSENSE.cpm,
            bidParams = {
                ad: atob(adpSlot.adsenseAdCode),
                cpm: config.ADSENSE.cpm.toFixed(2),
                bidderName: config.ADSENSE.bidderName
            };

        pushFakeBidToPrebid(adpSlot, pbjsParams, bidParams);
    },
    prebidHooking = function (adpSlots, pbjsParams) {
        adpSlots.forEach(function (adpSlot) {

            // Apply adx hooking
            applyAdxHook(adpSlot, pbjsParams);

            // Apply adsense hooking only if adsense ad code is provided by user
            if (adpSlot.adsenseAdCode) {
                applyAdsenseHook(adpSlot, pbjsParams);
            }
        });
    };

module.exports = prebidHooking;