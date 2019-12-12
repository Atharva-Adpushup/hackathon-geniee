import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AddSiteOnboarding from '../AddSiteOnboarding';
import VerifyInitCodeOnboarding from '../VerifyInitCodeOnboarding';
import VerifyAdsTxtCodeOnboarding from '../VerifyAdsTxtCodeOnboarding';
import history from '../../helpers/history';
import { addNewSite, updateSiteStep } from '../../actions/siteActions';

class OnBoardingWrap extends Component {
	state = {
		// eslint-disable-next-line react/no-unused-state
		isOnboarding: null,
		siteId: null,
		existingSite: '',
		site: '',
		onboardingStage: '',
		step: 0
	};

	scrollableContainer = document.querySelector('.main-content');

	addSiteRef = createRef();

	verifyInitCodeRef = createRef();

	verifyAdsTxtRef = createRef();

	componentDidUpdate(prevProps) {
		const { isOnboarding, siteId, existingSite, site, onboardingStage, step } = this.props;

		const newState = {};

		if (prevProps.isOnboarding !== isOnboarding) newState.isOnboarding = isOnboarding;
		if (siteId && prevProps.siteId !== siteId) newState.siteId = siteId;
		if (existingSite && prevProps.existingSite !== existingSite)
			newState.existingSite = existingSite;
		if (site && !prevProps.site) newState.site = site;
		if (onboardingStage && prevProps.onboardingStage !== onboardingStage)
			newState.onboardingStage = onboardingStage;
		// eslint-disable-next-line react/destructuring-assignment
		if (step && step > this.state.step) newState.step = step;

		// eslint-disable-next-line react/no-did-update-set-state
		if (Object.keys(newState).length) this.setState(newState);

		// eslint-disable-next-line react/destructuring-assignment
		if (!this.state.step && step) {
			if (step === 3) {
				history.push('/sites');
			} else {
				setTimeout(() => {
					this.scrollableContainer.scrollTo({
						top:
							((step === 1 && this.verifyInitCodeRef.current.offsetTop) ||
								(step === 2 && this.verifyAdsTxtRef.current.offsetTop)) - 100,
						left: 0,
						behavior: 'smooth'
					});
				}, 500);
			}
		}
	}

	changeSite = e => {
		const { value } = e.target;

		this.setState({ site: value });
	};

	// onSiteAdd = (siteId, site, onboardingStage, step) => {
	onSiteAdd = siteObj => {
		const { siteId, siteDomain: site, onboardingStage, step } = siteObj;
		const { addNewSite: addNewSiteAction } = this.props;

		this.setState(
			// eslint-disable-next-line react/no-unused-state
			() => ({ isOnboarding: false, siteId, site, onboardingStage, step }),
			() => {
				addNewSiteAction(siteObj);

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
				const { updateSiteStep: updateSiteStepAction } = this.props;
				const { siteId, step, onboardingStage } = this.state;

				updateSiteStepAction(siteId, step, onboardingStage);

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
			() => ({ step: 3, onboardingStage: 'onboarded' }),
			() => {
				const { updateSiteStep: updateSiteStepAction } = this.props;
				const { siteId, step, onboardingStage } = this.state;

				updateSiteStepAction(siteId, step, onboardingStage);

				history.push('/sites');
			}
		);
	};

	render() {
		const { isSuperUser } = this.props;
		const { siteId, existingSite, site, step } = this.state;

		return (
			<div className="onboarding-wrapper">
				<AddSiteOnboarding
					forwardedRef={this.addSiteRef}
					siteId={siteId}
					existingSite={existingSite}
					site={site}
					changeSite={this.changeSite}
					onSiteAdd={this.onSiteAdd}
					isActive={step === 0}
					completed={step >= 1}
				/>
				<VerifyInitCodeOnboarding
					forwardedRef={this.verifyInitCodeRef}
					siteId={siteId}
					site={site}
					onComplete={this.onInitCodeVerify}
					isActive={step === 1}
					completed={step >= 2}
					isSuperUser={isSuperUser}
				/>
				<VerifyAdsTxtCodeOnboarding
					forwardedRef={this.verifyAdsTxtRef}
					siteId={siteId}
					site={site}
					onComplete={this.onAdsTxtVerify}
					isActive={step === 2}
					completed={step === 3}
					isSuperUser={isSuperUser}
				/>
			</div>
		);
	}
}

OnBoardingWrap.propTypes = {
	isOnboarding: PropTypes.bool,
	siteId: PropTypes.number,
	existingSite: PropTypes.string,
	site: PropTypes.string,
	onboardingStage: PropTypes.string,
	step: PropTypes.number
};

OnBoardingWrap.defaultProps = {
	isOnboarding: null,
	siteId: null,
	existingSite: '',
	site: '',
	onboardingStage: 'preOnboarding',
	step: 0
};
export default connect(
	state => ({
		isSuperUser: state.global.user.data.isSuperUser
	}),
	{ addNewSite, updateSiteStep }
)(OnBoardingWrap);
