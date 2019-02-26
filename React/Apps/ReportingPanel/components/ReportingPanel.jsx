import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import commonConsts from '../lib/commonConsts';
import { apiQueryGenerator, dataGenerator, csvDataGenerator } from '../lib/helpers';
import { ajax } from '../../../common/helpers';
import moment from 'moment';
import PaneLoader from '../../../Components/PaneLoader.jsx';

class ReportingPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			updateStatusText: '',
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
			startDate: moment().subtract(7, 'days').startOf('day'),
			endDate: moment().startOf('day').subtract(1, 'day')
		};
		this.generateReport = this.generateReport.bind(this);
		this.updateReportParams = this.updateReportParams.bind(this);
		this.fetchVariations = this.fetchVariations.bind(this);
		this.tableToggleCallback = this.tableToggleCallback.bind(this);
		this.getReportStatus = this.getReportStatus.bind(this);
	}

	fetchVariations(pageGroup, platform) {
		ajax({
			method: 'GET',
			url: `${commonConsts.VARIATIONS_ENDPOINT}?siteId=${commonConsts.SITE_ID}&pageGroup=${pageGroup}&platform=${platform}`
		})
			.then(res => {
				const variations = this.state.variations.concat(res.data);
				this.setState({ variations });
			})
			.catch(res => {
				this.setState({ variations: [] });
			});
	}

	getReportStatus() {
		ajax({
			method: 'GET',
			url: `${commonConsts.REPORT_STATUS}?fromDate=${this.state.startDate}&toDate=${this.state.endDate}`
		}).then(res => {
			if (res.status) {
				if (res.status == 'Stopped') {
					let updatedDate = res.lastRunTimePST;
					this.setState({
						updateStatusText: `Note - The reports were last updated on ${updatedDate}.`
					});
				}
			}
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
			activeLegendItems,
			tagManager
		} = this.state,
			params = {
				startDate,
				endDate,
				pageGroup,
				platform,
				variation: tagManager ? 'manual' : variation,
				groupBy,
				activeLegendItems
			};

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
				this.getReportStatus();
				if (!res.error && res.rows.length) {
					const responseData = $.extend(true, {}, res),
						data = dataGenerator(res, groupBy, variations, null, activeLegendItems);
					this.setState({
						...state,
						reportError: false,
						responseData,
						chartConfig: data.chartData,
						tableConfig: data.tableData,
						emptyData: false
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

	updateReportParams(params) {
		this.setState({
			pageGroup: params.pageGroup,
			platform: params.platform,
			startDate: params.startDate,
			endDate: params.endDate,
			variation: params.variation,
			groupBy: params.groupBy,
			tagManager: params.tagManager
		});

		if (!params.tagManager) {
			if (!params.pageGroup && !params.platform) {
				this.setState({
					variations: [],
					variation: null
				});
			}
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
			groupBy,
			updateStatusText
		} = this.state,
			customToggle = {
				toggleText: 'Network wise data',
				toggleChecked: false,
				toggleName: 'networkWiseData',
				toggleCallback: this.tableToggleCallback
			},
			reportPane = reportError
				? <PaneLoader
						message={!emptyData ? 'Error occurred while fetching report data!' : 'No report data present!'}
						state="error"
						styles={{ height: 'auto' }}
					/>
				: <div>
						<div id="chart-legend" />
						<ReactHighcharts config={chartConfig} />
						<div className="report-table">
							{tableConfig
								? <Datatable
										tableHeader={tableConfig.header}
										tableBody={tableConfig.body}
										keyName="reportTable"
										rowsPerPage={10}
										customToggle={customToggle}
										rowsPerPageOption={[20, 30, 40, 50]}
										customGroupByNonAggregatedData={groupBy}
									/>
								: ''}
						</div>
					</div>;

		let csvData = '';
		if (tableConfig) {
			csvData = btoa(JSON.stringify(csvDataGenerator(tableConfig, groupBy)));
		}

		return (
			<ActionCard title={`AdPushup Report - ${commonConsts.SITE_DOMAIN}`}>
				<Row>
					<Col sm={12}>
						<ReportControls
							startDate={startDate}
							endDate={endDate}
							emptyData={emptyData}
							disableGenerateButton={disableGenerateButton}
							generateButtonHandler={this.generateReport}
							reportParamsUpdateHandler={this.updateReportParams}
							variations={variations}
							variation={variation}
							csvData={csvData}
						/>
					</Col>
					<Col sm={12} className="updateStatusDiv">
						{updateStatusText
							? <span>{updateStatusText}</span>
							: <span className="runningStatus">
									Note - The network reporting data is being crunched right now which may affect the reporting data. You will see updated data shortly.
								</span>}
					</Col>
					<Col sm={12}>{reportLoading ? <PaneLoader message="Loading report data..." /> : reportPane}</Col>
				</Row>
			</ActionCard>
		);
	}
}

export default ReportingPanel;
