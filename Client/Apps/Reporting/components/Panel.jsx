import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { Object } from 'es6-shim';
import ActionCard from '../../../Components/ActionCard/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import {
	REPORTS_NAV_ITEMS,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES,
	REPORT_PATH,
	displayMetrics
} from '../configs/commonConsts';

class Panel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirectUrl: '',
			productList: [],
			productwisePreDefinedReports: [],
			activeProduct: '',
			activeReport: '',
			dimensionList: [],
			filterList: [],
			intervalsList: [],
			metricsList: [],
			reportLoading: true,
			selectedDimension: '',
			selectedFilters: {},
			selectedMetrics: [],
			activeProductDetails: {},
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
			startDate: moment()
				.subtract(8, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day'),
			tableData: {}
		};
	}

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	componentDidMount() {
		const { startDate, endDate } = this.state;
		this.generateButtonHandler({ startDate, endDate });
	}

	handleNavSelect = value => {
		const computedRedirectUrl = `/reports`;
		let redirectUrl = '';
		switch (value) {
			default:
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;
			case 2:
				redirectUrl = `${computedRedirectUrl}/site`;
				break;
		}
		this.setState({
			redirectUrl
		});
	};

	formateReportParams = data => {
		const { startDate, endDate, selectedDimension, selectedFilters, selectedInterval } = data;
		const selectedMetrics = displayMetrics.map(metric => metric.value);
		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD')
		};
		params.dimension = selectedDimension || null;
		for (const filter in selectedFilters) {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		}
		params.metrics = selectedMetrics.toString();
		params.interval = selectedInterval || 'daily';
		return params;
	};

	generateButtonHandler = data => {
		const params = this.formateReportParams(data);
		this.setState(data);
		reportService.getWidgetData(REPORT_PATH, params).then(response => {
			if (response.status === 200) {
				this.setState({ tableData: response.data.data });
			}
		});
	};

	renderContent = () => {
		const {
			reportLoading,
			productList,
			dimensionList,
			filterList,
			intervalsList,
			startDate,
			endDate,
			chartConfig,
			tableConfig,
			selectedDimension,
			selectedFilters,
			selectedMetrics,

			selectedInterval,
			activeProductDetails,
			tableData
		} = this.state;
		return (
			<Row>
				<Col sm={12}>
					<ControlContainer
						startDate={startDate}
						endDate={endDate}
						dimensionList={dimensionList}
						filterList={filterList}
						generateButtonHandler={this.generateButtonHandler}
						selectedDimension={selectedDimension}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
						selectedInterval={selectedInterval}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<ChartContainer
						tableData={tableData}
						selectedDimension={selectedDimension}
						startDate={startDate}
						endDate={endDate}
						selectedInterval={selectedInterval}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<TableContainer tableData={tableData} startDate={startDate} endDate={endDate} />
				</Col>
			</Row>
		);
	};

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = REPORTS_NAV_ITEMS[activeTab];
		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}
		return (
			<Fragment>
				<Helmet>
					<title>Reports</title>
				</Helmet>

				<ActionCard title="AdPushup Reports">
					<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
						<NavItem eventKey={1}>{REPORTS_NAV_ITEMS_VALUES.ACCOUNT}</NavItem>
						<NavItem eventKey={2}>{REPORTS_NAV_ITEMS_VALUES.SITE}</NavItem>
					</Nav>
					{this.renderContent()}
				</ActionCard>
			</Fragment>
		);
	}
}

export default Panel;
