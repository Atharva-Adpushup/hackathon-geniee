/* Data input validation library */

var validator = require('validator'),
	Promise = require('bluebird'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('./utils');

module.exports = {
	validate: function(json, rules, comparison) {
		var errors = [],
			sampleUrlForced = json.sampleUrlForced;

		Object.keys(json).map(function(key) {
			Object.keys(rules).map(function(validation) {
				rules[validation].forEach(function(rule) {
					if (rule.name === key) {
						switch (validation) {
							case 'isNull':
								!json[key] ? errors.push({ message: rule.message, status: rule.status }) : '';
								break;
							case 'isURL':
								!validator.isURL(json[key], rule.value)
									? errors.push({ message: rule.message, status: rule.status })
									: '';
								break;
							case 'isIn':
								!validator.isIn(json[key].toUpperCase(), rule.allowedValues)
									? errors.push({ message: rule.message, status: rule.status })
									: '';
								break;
							case 'isSameDomain':
								if (!sampleUrlForced) {
									if (
										comparison &&
										utils.getSiteDomain(json[key]) !== utils.getSiteDomain(comparison)
									) {
										!validator.equals(json[key], comparison)
											? errors.push({ message: rule.message, status: rule.status })
											: '';
									}
									break;
								}
							case 'isEmail':
								if (!validator.isEmail(json[key], rule.value))
									errors.push({ message: rule.message, status: rule.status });
								break;
						}
					}
				});
			});
		});

		return new Promise(function(resolve, reject) {
			if (errors.length) {
				throw new AdPushupError(errors);
			}

			return resolve();
		});
	}
};
