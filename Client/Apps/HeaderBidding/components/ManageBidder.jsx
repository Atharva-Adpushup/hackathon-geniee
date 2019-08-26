/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import AddManageSizelessBidder from './AddManageSizelessBidder';
import AddManageNonResponsiveBidder from './AddManageNonResponsiveBidder';

export default class ManageBidder extends React.Component {
	onBidderUpdate = (bidderConfig, params) => {
		const {
			siteId,
			updateBidderAction,
			bidderConfig: fieldsConfig,
			openView,
			showNotification
		} = this.props;

		updateBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params)
			.then(() => {
				openView('biddersList');
				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Bidder updated successfully',
					autoDismiss: 5
				});
			})
			.catch(() => {
				showNotification({
					mode: 'error',
					title: 'Error',
					message: 'Unable to update bidder',
					autoDismiss: 5
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
			<div className="options-wrapper white-tab-container hb-bidder hb-manage-bidder">
				<Row>
					<Col md={4}>
						<h2 className="u-margin-0">Manage {bidderConfig.name}</h2>
						<h3>Partner Configuration</h3>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi vel itaque atque
							repellat optio magni. Quia, quos! Modi cumque voluptatum ab, quia ad quam quasi
							doloribus provident, dignissimos minima itaque.
						</p>
					</Col>
					<Col md={8}>
						{bidderConfig.sizeLess ? (
							<AddManageSizelessBidder
								formType="manage"
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderUpdate={this.onBidderUpdate}
								showNotification={showNotification}
							/>
						) : (
							<AddManageNonResponsiveBidder
								formType="manage"
								siteId={siteId}
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderUpdate={this.onBidderUpdate}
								showNotification={showNotification}
							/>
						)}
					</Col>
				</Row>
			</div>
		);
	}
}
