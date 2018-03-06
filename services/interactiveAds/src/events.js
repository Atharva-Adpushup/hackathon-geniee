// Events module

import commonConsts from './commonConsts';
import emitter from './emitter';
import $ from './$';

((w, ap) => {
	ap.$(document).ready(() => {
		emitter.publish(commonConsts.EVENTS.DOM_LOAD, {});
	});

	ap.$(w).scroll(data => {
		emitter.publish(commonConsts.EVENTS.SCROLL, data);
	});
})(window, adpushup);
