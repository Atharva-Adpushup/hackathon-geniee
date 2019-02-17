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
	})(window, document);
</script>`
	},
	2: {
		name: 'Medianet',
		template: `<script id="adp_control_script___ADID__" type="text/javascript">
(function(w, d) {
	var waitUntil = setInterval(function() {
		if (d.getElementById('adp_control_script___ADID__')) {
			clearInterval(waitUntil);
			var script = d.getElementById('adp_control_script___ADID__');
			var iframeEl = d.createElement('iframe');

			iframeEl.id = 'adp_control_frame___ADID__';
			iframeEl.setAttribute('width', '__WIDTH__');
			iframeEl.setAttribute('height', '__HEIGHT__');
			iframeEl.setAttribute('marginwidth', '0');
			iframeEl.setAttribute('marginheight', '0');
			iframeEl.setAttribute('scrolling', 'no');
			iframeEl.setAttribute('frameborder', '0');

			iframeEl.onload = function() {
				var template =
					'<scr' +
					'ipt id="mNCC" language="javascript">
					medianet_width = "__WIDTH__";
					medianet_height = "__HEIGHT__";medianet_crid = "__CRID__";
					medianet_versionId = "__VERSIONID__";</scr' +
					'ipt><scr' +
					'ipt src="//contextual.media.net/nmedianet.js?cid=__CID__"></scr' +
					'ipt>';
				var iframeDoc = iframeEl.contentDocument;
				iframeDoc.open();
				iframeDoc.write(template);
				iframeDoc.close();
			};

			script.parentNode.insertBefore(iframeEl, script);
		}
	}, 50);
	})(window, document);
</script>`
	}
};

module.exports = { COMPONENT_TITLES, CONTROL_CONVERSION_NETWORKS };
