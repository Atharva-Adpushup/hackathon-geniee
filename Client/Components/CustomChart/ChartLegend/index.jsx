import React from 'react';
import LegendItem from './LegendItem';
import ManageLegendItems from './ManageLegendItems';

const ChartLegend = ({
	chart: { series, yAxis },
	legends,
	activeLegendItems,
	onLegendChange,
	availableLegends,
	isCustomizeChartLegend,
	updateMetrics,
	isManageLegendItemsShown = false
}) => (
	<div className="text-center chart-legend u-margin-v3">
		{legends.map((legend, key) => (
			<LegendItem
				key={key}
				legend={legend}
				activeLegendItems={activeLegendItems}
				onLegendChange={onLegendChange}
				series={series}
				yAxis={yAxis}
			/>
		))}

		{isCustomizeChartLegend && !!availableLegends.length && isManageLegendItemsShown && (
			<ManageLegendItems
				availableLegends={availableLegends}
				activeLegends={legends}
				updateMetrics={updateMetrics}
			/>
		)}
	</div>
);

// ChartLegend.propTypes = {
// 	chart: PropTypes.shape({ series: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired,
// 	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
// };

export default ChartLegend;
