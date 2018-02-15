// Video ad component

import './videojs-ima/css/videojs-ads-ima.css';
import './videojs-ima/js/ima-sdk';
import commonConsts from '../../../commonConsts';
import Component from '../Component';
import $ from '../../../$';
import config from '../../../config';
import recommendation from './recommendation';
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

class Video extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.createPlayer = this.createPlayer.bind(this);
		this.initIma = this.initIma.bind(this);
	}

	appendPassbackAd(adCode) {
		const { id, width, height } = this.interactiveAd,
			passbackAd = $('<div/>');

		passbackAd.attr({ id }).css({ width, height });
		return this.parentNode.append(passbackAd.append(adCode));
	}

	initIma(videoData) {
		const { id, width, height, networkData } = this.interactiveAd,
			{ url } = videoData,
			{ VIDEO } = commonConsts.FORMATS,
			VideoInstance = this,
			player = $('<video/>'),
			adCode = atob(networkData.adCode);

		player.attr({ id });
		this.parentNode.append(player);

		return videojs(
			id,
			{
				...VIDEO.DEFAULT_PLAYER_CONFIG,
				width,
				height
			},
			function() {
				this.addClass(VIDEO.DEFAULT_CLASS);
				this.src(url);
				config.ads[id].videoData = videoData;

				const options = {
					id,
					debug: true,
					adWillPlayMuted: true,
					adTagUrl: VIDEO.DEFAULT_AD_TAG_URL.replace('__DESCRIPTION_URL__', window.location.origin)
				};

				this.ima(options);

				this.on(VIDEO.EVENTS.AD_ERROR, function() {
					if (adCode) {
						this.dispose();
						VideoInstance.appendPassbackAd(adCode);
					}
				});

				// Hacky way to mute the ad as "adWillPlayMuted" option is not working
				this.on(VIDEO.EVENTS.AD_STARTED, function() {
					this.ima.getAdsManager().setVolume(0);
				});
			}
		);
	}

	createPlayer() {
		return recommendation()
			.then(videoData => this.initIma(videoData))
			.catch(err => {
				throw new Error('Error in video recommendation');
			});
	}
}

export default Video;
