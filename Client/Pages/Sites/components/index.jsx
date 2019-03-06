import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import Card from '../../../Components/Layout/Card';
import { SITE_SETUP_STATUS, domanize, LAST_ONBOARDING_STEP } from '../constants/index';

library.add(
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle,
	faPlusCircle
);

class MySites extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	renderStatusCards() {
		const { sites } = this.props;
		const isSites = !!(sites && Object.keys(sites).length);
		const computedCards = isSites
			? Object.keys(sites).map(siteIdKey => {
					const site = sites[siteIdKey];
					let siteStep;

					if (!site.step) {
						siteStep = 0;
					} else {
						siteStep = site.step >= LAST_ONBOARDING_STEP ? LAST_ONBOARDING_STEP : site.step;
					}

					const isStepThird = !!(siteStep === 3);
					const { siteId } = site;
					const statusObject = SITE_SETUP_STATUS[siteStep];
					const domanizeDomain = domanize(site.domain);

					const computedReportingUrl = `/reporting/${siteId}`;
					const computedManageSiteUrl = `/sites/${siteId}`;
					const computedOnboardingUrl = `/onboarding?siteId=${siteId}`;

					const computedLinkText = isStepThird ? 'Activate Apps' : 'Complete Setup';
					const computedLinkUrl = isStepThird ? computedManageSiteUrl : computedOnboardingUrl;

					return (
						<Card
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
							bodyChildren={
								<Panel className="panel--transparent u-margin-b3">
									<Panel.Heading className="u-margin-0 u-padding-0">
										Onboarding status
									</Panel.Heading>
									<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
										<div className="aligner aligner--row">
											<span className="aligner-item">
												<FontAwesomeIcon icon={statusObject.icon} className="u-margin-r2" />
												{statusObject.text}
											</span>
											{!statusObject.isComplete ? (
												<Link to={computedLinkUrl} className="">
													{computedLinkText}
												</Link>
											) : null}
										</div>
									</Panel.Body>
								</Panel>
							}
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
											Manage App
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
				<div className="u-padding-h4 u-padding-v5 aligner aligner--row aligner--wrap aligner--hSpaceEvenly">
					{this.renderStatusCards()}

					<Link to="/addSite" className="u-link-reset">
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
