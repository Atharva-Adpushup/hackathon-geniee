/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
export default function getValidationSchema(formFields) {
	const validationSchema = {};

	for (const paramKey in formFields) {
		const formField = formFields[paramKey];

		if (formField.visible !== false && formField.isRequired) {
			if (!Array.isArray(validationSchema.isNull)) validationSchema.isNull = [];

			validationSchema.isNull.push({
				name: paramKey,
				message: `${formField.name} is required`,
				value: ''
			});
		}
	}

	return validationSchema;
}
