import moment from 'moment';
const convertObjToArr = obj => {
		return Object.keys(obj).map(key => {
			let newObj = {};
			newObj.name = obj[key]['siteName'];
			newObj.value = key;
			return newObj;
		});
	},
	getDateRange = value => {
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

export { convertObjToArr, getDateRange };
