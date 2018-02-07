// Common constants

const commonConsts = {
	EVENTS: {
		DOM_LOAD: 'DOMContentLoaded',
		SCRIPT_LOAD: 'scriptLoaded'
	},
	DEFAULT_CLASSNAME: 'adp_interactive_ad', 
	FORMATS: {
		STICKY: {
			NAME: 'sticky',
			BASE_STYLES: {
				position: 'fixed'
			},
			PLACEMENT_CSS: {
				BOTTOM: {
					bottom: 0,
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0
				},
				LEFT: {
					left: 0,
					bottom: 0
				},
				RIGHT: {
					right: 0,
					bottom: 0
				}
			}
		},
		VIDEO: {
			NAME: 'video',
			DEFAULT_PLAYER_CONFIG: {
				controls: true,
				muted: true,
				preload: 'none'
			},
			DEFAULT_CLASS: 'video-js',
			DEFAULT_AD_TAG_URL: 'https://ima3vpaid.appspot.com/?adTagUrl=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fclient%3Dca-video-pub-8933329999391104%26ad_type%3Dvideo%26description_url%3Dhttp%253A%252F%252Fexample.simple.com%26max_ad_duration%3D30000%26videoad_start_delay%3D0&type=js'
		}
	}
};

export default commonConsts;
