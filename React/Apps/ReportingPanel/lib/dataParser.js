import React from 'react';
import { capitalCase, reorderArray } from './helpers';
import commonConsts from './commonConsts';
import { remove, map, each, groupBy, uniq, find } from 'lodash';
import moment from 'moment';
import Bold from '../../../Components/Bold.jsx';

const dataLabels = commonConsts.DATA_LABELS,
	reorderColumns = cols => {
		let updatedCols = [];
		updatedCols.push(reorderArray(dataLabels.date, cols));
		updatedCols.push(reorderArray(dataLabels.pageViews, cols));
		updatedCols.push(reorderArray(dataLabels.pageCpm, cols));
		updatedCols.push(reorderArray(dataLabels.impressions, cols));
		updatedCols.push(reorderArray(dataLabels.cpm, cols));
		updatedCols.push(reorderArray(dataLabels.revenue, cols));
		updatedCols.push(reorderArray(dataLabels.grossRevenue, cols));
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
				case 'Gross Revenue':
					str = dataLabels.grossRevenue;
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
			revenueGrossRevenue = '';

		for (let i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case dataLabels.impressions:
					xPathImpressionsPageviews += `${columns[i]} / `;
					break;
				case dataLabels.xpathMiss:
				case dataLabels.pageViews:
					if (commonConsts.IS_SUPERUSER) {
						xPathImpressionsPageviews += `${columns[i]} / `;
					}
					break;
				case dataLabels.cpm:
					cpmPageCpm += `${columns[i]} / `;
					break;
				case dataLabels.pageCpm:
					if (commonConsts.IS_SUPERUSER) {
						cpmPageCpm += `${columns[i]} / `;
					}
					break;
				case dataLabels.revenue:
					revenueGrossRevenue += `${columns[i]} / `;
					break;
				case dataLabels.grossRevenue:
					if (commonConsts.IS_SUPERUSER) {
						revenueGrossRevenue += `${columns[i]} / `;
					}
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
					text: revenueGrossRevenue.substring(0, revenueGrossRevenue.length - 2)
				},
				opposite: true
			}
		);

		return yAxis;
	},
	mergeParams = (row1, row2) => {
		const API_DATA_PARAMS = commonConsts.API_DATA_PARAMS;
		row1[API_DATA_PARAMS.impressions] += row2[API_DATA_PARAMS.impressions];
		row1[API_DATA_PARAMS.pageviews] += row2[API_DATA_PARAMS.pageviews];
		row1[API_DATA_PARAMS.revenue] += row2[API_DATA_PARAMS.revenue];
		row1[API_DATA_PARAMS.grossRevenue] += row2[API_DATA_PARAMS.grossRevenue];
		row1[API_DATA_PARAMS.xpathMiss] += row2[API_DATA_PARAMS.xpathMiss];
		return row1;
	},
	processChartGroupBy = (rows, groupByParam) => {
		if (!groupByParam) {
			return rows;
		}

		let updatedRows = [];

		switch (groupByParam) {
			case 'pagegroup':
			case 'variation':
				const groupedRows = groupBy(rows, commonConsts.API_DATA_PARAMS.date);
				for (let i in groupedRows) {
					const arr = groupedRows[i];
					for (let j = 0; j < arr.length; j++) {
						let row1 = arr[j];
						for (let k = j + 1; k < arr.length; k++) {
							let row2 = arr[k];
							row1 = mergeParams(row1, row2);
						}
						updatedRows.push(row1);
						break;
					}
				}
				break;
		}

		return updatedRows;
	},
	generateXAxis = rows => {
		return uniq(
			map(rows, row => {
				return moment(row.report_date).format('DD-MM-YYYY');
			}),
			'report_date'
		);
	},
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
			grossRevenue,
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
						yAxis: 1,
						visible: true
					};
					break;
				case dataLabels.revenue:
					revenue = {
						...defaultOptions,
						name: col,
						yAxis: 2
					};
					break;
				case dataLabels.grossRevenue:
					grossRevenue = {
						...defaultOptions,
						name: col,
						yAxis: 2
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
			grossRevenue.data.push(Number(rows[i].total_gross_revenue.toFixed(2)));
			xpathMiss.data.push(rows[i].total_xpath_miss);
		}

		if (commonConsts.IS_SUPERUSER) {
			series.push(pageviews, pageCpm, impressions, cpm, revenue, grossRevenue, xpathMiss);
		} else {
			series.push(impressions, cpm, revenue);
		}

		return series;
	},
	processTableGroupBy = (header, rows, groupByParam, variations) => {
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

				let groupedRows = groupBy(rows, commonConsts.API_DATA_PARAMS.pageGroup);

				for (let i in groupedRows) {
					updatedRows.push({
						pageGroup: i
					});
					updatedRows = updatedRows.concat(groupedRows[i]);
				}
				break;
			case 'variation':
				header.unshift({
					title: dataLabels.variation,
					prop: dataLabels.variation,
					sortable: false,
					filterable: false
				});

				let groupedRows2 = groupBy(rows, commonConsts.API_DATA_PARAMS.variationId);

				for (let i in groupedRows2) {
					const name = find(variations, { id: i }).name
					updatedRows.push({
						variation: name
					});
					updatedRows = updatedRows.concat(groupedRows2[i]);
				}
				break;
		}

		return { header, rows: updatedRows };
	},
	generateTableData = (cols, rows, groupBy, variations) => {
		let header = [],
			body = [];

		each(formatColumnNames(cols), col => {
			if (
				col === dataLabels.name ||
				col === dataLabels.variationId ||
				(col === dataLabels.xpathMiss && !commonConsts.IS_SUPERUSER) ||
				(col === dataLabels.pageViews && !commonConsts.IS_SUPERUSER) ||
				(col === dataLabels.pageCpm && !commonConsts.IS_SUPERUSER) ||
				(col === dataLabels.grossRevenue && !commonConsts.IS_SUPERUSER)
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

		const groupedData = processTableGroupBy(header, rows, groupBy, variations);
		header = groupedData.header;
		rows = groupedData.rows;

		let totalPageviews = 0,
			totalPageCpm = 0,
			totalImpressions = 0,
			totalCpm = 0,
			totalRevenue = 0,
			totalGrossRevenue = 0,
			totalXpathMiss = 0;

		each(rows, row => {
			const reportDate = row.report_date ? moment(row.report_date).format('DD-MM-YYYY') : undefined,
				impressions = row.total_impressions || undefined,
				cpm = row.total_revenue
					? Number((row.total_revenue * 1000 / row.total_impressions).toFixed(2))
					: undefined,
				xpathMiss = commonConsts.IS_SUPERUSER ? row.total_xpath_miss : undefined,
				pageViews = commonConsts.IS_SUPERUSER ? row.total_requests : undefined,
				revenue = row.total_revenue ? Number(row.total_revenue.toFixed(2)) : undefined,
				grossRevenue = row.total_gross_revenue ? Number(row.total_gross_revenue.toFixed(2)) : undefined,
				pageCpm = row.total_revenue
					? Number((row.total_revenue * 1000 / row.total_requests).toFixed(2))
					: undefined;

			body.push({
				[dataLabels.pageGroup]: row.pageGroup || undefined,
				[dataLabels.variation]: row.variation || undefined,
				[dataLabels.date]: reportDate,
				[dataLabels.impressions]: impressions,
				[dataLabels.cpm]: cpm,
				[dataLabels.xpathMiss]: xpathMiss,
				[dataLabels.pageViews]: pageViews,
				[dataLabels.revenue]: revenue,
				[dataLabels.grossRevenue]: grossRevenue,
				[dataLabels.pageCpm]: pageCpm
			});

			totalPageviews += pageViews;
			totalPageCpm += pageCpm;
			totalImpressions += impressions;
			totalCpm += cpm;
			totalRevenue += revenue;
			totalGrossRevenue += grossRevenue;
			totalXpathMiss += xpathMiss;
		});

		body.push({
			[dataLabels.date]: <Bold>{dataLabels.total}</Bold>,
			[dataLabels.pageViews]: <Bold>{totalPageviews}</Bold>,
			[dataLabels.pageCpm]: <Bold>{((totalRevenue / totalPageviews) * 1000).toFixed(2)}</Bold>,
			[dataLabels.impressions]: <Bold>{totalImpressions}</Bold>,
			[dataLabels.cpm]: <Bold>{((totalRevenue / totalImpressions) * 1000).toFixed(2)}</Bold>,
			[dataLabels.revenue]: <Bold>{totalRevenue.toFixed(2)}</Bold>,
			[dataLabels.grossRevenue]: <Bold>{totalGrossRevenue.toFixed(2)}</Bold>,
			[dataLabels.xpathMiss]: <Bold>{totalXpathMiss}</Bold>
		});

		return { header, body };
	},
	dataParser = (data, groupBy, variations) => {
		const columns = formatColumnNames(data.columns);

		let tableConfig = generateTableData(columns, data.rows, groupBy, variations),
			chartConfig = {
				yAxis: generateYAxis(columns),
				xAxis: { categories: generateXAxis(data.rows) },
				series: generateSeries(columns, data.rows, groupBy)
			};

		return { chartConfig, tableConfig };
	};

export default dataParser;
