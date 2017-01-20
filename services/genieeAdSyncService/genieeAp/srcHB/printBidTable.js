var logger = require('./libs/logger');

var printBidTable = function(){
	var responses = pbjs.getBidResponses();
	var output = [];
	for (var adunit in responses) {
		 if (responses.hasOwnProperty(adunit)) {
			var bids = responses[adunit].bids;
			for (var i = 0; i < bids.length; i++) {
				var b = bids[i];
				output.push({
					'adunit': adunit, 'adId': b.adId, 'bidder': b.bidder,
					'time': b.timeToRespond, 'cpm': b.cpm, 'msg': b.statusMessage
				});
			}
		 }
	}
	if (output.length) {
		 if (logger.table) {
			logger.table(output);
		 } else {
			for (var j = 0; j < output.length; j++) {
				logger.log(output[j]);
			}
		 }
	} else {
		 logger.warn('NO prebid responses');
	}
};

module.exports = printBidTable;