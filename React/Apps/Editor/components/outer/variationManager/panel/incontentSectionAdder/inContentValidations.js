// In-content section adder validations

function validate(formProps) {
	const errors = {};

	if (!formProps.section) {
		errors.section = 'Please enter section';
	}

	if (!formProps.minDistanceFromPrevAd) {
		errors.minDistanceFromPrevAd = 'Please enter minDistanceFromPrevAd';
	}

	if (!formProps.adCode) {
		errors.adCode = 'Please enter Ad Code';
	}

	try {
		if (formProps.customCSS) {
			let customCSS = JSON.parse(formProps.customCSS),
				isValidObject = !!(customCSS && Object.keys(customCSS).length);

			if (isValidObject) {
				errors.customCSS = '';
			} else {
				errors.customCSS = 'Please enter valid Custom CSS';
			}
		}
	} catch (e) {
		errors.customCSS = 'Please enter valid Custom CSS';
	}

	if (!formProps.name) {
		errors.name = 'Please enter Section name';
	}

	if (formProps.network == 'adpTags' && (isNaN(formProps.priceFloor) || !formProps.priceFloor)) {
		errors.priceFloor = 'Invalid Price Floor';
	}

	if (formProps.notNear && Object.keys(formProps.notNear).length) {
		const itemsArrayErrors = [];

		formProps.notNear.forEach((item, itemIndex) => {
			const itemErrors = {};

			if (!item || !item.selector) {
				itemErrors.selector = 'Please enter a selector';
				itemsArrayErrors[itemIndex] = itemErrors;
			}
			if (!item || !item.pixels) {
				itemErrors.pixels = 'Please enter the distance in pixels';
				itemsArrayErrors[itemIndex] = itemErrors;
			}
		});

		if (itemsArrayErrors.length) {
			errors.notNear = itemsArrayErrors;
		}
	}

	return errors;
}

export default validate;
