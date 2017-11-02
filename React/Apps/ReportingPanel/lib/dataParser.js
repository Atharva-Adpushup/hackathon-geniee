import { capitalCase, reorderArray } from './helpers';
import config from './config';
import { remove, map, each, groupBy } from 'lodash';
import moment from 'moment';

const dataLabels = config.DATA_LABELS,
	reorderColumns = cols => {
		let updatedCols = [];
		updatedCols.push(reorderArray(dataLabels.date, cols));
		updatedCols.push(reorderArray(dataLabels.pageViews, cols));
		updatedCols.push(reorderArray(dataLabels.pageCpm, cols));
		updatedCols.push(reorderArray(dataLabels.impressions, cols));
		updatedCols.push(reorderArray(dataLabels.cpm, cols));
		updatedCols.push(reorderArray(dataLabels.revenue, cols));
		updatedCols.push(reorderArray(dataLabels.xpathMiss, cols));
		return updatedCols;
	},
	formatColumnNames = columns => {
		let updatedColumns = [];
		for (let i = 0; i < columns.length; i++) {
			let str = capitalCase(columns[i].replace(/_/g, ' '));
			str = str.replace(/Total /g, '');
			switch (str) {
				case 'Revenue':
					str = dataLabels.revenue;
					break;
				case 'Requests':
					str = dataLabels.pageViews;
					break;
				case 'Report Date':
					str = dataLabels.date;
					break;
			}
			updatedColumns.push(str);
		}
		updatedColumns.push(dataLabels.cpm);
		updatedColumns.push(dataLabels.pageCpm);
		remove(updatedColumns, col => col === dataLabels.siteId);
		return reorderColumns(updatedColumns);
	},
	generateYAxis = columns => {
		let yAxis = [],
			xPathImpressionsPageviews = '',
			cpmPageCpm = '',
			revenue = '';

		for (let i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case dataLabels.impressions:
					xPathImpressionsPageviews += `${columns[i]} / `;
					break;
				case dataLabels.xpathMiss:
				case dataLabels.pageViews:
					if (config.IS_SUPERUSER) {
						xPathImpressionsPageviews += `${columns[i]} / `;
					}
					break;
				case dataLabels.cpm:
					cpmPageCpm += `${columns[i]} / `;
					break;
				case dataLabels.pageCpm:
					if (config.IS_SUPERUSER) {
						cpmPageCpm += `${columns[i]} / `;
					}
					break;
				case dataLabels.revenue:
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
	mergeParams = (row1, row2) => {
		const API_DATA_PARAMS = config.API_DATA_PARAMS;
		row1[API_DATA_PARAMS.impressions] += row2[API_DATA_PARAMS.impressions];
		row1[API_DATA_PARAMS.pageviews] += row2[API_DATA_PARAMS.pageviews];
		row1[API_DATA_PARAMS.revenue] += row2[API_DATA_PARAMS.revenue];
		row1[API_DATA_PARAMS.xpathMiss] += row2[API_DATA_PARAMS.xpathMiss];
		return row1;
	},
	processChartGroupBy = (rows, groupBy) => {
		if (!groupBy) {
			return rows;
		}

		let updatedRows = [];

		switch (groupBy) {
			case 'pagegroup':
				for (let i = 0; i < rows.length; i++) {
					let row1 = rows[i];
					for (let j = i + 1; j < rows.length; j++) {
						if (rows[j].report_date === rows[i].report_date) {
							let row2 = rows[j];
							updatedRows.push(mergeParams(row1, row2));
							break;
						}
					}
				}
				break;
		}

		return updatedRows;
	},
	generateXAxis = rows => map(rows, row => moment(row.report_date).format('DD-MM-YYYY')),
	generateSeries = (cols, rows, groupBy) => {
		const pointOptions = {
			lineWidth: 1.5,
			marker: {
				symbol: 'circle',
				radius: 3.2
			}
		};

		rows = processChartGroupBy(rows, groupBy);

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
				case dataLabels.pageViews:
					pageviews = {
						...defaultOptions,
						name: col
					};
					break;
				case dataLabels.impressions:
					impressions = {
						...defaultOptions,
						name: col,
						visible: true
					};
					break;
				case dataLabels.cpm:
					cpm = {
						...defaultOptions,
						name: col,
						yAxis: 1
					};
					break;
				case dataLabels.revenue:
					revenue = {
						...defaultOptions,
						name: col,
						yAxis: 2,
						visible: true
					};
					break;
				case dataLabels.pageCpm:
					pageCpm = {
						...defaultOptions,
						name: col,
						yAxis: 1
					};
					break;
				case dataLabels.xpathMiss:
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
	processTableGroupBy = (header, rows, groupByParam) => {
		if (!groupByParam) {
			return { header, rows };
		}

		let updatedRows = [];

		switch (groupByParam) {
			case 'pagegroup':
				header.unshift({
					title: dataLabels.pageGroup,
					prop: dataLabels.pageGroup,
					sortable: false,
					filterable: false
				});

				let groupedRows = groupBy(rows, config.API_DATA_PARAMS.pageGroup);

				for (let i in groupedRows) {
					updatedRows.push({
						pageGroup: i
					});
					updatedRows = updatedRows.concat(groupedRows[i]);
				}
				break;
		}

		return { header, rows: updatedRows };
	},
	generateTableData = (cols, rows, groupBy) => {
		let header = [],
			body = [];

		each(formatColumnNames(cols), col => {
			if (
				col === dataLabels.name ||
				col === dataLabels.variationId ||
				(col === dataLabels.xpathMiss && !config.IS_SUPERUSER) ||
				(col === dataLabels.pageViews && !config.IS_SUPERUSER) ||
				(col === dataLabels.pageCpm && !config.IS_SUPERUSER)
			) {
				return true;
			}
			header.push({
				title: col,
				prop: col,
				sortable: false,
				filterable: true
			});
		});

		const groupedData = processTableGroupBy(header, rows, groupBy);
		header = groupedData.header;
		rows = groupedData.rows;

		each(rows, row => {
			body.push({
				[dataLabels.pageGroup]: row.pageGroup || undefined,
				[dataLabels.date]: row.report_date ? moment(row.report_date).format('DD-MM-YYYY') : undefined,
				[dataLabels.impressions]: row.total_impressions || undefined,
				[dataLabels.cpm]: row.total_revenue
					? Number((row.total_revenue * 1000 / row.total_impressions).toFixed(2))
					: undefined,
				[dataLabels.xpathMiss]: config.IS_SUPERUSER ? row.total_xpath_miss : undefined,
				[dataLabels.pageViews]: config.IS_SUPERUSER ? row.total_requests : undefined,
				[dataLabels.revenue]: row.total_revenue ? Number(row.total_revenue.toFixed(2)) : undefined,
				[dataLabels.pageCpm]: row.total_revenue
					? Number((row.total_revenue * 1000 / row.total_requests).toFixed(2))
					: undefined
			});
		});

		return { header, body };
	},
	dataParser = (data, groupBy) => {
		const columns = formatColumnNames(data.columns);

		let chartConfig = {
				yAxis: generateYAxis(columns),
				xAxis: { categories: generateXAxis(data.rows) },
				series: generateSeries(columns, data.rows, groupBy)
			},
			tableConfig = generateTableData(columns, data.rows, groupBy);

		return { chartConfig, tableConfig };
	};

export default dataParser;
