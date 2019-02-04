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
	/*
		Getting pagegroups based on current platform
		Input: ['DESKTOP:HOME', 'DESKTOP:POST', 'MOBILE:HOME']
		Output: ['DESKTOP:HOME', 'DESKTOP:POST']
	*/
	const filteredPagegroupsByPlatform = channels.filter(channel => {
		const re = new RegExp(platform, 'ig');
		return channel.match(re);
	});
	const disabled = new Set();

	let types;

	/*
		Finding to which group, ad belongs to
		['stickyLeft', 'stickyRight', 'docked']
		['stickyTop', 'stickyBottom']
		['inView']
	*/
	if (INTERACTIVE_ADS_TYPES.VERTICAL.includes(format)) {
		types = INTERACTIVE_ADS_TYPES.VERTICAL;
	} else if (INTERACTIVE_ADS_TYPES.HORIZONTAL.includes(format)) {
		types = INTERACTIVE_ADS_TYPES.HORIZONTAL;
	} else {
		types = INTERACTIVE_ADS_TYPES.OTHER;
	}

	/*
		Iterating over all the filtered pagegroups and finding which all pagegroups need to be disabled as in
		(All) Channels: ['DESKTOP:HOME', 'DESKTOP:POST', 'MOBILE:POST']
		Platform: desktop
		Format: stickyTop
		Meta Pagegroups/Channel (Active ads log): ['DESKTOP-stickyBottom-DESKTOP:HOME']
		Current Channel/Pagegroups: ['DESKTOP:HOME']

		After processing:
		Filtered Pagegroups/Channels: ['DESKTOP:HOME', 'DESKTOP:POST']
		Disabled: ['DESKTOP:HOME']

		i.e. we are trying to create/make a stickyTop ad in pagegroup DESKTOP:HOME but it is not allowed
		as there is already a stickyBottom (similar type: HORIZONTAL) ad active for same DESKTOP:HOME.
	*/
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
