var lodash = require('lodash'),
	Promise = require('bluebird'),
	Utils = {
		addEmptyDataFields: function(reportData) {
			var computedReport = lodash.assign({}, reportData),
				headerFields = ['Page Views', 'Revenue', 'Page RPM (PERFORMANCE %)'],
				rowFields = [' ', ' ', ' '],
				footerFields = [' ', ' ', ' '],
				header = computedReport.data.header,
				rows = computedReport.data.rows,
				footer = computedReport.data.footer,
				self = this;

			rows.forEach(function(row, idx) {
				var computedRow = self.insertDataFields(row, rowFields, 2, ' ');

				computedReport.data.rows[idx] = computedRow;
			});

			computedReport.data.header = self.insertDataFields(header, headerFields, 2, ' ');
			computedReport.data.footer = self.insertDataFields(footer, footerFields, 2, ' ');

			return Promise.resolve(computedReport);
		},
		insertDataFields: function(origArr, newFieldsArr, pushIndex, placeHolder) {
			var len = newFieldsArr.length, pushIdx = pushIndex, i;

			origArr.unshift(placeHolder);

			for (i = 0; i < len; i++) {
				// Insert fields item
				origArr.splice(++pushIdx, 0, newFieldsArr[i]);
			}

			return origArr;
		}
	};

module.exports = {
	addEmptyDataFields: Utils.addEmptyDataFields.bind(Utils)
};
