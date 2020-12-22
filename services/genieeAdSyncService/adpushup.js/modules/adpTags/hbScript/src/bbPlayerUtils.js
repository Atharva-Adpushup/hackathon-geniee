const BB_PLAYER_LOG_KEEN_ENDPOINT =
	'//api.keen.io/3.0/projects/5fd874cedbf8740c9be9d4fe/events/bblogs?api_key=dafa918020ac9521501e4449c9d84f3e06feb3b3cb2346e0de422b3c2f3b1847e622a65464d8696c8a47e041ef66c77c6ee3bcd9f290b0074dcd1ca763b22eed2755a7df941ed7c038f44f352abd8d5092e31442619c3980af9d404443e375fb&data=';

var bbPlayerUtils = {
	removeBbPlayerIfRendered: function(playerId) {
		var bluebillywig = (window.bluebillywig = window.bluebillywig || {});

		if (!bluebillywig.getPlayerInstance) return;

		// fetch playerApi again as bb cmd que playerApi instance doesn't contain destruct() method
		const playerApi = bluebillywig.getPlayerInstance(playerId);
		if (!playerApi) return;

		playerApi.destruct();
	},
	getBbPlayerId: function(adUnitCode) {
		return '/p/inarticle/a/' + adUnitCode;
	},
	sendBbPlayerLogs: function(type, eventName, adpSlot, bid, bidWonTime) {
		const adp = window.adpushup;
		if (!type || !adp.config.enableBbPlayerLogging) return;
		let json;
		switch (type) {
			case 'bid': {
				json = {
					eventName: eventName,
					adUnitCode: bid.adUnitCode,
					siteId: adp.config.siteId,
					domain: adp.config.siteDomain,
					refreshCount: adpSlot.refreshCount,
					packetId: adp.config.packetId,
					cpm: bid.cpm,
					currency: bid.currency,
					bidder: bid.bidder,
					bidderCode: bid.bidderCode,
					creativeId: bid.creativeId,
					adId: bid.adId,
					size: bid.size,
					mediaType: bid.mediaType,
					status: bid.status,
					eventTime: +new Date(),
					bidWonTime: bidWonTime,
					auctionId: bid.auctionId || '',
					requestId: bid.requestId || ''
				};
				break;
			}
			case 'refresh': {
				json = {
					eventName: eventName,
					adUnitCode: adpSlot.containerId,
					siteId: adp.config.siteId,
					domain: adp.config.siteDomain,
					refreshCount: adpSlot.refreshCount,
					packetId: adp.config.packetId,
					eventTime: +new Date()
				};
				break;
			}
			default: {
				return;
			}
		}

		const data = adp.utils.base64Encode(JSON.stringify(json));
		const imgSrc = BB_PLAYER_LOG_KEEN_ENDPOINT + data;

		adp.utils.fireImagePixel(imgSrc);
	}
};

module.exports = bbPlayerUtils;
