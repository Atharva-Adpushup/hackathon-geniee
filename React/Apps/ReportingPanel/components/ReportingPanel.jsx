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
			groupBy: null,
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

		const { startDate, endDate, pageGroup, platform, variation, groupBy } = this.state,
			params = { startDate, endDate, pageGroup, platform, variation };

		let state = {
			reportLoading: false,
			disableGenerateButton: false
		};

		const res = {
			error: false,
			columns: [
				'total_xpath_miss',
				'total_impressions',
				'report_date',
				'siteid',
				'total_revenue',
				'name',
				'total_requests'
			],
			rows: [
				{
					total_xpath_miss: 49630,
					total_impressions: 16319,
					total_requests: 30000,
					report_date: '2017-10-12T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 37.6127,
					name: 'MIC'
				},
				{
					total_xpath_miss: 59630,
					total_impressions: 26319,
					total_requests: 32000,
					report_date: '2017-10-12T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 27.6127,
					name: 'POST'
				},
				{
					total_xpath_miss: 48659,
					total_impressions: 15972,
					total_requests: 10000,
					report_date: '2017-10-13T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 41.7479,
					name: 'MIC'
				},
				{
					total_xpath_miss: 28659,
					total_impressions: 25972,
					total_requests: 210000,
					report_date: '2017-10-13T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 31.7479,
					name: 'POST'
				},
				{
					total_xpath_miss: 39900,
					total_impressions: 13102,
					total_requests: 20000,
					report_date: '2017-10-14T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 22.6022,
					name: 'MIC'
				},
				{
					total_xpath_miss: 32900,
					total_impressions: 23102,
					total_requests: 25000,
					report_date: '2017-10-14T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 32.6022,
					name: 'POST'
				},
				{
					total_xpath_miss: 36932,
					total_impressions: 12068,
					total_requests: 27000,
					report_date: '2017-10-15T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 20.854,
					name: 'MIC'
				},
				{
					total_xpath_miss: 26932,
					total_impressions: 32068,
					total_requests: 29000,
					report_date: '2017-10-15T00:00:00.000Z',
					siteid: 28822,
					total_revenue: 40.854,
					name: 'POST'
				}
			]
		};

		const data = dataGenerator(res, groupBy);
		this.setState({
			...state,
			reportError: false,
			chartConfig: data.chartData,
			tableConfig: data.tableData
		});

		// ajax({
		// 	method: 'POST',
		// 	url: config.REPORT_ENDPOINT,
		// 	data: apiQueryGenerator(params)
		// })
		// 	.then(res => {
		// 		if (!res.error && res.rows.length) {
		// 			const data = dataGenerator(res);
		// 			this.setState({
		// 				...state,
		// 				reportError: false,
		// 				chartConfig: data.chartData,
		// 				tableConfig: data.tableData
		// 			});
		// 		} else {
		// 			this.setState({ ...state, reportError: true });
		// 		}
		// 	})
		// 	.catch(res => {
		// 		console.log('error');
		// 		console.log(res);
		// 		this.setState({ ...state, reportError: true });
		// 	});
	}

	updateReportParams(params) {
		this.setState({
			pageGroup: params.pageGroup,
			platform: params.platform,
			startDate: params.startDate,
			endDate: params.endDate,
			variation: params.variation,
			groupBy: params.groupBy
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
