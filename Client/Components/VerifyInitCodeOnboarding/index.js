import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';
import OnboardingCard from '../OnboardingCard';
import { copyToClipBoard } from '../../Apps/ApTag/lib/helpers';
import CustomModal from '../CustomModal';

class VerifyInitCodeOnboarding extends Component {
	state = { showSendEmailModal: false, success: '', error: '' };

	apCodeRef = React.createRef();

	verify = () => {
		const { site, onComplete } = this.props;
		proxyService
			.verifyApCode(site)
			.then(resp => {
				const { success } = resp.data;
				this.setState({ success });

				onComplete();
			})
			.catch(err => {
				const { error } = err.response.data;
				this.setState({ error });
			});
	};

	toggleShowSendEmailModal = () => {
		this.setState(state => ({ showSendEmailModal: !state.showSendEmailModal }));
	};

	onCopyToClipBoard = () => {
		this.apCodeRef.current.select();
		copyToClipBoard(this.apCodeRef.current.value);
	};

	render() {
		const { siteId, completed, disabled } = this.props;
		const { showSendEmailModal, success, error } = this.state;

		return (
			<OnboardingCard
				isActiveStep={!completed && !disabled}
				count={2}
				imgPath="/assets/images/ob_ap_code_verify.png"
				heading="Add Site"
				description="For AdPushup to start optimizing your website, copy-paste the following parent code in
						the &lt;HEAD&gt; tag of the website selected in the previous step."
			>
				<Fragment>
					{!completed && !disabled && (
						<div className="platformVerificationContent">
							<div className="snippet-wrapper">
								<textarea
									ref={this.apCodeRef}
									readOnly
									className="snippet"
									id="header-code"
									placeholder="AdPushup init code comes here.."
									value={`<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/${siteId}/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`}
								/>

								<div className="snippet-btn-wrapper">
									<div>
										<CustomButton
											onClick={this.toggleShowSendEmailModal}
											variant="secondary"
											className="snippet-btn apbtn-main-line apbtn-small"
											style={{ width: '170px' }}
										>
											Email Code
										</CustomButton>
										<CustomModal
											show={showSendEmailModal}
											title="Send Code to Developer"
											handleClose={this.toggleShowSendEmailModal}
										>
											send email form
										</CustomModal>

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
							</div>

							<CustomButton onClick={this.verify}>Verify</CustomButton>
							{error}
						</div>
					)}

					{completed && disabled && <div>AP Code Verification is completed!</div>}
				</Fragment>
			</OnboardingCard>
		);
	}
}

VerifyInitCodeOnboarding.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.string,
	completed: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	onComplete: PropTypes.func.isRequired
};

VerifyInitCodeOnboarding.defaultProps = {
	siteId: null,
	site: ''
};

export default VerifyInitCodeOnboarding;
