/* Data input validation library */

const validator = require('validator');

const Promise = require('bluebird');

const AdPushupError = require('../helpers/AdPushupError');

const utils = require('./utils');

module.exports = {
	validate(json, rules, comparison) {
		const errors = [];

		const sampleUrlForced = json.sampleUrlForced;

		Object.keys(json).map(key => {
			Object.keys(rules).map(validation => {
				rules[validation].forEach(rule => {
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
								}
								break;
							case 'isEmail':
								if (!validator.isEmail(json[key], rule.value))
									errors.push({ message: rule.message, status: rule.status });
								break;
						}
					}
				});
			});
		});

		return new Promise((resolve, reject) => {
			if (errors.length) {
				throw new AdPushupError(errors);
			}

			return resolve();
		});
	}
};
