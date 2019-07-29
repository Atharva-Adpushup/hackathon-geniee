/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-syntax */
import clipboard from 'clipboard-polyfill';
import Entities from 'html-entities';
import sortBy from 'lodash/sortBy';
import history from './history';
import { supportedAdSizes } from '../constants/visualEditor';

const { XmlEntities } = Entities;
const entities = new XmlEntities();

function errorHandler(err, userMessage = 'Operation Failed') {
	const { response = false } = err;
	let message;
	let code = 400;

	if (response) {
		const axiosDataObject = response ? response.data : false;
		const { data } = axiosDataObject || { data: false };
		message = data ? data.message : 'No message found in API error response';
		code = data ? data.code : code;
	} else {
		message = err.message;
	}

	console.log(message);
	if (code === 400) {
		return window.alert(userMessage);
	}
	return history.push('/error');
}

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content, message = 'Successfully Copied') {
	const toAlert = typeof message === 'string' ? message : 'Successfully Copied';

	clipboard.writeText(content);
	window.alert(toAlert);
}

function formatDate(date, operation, value = 0) {
	const toFormat = new Date(date);

	if (toFormat === 'Invalid Date') {
		throw new Error('Invalid Date provided to format');
	}

	let day;
	switch (operation) {
		case 'add':
			day = String(toFormat.getDate() + value);
			break;
		case 'subtract':
			day = String(toFormat.getDate() - value);
			break;
		default:
			day = String(toFormat.getDate());
	}

	const month = String(toFormat.getMonth() + 1);
	const year = String(toFormat.getFullYear());

	return `${day.length === 1 ? '0' : ''}${day}-${month.length === 1 ? '0' : ''}${month}-${year}`;
}

const getDuplicatesInArray = array =>
	array.reduce(
		(accumulator, value) => {
			const isValueInObject = !!(
				Object.prototype.hasOwnProperty.call(accumulator.object, value) && accumulator.object[value]
			);
			const isValueInArray = !!accumulator.duplicates.includes(value);

			if (!isValueInObject) {
				accumulator.object[value] = value;
			} else if (isValueInObject && !isValueInArray) {
				accumulator.duplicates.push(value);
			}

			return accumulator;
		},
		{ duplicates: [], object: {} }
	);

const getTruthyArray = array => array.filter(value => !!value);

const isItemInArray = (item, array) => array.indexOf(item) > -1;

const rightTrim = (string, s) => (string ? string.replace(new RegExp(`${s}*$`), '') : '');

const domanize = domain =>
	domain
		? rightTrim(
				domain
					.replace('http://', '')
					.replace('https://', '')
					.replace('www.', ''),
				'/'
		  )
		: '';

const getHtmlEncodedJSON = config => {
	const encodedData = {};

	if (!config) {
		return encodedData;
	}

	for (const property in config) {
		if (Object.prototype.hasOwnProperty.call(config, property)) {
			const value = config[property];
			const isStringValue = !!(value && typeof value === 'string');

			let encodedValue;

			if (isStringValue) {
				encodedValue = entities.encode(value);
				encodedData[property] = encodedValue;
			}
		}
	}

	return encodedData;
};

const getSupportedAdSizes = () => {
	const allAdSizes = supportedAdSizes.concat([]);
	const adSizes = [];

	allAdSizes.forEach(layout => {
		layout.sizes.forEach(size => {
			const isSizeInResultArray = adSizes.find(
				adSize => adSize.width === size.width && adSize.height === size.height
			);

			if (!isSizeInResultArray) {
				adSizes.push({
					width: size.width,
					height: size.height
				});
			}
		});
	});

	return sortBy(adSizes, size => size.width);
};

const getPageGroupHash = (pageGroup, platform) => {
	const name = `${pageGroup}_${platform}`;
	const object = { pageGroups: [name] };

	return window.btoa(window.encodeURIComponent(JSON.stringify(object)));
};

export {
	errorHandler,
	getDuplicatesInArray,
	getTruthyArray,
	isItemInArray,
	domanize,
	makeFirstLetterCapitalize,
	copyToClipBoard,
	formatDate,
	getHtmlEncodedJSON,
	getSupportedAdSizes,
	getPageGroupHash
};
