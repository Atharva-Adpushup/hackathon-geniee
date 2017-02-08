var config = require('./config/config');

function createBidAdjustmentFunction( adjustmentFactor ){
	return function(bidCpm){
		return bidCpm * adjustmentFactor;
	};
}

function createAllFunctionsForBidders(){
	var bidderSettings = {};

	for( var bidder in config.bidCpmAdjustments ) {
		bidderSettings[bidder] = {
			'bidCpmAdjustment' : createBidAdjustmentFunction( config.bidCpmAdjustments[bidder] )
		};
	}

	return bidderSettings;
}

function setPbAdjustments( _pbjs ){
	_pbjs.bidderSettings = createAllFunctionsForBidders();
}

module.exports = {
	'set' : setPbAdjustments
};