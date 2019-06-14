/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import React from 'react';
import { Table } from 'react-bootstrap';
import { fetchOptimizationTabInitData } from '../../../services/hbService';
import Loader from '../../../Components/Loader';
import CustomButton from '../../../Components/CustomButton';
import BidderRuleModal from './BidderRuleModal';

class BidderRules extends React.Component {
	state = {
		bidderRules: null,
		bidders: {},
		showBidderRuleModal: false,
		currBidderRule: null
	};

	componentDidMount() {
		const { siteId } = this.props;

		fetchOptimizationTabInitData(siteId).then(({ bidderRules, addedBidders }) => {
			this.setState({ bidderRules, bidders: addedBidders });
		});
	}

	hideBidderRuleModal = () => {
		this.setState(({ showBidderRuleModal }) => {
			if (showBidderRuleModal) {
				return {
					showBidderRuleModal: false,
					currBidderRule: null
				};
			}

			return null;
		});
	};

	showBidderRuleModal = rule => {
		this.setState(() => {
			if (rule) {
				return { currBidderRule: rule, showBidderRuleModal: true };
			}

			return { showBidderRuleModal: true };
		});
	};

	getFilteredBidders = () => {
		const { bidderRules, bidders, currBidderRule } = this.state;
		const currBidderKey = currBidderRule ? currBidderRule.bidder : null;
		const filteredBidders = { ...bidders };

		/*
		all bidders - rule bidders + curr bidder
		*/

		Object.keys(bidders).forEach(bidderKey => {
			if (bidderRules.find(rule => rule.bidder !== currBidderKey && rule.bidder === bidderKey)) {
				delete filteredBidders[bidderKey];
			}
		});

		return filteredBidders;
	};

	deleteBidderRule(rule) {}

	saveBidderRule(rule) {}

	renderTable = () => (
		<Table striped bordered condensed hover>
			<thead>
				<tr>
					<th>Partner</th>
					<th>Device</th>
					<th>Country</th>
					<th>Status</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{this.renderTableBodyRows()}
				<tr>
					<td colSpan="5">
						<CustomButton type="button" onClick={() => this.showBidderRuleModal(null)}>
							Add New Rule
						</CustomButton>
					</td>
				</tr>
			</tbody>
		</Table>
	);

	renderTableBodyRows = () => {
		const { bidderRules, bidders } = this.state;

		return bidderRules.map(bidderRule => {
			const { bidder, device, country, status } = bidderRule;
			const bidderName = bidders[bidder];

			return (
				<tr key={bidder}>
					<td>{bidderName}</td>
					<td>{device}</td>
					<td>{country}</td>
					<td>{status ? 'Enabled' : 'Disabled'}</td>
					<td>
						<CustomButton type="button" onClick={() => this.showBidderRuleModal(bidderRule)}>
							Edit
						</CustomButton>
						<CustomButton type="button" onClick={this.deleteBidderRule(bidderRule)}>
							Delete
						</CustomButton>
					</td>
				</tr>
			);
		});
	};

	render() {
		const { bidderRules, currBidderRule, bidders, showBidderRuleModal } = this.state;
		return (
			<React.Fragment>
				{bidderRules === null ? (
					<Loader />
				) : (
					<React.Fragment>
						{this.renderTable()}
						{showBidderRuleModal && (
							<BidderRuleModal
								show={showBidderRuleModal}
								bidderRule={currBidderRule}
								bidders={bidders}
								getFilteredBidders={this.getFilteredBidders}
								hideBidderRuleModal={this.hideBidderRuleModal}
							/>
						)}
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

export default BidderRules;
