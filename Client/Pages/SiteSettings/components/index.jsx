import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SplitScreen from '../../../Components/Layout/SplitScreen';
import UiList from '../../../Components/Layout/UiList';
import CustomButton from '../../../Components/CustomButton/index';
import ActionCard from '../../../Components/ActionCard/index';
import { copyToClipBoard } from '../../../Apps/ApTag/lib/helpers';

library.add(faCopy);

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
			siteId
		};
	}

	uiListSaveHandler = collection => {
		const { siteId } = this.state;
		const { updateApConfig } = this.props;
		const apConfigs = {
			blocklist: collection
		};

		console.log('ui collection value: ', collection);
		updateApConfig(siteId, apConfigs);
	};

	renderLeftPanel() {
		const { codeText } = this.state;

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
