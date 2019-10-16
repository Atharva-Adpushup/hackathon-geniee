/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
export function getFilteredAdSizes(allAdSizes, usedAdSizes) {
	const newAllAdSizes = JSON.parse(JSON.stringify(allAdSizes));
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

export function filterValidationSchema(validationSchema, keysToFilterOut = []) {
	validationSchema = { ...validationSchema };

	if (
		typeof validationSchema === 'object' &&
		Object.keys(validationSchema).length &&
		Array.isArray(keysToFilterOut) &&
		keysToFilterOut.length
	) {
		for (const key in validationSchema) {
			if (
				validationSchema.hasOwnProperty(key) &&
				Array.isArray(validationSchema[key]) &&
				validationSchema[key].length
			) {
				validationSchema[key] = validationSchema[key].filter(
					field => keysToFilterOut.indexOf(field.name) === -1
				);
			}
		}
	}

	return validationSchema;
}
