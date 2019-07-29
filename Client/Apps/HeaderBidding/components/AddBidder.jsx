/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import AddManageSizelessBidder from './AddManageSizelessBidder';
import AddManageNonResponsiveBidder from './AddManageNonResponsiveBidder';
import { domanize } from '../../../helpers/commonFunctions';

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

		switch (bidderConfig.key) {
			case 'ix': {
				// eslint-disable-next-line no-restricted-syntax
				for (const size in params) {
					// eslint-disable-next-line no-prototype-builtins
					if (params.hasOwnProperty(size)) {
						params[size].size = size.split('x').map(val => parseInt(val, 10));
					}
				}

				break;
			}
			case 'criteo': {
				// eslint-disable-next-line no-restricted-syntax
				for (const size in params) {
					// eslint-disable-next-line no-prototype-builtins
					if (params.hasOwnProperty(size)) {
						params[size].publisherSubId = `AP/${siteId}_${domanize(domain)}`;
					}
				}

				break;
			}
			default:
				break;
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
