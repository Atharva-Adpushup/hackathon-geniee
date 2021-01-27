// eslint-disable-next-line no-undef
var w = window,
	d = document,
	adp = w.adpushup,
	browserConfig = require('../libs/browserConfig');

function TrackingNode($el, callback) {
	if (!callback || typeof callback !== 'function') {
		throw new Error('Tracking node need a callback');
	}
	if (!($el instanceof adp.$)) {
		throw new Error('Tracking node need jquery element');
	}

	this.el = $el.get(0);
	this.$el = $el;
	this.callbackCalled = false;
	var me = this;
	this.callback = function() {
		me.callbackCalled = true;
		callback.apply(null, arguments);
	};
	this.blurTS = null;
}

function Tracker() {
	this.version = 3.1;
	this.checkTimeout = 3000;
	this.nodesToTrack = [];
	this.lastNodeActive = null;
	this.event = null;
	this.eventlastReqAnimTime = null;
	this.eventBlurTs = null;
	this.lastPageHiddenTs = null;
	this.setupListener();
}

Tracker.prototype.setupListener = function() {
	if (!browserConfig.trackerSupported) {
		return false;
	}

	var me = this;
	adp.$(d).ready(function() {
		w.focus();
	});

	adp.$(w).on('blur', function() {
		me.eventBlurTs = +new Date();
		if (browserConfig.name === 'firefox') {
			// firefox returns iframe as activeElement bit late
			setTimeout(function() {
				me.event = 'blur';
				me.isTrackingNodeClicked();
			}, 700);
		} else if (
			(browserConfig.name === 'safari-mobile' || browserConfig.name === 'safari-wv') &&
			typeof w.requestAnimationFrame === 'function'
		) {
			// safari mobile and webview stop requestanimation immidiately after click
			(function() {
				var reqAnim = null;
				function logReqAnim() {
					me.eventlastReqAnimTime = +new Date();
					reqAnim = w.requestAnimationFrame(logReqAnim);
				}
				me.eventlastReqAnimTime = +new Date();
				reqAnim = w.requestAnimationFrame(logReqAnim);
				setTimeout(function() {
					w.cancelAnimationFrame(reqAnim);
				}, 1500);
			})();
			me.event = 'blur';
			me.isTrackingNodeClicked();
		} else {
			me.event = 'blur';
			me.isTrackingNodeClicked();
		}
	});

	browserConfig.pageVisibility.onChange(
		function() {
			me.event = 'visibility';
			me.isTrackingNodeClicked();
		},
		function() {}
	);

	if (typeof w.addEventListener === 'function') {
		w.addEventListener(
			browserConfig.unloadMethod,
			function() {
				me.event = 'onBU';
				me.isTrackingNodeClicked();
			},
			true
		);
	} else if (w.attachEvent) {
		w.attachEvent('on' + browserConfig.unloadMethod, function() {
			me.event = 'onBU';
			me.isTrackingNodeClicked();
		});
	}
};

Tracker.prototype.isTrackingNodeClicked = function() {
	var activeNode;
	switch (this.event) {
		case 'blur':
			activeNode = this.getActiveNode();
			if (!activeNode || (activeNode && activeNode.callbackCalled)) {
				return false;
			}

			if (this.lastPageHiddenTs && +new Date() - this.lastPageHiddenTs <= this.checkTimeout) {
				// (firefox and old ie)some time ie old browsers create condition that visibility which is based on blur fires first and after then blur fires, firefox we run blur event bit late as it gives iframe as activeelemnt very late
				activeNode.callback(activeNode);
			} else {
				activeNode.blurTs = this.eventBlurTs;
				this.lastNodeActive = activeNode;
			}
			break;
		case 'visibility':
			if (
				this.lastNodeActive &&
				!this.lastNodeActive.callbackCalled &&
				Math.abs(+new Date() - this.lastNodeActive.blurTs) <= this.checkTimeout
			) {
				this.lastNodeActive.callback(this.lastNodeActive);
			} else {
				this.lastPageHiddenTs = +new Date();
			}
			break;
		case 'onBU':
			if (
				this.lastNodeActive &&
				!this.lastNodeActive.callbackCalled &&
				(Math.abs(+new Date() - this.lastNodeActive.blurTs) <= this.checkTimeout ||
					((browserConfig.name === 'safari-mobile' || browserConfig.name === 'safari-wv') &&
						Math.abs(this.eventlastReqAnimTime - this.lastNodeActive.blurTs) <= 1000))
			) {
				this.lastNodeActive.callback(this.lastNodeActive);
			} else if (
				browserConfig.name === 'firefox' &&
				Math.abs(+new Date() - this.eventBlurTs) <= this.checkTimeout
			) {
				// some loose check but firefox don't give more than this)
				activeNode = this.getActiveNode();
				if (!activeNode || (activeNode && activeNode.callbackCalled)) {
					return false;
				}
				activeNode.callback(activeNode);
			}
			break;
		default:
			break;
	}
};

Tracker.prototype.customContains = function(Node, child) {
	return adp.$.contains(Node.el, child);
};

Tracker.prototype.getActiveNode = function() {
	if (d.activeElement && typeof d.activeElement !== 'undefined' && d.activeElement.nodeName === 'IFRAME') {
		for (var i = 0; i < this.nodesToTrack.length; i++) {
			if (this.customContains(this.nodesToTrack[i], d.activeElement)) {
				return this.nodesToTrack[i];
			}
		}
		return false;
	}
	return false;
};

Tracker.prototype.add = function($el, callback, cancelCallback) {
	if ($el instanceof adp.$) {
		var el = new TrackingNode($el, callback, cancelCallback);
		this.nodesToTrack.push(el);

		$el.on('mouseout', function() {
			// ???
			adp.$(w).focus();
		}).on('mouseover', function() {
			adp.$(w).focus();
		});
	}
};

module.exports = Tracker;
