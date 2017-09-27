import React from 'react';
import ReactHighcharts from 'react-highcharts';
import ActionCard from '../../../Components/ActionCard.jsx';

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const config = {
			title: {
				text: 'AdPushup report'
			},
			subtitle: {
				text: 'Day wise'
			},
			yAxis: [
				{
					title: {
						text: ''
					}
				},
				{
					title: {
						text: ''
					},
					opposite: true
				}
			],
			xAxis: {
				categories: ['10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep']
			},
			series: [
				{
					name: 'Impressions',
					yAxis: 0,
					data: [22010, 20343, 19563, 18124, 21047, 22098, 19932]
				},
				{
					name: 'CPM',
					yAxis: 1,
					data: [4.5, 5.5, 2, 3.4, 6.7, 4.4, 5.2]
				},
				{
					name: 'Xpath miss',
					yAxis: 0,
					data: [2343, 3444, 2984, 3100, 2676, 2896, 2811]
				},
				{
					name: 'Clicks',
					yAxis: 0,
					data: [344, 235, 545, 434, 429, 349, 412]
				}
			],
			credits: false
		};

		return (
			<ActionCard title="AdPushup Report">
				<ReactHighcharts config={config} />
			</ActionCard>
		);
	}
}

export default ReportingPanel;
