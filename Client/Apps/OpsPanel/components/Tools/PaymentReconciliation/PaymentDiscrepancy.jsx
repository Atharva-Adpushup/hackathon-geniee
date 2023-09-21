import React, { Component } from 'react';
import { Col, Row, FormControl } from '@/Client/helpers/react-bootstrap-imports';
import Papa from 'papaparse';
import _ from 'lodash';

import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	MG_TYPES,
	DISCREPANCY_START_YEAR
} from '../../../../../Pages/Payment/configs/commonConsts';
import {
	ALL_MONTHS_NAME,
	DISCREPANCY_TABLE_COLUMNS,
	PAYMENT_DISCREPANCY_CSV_PROPERTIES
} from '../../../configs/commonConsts';
import SelectBox from '../../../../../Components/SelectBox';
import CustomButton from '../../../../../Components/CustomButton';
import axiosInstance from '../../../../../helpers/axiosInstance';
import Loader from '../../../../../Components/Loader';
import GoogleOAuthLogin from '../../../../../Components/GoogleOAuthLogin';
import CustomReactTable from '../../../../../Components/CustomReactTable';
import { domanize } from '../../../../../helpers/commonFunctions';
import { DEMO_ACCOUNT_DATA } from '../../../../../constants/others';

class PaymentDiscrepancy extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isProcessing: false,
			selectedDurationDiscrepancyData: [],
			selectedDurationCsvDiscrepancyData: []
		};
	}

	handleSelectMonth = selectedMonth => {
		this.setState({ selectedMonth });
	};

	handleSelectYear = selectedYear => {
		this.setState({ selectedYear });
	};

	getYearsDropdownValues = () => {
		const startYear = DISCREPANCY_START_YEAR; // Setting MG Deals start year to 2022
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

	convertToFormat = number => number && Number(number.toFixed(2));

	getMgRevenue = ({ mgValue, pageViews, impressions, uniqueImpressions, mgType }) => {
		let revenue = 0;

		switch (mgType) {
			case MG_TYPES.REVENUE:
				revenue = mgValue;
				break;
			case MG_TYPES.PAGE_RPM:
				revenue = (mgValue * pageViews) / 1000;
				break;
			case MG_TYPES.ECPM:
				revenue = (mgValue * impressions) / 1000;
				break;
			case MG_TYPES.UNIQUE_ECPM:
				revenue = (mgValue * uniqueImpressions) / 1000;
			default:
				break;
		}

		return Number(revenue);
	};

	updateMgDetails = (siteMgDeal, siteLevelMetrics) => {
		if (!siteMgDeal) {
			return {};
		}
		const { parterWiseRevenue, pageViews, impressions, uniqueImpressions } = siteLevelMetrics;

		const { mgValue, mgType } = siteMgDeal;

		const mgRevenue = this.getMgRevenue({
			mgValue,
			pageViews,
			impressions,
			uniqueImpressions,
			mgType
		});

		const mgVsPartnerDifference = this.convertToFormat(mgRevenue - parterWiseRevenue);
		const mgVsPartnerDifferencePercentage = this.convertToFormat(
			((mgRevenue - parterWiseRevenue) / parterWiseRevenue) * 100
		);
		return {
			mgValue,
			mgType,
			mgRevenue,
			mgVsPartnerDifference,
			mgVsPartnerDifferencePercentage
		};
	};

	calculateDiscrepancy = discrepancyData => {
		const { siteWiseRevenueData, mgDeals } = discrepancyData;
		const { siteLevelPartnerPanelData } = this.state;

		const siteEmailMapping = this.mapSiteEmailMapping();

		const allUniqueSiteIds = Array.from(
			new Set([...Object.keys(siteWiseRevenueData), ...Object.keys(siteLevelPartnerPanelData)])
		);

		let calculatedDiscrepancyData = [];
		try {
			calculatedDiscrepancyData = allUniqueSiteIds.map(siteId => {
				const emailMapping = siteEmailMapping[siteId];

				const siteLevelObject = emailMapping || {};
				const consoleRevenueObj = siteWiseRevenueData[siteId] || {};
				const parterWiseRevenue = siteLevelPartnerPanelData[siteId] || 0;

				const {
					grossRevenue,
					netRevenue,
					pageViews,
					impressions,
					uniqueImpressions,
					tagBasedRevenue
				} = consoleRevenueObj;

				if (!siteLevelObject.siteId) {
					siteLevelObject.siteId = siteId;
					siteLevelObject.domain = 'Site Domain Not Found';
				} else {
					siteLevelObject.domain = domanize(siteLevelObject.domain);
				}

				const consoleGrossRevenue = this.convertToFormat(grossRevenue);
				const consoleNetRevenue = this.convertToFormat(netRevenue);
				const partnerRevenue = this.convertToFormat(parterWiseRevenue);
				const tagBasedRevenueFormatted = this.convertToFormat(tagBasedRevenue);
				const consoleVsPartnerDifference = this.convertToFormat(
					consoleGrossRevenue - parterWiseRevenue
				);

				const weightedRevenueShare =
					((consoleGrossRevenue - consoleNetRevenue) / consoleGrossRevenue) * 100;
				const formattedWeightedRevShare = weightedRevenueShare.toFixed(1);

				const consoleVsPartnerDifferencePercentage = this.convertToFormat(
					((consoleGrossRevenue - parterWiseRevenue) / parterWiseRevenue) * 100
				);

				const siteMgDeal = mgDeals.find(mgDeal => Number(mgDeal.siteId) === Number(siteId));

				const mgDiscrepancyData = this.updateMgDetails(siteMgDeal, {
					parterWiseRevenue,
					pageViews,
					impressions,
					uniqueImpressions
				});

				return {
					...siteLevelObject,
					consoleGrossRevenue,
					weightedRevenueShare: formattedWeightedRevShare,
					partnerRevenue,
					consoleVsPartnerDifference,
					consoleVsPartnerDifferencePercentage,
					tagBasedRevenue: tagBasedRevenueFormatted,
					...mgDiscrepancyData
				};
			});

			this.formatDataForCsv(calculatedDiscrepancyData);
			return calculatedDiscrepancyData;
		} catch (e) {
			// Show error notification
			const { showNotification } = this.props;

			showNotification({
				mode: 'error',
				title: 'Error',
				message: 'Something went wrong while calculating',
				autoDismiss: 5
			});
			return [];
		}
	};

	formatDataForCsv = discrepancyData => {
		const sortedDicrepancyDataByDomain = _.sortBy(discrepancyData, 'domain');

		const googleSheetHeaders = PAYMENT_DISCREPANCY_CSV_PROPERTIES.map(
			propertyObj => propertyObj.headerName
		);
		const googleSheetData = [];

		const csvData = sortedDicrepancyDataByDomain.map(discrepancyDataRow => {
			const csvObject = {};

			const googleSheetDataRow = [];

			PAYMENT_DISCREPANCY_CSV_PROPERTIES.forEach(propertyObj => {
				const { keyName, headerName } = propertyObj;
				const dataValue = discrepancyDataRow[keyName];
				googleSheetDataRow.push(dataValue);
				csvObject[headerName] = dataValue;
			});

			googleSheetData.push(googleSheetDataRow);

			return csvObject;
		});

		const googleSheetCsvData = [googleSheetHeaders, ...googleSheetData];

		// Sorting according to site domain
		this.setState({
			googleSheetCsvData,
			selectedDurationCsvDiscrepancyData: csvData
		});
	};

	processDiscrepancyReport = responseData => {
		const { data: discrepancyData } = responseData;

		const discrepancyTable = this.calculateDiscrepancy(discrepancyData);
		this.setState({ selectedDurationDiscrepancyData: discrepancyTable, isProcessing: false });
	};

	handleSubmit = () => {
		this.setState({ isProcessing: true });

		const { selectedMonth, selectedYear } = this.state;

		let month = selectedMonth + 1;
		month = month < 10 ? `0${month}` : month;
		const year = selectedYear;

		axiosInstance
			.get(`/payment/getPaymentDiscrepancy`, {
				params: {
					month,
					year
				}
			})
			.then(response => response.data)
			.then(this.processDiscrepancyReport)
			.catch(() => {
				const { showNotification } = this.props;
				showNotification({
					mode: 'error',
					title: 'Error',
					message: 'Something went wrong, Please check your form selection',
					autoDismiss: 5
				});
				this.setState({ isProcessing: false });
			});
	};

	getFormattedSiteId = siteId => {
		if (siteId === 'Nil') {
			return siteId;
		}
		return Number(siteId.replace(/,/g, ''));
	};

	manipulateCsvData = responses => {
		const { data: siteWiseParterWiseCsvData = [] } = responses;

		const slicedHeadersData = siteWiseParterWiseCsvData.splice(1);

		const parterWiseSiteWiseRevenueData = slicedHeadersData.map(siteWiseParterWiseCsvRow => {
			const [siteId, grossRevenue, netRevenue, partnerName] = siteWiseParterWiseCsvRow || [];
			const formattedGrossRevenue = grossRevenue.replace(/,/g, '');
			const formattedNetRevenue = netRevenue.replace(/,/g, '');
			const formattedSiteId = this.getFormattedSiteId(siteId);
			return {
				siteId: formattedSiteId,
				grossRevenue: formattedGrossRevenue,
				netRevenue: formattedNetRevenue,
				partnerName
			};
		});

		const siteLevelPartnerPanelData = parterWiseSiteWiseRevenueData.reduce((acc, currentData) => {
			const { siteId, grossRevenue } = currentData;
			if (!acc[siteId]) {
				acc[siteId] = 0;
			}
			acc[siteId] += Number(grossRevenue);
			return acc;
		}, {});

		this.setState({ siteLevelPartnerPanelData });
	};

	handleCsv = event => {
		const { files } = event.target;

		const file = files[0];

		Papa.parse(file, {
			delimiter: '',
			chunkSize: 3,
			header: false,
			complete: this.manipulateCsvData
		});
	};

	mapSiteEmailMapping = () => {
		const { emailSitesMapping = [] } = this.props;
		const siteEmailMapping = {};
		emailSitesMapping.forEach(mapping => {
			const { siteIds = [], domains = [], email, accountManagerEmail } = mapping;
			if (email === DEMO_ACCOUNT_DATA.EMAIL) {
				return;
			}
			siteIds.forEach((siteId, index) => {
				const domain = domains[index];
				siteEmailMapping[siteId] = { email, accountManagerEmail, siteId, domain };
			});
		});
		return siteEmailMapping;
	};

	render() {
		const {
			isProcessing = true,
			selectedMonth,
			selectedYear,
			selectedDurationDiscrepancyData = [],
			selectedDurationCsvDiscrepancyData = [],
			googleSheetCsvData = []
		} = this.state;

		const { emailSitesMapping = [] } = this.props;

		if (isProcessing || !emailSitesMapping.length) {
			return <Loader />;
		}

		const monthsOptions = this.getMonthDropdownValues();
		const yearOptions = this.getYearsDropdownValues();

		return (
			<>
				<>
					<Row style={{ margin: '15px 5px' }}>
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

					<Row style={{ margin: '15px 5px' }}>
						<Col sm={6}>Upload Partner Panel Site Wise Revenue Data CSV</Col>

						<Col sm={6}>
							<FormControl
								type="file"
								name="paymentDiscrepancy"
								onChange={this.handleCsv}
								id="paymentDiscrepancyCsvFile"
							/>
						</Col>
					</Row>

					<Row style={{ margin: '15px 5px' }}>
						<CustomButton
							variant="primary"
							className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3 "
							onClick={this.handleSubmit}
						>
							Generate Discrepancy Report
						</CustomButton>
					</Row>

					{!!selectedDurationCsvDiscrepancyData.length && (
						<Row>
							<GoogleOAuthLogin
								type="button"
								variant="secondary"
								className="pull-right gs-btn"
								showSpinner={false}
								csvData={googleSheetCsvData}
								selectedControlsForCSV={[]}
							>
								Export To Google Sheet
							</GoogleOAuthLogin>

							<CSVLink
								data={selectedDurationCsvDiscrepancyData}
								filename={`discrepancy_${selectedMonth}_${selectedYear}.csv`}
							>
								<CustomButton
									variant="primary"
									className="btn btn-lightBg btn-default btn-blue-line pull-left u-margin-r3  "
								>
									<FontAwesomeIcon size="1x" icon="download" className="u-margin-r3" />
									Export MG Deals Data
								</CustomButton>
							</CSVLink>
						</Row>
					)}

					<div>
						<CustomReactTable
							data={selectedDurationDiscrepancyData}
							columns={DISCREPANCY_TABLE_COLUMNS}
							showPaginationTop
							showPaginationBottom
							minRows={3}
						/>
					</div>
				</>
			</>
		);
	}
}

export default PaymentDiscrepancy;
