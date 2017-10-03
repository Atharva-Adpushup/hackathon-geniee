/**
 * ADPUSHUP Inc., All right reserved.
 * UTM parameter cookie manipulation script
 * NOTE: Below script is dependent on JS-cookie micro library so please ensure
 * to load it before this script executes
 * Js-cookie library path: //console.adpushup.com/assets/js/libs/third-party/js.cookie.min.js
 */
(function(W) {
	var constants = {
			cookie: {
				firstHit: 'adp_fh'
			},
			protocol: {
				http: 'http:'
			}
		},
		utils = {
			btoa: function(value) {
				return btoa(encodeURI(JSON.stringify(value)));
			},
			atob: function(value) {
				return JSON.parse(decodeURI(atob(value)));
			},
			rightTrim: function(string, s) {
				return string ? string.replace(new RegExp(s + '*$'), '') : '';
			},
			domanize: function(domain) {
				return domain
					? this.rightTrim(
							domain
								.replace('http://', '')
								.replace('https://', '')
								.replace('www.', ''),
							'/'
						)
					: '';
			}
		},
		locationProtocol = W.location.protocol,
		isProtocolHttp = !!(locationProtocol && locationProtocol === constants.protocol.http),
		isDocumentReferrer = !!W.document.referrer,
		// Direct-Http condition is when document protocol is 'http' and referrer is empty ('').
		// This condition arises when a user is navigated to an insecure (http) page from a secured (https)
		// one and document referrer becomes empty.
		// We need to track this use case in our code for analytics purposes, hence below is its implementation
		isDirectHttpCondition = !!(isProtocolHttp && !isDocumentReferrer),
		directReferrerValue = isDirectHttpCondition ? 'direct-http' : 'direct',
		utmParameters = {
			firstHit: utils.domanize(W.location.href),
			firstReferrer: isDocumentReferrer ? utils.domanize(W.document.referrer) : directReferrerValue
		};

	function getCookie(name) {
		return Cookies.get(name);
	}

	function setCookie(name, value, expiryDays) {
		Cookies.set(name, value, { expires: expiryDays, domain: 'adpushup.com' });
	}

	function setFirstHitCookie() {
		var inputCookieData = getCookie(constants.cookie.firstHit),
			isCookie = !!inputCookieData,
			cookieName = constants.cookie.firstHit,
			cookieData,
			encodedData;

		if (!isCookie) {
			cookieData = {
				firstHit: utmParameters.firstHit,
				firstReferrer: utmParameters.firstReferrer
			};
			encodedData = utils.btoa(cookieData);
			setCookie(cookieName, encodedData, 30);
		}
	}

	setFirstHitCookie();
})(window);
