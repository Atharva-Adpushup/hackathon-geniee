import moment from 'moment';
import sortBy from 'lodash/sortBy';

const convertObjToArr = obj =>
	Object.keys(obj).map(key => {
		const newObj = {};
		newObj.name = obj[key].siteDomain;
		// newObj.product = obj[key].product;
		// newObj.isTopPerforming = obj[key].isTopPerforming;
		newObj.value = key;
		return newObj;
	});
const getDateRange = value => {
	switch (value) {
		default:
		case 'today':
			return {
				fromDate: moment().format('YYYY-MM-DD'),
				toDate: moment().format('YYYY-MM-DD')
			};
		case 'yesterday':
			return {
				fromDate: moment()
					.subtract(1, 'days')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.subtract(1, 'days')
					.format('YYYY-MM-DD')
			};
		case 'last7Days':
			return {
				fromDate: moment()
					.subtract(7, 'days')
					.startOf('day')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.startOf('day')
					.subtract(1, 'day')
					.format('YYYY-MM-DD')
			};
		case 'last30Days':
			return {
				fromDate: moment()
					.subtract(30, 'days')
					.startOf('day')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.startOf('day')
					.subtract(1, 'day')
					.format('YYYY-MM-DD')
			};
		case 'month':
			return {
				fromDate: moment()
					.startOf('month')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.startOf('day')
					.subtract(1, 'day')
					.format('YYYY-MM-DD')
			};

		case 'lastMonth':
			return {
				fromDate: moment()
					.startOf('month')
					.subtract(1, 'month')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.endOf('month')
					.subtract(1, 'month')
					.format('YYYY-MM-DD')
			};
	}
};

const roundOffTwoDecimal = value => {
	const roundedNum = Math.round(value * 100) / 100;
	return roundedNum.toFixed(2);
};

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const isEmptyObject = object => !!(object && Object.keys(object).length === 0);

const getWidgetValidDationState = displayData => {
	const isValid = !!displayData;
	const validationState = {
		isValid,
		isValidAndEmpty: !!(isValid && isEmptyObject(displayData))
	};

	return validationState;
};

const sortHeadersByPosition = (columns, metrics) => {
	const tempArr = [];
	columns.forEach(col => {
		if (metrics[col]) {
			tempArr.push({
				Header: metrics[col].display_name,
				accessor: col,
				position: metrics[col].table_position
			});
		}
	});

	return sortBy(tempArr, o => o.position);
};

const formatTableData = (tableBody, metrics) => {
	// const { metrics } = props;

	tableBody.forEach(row => {
		// eslint-disable-next-line no-restricted-syntax
		for (const col in row) {
			if (metrics[col]) {
				const num = row[col];

				row[col] =
					metrics[col].valueType === 'money'
						? `$${numberWithCommas(roundOffTwoDecimal(num))}`
						: numberWithCommas(num);
			}
		}
	});
};

export {
	convertObjToArr,
	getDateRange,
	numberWithCommas,
	roundOffTwoDecimal,
	isEmptyObject,
	getWidgetValidDationState,
	formatTableData,
	sortHeadersByPosition
};
