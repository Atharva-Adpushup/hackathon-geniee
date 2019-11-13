// XHR module

var utils = require('../helpers/utils'),
	xhr = function(method, url, payload, callback, option) {
		if (!method || !url) {
			utils.log('AdpTags: Please provide valid HTTP method and url in xhr module');
			return;
		}

		var http = new XMLHttpRequest();

		switch (method) {
			case 'GET':
			case 'get':
				payload = utils.stringifyJSON(payload);
				url += payload;

				http.open(method, url, true);
				http.send();
				break;
			case 'POST':
			case 'post':
				http.open(method, url, true);

				if (!option) {
					http.setRequestHeader('Content-type', 'application/json');
					http.send(JSON.stringify(payload));
				} else {
					http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
					http.send();
				}
				break;
		}

		http.onload = function() {
			callback(null, http.response);
		};

		http.onerror = function() {
			callback(http.response);
		};
	};

module.exports = xhr;
