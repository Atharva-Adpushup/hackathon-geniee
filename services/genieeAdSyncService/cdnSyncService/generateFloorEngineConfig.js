const CB_ERRORS = require('couchbase').errors;

const { DEFAULT_BUCKET } = require('../../../configs/config').couchBase;
const { docKeys } = require('../../../configs/commonConsts');

const couchbase = require('../../../helpers/couchBaseService');

const getConfig = (docKey) => {
    const emptyResponse = {};
    return couchbase
		.getDoc(DEFAULT_BUCKET, docKey)
		.catch(err => {
			if (err.code === CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		})
		.then(config => config.value)
}

const generateFloorEngineConfig = async (siteId) => {
    try {
        const { bannerFloorEngine, globalFloorEngineConfig } = docKeys;
        const floorEngineConfigObject = await getConfig(`${bannerFloorEngine}${siteId}`);
        const globalFloorsMappingObject = await getConfig(globalFloorEngineConfig);      
        const floorPriceConfig = floorEngineConfigObject.floorPriceConfig || {};      
        const globalFloorsMapping = globalFloorsMappingObject.globalFloorsMapping || {};
        return { ...floorPriceConfig, globalFloorsMapping };
    } catch (err) {
        console.log(
			`Error while generating floor engine config for site ${siteId} and Error is ${err}`
		);
        Promise.resolve({})
    }
}

module.exports = generateFloorEngineConfig;