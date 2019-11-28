// AdpTags entry point

(function (w, d) {
	var gpt = require('./gpt');
	var hb = require('./hb');
	var adpTags = require('./adpTags');

	gpt.init(w, d);
	hb.init(w);
	adpTags.init(w);
})(window, document);
