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
	TYPES = {
		DESKTOP: [
			{
				name: 'Display',
				image: '/assets/images/tagManager/types/desktop/display.png',
				key: 'display'
			},
			{
				name: 'Sticky Left',
				image: '/assets/images/tagManager/types/desktop/sticky-left.png',
				key: 'stickyLeft'
			},
			{
				name: 'Sticky Right',
				image: '/assets/images/tagManager/types/desktop/sticky-right.png',
				key: 'stickyRight'
			},
			{
				name: 'Sticky Bottom',
				image: '/assets/images/tagManager/types/desktop/sticky-bottom.png',
				key: 'stickyBottom'
			}
			// {
			// 	name: 'Video',
			// 	image: '/assets/images/tagManager/types/desktop/video.png',
			// 	key: 'video'
			// }
		],
		MOBILE: [
			{
				name: 'Display',
				image: '/assets/images/tagManager/types/mobile/display.png',
				key: 'display'
			},
			// {
			// 	name: 'Sticky Left',
			// 	image: '/assets/images/tagManager/types/mobile/sticky-left.png',
			// 	key: 'stickyLeft'
			// },
			// {
			// 	name: 'Sticky Right',
			// 	image: '/assets/images/tagManager/types/mobile/sticky-right.png',
			// 	key: 'stickyRight'
			// },
			{
				name: 'Sticky Bottom',
				image: '/assets/images/tagManager/types/mobile/sticky-bottom.png',
				key: 'stickyBottom'
			}
			// {
			// 	name: 'Video',
			// 	image: '/assets/images/tagManager/types/mobile/video.png',
			// 	key: 'video'
			// }
		]
		// TABLET: [
		// 	{
		// 		name: 'Display',
		// 		image: '/assets/images/tagManager/types/tablet/display.png',
		// 		key: 'display'
		// 	},
		// 	{
		// 		name: 'Sticky Left',
		// 		image: '/assets/images/tagManager/types/tablet/sticky-left.png',
		// 		key: 'stickyLeft'
		// 	},
		// 	{
		// 		name: 'Sticky Right',
		// 		image: '/assets/images/tagManager/types/tablet/sticky-right.png',
		// 		key: 'stickyRight'
		// 	},
		// 	{
		// 		name: 'Sticky Bottom',
		// 		image: '/assets/images/tagManager/types/tablet/sticky-bottom.png',
		// 		key: 'stickyBottom'
		// 	},
		// 	{
		// 		name: 'Video',
		// 		image: '/assets/images/tagManager/types/tablet/video.png',
		// 		key: 'video'
		// 	}
		// ]
	},
	SIZES = {
		DESKTOP: {
			DISPLAY: [
				'336x280',
				'300x250',
				'250x250',
				'200x200',
				'728x90',
				'468x60',
				'300x600',
				'160x600',
				'120x600',
				'320x50',
				'970x250',
				'900x90'
			],
			STICKYBOTTOM: ['900x90', '468x60', '728x90'],
			STICKYLEFT: ['160x600', '336x280', '300x250', '300x600', '120x600'],
			STICKYRIGHT: ['160x600', '336x280', '300x250', '300x600', '120x600'],
			VIDEO: ['336x280']
		},
		MOBILE: {
			DISPLAY: ['336x280', '300x250', '250x250', '200x200', '320x100', '320x50'],
			STICKYBOTTOM: ['320x100', '300x100', '320x50'],
			VIDEO: ['336x280']
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
	displayAdMessage = 'You need to copy and paste the above adcode on your site where you wish to show the ad',
	interactiveAdMessage = 'Ad has been created. AdPushup will automatically insert ad on your site on the runtime.',
	adCode = `<div id="__AD_ID__">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(function() {
			adpushup.triggerAd("__AD_ID__");
		});
	</script>
</div>`,
	adCodeVideo = `<div id="#adp_video___AD_ID__"></div>`,
	adsTxtData = `springserve.com, 1, RESELLER, a24eb641fc82e93d
tremorhub.com, cdgfn, RESELLER, 1a4e959a1b50034a
google.com, pub-6512936480753445, RESELLER, f08c47fec0942fa0
spotx.tv, 111271, RESELLER 
spotxchange.com, 111271, RESELLER
appnexus.com, 926, RESELLER
appnexus.com, 1538, RESELLER 
advertising.com, 9008, RESELLER
freewheel.tv, 208505, RESELLER
freewheel.tv, 327377, RESELLER
btrll.com, 6836428, RESELLER
contextweb.com, 560580, RESELLER
pubmatic.com, 156108, RESELLER, 5d62403b186f2ace
pubmatic.com, 156410, RESELLER, 5d62403b186f2ace
contextweb.com, 561503, RESELLER, 89ff185a4c4e857c
appnexus.com, 3911, RESELLER, f5ab79cb980f11d1
vi.ai, 176220180530289, DIRECT
spotx.tv, 74964, RESELLER, 7842df1d2fe2db34
c1exchange.com, 14924, RESELLER
google.com, pub-8933329999391104, RESELLER, f08c47fec0942fa0`,
	initCode = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__SITE_ID__/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;

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
	initCode
};
