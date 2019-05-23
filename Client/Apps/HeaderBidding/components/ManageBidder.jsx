/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import AddManageSizelessBidder from './AddManageSizelessBidder';

export default class ManageBidder extends React.Component {
	onBidderUpdate = (bidderConfig, params) => {
		const { siteId, updateBidderAction, bidderConfig: fieldsConfig, openView } = this.props;

		updateBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params).then(() => {
			openView('biddersList');
		});
	};

	openBiddersListView = () => {
		const { openView } = this.props;
		openView('biddersList');
	};

	render() {
		const { bidderConfig } = this.props;

		return (
			<div className="options-wrapper hb-add-bidder">
				<header>
					<h3>Add {bidderConfig.name}</h3>
					<span className="back" onClick={this.openBiddersListView}>
						Back
					</span>
				</header>
				<Row>
					<Col md={4}>
						<h4>Partner Configuration</h4>
					</Col>
					<Col md={8}>
						<AddManageSizelessBidder
							formType="manage"
							bidderConfig={bidderConfig}
							openBiddersListView={this.openBiddersListView}
							onBidderUpdate={this.onBidderUpdate}
						/>
					</Col>
				</Row>
			</div>
		);
	}
}
