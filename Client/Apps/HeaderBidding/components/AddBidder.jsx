/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from 'react-bootstrap';
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
			showNotification
		} = this.props;

		// if bidder relation is adpushup then add our default values (bid type & revenue share)
		if (bidderConfig.relation === 'adpushup' && fieldsConfig.bids) {
			bidderConfig.bids = fieldsConfig.bids;
			bidderConfig.revenueShare =
				// eslint-disable-next-line no-restricted-globals
				fieldsConfig.bids === 'gross' && !isNaN(fieldsConfig.revenueShare)
					? fieldsConfig.revenueShare
					: null;
		}

		// Inject custom params if any
		if (!bidderConfig.sizeLess) {
			// eslint-disable-next-line no-restricted-syntax
			for (const size in params) {
				// eslint-disable-next-line no-prototype-builtins
				if (params.hasOwnProperty(size)) {
					params[size] = {
						...params[size],
						...getCustomParams(bidderConfig, siteId, domain, size)
					};
				}
			}
		} else {
			params = { ...params, ...getCustomParams(bidderConfig, siteId, domain, null) };
		}

		addBidderAction(siteId, { key: fieldsConfig.key, ...bidderConfig }, params)
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
		const { bidderConfig, siteId, showNotification } = this.props;

		return (
			<div className="options-wrapper white-tab-container hb-bidder hb-add-bidder">
				<Row>
					<Col md={4}>
						<h2 className="u-margin-0">Add {bidderConfig.name}</h2>
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
