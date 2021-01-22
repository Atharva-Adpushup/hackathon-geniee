import sortBy from 'lodash/sortBy';
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
	const { tableBody, tableColumns } = data;

	// Compute CSV Header
	const csvHeader = tableColumns.map(header => header.Header);

	// Compute CSV Body
	const csvBody = tableBody.map(row => {
		// Row cells sorted by tableColumns
		const csvBodyRow = tableColumns.map(header => {
			if (header.accessor === 'siteName') {
				// eslint-disable-next-line no-unused-expressions
				return row[header.accessor].props.children;
				// eslint-disable-next-line no-else-return
			} else if (header.accessor === 'url') {
				return row[header.accessor].props.href;
			} else if (header.accessor === 'country' || header.accessor === 'device_type') {
				return row[header.accessor] instanceof Array
					? row[header.accessor]
							.map(item => `${item[header.accessor]} ${item.overall_net_revenue}%`)
							.join(',')
					: row[header.accessor];
			}
			return row[header.accessor];
		});

		return csvBodyRow;
	});

	// Compute CSV Footer
	const csvFooter = tableColumns.map(column => column.Footer);

	const csvData = [csvHeader, ...csvBody, csvFooter];
	return csvData;
};
const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const getPresets = () => {
	const today = moment();
	const yesterday = moment().subtract(1, 'day');
	const last7Days = moment().subtract(1, 'week');
	const startOfMonth = moment().startOf('month');
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
			start: startOfMonth,
			end: yesterday.isBefore(startOfMonth) ? startOfMonth : yesterday
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

const getReportScheduleIntervals = () => [
	{
		value: 'daily',
		name: 'Daily'
	},
	{
		value: 'weekly',
		name: 'Weekly'
	},
	{
		value: 'monthly',
		name: 'Monthly'
	}
];

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

const getValidObject = value =>
	!!(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length);

const getValidArray = value => !!(Array.isArray(value) && value.length);

const getItemFromLocalStorage = key => window.localStorage.getItem(key);

const setItemToLocalStorage = (key, value) => window.localStorage.setItem(key, value);

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
	roundOffTwoDecimal,
	getValidObject,
	getValidArray,
	getItemFromLocalStorage,
	setItemToLocalStorage,
	getReportScheduleIntervals
};
