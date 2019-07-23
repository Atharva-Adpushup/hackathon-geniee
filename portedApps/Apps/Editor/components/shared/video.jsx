var React = window.React,
	$ = window.jQuery;

module.exports = React.createClass({
	mixins: [],
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	onVideoEnd: function() {
		if (this.props.src) {
			var t = this.props.src.split('/'); //get video name
			analytics.track(
				'EDITOR_WatchedVideo',
				{
					siteDomain: window.ADP_SITE_DOMAIN,
					siteId: window.ADP_SITE_ID,
					video: t[t.length - 1],
					IS_ADMIN: window.ADP_IS_ADMIN
				}
				// intercomObj
			);
		}
		this.player.addChild('BigPlayButton');
		this.$playerPlayButton.show();
	},
	onPlayCliked: function() {
		this.$playerPlayButton.hide();
	},
	playerInit: function() {
		this.player.on('ended', this.onVideoEnd.bind(this));
		this.$playerPlayButton = $(this.player.el()).find('.vjs-big-play-button');
		this.$playerPlayButton.on('click', this.onPlayCliked.bind(this));
	},
	componentDidMount: function() {
		var video = document.createElement('video'),
			source = document.createElement('source');
		video.setAttribute('class', 'video-js vjs-default-skin');
		video.setAttribute('preload', 'auto');
		video.setAttribute('height', 380);
		video.setAttribute('width', 675);

		if (this.props.controls) {
			video.setAttribute('controls', true);
		}

		if (this.props.autoplay !== false) {
			video.setAttribute('autoplay', true);
		}

		source.setAttribute('src', this.props.src);
		source.setAttribute('type', this.props.type);

		video.appendChild(source);

		this.refs.target.getDOMNode().appendChild(video);
		this.player = videojs(video, {}, function() {
			// Player (this) is initialized and ready.
		});
		this.playerInit();
	},
	render: function() {
		return <div className="ap_video" ref="target" />;
	}
});
