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
const arrayUniqueObject = (array, field) =>
	array.filter((v, i, a) => a.findIndex(t => t[field] === v[field]) === i);

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
				return (row[header.accessor] && row[header.accessor].props.children) || '';
				// eslint-disable-next-line no-else-return
			} else if (header.accessor === 'url') {
				return (row[header.accessor] && row[header.accessor].props.href) || '';
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
			start: moment().startOf('month'),
			end: yesterday.isBefore(startOfMonth) ? startOfMonth : yesterday
		}
	];
};

const getPresetsForHB = () => [
	...getPresets(),
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
const getPresetDropdownItems = () => [
	{
		default_enabled: true,
		display_name: 'Last Month',
		label: 'Last Month',
		isDisabled: false,
		position: 1,
		value: {
			start: moment()
				.subtract(1, 'months')
				.startOf('month'),
			end: moment()
				.subtract(1, 'months')
				.endOf('month')
		}
	},
	{
		default_enabled: true,
		display_name: 'Last 3 Months',
		label: 'Last 3 Months',
		isDisabled: false,
		position: 1,
		value: {
			start: moment()
				.subtract(3, 'months')
				.startOf('month'),
			end: moment()
				.subtract(1, 'months')
				.endOf('month')
		}
	},
	{
		default_enabled: true,
		display_name: 'Last 6 Months',
		label: 'Last 6 Months',
		isDisabled: false,
		position: 2,
		value: {
			start: moment()
				.subtract(6, 'months')
				.startOf('month'),
			end: moment()
				.subtract(1, 'months')
				.endOf('month')
		}
	},
	{
		default_enabled: true,
		display_name: 'Last Quarter',
		label: 'Last Quarter',
		isDisabled: false,
		position: 3,
		value: {
			start: moment()
				.quarter(moment().quarter() - 1)
				.startOf('quarter'),
			end: moment()
				.quarter(moment().quarter() - 1)
				.endOf('quarter')
		}
	},
	{
		default_enabled: true,
		display_name: 'Week to Date',
		label: 'Week to Date',
		isDisabled: false,
		position: 4,
		value: {
			start: moment()
				.subtract(7, 'days')
				.startOf('day'),
			end: moment()
				.subtract(1, 'days')
				.endOf('day')
		}
	},
	{
		default_enabled: true,
		display_name: 'Quarter to Date',
		label: 'Quarter to Date',
		isDisabled: false,
		position: 5,
		value: {
			start: moment().startOf('quarter'),
			end: moment()
				.subtract(1, 'days')
				.endOf('day')
		}
	},
	{
		default_enabled: true,
		display_name: 'Year to Date',
		label: 'Year to Date',
		isDisabled: false,
		position: 6,
		value: {
			start: moment().startOf('year'),
			end: moment()
				.subtract(1, 'days')
				.endOf('day')
		}
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

const domainFromUrl = url => {
	const aTag = document.createElement('a');
	aTag.href = url;
	return aTag.hostname;
};

export {
	convertObjToArr,
	arrayUnique,
	arrayUniqueObject,
	computeCsvData,
	numberWithCommas,
	getPresets,
	getPresetsForHB,
	getPresetDropdownItems,
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
	domainFromUrl
};
