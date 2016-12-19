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

	return errors;
}

export default validate;