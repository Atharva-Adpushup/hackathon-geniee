var logger = require('./libs/logger'),
	utils = require('./libs/utils'),

	sandBoxbids = require('./sandboxbids'),
	config = require('./config/config'),

	extend = require('extend'),

	waitUntil = require('wait-until');


var EventEmitter = require('events').EventEmitter;

var adpTags = {
	adpSlots   : {},
	que : [],

	defineSlot : function(slotId, size, containerId) {
		var me = this, newSlotId;

		this.adpSlots[slotId] = {
			slotId      : slotId,
			size        : size,
			containerId : containerId,

			bidPartners : [],

			setDFP      : false,
			gSlot       : null,
			isRendered  : false
		};

		var sizeString = size.join('x'),
			biddingPartners = config.biddingPartners[ sizeString ];

		// If the size is defined as having multiple configuration
		// use one by one.
		if( Array.isArray(biddingPartners[0]) ) {
			this.adpSlots[slotId].bidPartners  = biddingPartners[0];
			config.biddingPartners[sizeString] = config.biddingPartners[sizeString].slice(1);
		} else {
			this.adpSlots[slotId].bidPartners = biddingPartners;
		}

		if( config.dfpAdUnitTargeting && config.dfpAdUnitTargeting.adUnits ) {
				if( config.dfpAdUnitTargeting.targetAllAdUnits || config.dfpAdUnitTargeting.adUnits[slotId] ) {
					newSlotId = "/" + config.dfpAdUnitTargeting.networkId + "/" + slotId;
					this.adpSlots[slotId].slotId = newSlotId;

					me.setDFPForSlot(slotId);
				}
		}

		sandBoxbids.createPrebidContainer( this.adpSlots[slotId].bidPartners, slotId, size, containerId );

		return this;
	},

	gptEnableServices : function(){
		googletag.cmd.push(function(){
			googletag.enableServices();
		});
	},

	processQue : function(){

		while( this.que.length ) {
			var queuedFunc = this.que.pop();
			queuedFunc.call(this);
		}

	},

	setDFPForSlot : function( slotId ){
		var slot = this.adpSlots[slotId];

		googletag.cmd.push(function(){
			slot.gSlot = googletag.defineSlot(slot.slotId, slot.size, slot.containerId);
			slot.setDFP = true;
		});

	},

	haveAllSlotsRendered : function(){

		for ( var slotId in this.adpSlots ) {
			if( ! this.adpSlots[slotId].isRendered ) {
				return false;
			}
		}

		logger.info("all slots rendered. will send data");
		return true;
	},

	refresh : function( slotId ){
		var slot = this.adpSlots[slotId];
		slot.isRendered = false;

		sandBoxbids.createPrebidContainer( slot.bidPartners, slot.slotId, slot.size, slot.containerId );
	},

	renderPostbidAd: function(slotId){
		var slot = this.adpSlots[slotId];

		var params = pbjs.getAdserverTargetingForAdUnitCode(slotId),
			adIframe = utils.createEmptyIframe(),

			me = this;

		waitUntil()
			.interval(50)
			.times(20)
			.condition(function(){
				return ( document.getElementById(slot.containerId) !== undefined );
			})
			.done(function(){
				document.getElementById(slot.containerId).appendChild(adIframe);

				var iframeDoc = adIframe.contentWindow.document;

				if (params && params.hb_adid){

		      pbjs.renderAd(iframeDoc, params.hb_adid);
		      adIframe.contentWindow.onload = function(){
		      	slot.isRendered = true;

		      	me.emit('postBidSlotRender', {
							slotId  : slotId,
							postBid : true
						});
		      };

		    } else {

		    	slot.isRendered = true;

		    	me.emit('postBidSlotRender', {
						slotId   : slotId,
						postBid  : true,
						passback : true
					});

		      // If no bidder return any creatives, run passback.
		      adIframe.width = 0;
		      adIframe.height = 0;
		    }
			});
	},

	setGPTSlot : function( slotId, gSlot ) {
		logger.info("setting gSlot for slot (%s)", slotId);
		this.adpSlots[slotId].gSlot = gSlot;
	},

	setGPTListeners : function() {
		var me = this;

		googletag.cmd.push(function(){

			googletag.pubads().addEventListener('slotRenderEnded', function ( event ) {
				var slotId = event.slot.getAdUnitPath();

				if( me.adpSlots[ slotId ] ) {
					logger.info("emitting event dfpSlotRender for slot (%s) ", slotId);

					me.adpSlots[ slotId ].isRendered = true;
					me.emit('dfpSlotRender', {
						slotId       : slotId,
						advertiserId : event.advertiserId,
						lineItemId   : event.lineItemId,
						creativeId   : event.creativeId,
					});
				}

			});

		});
	},

	safeGPTRefresh : function( slotId ) {
		var slot = this.adpSlots[slotId];

		if( ! slot.isRendered ) {
			logger.info("safe refreshing slot (%s) ", slotId);
			googletag.pubads().refresh([ slot.gSlot ]);
		}
	},

	// Prebid's GPTAsync iterates over all GPT slots and nullifies
	// hb params for others.
	//
	// Custom function to only set targeting params for one slot Id
	setGPTTargetingForPBSlot : function(slotId){
		var gSlot = this.adpSlots[slotId].gSlot;

		var slotIds = pbjs.getAdserverTargeting(slotId),
			_hbVals = Object.values( slotIds )[0];

		if( _hbVals ) {
			_keys = Object.keys( _hbVals );
			_keys.forEach(function(_key){
				gSlot.setTargeting(_key, _hbVals[_key]);
			});

			logger.info("hb keys set for %s", slotId);
		} else {
			logger.info("no keys set for %s. probably because of no bids", slotId);
		}
	},

	setGPTKeys : function( slotId, gptKeyGroup ) {
		var gSlot = this.adpSlots[slotId].gSlot;

		for( var gptKey in gptKeyGroup ) {
			if( gptKeyGroup[ gptKey ] ) {
				gSlot.setTargeting(gptKey, gptKeyGroup[ gptKey ] );
			}
		}
	},

	renderGPTAd : function(slotId, timeout){
		logger.info("GPT slot found. setting targeting for %s", slotId);

		var slot = this.adpSlots[slotId];

		this.setGPTTargetingForPBSlot(slotId);
		this.setGPTKeys(slotId, {
			'hb_ran' : 1,
			'is_timed_out' : timeout
		});

		if( slot.setDFP ) {
			logger.info("adding GPT service for slot (%s)", slotId);

			googletag.cmd.push(function(){
				slot.gSlot.addService(googletag.pubads());
				googletag.enableServices();

				googletag.display( slot.containerId );
			});

		} else {
			this.safeGPTRefresh(slotId);
		}

	}
};

adpTags.que.push = function( queFunc ){
	adpTags.que = adpTags.que.concat(queFunc);
	adpTags.processQue();
};

module.exports = extend(adpTags, new EventEmitter());