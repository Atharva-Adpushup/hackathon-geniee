import { capitalCase } from '../helpers';
import config from '../config';
import { remove, map, each } from 'lodash';
import moment from 'moment';

const formatColumnNames = columns => {
		let updatedColumns = [];
		for (let i = 0; i < columns.length; i++) {
			let str = capitalCase(columns[i].replace(/_/g, ' '));
			if (str === 'Total Revenue') {
				str = 'Total CPM ($)';
			}
			if (str === 'Total Requests') {
				str = 'Total Pageviews';
			}

			if (str === 'Report Date') {
				str = 'Date';
			}
			updatedColumns.push(str.replace(/Total /g, ''));
		}

		remove(updatedColumns, col => col === 'Siteid');
		return updatedColumns;
	},
	generateYAxis = columns => {
		let yAxis = [],
			xPathImpressionsPageviews = '';
		for (let i = 0; i < columns.length; i++) {
			if (columns[i] === 'Xpath Miss' && config.IS_SUPERUSER) {
				xPathImpressionsPageviews += columns[i] + ' / ';
			}
			if (columns[i] === 'Pageviews' && config.IS_SUPERUSER) {
				xPathImpressionsPageviews += columns[i] + ' / ';
			}
			if (columns[i] === 'Impressions') {
				xPathImpressionsPageviews += columns[i];
				yAxis.push({
					title: {
						text: xPathImpressionsPageviews
					}
				});
			}
			if (columns[i] === 'CPM ($)') {
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
			pageviews = {
				...pointOptions,
				name: 'Pageviews',
				yAxis: 0,
				data: []
			},
			cpm = {
				...pointOptions,
				name: 'CPM ($)',
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
			cpm.data.push(Number((rows[i].total_revenue * 1000 / rows[i].total_impressions).toFixed(2)));
			xpathMiss.data.push(rows[i].total_xpath_miss);
			pageviews.data.push(rows[i].total_requests);
		}
		series.push(impressions, cpm);

		if (config.IS_SUPERUSER) {
			series.push(xpathMiss, pageviews);
		}

		return series;
	},
	generateTableData = (cols, rows) => {
		let header = [],
			body = [];

		each(cols, col => {
			if (
				col === 'Date' ||
				(col === 'Xpath Miss' && !config.IS_SUPERUSER) ||
				(col === 'Pageviews' && !config.IS_SUPERUSER)
			) {
				return true;
			}
			header.push({
				title: col,
				prop: col,
				sortable: true,
				filterable: true
			});
		});

		each(cols, col => {
			if (col === 'Date') {
				header.unshift({
					title: col,
					prop: col,
					sortable: true,
					filterable: true
				});
			}
		});

		each(rows, row => {
			body.push({
				Date: moment(row.report_date).format('DD-MM-YYYY'),
				Impressions: row.total_impressions,
				'CPM ($)': Number((row.total_revenue * 1000 / row.total_impressions).toFixed(2)),
				'Xpath Miss': config.IS_SUPERUSER ? row.total_xpath_miss : undefined,
				Pageviews: config.IS_SUPERUSER ? row.total_requests : undefined
			});
		});

		return { header, body };
	},
	parseSiteLevelData = data => {
		const columns = formatColumnNames(data.columns);

		let chartConfig = {
				yAxis: generateYAxis(columns),
				xAxis: { categories: generateXAxis(data.rows) },
				series: generateSeries(data.rows)
			},
			tableConfig = generateTableData(columns, data.rows);

		return { chartConfig, tableConfig };
	};

export default parseSiteLevelData;
