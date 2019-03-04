import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';
import OnboardingCard from '../OnboardingCard';
import { copyToClipBoard } from '../../Apps/ApTag/lib/helpers';
import SendCodeByEmailModal from '../SendCodeByEmailModal';
import siteService from '../../services/siteService';
import userService from '../../services/userService';

class VerifyInitCodeOnboarding extends Component {
	state = { showSendCodeByEmailModal: false, verifyingInitCode: false, success: '', error: '' };

	apCodeRef = React.createRef();

	verify = () => {
		const { siteId, site, onComplete } = this.props;

		this.setState({ verifyingInitCode: true });

		// To verify temporarily
		// onComplete();

		proxyService
			.verifyApCode(site)
			.then(resp => {
				const { success } = resp.data;
				const onboardingStage = 'onboarding';
				const step = 2;

				return userService
					.setSiteStep(siteId, onboardingStage, step)
					.then(() =>
						siteService.saveSite(siteId, site, onboardingStage, step).then(() => {
							this.setState({ verifyingInitCode: false, success });

							onComplete();
						})
					)
					.catch(err => {
						this.setState({ verifyingInitCode: false, error: 'Something went wrong!' });
					});
			})
			.catch(err => {
				const { error } = err.response.data;
				this.setState({ verifyingInitCode: false, error });
			});
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = () => {
		this.apCodeRef.current.select();
		copyToClipBoard(this.apCodeRef.current.value);
	};

	render() {
		const { siteId, isActive, completed, forwardedRef } = this.props;
		const { showSendCodeByEmailModal, verifyingInitCode, success, error } = this.state;
		const apHeadCode = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/${siteId}/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;

		const mailHeader =
			'Hi, <br/> Please find below the code snippet for your AdPushup setup. Paste this into the <strong>&lt;head&gt;</strong> section of your page - \n\n';
		const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';
		const apHeadCodeForMail = apHeadCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		const emailBody = `${mailHeader}<pre style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${apHeadCodeForMail}</pre>${mailFooter}`;

		return (
			<OnboardingCard
				ref={forwardedRef}
				className="verify-apcode-card"
				isActiveStep={isActive}
				expanded={isActive || completed}
				count={2}
				imgPath="/assets/images/ob_ap_code_verify.png"
				heading="Install AdPushup code on website"
				description="For AdPushup to start optimizing your website, copy-paste the following parent code in
						the &lt;HEAD&gt; tag of the website selected in the previous step."
			>
				<Fragment>
					{isActive && (
						<div className="platformVerificationContent">
							<div className="snippet-wrapper">
								<textarea
									ref={this.apCodeRef}
									readOnly
									className="snippet"
									id="header-code"
									placeholder="AdPushup init code comes here.."
									value={apHeadCode}
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
										subject="Adpushup HeadCode"
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

							<CustomButton showSpinner={verifyingInitCode} onClick={this.verify}>
								Verify
							</CustomButton>

							{success && <div className="u-text-success u-margin-t3">{success}</div>}
							{error && <div className="u-text-error u-margin-t3">{error}</div>}
						</div>
					)}

					{completed && <div>AP Code Verification is completed!</div>}
				</Fragment>
			</OnboardingCard>
		);
	}
}

VerifyInitCodeOnboarding.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.string,
	completed: PropTypes.bool.isRequired,
	isActive: PropTypes.bool.isRequired,
	onComplete: PropTypes.func.isRequired
};

VerifyInitCodeOnboarding.defaultProps = {
	siteId: null,
	site: ''
};

export default VerifyInitCodeOnboarding;
