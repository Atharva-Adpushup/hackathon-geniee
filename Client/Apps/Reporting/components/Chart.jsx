import React from 'react';

import CustomChart from '../../../Components/CustomChart';
import apLineChartConfig from '../configs/line-ap-data.json';

const typeOptions = {
	Line: 'line',
	Spline: 'spline',
	Pie: 'pie'
};

const defaultYAxisGroups = [
	{
		seriesNames: ['Pageviews', 'Adpushup Requests', 'Impressions', 'Xpath Miss']
	},
	{
		seriesNames: ['Page CPM ($)', 'CPM ($)'],
		yAxisConfig: {
			labels: {
				format: '${value}'
			}
		}
	},
	{
		seriesNames: ['Revenue ($)', 'Gross Revenue ($)'],
		yAxisConfig: {
			labels: {
				format: '${value}'
			}
		}
	}
];

export default () => {
	const title = 'My Chart';
	const type = 'spline';
	const series = apLineChartConfig.series;
	const xAxis = apLineChartConfig.xAxis;
	const legends = apLineChartConfig.legends;
	//const customConfig = object('Custom Config');
	const activeLegendItems = ['Impressions', 'Pageviews', 'CPM ($)'];
	const yAxisGroups = defaultYAxisGroups;

	return (
		<div>
			<CustomChart
				type={type}
				series={series}
				xAxis={xAxis}
				legends={legends}
				activeLegendItems={activeLegendItems}
				yAxisGroups={yAxisGroups}
			/>
		</div>
	);
};
