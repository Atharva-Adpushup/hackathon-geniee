import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import { FormWrapper } from './commonForm';
import CustomToggleSwitch from '../CustomToggleSwitch/index';

function checkAdCode(value) {
	const response = { error: false };
	if (
		value.indexOf('pagead2.googlesyndication.com') === -1 ||
		value.indexOf('"adsbygoogle"') === -1 ||
		value.indexOf('data-ad-slot') === -1 ||
		value.indexOf('data-ad-client') === -1
	) {
		return {
			...response,
			error: true,
			message: 'Only Adsense Code allowed'
		};
	}
	return response;
}

const Creation = FormWrapper(checkAdCode, 'Adsense', /data-ad-slot=\"\d+\"/gi);

class Adsense extends Component {
	constructor(props) {
		super(props);
		const { ad = {} } = props;
		const { networkData = {} } = ad;
		const { shouldSync = false, isLink = false } = networkData;

		this.state = {
			shouldSync,
			isLink
		};
		this.toggleSync = this.toggleSync.bind(this);
		this.toggleLink = this.toggleLink.bind(this);
		this.renderAdCodeComponent = this.renderAdCodeComponent.bind(this);
		this.syncSubmitHanlder = this.syncSubmitHanlder.bind(this);
	}

	toggleSync(value) {
		this.setState({
			shouldSync: !!value
		});
	}

	toggleLink(value) {
		this.setState({
			isLink: !!value
		});
	}

	syncSubmitHanlder() {
		const { submitHandler } = this.props;
		const { isLink } = this.state;
		submitHandler({
			shouldSync: true,
			isLink,
			type: 'display'
		});
	}

	renderSyncingOptions() {
		const { isLink } = this.state;
		const { id } = this.props;
		return (
			<Row>
				<Col xs={12}>
					<CustomToggleSwitch
						labelText="Link Ad"
						className="mT-10"
						checked={isLink}
						onChange={this.toggleLink}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name="Link Ad"
						id={id ? `js-link-ad-switch-${id}` : 'js-link-ad-switch'}
					/>
				</Col>
				<Col xs={12}>
					<Button className="btn-lightBg btn-save" onClick={this.syncSubmitHanlder}>
						Save
					</Button>
				</Col>
			</Row>
		);
	}

	render() {
		const { shouldSync } = this.state;
		const { id } = this.props;
		return (
			<div>
				<Row>
					<Col xs={12}>
						<CustomToggleSwitch
							labelText="Ad Syncing"
							className="mT-10"
							checked={shouldSync}
							onChange={this.toggleSync}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							name="Ad Syncing"
							id={id ? `js-ad-syncing-switch-${id}` : 'js-ad-syncing-switch'}
						/>
					</Col>
				</Row>
				{shouldSync ? this.renderSyncingOptions() : <Creation {...this.props} />}
			</div>
		);
	}
}

export default Adsense;
