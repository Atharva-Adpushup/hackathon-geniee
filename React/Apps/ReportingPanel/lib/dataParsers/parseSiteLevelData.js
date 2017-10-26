import { capitalCase, reorderArray } from '../helpers';
import config from '../config';
import { remove, map, each } from 'lodash';
import moment from 'moment';

const reorderColumns = cols => {
		let updatedCols = [];
		updatedCols.push(reorderArray('Date', cols));
		updatedCols.push(reorderArray('Pageviews', cols));
		updatedCols.push(reorderArray('Page CPM ($)', cols));
		updatedCols.push(reorderArray('Impressions', cols));
		updatedCols.push(reorderArray('CPM ($)', cols));
		updatedCols.push(reorderArray('Revenue ($)', cols));
		updatedCols.push(reorderArray('Xpath Miss', cols));
		return updatedCols;
	},
	formatColumnNames = columns => {
		let updatedColumns = [];
		for (let i = 0; i < columns.length; i++) {
			let str = capitalCase(columns[i].replace(/_/g, ' '));
			str = str.replace(/Total /g, '');
			switch (str) {
				case 'Revenue':
					str = 'Revenue ($)';
					break;
				case 'Requests':
					str = 'Pageviews';
					break;
				case 'Report Date':
					str = 'Date';
					break;
			}
			updatedColumns.push(str);
		}
		updatedColumns.push('CPM ($)');
		updatedColumns.push('Page CPM ($)');
		remove(updatedColumns, col => col === 'Siteid');
		return reorderColumns(updatedColumns);
	},
	generateYAxis = columns => {
		let yAxis = [],
			xPathImpressionsPageviews = '',
			cpmPageCpm = '',
			revenue = '';

		for (let i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case 'Impressions':
					xPathImpressionsPageviews += `${columns[i]} / `;
					break;
				case 'Xpath Miss':
				case 'Pageviews':
					if (config.IS_SUPERUSER) {
						xPathImpressionsPageviews += `${columns[i]} / `;
					}
					break;
				case 'CPM ($)':
				case 'Page CPM ($)':
					cpmPageCpm += `${columns[i]} / `;
					break;
				case 'Revenue ($)':
					revenue += columns[i];
					break;
			}
		}

		yAxis.push(
			{
				title: {
					text: xPathImpressionsPageviews.substring(0, xPathImpressionsPageviews.length - 2)
				}
			},
			{
				title: {
					text: cpmPageCpm.substring(0, cpmPageCpm.length - 2)
				},
				opposite: true
			},
			{
				title: {
					text: revenue
				},
				opposite: true
			}
		);

		return yAxis;
	},
	generateXAxis = rows => map(rows, row => moment(row.report_date).format('DD-MM-YYYY')),
	generateSeries = (cols, rows) => {
		const pointOptions = {
			lineWidth: 1.5,
			marker: {
				symbol: 'circle',
				radius: 3.2
			}
		};

		let impressions,
			pageviews,
			pageCpm,
			cpm,
			revenue,
			xpathMiss,
			series = [];

		each(cols, col => {
			let defaultOptions = {
				...pointOptions,
				data: [],
				yAxis: 0,
				visible: false
			};

			switch (col) {
				case 'Pageviews':
					pageviews = {
						...defaultOptions,
						name: col
					};
					break;
				case 'Impressions':
					impressions = {
						...defaultOptions,
						name: col,
						visible: true
					};
					break;
				case 'CPM ($)':
					cpm = {
						...defaultOptions,
						name: col,
						yAxis: 1
					};
					break;
				case 'Revenue ($)':
					revenue = {
						...defaultOptions,
						name: col,
						yAxis: 2,
						visible: true
					};
					break;
				case 'Page CPM ($)':
					pageCpm = {
						...defaultOptions,
						name: col,
						yAxis: 1
					};
					break;
				case 'Xpath Miss':
					xpathMiss = {
						...defaultOptions,
						name: col
					};
					break;
			}
		});

		for (let i = 0; i < rows.length; i++) {
			pageviews.data.push(rows[i].total_requests);
			pageCpm.data.push(Number((rows[i].total_revenue * 1000 / rows[i].total_requests).toFixed(2)));
			impressions.data.push(rows[i].total_impressions);
			cpm.data.push(Number((rows[i].total_revenue * 1000 / rows[i].total_impressions).toFixed(2)));
			revenue.data.push(Number(rows[i].total_revenue.toFixed(2)));
			xpathMiss.data.push(rows[i].total_xpath_miss);
		}

		if (config.IS_SUPERUSER) {
			series.push(pageviews, pageCpm, impressions, cpm, revenue, xpathMiss);
		} else {
			series.push(impressions, cpm, revenue);
		}

		return series;
	},
	generateTableData = (cols, rows) => {
		let header = [],
			body = [];

		each(formatColumnNames(cols), col => {
			if (
				col === 'Name' ||
				col === 'Variation Id' ||
				(col === 'Xpath Miss' && !config.IS_SUPERUSER) ||
				(col === 'Pageviews' && !config.IS_SUPERUSER) ||
				(col === 'Page CPM ($)' && !config.IS_SUPERUSER)
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

		each(rows, row => {
			body.push({
				Date: moment(row.report_date).format('DD-MM-YYYY'),
				Impressions: row.total_impressions,
				'CPM ($)': Number((row.total_revenue * 1000 / row.total_impressions).toFixed(2)),
				'Xpath Miss': config.IS_SUPERUSER ? row.total_xpath_miss : undefined,
				Pageviews: config.IS_SUPERUSER ? row.total_requests : undefined,
				'Revenue ($)': Number(row.total_revenue.toFixed(2)),
				'Page CPM ($)': Number((row.total_revenue * 1000 / row.total_requests).toFixed(2))
			});
		});

		return { header, body };
	},
	parseSiteLevelData = data => {
		const columns = formatColumnNames(data.columns);

		let chartConfig = {
				yAxis: generateYAxis(columns),
				xAxis: { categories: generateXAxis(data.rows) },
				series: generateSeries(columns, data.rows)
			},
			tableConfig = generateTableData(columns, data.rows);

		return { chartConfig, tableConfig };
	};

export default parseSiteLevelData;
