import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, array, select, text } from '@storybook/addon-knobs';

import CustomChart from './Components/CustomChart';
import defaultPieChartConfig from './customChartDummyData/pie.json';
import defaultLineChartConfig from './customChartDummyData/line.json';
import {
	chartConfig,
	defaultYAxisGroups,
	activeLegendItemsArr
} from './customChartDummyData/line-ap-data.json';

const typeOptions = {
	Line: 'line',
	Spline: 'spline',
	Pie: 'pie'
};

storiesOf('UI.CustomChart', module)
	.addDecorator(withKnobs)
	.add('default', () => {
		const title = text('Chart Title', 'My Chart');
		const type = select('Chart Type', typeOptions, 'spline');
		const series = array('Series', chartConfig.series);
		const categories = object('Categories', chartConfig.categories);
		const legends = object('Legends', chartConfig.legends);
		const customConfig = object('Custom Config');
		const activeLegendItems = array('Active Legend Items', activeLegendItemsArr);
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
