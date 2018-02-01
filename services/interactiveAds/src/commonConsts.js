// Common constants

const commonConsts = {
	EVENTS: {
		DOM_LOAD: 'DOMContentLoaded',
		SCROLL: 'scroll'
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
			NAME: 'video'
		}
	}
};

export default commonConsts;
