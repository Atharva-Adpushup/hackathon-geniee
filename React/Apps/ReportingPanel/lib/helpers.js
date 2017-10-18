import config from './config';
import moment from 'moment';
import { remove } from 'lodash';

const apiQueryGenerator = params => {
		let where = {
			siteid: 28822, // config.SITE_ID
			from: moment(params.startDate).format('YYYY-MM-DD'),
			to: moment(params.endDate).format('YYYY-MM-DD')
		};

		if (params.pageGroup) {
			where.pageGroup = params.pageGroup;
		}

		if (params.platform) {
			where.device_type = params.platform;
		}

		if (params.variationId) {
			where.variation = params.variationIds;
		}

		return JSON.stringify({
			select: config.SELECT,
			where
			//groupBy: ['pagegroup']
		});
	},
	capitalCase = str => {
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word[0].toUpperCase() + word.substr(1))
			.join(' ');
	},
	formatColumnNames = columns => {
		let updatedColumns = [];
		for (let i = 0; i < columns.length; i++) {
			let str = capitalCase(columns[i].replace(/_/g, ' '));
			if (str === 'Total Revenue') {
				str = 'Total CPM';
			}
			updatedColumns.push(str.replace(/Total /g, ''));
		}

		remove(updatedColumns, col => col === 'Siteid' || col === 'Report Date');
		return updatedColumns;
	},
	processSiteLevelData = data => {
		console.log(data);
		const columns = formatColumnNames(data.columns);

		let yAxis = [],
			xPathImpressions = '';
		for (let i = 0; i < columns.length; i++) {
			if (columns[i] === 'Xpath Miss' && config.IS_SUPERUSER) {
				xPathImpressions += columns[i] + ' / ';
			}
			if (columns[i] === 'Impressions') {
				xPathImpressions += columns[i];
				yAxis.push({
					title: {
						text: xPathImpressions
					}
				});
			}
			if (columns[i] === 'CPM') {
				yAxis.push({
					title: {
						text: columns[i]
					},
					opposite: true
				});
			}
		}
		console.log(JSON.stringify(yAxis));
	},
	chartConfigGenerator = (data, reportLevel) => {
		let config = {
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			}
		};

		if (!data.error) {
			switch (reportLevel) {
				case 'site':
					processSiteLevelData(data);
					break;
			}
		}
	};

export { apiQueryGenerator, chartConfigGenerator };
