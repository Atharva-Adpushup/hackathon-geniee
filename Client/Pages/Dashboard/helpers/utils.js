import moment from 'moment';

const convertObjToArr = obj =>
	Object.keys(obj).map(key => {
		const newObj = {};
		newObj.name = obj[key].siteName;
		newObj.value = key;
		return newObj;
	});
const getDateRange = value => {
	switch (value) {
		default:
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
	}
};

const numberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export { convertObjToArr, getDateRange, numberWithCommas };
