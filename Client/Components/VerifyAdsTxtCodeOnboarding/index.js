import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';
import OnboardingCard from '../OnboardingCard';
import CopyButtonWrapperContainer from '../../Containers/CopyButtonWrapperContainer';
import SendCodeByEmailModal from '../SendCodeByEmailModal';
import siteService from '../../services/siteService';
import userService from '../../services/userService';

class VerifyAdsTxtCodeOnboarding extends Component {
	state = {
		showSendCodeByEmailModal: false,
		ourAdsTxt: 'loading...',
		mandatoryAdsTxtEntry: 'loading...',
		verifyingAdsTxt: false,
		sendCodeByEmailModalContent: '',
		skippingAdsTxtVerification: false,
		success: '',
		errors: {
			...this.resetErrorState
		}
	};

	adsTxtRef = React.createRef();

	mandatoryAdsTxtEntryRef = React.createRef();

	resetErrorState = {
		genericError: '',
		ourAdsTxtError: '',
		mandatoryAdsTxtEntryError: ''
	};

	componentDidUpdate() {
		const { site, isActive } = this.props;
		const { ourAdsTxt, mandatoryAdsTxtEntry, success } = this.state;

		if (
			isActive &&
			site &&
			ourAdsTxt === 'loading...' &&
			mandatoryAdsTxtEntry === 'loading...' &&
			!success &&
			!this.hasAnyError()
		) {
			this.verify(true);
		}
	}

	verify = isOnloadVerify => {
		if (isOnloadVerify !== true) this.setState({ verifyingAdsTxt: true });

		const { siteId, site, onComplete, dataForAuditLogsTemplate } = this.props;
		const dataForAuditLogs = {
			...dataForAuditLogsTemplate,
			actionInfo: 'New Site Ads.txt verification'
		};

		const onboardingStage = 'onboarded';
		const step = 3;

		proxyService
			.verifyAdsTxtCode(site, siteId, dataForAuditLogs)
			.then(() => userService.setSiteStep(siteId, onboardingStage, step, dataForAuditLogs))
			.then(() => siteService.saveSite(siteId, site, onboardingStage, step, dataForAuditLogs))
			.then(() =>
				this.setState(
					() => ({
						verifyingAdsTxt: false,
						success: 'Ads.txt verified successfully. Redirecting to My Sites Page...',
						errors: {
							...this.resetErrorState
						}
					}),
					() => setTimeout(() => onComplete(), 3000)
				)
			)
			.catch(err => {
				let nextState = {
					verifyingAdsTxt: false
				};

				if (err.response) {
					const errorResponse = err.response.data;

					if (err.response.status === 400) {
						const {
							error: errors,
							data: { ourAdsTxt, mandatoryAdsTxtEntry }
						} = errorResponse;

						nextState = {
							...nextState,
							errors: {
								...this.resetErrorState
							},
							mandatoryAdsTxtEntry,
							ourAdsTxt
						};

						for (let index = 0; index < errors.length; index += 1) {
							const { error, type } = errors[index];
							if (type === 'ourAdsTxt') {
								nextState.errors.ourAdsTxtError = error;
							} else {
								nextState.errors.mandatoryAdsTxtEntryError = error;
							}
						}

						return this.setState(prevState => ({
							...nextState,
							errors: {
								...prevState.errors,
								...nextState.errors
							}
						}));
					}

					if (err.response.status === 404) {
						const { ourAdsTxt, mandatoryAdsTxtEntry } = errorResponse.data;
						const {
							ourAdsTxt: ourAdsTxtError,
							mandatoryAdsTxtEntry: mandatoryAdsTxtEntryError
						} = errorResponse.error;

						return this.setState({
							...nextState,
							errors: {
								...this.resetErrorState,
								mandatoryAdsTxtEntryError,
								ourAdsTxtError
							},
							ourAdsTxt,
							mandatoryAdsTxtEntry
						});
					}
				}

				return this.setState({
					...nextState,
					ourAdsTxt: '',
					mandatoryAdsTxtEntry: '',
					errors: {
						...this.resetErrorState,
						genericError: 'Something went wrong!'
					}
				});
			});
	};

