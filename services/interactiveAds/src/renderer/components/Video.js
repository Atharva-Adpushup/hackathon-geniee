// Video ad component

import commonConsts from '../../commonConsts';
import Component from './Component';
import '../../videojs/css/videojs-ads-ima.css';
import $ from '../../$';
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

class Video extends Component {
    constructor(parentNode, interactiveAd, adCode) {
        super(parentNode, interactiveAd, adCode);

        this.createPlayer = this.createPlayer.bind(this);

        this.createPlayer();
    }

    createPlayer() {
        const { id, width, height } = this.interactiveAd,
            player = $('<video/>');

        player.attr({ id });
        this.parentNode.append(player);

        return videojs(id, { 
            controls: true,
            muted: true,
            width,
            height,
            preload: 'none'
        }, function() {
            this.addClass('video-js');
            this.src('https://adpushup-ads-cdn-origin.azureedge.net/videos/1OnkNzuZxA0.mp4');

            console.log(window.ima);
            // const options = {
            //     id,
            //     debug: true,
            //     adTagUrl: 'https://ima3vpaid.appspot.com/?adTagUrl=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fclient%3Dca-video-pub-8933329999391104%26ad_type%3Dvideo%26description_url%3Dhttp%253A%252F%252Fexample.simple.com%26max_ad_duration%3D30000%26videoad_start_delay%3D0&type=js'
            // };
                      
            //   this.ima(options);
            //   console.log(this);
        });
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
