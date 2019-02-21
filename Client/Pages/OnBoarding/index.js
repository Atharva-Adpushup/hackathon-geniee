import React, { Component } from 'react';
import siteService from '../../services/siteService';
import AddSiteOnboarding from '../../Components/AddSiteOnboarding';
import VerifyInitCodeOnboarding from '../../Components/VerifyInitCodeOnboarding';
import userService from '../../services/userService';
import user from '../../reducers/global/user';

class OnBoarding extends Component {
	state = {
		isOnboarding: null,
		siteId: null,
		site: '',
		onboardingStage: '',
		step: 0
	};

	componentDidMount() {
		const { location } = this.props;
		const queryParams = new URLSearchParams(location.search);
		console.log(queryParams.get('siteId'));
		if (!queryParams.get('siteId')) {
			// check preOnboarding or add new site
			siteService
				.getOnboardingData()
				.then(response => {
					console.log(response);
					const { isOnboarding, onboardingStage, siteId, site } = response.data;
					this.setState({
						isOnboarding,
						onboardingStage,
						siteId,
						site,
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
					this.setState({ isOnboarding: false, siteId, site, onboardingStage, step });
				})
				.catch(err => {
					console.log(err.response.data);
					// TODO: handle getOnboardingData failure
				});
		}
	}

	onSiteAdd = (siteId, site, onboardingStage, step) => {
		// TODO:update onboardingStage and step
		this.setState({ isOnboarding: false, siteId, site, onboardingStage, step });
	};

	onInitCodeVerify = () => {
		this.setState({ step: 2 });
	};

	render() {
		const { siteId, site, step } = this.state;

		return (
			<div>
				<AddSiteOnboarding
					siteId={siteId}
					existingSite={site}
					onSiteAdd={this.onSiteAdd}
					completed={step >= 1}
				/>
				<br />
				<br />
				<VerifyInitCodeOnboarding
					siteId={siteId}
					site={site}
					onComplete={this.onInitCodeVerify}
					completed={step >= 2}
					disabled={step !== 1}
				/>
			</div>
		);
	}
}

export default OnBoarding;
