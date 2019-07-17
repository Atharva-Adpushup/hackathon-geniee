import { sortBy } from 'lodash';
import moment from 'moment';

const convertObjToArr = obj => {
	const clone = Object.assign({}, obj);
	const convertedArray = Object.keys(clone).map(key => {
		const newObj = clone[key];
		newObj.name = newObj.display_name;
		newObj.value = key;
		newObj.display_name;
		return newObj;
	});
	return sortBy(convertedArray, clone => clone.position);
};

const arrayUnique = array => {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j]) a.splice(j--, 1);
		}
	}

	return a;
};

const computeCsvData = data => {
	let { tableBody, tableHeader, grandTotal } = data;
	let csvData = [];
	let csvHeaders = [];
	tableHeader.forEach(header => {
		csvHeaders.push(header.title);
	});
	csvData.push(csvHeaders);
	tableBody.forEach(row => {
		let csvBody = [];
		tableHeader.forEach(header => {
			csvBody.push(row[header.prop]);
		});
		csvData.push(csvBody);
	});
	let csvBody = [];
	tableHeader.forEach(header => {
		csvBody.push(grandTotal[header.prop]);
	});
	csvData.push(csvBody);
	return csvData;
};
const numberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const getPresets = () => {
	const today = moment();
	const yesterday = moment().subtract(1, 'day');
	const last7Days = moment().subtract(1, 'week');
	return [
		{
			text: 'Today',
			start: today,
			end: today
		},
		{
			text: 'Yesterday',
			start: yesterday,
			end: yesterday
		},
		{
			text: 'Last 7 Days',
			start: last7Days,
			end: yesterday
		},
		{
			text: 'Last 30 Days',
			start: moment().subtract(30, 'day'),
			end: yesterday
		},
		{
			text: 'This Month',
			start: moment().startOf('month'),
			end: yesterday
		},
		{
			text: 'Last Month',
			start: moment()
				.subtract(1, 'months')
				.startOf('month'),
			end: moment()
				.subtract(1, 'months')
				.endOf('month')
		}
	];
};
export { convertObjToArr, arrayUnique, computeCsvData, numberWithCommas, getPresets };
