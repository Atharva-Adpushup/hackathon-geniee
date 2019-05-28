// Video recommendation module

import commonConsts from '../../../commonConsts';
import $ from '../../../$';

const mapping = commonConsts.FORMATS.VIDEO.RECOMMENDATION.MAPPING,
	filter = (tags, currentVideoTags) => {
		let filtered = [];
		for (let i = 0; i < tags.length; i++) {
			if (currentVideoTags.includes(tags[i].trim())) {
				filtered.push(tags[i]);
			}
		}
		return filtered;
	},
	getRandomVideo = () => {
		const keys = Object.keys(mapping),
			limit = keys.length - 1;

		return keys[Math.round(Math.random() * limit)];
	},
	findVideo = tags => {
		let max = {
			id: 0,
			prob: 0
		};
		if (!Array.isArray(tags) && tags.length == 0) {
			throw new Error('Tags must be an array of length more than 0');
		}
		for (let id in mapping) {
			const currentVideoTags = mapping[id],
				commonTags = filter(tags, currentVideoTags),
				commonPercentage = commonTags.length
					? parseFloat((commonTags.length / tags.length * 100).toFixed(2))
					: 0;

			commonPercentage > max.prob ? ((max.id = id), (max.prob = commonPercentage)) : null;
		}
		return max.id == 0 ? getRandomVideo() : max.id;
	},
	getRecommendedVideo = keywords => {
		return new Promise((resolve, reject) => {
			$.get(`${commonConsts.FORMATS.VIDEO.RECOMMENDATION.API_URL}${keywords.join(',')}`, res => {
				if (res.data && res.data.url) {
					return resolve(res.data);
				}
				return reject('Error');
			});
		});
	},
	recommendation = () => {
		const metaTagArray = document.querySelectorAll("meta[name='keywords']"),
			tags = metaTagArray.length ? metaTagArray[0].getAttribute('content').split(',') : [],
			keywordsIndex = findVideo(tags);

		return getRecommendedVideo(mapping[keywordsIndex]);
	};

export default recommendation;
