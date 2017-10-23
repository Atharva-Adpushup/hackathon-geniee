import config from './config';
import moment from 'moment';
import parseSiteLevelData from './dataParsers/parseSiteLevelData';
import $ from 'jquery';
import { Promise } from 'es6-promise';

const apiQueryGenerator = params => {
		let where = {
			siteid: 28822, // config.SITE_ID
			from: moment(params.startDate).format('YYYY-MM-DD'),
			to: moment(params.endDate).format('YYYY-MM-DD')
		};

		if (params.pageGroup) {
			where.pagegroup = [params.pageGroup];
		}

		if (params.platform) {
			where.device_type = params.platform;
		}

		if (params.variationIds) {
			where.variation = params.variationIds;
		}

		return JSON.stringify({
			select: config.SELECT,
			where,
			orderBy: ['report_date']
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
	dataGenerator = (data, reportLevel) => {
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
			chartData = null,
			tableData = null;

		if (!data.error) {
			switch (reportLevel) {
				case 'site':
				case 'pageGroup':
					chartData = parseSiteLevelData(data).chartConfig;
					tableData = parseSiteLevelData(data).tableConfig;
					break;
			}
		}

		config = { ...config, ...chartData };
		return { chartData: config, tableData };
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

export { apiQueryGenerator, dataGenerator, capitalCase, ajax };
