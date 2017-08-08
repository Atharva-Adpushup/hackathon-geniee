var _ = require('lodash'),
	extend = require('extend'),
	_ = require('lodash'),
	Promise = require('bluebird');

module.exports = {
	getMediaMetrics: function() {
		var computedData = {
			'click': 0,
			'pageViews': 0,
			'pageRPM': 0.0,
			'pageCTR': 0.0,
			'revenue': 0.0,
			'ctr': 0.0
		};

		return computedData;
	},
	updateMetrics: function(reportData) {
		var computedData = extend(true, {}, reportData),
			dataStr = 'data';

		computedData.media = extend(true, {}, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'pageViews': 0, 'pageRPM': 0.0, 'pageCTR': 0.0 });

		_.forOwn(reportData.pageGroups, function(pageGroupObj, pageGroupKey) {
			if (pageGroupKey === dataStr) { return false; }

			computedData.media.click += Number(pageGroupObj.click);
			computedData.media.impression += Number(pageGroupObj.impression);
			computedData.media.revenue += Number(pageGroupObj.revenue);
			computedData.media.pageViews += Number(pageGroupObj.pageViews);
			// computedData.media.pageRPM += Number(pageGroupObj.pageRPM);
			// computedData.media.pageCTR += Number(pageGroupObj.pageCTR);

			// Set Default value if falsy
			computedData.media.revenue = Number(computedData.media.revenue.toFixed(2)) || 0;
			computedData.media.click = computedData.media.click || 0;
			computedData.media.impression = computedData.media.impression || 0;
			computedData.media.pageViews = computedData.media.pageViews || 0;
			computedData.media.pageRPM = Number((computedData.media.revenue / computedData.media.pageViews * 1000).toFixed(2)) || 0;
			computedData.media.pageCTR = Number((computedData.media.click / computedData.media.pageViews * 100).toFixed(2)) || 0;
		});

		return Promise.resolve(computedData);
	}
};
