import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CustomButton from '../CustomButton';
import proxyService from '../../services/proxyService';

class VerifyInitCodeOnboarding extends Component {
	state = { success: '', error: '' };

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

	render() {
		const { siteId, completed, disabled } = this.props;
		const { success, error } = this.state;

		if (!completed && disabled) {
			return <div>AP Code Verification is disabled</div>;
		}

		if (!completed && !disabled) {
			return (
				<div>
					<div>{`<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/${siteId}/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`}</div>
					<CustomButton onClick={this.verify}>Verify</CustomButton>
					{error}
				</div>
			);
		}

		return <div>AP Code Verification is completed!</div>;
	}
}

VerifyInitCodeOnboarding.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.string.isRequired,
	completed: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	onComplete: PropTypes.func.isRequired
};

VerifyInitCodeOnboarding.defaultProps = {
	siteId: null
};

export default VerifyInitCodeOnboarding;
