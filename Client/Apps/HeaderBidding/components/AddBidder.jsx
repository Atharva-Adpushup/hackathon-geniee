/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import AddManageSizelessBidder from './AddManageSizelessBidder';
import AddManageNonResponsiveBidder from './AddManageNonResponsiveBidder';
import getCustomParams from '../helpers/getCustomParams';

export default class AddBidder extends React.Component {
	onBidderAdd = (bidderConfig, params) => {
		const {
			siteId,
			domain,
			addBidderAction,
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

		// if bidder relation is adpushup then add our default values (bid type & revenue share)
		if (bidderConfig.relation === 'adpushup' && fieldsConfig.bids) {
			bidderConfig.bids = fieldsConfig.bids;
			bidderConfig.revenueShare =
				fieldsConfig.bids === 'gross' &&
				fieldsConfig.revenueShare !== '' &&
				// eslint-disable-next-line no-restricted-globals
				!isNaN(Number(fieldsConfig.revenueShare))
					? Number(fieldsConfig.revenueShare)
					: '';
		}

		// Inject custom params if any
		if (!bidderConfig.sizeLess) {
			// eslint-disable-next-line no-restricted-syntax
			for (const size in params) {
				// eslint-disable-next-line no-prototype-builtins
				if (params.hasOwnProperty(size)) {
					params[size] = {
						...params[size],
						...getCustomParams(bidderConfig, siteId, domain)
					};
				}
			}
		} else {
			params = { ...params, ...getCustomParams(bidderConfig, siteId, domain) };
		}

		addBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params, dataForAuditLogs)
			.then(() => {
				openView('biddersList');
				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Bidder added successfully',
					autoDismiss: 5
				});
			})
			.catch(() => {
				showNotification({
					mode: 'error',
					title: 'Error',
					message: 'Unable to add bidder',
					autoDismiss: 5
				});
			});
	};

	openBiddersListView = () => {
		const { openView } = this.props;
		openView('biddersList');
	};

	render() {
		const { bidderConfig, siteId, showNotification, inventories } = this.props;

		return (
			<div className="options-wrapper white-tab-container hb-bidder hb-add-bidder">
				<Row>
					<Col md={4}>
						<h2 className="u-margin-0">Add {bidderConfig.name}</h2>
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
								inventories={inventories}
							/>
						)}
					</Col>
				</Row>
			</div>
		);
	}
}
