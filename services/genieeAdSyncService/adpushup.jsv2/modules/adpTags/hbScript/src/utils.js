// Common utility functions

var utils = {
    isValidThirdPartyDFPAndCurrencyConfig: function (inputObject) {
        var inputObject = inputObject || window.adpushup.config,
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