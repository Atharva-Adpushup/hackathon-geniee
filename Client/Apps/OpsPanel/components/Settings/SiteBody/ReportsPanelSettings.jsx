/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import pullAll from 'lodash/pullAll';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import PeerPerformance from './PeerPerformance';
import reportService from '../../../../../services/reportService';

class ReportsPanelSettings extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const {
			showUniqueImpressionsReporting = false,
			sessionRpmReports = false,
			mcm = {},
			peerPerformanceAnalysis = false,
			peerPerformanceAnalysisSites = [],
			useGAAnalyticsForReporting = false
		} = user;
		const { isMcmEnabled = false, childPublisherId = '' } = mcm;

		this.state = {
			showUniqueImpressionsReporting,
			loading: false,
			sessionRpmReports,
			isMcmEnabled,
			childPublisherId,
			peerPerformanceAnalysis,
			peerPerformanceAnalysisSites,
			useGAAnalyticsForReporting
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	componentDidMount() {
		const {
			globalDataFetched,
			fetchPeerPerformanceBlockedSite,
			peerPerformanceBlockedSitesFetched
		} = this.props;
		if (!globalDataFetched) {
			const params = { sites: '', isSuperUser: true };
			reportService.getMetaData(params).then(responseData => {
				const { data: metaData } = responseData;
				this.setReportingMetaData(metaData);
			});
		}
		if (!peerPerformanceBlockedSitesFetched) {
			fetchPeerPerformanceBlockedSite();
		}
	}

	setReportingMetaData = metaData => {
		const { updateGlobalReportMetaData } = this.props;
		updateGlobalReportMetaData(metaData);
	};

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const {
			showUniqueImpressionsReporting,
			sessionRpmReports,
			childPublisherId,
			isMcmEnabled,
			peerPerformanceAnalysisSites,
			peerPerformanceAnalysis,
			useGAAnalyticsForReporting
		} = this.state;
		const { updateUser, customProps, showNotification } = this.props;
		if (isMcmEnabled && childPublisherId === '') {
			return showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Please enter the Child Publisher Id to Save',
				autoDismiss: 5
			});
		}

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: ''
		};

		this.setState({ loading: true });

		return updateUser(
			[
				{
					key: 'showUniqueImpressionsReporting',
					value: showUniqueImpressionsReporting
				},
				{
					key: 'sessionRpmReports',
					value: sessionRpmReports
				},
				{
					key: 'mcm',
					value: {
						isMcmEnabled,
						childPublisherId
					}
				},
				{
					key: 'peerPerformanceAnalysis',
					value: peerPerformanceAnalysis
				},
				{
					key: 'peerPerformanceAnalysisSites',
					value: peerPerformanceAnalysisSites
				},
				{
					key: 'useGAAnalyticsForReporting',
					value: useGAAnalyticsForReporting
				}
			],
			dataForAuditLogs
		).then(() =>
			this.setState({
				loading: false
			})
		);
	};

	getPeerPerformanceOptions = () => {
		const { allActiveSites, peerPerformanceBlockedSites } = this.props;
		const { peerPerformanceAnalysisSites } = this.state;
		//creating map for all selected sites
		const peerSelectedSiteIdsMap = peerPerformanceAnalysisSites.reduce((sitesMap, site) => {
			sitesMap[site.value] = true;
			return sitesMap;
		}, {});
		const siteIdsKeys = Object.keys(allActiveSites);
		//Removing blocked sites from options
		const filteredSiteIds = pullAll(
			siteIdsKeys,
			peerPerformanceBlockedSites.map(site => site.toString())
		);
		const options = filteredSiteIds.reduce((allResult, siteId) => {
			const siteObj = allActiveSites[siteId];
			const { siteName = '' } = siteObj || {};
			const value = {
				label: siteName,
				value: siteId
			};
			if (peerSelectedSiteIdsMap[siteId]) allResult.unshift(value);
			else allResult.push(value);
			return allResult;
		}, []);
		return options;
	};

	getPeerPerformanceSelected = () => {
		const { peerPerformanceBlockedSites } = this.props;
		const blockedSitesMap = peerPerformanceBlockedSites.reduce((acc, curr) => {
			acc[curr] = true;
			return acc;
		}, {});
		const { peerPerformanceAnalysisSites } = this.state;
		const peerPerformanceSitesExcludingBlocked = peerPerformanceAnalysisSites.filter(site => {
			const { value } = site;
			return !blockedSitesMap[value];
		});
		return peerPerformanceSitesExcludingBlocked;
	};

	handlePeerSelect = selected => {
		this.setState({ peerPerformanceAnalysisSites: selected });
	};

	render() {
		const {
			loading,
			showUniqueImpressionsReporting,
			sessionRpmReports,
			isMcmEnabled,
			childPublisherId,
			peerPerformanceAnalysis,
			useGAAnalyticsForReporting
		} = this.state;

		const { globalDataFetched, peerPerformanceBlockedSitesFetched } = this.props;

		const { handlePeerSelect, getPeerPerformanceOptions, getPeerPerformanceSelected } = this;

		return (
			<div className="showUniqueImpressionsReporting">
				<CustomToggleSwitch
					labelText="Show Unique Impressions Reporting"
					className="u-margin-t4 u-margin-b4 negative-toggle u-cursor-pointer"
					checked={showUniqueImpressionsReporting}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="showUniqueImpressionsReporting"
					id="js-showUniqueImpressionsReporting"
				/>
				<CustomToggleSwitch
					labelText="Use GA Page Views For Reporting"
					className="u-margin-t4 u-margin-b4 negative-toggle u-cursor-pointer"
					checked={useGAAnalyticsForReporting}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="useGAAnalyticsForReporting"
					id="js-useGAAnalyticsForReporting"
				/>
				<CustomToggleSwitch
					labelText="Session RPM Reports"
					className="u-margin-b4 negative-toggle u-cursor-pointer"
					checked={sessionRpmReports}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="sessionRpmReports"
					id="js-sessionRpmReports"
				/>
				<CustomToggleSwitch
					labelText="Enable MCM"
					className="u-margin-b4 negative-toggle u-cursor-pointer"
					checked={isMcmEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="isMcmEnabled"
					id="js-isMcmEnabled"
				/>
				<FieldGroup
					name="childPublisherId"
					value={childPublisherId}
					type="text"
					label="Child Publisher ID"
					onChange={this.handleChange}
					size={6}
					id="childPublisherId-input"
					placeholder="Child Publisher ID"
					className="u-padding-v4 u-padding-h4"
					disabled={!isMcmEnabled && true}
				/>
				<CustomToggleSwitch
					labelText="Peer Performance Analysis"
					className="u-margin-b4 negative-toggle u-cursor-pointer"
					checked={peerPerformanceAnalysis}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="peerPerformanceAnalysis"
					id="js-peerPerformanceAnalysis"
				/>
				{peerPerformanceAnalysis && (
					<PeerPerformance
						options={getPeerPerformanceOptions()}
						selected={getPeerPerformanceSelected()}
						handlePeerSelect={handlePeerSelect}
						isLoaded={globalDataFetched && peerPerformanceBlockedSitesFetched}
					/>
				)}
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
					showSpinner={loading}
				>
					Save
				</CustomButton>
			</div>
		);
	}
}

export default ReportsPanelSettings;
