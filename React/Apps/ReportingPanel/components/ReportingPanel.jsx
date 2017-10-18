import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import config from '../lib/config';
import { apiQueryGenerator, chartConfigGenerator } from '../lib/helpers';
import moment from 'moment';
import PaneLoader from '../../../Components/PaneLoader.jsx';

const header = [
		{ title: 'Date', prop: 'date', sortable: true, filterable: true },
		{ title: 'Impression', prop: 'impression', sortable: true, filterable: true },
		{ title: 'CPM', prop: 'cpm', sortable: true, filterable: true },
		{ title: 'Xpath Miss', prop: 'xPathMiss', sortable: true, filterable: true }
	],
	data = [
		{
			date: '10 Sep',
			impressions: 22010,
			cpm: 4.5,
			xPathMiss: 6343
		},
		{
			date: '11 Sep',
			impressions: 20343,
			cpm: 5.5,
			xPathMiss: 7444
		},
		{
			date: '12 Sep',
			impressions: 19563,
			cpm: 2,
			xPathMiss: 5984
		},
		{
			date: '13 Sep',
			impressions: 18124,
			cpm: 3.4,
			xPathMiss: 6100
		},
		{
			date: '14 Sep',
			impressions: 21047,
			cpm: 6.2,
			xPathMiss: 7676
		},
		{
			date: '15 Sep',
			impressions: 22098,
			cpm: 4.4,
			xPathMiss: 7896
		},
		{
			date: '16 Sep',
			impressions: 19932,
			cpm: 5.2,
			xPathMiss: 6811
		}
	];

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			reportLoading: true,
			reportError: false,
			disableGenerateButton: true,
			reportLevel: 'site',
			chartConfig: null,
			pageGroup: null,
			platform: null,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment().startOf('day')
		};
		this.generateReport = this.generateReport.bind(this);
		this.updateReportParams = this.updateReportParams.bind(this);
	}

	generateReport() {
		this.setState({
			reportLoading: true,
			disableGenerateButton: true
		});

		const { startDate, endDate, reportLevel } = this.state,
			params = { startDate, endDate },
			res = {
				error: false,
				columns: ['total_xpath_miss', 'total_impressions', 'report_date', 'siteid', 'total_revenue'],
				rows: [
					{
						total_xpath_miss: 49215,
						total_impressions: 46945,
						report_date: '2017-10-10T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 91.7676
					},
					{
						total_xpath_miss: 50227,
						total_impressions: 47034,
						report_date: '2017-10-11T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 73.5381
					},
					{
						total_xpath_miss: 23500,
						total_impressions: 24115,
						report_date: '2017-10-17T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 8.6194
					},
					{
						total_xpath_miss: 50051,
						total_impressions: 46210,
						report_date: '2017-10-12T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 99.0527
					},
					{
						total_xpath_miss: 49040,
						total_impressions: 45336,
						report_date: '2017-10-13T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 92.2179
					},
					{
						total_xpath_miss: 40200,
						total_impressions: 35371,
						report_date: '2017-10-14T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 59.7022
					},
					{
						total_xpath_miss: 37213,
						total_impressions: 30513,
						report_date: '2017-10-15T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 61.014
					},
					{
						total_xpath_miss: 48319,
						total_impressions: 46485,
						report_date: '2017-10-16T00:00:00.000Z',
						siteid: 28822,
						total_revenue: 79.5231
					}
				]
			};

		this.setState({
			reportLoading: false,
			disableGenerateButton: false,
			reportError: false,
			chartConfig: chartConfigGenerator(res, reportLevel)
		});

		// $.ajax({
		// 	method: 'POST',
		// 	url: config.API_ENDPOINT,
		// 	headers: { 'Content-Type': 'application/json' },
		// 	data: apiQueryGenerator(params),
		// 	contentType: 'json',
		// 	dataType: 'json',
		// 	success: res => {
		// 		chartConfigGenerator(res);

		// 		let state = {
		// 			reportLoading: false,
		// 			disableGenerateButton: false
		// 		};

		// 		if (!res.error) {
		// 			this.setState(state);
		// 		} else {
		// 			state.reportError = true;
		// 			this.setState(state);
		// 		}
		// 	},
		// 	fail: res => {
		// 		console.log('error');
		// 		console.log(res);
		// 		this.setState({ reportLoading: false, disableGenerateButton: false, reportError: true });
		// 	}
		// });
	}

	updateReportParams(params) {
		const { state } = this;

		this.setState({
			pageGroup: params.pageGroup ? params.pageGroup : state.pageGroup,
			platform: params.platform ? params.platform : state.platform,
			startDate: params.startDate ? params.startDate : state.startDate,
			endDate: params.endDate ? params.endDate : state.endDate
		});
	}

	componentDidMount() {
		this.generateReport();
	}

	render() {
		const { startDate, endDate, reportLoading, disableGenerateButton, reportError, chartConfig } = this.state,
			chartPane = reportError ? (
				<PaneLoader
					message="Error occurred while fetching report data!"
					state="error"
					styles={{ height: 'auto' }}
				/>
			) : (
				<ReactHighcharts config={chartConfig} />
			);

		return (
			<ActionCard title="AdPushup Report">
				<Row>
					<Col sm={10} smOffset={2}>
						<ReportControls
							startDate={startDate}
							endDate={endDate}
							disableGenerateButton={disableGenerateButton}
							generateButtonHandler={this.generateReport}
							reportParamsUpdateHandler={this.updateReportParams}
						/>
					</Col>
					<Col sm={12}>{reportLoading ? <PaneLoader message="Loading report data..." /> : chartPane}</Col>
				</Row>
				{/* <div className="report-chart">
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
				</div> */}
			</ActionCard>
		);
	}
}

export default ReportingPanel;
