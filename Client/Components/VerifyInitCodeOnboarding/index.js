import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';
import OnboardingCard from '../OnboardingCard';
import CopyButtonWrapperContainer from '../../Containers/CopyButtonWrapperContainer';
import SendCodeByEmailModal from '../SendCodeByEmailModal';
import siteService from '../../services/siteService';
import userService from '../../services/userService';

class VerifyInitCodeOnboarding extends Component {
	state = {
		showSendCodeByEmailModal: false,
		verifyingInitCode: false,
		skippingInitCodeVerification: false,
		success: '',
		error: ''
	};

	apCodeRef = React.createRef();

	verify = () => {
		const { siteId, site, onComplete, dataForAuditLogsTemplate } = this.props;
		const dataForAuditLogs = { ...dataForAuditLogsTemplate, actionInfo: 'New Site Verification' };
		this.setState({ verifyingInitCode: true });

		const onboardingStage = 'onboarding';
		const step = 2;
		let success;
		proxyService
			.verifyApCode(site, siteId)
			.then(resp => {
				({ success } = resp.data);

				return userService.setSiteStep(siteId, onboardingStage, step, dataForAuditLogs);
			})
			.then(() => siteService.saveSite(siteId, site, onboardingStage, step, dataForAuditLogs))
			.then(() => {
				this.setState({ verifyingInitCode: false, success });

				return onComplete();
			})
			.catch(err => {
				if (err.response) {
					const { error } = err.response.data;
					return this.setState({ verifyingInitCode: false, error });
				}

				return this.setState({ verifyingInitCode: false, error: 'Something went wrong!' });
			});
	};

	skipVerification = () => {
		const { siteId, site, onComplete, dataForAuditLogsTemplate } = this.props;
		const dataForAuditLogs = { ...dataForAuditLogsTemplate, actionInfo: 'Skip Site Verification' };
		const onboardingStage = 'onboarding';
		const step = 2;

		this.setState({ skippingInitCodeVerification: true });

		userService
			.setSiteStep(siteId, onboardingStage, step, dataForAuditLogs)
			.then(() => siteService.saveSite(siteId, site, onboardingStage, step, dataForAuditLogs))
			.then(() => {
				this.setState({
					skippingInitCodeVerification: false,
					success: 'AP Head code verification skipped.'
				});

				return onComplete();
			})
			.catch(err => {
				if (err.response) {
					const { error } = err.response.data;
					return this.setState({ skippingInitCodeVerification: false, error });
				}

				return this.setState({
					skippingInitCodeVerification: false,
					error: 'Something went wrong!'
				});
			});
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = () => {
		this.apCodeRef.current.select();
	};

	render() {
		const { siteId, isActive, completed, forwardedRef, isSuperUser } = this.props;
		const {
			showSendCodeByEmailModal,
			verifyingInitCode,
			skippingInitCodeVerification,
			success,
			error
		} = this.state;
		const apHeadCode = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/${siteId}/adpushup.js'; s.crossOrigin='anonymous'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;

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
									<CopyButtonWrapperContainer
										content={apHeadCode}
										callback={this.onCopyToClipBoard}
									>
										<CustomButton
											variant="secondary"
											className="snippet-btn apbtn-main-line apbtn-small"
											style={{ width: '170px' }}
										>
											Copy to clipboard
										</CustomButton>
									</CopyButtonWrapperContainer>
								</div>
							</div>

							<CustomButton
								showSpinner={verifyingInitCode}
								onClick={this.verify}
								className="u-margin-r3"
							>
								Verify
							</CustomButton>

							{!!isSuperUser && (
								<CustomButton
									showSpinner={skippingInitCodeVerification}
									onClick={this.skipVerification}
								>
									Skip
								</CustomButton>
							)}

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
