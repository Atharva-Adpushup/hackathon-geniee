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
import OnboardingCard from '../../../Components/OnboardingCard';
import CustomButton from '../../../Components/CustomButton';

import {
	SITE_SETUP_STATUS,
	domanize,
	ADPUSHUP_RUNNING_SUCCESSFULLY_STEP,
	FIRST_ONBOARDING_STEP,
	USER_ONBOARDING_COMPLETE_STEP
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
	constructor(props) {
		super(props);
		const sites = this.getValidSites(props);
		this.state = { sites };
	}

	componentDidMount() {
		const ref = this;
		const { sites } = this.state;
		const { fetchAppStatuses } = ref.props;
		const isSites = ref.getValidObject(sites);

		if (!isSites) {
			return false;
		}

		Object.keys(sites).forEach(siteIdKey => {
			const site = sites[siteIdKey];
			const isValidAppStatusInReportData = ref.checkValidAppStatusInReportData(siteIdKey);
			const isAppStatuses = ref.checkSiteAppStatuses(site);
			const siteStep = !site.step ? FIRST_ONBOARDING_STEP : site.step;
			const isStepOnboardingComplete = ref.checkSiteStepOnboardingComplete(siteStep);
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

	componentWillReceiveProps(props) {
		const sites = this.getValidSites(props);
		this.setState({ sites });
	}

	checkSiteStepOnboardingComplete = step => !!(Number(step) === USER_ONBOARDING_COMPLETE_STEP);

	checkSiteAppStatuses = siteModel => !!siteModel.appStatuses;

	shouldHideActivateAppsLink = (
		isSuperUser,
		isStepOnboardingComplete,
		isAppStatuses,
		isValidAppStatusInReportData
	) =>
		!!(!isSuperUser && isStepOnboardingComplete && isAppStatuses && !isValidAppStatusInReportData);

	getValidObject = obj => !!(obj && Object.keys(obj).length);

	getValidSites = props => {
		const { sites, globalSites } = props || this.props;
		const resultObj = {};
		const isValidUserSites = this.getValidObject(sites);
		const isValidGlobalSites = this.getValidObject(globalSites);
		const isInvalidSites = !!(!isValidUserSites && !isValidGlobalSites);

		if (isInvalidSites) {
			return resultObj;
		}

		Object.keys(sites).forEach(siteIdKey => {
			const isValidSite = !!(sites[siteIdKey] && globalSites[siteIdKey]);

			if (!isValidSite) {
				return true;
			}

			resultObj[siteIdKey] = { ...sites[siteIdKey] };
			return false;
		});

		return resultObj;
	};

	shouldFetchSiteAppStatuses = (
		isOnboardingComplete,
		isValidAppStatusInReportData,
		isSiteAppStatuses
	) => !!(isOnboardingComplete && !isValidAppStatusInReportData && !isSiteAppStatuses);

	checkValidAppStatusInReportData(siteId) {
		const { reportSites } = this.props;
		const isReportData = this.getValidObject(reportSites);
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
		const { isSuperUser } = ref.props;
		const { sites } = ref.state;
		const isSites = ref.getValidObject(sites);
		const computedCards = isSites
			? Object.keys(sites).map(siteIdKey => {
					const site = sites[siteIdKey];
					let siteStep = !site.step ? FIRST_ONBOARDING_STEP : site.step;
					const isAppStatuses = ref.checkSiteAppStatuses(site);
					const isValidAppStatuses = !!(isAppStatuses && ref.getValidObject(site.appStatuses));
					const isValidAppStatusInReportData = ref.checkValidAppStatusInReportData(siteIdKey);
					const isStepOnboardingComplete = ref.checkSiteStepOnboardingComplete(siteStep);
					const isUserOnBoardingComplete = !!(
						isStepOnboardingComplete &&
						(isValidAppStatuses || isValidAppStatusInReportData)
					);
					const isStepAdPushupRunningSuccessfully = !!(
						siteStep >= ADPUSHUP_RUNNING_SUCCESSFULLY_STEP
					);

					siteStep =
						isStepAdPushupRunningSuccessfully || isUserOnBoardingComplete
							? ADPUSHUP_RUNNING_SUCCESSFULLY_STEP
							: siteStep;

					const showSiteStatusLoader = ref.shouldFetchSiteAppStatuses(
						isStepOnboardingComplete,
						isValidAppStatusInReportData,
						isAppStatuses
					);
					// NOTE: This check is added since 'Manage Apps' component is only visible to superuser so
					// a link to it should only be visible to superuser
					// TODO: Remove this variable and its usage logic once 'Manage Apps' component is released
					const shouldHideActivateAppsLink = ref.shouldHideActivateAppsLink(
						isSuperUser,
						isStepOnboardingComplete,
						isAppStatuses,
						isValidAppStatusInReportData
					);

					const { siteId } = site;
					const statusObject = SITE_SETUP_STATUS[siteStep];
					const domanizeDomain = domanize(site.domain);
					const computedReportingUrl = `/reports/${siteId}`;
					const computedManageSiteUrl = `/sites/${siteId}`;
					const isSiteBlock = ref.getValidObject(statusObject.site);
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
					computedSiteStatusLink =
						showSiteStatusLoader || shouldHideActivateAppsLink ? null : computedSiteStatusLink;

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

	renderAddNewSiteCard = () => (
		<Link to="/addSite" className="aligner card-wrapper u-link-reset u-margin-b4">
			<div className="card card--theme-dotted aligner aligner--vCenter aligner--hCenter u-cursor-pointer">
				<div className="aligner aligner--column aligner--vCenter aligner--hCenter">
					<FontAwesomeIcon size="2x" icon="plus-circle" className="u-margin-b3" />
					<span>ADD NEW SITE</span>
				</div>
			</div>
		</Link>
	);

	renderOnboardingCard() {
		const { sites } = this.props;
		const site = sites[Object.keys(sites)[0]];
		const computedLinkUrl = `/onboarding?siteId=${site.siteId}`;
		const computedButtonText = `Continue with ${site.domain}`;

		return (
			<OnboardingCard
				className="add-site-card"
				isActiveStep
				expanded
				count={1}
				imgPath="/assets/images/ob_add_site.png"
				heading="Complete Onboarding Setup"
				description="Please complete your site onboarding setup by clicking below."
			>
				<Link to={computedLinkUrl} className="u-link-reset u-margin-t4 aligner aligner-item">
					<CustomButton>{computedButtonText}</CustomButton>
				</Link>
			</OnboardingCard>
		);
	}

	render() {
		const { sites } = this.state;
		const isValidUserSites = this.getValidObject(sites);
		let computedRootFlexboxClasses = isValidUserSites
			? 'aligner aligner--row aligner--wrap'
			: 'aligner aligner--vCenter aligner--hCenter';
		computedRootFlexboxClasses = `u-padding-h4 u-padding-v5 my-sites-wrapper ${computedRootFlexboxClasses}`;

		return (
			<ActionCard title="My Sites">
				<div className={computedRootFlexboxClasses}>
					{isValidUserSites ? this.renderStatusCards() : this.renderOnboardingCard()}
					{isValidUserSites ? this.renderAddNewSiteCard() : null}
				</div>
			</ActionCard>
		);
	}
}

export default MySites;
