import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SplitScreen from '../../../Components/Layout/SplitScreen';
import UiList from '../../../Components/Layout/UiList';
import CustomButton from '../../../Components/CustomButton/index';
import ActionCard from '../../../Components/ActionCard/index';
import SendCodeByEmailModal from '../../../Components/SendCodeByEmailModal';
import { copyToClipBoard } from '../../../Apps/ApTag/lib/helpers';
import siteService from '../../../services/siteService';
import { errorHandler } from '../../../helpers/commonFunctions';

library.add(faCopy, faEnvelope);

class SiteSettings extends Component {
	constructor(props) {
		super(props);
		const {
			match: {
				params: { siteId }
			}
		} = props;
		const siteData = props.sites[siteId];

		this.state = {
			codeText: `<script data-cfasync="false" type="text/javascript">
(function(w, d) {
	var s = d.createElement('script');
	s.src = '//cdn.adpushup.com/${siteId}/adpushup.js';
	s.type = 'text/javascript'; s.async = true;
	(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
})(window, document);
</script>`,
			siteData,
			siteId,
			showSendCodeByEmailModal: false
		};
	}

	uiListSaveHandler = collection => {
		const { siteId } = this.state;
		const { updateApConfig, showNotification } = this.props;
		const apConfigs = {
			blocklist: collection
		};

		updateApConfig(siteId, apConfigs);
		siteService
			.saveApConfigs(siteId, apConfigs)
			.then(() =>
				showNotification({
					mode: 'success',
					title: 'Settings Saved',
					message: 'Successfully saved blocklist setting',
					autoDismiss: 1
				})
			)
			.catch(err => errorHandler(err));
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	renderLeftPanel() {
		const { codeText, showSendCodeByEmailModal } = this.state;
		const mailHeader =
			'Hi, <br/> Please find below the code snippet for your AdPushup setup. Paste this into the <strong>&lt;head&gt;</strong> section of your page - \n\n';
		const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';
		const apHeadCodeForMail = codeText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		const emailBody = `${mailHeader}<pre style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${apHeadCodeForMail}</pre>${mailFooter}`;

		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4 u-text-bold">AP Head Code</h4>
				<p className="u-margin-b4">Copy and paste this snippet in the head tag of your website</p>
				<Row className="u-margin-b4">
					<Col xs={12} md={12} className="u-padding-r4 u-padding-l0">
						<pre className="u-margin-0">{codeText}</pre>
					</Col>
				</Row>

				<CustomButton
					variant="secondary"
					className=""
					name="convertButton"
					onClick={() => copyToClipBoard(codeText)}
				>
					<span>
						Copy to Clipboard
						<FontAwesomeIcon icon="copy" className="u-margin-l2" />
					</span>
				</CustomButton>

				<CustomButton
					variant="secondary"
					className="u-margin-l3"
					name="emailCodeToDevButton"
					onClick={this.toggleShowSendCodeByEmailModal}
				>
					<span>
						Send Code to Developer
						<FontAwesomeIcon icon="envelope" className="u-margin-l2" />
					</span>
				</CustomButton>
				<SendCodeByEmailModal
					show={showSendCodeByEmailModal}
					title="Send Code to Developer"
					handleClose={this.toggleShowSendCodeByEmailModal}
					subject="Adpushup HeadCode"
					emailBody={emailBody}
				/>
			</div>
		);
	}

	renderRightPanel() {
		const {
			siteData: {
				apConfigs: { blocklist }
			}
		} = this.state;
		const computedBlocklist = blocklist || [];

		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4 u-text-bold">Manage Blocklist</h4>
				<p className="u-margin-b4">
					Block AdPushup script <code>adpushup.js</code> on below listed websites
				</p>
				<UiList
					itemCollection={computedBlocklist}
					emptyCollectionPlaceHolder="No blocklist added"
					inputPlaceholder="Enter Url or pattern to block. Enter comma separated multiple values"
					saveButtonText="Save"
					sticky
					validate
					plugins={['url-http-https']}
					onSave={this.uiListSaveHandler}
				/>
			</div>
		);
	}

	render() {
		return (
			<ActionCard title="My Sites">
				<SplitScreen
					rootClassName="u-padding-h4 u-padding-v5"
					leftChildren={this.renderLeftPanel()}
					rightChildren={this.renderRightPanel()}
					rightChildrenClassName="wrapper wrapper--blocklist"
				/>
			</ActionCard>
		);
	}
}

export default SiteSettings;
