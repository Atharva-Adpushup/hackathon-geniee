var bbPlayerUtils = {
	removeBbPlayerIfRendered: function(playerId, firedFrom) {
		var bluebillywig = (window.bluebillywig = window.bluebillywig || {});

		// fetch playerApi again as bb cmd que playerApi instance doesn't contain destruct() method
		const playerApi = bluebillywig.getPlayerInstance(playerId);
		if (!playerApi) return;

		console.log(`bbPlayer: player remove, ${firedFrom}`);

		playerApi.destruct();

		// Remove queue handlers that shouldn't exist anymore
		if (
			Array.isArray(bluebillywig._cmdQueueHandlers) &&
			bluebillywig._cmdQueueHandlers.length
		) {
			bluebillywig._cmdQueueHandlers.shift();
		}
	},
	getBbPlayerId: function(adUnitCode) {
		return '/p/inarticle/a/' + adUnitCode;
	}
};

module.exports = bbPlayerUtils;
