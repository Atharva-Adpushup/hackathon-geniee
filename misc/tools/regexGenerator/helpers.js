const Promise = require('bluebird'),
	_ = require('lodash'),
	{ domains } = require('./commonConsts');

function getSpecialCharacters(values) {
	let re = new RegExp('[^a-zA-Z0-9]', 'igm');
	return re.test(values) ? values.match(re) : [];
}

function joinSpecialCharacters(chars) {
	return chars
		.join('')
		.replace(/\//, '/')
		.replace(/\\/g, '\\');
}

function checkRegex(values, regex) {
	let re = new RegExp(regex, 'igm'),
		response = false;
	_.forEach(values, value => {
		if (re.test(value)) {
			response = true;
			return false;
		}
	});
	return response;
}

function checkCommon(values) {
	if (values && values.length) {
		let response = true,
			firstElement = values.shift();
		_.forEach(values, (v, k) => {
			if (firstElement !== v) {
				response = false;
				return false;
			}
		});
		return response;
	}
	return false;
}

function generateOrRegex(values) {
	let regex = '(';
	values.forEach((value, key) => {
		regex += `${value.toLowerCase()}|`;
	});
	regex = regex.slice(0, -1);
	regex += ')';
	return regex;
}

function generateTldRegex() {
	let regex = '(';
	domains.forEach((value, key) => {
		regex += `${value.toLowerCase()}|`;
	});
	regex = regex.slice(0, -1);
	regex += ')';
	return new RegExp(regex, 'i');
}

module.exports = {
	generateOrRegex,
	generateTldRegex,
	checkCommon,
	checkRegex,
	joinSpecialCharacters,
	getSpecialCharacters
};
