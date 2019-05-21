/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-alert */
import clipboard from 'clipboard-polyfill';
import history from './history';

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
	clipboard.writeText(content);
	window.alert(message);
}

function formatDate(date) {
	const toFormat = new Date(date);

	if (toFormat === 'Invalid Date') {
		throw new Error('Invalid Date provided to format');
	}

	const day = String(toFormat.getDate());
	const month = String(toFormat.getMonth() + 1);
	const year = String(toFormat.getFullYear());

	return `${day.length === 1 ? '0' : ''}${day}-${month.length === 1 ? '0' : ''}${month}-${year}`;
}

const getDuplicatesInArray = array =>
	array.reduce(
		(accumulator, value) => {
			const isValueInObject = !!(
				accumulator.object.hasOwnProperty(value) && accumulator.object[value]
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

export {
	errorHandler,
	getDuplicatesInArray,
	getTruthyArray,
	isItemInArray,
	domanize,
	makeFirstLetterCapitalize,
	copyToClipBoard,
	formatDate
};
