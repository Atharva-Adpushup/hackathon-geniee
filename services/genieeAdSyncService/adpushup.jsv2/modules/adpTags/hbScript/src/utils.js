// Common utility functions

var adp = require('./adp');
var constants = require('./constants');
var utils = {
    ajax: function (data, type) {
        switch (type.toLowerCase()) {
            case 'get':
                return adp.$.get(constants.FEEDBACK_URL + adp.utils.base64Encode(JSON.stringify(data)));
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
    }
}

module.exports = utils;