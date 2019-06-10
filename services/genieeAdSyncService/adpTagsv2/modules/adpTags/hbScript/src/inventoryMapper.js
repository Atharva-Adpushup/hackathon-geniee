// Slot inventory mapper

var adp = require('./adp');
var inventoryMapper = {
    //  inventoryMapper: function (size, optionalParam) {
    //         // Reset inventory as default if site is SPA
    //         if (adp.config.isSPA) {
    //             inventory = adp.$.extend(true, {}, adp.adpTags.defaultInventory);
    //         }

    //         var width = size[0];
    //         var height = size[1];
    //         var size = width + 'x' + height;
    //         var dfpAdUnit = null;
    //         var availableSlots = inventory.dfpAdUnits[size];
    //         var bidders = [];
    //         var hbConfig = inventory.hbConfig;

    //         if (optionalParam.headerBidding && hbConfig && Object.keys(hbConfig).length) {
    //             var updatedSize = size;
    //             if (optionalParam.overrideActive && optionalParam.overrideSizeTo) {
    //                 updatedSize = optionalParam.overrideSizeTo;
    //             }

    //             Object.keys(hbConfig).forEach(function (bidder) {
    //                 var bidderData = hbConfig[bidder];

    //                 if (!bidderData.isPaused) {
    //                     if (bidderData.sizeLess) {
    //                         bidders.push({
    //                             bidder: bidder,
    //                             params: bidderData.config
    //                         });
    //                     }

    //                     if (!bidderData.sizeLess && bidderData.reusable) {
    //                         bidders.push({
    //                             bidder: bidder,
    //                             params: bidderData.config[updatedSize]
    //                         });
    //                     }
    //                 }
    //             });
    //         }

    //         if (availableSlots.length) {
    //             if (optionalParam.dfpAdunit && availableSlots.indexOf(optionalParam.dfpAdunit) !== -1) {
    //                 if (optionalParam.isManual) {
    //                     dfpAdUnit = optionalParam.dfpAdunit;
    //                 } else {
    //                     dfpAdUnit = availableSlots.splice(availableSlots.indexOf(optionalParam.dfpAdunit), 1)[0];
    //                 }
    //             } else {
    //                 dfpAdUnit = inventory.dfpAdUnits[size].pop();
    //             }
    //         }

    //         return {
    //             dfpAdUnit: dfpAdUnit,
    //             bidders: bidders
    //         };
    //     },
    set: function (inventory, size, optionalParam) {
        // Reset inventory as default if site is SPA
        if (adp.config.isSPA) {
            inventory = adp.$.extend(true, {}, adp.adpTags.defaultInventory);
        }

        var size = size[0] + 'x' + size[1];
        var dfpAdUnit = null;
        var availableSlots = inventory.dfpAdUnits[size];
        var bidders = [];
        var hbConfig = inventory.hbConfig;

        if (optionalParam.headerBidding && hbConfig && Array.isArray(hbConfig.bidderAdUnits[size])) {
            var overrideSize = size;

            if (optionalParam.overrideActive && optionalParam.overrideSizeTo && Array.isArray(hbConfig.bidderAdUnits[optionalParam.overrideSizeTo])
            ) {
                overrideSize = optionalParam.overrideSizeTo;
            }

            bidders = hbConfig.bidderAdUnits[overrideSize] ? hbConfig.bidderAdUnits[overrideSize].pop() : [];
        }

        if (availableSlots.length) {
            if (optionalParam.dfpAdunit && availableSlots.indexOf(optionalParam.dfpAdunit) !== -1) {
                if (optionalParam.isManual) {
                    dfpAdUnit = optionalParam.dfpAdunit;
                } else {
                    dfpAdUnit = availableSlots.splice(availableSlots.indexOf(optionalParam.dfpAdunit), 1)[0];
                }
            } else {
                dfpAdUnit = inventory.dfpAdUnits[size].pop();
            }
        }

        return {
            dfpAdUnit: dfpAdUnit,
            bidders: bidders
        };
    }
};

module.exports = inventoryMapper;