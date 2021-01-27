// Events module

import commonConsts from './commonConsts';
import emitter from './emitter';

((w, d) => {
	d.addEventListener('DOMContentLoaded', function() {
		emitter.publish(commonConsts.EVENTS.DOM_LOAD, {});
	});

	w.addEventListener('scroll', data => {
		emitter.publish(commonConsts.EVENTS.SCROLL, data);
	});
})(window, document);
