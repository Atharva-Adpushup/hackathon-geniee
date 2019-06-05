// AdpTags entry point

(function(w, d) {
	var hb = require('./hb');
	var gpt = require('./gpt');
	var adpTags = require('./adpTags');

	hb.init(w);
	gpt.init(w, d);
	adpTags.init(w);
})(window, document);
