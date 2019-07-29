// UTM param based session tracker

var adp = window.adpushup,
	utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	session = {
		setCookie: function(cookieName, currentUTMParams, expiry) {
			var cookieValue = utils.base64Encode(JSON.stringify(currentUTMParams)),
				expiryTime = new Date();
			expiryTime.setTime(expiryTime.getTime() + expiry * 60 * 1000); // Set expiry time to 30 minutes from current time

			var cookie = cookieName + '=' + cookieValue + '; expires=' + expiryTime.toUTCString() + '; path=/ ';
			return (document.cookie = cookie);
		},
		getCookie: function(cookieName) {
			var cookies = document.cookie.split(';'),
				cookieFound = null;

			cookies.forEach(function(cookie) {
				cookie = cookie.trim();

				if (cookie.indexOf(cookieName) !== -1) {
					cookieFound = cookie;
				}
			});

			return cookieFound;
		},
		getUTMParams: function() {
			var queryParams = adp.utils.getQueryParams(),
				currentQueryParams = {};

			if (Object.keys(queryParams).length) {
				Object.keys(commonConsts.UTM_WISE_TARGETING).forEach(function(utmKey) {
					Object.keys(queryParams).forEach(function(queryParam) {
						if (utmKey.toLowerCase() === queryParam.toLowerCase()) {
							currentQueryParams[utmKey.toLowerCase()] = queryParams[queryParam];
						}
					});
				});
			}

			return Object.keys(currentQueryParams).length ? currentQueryParams : false;
		},
		init: function() {
			var cookieName = commonConsts.COOKIE.NAME,
				expiry = commonConsts.COOKIE.EXPIRY; // 30 minutes

			if (this.getUTMParams()) {
				var currentUTMParams = this.getUTMParams();
				this.setCookie(cookieName, currentUTMParams, expiry);
			}
		}
	};

module.exports = session;
