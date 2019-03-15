import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, array, select, text } from '@storybook/addon-knobs';

import CustomChart from './Components/CustomChart';
import defaultPieChartConfig from './customChartDummyData/pie.json';
import defaultLineChartConfig from './customChartDummyData/line.json';
import apLineChartConfig from './customChartDummyData/line-ap-data.json';

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

storiesOf('UI.CustomChart', module)
	.addDecorator(withKnobs)
	.add('default', () => {
		const title = text('Chart Title', 'My Chart');
		const type = select('Chart Type', typeOptions, 'spline');
		const series = array('Series', apLineChartConfig.series);
		const categories = object('Categories', apLineChartConfig.categories);
		const legends = object('Legends', apLineChartConfig.legends);
		const customConfig = object('Custom Config');
		const activeLegendItems = array('Active Legend Items', ['Impressions', 'Pageviews', 'CPM ($)']);
		const yAxisGroups = array('yAxis Groups', defaultYAxisGroups);

		return (
			<div>
				<CustomChart
					title={title}
					type={type}
					series={series}
					categories={categories}
					legends={legends}
					customConfig={customConfig}
					activeLegendItems={activeLegendItems}
					yAxisGroups={yAxisGroups}
				/>
			</div>
		);
	});
