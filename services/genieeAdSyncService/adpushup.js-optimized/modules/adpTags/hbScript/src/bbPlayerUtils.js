// const BB_PLAYER_LOG_KEEN_ENDPOINT =
// 	'//api.keen.io/3.0/projects/5fd874cedbf8740c9be9d4fe/events/bblogs?api_key=dafa918020ac9521501e4449c9d84f3e06feb3b3cb2346e0de422b3c2f3b1847e622a65464d8696c8a47e041ef66c77c6ee3bcd9f290b0074dcd1ca763b22eed2755a7df941ed7c038f44f352abd8d5092e31442619c3980af9d404443e375fb&data=';

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
		let json = {
			eventName: eventName,
			siteId: adp.config.siteId,
			domain: adp.config.siteDomain,
			url: window.location.href,
			packetId: adp.config.packetId,
			platform: adp.config.platform,
			browser: adp.config.browser,
			userAgent: (window.navigator && window.navigator.userAgent) || '',
			eventTime: +new Date()
		};

		if ((type === 'bid' || type === 'not_rendered_video_bid') && bid) {
			json = {
				...json,
				adUnitCode: bid.adUnitCode,
				cpm: bid.cpm,
				currency: bid.currency,
				bidder: bid.bidder,
				bidderCode: bid.bidderCode,
				creativeId: bid.creativeId,
				adId: bid.adId,
				size: bid.size,
				mediaType: bid.mediaType,
				status: bid.status,
				auctionId: bid.auctionId || '',
				requestId: bid.requestId || ''
			};
		}

		switch (type) {
			case 'bid': {
				json = {
					...json,
					refreshCount: adpSlot.refreshCount,
					bidWonTime: bidWonTime
				};
				break;
			}
			case 'refresh': {
				json = {
					...json,
					adUnitCode: adpSlot.containerId,
					refreshCount: adpSlot.refreshCount
				};
				break;
			}
			case 'not_rendered_video_bid': {
				json = {
					...json,
					vastXml: bid.vastXml || '',
					vastUrl: bid.vastUrl || ''
				};
				break;
			}
			default: {
				return;
			}
		}

		window.adpushup.$.ajax({
			type: 'POST',
			url: '//vastdump-staging.adpushup.com/bb_player_logging',
			data: JSON.stringify(json),
			contentType: 'application/json',
			processData: false,
			dataType: 'json'
		});
	}
};

module.exports = bbPlayerUtils;
