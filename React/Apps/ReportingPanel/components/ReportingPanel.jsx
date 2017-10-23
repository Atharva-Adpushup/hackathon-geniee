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

		const { startDate, endDate, reportLevel, pageGroup } = this.state,
			params = { startDate, endDate, pageGroup };

		$.ajax({
			method: 'POST',
			url: config.API_ENDPOINT,
			headers: { 'Content-Type': 'application/json' },
			data: apiQueryGenerator(params),
			contentType: 'json',
			dataType: 'json',
			success: res => {
				const data = dataGenerator(res, reportLevel);

				let state = {
					reportLoading: false,
					disableGenerateButton: false
				};

				if (!res.error) {
					this.setState({
						...state,
						reportError: false,
						chartConfig: data.chartData,
						tableConfig: data.tableData
					});
				} else {
					this.setState({ ...state, reportError: true });
				}
			},
			fail: res => {
				console.log('error');
				console.log(res);
				this.setState({ reportLoading: false, disableGenerateButton: false, reportError: true });
			}
		});
	}

	updateReportParams(params) {
		const { state } = this;

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
