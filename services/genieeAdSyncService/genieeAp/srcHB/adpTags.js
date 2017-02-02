	var logger = require('./libs/logger'),
	utils = require('./libs/utils'),

	sandBoxbids = require('./sandboxbids'),
	config = require('./config/config'),

	bodyEval = require('./libs/bodyEval'),

	extend = require('extend'),
	waitUntil = require('wait-until');

var EventEmitter = require('events').EventEmitter;

var adpTags = {
	adpSlots   : {},
	que : [],

	defineSlot : function(slotId, size, containerId) {
		var me = this,
			dAUT = config.dfpAdUnitTargeting,
			setDFP = false;

		if( dAUT.targetAllAdUnits ||
				dAUT.adUnits.indexOf(slotId) !== -1 || dAUT.adUnits.indexOf('*') !== -1
			) {
			slotId = "/" + dAUT.networkId + "/" + slotId;
			setDFP = true;

			this.setDFPForSlot(slotId);
			logger.info("creating DFP slot for slot (%s)", slotId);
		}

		this.adpSlots[slotId] = {
			slotId      : slotId,
			size        : size,
			containerId : containerId,

			bidPartners : [],

			setDFP      : setDFP,
			gSlot       : null,
			isRendered  : false
		};

		var partnersPresent = true;

		var sizeString = size.join('x'),
			biddingPartners = config.biddingPartners[ sizeString ];

		if( ! biddingPartners ) {

			partnersPresent = false;
			logger.warn("no bidding partners present for this size");

		} else if( ! biddingPartners[0]) {

			partnersPresent = false;
			logger.warn("not enough bidding partners defined for the this size");

		} else if( Array.isArray(biddingPartners[0]) ) {

			this.adpSlots[slotId].bidPartners  = biddingPartners[0];
			config.biddingPartners[sizeString] = config.biddingPartners[sizeString].slice(1);

		} else if( Object.prototype.toString.call({}) === "[object Object]") {

			this.adpSlots[slotId].bidPartners = biddingPartners;

		}

		if( partnersPresent ) {
			sandBoxbids.createPrebidContainer( this.adpSlots[slotId].bidPartners, slotId, size, containerId );
		} else {
			if( this.adpSlots[slotId].setDFP ) {
				this.renderGPTAd(slotId);
			} else {
				logger.info("no bid partners present. Trying to load passback");

				this.adpSlots[slotId].isRendered = true;
				this.renderPostbidAd(slotId); // Render passback if necesarry
			}
		}

		return this;
	},

	gptEnableServices : function(){
		googletag.cmd.push(function(){
			googletag.enableServices();
		});
	},

	processQue : function(){
		logger.info("processing adpushup queue");

		while( this.que.length ) {
			var queuedFunc = this.que.pop();
			queuedFunc.call(this);
		}

	},

	setDFPForSlot : function( slotId ){
		var me = this;

		googletag.cmd.push(function(){
			var slot = me.adpSlots[slotId];
			slot.gSlot = googletag.defineSlot(slot.slotId, slot.size, slot.containerId);
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

		var renderPassback = function(html) {
  		document.getElementById(slot.containerId).innerHTML = html;
  		bodyEval( document.getElementById(slot.containerId) );
		};

		waitUntil()
			.interval(50)
			.times(20)
			.condition(function(){
				logger.info("waiting for the slot container to appear (%s)", slot.containerId);

				return ( document.getElementById(slot.containerId) !== null );
			})
			.done(function(){
				document.getElementById(slot.containerId).appendChild(adIframe);

				var iframeDoc = adIframe.contentWindow.document;

				if (params && params.hb_adid){
					logger.info("rendering postbid ad for slot(%s)", slotId);

		      pbjs.renderAd(iframeDoc, params.hb_adid);
		      adIframe.contentWindow.onload = function(){
		      	logger.info("postbid slot (%s) rendered. emitting postBidSlotRender", slotId);

		      	slot.isRendered = true;
		      	me.emit('postBidSlotRender', {
							slotId  : slotId,
							postBid : true
						});
		      };

		    } else {

		    	slot.isRendered = true;

	    		if( config.postbidPassbacks[slotId] ) {
	    			logger.info("no bids for the ad slot. rendering defined passback for slot (%s)", slotId);
	    			renderPassback(config.postbidPassbacks[slotId]);

	    		} else if( config.postbidPassbacks['*'] ) {
	    			logger.info("no bids for the ad slot. rendering defined passback for all (%s)", slotId);
		    		renderPassback(config.postbidPassbacks['*']);
	    		}

		    	me.emit('postBidSlotRender', {
						slotId   : slotId,
						postBid  : true,
						passback : true
					});
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

		var slot = this.adpSlots[slotId], me = this;

		googletag.cmd.push(function(){
			me.setGPTTargetingForPBSlot(slotId);
			me.setGPTKeys(slotId, {
				'hb_ran' : 1,
				'is_timed_out' : timeout
			});
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