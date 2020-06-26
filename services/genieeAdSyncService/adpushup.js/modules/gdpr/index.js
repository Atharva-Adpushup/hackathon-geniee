!(function() {
	var o = document.createElement('script');
	o.src = 'https://cc.cdn.civiccomputing.com/9/cookieControl-9.x.min.js';
	document.head.appendChild(o);
	var n = setInterval(function() {
		window.CookieControl && (clearInterval(n), CookieControl.load(__COOKIE_CONTROL_CONFIG__));
	}, 10);
})();
