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
			reportLevel: 'site',
			chartConfig: null,
			tableConfig: null,
			pageGroup: null,
			platform: null,
			variations: [],
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment().startOf('day')
		};
		this.generateReport = this.generateReport.bind(this);
		this.updateReportParams = this.updateReportParams.bind(this);
		this.fetchVariations = this.fetchVariations.bind(this);
	}

	fetchVariations() {}

	generateReport() {
		this.setState({
			reportLoading: true,
			disableGenerateButton: true
		});

		const { startDate, endDate, reportLevel, pageGroup } = this.state,
			params = { startDate, endDate, pageGroup };

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
					const data = dataGenerator(res, reportLevel);
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

		if ((params.pageGroup || state.pageGroup) && (params.platform || state.platform)) {
			this.fetchVariations();
		}

		this.setState({
			pageGroup: params.pageGroup,
			platform: params.platform ? params.platform : state.platform,
			startDate: params.startDate ? params.startDate : state.startDate,
			endDate: params.endDate ? params.endDate : state.endDate,
			reportLevel: params.reportLevel ? params.reportLevel : state.reportLevel
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
