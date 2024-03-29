const COMPONENT_TITLES = {
	1: 'Layout Testing'
};

const CONTROL_CONVERSION_NETWORKS = {
	1: {
		name: 'All Ad Networks',
		template: `<ins class="adPushupAds" data-adpControl="_STRING_" data-ver="2" data-siteId="_SITEID_" data-ac="_CODE_"></ins>
<script data-cfasync="false" type="text/javascript">
	(function (w, d) { for (var i = 0, j = d.getElementsByTagName("ins"), k = j[i]; i < j.length; k = j[++i]){ 
		if(k.className == "adPushupAds" && k.getAttribute("data-push") != "1") { 
			((w.adpushup = w.adpushup || {que:[]}).control = (w.adpushup.control || [])).push(k); 
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

const NETWORKS_NAME = {
	ADSENSE: 'adsense',
	ADX: 'adx',
	DFP: 'dfp',
	MEDIANET: 'medianet'
};

const NETWORK_PLACEHOLDERS = {
	ADSENSE: `For example, enter AdSense ad code in below mentioned format: 
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
	style="display:block"
	data-ad-client="ca-pub-XXXXXXXXXXXX"
	data-ad-slot="XXXXXXXX"
	data-full-width-responsive="true"></ins>
<script>
	(adsbygoogle = window.adsbygoogle || []).push({});
</script>`,
	ADX: `For example, enter AdX ad code in below mentioned format:
<script type="text/javascript"><!--
	google_ad_client = "ca-pub-XXXXXXXXXXXXXXXX";
	/* Name_XXXxXXX */
	google_ad_slot = "Name_XXXxXXX";
	google_ad_width = XXX;
	google_ad_height = XXX;
	//-->
</script>
<script type="text/javascript"
src="//pagead2.googlesyndication.com/pagead/show_ads.js">
</script>`,
	DFP: `For example, enter DFP ad code in below mentioned format:
<!-- /Ad-Name -->
<div id='div-gpt-ad-XXXXXXXXXXXXX' style='height:XXXpx; width:XXXpx;'>
<script>
	googletag.cmd.push(function() { googletag.display('div-gpt-ad-XXXXXXXXXXXXX'); });
</script>
</div>`,
	MEDIANET: `For example, enter Medianet ad code in below mentioned format:
<script id="mNCC" language="javascript">
    medianet_width = "XXX";
    medianet_height = "XX";
    medianet_crid = "XXXXXXXXX";
    medianet_versionId = "XXXXXXX"; 
</script>
<script src="//contextual.media.net/nmedianet.js?cid=XXXXXXXXX"></script>
`
};

const NETWORK_MEDIANET_INPUT_CODE_REGEXES = {
	height: /medianet_height = "\w+"/gi,
	width: /medianet_width = "\w+"/gi,
	crid: /medianet_crid = "\w+"/gi,
	versionId: /medianet_versionId = "\w+"/gi,
	cid: /cid=\w+/gi
};

const NETWORK_COLLECTION = [
	{
		name: 'Adsense',
		value: NETWORKS_NAME.ADSENSE
	},
	{
		name: 'AdX',
		value: NETWORKS_NAME.ADX
	},
	{
		name: 'DFP',
		value: NETWORKS_NAME.DFP
	},
	{
		name: 'Medianet',
		value: NETWORKS_NAME.MEDIANET
	}
];

module.exports = {
	COMPONENT_TITLES,
	CONTROL_CONVERSION_NETWORKS,
	NETWORK_COLLECTION,
	NETWORKS_NAME,
	NETWORK_PLACEHOLDERS,
	NETWORK_MEDIANET_INPUT_CODE_REGEXES
};
