import clipboard from 'clipboard-polyfill';
import { INTERACTIVE_ADS_TYPES } from '../configs/commonConsts';

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content) {
	clipboard.writeText(content);
	alert('Successfully Copied');
}

function pagegroupFiltering(channels, platform, format, meta, listMode = false, currentPagegroups = []) {
	const filteredPagegroupsByPlatform = channels.filter(channel => {
		const re = new RegExp(platform, 'ig');
		return channel.match(re);
	});
	const disabled = new Set();

	let types;

	if (INTERACTIVE_ADS_TYPES.VERTICAL.includes(format)) {
		types = INTERACTIVE_ADS_TYPES.VERTICAL;
	} else if (INTERACTIVE_ADS_TYPES.HORIZONTAL.includes(format)) {
		types = INTERACTIVE_ADS_TYPES.HORIZONTAL;
	} else {
		types = INTERACTIVE_ADS_TYPES.OTHER;
	}

	filteredPagegroupsByPlatform.forEach(pg => {
		let shouldDisable = false;
		types.forEach(type => {
			if (listMode && currentPagegroups.includes(pg)) {
				shouldDisable = false;
			} else if (meta.pagegroups.includes(`${platform}-${type}-${pg}`)) {
				shouldDisable = true;
				return false;
			}
		});
		if (shouldDisable) {
			disabled.add(pg);
		}
	});

	return {
		filteredPagegroupsByPlatform,
		disabled
	};
}

export { makeFirstLetterCapitalize, copyToClipBoard, pagegroupFiltering };
