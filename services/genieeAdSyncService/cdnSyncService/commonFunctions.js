const couchbase = require('../../../helpers/couchBaseService');
const commonConsts = require('../../../configs/commonConsts');

function getBiddersFromNetworkTree() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkConfig, {}))
		.then(({ value: networkTree }) => {
			const biddersFromNetworkTree = {};

			for (const bidderCode in networkTree) {
				if (networkTree.hasOwnProperty(bidderCode) && networkTree[bidderCode].isHb) {
					biddersFromNetworkTree[bidderCode] = networkTree[bidderCode];
				}
			}

			return biddersFromNetworkTree;
		})
		.catch(err => Promise.resolve({}));
}

module.exports = {
	getBiddersFromNetworkTree
};
