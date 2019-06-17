/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */

import React from 'react';
import { Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomIcon from '../../../Components/CustomIcon';
import {
	fetchOptimizationTabInitData,
	saveBidderRule as saveBidderRuleToDB,
	deleteBidderRule as deleteBidderRuleFromDB
} from '../../../services/hbService';
import Loader from '../../../Components/Loader';
import CustomButton from '../../../Components/CustomButton';
import BidderRuleModal from './BidderRuleModal';
import countries from '../constants/countries';
import Spinner from '../../../Components/Spinner';

class BidderRules extends React.Component {
	state = {
		bidderRules: null,
		bidders: {},
		showBidderRuleModal: false,
		currBidderRule: null,
		deletingBidderRule: { bidder: '', status: false },
		savingBidderRule: false
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

	deleteBidderRule = bidder => {
		const { siteId } = this.props;

		this.setState({ deletingBidderRule: { bidder, status: true } });

		deleteBidderRuleFromDB(siteId, bidder)
			.then(() =>
				this.setState(state => {
					const { bidderRules } = { ...state };
					const bidderIndex = bidderRules.findIndex(bidderRule => bidderRule.bidder === bidder);

					if (bidderIndex > -1) {
						bidderRules.splice(bidderIndex, 1);
						return { bidderRules, deletingBidderRule: { bidder: '', status: false } };
					}

					return { deletingBidderRule: { bidder: '', status: false } };
				})
			)
			.catch(err => {
				this.setState({ deletingBidderRule: { bidder: '', status: false } });
			});
	};

	saveBidderRule = rule => {
		const { siteId } = this.props;
		const { bidderRules } = { ...this.state };

		this.setState({ savingBidderRule: true });

		saveBidderRuleToDB(siteId, rule)
			.then(data => {
				const bidderIndex = bidderRules.findIndex(bidderRule => bidderRule.bidder === rule.bidder);

				if (bidderIndex > -1) {
					bidderRules[bidderIndex] = rule;
				}

				if (bidderIndex === -1) {
					bidderRules.push(rule);
				}

				this.setState({ bidderRules, savingBidderRule: false }, () => this.hideBidderRuleModal());
			})
			.catch(err => {
				this.setState({ savingBidderRule: false });
			});
	};

	renderTable = () => {
		const { bidderRules, bidders } = this.state;
		return (
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
					<tr className="table-footer">
						{Object.keys(bidders).length !== Object.keys(bidderRules).length ? (
							<td
								colSpan="5"
								className="text-center link"
								onClick={() => this.showBidderRuleModal(null)}
							>
								Add New Bidder
							</td>
						) : (
							<td colSpan="5" className="text-center">
								No more bidder left to add rules.
							</td>
						)}
					</tr>
				</tbody>
			</Table>
		);
	};

	renderTableBodyRows = () => {
		const { bidderRules, bidders, deletingBidderRule } = this.state;

		if (!bidderRules.length) {
			return (
				<tr>
					<td colSpan="5">No Rule Found</td>
				</tr>
			);
		}

		return bidderRules.map(bidderRule => {
			const { bidder, device, country, status } = bidderRule;
			const bidderName = bidders[bidder];
			const deviceNames = {
				desktop: 'Desktop',
				tablet: 'Tablet',
				phone: 'Phone'
			};

			return (
				<tr key={bidder}>
					<td>{bidderName}</td>
					<td>{device ? deviceNames[device] : 'N/A'}</td>
					<td>{country ? countries[country] : 'N/A'}</td>
					<td>{status ? 'Enabled' : 'Disabled'}</td>
					<td>
						<CustomIcon
							classNames="action-icon u-cursor-pointer u-margin-r3"
							icon="edit"
							toReturn={bidderRule}
							onClick={this.showBidderRuleModal}
						/>

						{!(deletingBidderRule.bidder === bidder && deletingBidderRule.status) ? (
							<CustomIcon
								classNames="action-icon u-cursor-pointer"
								icon="trash"
								toReturn={bidder}
								onClick={this.deleteBidderRule}
							/>
						) : (
							<Spinner color="primary" size={16} />
						)}
					</td>
				</tr>
			);
		});
	};

	render() {
		const {
			bidderRules,
			currBidderRule,
			bidders,
			showBidderRuleModal,
			savingBidderRule
		} = this.state;
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
								saveBidderRule={this.saveBidderRule}
								savingBidderRule={savingBidderRule}
							/>
						)}
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

export default BidderRules;
