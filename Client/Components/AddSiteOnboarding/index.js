import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import siteService from '../../services/siteService';
import userService from '../../services/userService';
import OnboardingCard from '../OnboardingCard';

class AddSiteOnboarding extends Component {
	state = {
		showForm: false
	};

	toggleForm = () => this.setState(state => ({ showForm: !state.showForm }));

	addExistingSite = e => {
		e.preventDefault();

		const { existingSite, siteId, onSiteAdd } = this.props;
		const onboardingStage = 'onboarding';
		const step = 1;

		userService
			.addSite(existingSite)
			.then(resp => {
				console.log('add site success: ', resp.data);

				siteService
					.saveSite(siteId, existingSite, onboardingStage, step)
					.then(resp => {
						console.log('site saved: ', resp.data);

						onSiteAdd(siteId, existingSite, onboardingStage, step);
					})
					.catch(err => {
						console.dir(err);
						// TODO: show error
					});
			})
			.catch(err => {
				console.log('add site failure: ', err.response.data);
				// TODO: handle add site error
			});
	};

	addNewSite = e => {
		e.preventDefault();

		const { onSiteAdd, site } = this.props;
		const onboardingStage = 'onboarding';
		const step = 1;

		// onSiteAdd(false, site, null);

		userService
			.addSite(site)
			.then(resp => {
				console.log('add site success: ', resp.data);
				const { siteId } = resp.data;

				siteService
					.saveSite(siteId, site, onboardingStage, step)
					.then(resp => {
						console.log('site saved: ', resp.data);

						onSiteAdd(siteId, site, onboardingStage, step);
					})
					.catch(err => {
						console.dir(err);
						// TODO: show error
					});
			})
			.catch(err => {
				console.log('add site failure: ', err.response.data);
				// TODO: handle add site error
			});
	};

	render() {
		const { siteId, existingSite, site, completed, onSiteAdd, changeSite, className } = this.props;
		const { showForm } = this.state;

		return (
			<OnboardingCard
				isActiveStep={!completed}
				count={1}
				imgPath="/assets/images/ob_add_site.png"
				heading="Add Site"
				description="Let us know the website on which you want to use AdPushup. If you have more than one
						site then you can easily add them later through the dashboard."
			>
				<Fragment>
					{!completed && showForm && (
						<form onSubmit={this.addNewSite}>
							<input type="text" name="site" value={site} onChange={changeSite} />
							<CustomButton type="submit">Edit Site</CustomButton>
						</form>
					)}

					{!completed && existingSite && (
						<Fragment>
							<CustomButton onClick={this.addExistingSite}>
								Continue with {existingSite}
							</CustomButton>

							<CustomButton variant="secondary" onClick={this.toggleForm}>
								Edit Site
							</CustomButton>
						</Fragment>
					)}

					{!completed && !existingSite && (
						<Fragment>
							<form onSubmit={this.addNewSite}>
								<input type="text" name="site" value={site} onChange={changeSite} />
								<CustomButton type="submit">Add Site</CustomButton>
							</form>
						</Fragment>
					)}

					{completed && <Fragment>{site} added!</Fragment>}
				</Fragment>
			</OnboardingCard>
		);
	}
}

AddSiteOnboarding.propTypes = {
	existingSite: PropTypes.string,
	site: PropTypes.string,
	changeSite: PropTypes.func.isRequired,
	completed: PropTypes.bool.isRequired,
	onSiteAdd: PropTypes.func.isRequired
};

AddSiteOnboarding.defaultProps = {
	existingSite: '',
	site: ''
};

export default AddSiteOnboarding;
