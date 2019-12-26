import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import siteService from '../../services/siteService';

import history from '../../helpers/history';
import OnboardingWrap from '../../Components/OnboardingWrap';

class OnBoarding extends Component {
	state = {
		isOnboarding: null,
		siteId: null,
		existingSite: '',
		onboardingStage: '',
		step: 0
	};

	componentDidMount() {
		const { location } = this.props;
		const queryParams = new URLSearchParams(location.search);

		if (!queryParams.get('siteId')) {
			// check preOnboarding or add new site
			siteService
				.getOnboardingData()
				.then(response => {
					const { isOnboarding, onboardingStage, siteId, site } = response.data;

					if (isOnboarding) {
						return this.setState({
							isOnboarding,
							onboardingStage: onboardingStage || '',
							siteId: siteId || null,
							existingSite: site || '',
							site: site || '',
							step: 0
						});
					}

					history.push('/sites');
				})
				.catch(err => {
					// TODO: handle getOnboardingData failure
				});
		} else {
			// get site stage and step
			siteService
				.getOnboardingData(queryParams.get('siteId'))
				.then(response => {
					const { siteId, site, isOnboarding, onboardingStage, step } = response.data;
					this.setState(
						() => ({ isOnboarding, siteId, existingSite: site, site, onboardingStage, step }),
						() => {
							if (step === 3) {
								history.push('/sites');
							}
						}
					);
				})
				.catch(err => {
					history.push('/sites');
				});
		}
	}

	render() {
		const { isOnboarding, siteId, existingSite, site, onboardingStage, step } = this.state;
		return (
			<Fragment>
				<DocumentTitle title="Onboarding" />
				<OnboardingWrap
					isOnboarding={isOnboarding}
					siteId={siteId}
					existingSite={existingSite}
					site={site}
					onboardingStage={onboardingStage}
					step={step}
				/>
			</Fragment>
		);
	}
}

export default OnBoarding;
