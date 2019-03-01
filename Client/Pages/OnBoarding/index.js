import React, { Component } from 'react';
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
					console.log(response);
					const { siteId, site, onboardingStage, step } = response.data;
					this.setState(
						() => ({ isOnboarding: false, siteId, site, onboardingStage, step }),
						() => {
							if (step === 1) {
								setTimeout(() => {
									this.scrollableContainer.scrollTo({
										top: this.verifyInitCodeRef.current.offsetTop - 100,
										left: 0,
										behavior: 'smooth'
									});
								}, 500);
							} else if (step === 2) {
								setTimeout(() => {
									this.scrollableContainer.scrollTo({
										top: this.verifyAdsTxtRef.current.offsetTop - 100,
										left: 0,
										behavior: 'smooth'
									});
								}, 500);
							} else {
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
			<OnboardingWrap
				isOnboarding={isOnboarding}
				siteId={siteId}
				existingSite={existingSite}
				site={site}
				onboardingStage={onboardingStage}
				step={step}
			/>
		);
	}
}

export default OnBoarding;
