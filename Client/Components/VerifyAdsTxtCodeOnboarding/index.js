import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';
import OnboardingCard from '../OnboardingCard';
import { copyToClipBoard } from '../../Apps/ApTag/lib/helpers';
import SendCodeByEmailModal from '../SendCodeByEmailModal';
import siteService from '../../services/siteService';
import userService from '../../services/userService';

class VerifyAdsTxtCodeOnboarding extends Component {
	state = {
		showSendCodeByEmailModal: false,
		ourAdsTxt: 'loading...',
		verifyingAdsTxt: false,
		success: '',
		error: ''
	};

	adsTxtRef = React.createRef();

	componentDidUpdate() {
		const { siteId, site, onComplete, isActive } = this.props;
		const { ourAdsTxt, success, error } = this.state;

		if (isActive && site && ourAdsTxt === 'loading...' && !success && !error) {
			proxyService
				.verifyAdsTxtCode(site)
				.then(resp => {
					const { successResp } = resp.data;
					const onboardingStage = 'onboarded';
					const step = 3;

					return userService
						.setSiteStep(siteId, onboardingStage, step)
						.then(() =>
							siteService.saveSite(siteId, site, onboardingStage, step).then(() => {
								onComplete();
							})
						)
						.catch(err => {
							this.setState({ error: 'Something went wrong!' });
						});
				})
				.catch(err => {
					const { error, ourAdsTxt } = err.response.data;

					this.setState(
						err.response.status === 404
							? { error, verifyingAdsTxt: false, ourAdsTxt }
							: { error, verifyingAdsTxt: false }
					);
				});
		}
	}

	verify = () => {
		this.setState({ verifyingAdsTxt: true });

		const { siteId, site, onComplete } = this.props;

		proxyService
			.verifyAdsTxtCode(site)
			.then(resp => {
				const { success } = resp.data;
				const onboardingStage = 'onboarded';
				const step = 3;

				return userService
					.setSiteStep(siteId, onboardingStage, step)
					.then(() =>
						siteService.saveSite(siteId, site, onboardingStage, step).then(() => {
							onComplete();
						})
					)
					.catch(err => {
						this.setState({ verifyingAdsTxt: false, error: 'Something went wrong!' });
					});
			})
			.catch(err => {
				const { error, ourAdsTxt } = err.response.data;

				this.setState(err.response.status === 404 ? { error, ourAdsTxt } : { error });
			});
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = () => {
		this.adsTxtRef.current.select();
		copyToClipBoard(this.adsTxtRef.current.value);
	};

	render() {
		const { siteId, site, isActive, completed, forwardedRef } = this.props;
		const { showSendCodeByEmailModal, ourAdsTxt, verifyingAdsTxt, success, error } = this.state;

		const mailHeader = `Hi, <br/> Please find below the Ads.txt entries, append the following entries on the root domain of your website: <strong>${site}/ads.txt</strong>\n\n`;
		const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';
		const emailBody = `${mailHeader}<pre style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${ourAdsTxt}</pre>${mailFooter}`;

		return (
			<OnboardingCard
				ref={forwardedRef}
				isActiveStep={isActive}
				expanded={isActive || completed}
				count={3}
				imgPath="/assets/images/ob_ap_code_verify.png"
				heading="Verify Ads.txt"
				description="Add these entries in your ads.txt file"
			>
				<Fragment>
					{isActive && (
						<div className="platformVerificationContent">
							<div className="snippet-wrapper">
								<textarea
									ref={this.adsTxtRef}
									readOnly
									className="snippet"
									id="header-code"
									value={ourAdsTxt}
								/>

								<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
									<CustomButton
										onClick={this.toggleShowSendCodeByEmailModal}
										variant="secondary"
										className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
										style={{ width: '170px' }}
									>
										Email Code
									</CustomButton>
									<SendCodeByEmailModal
										show={showSendCodeByEmailModal}
										title="Send Code to Developer"
										handleClose={this.toggleShowSendCodeByEmailModal}
										subject="Adpushup Ads.txt Entries"
										emailBody={emailBody}
									/>

									<CustomButton
										onClick={this.onCopyToClipBoard}
										variant="secondary"
										className="snippet-btn apbtn-main-line apbtn-small"
										style={{ width: '170px' }}
									>
										Copy to clipboard
									</CustomButton>
								</div>
							</div>

							<CustomButton onClick={this.verify} showSpinner={verifyingAdsTxt}>
								Verify
							</CustomButton>

							{success && <div className="u-text-success u-margin-t3">{success}</div>}
							{error && <div className="u-text-error u-margin-t3">{error}</div>}
						</div>
					)}

					{completed && <div>Ads.txt Verification is completed!</div>}
				</Fragment>
			</OnboardingCard>
		);
	}
}

VerifyAdsTxtCodeOnboarding.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.string,
	completed: PropTypes.bool.isRequired,
	isActive: PropTypes.bool.isRequired,
	onComplete: PropTypes.func.isRequired
};

VerifyAdsTxtCodeOnboarding.defaultProps = {
	siteId: null,
	site: ''
};

export default VerifyAdsTxtCodeOnboarding;
