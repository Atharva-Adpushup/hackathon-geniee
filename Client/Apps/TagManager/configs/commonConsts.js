const PLATFORMS = [
		{
			name: 'Desktop',
			image: '/assets/images/tagManager/devices/desktop.png',
			key: 'desktop'
		},
		{
			name: 'Mobile',
			image: '/assets/images/tagManager/devices/smartphone.png',
			key: 'mobile'
		}
		// {
		// 	name: 'Tablet',
		// 	image: '/assets/images/tagManager/devices/tablet.png',
		// 	key: 'tablet'
		// }
	],
	TYPES = [
		{
			name: 'Display (Text / Image)',
			image: '/assets/images/tagManager/display.png',
			key: 'display',
			description: 'A simple way to get ads on your page. Select size, generate code and you are good to go'
		},
		{
			name: 'Native',
			image: '/assets/images/tagManager/native.png',
			key: 'native',
			description:
				'Ads that flow seamlessly inside a list of articles or products on your site, offering a great user experience'
		},
		{
			name: 'Links',
			image: '/assets/images/tagManager/links.png',
			key: 'links',
			description: 'Link units display a list of topics that are relevant to the content of your page'
		},
		{
			name: 'AMP Ad',
			image: '/assets/images/tagManager/amp.png',
			key: 'amp',
			description: 'AMPHTML ads are a faster, lighter and more secure way to advertise on the web'
		}
	],
	SIZES = {
		DISPLAY: {
			ALLOWED: ['responsive', 'desktop', 'mobile'],
			DESKTOP: [
				'970x250',
				'970x90',
				'728x250',
				'728x90',
				'468x60',
				'336x280',
				'320x50',
				'300x600',
				'300x100',
				'250x250',
				'240x240',
				'234x60',
				'200x200',
				'180x150',
				'160x600',
				'120x600',
				'120x240',
				'300x250'
			],
			MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
		},
		NATIVE: {
			ALLOWED: ['desktop', 'mobile'],
			DESKTOP: [
				'970x250',
				'970x90',
				'728x250',
				'728x90',
				'468x60',
				'336x280',
				'320x50',
				'300x600',
				'300x100',
				'250x250',
				'240x240',
				'234x60',
				'200x200',
				'180x150',
				'160x600',
				'120x600',
				'120x240',
				'300x250'
			],
			MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
		},
		LINKS: {
			ALLOWED: ['responsive', 'desktop', 'mobile'],
			DESKTOP: ['336x280', '120x600', '1070x250', '320x100', '336x280', '300x250', '468x60'],
			MOBILE: ['320x100', '336x280', '300x250', '468x60']
		},
		AMP: {
			ALLOWED: ['mobile'],
			DESKTOP: [
				'970x250',
				'970x90',
				'728x250',
				'728x90',
				'468x60',
				'336x280',
				'320x50',
				'300x600',
				'300x100',
				'250x250',
				'240x240',
				'234x60',
				'200x200',
				'180x150',
				'160x600',
				'120x600',
				'120x240',
				'300x250'
			],
			MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
		}
	},
	interactiveAdEvents = ['DOMContentLoaded', 'scriptLoaded'], //load', 'scroll', 'onMills',
	adActions = {
		CREATE_AD: 'CREATE_AD',
		UPDATE_ADS_LIST: 'UPDATE_ADS_LIST',
		REPLACE_ADS_LIST: 'REPLACE_ADS_LIST',
		DELETE_AD: 'DELETE_AD',
		UPDATE_AD: 'UPDATE_AD'
	},
	uiActions = {
		SET_CREATE_AD_ERROR: 'SET_CREATE_AD_ERROR',
		SET_CREATE_AD_LOADER: 'SET_CREATE_AD_LOADER',
		SET_FETCH_ADS_ERROR: 'SET_FETCH_ADS_ERROR'
	},
	globalActions = {
		SET_CURRENT_AD: 'SET_CURRENT_AD'
	},
	displayAdMessage =
		'You need to copy and paste the above adcode on your site where you wish to show the ad. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>',
	ampMessage = 'AMP adcode will be sent to your registered e-mail address by your account manager',
	interactiveAdMessage =
		'Ad has been created. AdPushup will automatically insert ad on your site on the runtime. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>',
	adCode = `<div id="__AD_ID__" class="_ap_apex_ad">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(function() {
			adpushup.triggerAd("__AD_ID__");
		});
	</script>
</div>`,
	adCodeVideo = `<div id="#adp_video___AD_ID__"></div>`,
	adsTxtData = `#AdX
google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0
#DMX and OpenX
openx.com, 539848768, RESELLER 
districtm.io, 101143, DIRECT
appnexus.com, 1908, RESELLER
appnexus.com, 7944, RESELLER
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0
#C1X
c1exchange.com, 14924, RESELLER
#Pulsepoint
contextweb.com,560684,RESELLER,89ff185a4c4e857c
#BrainJuiceMedia
appnexus.com, 3911, RESELLER, f5ab79cb980f11d1
#OFT
appnexus.com, 3153, RESELLER, f5ab79cb980f11d1
districtm.io, 100750, DIRECT
adtech.com, 11095, Reseller
coxmt.com, 2000067907202, Reseller
Openx.com, 537143344, Reseller
indexexchange.com, 175407, Reseller
#Media.net
media.net, 8CUPEPKI9, DIRECT	
sonobi.com, 83729e979b, RESELLER	
coxmt.com, 2000068030802, RESELLER	
districtm.io, 100600, RESELLER	
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1
media.net, 8CUZU1Z30, DIRECT
google.com, pub-7439041255533808, RESELLER, f08c47fec0942fa0
openx.com, 537100188, RESELLER, 6a698e2ec38604c6
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, RESELLER
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, DIRECT
indexexchange.com, 182961, RESELLER
pubmatic.com, 93915, RESELLER, 5d62403b186f2ace
spotxchange.com, 152198, RESELLER, 7842df1d2fe2db34
openx.com, 537141219, RESELLER, 6a698e2ec38604c6
rubiconproject.com, 14410, RESELLER, 0bfd66d529a55807
spotxchange.com, 211156, RESELLER, 7842df1d2fe2db34
spotx.tv, 211156, RESELLER, 7842df1d2fe2db34
#DMXDirect
districtm.io, 101642,DIRECT 
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1 
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0 
# 33Across
33across.com,0010b00002AQUQFAA5, DIRECT 
google.com, pub-9557089510405422, RESELLER, f08c47fec0942fa0 
appnexus.com, 1001, RESELLER 
appnexus.com, 3135, RESELLER 
openx.com, 537120563, RESELLER, 6a698e2ec38604c6 
rubiconproject.com, 16414, RESELLER, 0bfd66d529a55807 
pubmatic.com, 156423, RESELLER, 5d62403b186f2ace 
amazon.com, 3411, RESELLER 
criteo.com, 3450, RESELLER
indexexchange.com, 185506, RESELLER
adtech.com, 9993, RESELLER 
aolcloud.net, 9993, RESELLER
openx.com, 539266264, RESELLER, 6a698e2ec38604c6  
appnexus.com, 1356, RESELLER, f5ab79cb980f11d1  
emxdgt.com, 326, RESELLER, 1e1d41537f7cad7f  
google.com, pub-5995202563537249, RESELLER, f08c47fec0942fa0`,
	initCode = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__SITE_ID__/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`,
	COMPONENT_TITLES = {
		2: 'Create Ad Unit',
		3: 'Ads List',
		4: 'Ads Txt Config',
		1: 'AdPushup Header Code'
	};

export {
	PLATFORMS,
	TYPES,
	SIZES,
	adActions,
	uiActions,
	globalActions,
	displayAdMessage,
	interactiveAdMessage,
	adCode,
	adCodeVideo,
	interactiveAdEvents,
	adsTxtData,
	initCode,
	ampMessage,
	COMPONENT_TITLES
};
