// SPA handler

var spaHandlerEnabled = false,
	spaHandler = function(adp) {
		if (!spaHandlerEnabled) {
			spaHandlerEnabled = true;
			var url = window.location.href;

			function reInitAdp() {
				window.requestAnimationFrame(function() {
					window.setTimeout(function() {
						if (url !== window.location.href) {
							url = window.location.href;
							adp.init();
						}
					}, adp.config.spaPageTransitionTimeout);
				});
			}

			document.body.addEventListener('click', reInitAdp, true);
			window.addEventListener('popstate', reInitAdp);
		}
	};

module.exports = spaHandler;
