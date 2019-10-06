module.exports = {
	conversant: {
		params: {
			mimes: ['video/mp4', 'video/x-flv']
		}
	},
	rubicon: {
		params: {
			video: {
				playerWidth: 'IAB_WIDTH',
				playerHeight: 'IAB_HEIGHT'
			}
		}
	},
	ix: {
		params: {
			video: {
				mimes: ['video/mp4', 'video/x-flv'],
				minduration: 0,
				maxduration: 60,
				protocols: [2, 3, 5, 6],
				skippable: false
			}
		}
	},
	pubmatic: {
		params: {
			video: {
				mimes: ['video/mp4', 'video/x-flv'],
				skippable: false,
				minduration: 0,
				maxduration: 60,
				playbackmethod: 2,
				api: [1, 2, 3, 4, 5],
				protocols: [1, 2, 3, 4, 5, 6]
			}
		}
	}
};
