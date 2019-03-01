import React, { Component } from 'react';
import ActionCard from '../../Components/ActionCard/index';
import { FormControl, Alert } from 'react-bootstrap';
import { getAdsTxtAction } from '../../actions/proxyActions';
import { connect } from 'react-redux';
class AdsTxtManager extends Component {
	state = {
		adsTxtSnippet: ''
	};
	componentDidMount() {
		const { getAdsTxtAction: getAdsTxt } = this.props;
		getAdsTxt().then(res => {
			if (res.status == 200) {
				this.setState({
					adsTxtSnippet: res.data.adsTxtSnippet
				});
			}
		});
	}

	render() {
		const { adsTxtSnippet } = this.state;
		return (
			<ActionCard title="Add Snippet to Ads.txt ">
				<div className="u-padding-4">
					Ensure that ads.txt is updated to all times to ensure maximum advertising partners are
					bidding on your website.
				</div>
				<div className="u-padding-4 text-center">
					<FormControl componentClass="textarea" placeholder={adsTxtSnippet} rows={15} readOnly />
				</div>
				<Alert bsStyle="warning" className="u-margin-4">
					<strong>Bonus: </strong> Manage ads.txt for all yourpartners with AdPushup&#8217;s
					<a className="u-text-underline" href="http://console.adpushup.com/adstxt">
						{' '}
						ads.txt management solution.
					</a>
				</Alert>
				<Alert bsStyle="warning" className="u-margin-4">
					<strong>Note: </strong> Ads.txt is mandatory. It needs to be updated incase you already
					have one. Else please follow the intsructions provided here :
					<a
						className="u-text-underline"
						href="https://support.google.com/admanager/answer/7441288?hl=en"
					>
						{' '}
						https://support.google.com/admanager/answer/7441288?hl=en.{' '}
					</a>
					AdPushup&#8217;s ads.txt should be appended alongside your existing partners.
				</Alert>
			</ActionCard>
		);
	}
}

export default connect(
	null,
	{ getAdsTxtAction }
)(AdsTxtManager);
