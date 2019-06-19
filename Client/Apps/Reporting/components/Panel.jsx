import React, { Component, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { Object } from 'es6-shim';
import ActionCard from '../../../Components/ActionCard/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import { displayMetrics } from '../configs/commonConsts';
import Loader from '../../../Components/Loader';
import { computeCsvData } from '../helpers/utils';

class Panel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			metricsList: displayMetrics,
			selectedDimension: '',
			selectedFilters: {},
			selectedMetrics: [],
			selectedInterval: 'daily',
			startDate: moment()
				.startOf('day')
				.subtract(8, 'days')
				.format('YYYY-MM-DD'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			tableData: {},
			csvData: [],
			reportType: 'account',
			isLoading: true
		};
	}

	componentDidMount() {
		const {
			match: {
				params: { siteId }
			}
		} = this.props;
		const { startDate, endDate, metricsList, selectedInterval } = this.state;
		if (siteId) {
			let selectedFilters = { siteid: { [siteId]: true } };
			this.generateButtonHandler({
				startDate,
				endDate,
				selectedFilters,
				metricsList,
				selectedInterval
			});
			this.setState({ reportType: 'site' });
		} else this.generateButtonHandler({ startDate, endDate, metricsList, selectedInterval });
	}

	formateReportParams = data => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		} = data;
		const { site } = this.props;
		let selectedMetrics;
		if (metricsList) {
			selectedMetrics = metricsList
				.filter(metric => !metric.isDisabled)
				.map(metric => metric.value);
		}
		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD'),
			metrics: selectedMetrics ? selectedMetrics.toString() : null,
			interval: selectedInterval,
			dimension: selectedDimension || null
		};
		for (const filter in selectedFilters) {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		}
		if (!params['siteid']) {
			const siteIds = Object.keys(site);
			params['siteid'] = siteIds.toString();
		}
		return params;
	};

	generateButtonHandler = data => {
		this.setState({ isLoading: true });
		const params = this.formateReportParams(data);

		reportService.getCustomStats(params).then(response => {
			if (response.status == 200 && response.data) {
				this.setState({ tableData: response.data, ...data });
			} else this.setState({ ...data });
			this.setState({ isLoading: false });
		});
	};

	getFinalTableData = tableData => {
		let csvData = computeCsvData(tableData);
		this.setState({ csvData });
	};
	renderContent = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedMetrics,
			selectedInterval,
			metricsList,
			tableData,
			reportType,
			csvData
		} = this.state;
		return (
			<Row>
				<Col sm={12}>
					<ControlContainer
						startDate={startDate}
						endDate={endDate}
						generateButtonHandler={this.generateButtonHandler}
						selectedDimension={selectedDimension}
						metricsList={metricsList}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
						selectedInterval={selectedInterval}
						reportType={reportType}
						csvData={csvData}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<ChartContainer
						tableData={tableData}
						selectedDimension={selectedDimension}
						startDate={startDate}
						endDate={endDate}
						metricsList={metricsList}
						selectedInterval={selectedInterval}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<TableContainer
						tableData={tableData}
						startDate={startDate}
						endDate={endDate}
						selectedInterval={selectedInterval}
						getTableData={this.getFinalTableData}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		let { isLoading } = this.state;
		return isLoading ? (
			<Loader />
		) : (
			<ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>
		);
	}
}

export default Panel;
