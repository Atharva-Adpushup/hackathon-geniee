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
	const a = array.concat();
	for (let i = 0; i < a.length; ++i) {
		for (let j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j]) a.splice(j--, 1);
		}
	}

	return a;
};

const computeCsvData = data => {
	const { tableBody, tableHeader, grandTotal } = data;
	const csvData = [];
	const csvHeaders = [];
	tableHeader.forEach(header => {
		csvHeaders.push(header.title);
	});
	csvData.push(csvHeaders);
	tableBody.forEach(row => {
		const csvBody = [];
		tableHeader.forEach(header => {
			csvBody.push(row[header.name]);
		});
		csvData.push(csvBody);
	});
	const csvBody = [];
	tableHeader.forEach(header => {
		csvBody.push(grandTotal[header.name]);
	});
	csvData.push(csvBody);
	return csvData;
};
const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

const calculateTotalPageViews = pageViews => {
	let totalPageviews = 0;
	pageViews.forEach(pageView => (totalPageviews += pageView));
	return totalPageviews;
};

const calculateTotalImpressions = impressions => {
	let totalImpressions = 0;
	impressions.forEach(impression => (totalImpressions += impression));
	return totalImpressions;
};

const calculateTotalNetRevenues = netRevenue => {
	let totalNetRevenue = 0;
	netRevenue.forEach(revenue => (totalNetRevenue += revenue));
	return totalNetRevenue;
};

const calculatePageRpm = (totalNetRevenue, totalPageviews) =>
	totalPageviews > 0 ? (totalNetRevenue * 1000) / totalPageviews : 0;

const calculateAdeCpm = (totalNetRevenue, totalImpressions) =>
	totalImpressions > 0 ? (totalNetRevenue * 1000) / totalImpressions : 0;

const roundOffTwoDecimal = value => {
	const roundedNum = Math.round(value * 100) / 100;
	return roundedNum.toFixed(2);
};

export {
	convertObjToArr,
	arrayUnique,
	computeCsvData,
	numberWithCommas,
	getPresets,
	calculateTotalPageViews,
	calculateTotalNetRevenues,
	calculateTotalImpressions,
	calculatePageRpm,
	calculateAdeCpm,
	roundOffTwoDecimal
};
