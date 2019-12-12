import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import siteService from '../../services/siteService';
import userService from '../../services/userService';
import OnboardingCard from '../OnboardingCard';
import InputBox from '../InputBox';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';

class AddSiteOnboarding extends Component {
	state = {
		showForm: false,
		isAddingSite: false,
		error: ''
	};

	toggleForm = () => this.setState(state => ({ showForm: !state.showForm }));

	addExistingSite = e => {
		e.preventDefault();

		const { existingSite, siteId, onSiteAdd } = this.props;
		const onboardingStage = 'onboarding';
		const step = 1;

		this.setState({ isAddingSite: true });

		userService
			.addSite(existingSite)
			// eslint-disable-next-line no-unused-vars
			.then(resp => siteService.saveSite(siteId, existingSite, onboardingStage, step))
			.then(resp => {
				onSiteAdd(resp.data);

				return this.setState({ isAddingSite: false });
			})
			.catch(err => {
				this.setState({ isAddingSite: false, error: err.response.data.error });
			});
	};

	addNewSite = e => {
		e.preventDefault();

		const { onSiteAdd, site } = this.props;
		const validationResult = formValidator.validate({ site }, validationSchema.user.validations);

		if (validationResult.isValid) {
			const onboardingStage = 'onboarding';
			const step = 1;

			this.setState({ isAddingSite: true });

			userService
				.addSite(site)
				.then(resp => {
					const { siteId } = resp.data;

					return siteService.saveSite(siteId, site, onboardingStage, step);
				})
				.then(resp => {
					this.setState({ isAddingSite: false });

					onSiteAdd(resp.data);
				})
				.catch(err => {
					this.setState({ isAddingSite: false, error: err.response.data.error });
				});
		} else {
			this.setState({ error: validationResult.errors.site });
		}
	};

	render() {
		const { existingSite, site, isActive, completed, changeSite, forwardedRef } = this.props;
		const { showForm, isAddingSite, error } = this.state;

		return (
			<OnboardingCard
				ref={forwardedRef}
				className="add-site-card"
				isActiveStep={isActive}
				expanded={isActive || completed}
				count={1}
				imgPath="/assets/images/ob_add_site.png"
				heading="Add Site"
				description="Let us know the website on which you want to use AdPushup. If you have more than one
						site then you can easily add them later through the dashboard."
			>
				<Fragment>
					{isActive && showForm && (
						<div className="u-margin-t4">
							<form onSubmit={this.addNewSite}>
								<InputBox type="text" name="site" value={site} onChange={changeSite} />
								<CustomButton type="submit" showSpinner={isAddingSite}>
									Add Site
								</CustomButton>
							</form>

							{error && <div className="u-text-error u-margin-t3">{error}</div>}
						</div>
					)}

					{isActive && !showForm && existingSite && (
						<div className="u-margin-t4">
							<CustomButton
								onClick={this.addExistingSite}
								showSpinner={isAddingSite}
								className="u-margin-r3"
							>
								{`Continue with ${existingSite}`}
							</CustomButton>

							<CustomButton variant="secondary" onClick={this.toggleForm}>
								Edit Site
							</CustomButton>

							{error && <div className="u-text-error u-margin-t3">{error}</div>}
						</div>
					)}

					{isActive && !existingSite && (
						<div className="u-margin-t4">
							<form onSubmit={this.addNewSite}>
								<InputBox
									classNames="custom-input"
									type="text"
									name="site"
									value={site}
									onChange={changeSite}
								/>
								<CustomButton type="submit" showSpinner={isAddingSite}>
									Add Site
								</CustomButton>
							</form>

							{error && <div className="u-text-error u-margin-t3">{error}</div>}
						</div>
					)}

					{completed && (
						<div className="aligner aligner--hcenter u-margin-t4">
							<span className="u-text-underline u-text-red u-margin-r2">{site}</span> has been
							added!
						</div>
					)}
				</Fragment>
			</OnboardingCard>
		);
	}
}

AddSiteOnboarding.propTypes = {
	existingSite: PropTypes.string,
	site: PropTypes.string,
	changeSite: PropTypes.func.isRequired,
	isActive: PropTypes.bool.isRequired,
	completed: PropTypes.bool.isRequired,
	onSiteAdd: PropTypes.func.isRequired
};

AddSiteOnboarding.defaultProps = {
	existingSite: '',
	site: ''
};

export default AddSiteOnboarding;
