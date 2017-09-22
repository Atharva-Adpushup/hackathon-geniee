var lodash = require('lodash'),
	Promise = require('bluebird'),
	performance = {
		getData: function(rows) {
			var ctrArr = rows.map(function(row) {
					return row[1];
				}),
				controlCtr = lodash.min(ctrArr),
				performanceArr = ctrArr.map(function(ctr) {
					return lodash.round((ctr - controlCtr) / controlCtr * 100);
				});

			return performanceArr;
		},
		setData: function(reportData) {
			var computedReport = lodash.assign({}, reportData),
				rows = computedReport.data.rows,
				performanceArr = this.getData(rows);

			computedReport.data.performance = performanceArr;
			return Promise.resolve(computedReport);
		}
	};

module.exports = {
	setPerformanceData: performance.setData.bind(performance)
};
