var validator = require('validator'),
	Promise = require('bluebird'),
	FormValidator = null,
	AdPushupError = require('./AdPushupError');

/**
 * FormValidator, a json data validation utility
 * that uses 'validator' library
 *
 * @type {}
 */
FormValidator = {
	'validate': function(data, config) {
		var errors = {};
		Object.keys(config).map(function(validationName) {
			var validation = config[validationName], field, i, isValid = true;
			for (i = 0; i < validation.length; i++) {
				field = validation[i];

				// Only validate if json data has field name as its
				// own property, ignore the validation otherwise
				if (data.hasOwnProperty(field.name)) {
					if (field.value) {
						isValid = validator[validationName](data[field.name], field.value);
					} else {
						// Specific check for null validation as
						// validator library's isNull validation returns true if
						// passed string computes to falsy
						if (validationName === 'isNull') {
							isValid = !validator[validationName](data[field.name]);
						}else if (field.matchAgainst && data.hasOwnProperty(field.matchAgainst)) {
							isValid = validator[validationName](data[field.name], data[field.matchAgainst]);
						}else if (validationName !== 'equals') {
							isValid = validator[validationName](data[field.name]);
						}
					}

					if (!isValid) {
						if (errors[field.name] && errors[field.name].length > 0) {
							errors[field.name].push(field.message);
						} else {
							errors[field.name] = [];
							errors[field.name].push(field.message);
						}
					}
				}
			}
		});

		return new Promise(function(resolve) {
			if (Object.keys(errors).length > 0) {
				throw new AdPushupError(errors);
			} else if (Object.keys(errors).length === 0) {
				resolve();
			}
		});
	}
};

module.exports = FormValidator;
