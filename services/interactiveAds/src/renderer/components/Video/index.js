// Video ad component

import './videojs-ima/css/videojs-ads-ima.css';
import './videojs-ima/js/ima-sdk';
import commonConsts from '../../../commonConsts';
import Component from '../Component';
import $ from '../../../$';
import recommendation from './recommendation';
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

class Video extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.createPlayer = this.createPlayer.bind(this);
	}

	createPlayer() {
		const { id, width, height } = this.interactiveAd,
			player = $('<video/>'),
			{ VIDEO } = commonConsts.FORMATS;

		player.attr({ id });
		this.parentNode.append(player);

		return recommendation().then(videoData => {
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

					const options = {
						id,
						debug: true,
						adTagUrl: VIDEO.DEFAULT_AD_TAG_URL
					};

					this.ima(options);
				}
			);
		});
	}
}

export default Video;
