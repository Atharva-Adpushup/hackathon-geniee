var bbPlayerUtils = {
	removeBbPlayerIfRendered: function(playerId, adUnitCode) {
		var bluebillywig = (window.bluebillywig = window.bluebillywig || {});

		if (!bluebillywig.getPlayerInstance) return;

		// fetch playerApi again as bb cmd que playerApi instance doesn't contain destruct() method
		const playerApi = bluebillywig.getPlayerInstance(playerId);
		if (!playerApi) return;

		playerApi.destruct();

		if (
			Array.isArray(bluebillywig._cmdQueueHandlers) &&
			Array.isArray(window.bbQueueIndexMapping) &&
			window.bbQueueIndexMapping.length &&
			bluebillywig._cmdQueueHandlers.length &&
			window.bbQueueIndexMapping.length === bluebillywig._cmdQueueHandlers.length
		) {
			const bbQueueHandlerIndex = window.bbQueueIndexMapping.indexOf(adUnitCode);

			window.bbQueueIndexMapping.splice(bbQueueHandlerIndex, 1);

			bluebillywig._cmdQueueHandlers.splice(bbQueueHandlerIndex, 1);
		}
	},
	getBbPlayerId: function(adUnitCode) {
		return '/p/inarticle/a/' + adUnitCode;
	}
};

module.exports = bbPlayerUtils;
