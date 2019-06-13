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
				.subtract(8, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day'),
			tableData: {},
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
		const { startDate, endDate } = this.state;
		if (siteId) {
			let selectedFilters = { siteid: { [siteId]: true } };
			this.generateButtonHandler({ startDate, endDate, selectedFilters });
			this.setState({ reportType: 'site' });
		} else this.generateButtonHandler(startDate, endDate);
	}

	formateReportParams = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		} = this.state;
		const { site } = this.props;
		const selectedMetrics = metricsList
			.filter(metric => !metric.isDisabled)
			.map(metric => metric.value);
		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD'),
			metrics: selectedMetrics.toString(),
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
		this.setState(data, () => {
			const params = this.formateReportParams();

			reportService.getCustomStats(params).then(response => {
				if (response.status == 200 && response.data) {
					this.setState({ tableData: response.data });
				}
				this.setState({ isLoading: false });
			});
		});
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
			reportType
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
