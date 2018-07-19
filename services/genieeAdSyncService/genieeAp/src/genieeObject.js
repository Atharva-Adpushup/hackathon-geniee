var utils = require('../libs/utils'),
	// Below object will hold all Geniee partner specific functionality
	genieeObject = {
		// Tell geniee whether AdPushup will run 'adpushup' or 'control' mode
		// 'selectedMode' parameter will contain variationId (uuid value) or 'CONTROL' string as values
		sendSelectedModeFeedback: function(selectedMode) {
			var isGnsModOneTag = !!(window.gnsmod && window.gnsmod.useOneTag);

			if (!isGnsModOneTag) {
				return false;
			}

			window.gnsmod.adpVariation(selectedMode);
		},
		// Boolean flag to check whether body tags feedback has been called or not
		hasBodyTagsRendered: false,
		// Tell geniee that all slots will be rendered
		sendBeforeBodyTagsFeedback: function() {
			var isGnsModBeforeBodyTags = !!(window.gnsmod && window.gnsmod.notifyBeforeBodyTags);

			if (!isGnsModBeforeBodyTags || this.hasBodyTagsRendered) {
				return false;
			}

			window.gnsmod.notifyBeforeBodyTags();
		}
	};

module.exports = genieeObject;
