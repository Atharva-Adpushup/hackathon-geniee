import React, { Component, createRef } from 'react';
import siteService from '../../services/siteService';
import AddSiteOnboarding from '../../Components/AddSiteOnboarding';
import VerifyInitCodeOnboarding from '../../Components/VerifyInitCodeOnboarding';
import VerifyAdsTxtCodeOnboarding from '../../Components/VerifyAdsTxtCodeOnboarding';
import userService from '../../services/userService';
import user from '../../reducers/global/user';
import history from '../../helpers/history';

class OnBoarding extends Component {
	state = {
		isOnboarding: null,
		siteId: null,
		existingSite: '',
		site: '',
		onboardingStage: '',
		step: 0
	};

	scrollableContainer = document.querySelector('.main-content');

	verifyInitCodeRef = createRef();

	verifyAdsTxtRef = createRef();

	componentDidMount() {
		const { location } = this.props;
		const queryParams = new URLSearchParams(location.search);

		if (!queryParams.get('siteId')) {
			// check preOnboarding or add new site
			siteService
				.getOnboardingData()
				.then(response => {
					console.log(response);
					const { isOnboarding, onboardingStage, siteId, site } = response.data;
					this.setState({
						isOnboarding,
						onboardingStage: onboardingStage || '',
						siteId: siteId || null,
						existingSite: site || '',
						site: site || '',
						step: 0
					});
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

	changeSite = e => {
		const { value } = e.target;

		this.setState({ site: value });
	};

	onSiteAdd = (siteId, site, onboardingStage, step) => {
		this.setState(
			() => ({ isOnboarding: false, siteId, site, onboardingStage, step }),
			() => {
				setTimeout(() => {
					this.scrollableContainer.scrollTo({
						top: this.verifyInitCodeRef.current.offsetTop - 100,
						left: 0,
						behavior: 'smooth'
					});
				}, 500);
			}
		);
	};

	onInitCodeVerify = () => {
		this.setState(
			() => ({ step: 2 }),
			() => {
				setTimeout(() => {
					this.scrollableContainer.scrollTo({
						top: this.verifyAdsTxtRef.current.offsetTop - 100,
						left: 0,
						behavior: 'smooth'
					});
				}, 500);
			}
		);
	};

	onAdsTxtVerify = () => {
		this.setState(
			() => ({ step: 3 }),
			() => {
				history.push('/sites');
			}
		);
	};

	render() {
		const { siteId, existingSite, site, step } = this.state;

		return (
			<div className="onboarding-wrapper">
				<AddSiteOnboarding
					siteId={siteId}
					existingSite={existingSite}
					site={site}
					changeSite={this.changeSite}
					onSiteAdd={this.onSiteAdd}
					isActive={step === 0}
					completed={step >= 1}
				/>
				<VerifyInitCodeOnboarding
					forwadref={this.verifyInitCodeRef}
					siteId={siteId}
					site={site}
					onComplete={this.onInitCodeVerify}
					isActive={step === 1}
					completed={step >= 2}
				/>
				<VerifyAdsTxtCodeOnboarding
					forwadref={this.verifyAdsTxtRef}
					siteId={siteId}
					site={site}
					onComplete={this.onAdsTxtVerify}
					isActive={step === 2}
					completed={step === 3}
				/>
			</div>
		);
	}
}

export default OnBoarding;
