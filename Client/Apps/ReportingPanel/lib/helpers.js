import commonConsts from './commonConsts';
import moment from 'moment';
import { dataParser, sumNetworkDataProp } from './dataParser';
import $ from 'jquery';
import ChartLegend from '../components/ChartLegend/index.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';

const apiQueryGenerator = params => {
		let where = {
				siteid: commonConsts.SITE_ID,
				from: moment(params.startDate).format('YYYY-MM-DD'),
				to: moment(params.endDate).format('YYYY-MM-DD')
			},
			select = commonConsts.SELECT,
			groupBy = [commonConsts.NETWORK_ID];

		if (params.groupBy) {
			groupBy.push(params.groupBy);

			if (params.groupBy === commonConsts.DEVICE_TYPE) {
				select.push(commonConsts.DEVICE_TYPE);
			}
		} else {
			select = filter(select, val => val !== commonConsts.DEVICE_TYPE);
		}

		if (params.pageGroup) {
			where.pagegroup = [params.pageGroup];
		}

		if (params.platform) {
			where.device_type = params.platform;
		}

		if (params.variation) {
			where.variation = [params.variation];
		}

		where.mode = 1;

		return JSON.stringify({
			select,
			where,
			orderBy: ['report_date'],
			groupBy
		});
	},
	dataGenerator = (
		data,
		groupBy,
		variations,
		customToggleOptions,
		activeLegendItems
	) => {
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
					},
					events: {
						load: event => {
							const chart = event.target,
								node = document.getElementById('chart-legend');
							ReactDOM.render(
								<ChartLegend
									chart={chart}
									activeLegendItems={activeLegendItems}
								/>,
								node
							);
						}
					}
				},
				legend: {
					enabled: false
				},
				tooltip: {
					shared: true
				},
				colors: [
					'#d9d332',
					'#d97f3e',
					'#50a4e2',
					'#2e3b7c',
					'#bf4b9b',
					'#4eba6e',
					'#eb575c',
					'#ca29f3'
				],
				credits: {
					enabled: false
				},
				plotOptions: {
					line: {
						animation: false
					}
				}
			},
			chartData = null,
			tableData = null;

		if (!data.error) {
			const parsedData = dataParser(
				data,
				groupBy,
				variations,
				customToggleOptions
			);
			chartData = parsedData.chartConfig;
			tableData = parsedData.tableConfig;
		}

		config = { ...config, ...chartData };
		return { chartData: config, tableData };
	},
	reorderArray = (param, arr) => {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === param) {
				return arr[i];
			}
		}
	},
	calculateCSVRowCPM = row => {
		const { cpmCalc } = row[commonConsts.DATA_LABELS.cpm].props,
			{ impressions, revenue } = cpmCalc,
			cpm = ((revenue * 1000) / impressions).toFixed(2);

		return cpm;
	},
	updateMajorRow = (csvRow, row) => {
		if (commonConsts.IS_SUPERUSER) {
			csvRow.push(
				row[commonConsts.DATA_LABELS.date].props.children,
				row[commonConsts.DATA_LABELS.pageViews].props.children,
				row[commonConsts.DATA_LABELS.pageCpm].props.children,
				row[commonConsts.DATA_LABELS.adpRequests].props.children,
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.impressions]),
				row[commonConsts.DATA_LABELS.adpCoverage].props.children,
				calculateCSVRowCPM(row),
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.revenue]).toFixed(2),
				row[commonConsts.DATA_LABELS.grossRevenue].props.children,
				row[commonConsts.DATA_LABELS.xpathMiss].props.children
			);
		} else {
			csvRow.push(
				row[commonConsts.DATA_LABELS.date].props.children,
				row[commonConsts.DATA_LABELS.pageCpm].props.children,
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.impressions]),
				calculateCSVRowCPM(row),
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.revenue]).toFixed(2)
			);
		}
	},
	updateMinorRow = (csvRow, row) => {
		if (commonConsts.IS_SUPERUSER) {
			csvRow.push(
				row[commonConsts.DATA_LABELS.date],
				row[commonConsts.DATA_LABELS.pageViews],
				row[commonConsts.DATA_LABELS.pageCpm],
				row[commonConsts.DATA_LABELS.adpRequests],
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.impressions]),
				row[commonConsts.DATA_LABELS.adpCoverage],
				calculateCSVRowCPM(row),
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.revenue]).toFixed(2),
				row[commonConsts.DATA_LABELS.grossRevenue],
				row[commonConsts.DATA_LABELS.xpathMiss]
			);
		} else {
			csvRow.push(
				row[commonConsts.DATA_LABELS.date],
				row[commonConsts.DATA_LABELS.pageCpm],
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.impressions]),
				calculateCSVRowCPM(row),
				sumNetworkDataProp(row[commonConsts.DATA_LABELS.revenue]).toFixed(2)
			);
		}
	},
	processCSVGroupBy = (groupBy, row) => {
		let csvRow = [];

		switch (groupBy) {
			case commonConsts.DEVICE_TYPE:
				if (commonConsts.DATA_LABELS.platform in row) {
					csvRow.push(row[commonConsts.DATA_LABELS.platform]);
					updateMajorRow(csvRow, row);
				} else {
					csvRow.push('');
					updateMinorRow(csvRow, row);
				}
				break;
			case 'pagegroup':
				if (commonConsts.DATA_LABELS.pageGroup in row) {
					csvRow.push(row[commonConsts.DATA_LABELS.pageGroup]);
					updateMajorRow(csvRow, row);
				} else {
					csvRow.push('');
					updateMinorRow(csvRow, row);
				}
				break;
			case 'variation':
				if (commonConsts.DATA_LABELS.variation in row) {
					csvRow.push(row[commonConsts.DATA_LABELS.variation]);
					updateMajorRow(csvRow, row);
				} else {
					csvRow.push('');
					updateMinorRow(csvRow, row);
				}
				break;
		}

		return csvRow;
	},
	csvDataGenerator = (tableConfig, groupBy) => {
		const { header, body } = tableConfig;

		let csvHeader = [],
			csvBody = [];
		for (let i in header) {
			if (commonConsts.IS_SUPERUSER) {
				csvHeader.push(header[i].title);
			} else {
				if (
					header[i].title === commonConsts.DATA_LABELS.date ||
					header[i].title === commonConsts.DATA_LABELS.cpm ||
					header[i].title === commonConsts.DATA_LABELS.impressions ||
					header[i].title === commonConsts.DATA_LABELS.revenue ||
					header[i].title === commonConsts.DATA_LABELS.platform ||
					header[i].title === commonConsts.DATA_LABELS.pageGroup ||
					header[i].title === commonConsts.DATA_LABELS.variation ||
					header[i].title === commonConsts.DATA_LABELS.pageViews ||
					header[i].title === commonConsts.DATA_LABELS.pageCpm
				) {
					csvHeader.push(header[i].title);
				}
			}
		}

		csvBody.push(csvHeader);
		for (let i = 0; i <= body.length - 2; i++) {
			let row = body[i],
				csvRow = [];

			if (groupBy) {
				csvRow = processCSVGroupBy(groupBy, row);
			} else {
				updateMinorRow(csvRow, row);
			}

			csvBody.push(csvRow);
		}

		const totalsRow = body[body.length - 1];

		if (
			!groupBy &&
			totalsRow &&
			totalsRow[commonConsts.DATA_LABELS.date].props
		) {
			if (commonConsts.IS_SUPERUSER) {
				csvBody.push([
					totalsRow[commonConsts.DATA_LABELS.date].props.children,
					totalsRow[commonConsts.DATA_LABELS.pageViews].props.children,
					totalsRow[commonConsts.DATA_LABELS.pageCpm].props.children,
					totalsRow[commonConsts.DATA_LABELS.adpRequests].props.children,
					sumNetworkDataProp(totalsRow[commonConsts.DATA_LABELS.impressions]),
					totalsRow[commonConsts.DATA_LABELS.adpCoverage].props.children,
					calculateCSVRowCPM(totalsRow),
					sumNetworkDataProp(
						totalsRow[commonConsts.DATA_LABELS.revenue]
					).toFixed(2),
					totalsRow[commonConsts.DATA_LABELS.grossRevenue].props.children,
					totalsRow[commonConsts.DATA_LABELS.xpathMiss].props.children
				]);
			} else {
				csvBody.push([
					totalsRow[commonConsts.DATA_LABELS.date].props.children,
					totalsRow[commonConsts.DATA_LABELS.pageCpm].props.children,
					sumNetworkDataProp(totalsRow[commonConsts.DATA_LABELS.impressions]),
					calculateCSVRowCPM(totalsRow),
					sumNetworkDataProp(
						totalsRow[commonConsts.DATA_LABELS.revenue]
					).toFixed(2)
				]);
			}
		}

		return csvBody;
	};

export { apiQueryGenerator, dataGenerator, reorderArray, csvDataGenerator };
