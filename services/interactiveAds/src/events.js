// Events module

import commonConsts from './commonConsts';
import emitter from './emitter';

((w, ap) => {
	ap.$(document).ready(() => {
		console.log('dom loaded in emitter');
		emitter.publish(commonConsts.EVENTS.DOM_LOAD, {});
	});

	ap.$(w).scroll(data => {
		emitter.publish(commonConsts.EVENTS.SCROLL, data);
	});
})(window, adpushup);
