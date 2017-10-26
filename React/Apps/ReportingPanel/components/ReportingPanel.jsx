import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import config from '../lib/config';
import { apiQueryGenerator, dataGenerator, ajax } from '../lib/helpers';
import moment from 'moment';
import PaneLoader from '../../../Components/PaneLoader.jsx';

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			reportLoading: true,
			reportError: false,
			disableGenerateButton: true,
			chartConfig: null,
			tableConfig: null,
			pageGroup: null,
			platform: null,
			variation: null,
			variations: [],
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.generateReport = this.generateReport.bind(this);
		this.updateReportParams = this.updateReportParams.bind(this);
		this.fetchVariations = this.fetchVariations.bind(this);
	}

	fetchVariations(pageGroup, platform) {
		ajax({
			method: 'GET',
			url: `${config.VARIATIONS_ENDPOINT}?siteId=${config.SITE_ID}&pageGroup=${pageGroup}&platform=${platform}`
		})
			.then(res => {
				const variations = this.state.variations.concat(res.data);
				this.setState({ variations });
			})
			.catch(res => {
				this.setState({ variations: [] });
			});
	}

	generateReport() {
		this.setState({
			reportLoading: true,
			disableGenerateButton: true
		});

		const { startDate, endDate, pageGroup, platform, variation } = this.state,
			params = { startDate, endDate, pageGroup, platform, variation };

		let state = {
			reportLoading: false,
			disableGenerateButton: false
		};

		// ajax({
		// 	method: 'POST',
		// 	url: config.REPORT_ENDPOINT,
		// 	data: apiQueryGenerator(params)
		// })
		// 	.then(res => {
		const res = {
			error: false,
			columns: [
				'total_xpath_miss',
				'total_requests',
				'report_date',
				'siteid',
				'total_impressions',
				'total_revenue'
			],
			rows: [
				{
					total_xpath_miss: 45634,
					total_requests: 20547,
					report_date: '2017-10-19T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 43858,
					total_revenue: 158.5481
				},
				{
					total_xpath_miss: 46066,
					total_requests: 20598,
					report_date: '2017-10-20T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 43894,
					total_revenue: 140.753
				},
				{
					total_xpath_miss: 38489,
					total_requests: 16030,
					report_date: '2017-10-21T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 34021,
					total_revenue: 94.9589
				},
				{
					total_xpath_miss: 36000,
					total_requests: 14299,
					report_date: '2017-10-22T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 32579,
					total_revenue: 112.5442
				},
				{
					total_xpath_miss: 16341,
					total_requests: 21446,
					report_date: '2017-10-23T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 45304,
					total_revenue: 140.6582
				},
				{
					total_xpath_miss: 1799,
					total_requests: 22199,
					report_date: '2017-10-24T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 44756,
					total_revenue: 136.5891
				},
				{
					total_xpath_miss: 1827,
					total_requests: 22163,
					report_date: '2017-10-25T00:00:00.000Z',
					siteid: 28822,
					total_impressions: 44271,
					total_revenue: 129.4741
				}
			]
		};
		if (!res.error && res.rows.length) {
			const data = dataGenerator(res);
			this.setState({
				...state,
				reportError: false,
				chartConfig: data.chartData,
				tableConfig: data.tableData
			});
		} else {
			this.setState({ ...state, reportError: true });
		}
		// })
		// .catch(res => {
		// 	console.log('error');
		// 	console.log(res);
		// 	this.setState({ ...state, reportError: true });
		//});
	}

	updateReportParams(params) {
		this.setState({
			pageGroup: params.pageGroup,
			platform: params.platform,
			startDate: params.startDate,
			endDate: params.endDate,
			variation: params.variation
		});

		if ((params.pageGroup && !params.platform) || (params.platform && !params.pageGroup)) {
			this.setState({
				variations: [],
				variation: null
			});
		}

		if (params.pageGroup && params.platform && !this.state.variations.length) {
			this.fetchVariations(params.pageGroup, params.platform);
		}
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
				tableConfig,
				platform,
				variations,
				variation
			} = this.state,
			reportPane = reportError ? (
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
							variations={variations}
							variation={variation}
						/>
					</Col>
					<Col sm={12}>{reportLoading ? <PaneLoader message="Loading report data..." /> : reportPane}</Col>
				</Row>
			</ActionCard>
		);
	}
}

export default ReportingPanel;
