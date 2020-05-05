function loadApsTag(w, d) {
	var scr = document.createElement('script');
	scr.async = !0;
	scr.src = '//c.amazon-adsystem.com/aax2/apstag.js';
	(document.head || document.body).append(scr);
}

function initiateApsTag(w) {
	function q(c, r) {
		w.apstag._Q.push([c, r]);
	}
	w.apstag = {
		init: function() {
			q('i', arguments);
		},
		fetchBids: function() {
			q('f', arguments);
		},
		setDisplayBids: function() {},
		targetingKeys: function() {
			return [];
		},
		_Q: []
	};
}

if (!window.apstag) {
	loadApsTag(window, document);
	initiateApsTag(window, document);
}
