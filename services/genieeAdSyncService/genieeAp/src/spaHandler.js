// SPA handler

var spaHandlerEnabled = false,
	spaHandler = function(w, adp) {
		if (!spaHandlerEnabled) {
			spaHandlerEnabled = true;
			var url = w.location.href;

			function reInitAdp() {
				w.requestAnimationFrame(function() {
					w.setTimeout(function() {
						if (url !== w.location.href) {
							url = w.location.href;
							adp.init();
						}
					}, adp.config.spaPageTransitionTimeout);
				});
			}

			document.body.addEventListener('click', reInitAdp, true);
			w.addEventListener('popstate', reInitAdp);
		}
	};

module.exports = spaHandler;
