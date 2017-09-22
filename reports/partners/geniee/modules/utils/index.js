var moment = require('moment'),
	lodash = require('lodash'),
	extend = require('extend');

module.exports = {
	setHighChartsData: function(currentDate, metric, mainObj, computedObj) {
		var collectionIndex = -1,
			collectionDataIndex = -1,
			computedItem,
			metricConstants = {
				revenue: 'revenue',
				clicks: 'clicks'
			};

		lodash.forEach(mainObj[metric], function(metricObj, index) {
			if (metricObj.name == computedObj[metric].name) {
				collectionIndex = index;
			}
		});

		if (collectionIndex > -1) {
			computedItem = mainObj[metric][collectionIndex];

			lodash.forEach(computedItem.data, function(dataArr, idx) {
				if (dataArr.indexOf(currentDate) > -1) {
					collectionDataIndex = idx;
				}
			});

			if (collectionDataIndex > -1) {
				if (metricConstants.revenue === metric || metricConstants.clicks === metric) {
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

		lodash.forEach(mainObj[metric], function(metricObj, index) {
			var computedDateIndex = -1;

			lodash.forEach(metricObj.data, function(dataArr, dateIndex) {
				if (dataArr.indexOf(numericDate) > -1) {
					computedDateIndex = dateIndex;
				}
			});

			if (computedDateIndex == -1) {
				mainObj[metric][index].data.push([numericDate, 0]);
			}
		});
	},
	getDayWiseTimestamps: function(dateFrom, dateTo) {
		var dateCollection = [],
			computedDate,
			numberOfDays = 1,
			result;

		while (computedDate !== dateTo) {
			if (numberOfDays === 1) {
				dateCollection.push({
					dateFrom: moment(dateFrom)
						.startOf('day')
						.valueOf(),
					dateTo: moment(dateFrom)
						.endOf('day')
						.valueOf()
				});
				computedDate = dateFrom;
			} else {
				computedDate = moment(computedDate)
					.add(1, 'days')
					.format('YYYY-MM-DD');
				dateCollection.push({
					dateFrom: moment(computedDate)
						.startOf('day')
						.valueOf(),
					dateTo: moment(computedDate)
						.endOf('day')
						.valueOf()
				});
			}

			numberOfDays++;
		}

		// NOTE: 1 is deducted from number of days as it had an initial value of 1
		result = { collection: dateCollection, days: numberOfDays - 1 };

		return result;
	},
	// Get an object from object collection
	getObjectFromCollection: function(collection) {
		return lodash.reduce(
			collection,
			function(object, collectionItem) {
				return extend({}, object, collectionItem);
			},
			{}
		);
	},
	updatePageRPMHighChartsData: function(collection) {
		var computedCollection = extend(true, {}, collection);

		lodash.forEach(collection.pagerpm, function(pageRPMObject, pageRPMObjectIndex) {
			var revenueObject = lodash.filter(collection.revenue, ['name', pageRPMObject.name])[0],
				pageViewsObject = lodash.filter(collection.pageviews, ['name', pageRPMObject.name])[0];

			lodash.forEach(pageRPMObject.data, function(dataItem, dataItemIndex) {
				var revenue = revenueObject.data[dataItemIndex][1],
					pageViews = pageViewsObject.data[dataItemIndex][1],
					pageRPM = Number((revenue / pageViews * 1000).toFixed(2));

				pageRPM = pageRPM && pageRPM !== Infinity ? pageRPM : 0;
				computedCollection.pagerpm[pageRPMObjectIndex].data[dataItemIndex][1] = pageRPM;
			});
		});

		return computedCollection;
	},
	updatePageCTRHighChartsData: function(collection) {
		var computedCollection = extend(true, {}, collection);

		lodash.forEach(collection.pagectr, function(pageCTRObject, pageCTRObjectIndex) {
			var clicksObject = lodash.filter(collection.clicks, ['name', pageCTRObject.name])[0],
				pageViewsObject = lodash.filter(collection.pageviews, ['name', pageCTRObject.name])[0];

			lodash.forEach(pageCTRObject.data, function(dataItem, dataItemIndex) {
				var clicks = clicksObject.data[dataItemIndex][1],
					pageViews = pageViewsObject.data[dataItemIndex][1],
					pageCTR = Number((clicks / pageViews * 100).toFixed(2));

				pageCTR = pageCTR && pageCTR !== Infinity ? pageCTR : 0;
				computedCollection.pagectr[pageCTRObjectIndex].data[dataItemIndex][1] = pageCTR;
			});
		});

		return computedCollection;
	}
};
