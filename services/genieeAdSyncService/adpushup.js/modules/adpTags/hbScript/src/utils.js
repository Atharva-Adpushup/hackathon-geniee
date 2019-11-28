// Utility functions

var adp = require('./adp');
var find = require('lodash.find');
var $ = require('jquery');
var utils = {
    currencyConversionActive: function (inputObject) {
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
    getSectionId: function (containerId) {
        if (document.getElementById(containerId)) {
            var parent = document.getElementById(containerId).parentNode;

            if (parent && parent.hasAttribute('data-section')) {
                return parent.getAttribute('data-section');
            }
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
    removeElementArrayFromCollection: function (collection, elArray) {
        var inputCollection = collection.concat([]),
            isValidCollection = !!inputCollection.length,
            isElArray = !!(elArray && elArray.length);

        if (!isValidCollection) {
            return null;
        }

        inputCollection.forEach(function (item, idx) {
            var isElArrayMatch = !!(item && isElArray && item[0] === elArray[0] && item[1] === elArray[1]);

            if (isElArrayMatch) {
                collection.splice(idx, 1);
                return false;
            }
        });

        return collection;
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
    },
    log: function () {
        var queryParams = this.queryParams;
        var isQueryParams = !!(
            queryParams &&
            $.isPlainObject(queryParams) &&
            !$.isEmptyObject(queryParams)
        ),
            isapDebugParam = !!(isQueryParams && queryParams.apDebug);

        if (typeof console !== 'undefined' && console.log && isapDebugParam)
            console.log.apply(console, arguments);
    },
    queryParams: (function() {
		var str = window.location.search,
			objURL = {};

		str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function($0, $1, $2, $3) {
			var queryStringKey = $1 || '',
				queryStringValue = $3 || '';

			objURL[queryStringKey] = window.decodeURIComponent(queryStringValue.replace(/\+/g, ' '));
		});

		return objURL;
	})(),
}

module.exports = utils;