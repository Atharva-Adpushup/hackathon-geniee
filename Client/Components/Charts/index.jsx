import React, { Component } from 'react';
import PropTypes from 'prop-types';
import highcharts from 'highcharts';
import ReactHighcharts from 'react-highcharts';

/*
	type of chart
	title
	callback
	type specific config
*/

class Charts extends Component {
	render() {
		const config = {
			xAxis: {
				categories: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec'
				]
			},
			series: [
				{
					data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 295.6, 454.4]
				}
			]
		};
		return <ReactHighcharts config={config} />;
	}
}

// Charts.propTypes = {
// 	config: PropTypes.shape({
// 		type: PropTypes.string.isRequired,
// 		title:
// 	}).isRequired,
// 	type: PropTypes.string.isRequired
// };

export default Charts;
