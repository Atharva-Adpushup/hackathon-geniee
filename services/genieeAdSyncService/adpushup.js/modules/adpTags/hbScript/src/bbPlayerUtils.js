var bbPlayerUtils = {
	removeBbPlayerIfRendered: function(playerId, adUnitCode, firedFrom) {
		var bluebillywig = (window.bluebillywig = window.bluebillywig || {});

		if (!bluebillywig.getPlayerInstance) return;

		// fetch playerApi again as bb cmd que playerApi instance doesn't contain destruct() method
		const playerApi = bluebillywig.getPlayerInstance(playerId);
		if (!playerApi) return;

		console.log(`bbPlayer: player remove, ${firedFrom}`);

		playerApi.destruct();
		if (
			Array.isArray(bluebillywig._cmdQueueHandlers) &&
			Array.isArray(window.bbQueueIndexMapping)
		) {
			console.log(
				`bbPlayer: ${adUnitCode} render: length is equal: ${window.bbQueueIndexMapping
					.length === bluebillywig._cmdQueueHandlers.length}`
			);
		}

		if (
			Array.isArray(bluebillywig._cmdQueueHandlers) &&
			Array.isArray(window.bbQueueIndexMapping) &&
			window.bbQueueIndexMapping.length &&
			bluebillywig._cmdQueueHandlers.length &&
			window.bbQueueIndexMapping.length === bluebillywig._cmdQueueHandlers.length
		) {
			const bbQueueHandlerIndex = window.bbQueueIndexMapping.indexOf(adUnitCode);

			console.log(
				`bbPlayer: ${adUnitCode}, index: ${bbQueueHandlerIndex},  index mapping splicing`
			);
			window.bbQueueIndexMapping.splice(bbQueueHandlerIndex, 1);

			console.log(
				`bbPlayer: ${adUnitCode}, index: ${bbQueueHandlerIndex},  queue handler splicing`,
				bluebillywig._cmdQueueHandlers[bbQueueHandlerIndex]
			);
			bluebillywig._cmdQueueHandlers.splice(bbQueueHandlerIndex, 1);
		}
	},
	getBbPlayerId: function(adUnitCode) {
		return '/p/inarticle/a/' + adUnitCode;
	}
};

module.exports = bbPlayerUtils;
