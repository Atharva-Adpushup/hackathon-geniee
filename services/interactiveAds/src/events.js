// Events module

import commonConsts from './commonConsts';
import emitter from './emitter';

((w, ap) => {
	ap.$(document).ready(function() {
		emitter.publish(commonConsts.EVENTS.DOM_LOAD, w);
	});

	ap.$(w).scroll(data => {
		emitter.publish(commonConsts.EVENTS.SCROLL, data);
	});

	// w.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(data) {
	// 	emitter.publish(commonConsts.EVENTS.PAGE_LOAD, data);
	// });
})(window, adpushup);
