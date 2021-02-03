// AdpTags entry point

var adpConfig = window.adpushup.config;

(function(w, d) {
	var gpt = require('./gpt');
	var hb = require('./hb');

	gpt.init(w, d);
	hb.init(w);

	if (!adpConfig.apLiteActive) {
		var adpTags = require('./adpTags');

		adpTags.init(w);
	}
})(window, document);
