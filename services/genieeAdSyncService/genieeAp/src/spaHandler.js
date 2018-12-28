// SPA handler

function spaHandler(adp) {
	var url = window.location.href;

	function reInitAdp() {
		requestAnimationFrame(function() {
			if (url !== window.location.href) {
				url = window.location.href;
				adp.init();
			}
		});
	}

	document.body.addEventListener('click', reInitAdp);
	window.addEventListener('popstate', reInitAdp);
}

module.exports = spaHandler;
