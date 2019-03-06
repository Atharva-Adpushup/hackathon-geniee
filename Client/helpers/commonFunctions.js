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

export { errorHandler, getDuplicatesInArray, getTruthyArray, isItemInArray };
