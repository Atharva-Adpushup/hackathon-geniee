import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import AddSiteOnboarding from '../AddSiteOnboarding';
import VerifyInitCodeOnboarding from '../VerifyInitCodeOnboarding';
import VerifyAdsTxtCodeOnboarding from '../VerifyAdsTxtCodeOnboarding';
import history from '../../helpers/history';

class OnBoardingWrap extends Component {
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

	componentDidUpdate(prevProps) {
		const { isOnboarding, siteId, existingSite, onboardingStage, step } = this.props;

		const newState = {};

		if (prevProps.isOnboarding !== isOnboarding) newState.isOnboarding = isOnboarding;
		if (siteId && prevProps.siteId !== siteId) newState.siteId = siteId;
		if (existingSite && prevProps.existingSite !== existingSite) {
			newState.existingSite = existingSite;
			newState.site = existingSite;
		}
		if (onboardingStage && prevProps.onboardingStage !== onboardingStage)
			newState.onboardingStage = onboardingStage;
		if (step && step > this.state.step) newState.step = step;

		if (Object.keys(newState).length) this.setState(newState);
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

OnBoardingWrap.propTypes = {
	isOnboarding: PropTypes.bool,
	siteId: PropTypes.number,
	existingSite: PropTypes.string,
	onboardingStage: PropTypes.string,
	step: PropTypes.number
};

OnBoardingWrap.defaultProps = {
	isOnboarding: null,
	siteId: null,
	existingSite: '',
	onboardingStage: 'preOnboarding',
	step: 0
};
export default OnBoardingWrap;
