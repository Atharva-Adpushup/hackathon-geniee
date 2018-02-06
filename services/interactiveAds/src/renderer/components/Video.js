// Video ad component

import commonConsts from '../../commonConsts';
import Component from './Component';
import '../../videojs/css/videojs-ads-ima.css';
import $ from '../../$';
import config from '../../config';

class Video extends Component {
    constructor(parentNode, interactiveAd, adCode) {
        super(parentNode, interactiveAd, adCode);

        this.initImaSdk = this.initImaSdk.bind(this);
        if(!config.imaSdkLoaded) {
            this.initImaSdk();
        }   
    }

    initImaSdk() {
        const script = $('<script/>');
        script.attr({ src: commonConsts.FORMATS.VIDEO.IMA_SDK, async: true});
        $('head').append(script);

        config.imaSdkLoaded = true;
    }
}

export default Video;

// window.adpInteractiveImaModulesLoaded = false;
// const $ = window.adpushup.$ || window.$,
// 	loadImaModules = () => {
// 		const { CSS, JS, IMA_SDK } = commonConsts.FORMATS.VIDEO.AD_MODULES;
// 		let modulesToAppend = [];

// 		CSS.forEach(module => {
// 			modulesToAppend.push($('<link/>').attr({ href: `${commonConsts.IMA_MODULES_CDN}${module}`, rel: 'stylesheet' }));
// 		});
// 		// modulesToAppend.push($('<script/>').attr({ src: IMA_SDK }));
// 		// JS.forEach(module => {
// 		// 	modulesToAppend.push($('<script/>').attr({ src: `${commonConsts.IMA_MODULES_CDN}${module}` }));
// 		// });

// 		modulesToAppend.forEach(module => {
// 			$('head').append(module);
// 		});
// 	},
// 	createPlayer = interactiveAd => {
// 		const { width, height, id } = interactiveAd;

// 		const player = window.videojs(document.getElementById(id), {
// 			width,
// 			height,
// 			controls: true
// 		}, function () {
// 			this.addClass('video-js');
// 			this.src('//cdn.adpushup.com/videos/1.mp4');
// 			console.log(this.ima);
// 		});
		
// 		var options = {
// 			id,
// 			adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator='
// 		  };
		  
// 		  player.ima(options);

// 		  return player;
// 	},
// 	Video = (parentNode, interactiveAd, adCode) => {
// 		if(!window.adpInteractiveImaModulesLoaded) {
// 			loadImaModules();
// 		}
// 		window.adpInteractiveImaModulesLoaded = true;

// 		const video = $('<video/>'),
// 			{ width, height, id } = interactiveAd;

// 		video.css({ width, height }).attr({ id });
// 		parentNode.append(video);

// 		return createPlayer(interactiveAd);
// 	};

// export default Video;