	skipVerification = () => {
		const { siteId, site, onComplete, dataForAuditLogsTemplate } = this.props;
		const dataForAuditLogs = {
			...dataForAuditLogsTemplate,
			actionInfo: 'Skip Site Ads.txt verification'
		};

		const onboardingStage = 'onboarded';
		const step = 3;

		this.setState({ skippingAdsTxtVerification: true });

		userService
			.setSiteStep(siteId, onboardingStage, step, dataForAuditLogs)
			.then(() => siteService.saveSite(siteId, site, onboardingStage, step, dataForAuditLogs))
			.then(() =>
				this.setState(
					() => ({
						skippingAdsTxtVerification: false,
						success: 'Ads.txt verification skipped. Redirecting to My Sites Page...',
						errors: {
							...this.resetErrorState
						}
					}),
					() => setTimeout(() => onComplete(), 3000)
				)
			)
			.catch(() =>
				this.setState({
					errors: {
						...this.resetErrorState,
						genericError: 'Something went wrong!'
					},
					skippingAdsTxtVerification: false
				})
			);
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = ref => {
		ref.current.select();
	};

	hasAnyError() {
		const {
			errors: { genericError, ourAdsTxtError, mandatoryAdsTxtEntryError }
		} = this.state;

		return !!(genericError || ourAdsTxtError || mandatoryAdsTxtEntryError);
	}

	render() {
		const { site, isActive, completed, forwardedRef, isSuperUser } = this.props;
		const {
			showSendCodeByEmailModal,
			ourAdsTxt,
			verifyingAdsTxt,
			mandatoryAdsTxtEntry,
			skippingAdsTxtVerification,
			sendCodeByEmailModalContent,
			success,
			errors: { genericError, ourAdsTxtError, mandatoryAdsTxtEntryError }
		} = this.state;

		const getEmailBody = snippet => {
			const mailHeader = `Hi, <br/> Please find below the Ads.txt entries, append the following entries on the root domain of your website: <strong>${site}/ads.txt</strong>\n\n`;
			const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';
			const emailBody = `${mailHeader}<pre style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${snippet}</pre>${mailFooter}`;
			return emailBody;
		};

		return (
			<OnboardingCard
				ref={forwardedRef}
				isActiveStep={isActive}
				expanded={isActive || completed}
				count={3}
				imgPath="/assets/images/ob_ap_code_verify.png"
				heading="Verify Ads.txt"
				description=""
			>
				<Fragment>
					{isActive && (
						<div className="platformVerificationContent">
							<SendCodeByEmailModal
								show={showSendCodeByEmailModal}
								title="Send Code to Developer"
								handleClose={this.toggleShowSendCodeByEmailModal}
								subject="Adpushup Ads.txt Entries"
								emailBody={sendCodeByEmailModalContent}
							/>

							{mandatoryAdsTxtEntryError && ourAdsTxtError && (
								<p className="u-text-primary-red u-text-bold u-padding-b3">
									Please add entries from both the sections below to avoid revenue loss
								</p>
							)}

							<div className="u-padding-b4">
								<p>
									Add this mandatory entry
									{mandatoryAdsTxtEntryError && (
										<span className="u-text-primary-red u-text-bold">
											<span className="u-padding-h3">-</span>
											{mandatoryAdsTxtEntryError}
										</span>
									)}
								</p>

								<div className="snippet-wrapper">
									<textarea
										ref={this.mandatoryAdsTxtEntryRef}
										readOnly
										className="snippet"
										id="header-code"
										value={mandatoryAdsTxtEntry || ''}
									/>

									{mandatoryAdsTxtEntry !== 'loading...' && !verifyingAdsTxt && (
										<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
											<CustomButton
												onClick={() => {
													this.setState({
														sendCodeByEmailModalContent: getEmailBody(mandatoryAdsTxtEntry)
													});
													this.toggleShowSendCodeByEmailModal();
												}}
												variant="secondary"
												className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
												style={{ width: '170px' }}
											>
												Email Code
											</CustomButton>
											<CopyButtonWrapperContainer
												content={mandatoryAdsTxtEntry || ''}
												callback={() => this.onCopyToClipBoard(this.mandatoryAdsTxtEntryRef)}
											>
												<CustomButton
													variant="secondary"
													style={{ width: '170px' }}
													className="snippet-btn apbtn-main-line apbtn-small"
												>
													Copy to clipboard
												</CustomButton>
											</CopyButtonWrapperContainer>
										</div>
									)}
								</div>
							</div>

							<div className="u-padding-b4">
								<p>
									Add these entries in your ads.txt file
									{ourAdsTxtError && (
										<span className="u-text-primary-red u-text-bold">
											<span className="u-padding-h3">-</span>
											{ourAdsTxtError}
										</span>
									)}
								</p>

								<div className="snippet-wrapper">
									<textarea
										ref={this.adsTxtRef}
										readOnly
										className="snippet"
										id="header-code"
										value={ourAdsTxt}
									/>

									{ourAdsTxt !== 'loading...' && !verifyingAdsTxt && (
										<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
											<CustomButton
												onClick={() => {
													this.setState({
														sendCodeByEmailModalContent: getEmailBody(ourAdsTxt)
													});
													this.toggleShowSendCodeByEmailModal();
												}}
												variant="secondary"
												className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
												style={{ width: '170px' }}
											>
												Email Code
											</CustomButton>
											<CopyButtonWrapperContainer
												content={ourAdsTxt}
												callback={() => this.onCopyToClipBoard(this.adsTxtRef)}
											>
												<CustomButton
													variant="secondary"
													style={{ width: '170px' }}
													className="snippet-btn apbtn-main-line apbtn-small"
												>
													Copy to clipboard
												</CustomButton>
											</CopyButtonWrapperContainer>
										</div>
									)}
								</div>
							</div>

							<CustomButton
								onClick={this.verify}
								showSpinner={verifyingAdsTxt}
								className="u-margin-r3"
							>
								Verify
							</CustomButton>

							{!!isSuperUser && (
								<CustomButton
									onClick={this.skipVerification}
									showSpinner={skippingAdsTxtVerification}
								>
									Skip
								</CustomButton>
							)}

							{success && <div className="u-text-success u-margin-t4">{success}</div>}
							{genericError && <div className="u-text-primary-red u-margin-t4">{genericError}</div>}
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
