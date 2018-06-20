import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import commonConsts from '../lib/commonConsts';
import { apiQueryGenerator, dataGenerator } from '../lib/helpers';
import { ajax } from '../../../common/helpers';
import moment from 'moment';
import PaneLoader from '../../../Components/PaneLoader.jsx';

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			reportLoading: true,
			reportError: false,
			emptyData: false,
			disableGenerateButton: true,
			chartConfig: null,
			tableConfig: null,
			pageGroup: null,
			platform: null,
			variation: null,
			variations: [],
			groupBy: null,
			responseData: null,
			networkWiseData: false,
			activeLegendItems: props.activeLegendItems || commonConsts.LEGEND,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.generateReport = this.generateReport.bind(this);
		this.downloadReport = this.downloadReport.bind(this);
		this.updateReportParams = this.updateReportParams.bind(this);
		this.fetchVariations = this.fetchVariations.bind(this);
		this.tableToggleCallback = this.tableToggleCallback.bind(this);
	}

	fetchVariations(pageGroup, platform) {
		ajax({
			method: 'GET',
			url: `${commonConsts.VARIATIONS_ENDPOINT}?siteId=${
				commonConsts.SITE_ID
			}&pageGroup=${pageGroup}&platform=${platform}`
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

		const {
				startDate,
				endDate,
				pageGroup,
				platform,
				variation,
				groupBy,
				variations,
				activeLegendItems
			} = this.state,
			params = { startDate, endDate, pageGroup, platform, variation, groupBy, activeLegendItems };

		let state = {
			reportLoading: false,
			disableGenerateButton: false
		};

		ajax({
			method: 'POST',
			url: commonConsts.REPORT_ENDPOINT,
			data: apiQueryGenerator(params)
		})
			.then(res => {
				if (!res.error && res.rows.length) {
					const responseData = $.extend(true, {}, res),
						data = dataGenerator(res, groupBy, variations, null, activeLegendItems);
					this.setState({
						...state,
						reportError: false,
						responseData,
						chartConfig: data.chartData,
						tableConfig: data.tableData
					});
				} else if (!res.error && !res.rows.length) {
					this.setState({ ...state, reportError: true, emptyData: true });
				} else {
					this.setState({ ...state, reportError: true });
				}
			})
			.catch(res => {
				console.log(res);
				this.setState({ ...state, reportError: true });
			});
	}

	downloadReport() {
		console.log(this.state.tableConfig);
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

		if (params.pageGroup && params.platform && !params.variation) {
			this.setState({
				variations: [],
				variation: null
			});
			this.fetchVariations(params.pageGroup, params.platform);
		}
	}

	componentDidMount() {
		this.generateReport();
	}

	tableToggleCallback(value) {
		const { responseData, groupBy, variations } = this.state,
			res = $.extend(true, {}, responseData),
			data = dataGenerator(res, groupBy, variations, {
				toggleValue: value
			});

		this.setState({
			tableConfig: data.tableData
		});
	}

	render() {
		const {
				startDate,
				endDate,
				reportLoading,
				disableGenerateButton,
				reportError,
				emptyData,
				chartConfig,
				tableConfig,
				platform,
				variations,
				variation,
				groupBy
			} = this.state,
			customToggle = {
				toggleText: 'Network wise data',
				toggleChecked: false,
				toggleName: 'networkWiseData',
				toggleCallback: this.tableToggleCallback
			},
			reportPane = reportError ? (
				<PaneLoader
					message={!emptyData ? 'Error occurred while fetching report data!' : 'No report data present!'}
					state="error"
					styles={{ height: 'auto' }}
				/>
			) : (
				<div>
					<div id="chart-legend" />
					<ReactHighcharts config={chartConfig} />
					<div className="report-table">
						{tableConfig ? (
							<Datatable
								tableHeader={tableConfig.header}
								tableBody={tableConfig.body}
								keyName="reportTable"
								rowsPerPage={10}
								customToggle={customToggle}
								rowsPerPageOption={[20, 30, 40, 50]}
								customGroupByNonAggregatedData={groupBy}
							/>
						) : (
							''
						)}
					</div>
				</div>
			);

		return (
			<ActionCard title={`AdPushup Report - ${commonConsts.SITE_DOMAIN}`}>
				<Row>
					<Col sm={10} smOffset={2}>
						<ReportControls
							startDate={startDate}
							endDate={endDate}
							disableGenerateButton={disableGenerateButton}
							generateButtonHandler={this.generateReport}
							downloadButtonHandler={this.downloadReport}
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
