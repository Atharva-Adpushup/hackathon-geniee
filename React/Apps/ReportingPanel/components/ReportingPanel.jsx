import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import '../styles.scss';

const header = [
		{ title: 'Date', prop: 'date', sortable: true, filterable: true },
		{ title: 'Impression', prop: 'impression', sortable: true, filterable: true },
		{ title: 'CPM', prop: 'cpm', sortable: true, filterable: true },
		{ title: 'Xpath Miss', prop: 'xPathMiss', sortable: true, filterable: true },
		{ title: 'Clicks', prop: 'clicks', sortable: true, filterable: true }
	],
	data = [
		{
			date: '10 Sep',
			impressions: 22010,
			cpm: 4.5,
			xPathMiss: 6343,
			clicks: 1344
		},
		{
			date: '11 Sep',
			impressions: 20343,
			cpm: 5.5,
			xPathMiss: 7444,
			clicks: 1235
		},
		{
			date: '12 Sep',
			impressions: 19563,
			cpm: 2,
			xPathMiss: 5984,
			clicks: 1545
		},
		{
			date: '13 Sep',
			impressions: 18124,
			cpm: 3.4,
			xPathMiss: 6100,
			clicks: 1434
		},
		{
			date: '14 Sep',
			impressions: 21047,
			cpm: 6.2,
			xPathMiss: 7676,
			clicks: 1429
		},
		{
			date: '15 Sep',
			impressions: 22098,
			cpm: 4.4,
			xPathMiss: 7896,
			clicks: 1349
		},
		{
			date: '16 Sep',
			impressions: 19932,
			cpm: 5.2,
			xPathMiss: 6811,
			clicks: 1412
		}
	];

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		$.ajax({
			method: 'POST',
			url: '/user/reports/generate',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				select: ['total_xpath_miss', 'total_impressions', 'total_cpm'],
				where: {
					siteid: 28822,
					pagegroup: 'MIC', // this.props.activeChannel.pageGroup
					variation: '2e68228f-84da-415e-bfcf-bfcf67c87570' // this.props.variation.id
					// device_type: this.props.activeChannel.platform
				},
				groupBy: ['section']
			}),
			contentType: 'json',
			dataType: 'json',
			success: response => {
				console.log(response);
			}
		});
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
						text: 'Impressions / Xpath miss / Clicks'
					}
				},
				{
					title: {
						text: 'CPM'
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
					data: [22010, 20343, 19563, 18124, 21047, 22098, 19932],
					lineWidth: 1.5,
					marker: {
						symbol: 'circle',
						radius: 3.2
					}
				},
				{
					name: 'CPM',
					yAxis: 1,
					data: [4.5, 5.5, 2, 3.4, 6.2, 4.4, 5.2],
					lineWidth: 1.5,
					marker: {
						symbol: 'circle',
						radius: 3.2
					}
				},
				{
					name: 'Xpath miss',
					yAxis: 0,
					data: [6343, 7444, 5984, 6100, 7676, 7896, 6811],
					lineWidth: 1.5,
					marker: {
						symbol: 'circle',
						radius: 3.2
					}
				},
				{
					name: 'Clicks',
					yAxis: 0,
					data: [1344, 1235, 1545, 1434, 1429, 1349, 1412],
					lineWidth: 1.5,
					marker: {
						symbol: 'circle',
						radius: 3.2
					}
				}
			],
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
			}
		};

		return (
			<ActionCard title="AdPushup Report">
				<div className="report-chart">
					<ReactHighcharts config={config} />
				</div>
				<div className="report-table">
					<Datatable
						tableHeader={header}
						tableBody={data}
						keyName="reportTable"
						rowsPerPage={5}
						rowsPerPageOption={[2, 3, 4, 5]}
					/>
				</div>
			</ActionCard>
		);
	}
}

export default ReportingPanel;
