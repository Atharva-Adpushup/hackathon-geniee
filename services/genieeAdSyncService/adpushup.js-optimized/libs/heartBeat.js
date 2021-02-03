/**
things to consider:
0. heartBeat => timer
1. start an exponential heartBeat to log the user's time on site
2. log only if page is visible to user (browserConfig.pageVisibility.isPageVisible)
3. window.blur : stop the heartBeat
4. window.focus : re-start the heartBeat again
5. window.mouseout, window.blur : ping if last ping request was before a given interval
5. onUnLoad : ping
*/

var browserConfig = require('../libs/browserConfig'),
	utils = require('../libs/utils'),
	adp = window.adpushup;

module.exports = function(url, minGapInterval, heartBeatDelay, apStartTime) {
	var hadWindowFocusAtLeastOnce,
		minInterval = minGapInterval || 30000,
		heartBeatStartDelay = heartBeatDelay || 2000,
		heartBeatNextInterval,
		heartBeatTicking,
		siteStartTime = apStartTime || +new Date(),
		timeOnSite = 0,
		lastRequestTime = siteStartTime,
		onEvent,
		heartBeat;

	onEvent = function(eventName) {
		var now = +new Date();

		if (eventName === 'focus') {
			lastRequestTime = now;
			heartBeat.start();
			return;
		}

		if (eventName === 'blur') {
			heartBeat.stop();
		}

		if (now - lastRequestTime > minInterval) {
			heartBeat.sendRequest();
		}
	};

	adp.$(window).on('blur', function() {
		if (!document.hasFocus || document.hasFocus) {
			onEvent('blur');
		}
	});

	adp.$(window).on('focus', function() {
		onEvent('focus');
	});

	adp.$(document).on('mouseout', function(e) {
		var toElement = e.relatedTarget || e.toElement;
		if (toElement === null) {
			onEvent('mouseout');
		}
	});

	heartBeat = {
		start: function() {
			var self = this;
			if (heartBeatTicking) {
				return;
			}

			if (!heartBeatNextInterval || heartBeatNextInterval < heartBeatStartDelay) {
				heartBeatNextInterval = heartBeatStartDelay;
			}

			heartBeatTicking = setTimeout(function() {
				heartBeatTicking = null;

				if (!browserConfig.pageVisibility.isPageVisible()) {
					return;
				}

				if (!hadWindowFocusAtLeastOnce) {
					// if browser does not support .hasFocus (eg IE5), we assume that the window has focus.
					hadWindowFocusAtLeastOnce = !document.hasFocus || document.hasFocus();
				}

				if (!hadWindowFocusAtLeastOnce) {
					// only send a ping if the tab actually had focus at least once. For example do not send a ping
					// if window was opened via "right click => open in new window" and never had focus see #9504
					self.start();
					return;
				}

				heartBeatNextInterval = 2 * heartBeatNextInterval;

				self.sendRequest();
				self.start();
			}, heartBeatNextInterval);
		},

		stop: function() {
			clearTimeout(heartBeatTicking);
			heartBeatTicking = null;
		},

		sendRequest: function() {
			var now = +new Date();

			timeOnSite += now - lastRequestTime;
			lastRequestTime = now;

			utils.sendFeedback({ eventType: 9, timeOnSite: timeOnSite });
		}
	};

	return heartBeat;
};
