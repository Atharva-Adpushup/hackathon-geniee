import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import config from '../lib/config';
import { apiQueryGenerator, dataGenerator } from '../lib/helpers';
import moment from 'moment';
import PaneLoader from '../../../Components/PaneLoader.jsx';

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			reportLoading: true,
			reportError: false,
			disableGenerateButton: true,
			reportLevel: 'site',
			chartConfig: null,
			tableConfig: null,
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
			chartConfig: dataGenerator(res, reportLevel).chartData,
			tableConfig: dataGenerator(res, reportLevel).tableData
		});

		// $.ajax({
		// 	method: 'POST',
		// 	url: config.API_ENDPOINT,
		// 	headers: { 'Content-Type': 'application/json' },
		// 	data: apiQueryGenerator(params),
		// 	contentType: 'json',
		// 	dataType: 'json',
		// 	success: res => {
		// 		dataGenerator(res);

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
		const {
				startDate,
				endDate,
				reportLoading,
				disableGenerateButton,
				reportError,
				chartConfig,
				tableConfig
			} = this.state,
			chartPane = reportError ? (
				<PaneLoader
					message="Error occurred while fetching report data!"
					state="error"
					styles={{ height: 'auto' }}
				/>
			) : (
				<div>
					<ReactHighcharts config={chartConfig} />
					<div className="report-table">
						{tableConfig ? (
							<Datatable
								tableHeader={tableConfig.header}
								tableBody={tableConfig.body}
								keyName="reportTable"
								rowsPerPage={10}
								rowsPerPageOption={[10, 15, 20, 25]}
							/>
						) : (
							''
						)}
					</div>
				</div>
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
			</ActionCard>
		);
	}
}

export default ReportingPanel;
