import React from 'react';
import { Panel, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle,
	faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import Card from '../../../Components/Layout/Card';
import {
	SITE_SETUP_STATUS,
	domanize,
	LAST_ONBOARDING_STEP,
	FIRST_ONBOARDING_STEP
} from '../constants/index';

library.add(
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle,
	faSpinner
);

class MySites extends React.Component {
	componentDidMount() {
		const ref = this;
		const { sites, fetchAppStatuses } = ref.props;
		const isSites = !!(sites && Object.keys(sites).length);

		if (!isSites) {
			return false;
		}

		Object.keys(sites).forEach(siteIdKey => {
			const site = sites[siteIdKey];
			const isValidAppStatusInReportData = ref.checkValidAppStatusInReportData(siteIdKey);
			const isAppStatuses = ref.checkSiteAppStatuses(site);
			const siteStep = !site.step ? FIRST_ONBOARDING_STEP : site.step;
			const isStepOnboardingComplete = !!(siteStep >= 3);
			const shouldFetchAppStatuses = ref.shouldFetchSiteAppStatuses(
				isStepOnboardingComplete,
				isValidAppStatusInReportData,
				isAppStatuses
			);

			if (shouldFetchAppStatuses) {
				fetchAppStatuses(siteIdKey);
			}
		});

		return false;
	}

	checkSiteAppStatuses = siteModel => !!siteModel.appStatuses;

	shouldFetchSiteAppStatuses = (
		isOnboardingComplete,
		isValidAppStatusInReportData,
		isSiteAppStatuses
	) => !!(isOnboardingComplete && !isValidAppStatusInReportData && !isSiteAppStatuses);

	checkValidAppStatusInReportData(siteId) {
		const { reportSites } = this.props;
		const isReportData = !!(reportSites && Object.keys(reportSites).length);
		const isValidAppStatusInReportData = !!(
			isReportData &&
			reportSites[siteId] &&
			reportSites[siteId].product &&
			Object.values(reportSites[siteId].product) &&
			Object.values(reportSites[siteId].product).length &&
			Object.values(reportSites[siteId].product).find(status => status > 0)
		);

		return isValidAppStatusInReportData;
	}

	renderStatusCards() {
		const ref = this;
		const { sites } = ref.props;
		const isSites = !!(sites && Object.keys(sites).length);
		const computedCards = isSites
			? Object.keys(sites).map(siteIdKey => {
					const site = sites[siteIdKey];
					let siteStep = !site.step ? FIRST_ONBOARDING_STEP : site.step;
					const isAppStatuses = ref.checkSiteAppStatuses(site);
					const isValidAppStatuses = !!(isAppStatuses && Object.keys(site.appStatuses).length > 0);
					const isValidAppStatusInReportData = ref.checkValidAppStatusInReportData(siteIdKey);
					const isStepOnboardingComplete = !!(siteStep >= 3);
					const isUserOnBoardingComplete = !!(
						isStepOnboardingComplete &&
						(isValidAppStatuses || isValidAppStatusInReportData)
					);
					const isStepLastOnboarding = !!(siteStep >= LAST_ONBOARDING_STEP);

					siteStep =
						isStepLastOnboarding || isUserOnBoardingComplete ? LAST_ONBOARDING_STEP : siteStep;

					const showSiteStatusLoader = ref.shouldFetchSiteAppStatuses(
						isStepOnboardingComplete,
						isValidAppStatusInReportData,
						isAppStatuses
					);
					const { siteId } = site;
					const statusObject = SITE_SETUP_STATUS[siteStep];
					const domanizeDomain = domanize(site.domain);
					const computedReportingUrl = `/reports/${siteId}`;
					const computedManageSiteUrl = `/sites/${siteId}`;
					const isSiteBlock = !!(statusObject.site && Object.keys(statusObject.site).length);
					const computedRootClassName = `u-margin-r4 u-margin-b4`;

					const computedOnboardingBlock = () => (
						<Panel className="panel--transparent u-margin-b4">
							<Panel.Heading className="u-margin-0 u-padding-0">Onboarding status</Panel.Heading>
							<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
								<div className="aligner aligner--row">
									<span className="aligner-item">
										<FontAwesomeIcon icon={statusObject.onboarding.icon} className="u-margin-r2" />
										{statusObject.onboarding.text}
									</span>
									{!statusObject.onboarding.isComplete ? (
										<Link
											to={statusObject.onboarding.link.replace('__SITEID__', siteId)}
											className=""
										>
											{statusObject.onboarding.linkText}
										</Link>
									) : null}
								</div>
							</Panel.Body>
						</Panel>
					);
					const computedSiteStatusText = showSiteStatusLoader ? (
						<span className="aligner-item">
							<FontAwesomeIcon icon="spinner" spin className="u-margin-r2" />
							Loading data...
						</span>
					) : (
						<span className="aligner-item">
							<FontAwesomeIcon icon={statusObject.site.icon} className="u-margin-r2" />
							{statusObject.site.text}
						</span>
					);
					let computedSiteStatusLink =
						isSiteBlock && !statusObject.site.isComplete ? (
							<Link to={statusObject.site.link.replace('__SITEID__', siteId)} className="">
								{statusObject.site.linkText}
							</Link>
						) : null;
					computedSiteStatusLink = showSiteStatusLoader ? null : computedSiteStatusLink;

					const computeSiteBlock = () =>
						isSiteBlock ? (
							<Panel className="panel--transparent u-margin-b3">
								<Panel.Heading className="u-margin-0 u-padding-0">Site status</Panel.Heading>
								<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
									<div className="aligner aligner--row">
										<span className="aligner-item">{computedSiteStatusText}</span>
										{computedSiteStatusLink}
									</div>
								</Panel.Body>
							</Panel>
						) : null;
					const computeCardBody = () => (
						<React.Fragment>
							{computedOnboardingBlock()}
							{computeSiteBlock()}
						</React.Fragment>
					);

					return (
						<Card
							rootClassName={computedRootClassName}
							key={`card-${siteId}`}
							type={statusObject.type}
							headerClassName="card-header"
							headerChildren={
								<div className="aligner aligner--row">
									<span className="aligner-item card-header-title">{domanizeDomain}</span>
									<OverlayTooltip
										id="tooltip-site-status-info"
										placement="top"
										tooltip={statusObject.tooltipText}
									>
										<FontAwesomeIcon
											icon={statusObject.icon}
											className="aligner aligner-item aligner--hCenter card-header-icon"
										/>
									</OverlayTooltip>
								</div>
							}
							bodyClassName="card-body"
							bodyChildren={computeCardBody()}
							footerClassName="card-footer u-padding-0"
							footerChildren={
								<div className="aligner aligner--row">
									<Link to={computedReportingUrl} className="u-link-reset aligner aligner-item">
										<Button className="aligner-item aligner aligner--hStart aligner--vCenter">
											View Reports
											<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
										</Button>
									</Link>
									<Link to={computedManageSiteUrl} className="u-link-reset aligner aligner-item">
										<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
											Manage Site
											<FontAwesomeIcon icon="cog" className="u-margin-l2" />
										</Button>
									</Link>
								</div>
							}
						/>
					);
			  })
			: null;

		return computedCards;
	}

	render() {
		return (
			<ActionCard title="My Sites">
				<div className="u-padding-h4 u-padding-v5 aligner aligner--row aligner--wrap">
					{this.renderStatusCards()}

					<Link to="/addSite" className="aligner card-wrapper u-link-reset u-margin-b4">
						<div className="card card--theme-dotted aligner aligner--vCenter aligner--hCenter u-cursor-pointer">
							<div className="aligner aligner--column aligner--vCenter aligner--hCenter">
								<FontAwesomeIcon size="2x" icon="plus-circle" className="u-margin-b3" />
								<span>ADD NEW SITE</span>
							</div>
						</div>
					</Link>
				</div>
			</ActionCard>
		);
	}
}

export default MySites;
