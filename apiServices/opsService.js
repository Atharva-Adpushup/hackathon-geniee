const _ = require('lodash');
const AdPushupError = require("../helpers/AdPushupError");
const apTagService = require('./apTagServices');
const pnpModel = require('../models/pnpRefreshModel');
const siteModel = require('../models/siteModel');
const adpushupEvent = require('../helpers/adpushupEvent');

const opsService = {
    updatePnPConfig: async (siteId, email, pnpConfig = {}) => {
        const { pnpSiteId } = pnpConfig;

        // verify if pnpSiteId is a valid site
        const pnpSiteExists = await opsService.checkSiteExists(pnpSiteId);
        if (!pnpSiteExists) throw new AdPushupError([{ message: 'Please enter a valid PnP site' }]);

        const adUnitsAfterLinking = await opsService.linkAdsWithApTags(pnpConfig, email);
        const newPnpConfig = {
            ...pnpConfig,
            adUnits: adUnitsAfterLinking
        };

        return pnpModel.upsertPnPConfig(siteId, newPnpConfig);
    },
    getOwnerEmail: async siteId => {
        const siteDoc = await siteModel.getSiteById(siteId);
        return siteDoc.get("ownerEmail");
    },

    updateExistingApTags: async ({ pnpSiteId, adUnits = [] }) => {
        const apTagAds = await apTagService.fetchAds(pnpSiteId);

        const modifiedApTagAds = apTagAds.map(ad => {
            const pnpUnit = adUnits.find(unit => unit.apTagId === ad.id);
            if (pnpUnit) {
                return {
                    ...ad,
                    networkData: { ...ad.networkData, formats: opsService.formatsForUnits(pnpUnit.formats) }
                }
            }
            return ad;
        });

        console.dir(modifiedApTagAds, { depth: 8});
        return apTagService.updateAds(pnpSiteId, modifiedApTagAds);
    },
    checkSiteExists: siteId => {
        return siteModel.getSiteById(siteId)
            .then(() => true)
            .catch(() => false);
    },
    linkAdsWithApTags: async ({ pnpSiteId, adUnits = [] }, email) => {
        const newAds = _.cloneDeep(adUnits);
        for (let adIndex in newAds) {
            const ad = newAds[adIndex] || {};
            if (ad && Object.keys(ad).length && !ad.apTagId) {
                const formats = opsService.formatsForUnits(ad.formats);
                const apTagPayload = {
                    css: {},
                    formatData: { platform: ad.platform.toLowerCase(), type: 'display' },
                    height: ad.height,
                    width: ad.width,
                    isActive: true,
                    isManual: true,
                    network: 'adpTags',
                    networkData: { isResponsive: false, formats, headerBidding: true, refreshSlot: true, refreshInterval: 30, keyValues: { "FP_S_A": 0 }, overrideActive: false, overrideSizeTo: null },
                    type: 1,
                };
                const apTag = await apTagService.createAd(apTagPayload, pnpSiteId, email);
                ad.apTagId = apTag.id;
                ad.apTagName = apTag.name;
            }
        }
        return newAds;
    },
    initScriptSync: siteId => {
        return siteModel.getSiteById(siteId)
            .then(site => {
                adpushupEvent.emit('siteSaved', site)
            });
    },
    formatsForUnits: (formats = {}) => {
        if (Object.keys(formats).length) {
            return Object.entries(formats).reduce((result, [format, isActive]) => {
                if (isActive) result.push(format);
                return result;
            }, []);
        }
        return ['display'];  
    }
};

module.exports = opsService; 