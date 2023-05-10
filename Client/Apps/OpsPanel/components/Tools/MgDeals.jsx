import React, { Component } from 'react';
import { Col, Row } from '@/Client/helpers/react-bootstrap-imports';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '../../../../Components/Loader';
import SelectBox from '../../../../Components/SelectBox';

import axiosInstance from '../../../../helpers/axiosInstance';
import CustomReactTable from '../../../../Components/CustomReactTable';
import CustomButton from '../../../../Components/CustomButton';
import { MG_DEALS_COLUMNS, ALL_MONTHS_NAME } from '../../configs/commonConsts';
import { MG_TYPES, MG_START_YEAR } from '../../../../Pages/Payment/configs/commonConsts';

class MgDeals extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isProcessing: false
		};
	}

	calculateMgRevenue = (mgType, mgDealValue, accountLevelData = {}) => {
		let revenue = 0;
		const { networkImpressions, pageViews } = accountLevelData;

		switch (mgType) {
			case MG_TYPES.REVENUE:
				revenue = mgDealValue;
				break;
			case MG_TYPES.PAGE_RPM:
				revenue = (mgDealValue * pageViews) / 1000;
				break;
			case MG_TYPES.ECPM:
				revenue = (mgDealValue * networkImpressions) / 1000;
				break;
			default:
				break;
		}

		return Number(revenue);
	};

	accountLevelDataProcessing = (mgDeal, allSiteLevelData) => {
		const { email, value: mgDealValue, year, quarter, mgType } = mgDeal;

		const accountLevelData = {
			email,
			mgType,
			mgDealValue,
			year,
			activeQuarter: quarter,
			netRevenue: 0,
			grossRevenue: 0,
			networkImpressions: 0,
			pageViews: 0,
			accountSiteIds: []
		};

		allSiteLevelData.forEach(siteLevelData => {
			const {
				network_net_revenue: netRevenue,
				network_gross_revenue: grossRevenue,
				network_impressions: networkImpressions,
				adpushup_page_views: pageViews,
				siteid: siteId
			} = siteLevelData;

			accountLevelData.accountSiteIds.push(siteId);
			accountLevelData.netRevenue += netRevenue;
			accountLevelData.grossRevenue += grossRevenue;
			accountLevelData.networkImpressions += networkImpressions;
			accountLevelData.pageViews += pageViews;
		});

		const mgDealRevenue = this.calculateMgRevenue(mgType, mgDealValue, accountLevelData);

		accountLevelData.mgDealRevenue = mgDealRevenue;
		return accountLevelData;
	};

	processData = (mgDetails, reportingData) => {
		const { siteEmailMapping } = this.state;

		const allAccountsData = [];

		const { result: reportingResult = [] } = reportingData;

		// Map email ids to all the reporting data
		reportingResult.forEach(reportingResultRow => {
			const { siteid: siteId } = reportingResultRow;
			// eslint-disable-next-line no-param-reassign
			reportingResultRow.email = siteEmailMapping[siteId];
		});

		mgDetails.forEach(mgDeal => {
			const { email } = mgDeal;
			// Get all site lvl data
			const allSiteLevelData = reportingResult.filter(mapping => mapping.email === email);
			// Account level processing data
			const accountLevelData = this.accountLevelDataProcessing(mgDeal, allSiteLevelData);
			allAccountsData.push(accountLevelData);
		});

		return allAccountsData;
	};

	componentDidMount = () => {
		const { emailSitesMapping = [] } = this.props;
		const siteEmailMapping = {};
		emailSitesMapping.forEach(mapping => {
			const { siteIds = [], email } = mapping;
			siteIds.forEach(siteId => {
				siteEmailMapping[siteId] = email;
			});
		});
		this.setState({ siteEmailMapping });
	};

	manipulateDataToDisplay = allAccountsData => {
		// Manipulating account level data for display
		allAccountsData.forEach(accountsData => {
			/* eslint-disable no-param-reassign */
			accountsData.accountSiteIds = accountsData.accountSiteIds.join();
			accountsData.netRevenue = accountsData.netRevenue.toFixed(2);
			accountsData.grossRevenue = accountsData.grossRevenue.toFixed(2);
			accountsData.networkImpressions = accountsData.networkImpressions.toFixed(2);
			accountsData.mgDealRevenue = accountsData.mgDealRevenue.toFixed(2);
		});
	};

	makeExportCsvData = allMgAccountsData => {
		const csvFormattedData = [];

		allMgAccountsData.forEach(mgAccountData => {
			const {
				email,
				mgType,
				mgDealValue,
				accountSiteIds,
				netRevenue,
				grossRevenue,
				networkImpressions,
				mgDealRevenue
			} = mgAccountData;

			const formattedAccountData = {
				Email: email,
				'Mg Type': mgType,
				'Mg Value ($)': mgDealValue,
				'Account Site Ids': accountSiteIds,
				'Net Revenue ($)': netRevenue,
				'Gross Revenue ($)': grossRevenue,
				Impressions: networkImpressions,
				'MG Expected Revenue ($)': mgDealRevenue
			};

			csvFormattedData.push(formattedAccountData);
		});

		this.setState({ mgDealCsvData: csvFormattedData });
	};

	handleSubmit = () => {
		this.setState({ isProcessing: true });

		const { selectedMonth, selectedYear } = this.state;

		let month = selectedMonth + 1;
		month = month < 10 ? `0${month}` : month;
		const year = selectedYear;

		axiosInstance
			.get(`/payment/getAllMgDeals`, { params: { month, year } })
			.then(response => {
				const { data: responseData } = response;
				const { data: mgDealsData } = responseData;
				const { allAccountsMgDetails, reportingData } = mgDealsData;
				const allAccountsData = this.processData(allAccountsMgDetails, reportingData);
				this.manipulateDataToDisplay(allAccountsData);
				this.makeExportCsvData(allAccountsData);
				this.setState({ isProcessing: false, selectedDurationDealsData: allAccountsData });
			})
			.catch(() => {
				this.setState({ isProcessing: false });
			});
	};

	handleSelectMonth = selectedMonth => {
		this.setState({ selectedMonth });
	};

	handleSelectYear = selectedYear => {
		this.setState({ selectedYear });
	};

	getYearsDropdownValues = () => {
		const startYear = MG_START_YEAR; // Setting MG Deals start year to 2022
		const currentYear = new Date().getFullYear();
		const yearsMapping = [];
		for (let year = startYear; year <= currentYear; year += 1) {
			const yearObj = { name: year, value: year };
			yearsMapping.push(yearObj);
		}
		return yearsMapping;
	};

	getMonthDropdownValues = () => {
		const monthsOptions = ALL_MONTHS_NAME.map((key, index) => ({
			name: key,
			value: index
		}));

		return monthsOptions;
	};

	render() {
		const {
			isProcessing = true,
			selectedMonth,
			selectedYear,
			selectedDurationDealsData = [],
			mgDealCsvData = []
		} = this.state;

		if (isProcessing) {
			return <Loader />;
		}

		const monthsOptions = this.getMonthDropdownValues();
		const yearOptions = this.getYearsDropdownValues();

		return (
			<>
				<Row>
					<Col sm={6}>
						<SelectBox
							selected={selectedMonth}
							options={monthsOptions}
							onSelect={this.handleSelectMonth}
							id="mgdeals-select-month"
							title="Select Month"
						/>
					</Col>

					<Col sm={6}>
						<SelectBox
							selected={selectedYear}
							options={yearOptions}
							onSelect={this.handleSelectYear}
							id="mgdeals-select-year"
							title="Select Year"
						/>
					</Col>
				</Row>
				<Row style={{ margin: '10px 0' }}>
					<CustomButton
						variant="primary"
						className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3 "
						onClick={this.handleSubmit}
					>
						Generate MG Deals Data
					</CustomButton>
				</Row>

				<div>
					<CustomReactTable
						data={selectedDurationDealsData}
						columns={MG_DEALS_COLUMNS}
						showPaginationTop
						showPaginationBottom
						minRows={3}
					/>
				</div>

				{!mgDealCsvData.length ? (
					<></>
				) : (
					<Row>
						<CSVLink data={mgDealCsvData} filename={`mgDeals_${selectedMonth}_${selectedYear}.csv`}>
							<CustomButton
								variant="primary"
								className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3  "
							>
								<FontAwesomeIcon size="1x" icon="download" className="u-margin-r3" />
								Export MG Deals Data
							</CustomButton>
						</CSVLink>
					</Row>
				)}
			</>
		);
	}
}

export default MgDeals;
