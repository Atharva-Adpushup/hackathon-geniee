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
				console.log(res);
			})
			.catch(res => {
				console.log(res);
			});
	}

	generateReport() {
		this.setState({
			reportLoading: true,
			disableGenerateButton: true
		});

		const { startDate, endDate, pageGroup, platform } = this.state,
			params = { startDate, endDate, pageGroup, platform };

		let state = {
			reportLoading: false,
			disableGenerateButton: false
		};

		ajax({
			method: 'POST',
			url: config.REPORT_ENDPOINT,
			data: apiQueryGenerator(params)
		})
			.then(res => {
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
			})
			.catch(res => {
				console.log('error');
				console.log(res);
				this.setState({ ...state, reportError: true });
			});
	}

	updateReportParams(params) {
		const { state } = this;

		this.setState({
			pageGroup: params.pageGroup,
			platform: params.platform,
			startDate: params.startDate,
			endDate: params.endDate
		});

		if (params.pageGroup && params.platform) {
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
				platform
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
						/>
					</Col>
					<Col sm={12}>{reportLoading ? <PaneLoader message="Loading report data..." /> : reportPane}</Col>
				</Row>
			</ActionCard>
		);
	}
}

export default ReportingPanel;
