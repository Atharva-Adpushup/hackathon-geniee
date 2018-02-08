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
	}

	appendPassbackAd() {
		const { networkData, id, width, height } = this.interactiveAd,
			passbackAd = $('<div/>');

		passbackAd.attr({ id }).css({ width, height });
		this.parentNode.append(passbackAd.append(atob(networkData.adCode)));
	}

	createPlayer() {
		const { id, width, height, networkData } = this.interactiveAd,
			player = $('<video/>'),
			{ VIDEO } = commonConsts.FORMATS,
			VideoInstance = this;

		player.attr({ id });
		this.parentNode.append(player);

		return recommendation()
			.then(videoData => {
				const { url } = videoData;

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
							adTagUrl: VIDEO.DEFAULT_AD_TAG_URL
						};

						this.ima(options);

						this.on(VIDEO.EVENTS.ERROR, function() {
							this.dispose();
							VideoInstance.appendPassbackAd();
						});
					}
				);
			})
			.catch(err => {
				throw new Error('Error in video recommendation');
			});
	}
}

export default Video;
