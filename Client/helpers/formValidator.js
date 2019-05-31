/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable default-case */

const validator = require('validator');

module.exports = {
	validate(json, rules) {
		const errors = {};

		Object.keys(json).map(key => {
			Object.keys(rules).map(validation => {
				rules[validation].forEach(rule => {
					if (rule.name === key) {
						switch (validation) {
							case 'isNull':
								json[key] !== 0 && !json[key] ? (errors[key] = rule.message) : '';
								break;
							case 'isURL':
								!validator.isURL(json[key], rule.value) ? (errors[key] = rule.message) : '';
								break;
							case 'isIn':
								!validator.isIn(json[key].toUpperCase(), rule.allowedValues)
									? (errors[key] = rule.message)
									: '';
								break;
							case 'isBoolean':
								if (!validator.isBoolean(json[key])) errors[key] = rule.message;
								break;
							case 'isEmail':
								if (!validator.isEmail(json[key], rule.value)) errors[key] = rule.message;
								break;
							case 'isLength':
								!validator.isLength(json[key], rule.value) ? (errors[key] = rule.message) : '';
								break;
						}
					}
				});
			});
		});

		if (Object.keys(errors).length) return { isValid: false, errors };

		return { isValid: true };
	}
};
