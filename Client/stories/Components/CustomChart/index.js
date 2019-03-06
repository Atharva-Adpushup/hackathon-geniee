import React from 'react';
import PropTypes from 'prop-types';
import ReactHighcharts from 'react-highcharts';
import { getCustomChartConfig } from '../../Services/customChartService';

const CustomChart = ({ title, type, config, containerClass }) => {
	const chartConfig = getCustomChartConfig(title, type, config);

	return (
		<div className={containerClass}>
			<ReactHighcharts config={chartConfig} />
		</div>
	);
};

CustomChart.propTypes = {
	title: PropTypes.string,
	type: PropTypes.oneOf(['line', 'pie']),
	config: PropTypes.object.isRequired,
	containerClass: PropTypes.string
};

CustomChart.defaultProps = {
	title: 'Custom Chart',
	type: 'line',
	containerClass: ''
};

export default CustomChart;
