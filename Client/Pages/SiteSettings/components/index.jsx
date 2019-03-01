import React, { Component } from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

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

		this.state = {
			codeText: `<script data-cfasync="false" type="text/javascript">
(function(w, d) {
	var s = d.createElement('script');
	s.src = '//cdn.adpushup.com/${siteId}/adpushup.js';
	s.type = 'text/javascript'; s.async = true;
	(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
})(window, document);
</script>`
		};
		this.handleButtonClickHandler = this.handleButtonClickHandler.bind(this);
	}

	handleButtonClickHandler(inputParam) {
		const _ref = this;

		console.log('inputParam value', inputParam);
	}

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
		const _ref = this;

		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4 u-text-bold">Manage Blocklist</h4>
				<UiList
					itemCollection={['http://a.com', 'http://b.com']}
					emptyCollectionPlaceHolder="No blocklist added"
					inputPlaceholder="Enter Url or pattern to block"
					saveButtonText="Save"
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
				/>
			</ActionCard>
		);
	}
}

export default SiteSettings;
