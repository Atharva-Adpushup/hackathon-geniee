/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel, Table } from '@/Client/helpers/react-bootstrap-imports';

import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';
import CustomButton from '../../../../../../Components/CustomButton/index';
import Loader from '../../../../../../Components/Loader';
import Empty from '../../../../../../Components/Empty';

class HeaderBidding extends Component {
	constructor(props) {
		super(props);
		const {
			site: { apps = {} }
		} = props;
		const status = Object.prototype.hasOwnProperty.call(apps, 'headerBidding')
			? apps.headerBidding
			: undefined;

		this.state = {
			status,
			loading: false,
			bidders: {}
		};
	}

	componentDidMount() {
		const { bidders, fetchAllBiddersAction, site } = this.props;

		if (!bidders) fetchAllBiddersAction(site.siteId);
	}

	handleToggle = (value, event) => {
		const name = event.target.getAttribute('name');
		const [first, second] = name.split('-');

		if (first === 'status') {
			return this.setState({
				status: value
			});
		}
		return this.setState(state => ({
			bidders: {
				...state.bidders,
				[second]: value
			}
		}));
	};

	handleSave = () => {
		const { status, bidders } = this.state;
		const {
			updateAppStatus,
			updateBidderAction,
			showNotification,
			site,
			bidders: biddersFromProps,
			dataForAuditLogs
		} = this.props;
		const { siteId } = site;

		this.setState({ loading: true });

		return updateAppStatus(
			siteId,
			{
				app: 'headerBidding',
				value: status
			},
			{
				...dataForAuditLogs,
				actionInfo: 'Header Bidding'
			}
		)
			.then(() => {
				const keys = Object.keys(bidders);
				if (keys.length) {
					return keys.reduce(
						(p, key) =>
							p.then(() => {
								const status = bidders[key];
								const cleanKey = key.replace(/\s+/g, '');
								const propsBidder = biddersFromProps[cleanKey];
								return updateBidderAction(
									siteId,
									{
										...propsBidder,
										key: cleanKey,
										status: status ? 'active' : 'paused'
									},
									propsBidder.config,
									dataForAuditLogs
								);
							}),
						Promise.resolve()
					);
				}
				return true;
			})
			.then(() =>
				this.setState({ loading: false }, () =>
					showNotification({
						mode: 'success',
						title: 'Operation Successful',
						autoDismiss: 5,
						message: 'App updated successfully'
					})
				)
			)
			.catch(err => {
				console.log(err);
				this.setState(
					{
						loading: false
					},
					() =>
						showNotification({
							mode: 'error',
							title: 'Operation Failed',
							autoDismiss: 10,
							message: 'App updation failed. Please try again'
						})
				);
			});
	};

	renderContent = () => {
		const { site, bidders } = this.props;
		const { siteId } = site;
		const { loading } = this.state;
		const keys = bidders ? Object.keys(bidders) : [];

		if (loading || bidders === null) return <Loader height="150px" />;
		if (!keys.length) return <Empty message="No Bidders Found" />;

		if (keys.length) {
			return (
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Bidder Name</th>
							<th>Bids</th>
							<th>Bid Adjustment</th>
							<th>Relation</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{keys.map(key => {
							const bidder = bidders[key];
							const { name, bids, revenueShare, isPaused, relation } = bidder;
							return (
								<tr key={`${siteId}-${name}`}>
									<td>{name}</td>
									<td>{bids}</td>
									<td>{revenueShare}</td>
									<td>{relation.toUpperCase()}</td>
									<td>
										<div style={{ minWidth: '100px' }}>
											<CustomToggleSwitch
												layout="nolabel"
												className="u-margin-b4 negative-toggle"
												checked={isPaused === false}
												onChange={this.handleToggle}
												size="m"
												on="Yes"
												off="No"
												defaultLayout
												name={`bidders-${name}-${siteId}`}
												id={`js-hb-bidder-${siteId}-${name}`}
											/>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
			);
		}
		return null;
	};

	render() {
		const {
			site: { siteId, siteDomain },
			resetTab
		} = this.props;
		const { status } = this.state;

		return (
			<Panel.Body collapsible>
				{status === undefined ? (
					<CustomMessage
						type="error"
						header="Information"
						message="Header Bidding Status not found. Please set app status"
						rootClassNames="u-margin-b4"
						dismissible
					/>
				) : null}
				<CustomToggleSwitch
					labelText="App Status"
					className="u-margin-b4 negative-toggle"
					checked={status}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`status-${siteId}-${siteDomain}`}
					id={`js-appStatus-${siteId}-${siteDomain}`}
				/>
				{this.renderContent()}
				<CustomButton variant="secondary" className="pull-right" onClick={resetTab}>
					Cancel
				</CustomButton>
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
				>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default HeaderBidding;
