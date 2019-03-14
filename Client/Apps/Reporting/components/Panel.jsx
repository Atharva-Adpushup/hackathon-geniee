import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem, Row, Col } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import Control from './Control';
import moment from 'moment';
import {
	REPORTS_NAV_ITEMS,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES
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
			selectedDimensions: [{}],
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
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
	}
	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};
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
	renderContent = () => {
		let {
			reportLoading,
			productList,
			dimensionList,
			filterList,
			intervalsList,
			startDate,
			endDate,
			chartConfig,
			tableConfig,
			selectedDimensions,
			selectedFilters,
			selectedMetrics,
			selectedInterval,
			activeProductDetails
		} = this.state;
		return (
			<Row>
				<Col sm={12}>
					<Control
						startDate={startDate}
						endDate={endDate}
						dimensionList={dimensionList}
						filterList={filterList}
						generateButtonHandler={this.generateButtonHandler}
						selectedDimensions={selectedDimensions}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = REPORTS_NAV_ITEMS[activeTab];
		console.log(activeTab, activeItem);
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
