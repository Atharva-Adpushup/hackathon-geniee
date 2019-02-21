import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import siteService from '../../services/siteService';
import userService from '../../services/userService';

class AddSiteOnboarding extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		site: this.props.existingSite,
		showForm: false
	};

	onChange = e => {
		const { name, value } = e.target;

		this.setState({ [name]: value });
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

		const { onSiteAdd } = this.props;
		const { site } = this.state;
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
		const { siteId, existingSite, completed, onSiteAdd } = this.props;
		const { showForm, site } = this.state;

		if (!completed && showForm) {
			return (
				<form onSubmit={this.addNewSite}>
					<input type="text" name="site" value={site} onChange={this.onChange} />
					<CustomButton type="submit">Add Site</CustomButton>
				</form>
			);
		}

		if (!completed && existingSite) {
			return (
				<section>
					<CustomButton onClick={this.addExistingSite}>Continue with {existingSite}</CustomButton>{' '}
					or{' '}
					<CustomButton variant="secondary" onClick={this.toggleForm}>
						Edit Site
					</CustomButton>
				</section>
			);
		}

		return <div>{existingSite} added!</div>;
	}
}

AddSiteOnboarding.propTypes = {
	existingSite: PropTypes.string,
	completed: PropTypes.bool.isRequired,
	onSiteAdd: PropTypes.func.isRequired
};

AddSiteOnboarding.defaultProps = {
	existingSite: ''
};

export default AddSiteOnboarding;
