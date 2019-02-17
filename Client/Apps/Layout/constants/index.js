const COMPONENT_TITLES = {
	1: 'Layout Testing',
	2: 'Ads List'
	// 4: 'Ads Txt Config',
	// 1: 'AdPushup Header Code'
};

const CONTROL_CONVERSION_NETWORKS = {
	1: {
		name: 'All Ad Networks',
		template: `<ins class="adPushupAds" data-adpControl="_STRING_" data-ver="2" data-siteId="_SITEID_" data-ac="_CODE_"></ins>
<script data-cfasync="false" type="text/javascript">
	(function (w, d) { for (var i = 0, j = d.getElementsByTagName("ins"), k = j[i]; i < j.length; k = j[++i]){ 
		if(k.className == "adPushupAds" && k.getAttribute("data-push") != "1") { 
			((w.adpushup = w.adpushup || {}).control = (w.adpushup.control || [])).push(k); 
				k.setAttribute("data-push", "1");
			} 
		} 
	})(window, document);</script>`
	},
	2: {
		name: 'Medianet',
		template: ''
	}
};

module.exports = { COMPONENT_TITLES, CONTROL_CONVERSION_NETWORKS };
