// Below object will hold all Geniee partner specific functionality
var genieeObject = {
	// Get zone id and ecpm values for every successful zone impression
	registerZoneECPM: function (id, ecpm) {
		console.log('Zone id: ', id, ', ecpm: ', ecpm);
	}
};

module.exports = genieeObject;
