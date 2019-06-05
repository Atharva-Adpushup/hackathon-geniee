// Utility functions

var adp = require('./adp');
var find = require('lodash.find');
var utils = {
    ajax: function (type, url, data) {
        switch (type.toLowerCase()) {
            case 'get':
                return adp.$.get(url + adp.utils.base64Encode(JSON.stringify(data)));
        }
    },
    isValidThirdPartyDFPAndCurrencyConfig: function (inputObject) {
        var inputObject = inputObject || adp.config,
            isActiveDFPNetwork = !!(inputObject.activeDFPNetwork && inputObject.activeDFPNetwork.length),
            isActiveDFPCurrencyCode = !!(
                inputObject.activeDFPCurrencyCode &&
                inputObject.activeDFPCurrencyCode.length &&
                inputObject.activeDFPCurrencyCode.length === 3
            ),
            isPrebidGranularityMultiplier = !!(
                inputObject.prebidGranularityMultiplier && Number(inputObject.prebidGranularityMultiplier)
            ),
            isActiveDFPCurrencyExchangeRate = !!(
                inputObject.activeDFPCurrencyExchangeRate &&
                Object.keys(inputObject.activeDFPCurrencyExchangeRate).length
            ),
            isValidResult = !!(
                isActiveDFPNetwork &&
                isActiveDFPCurrencyCode &&
                isPrebidGranularityMultiplier &&
                isActiveDFPCurrencyExchangeRate
            );

        return isValidResult;
    },
    getActiveDFPNetwork: function () {
        if (adp && adp.config) {
            return adp.config.activeDFPNetwork;
        }
        return null;
    },
    hashCode: function (str) {
        var hash = 0;
        var char;
        if (str.length === 0) return hash;
        for (var i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },
    addBatchIdToAdpSlots: function (adpSlots, batchId) {
        Object.keys(adpSlots).forEach(function (slot) {
            adpSlots[slot].batchId = batchId;
        });
    },
    getCurrentAdpSlotBatch: function (adpBatches, batchId) {
        return find(adpBatches, function (batch) {
            return batch.batchId === batchId;
        }).adpSlots;
    }
}

module.exports = utils;