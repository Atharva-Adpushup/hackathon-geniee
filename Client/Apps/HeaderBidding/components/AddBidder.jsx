/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import AddManageSizelessBidder from './AddManageSizelessBidder';
import AddManageNonResponsiveBidder from './AddManageNonResponsiveBidder';

export default class AddBidder extends React.Component {
	onBidderAdd = (bidderConfig, params) => {
		const {
			siteId,
			addBidderAction,
			bidderConfig: fieldsConfig,
			openView,
			showNotification
		} = this.props;

		addBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params)
			.then(() => {
				openView('biddersList');
				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Bidder added successfully',
					autoDismiss: 0
				});
			})
			.catch(() => {
				showNotification({
					mode: 'error',
					title: 'Error',
					message: 'Unable to add bidder',
					autoDismiss: 0
				});
			});
	};

	openBiddersListView = () => {
		const { openView } = this.props;
		openView('biddersList');
	};

	render() {
		const { bidderConfig, siteId, showNotification } = this.props;

		return (
			<div className="options-wrapper hb-bidder hb-add-bidder">
				<header>
					<h3>Add {bidderConfig.name}</h3>
				</header>
				<Row>
					<Col md={4}>
						<h4>Partner Configuration</h4>
					</Col>
					<Col md={8}>
						{bidderConfig.sizeLess ? (
							<AddManageSizelessBidder
								formType="add"
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderAdd={this.onBidderAdd}
								showNotification={showNotification}
							/>
						) : (
							<AddManageNonResponsiveBidder
								formType="add"
								siteId={siteId}
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderAdd={this.onBidderAdd}
								showNotification={showNotification}
							/>
						)}
					</Col>
				</Row>
			</div>
		);
	}
}
