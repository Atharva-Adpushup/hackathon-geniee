/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable class-methods-use-this */
import React from 'react';
import BiddersList from './BiddersList';
import AddBidder from './AddBidder';
import ManageBidder from './ManageBidder';
import Loader from '../../../Components/Loader/index';

export default class BiddersTab extends React.Component {
	state = {
		currView: 'biddersList',
		bidderConfig: null
	};

	availableViews = ['biddersList', 'addBidder', 'manageBidder'];

	openView = view => {
		const { currView } = this.state;

		if (this.availableViews.indexOf(view) > -1 && currView !== view) {
			this.setState(() => ({
				currView: view
			}));
		}
	};

	openAddManageBidderView = (view, bidderKey, bidderConfig) => {
		const { currView } = this.state;

		if (
			bidderConfig.isActive &&
			['addBidder', 'manageBidder'].indexOf(view) > -1 &&
			currView !== view
		) {
			this.setState({ currView: view, bidderConfig: { key: bidderKey, ...bidderConfig } });
		}
	};

	render() {
		const { currView, bidderConfig } = this.state;
		const {
			siteId,
			bidders,
			addBidderAction,
			updateBidderAction,
			showNotification,
			domain,
			inventories
		} = this.props;

		return (
			(bidders &&
				((currView === 'biddersList' && (
					<BiddersList bidders={bidders} openAddManageBidderView={this.openAddManageBidderView} />
				)) ||
					(currView === 'addBidder' && (
						<AddBidder
							siteId={siteId}
							domain={domain}
							bidderConfig={bidderConfig}
							addBidderAction={addBidderAction}
							openView={this.openView}
							showNotification={showNotification}
							inventories={inventories}
						/>
					)) ||
					(currView === 'manageBidder' && (
						<ManageBidder
							siteId={siteId}
							bidderConfig={bidderConfig}
							updateBidderAction={updateBidderAction}
							openView={this.openView}
							showNotification={showNotification}
							inventories={inventories}
						/>
					)))) || <Loader />
		);
	}
}