/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable class-methods-use-this */
import React from 'react';
import BiddersList from './BiddersList';
import AddBidder from './AddBidder';

export default class BiddersTab extends React.Component {
	state = {
		currView: 'biddersList',
		bidderConfig: null
	};

	componentDidMount() {
		const { fetchAllBiddersAction, siteId } = this.props;

		fetchAllBiddersAction(siteId);
	}

	toggleView = () => {
		this.setState(state => ({
			currView: state.currView === 'biddersList' ? 'addBidder' : 'biddersList'
		}));
	};

	openAddBidderView = bidderConfig => {
		this.setState({ currView: 'addBidder', bidderConfig });
	};

	render() {
		const { currView, bidderConfig } = this.state;
		const { bidders } = this.props;

		return (
			bidders &&
			((currView === 'biddersList' && (
				<BiddersList bidders={bidders} openAddBidderView={this.openAddBidderView} />
			)) ||
				(currView === 'addBidder' && (
					<AddBidder bidderConfig={bidderConfig} toggleView={this.toggleView} />
				)))
		);
	}
}
