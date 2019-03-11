import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, select, text } from '@storybook/addon-knobs';
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
		const activeLegendItems = ['Impressions', 'CPM ($)'];

		return (
			<div>
				<CustomChart
					title={title}
					type={type}
					config={config}
					activeLegendItems={activeLegendItems}
				/>
			</div>
		);
	});
