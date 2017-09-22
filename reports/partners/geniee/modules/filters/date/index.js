var moment = require('moment');

module.exports = {
	getFilterDates: function() {
		var computedData = {
			today: {
				dateFrom: moment()
					.startOf('day')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			thisWeek: {
				dateFrom: moment()
					.startOf('week')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			thisMonth: {
				dateFrom: moment()
					.startOf('month')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			thisYear: {
				dateFrom: moment()
					.startOf('year')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last7Days: {
				dateFrom: moment()
					.subtract(7, 'days')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last30Days: {
				dateFrom: moment()
					.subtract(30, 'days')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last60Days: {
				dateFrom: moment()
					.subtract(60, 'days')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last90Days: {
				dateFrom: moment()
					.subtract(90, 'days')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last6Months: {
				dateFrom: moment()
					.subtract(6, 'months')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last1Year: {
				dateFrom: moment()
					.subtract(1, 'year')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last2Years: {
				dateFrom: moment()
					.subtract(2, 'years')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			},
			last5Years: {
				dateFrom: moment()
					.subtract(5, 'years')
					.format('YYYY-MM-DD'),
				dateTo: moment().format('YYYY-MM-DD')
			}
		};

		return computedData;
	}
};
