import config from './config';
import moment from 'moment';
import { remove, map } from 'lodash';

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
	processSiteLevelData = data => {
		const columns = formatColumnNames(data.columns);

		let chartConfig = {
			yAxis: generateYAxis(columns),
			xAxis: { categories: generateXAxis(data.rows) },
			series: generateSeries(data.rows)
		};
		return chartConfig;
	},
	chartConfigGenerator = (data, reportLevel) => {
		let config = {
				title: {
					text: ''
				},
				subtitle: {
					text: ''
				},
				lang: {
					thousandsSep: ','
				},
				chart: {
					spacingTop: 35,
					style: {
						fontFamily: 'Karla'
					}
				},
				tooltip: {
					shared: true
				},
				colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e'],
				credits: {
					enabled: false
				},
				plotOptions: {
					line: {
						animation: true
					}
				}
			},
			chartData = null;

		if (!data.error) {
			switch (reportLevel) {
				case 'site':
					chartData = processSiteLevelData(data);
					break;
			}
		}

		config = { ...config, ...chartData };
		return config;
	};

export { apiQueryGenerator, chartConfigGenerator };
