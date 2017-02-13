var logger = require('./libs/logger'),
	utils = require('./libs/utils'),

	sandBoxbids = require('./sandboxbids'),
	config = require('./config/config'),

	bodyEval = require('./libs/bodyEval'),

	extend = require('extend');

var EventEmitter = require('events').EventEmitter;

var adpTags = {
	adpSlots   : {},
	que : [],

	/**
	 * Creates and bootstraps headers bidding container with parameters.
	 * @param  string 	slotId
	 * @param  array  	size        array of width, height. eg, [300, 250].
	 * @param  string 	containerId elementId of the container
	 * @param  object 	gptSlot 		(optional) googletag.defineSlot object.
	 *                           		Used when hooking is used
	 * @return adpTags-Object
	 */
	defineSlot : function(slotId, size, containerId, gptSlot) {
		var me = this,
			dAUT = config.dfpAdUnitTargeting,
			setDFP = false,
			slot;

		if( dAUT.adUnits.indexOf(slotId) !== -1 || dAUT.adUnits.indexOf('*') !== -1 ) {
			setDFP = true;

			this._setDFPForSlot(slotId);
			logger.info("creating DFP slot for slot (%s)", slotId);
		}

		this.adpSlots[slotId] = slot = {
			slotId      : slotId,
			size        : size,
			containerId : containerId,

			bidPartners : [],

			setDFP      : setDFP,  // Determines if the DFP slot needs to be created for the slot.
			gSlot       : gptSlot || null,
			isRendered  : false,

			hasBids 		: false,
			containerPresent : (gptSlot ? true : false) // If DFP hooking method is used, the container is already present
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

			slot.bidPartners  = biddingPartners[0];
			config.biddingPartners[sizeString] = config.biddingPartners[sizeString].slice(1);

		} else if( Object.prototype.toString.call(biddingPartners[0]) === "[object Object]") {

			slot.bidPartners = biddingPartners;

		}

		if( partnersPresent ) {
			sandBoxbids.createPrebidContainer( slot.bidPartners, slotId, size, containerId );
		} else {
			if( slot.setDFP ) {
				this.renderGPTAd(slotId);
			} else if( slot.gSlot ){
				// pubads.refresh() will only work when other DFP functions have been triggered
				// over it. Introduce a delay for them to happen.
				setTimeout( function(){
					me._safeGPTRefresh(slotId);
				}, 100);
			} else {
				logger.info("no bid partners present. Trying to load passback");

				slot.isRendered = true;
				this.renderPostbidAd(slotId); // Render passback if necesarry
			}
		}

		return this;
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

	processQue : function(){
		logger.info("processing adpushup queue");

		while( this.que.length ) {
			var queuedFunc = this.que.pop();
			queuedFunc.call(this);
		}

	},

	display : function( slotId ){
		var slot = this.adpSlots[slotId];
		slot.containerPresent = true;

		if( slot.hasBids ) {
			if( ! slot.gSlot ) {
				adpTags.renderPostbidAd(slotId, slot.containerId);
			} else {
				adpTags.renderGPTAd(slotId, timeout);
			}
		}

	},

	renderGPTAd : function(slotId, timeout){

		var slot = this.adpSlots[slotId], me = this;
		slot.hasBids = true;

		logger.info("GPT slot found. setting targeting for %s", slotId);

		if( ! slot.containerPresent ) {
			logger.info("container not present for slot (%s)", slotId);
			return;
		}

		googletag.cmd.push(function(){
			me._setGPTTargetingForPBSlot(slotId);
			me._setGPTKeys(slotId, {
				'hb_ran' : 1,
				'site_id' : config.siteId,
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
			this._safeGPTRefresh(slotId);
		}

	},

	renderPostbidAd : function(slotId){
		var slot = this.adpSlots[slotId];
		slot.hasBids = true;

		if( ! slot.containerPresent ) {
			return;
		}

		var params = pbjs.getAdserverTargetingForAdUnitCode(slotId),
			adIframe = utils.createEmptyIframe(),

			me = this;

		var renderPassback = function(html) {
  		document.getElementById(slot.containerId).innerHTML = html;
  		bodyEval( document.getElementById(slot.containerId) );
		};

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
					postbid : true
				});
      };

    } else {

    	var passbackHTML;
    	slot.isRendered = true;

  		if( config.postbidPassbacks[slotId] ) {
  			logger.info("no bids for the ad slot. rendering defined passback for slot (%s)", slotId);
  			passbackHTML = config.postbidPassbacks[slotId];

  		} else if( config.postbidPassbacks['*'] ) {
  			logger.info("no bids for the ad slot. rendering defined passback for all (%s)", slotId);
    		passbackHTML = config.postbidPassbacks['*'];
  		}

  		try {
  			renderPassback( atob(passbackHTML) );
  		} catch(e) {
  			logger.info("failed to render passback for slot (%s)", slotId);
  		}

    	me.emit('postBidSlotRender', {
				slotId   : slotId,
				postbid  : true,
				passback : true
			});
    }
	},

	setGPTListeners : function() {
		var me = this;

		googletag.cmd.push(function(){
			googletag.pubads().addEventListener('slotRenderEnded', function ( event ) {
				var slotId = event.slot.getAdUnitPath().match('/[0-9]+/(.*)$');

				if( me.adpSlots[ slotId[1] ] ) {
					logger.info("emitting event dfpSlotRender for slot (%s) ", slotId[1]);

					me.adpSlots[ slotId[1] ].isRendered = true;
					me.emit('dfpSlotRender', {
						slotId       : slotId[1],
						advertiserId : event.advertiserId,
						lineItemId   : event.lineItemId,
						creativeId   : event.creativeId,
					});
				}

			});

		});
	},

	_setDFPForSlot : function( slotId ){
		var me = this;

		googletag.cmd.push(function(){
			var slot = me.adpSlots[slotId],
				dAUT = config.dfpAdUnitTargeting;

			slot.gSlot = googletag.defineSlot("/" + dAUT.networkId + "/" + slotId, slot.size, slot.containerId);
		});

	},

	_safeGPTRefresh : function( slotId ) {
		var slot = this.adpSlots[slotId];

		if( ! slot.isRendered ) {
			logger.info("safe refreshing slot (%s) ", slotId);
			googletag.cmd.push(function(){
				googletag.pubads().refresh([ slot.gSlot ]);
			});
		}
	},

	// Prebid's GPTAsync iterates over all GPT slots and nullifies
	// hb params for others.
	//
	// Custom function to only set targeting params for one slot Id
	_setGPTTargetingForPBSlot : function(slotId){
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

	_setGPTKeys : function( slotId, gptKeyGroup ) {
		var gSlot = this.adpSlots[slotId].gSlot;

		for( var gptKey in gptKeyGroup ) {
			if( gptKeyGroup[ gptKey ] ) {
				gSlot.setTargeting(gptKey, gptKeyGroup[ gptKey ] );
			}
		}
	}

};

module.exports = extend(adpTags, new EventEmitter());