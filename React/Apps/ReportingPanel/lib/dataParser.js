import React from 'react';
import { reorderArray } from './helpers';
import { capitalCase, isFloat } from '../../../common/helpers';
import commonConsts from './commonConsts';
import { remove, map, each, groupBy, uniq, find, indexOf } from 'lodash';
import moment from 'moment';
import Bold from '../../../Components/Bold.jsx';
import NetworkwiseData from '../components/NetworkwiseData.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import { normalize } from 'path';

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
		row1[API_DATA_PARAMS.pageviews] = row2[API_DATA_PARAMS.pageviews];
		row1[API_DATA_PARAMS.revenue] += row2[API_DATA_PARAMS.revenue];
		row1[API_DATA_PARAMS.grossRevenue] += row2[API_DATA_PARAMS.grossRevenue];
		row1[API_DATA_PARAMS.xpathMiss] = row2[API_DATA_PARAMS.xpathMiss];
		return row1;
	},
	processChartGroupBy = (rows, groupByParam) => {
		let updatedRows = [];

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

		return updatedRows;
	},
	generateXAxis = rows => {
		return uniq(
			map(rows, row => {
				return moment.utc(row.report_date).format('DD-MM-YYYY');
			}),
			'report_date'
		);
	},
	legendItemVisible = legendItem => indexOf(commonConsts.LEGEND, legendItem) !== -1 ? true : false,
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
						name: col,
						visible: legendItemVisible(dataLabels.pageViews)
					};
					break;
				case dataLabels.impressions:
					impressions = {
						...defaultOptions,
						name: col,
						visible: legendItemVisible(dataLabels.impressions)
					};
					break;
				case dataLabels.cpm:
					cpm = {
						...defaultOptions,
						name: col,
						yAxis: 1,
						visible: legendItemVisible(dataLabels.cpm)
					};
					break;
				case dataLabels.revenue:
					revenue = {
						...defaultOptions,
						name: col,
						yAxis: 2,
						visible: legendItemVisible(dataLabels.revenue)
					};
					break;
				case dataLabels.grossRevenue:
					grossRevenue = {
						...defaultOptions,
						name: col,
						yAxis: 2,
						visible: legendItemVisible(dataLabels.grossRevenue)
					};
					break;
				case dataLabels.pageCpm:
					pageCpm = {
						...defaultOptions,
						name: col,
						yAxis: 1,
						visible: legendItemVisible(dataLabels.pageCpm)
					};
					break;
				case dataLabels.xpathMiss:
					xpathMiss = {
						...defaultOptions,
						name: col,
						visible: legendItemVisible(dataLabels.xpathMiss)
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
	sumNetworkDataProp = component => {
		const { networkData } = component.props;

		let sum = 0;
		for (let i in networkData) {
			sum += Number(networkData[i]);
		}

		return sum;
	},
	networkWiseProcessing = (rows, customToggleOptions) => {
		let processedData = [];
		const groupedData = groupBy(rows, commonConsts.API_DATA_PARAMS.date);
		for (let date in groupedData) {
			let row = {
				total_gross_revenue: 0
			}, networkwiseImpressions = {}, networkwiseRevenue = {}, networkwiseCpm = {};

			each(groupedData[date], data => {
				row.report_date = data.report_date;
				row.siteid = data.siteid;
				row.name = data.name;
				row.total_requests = data.total_requests;
				row.total_xpath_miss = data.total_xpath_miss;
				row.total_gross_revenue += data.total_gross_revenue;

				networkwiseImpressions[data.display_name] = data.total_impressions;
				networkwiseRevenue[data.display_name] = data.total_revenue.toFixed(2);
				networkwiseCpm[data.display_name] = Number((data.total_revenue * 1000 / data.total_impressions).toFixed(2));
			});

			row.total_impressions = React.cloneElement(<NetworkwiseData />, { networkData: networkwiseImpressions, customToggleOptions });
			row.total_revenue = React.cloneElement(<NetworkwiseData />, { networkData: networkwiseRevenue, customToggleOptions });
			row.cpm = React.cloneElement(<NetworkwiseData />, {
				networkData: networkwiseCpm, cpmCalc: {
					revenue: sumNetworkDataProp(row.total_revenue),
					impressions: sumNetworkDataProp(row.total_impressions)
				}, customToggleOptions
			});

			processedData.push(row);
		}
		return processedData;
	},
	getPlatformName = id => capitalCase(commonConsts.DEVICE_TYPE_MAPPING[id]),
	networkTotalCalculate = (total, networkTotalItem) => {
		let adsenseSum = Number(total);
		adsenseSum += Number(networkTotalItem);
		return isFloat(adsenseSum) ? adsenseSum.toFixed(2) : adsenseSum;
	},
	processNetworkTotal = networkTotalArray => {
		const adsense = commonConsts.NETWORKS.adsense,
			adx = commonConsts.NETWORKS.adx,
			dfp = commonConsts.NETWORKS.dfp,
			initialData = networkTotalArray[0];

		let normalizedTotal = {};
		if (adsense in initialData) {
			normalizedTotal.adsense = initialData.adsense;
		} else {
			normalizedTotal.adsense = 0;
		}

		if (adx in initialData) {
			normalizedTotal.adx = initialData.adx;
		} else {
			normalizedTotal.adx = 0;
		}

		if (dfp in initialData) {
			normalizedTotal.dfp = initialData.dfp;
		} else {
			normalizedTotal.dfp = 0;
		}

		let total = normalizedTotal;
		for (let i = 1; i < networkTotalArray.length; i++) {
			if (adsense in networkTotalArray[i]) {
				total[adsense] = networkTotalCalculate(total[adsense], networkTotalArray[i][adsense]);
			}

			if (adx in networkTotalArray[i]) {
				total[adx] = networkTotalCalculate(total[adx], networkTotalArray[i][adx]);
			}

			if (dfp in networkTotalArray[i]) {
				total[dfp] = networkTotalCalculate(total[dfp], networkTotalArray[i][dfp]);
			}
		}
		return total;
	},
	processRows = (rows, param, customToggleOptions, groupBy) => {
		let totalPageviews = 0,
			totalPageCpm = 0,
			totalImpressions = 0,
			totalCpm = 0,
			totalRevenue = 0,
			totalGrossRevenue = 0,
			totalXpathMiss = 0,
			body = [],
			dates = [],
			networkTotalImpressions = [],
			networkTotalRevenue = [],
			networkTotalCpm = [];

		each(rows, row => {
			dates.push(moment.utc(row.report_date).format('DD-MM'));

			const reportDate = moment.utc(row.report_date).format('DD-MM-YYYY'),
				impressions = row.total_impressions,
				cpm = row.cpm,
				xpathMiss = commonConsts.IS_SUPERUSER ? row.total_xpath_miss : undefined,
				pageViews = commonConsts.IS_SUPERUSER ? row.total_requests : undefined,
				revenue = row.total_revenue,
				grossRevenue = Number(row.total_gross_revenue.toFixed(2)),
				pageCpm = Number((sumNetworkDataProp(row.total_revenue) * 1000 / row.total_requests).toFixed(2));

			totalPageviews += pageViews;
			totalImpressions += sumNetworkDataProp(impressions);
			totalRevenue += sumNetworkDataProp(revenue);
			totalGrossRevenue += grossRevenue;
			totalXpathMiss += xpathMiss;

			networkTotalImpressions.push($.extend(true, {}, impressions.props.networkData));
			networkTotalRevenue.push($.extend(true, {}, revenue.props.networkData));
			networkTotalCpm.push($.extend(true, {}, cpm.props.networkData));

			body.push({
				[dataLabels.date]: reportDate,
				[dataLabels.impressions]: impressions,
				[dataLabels.cpm]: cpm,
				[dataLabels.xpathMiss]: xpathMiss,
				[dataLabels.pageViews]: pageViews,
				[dataLabels.revenue]: revenue,
				[dataLabels.grossRevenue]: grossRevenue,
				[dataLabels.pageCpm]: pageCpm
			});
		});

		networkTotalCpm = processNetworkTotal(networkTotalCpm);
		for (let i in networkTotalCpm) {
			networkTotalCpm[i] = (networkTotalCpm[i] / rows.length).toFixed(2);
		}

		body.push({
			[dataLabels.pageGroup]: (param && param.name === dataLabels.pageGroup) ? param.value : undefined,
			[dataLabels.variation]: (param && param.name === dataLabels.variation) ? param.title : undefined,
			[dataLabels.platform]: (param && param.name === commonConsts.DEVICE_TYPE) ? getPlatformName(param.value) : undefined,
			[dataLabels.date]: <Bold>{!param ? dataLabels.total : `${dates[0]} to ${dates[dates.length - 1]}`}</Bold>,
			[dataLabels.impressions]: <NetworkwiseData bold networkData={processNetworkTotal(networkTotalImpressions)} customToggleOptions={customToggleOptions} />,
			[dataLabels.cpm]: <NetworkwiseData bold cpm networkData={networkTotalCpm} customToggleOptions={customToggleOptions} />,
			[dataLabels.xpathMiss]: <Bold>{totalXpathMiss}</Bold>,
			[dataLabels.pageViews]: <Bold>{totalPageviews}</Bold>,
			[dataLabels.revenue]: <NetworkwiseData bold networkData={processNetworkTotal(networkTotalRevenue)} customToggleOptions={customToggleOptions} />,
			[dataLabels.grossRevenue]: <Bold>{totalGrossRevenue.toFixed(2)}</Bold>,
			[dataLabels.pageCpm]: <Bold>{((totalRevenue / totalPageviews) * 1000).toFixed(2)}</Bold>
		});

		return body;
	},
	processRowsWithGroupBy = (rows, groupBy, param, customToggleOptions) => {
		rows = processRows(rows, param, customToggleOptions, groupBy);

		const nonAggregatedRows = [],
			aggregatedRows = [];
		for (let i = 0; i < rows.length - 1; i++) {
			nonAggregatedRows.push(rows[i]);
		}

		aggregatedRows.push(rows[rows.length - 1]);
		nonAggregatedRows.forEach(row => {
			row.nonAggregatedRow = true;
			aggregatedRows.push(row);
		});

		return aggregatedRows;
	},
	processTableGroupBy = (header, rows, groupByParam, variations, customToggleOptions) => {
		if (!groupByParam) {
			return { header, rows: processRows(networkWiseProcessing(rows, customToggleOptions), null, customToggleOptions, groupByParam) };
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

				const groupedRows = groupBy(rows, commonConsts.API_DATA_PARAMS.pageGroup);

				let groupByAggregatedData = [];
				for (let i in groupedRows) {
					const networkWiseData = networkWiseProcessing(groupedRows[i], customToggleOptions),
						aggregatedData = processRowsWithGroupBy(networkWiseData, groupByParam, {
							name: dataLabels.pageGroup,
							value: i
						}, customToggleOptions);

					aggregatedData.forEach(data => {
						updatedRows.push(data);
					})
				}
				break;
			case 'variation':
				header.unshift({
					title: dataLabels.variation,
					prop: dataLabels.variation,
					sortable: false,
					filterable: false
				});

				let groupedRowsVariation = groupBy(rows, commonConsts.API_DATA_PARAMS.variationId);

				let groupByAggregatedDataVariation = [];
				for (let i in groupedRowsVariation) {
					const name = find(variations, { id: i }).name,
						networkWiseData = networkWiseProcessing(groupedRowsVariation[i], customToggleOptions),
						aggregatedData = processRowsWithGroupBy(networkWiseData, groupByParam, {
							name: dataLabels.variation,
							value: i,
							title: name
						}, customToggleOptions);

					aggregatedData.forEach(data => {
						updatedRows.push(data);
					})
				}
				break;
			case commonConsts.DEVICE_TYPE:
				header.unshift({
					title: dataLabels.platform,
					prop: dataLabels.platform,
					sortable: false,
					filterable: false
				});

				let groupedRowsPlatform = groupBy(rows, commonConsts.DEVICE_TYPE);

				let groupByAggregatedDataPlatform = [];
				for (let i in groupedRowsPlatform) {
					const networkWiseData = networkWiseProcessing(groupedRowsPlatform[i], customToggleOptions),
						aggregatedData = processRowsWithGroupBy(networkWiseData, groupByParam, {
							name: commonConsts.DEVICE_TYPE,
							value: i
						}, customToggleOptions);

					aggregatedData.forEach(data => {
						updatedRows.push(data);
					})
				}
				break;
		}

		return { header, rows: updatedRows };
	},
	generateTableData = (cols, rows, groupBy, variations, customToggleOptions) => {
		let header = [],
			body = null;

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

		const groupedData = processTableGroupBy(header, rows, groupBy, variations, customToggleOptions);
		header = groupedData.header;
		rows = groupedData.rows;

		return {
			header, body: rows
		};
	},
	dataParser = (data, groupBy, variations, customToggleOptions) => {
		const columns = formatColumnNames(data.columns);

		let tableConfig = generateTableData(columns, data.rows, groupBy, variations, customToggleOptions),
			chartConfig = {
				yAxis: generateYAxis(columns),
				xAxis: { categories: generateXAxis(data.rows) },
				series: generateSeries(columns, data.rows, groupBy)
			};

		return { chartConfig, tableConfig };
	};

export default dataParser;
