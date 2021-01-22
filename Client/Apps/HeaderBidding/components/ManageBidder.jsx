/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import AddManageSizelessBidder from './AddManageSizelessBidder';
import AddManageNonResponsiveBidder from './AddManageNonResponsiveBidder';

export default class ManageBidder extends React.Component {
	onBidderUpdate = (bidderConfig, params) => {
		const {
			siteId,
			updateBidderAction,
			bidderConfig: fieldsConfig,
			openView,
			showNotification,
			customProps,
			user
		} = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		updateBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params, dataForAuditLogs)
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

	onBidderDelete = bidderKey => {
		const {
			siteId,
			deleteBidderAction,
			openView,
			showNotification,
			customProps,
			user
		} = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};
		// eslint-disable-next-line no-alert
		const shouldContinue = window.confirm('Are you sure you want to delete the bidder?');
		if (shouldContinue) {
			deleteBidderAction(siteId, bidderKey, dataForAuditLogs)
				.then(() => {
					openView('biddersList');
					showNotification({
						mode: 'success',
						title: 'Success',
						message: 'Bidder deleted successfully',
						autoDismiss: 5
					});
				})
				.catch(() => {
					showNotification({
						mode: 'error',
						title: 'Error',
						message: 'Unable to delete bidder',
						autoDismiss: 5
					});
				});
		}
	};

	openBiddersListView = () => {
		const { openView } = this.props;
		openView('biddersList');
	};

	render() {
		const {
			bidderConfig,
			siteId,
			showNotification,
			inventories,
			user: { isSuperUser = false } = {}
		} = this.props;

		return (
			<div className="options-wrapper white-tab-container hb-bidder hb-manage-bidder">
				<Row>
					<Col md={4}>
						<h2 className="u-margin-0">Manage {bidderConfig.name}</h2>
						<h3>Partner Configuration</h3>
						<p>
							Please fill in all the required fields. If you do not have this data, please contact
							the demand partner. If you would like AdPushup to get your website approved for this
							partner, please click here.
						</p>
					</Col>
					<Col md={8}>
						{bidderConfig.sizeLess ? (
							<AddManageSizelessBidder
								formType="manage"
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderUpdate={this.onBidderUpdate}
								onBidderDelete={this.onBidderDelete}
								showNotification={showNotification}
								isSuperUser={isSuperUser}
							/>
						) : (
							<AddManageNonResponsiveBidder
								formType="manage"
								siteId={siteId}
								bidderConfig={bidderConfig}
								openBiddersListView={this.openBiddersListView}
								onBidderUpdate={this.onBidderUpdate}
								onBidderDelete={this.onBidderDelete}
								showNotification={showNotification}
								inventories={inventories}
								isSuperUser={isSuperUser}
							/>
						)}
					</Col>
				</Row>
			</div>
		);
	}
}
