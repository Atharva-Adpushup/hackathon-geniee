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
	displayAdMessage =
		'You need to copy and paste the above adcode on your site where you wish to show the ad. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>',
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
	adsTxtData = `exponential.com, 163730, DIRECT, afac06385c445926
tribalfusion.com, 163730, DIRECT, afac06385c445926
index.com, 684573, RESELLER
google.com, 684583, RESELLER
google.com, pub-4533011887610265, DIRECT, f08c47fec0942fa0
google.com, pub-8933329999391104, RESELLER, f08c47fec0942fa0
genieesspv.jp, 26899, RESELLER
smaato.com, 1001001172, RESELLER
adtech.com, 10155, RESELLER
Aol.com, 8982, RESELLER 
#video
Freewheel.tv, 195713, RESELLER 
#video
google.com, pub-1937576406332709, RESELLER, f08c47fec0942fa0 
#video
google.com, pub-5512390705137507, RESELLER, f08c47fec0942fa0 
#video
smartadserver.com, 2079, RESELLER 
#video
beachfront.com, beachfront_2207, RESELLER 
#video
google.com, pub-7683628640306220, RESELLER, f08c47fec0942fa0 
#video
google.com, pub-2393320645055022, RESELLER, f08c47fec0942fa0 
#video
google.com, pub-8856559311549217, RESELLER, f08c47fec0942fa0 
#video
spotxchange.com, 137584, RESELLER, 7842df1d2fe2db34 
#video
spotx.tv, 137584, RESELLER, 7842df1d2fe2db34 
#video
lkqd.net, 9, RESELLER, 59c49fa9598a0117
lkqd.com, 9, RESELLER, 59c49fa9598a0117
appnexus.com, 7096, RESELLER
fyber.com, 9b69c5941c9e0d463d18c41816d9d107, RESELLER
improvedigital.com, 1064, RESELLER
advertising.com, 6291, RESELLER
indexexchange.com, 176280, RESELLER, 50b1c356f2c5c8fc
google.com, pub-2051007210431666, RESELLER, f08c47fec0942fa0
openx.com, 537141605, RESELLER, 6a698e2ec38604c6
netseer.com, 3606gm23, RESELLER
google.com, pub-2795042024701939, RESELLER
openx.com, 537145299, RESELLER, 6a698e2ec38604c6
indexexchange.com, 183876, RESELLER
appnexus.com, 7722, RESELLER
appnexus.com, 740, RESELLER
adtech.com, 10557 , RESELLER
aolcloud.net, 10557 , RESELLER
bidsxchange.com, 010ae768-cf04-4c01-6049-c55c8b000075, RESELLER
bidsxchange.com, 010ae768-cf04-4c01-5f96-9576e800000e, RESELLER
adtech.com, 10388, RESELLER
adtech.com, 4627, RESELLER
advertising.com, 13174, RESELLER
beachfront.com, 5103, RESELLER
contextweb.com, 558563, RESELLER, 89ff185a4c4e857c
contextweb.com, 560537, RESELLER, 89ff185a4c4e857c
coxmt.com, 2000067982902, RESELLER
freewheel.tv, 674226, RESELLER
freewheel.tv, 674706, RESELLER
openx.com, 537143737, RESELLER, 6a698e2ec38604c6
pubmatic.com, 148800, RESELLER, 5d62403b186f2ace
pubmatic.com, 156135, RESELLER, 5d62403b186f2ace
pubmatic.com, 156729, RESELLER, 5d62403b186f2ace
smaato.com, 1100010273, RESELLER
smartadserver.com, 2088, RESELLER
smartadserver.com, 2809, RESELLER
indexexchange.com, 179394, RESELLER, 50b1c356f2c5c8fc
spotxchange.com, 152177, RESELLER, 7842df1d2fe2db34
spotx.tv, 152177, RESELLER, 7842df1d2fe2db34
google.com, pub-9021387890731428, RESELLER, f08c47fec0942fa0
memevideoad.com, 955, RESELLER
spotxchange.com,98033, RESELLER,7842df1d2fe2db34
spotx.tv, 98033, RESELLER, 7842df1d2fe2db34
freewheel.tv, 151177, RESELLER
freewheel.tv, 414097, RESELLER
fyber.com, c440532208b9f6977fa4232c3d19e140, RESELLER
advertising.com, 8893, RESELLER
indexexchange.com, 175407, RESELLER
aolcloud.net, 8893, RESELLER
adtech.com, 8893, RESELLER
pubmatic.com, 156634, RESELLER, 5d62403b186f2ace
contextweb.com, 560860, RESELLER, 89ff185a4c4e857c
pubmatic.com, 156677, RESELLER, 5d62403b186f2ace
appnexus.com, 3153, RESELLER, f5ab79cb980f11d1
adtech.com, 11095, RESELLER
districtm.io, 100750, RESELLER
coxmt.com, 2000067907202, RESELLER
Openx.com, 537143344, RESELLER
adtech.com, 11214, RESELLER
advertising.com, 9833, RESELLER
spotxchange.com, 103374,RESELLER,7842df1d2fe2db34
spotx.tv, 103374,RESELLER,7842df1d2fe2db34
lkqd.net, 44, RESELLER, 59c49fa9598a0117
fyber.com, c4f4e0402029d65ad6f0ad0be9963409, RESELLER
contextweb.com, 560780, RESELLER, 89ff185a4c4e857c
beachfront.com, 4171, RESELLER
Freewheel.tv, 440993, RESELLER
Freewheel.tv, 440961, RESELLER
pubmatic.com, 156598, RESELLER, 5d62403b186f2ace
yumenetworks.com, 2690, RESELLER, 0f8d7efd0c6b9c3e
spotxchange.com, 74844, RESELLER, 7842df1d2fe2db34
tremorhub.com, 0kq41, RESELLER, 1a4e959a1b50034a
lkqd.com, 74, RESELLER, 59c49fa9598a0117
Advertising.com, 3500, RESELLER
optimatic.com, 51501839508, RESELLER
freewheel.tv, 690770, RESELLER
freewheel.tv, 701202, RESELLER
pubmatic.com, 156793, RESELLER, 5d62403b186f2ace
lkqd.net, 452, RESELLER, 59c49fa9598a0117
lkqd.com, 452, RESELLER, 59c49fa9598a0117
lkqd.net, 156, RESELLER, 59c49fa9598a0117
lkqd.com, 156, RESELLER, 59c49fa9598a0117
mediawayss.com, 270, RESELLER
google.com, pub-1965383259143495, RESELLER, f08c47fec0942fa0
google.com, pub-6864402317197092, RESELLER, f08c47fec0942fa0
google.com, pub-3805568091292313, RESELLER, f08c47fec0942fa0
lkqd.com, 80, RESELLER, 59c49fa9598a0117
lkqd.net, 80, RESELLER, 59c49fa9598a0117
mars.media, 10, DIRECT
freewheel.tv, 30189, RESELLER
freewheel.tv, 64289, RESELLER
smartadserver.com, 2056, RESELLER
springserve.com, 233, RESELLER, a24eb641fc82e93d
Advertising.com, 6814, RESELLER
spotx.tv, 78856, RESELLER
spotxchange.com, 78856, RESELLER
beachfront.com, beachfront_805, RESELLER
springserve.com, 1, RESELLER, a24eb641fc82e93d
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
c1exchange.com, 14924, RESELLER`,
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
