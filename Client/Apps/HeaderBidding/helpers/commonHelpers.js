/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable import/prefer-default-export */
export function getFilteredAdSizes(allAdSizes, usedAdSizes) {
	const newAllAdSizes = { ...allAdSizes };
	for (const adSizeCategory in newAllAdSizes) {
		const { sizes } = newAllAdSizes[adSizeCategory];
		const filteredSizes = sizes.filter(adSize => {
			const sanitizedAdSize =
				adSize.width !== 'responsive' ? `${adSize.width}x${adSize.height}` : 'responsive';

			return usedAdSizes.indexOf(sanitizedAdSize) === -1;
		});

		if (!filteredSizes.length) {
			delete newAllAdSizes[adSizeCategory];
			// eslint-disable-next-line no-continue
			continue;
		}

		newAllAdSizes[adSizeCategory].sizes = filteredSizes;
	}

	return newAllAdSizes;
}
