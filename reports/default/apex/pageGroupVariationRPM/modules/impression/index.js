var extend = require('extend'),
	lodash = require('lodash'),
	Promise = require('bluebird');

module.exports = {
	getTotal: function(data) {
		let total = 0;

		lodash.forEach(data.rows, (row) => {
			const impressionItem = Number(row[1]);

			total += impressionItem;
		});

		total = Math.round(total);
		return Promise.resolve(total);
	}
};
