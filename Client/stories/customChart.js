import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, array, select, text } from '@storybook/addon-knobs';
import CustomChart from './Components/CustomChart';

import defaultPieChartConfig from './customChartDummyData/pie.json';
import defaultLineChartConfig from './customChartDummyData/line.json';
import apLineChartConfig from './customChartDummyData/line-ap-data.json';

const typeOptions = {
	Line: 'line',
	Pie: 'pie'
};

storiesOf('UI.CustomChart', module)
	.addDecorator(withKnobs)
	.add('default', () => {
		const title = text('Chart Title', '');
		const type = select('Chart Type', typeOptions, 'line');
		const config = object('Config', apLineChartConfig);
		const activeLegendItems = array('Active Legend Items', ['Impressions', 'Pageviews', 'CPM ($)']);
		const yAxisGroups = array('yAxis Groups', [
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
		]);

		return (
			<div>
				<CustomChart
					title={title}
					type={type}
					config={config}
					activeLegendItems={activeLegendItems}
					yAxisGroups={yAxisGroups}
				/>
			</div>
		);
	});
