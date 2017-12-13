// Events module

import commonConsts from './commonConsts';
import emitter from './emitter';
// import $ from 'jquery';

(w => {
	// $(w).scroll(data => {
	// 	emitter.publish(commonConsts.EVENTS.SCROLL, data);
	// });

	// w.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(data) {
	// 	emitter.publish(commonConsts.EVENTS.PAGE_LOAD, data);
	// });

	w.addEventListener(commonConsts.EVENTS.DOM_LOAD, function(data) {
		console.log('DOM loaded');
		emitter.publish(commonConsts.EVENTS.DOM_LOAD, data);
	});
})(window);
