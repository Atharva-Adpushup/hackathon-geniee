var _ = require('lodash'),
	extend = require('extend');

module.exports = {
	setHighChartsData: function(currentDate, metric, mainObj, computedObj) {
		var collectionIndex = -1,
			collectionDataIndex = -1, computedItem,
			metricConstants = {
				revenue: 'revenue',
				clicks: 'clicks'
			};

		_.forEach(mainObj[metric], function(metricObj, index) {
			if (metricObj.name == computedObj[metric].name) {
				collectionIndex = index;
			}
		});

		if (collectionIndex > -1) {
			computedItem = mainObj[metric][collectionIndex];

			_.forEach(computedItem.data, function(dataArr, idx) {
				if (dataArr.indexOf(currentDate) > -1) {
					collectionDataIndex = idx;
				}
			});

			if (collectionDataIndex > -1) {
				if ((metricConstants.revenue === metric) && (metricConstants.clicks === metric)) {
					mainObj[metric][collectionIndex].data[collectionDataIndex][1] += computedObj[metric].data[0][1];
				} else {
					mainObj[metric][collectionIndex].data[collectionDataIndex][1] = computedObj[metric].data[0][1];
				}

			} else {
				mainObj[metric][collectionIndex].data.push(computedObj[metric].data[0]);
			}
		} else {
			mainObj[metric].push(extend(true, {}, computedObj[metric]));
		}
	},
	setDateWithEmptyValue: function(date, metric, mainObj) {
		var numericDate = Number(date);

		_.forEach(mainObj[metric], function(metricObj, index) {
			var computedDateIndex = -1;

			_.forEach(metricObj.data, function(dataArr, dateIndex) {
				if (dataArr.indexOf(numericDate) > -1) {
					computedDateIndex = dateIndex;
				}
			});

			if (computedDateIndex == -1) {
				mainObj[metric][index].data.push([numericDate, 0]);
			}
		});
	}
};
