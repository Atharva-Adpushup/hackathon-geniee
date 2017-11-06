import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import ActionCard from '../../../Components/ActionCard.jsx';
import ReportControls from './ReportControls.jsx';
import '../styles.scss';
import commonConsts from '../lib/commonConsts';
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

	generateReport() {
		this.setState({
			reportLoading: true,
			disableGenerateButton: true
		});

		const { startDate, endDate, pageGroup, platform, variation, groupBy } = this.state,
			params = { startDate, endDate, pageGroup, platform, variation, groupBy };

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
					const data = dataGenerator(res, groupBy);
					this.setState({
						...state,
						reportError: false,
						chartConfig: data.chartData,
						tableConfig: data.tableData
					});
				} else {
					this.setState({ ...state, reportError: true });
				}
			})
			.catch(res => {
				console.log('error');
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
								rowsPerPage={20}
								rowsPerPageOption={[30, 40, 50, 60]}
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
