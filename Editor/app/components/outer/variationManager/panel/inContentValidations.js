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

	if (!formProps.height) {
		errors.height = 'Please enter height';
	}

	if (!formProps.width) {
		errors.width = 'Please enter width';
	}

	return errors;
}

export default validate;