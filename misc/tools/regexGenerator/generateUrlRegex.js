const Promise = require('bluebird'),
	_ = require('lodash'),
	{
		generateOrRegex,
		generateTldRegex,
		checkCommon,
		checkRegex,
		joinSpecialCharacters,
		getSpecialCharacters
	} = require('./helpers');

function generateProtocolRegex(length, protocols, regexContainer) {
	const isOptional = protocols.isOptional,
		values = protocols.values;
	if (values && values.length) {
		if (values.length > 1) {
			let regex = '(';
			_.forEach(values, (value, index) => {
				value = value.replace(':', '');
				regex += value;
				regex += '|';
			});
			regex = regex.slice(0, -1);
			regex += '):\\/\\/';
			isOptional ? (regex = `(?:${regex})?`) : null;
			regexContainer.protocol = regex;
		} else {
			regexContainer.protocol = `${isOptional ? '(?:' : ''}${values[0]}\\/\\/${isOptional ? ')?' : ''}`;
		}
		return Promise.resolve();
	}
}

function generateDomainRegex(length, domains, regexContainer) {
	regexContainer.domain = domains[0].replace(/\./g, '\\.');
	return Promise.resolve();
}

function generatePathPartRegex(values) {
	let regex = '',
		specialCharaters = [],
		hasNumbers = checkRegex(values, '[0-9]'),
		hasAlphabets = checkRegex(values, '[a-zA-Z]');

	_.forEach(values, (value, key) => {
		let currentSpecialChars = getSpecialCharacters(value);
		specialCharaters = _.concat(
			specialCharaters,
			_.filter(_.uniq(currentSpecialChars), char => specialCharaters.indexOf(char) == -1)
		);
	});
	regex += `[${regex}${hasAlphabets ? 'a-zA-Z' : ''}${hasNumbers ? '0-9' : ''}${
		specialCharaters.length ? joinSpecialCharacters(specialCharaters) : ''
	}]+`;
	return regex;
}

function generatePathRegex(length, paths, notMatchPaths, notMatchLength, regexContainer) {
	let regex = '\\/',
		totalLength = Object.keys(paths.partsByPosition).length,
		re = generateTldRegex();

	_.forEach(paths.partsByPosition, (value, key) => {
		let firstElement = value[0];
		if (paths.common[firstElement] && paths.common[firstElement].count == length) {
			if (key == totalLength - 1) {
				let endParts = firstElement.split('.');
				firstPart = endParts.shift();
				regex += firstPart.replace(/\./g, '.');
				if (endParts.length) {
					let tld = '';
					areTldCommon = checkCommon(endParts);
					tld += areTldCommon ? `\\.${endParts[0]}` : `\\.${generateOrRegex(endParts)}`;
					if (endParts.length != length) {
						tld = `(?:${tld})?`;
					}
					regex += tld;
				}
			} else {
				regex += firstElement.replace(/\./g, '.');
			}
		} else {
			if (key == totalLength - 1) {
				let parts = [],
					areTldCommon = false;
				firstParts = _.map(value, (v, k) => {
					let arrayByPosition = v.split('.'),
						toReturn = arrayByPosition.shift();

					parts.push(_.flatMap(arrayByPosition));
					return toReturn;
				});
				regex += generatePathPartRegex(firstParts);

				if (parts.length) {
					let tld = '',
						flatParts = _.flatMap(parts);
					if (flatParts.length) {
						areTldCommon = checkCommon(_.flatMap(parts));
						tld += areTldCommon ? `\\.${parts[0]}` : `\\.${generateOrRegex(parts)}`;
						if (parts.length != length) {
							tld = `(?:${tld})?`;
						}
						regex += tld;
					}
				}
			} else {
				let currentNotMatch = notMatchPaths.partsByPosition[key],
					isCommon = currentNotMatch ? checkCommon(currentNotMatch) : false;

				// (?!photos|videos|\/).){1,}
				regex += isCommon ? `(?:(?!${currentNotMatch[0]}|\\/).){1,}` : generatePathPartRegex(value);
				// regex += generatePathPartRegex(value);
			}
		}
		regex += key == totalLength - 1 ? '\\/?' : '\\/';
	});
	regexContainer.path = regex;
	return Promise.resolve();
}

function generateQueryRegex(length, query, regexContainer) {
	if (query && query.length) {
		regexContainer.query = `(?:[?](?:\&?[A-Za-z_]+=[A-Za-z_0-9]+){1,})?`;
	}
	return Promise.resolve();
}

function generateHashRegex(length, hash, regexContainer) {
	if (hash && hash.length) {
		let hasNumbers = checkRegex(hash, '[0-9]'),
			hasAlphabets = checkRegex(hash, '[a-zA-Z]'),
			specialCharaters = [];

		_.forEach(hash, (value, key) => {
			value = value.replace(/#/gi, '');
			specialCharaters = _.concat(specialCharaters, getSpecialCharacters(value));
		});

		regexContainer.hash = `(?:#[${hasAlphabets ? 'a-zA-Z' : ''}${hasNumbers ? '0-9' : ''}${
			specialCharaters.length ? joinSpecialCharacters(specialCharaters) : ''
		}]+)?`;
	}
	return Promise.resolve();
}

function combineRegex(regexContainer) {
	return `${regexContainer.protocol ? regexContainer.protocol : ''}${
		regexContainer.domain ? regexContainer.domain : ''
	}${regexContainer.path ? regexContainer.path : ''}${regexContainer.query ? regexContainer.query : ''}${
		regexContainer.hash ? regexContainer.hash : ''
	}$`;
}

function process(length, parts, notMatchParts = false, toNotMatchLength = 0) {
	if (!length) {
		return Promise.resolve(false);
	}
	let regexContainer = {
			protocol: false,
			domain: false,
			path: false,
			query: false,
			hash: false
		},
		notMatchPaths = notMatchParts && notMatchParts.paths ? notMatchParts.paths : false;

	return generateProtocolRegex(length, parts.protocols, regexContainer)
		.then(() => generateDomainRegex(length, parts.domains, regexContainer))
		.then(() => generatePathRegex(length, parts.paths, notMatchPaths, toNotMatchLength, regexContainer))
		.then(() => generateQueryRegex(length, parts.queries, regexContainer))
		.then(() => generateHashRegex(length, parts.hashes, regexContainer))
		.then(() => regexContainer);
}

function init(toMatchLength, toMatchParts, toNotMatchLength, toNotMatchParts) {
	return process(toMatchLength, toMatchParts, toNotMatchParts, toNotMatchLength).then(response =>
		combineRegex(response)
	);
}

module.exports = init;
