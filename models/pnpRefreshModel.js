
const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const { docKeys } = require('../configs/commonConsts');

const PnP = model.extend(function() {

    this.keys = ['siteId', 'pnpSiteId', 'adUnits', 'lineItems', 'native', 'outstream', 'filledInsertionTrigger', 'unfilledInsertionTrigger', 'refreshType', 'formats'];
    this.clientKeys = ['siteId', 'pnpSiteId', 'adUnits', 'lineItems', 'native', 'outstream', 'filledInsertionTrigger', 'unfilledInsertionTrigger', 'refreshType', 'formats'];

    this.validations = {
        required: ['siteId', 'pnpSiteId', 'adUnits', 'refreshType']
    }

    this.classMap = {};
    this.defaults = {
        filledInsertionTrigger: 30,
        unfilledInsertionTrigger: 30,
        adUnits: [],
        lineItems: [],
        refreshType: 'activeTab',
        native: false,
        outstream: false
    };

    this.constructor = function(data, cas) {
        if (!data.siteId) throw new Error('PnP model requires siteId');
        this.key = `${docKeys.pnpRefresh}${data.siteId}`;
        this.super(data, cas ? true: false);
        this.casValue = cas;
    }

});

const API = {
    getPnPConfig: siteId =>
        couchbase
            .connectToAppBucket()
            .then(appBucket => appBucket.getAsync(`${docKeys.pnpRefresh}${siteId}`))
            .then(({value, cas}) => new PnP(value, cas)),
    upsertPnPConfig: (siteId, config) => {
        return API.getPnPConfig(siteId)
            .then(pnpConfig => {
                pnpConfig.setAll(config);
                return pnpConfig.save();
            })
            .catch(err => {
                if (err && err.code === 13) {
                    const pnp = new PnP({ ...config, siteId });
                    return pnp.save();
                }
                throw new Error(err);
            });
    }
}

module.exports = API;