import { capitalCase } from '../helpers';
import config from '../config';
import { remove, map } from 'lodash';
import moment from 'moment';

const formatColumnNames = columns => {
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
	generateYAxis = columns => {
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

		return yAxis;
	},
	generateXAxis = rows => map(rows, row => moment(row.report_date).format('DD-MM-YYYY')),
	generateSeries = rows => {
		const pointOptions = {
			lineWidth: 1.5,
			marker: {
				symbol: 'circle',
				radius: 3.2
			}
		};

		let series = [],
			impressions = {
				...pointOptions,
				name: 'Impressions',
				yAxis: 0,
				data: []
			},
			cpm = {
				...pointOptions,
				name: 'CPM',
				yAxis: 1,
				data: []
			},
			xpathMiss = {
				...pointOptions,
				name: 'Xpath Miss',
				yAxis: 0,
				data: []
			};
		for (let i = 0; i < rows.length; i++) {
			impressions.data.push(rows[i].total_impressions);
			cpm.data.push(Number((rows[i].total_revenue / 1000).toFixed(2)));
			xpathMiss.data.push(rows[i].total_xpath_miss);
		}
		series.push(impressions, cpm);

		if (config.IS_SUPERUSER) {
			series.push(xpathMiss);
		}

		return series;
	},
	parseSiteLevelData = data => {
		console.log(data);
		const columns = formatColumnNames(data.columns);

		let chartConfig = {
			yAxis: generateYAxis(columns),
			xAxis: { categories: generateXAxis(data.rows) },
			series: generateSeries(data.rows)
		};
		return chartConfig;
	};

export default parseSiteLevelData;
