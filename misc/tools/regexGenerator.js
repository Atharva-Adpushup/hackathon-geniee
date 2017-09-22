var urlModule = require('url'),
	_ = require('lodash');

var regexGenerator = {
	protocolSet: new Set(), // http | https | ftp
	wSet: new Set(), // wwww or subdomain
	dSet: new Set(), // domain name
	specialCharacterSet: new Set(),
	specialCharacterArray: [],
	protocolArray: [],
	wArray: [],
	dArray: [],
	pathArray: [],
	queryArray: [],
	completeObj: {},
	ok: true,
	errorMessage: '',
	pRegexAlt: '',
	pathSpecialCharacterCount: 0,
	makeSet: function(value, set) {
		if (value != '' && value != null && value != 'null') {
			set.add(value);
		}
	},
	makeWSet: function(value, wSet, dSet, pathName) {
		if (value == null || value == 'null') {
			value = pathName;
		}
		try {
			value = value.split('.');
			if (value.length > 2) {
				valueToSend = value[0];
				wSet.add(valueToSend);
				dSet.add(value[1]);
			} else {
				dSet.add(value[0]);
			}
		} catch (err) {
			console.log('Url does not contain protocol or www');
		}
	},
	makeProtocolSetArray: function(value, key, set) {
		if (key && key != null && key.trim() != '') {
			regexGenerator.protocolArray.push(value.substring(0, value.length - 1));
		}
	},
	makeWSetArray: function(value, key, set) {
		if (key && key != null && key.trim() != '') {
			regexGenerator.wArray.push(value);
		}
	},
	makeDSetArray: function(value, key, set) {
		if (key && key != null && key.trim() != '') {
			regexGenerator.dArray.push(value);
		}
	},

	makeSpecialCharArray: function(value, key, set) {
		if (key && key != null && key.trim() != '') {
			regexGenerator.specialCharacterArray.push(value);
		}
	},

	makeProtocolRegex: function() {
		var protocolRegex;
		if (regexGenerator.protocolSet.size) {
			regexGenerator.protocolSet.forEach(regexGenerator.makeProtocolSetArray);
			protocolRegex = regexGenerator.protocolArray ? regexGenerator.protocolArray : [];
			protocolRegex = '(' + protocolRegex.join('|') + ')?' + '(:\\/\\/)?';
		} else {
			protocolRegex = [];
		}
		return protocolRegex;
	},
	makePathArray: function(path) {
		var pathName = path,
			flag = 0;
		if (pathName != '/' && pathName != null && pathName != 'null') {
			var firstChar = pathName.substring(0, 1);
			if (firstChar == '/') {
				flag = 1;
			} else {
				var firstSlash = pathName.indexOf('/');
				if (firstSlash != -1) {
					pathName = pathName.substring(firstSlash, pathName.length);
					flag = 1;
				}
			}
			if (flag) {
				pathName = pathName.substring(1, path.length);
				if (path.match('[^a-z0-9/+]')) {
					regexGenerator.pathSpecialCharacterCount++;
				}
				regexGenerator.pathArray.push(pathName);
			}
		}
	},
	makeQueryArray: function(search, query) {
		var qArray;
		if (search && search != null) {
			qArray = query.split('&');
			_.forEach(qArray, function(q) {
				if (q && q.trim().length > 0) {
					regexGenerator.queryArray.push(q.match('(?:[^=])+')[0]);
				}
			});
		}
	},
	makeWRegex: function() {
		var wRegex;
		if (regexGenerator.wSet.size) {
			regexGenerator.wSet.forEach(regexGenerator.makeWSetArray);
			wRegex = regexGenerator.wArray ? regexGenerator.wArray : [];
			wRegex = '((' + wRegex.join('|') + ')\\.)?';
		} else {
			wRegex = [];
		}
		return wRegex.length ? wRegex : false;
	},
	makeDRegex: function() {
		var dRegex;
		if (regexGenerator.dSet.size > 1) {
			regexGenerator.ok = false;
			regexGenerator.errorMessage = 'All urls must have same domain';
			return false;
		} else {
			regexGenerator.dSet.forEach(regexGenerator.makeDSetArray);
			dRegex = regexGenerator.dArray ? regexGenerator.dArray : [];
			dRegex = dRegex[0] + '\\.(?:[a-zA-Z]{2,}(?:\\.[a-zA-Z]{2,}){0,})+';
		}
		return dRegex ? dRegex : false;
	},
	makePRegex: function(inputArrayLength) {
		var pRegex,
			pParts,
			that = this,
			pathObj = {};
		if (regexGenerator.pathArray.length) {
			// console.log(regexGenerator.pathArray);
			var validSymbols = '[',
				re = new RegExp('[^a-zA-Z0-9\\s/]', 'i');
			_.forEach(regexGenerator.pathArray, function(soloPath) {
				_.forEach(soloPath, function(char) {
					if (re.test(char)) {
						regexGenerator.specialCharacterSet.add(char);
					}
				});
			});

			regexGenerator.specialCharacterSet.forEach(regexGenerator.makeSpecialCharArray);

			validSymbols = validSymbols + regexGenerator.specialCharacterArray.join('') + ']';

			pParts = regexGenerator.pathArray[0].split('/');
			if (pParts.length == 1) {
				var onlyPart = pParts[0];
				if (onlyPart.match('[^a-z0-9/+]')) {
					pathObj[onlyPart] = '\\/(?:\\w+' + validSymbols + '+\\w+)+\\/?';
					pRegex = '\\/(?:\\w+' + validSymbols + '+\\w+)+\\/?';

					// pathObj[onlyPart] = '\\/(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/?';
					// pRegex = '\\/(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/?';

					// Alternate Regex
					regexGenerator.pRegexAlt = '\\/(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/?';
				} else {
					pathObj[onlyPart] = onlyPart + '\\/';
					pRegex = pRegex + onlyPart + '\\/';

					// Alternate Regex
					regexGenerator.pRegexAlt = '\\/(?:\\w)+\\/?';

					// pathObj[onlyPart] = '(?:\\w)+\\/';
					// pRegex = '\\/(?:\\w)+\\/?';
				}
			} else if (pParts.length > 1) {
				pRegex = '\\/';

				// Alternate Regex
				regexGenerator.pRegexAlt = '\\/';

				_.forEach(pParts, function(part) {
					if (part.trim().length > 0) {
						if (part.match('[^a-z0-9/+]')) {
							pathObj[part] = '(?:\\w+' + validSymbols + '+\\w+)+\\/';
							pRegex = pRegex + '(?:\\w+' + validSymbols + '+\\w+)+\\/';

							// pathObj[part] = '(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/';
							// pRegex = pRegex + '(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/';

							// Alternate Regex
							regexGenerator.pRegexAlt =
								regexGenerator.pRegexAlt + '(?:\\w+[!@#$%^&*()+\\[\\]<>,.|{}-]+\\w+)+\\/';
						} else {
							// pathObj[part] = '(?:\\w)+\\/';
							// pRegex = pRegex + '(?:\\w)+\\/';

							// Strict
							pathObj[part] = part + '\\/';
							pRegex = pRegex + part + '\\/';

							// Alternate Regex
							regexGenerator.pRegexAlt = regexGenerator.pRegexAlt + '(?:\\w)+\\/';
						}
					}
				});
				pRegex = pRegex + '?';

				// Alternate Regex
				regexGenerator.pRegexAlt = regexGenerator.pRegexAlt + '?';

				regexGenerator.completeObj.path = pathObj;
			}
		}
		return pRegex ? pRegex : false;
	},
	makeQRegex: function() {
		var qRegex;
		if (regexGenerator.queryArray.length) {
			qRegex = '(?:\\?';
			_.forEach(regexGenerator.queryArray, function(value) {
				qRegex = qRegex + value + '=[^/]&';
			});
			qRegex = qRegex.substring(0, qRegex.length - 1);
			qRegex = qRegex + ')?';
		}
		return qRegex ? qRegex : false;
	},
	combineRegexes: function(p, w, d, pth, q) {
		var completeRegex, completeRegexAlt;

		// if(p) {
		//     regexGenerator.completeObj.protocol = p;
		//     completeRegex = p;
		// }
		// if(w) {
		//     regexGenerator.completeObj.w = w;
		//     completeRegex = completeRegex + w;
		// }
		// if(d) {
		//     regexGenerator.completeObj.domain = d;
		//     completeRegex = completeRegex + d;
		// }
		if (pth) {
			// completeRegex = completeRegex + pth;
			completeRegex = pth;
			completeRegexAlt = regexGenerator.pRegexAlt;
		}
		if (q) {
			regexGenerator.completeObj.query = q;
			completeRegex = completeRegex + q;
			completeRegexAlt = completeRegexAlt + q;
		}
		completeRegex = completeRegex + '$';
		completeRegexAlt = completeRegexAlt + '$';

		return {
			completeRegex: completeRegex,
			completeRegexAlt: completeRegexAlt,
			completeObj: regexGenerator.completeObj
		};
	},
	init: function(inputArray) {
		regexGenerator.protocolSet = new Set(); // http | https | ftp
		regexGenerator.wSet = new Set(); // wwww or subdomain
		regexGenerator.dSet = new Set(); // domain name
		regexGenerator.specialCharacterSet = new Set();
		regexGenerator.specialCharacterArray = [];
		regexGenerator.protocolArray = [];
		regexGenerator.wArray = [];
		regexGenerator.dArray = [];
		regexGenerator.pathArray = [];
		regexGenerator.queryArray = [];
		regexGenerator.completeObj = {};
		regexGenerator.ok = true;
		regexGenerator.errorMessage = '';
		regexGenerator.pRegexAlt = '';
		regexGenerator.pathSpecialCharacterCount = 0;
		_.forEach(inputArray, function(url) {
			var parsedUrl = urlModule.parse(url, false, true);
			regexGenerator.makeSet(parsedUrl.protocol, regexGenerator.protocolSet);
			regexGenerator.makeWSet(parsedUrl.host, regexGenerator.wSet, regexGenerator.dSet, parsedUrl.pathname);
			regexGenerator.makePathArray(parsedUrl.pathname);
			regexGenerator.makeQueryArray(parsedUrl.search, parsedUrl.query);
		});
		var protocolRegex = regexGenerator.makeProtocolRegex(),
			wRegex = regexGenerator.makeWRegex(),
			dRegex = regexGenerator.makeDRegex(),
			pathRegex = regexGenerator.makePRegex(inputArray.length),
			queryRegex = regexGenerator.makeQRegex(),
			completeRegex = regexGenerator.combineRegexes(protocolRegex, wRegex, dRegex, pathRegex, queryRegex);
		if (!regexGenerator.ok) {
			return {
				ok: regexGenerator.ok,
				errorMessage: regexGenerator.errorMessage,
				regex: ''
			};
		} else {
			return {
				ok: regexGenerator.ok,
				errorMessage: '',
				regex: completeRegex
			};
		}
	}
};

module.exports = regexGenerator;
