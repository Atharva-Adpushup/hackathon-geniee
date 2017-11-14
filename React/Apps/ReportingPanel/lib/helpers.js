import commonConsts from './commonConsts';
import moment from 'moment';
import dataParser from './dataParser';
import $ from 'jquery';
import { Promise } from 'es6-promise';
import ChartLegend from '../components/ChartLegend/index.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

const apiQueryGenerator = params => {
	let where = {
		siteid: commonConsts.SITE_ID,
		from: moment(params.startDate).format('YYYY-MM-DD'),
		to: moment(params.endDate).format('YYYY-MM-DD')
	},
		groupBy = [];

	if (params.groupBy) {
		groupBy.push(params.groupBy);
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
		select: commonConsts.SELECT,
		where,
		orderBy: ['report_date'],
		groupBy
	});
},
	capitalCase = str => {
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word[0].toUpperCase() + word.substr(1))
			.join(' ');
	},
	dataGenerator = (data, groupBy) => {
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
						ReactDOM.render(<ChartLegend chart={chart} />, node);
					}
				}
			},
			legend: {
				enabled: false
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
					animation: false
				}
			}
		},
			chartData = null,
			tableData = null;

		if (!data.error) {
			const parsedData = dataParser(data, groupBy);
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
	ajax = params => {
		const { method, url, data } = params;

		return new Promise((resolve, resject) => {
			$.ajax({
				method,
				url,
				headers: { 'Content-Type': 'application/json' },
				data,
				contentType: 'json',
				dataType: 'json',
				success: res => {
					return resolve(res);
				},
				fail: res => {
					return reject(res);
				}
			});
		});
	};

export { apiQueryGenerator, dataGenerator, capitalCase, ajax, reorderArray };
