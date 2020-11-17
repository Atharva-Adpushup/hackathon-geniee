import React, { useState } from 'react';
import { Table } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButtom from '../../../../Components/CustomButton';

const BidderSettings = ({ networks = {}, updateNetworkConfig, showNotification, user }) => {
	const hbNetworks = Object.keys(networks)
		.map(networkKey => ({ id: networkKey, ...networks[networkKey] }))
		.filter(network => typeof network.isHb === 'boolean' && network.isHb);
	const [modifiedBidders, setModifiedBidders] = useState({});
	const { isBidderAdmin = false } = user;

	const handleToggle = (value, event) => {
		const { name: bidderField } = event.target;
		const bidder = bidderField.split('-')[0];
		const field = bidderField.split('-')[1];

		let fieldValue = value;
		if (field === 'bids') {
			fieldValue = value ? 'net' : 'gross';
		}

		const bidders = {
			...modifiedBidders,
			[bidder]: {
				...modifiedBidders[bidder],
				[field]: fieldValue,
				revenueShare: modifiedBidders[bidder]
					? modifiedBidders[bidder].revenueShare
					: networks[bidder].revenueShare
			}
		};
		setModifiedBidders(bidders);
	};
	const handleChange = e => {
		const { name: bidder, value } = e.target;
		const bidders = {
			...modifiedBidders,
			[bidder]: {
				...modifiedBidders[bidder],
				revenueShare: value
			}
		};
		setModifiedBidders(bidders);
	};

	const onSave = () => {
		if (Object.keys(modifiedBidders).length) {
			let isValid = true;
			Object.keys(modifiedBidders).forEach(bidderKey => {
				const bidder = modifiedBidders[bidderKey];
				if (bidder.bids === 'gross' && (!bidder.revenueShare || !bidder.revenueShare.length)) {
					isValid = false;
					showNotification({
						mode: 'error',
						title: 'Error',
						message: `Revenue Share is required for ${bidderKey} since bidder is a gross bidder`,
						autoDismiss: 5
					});
				}
			});
			if (isValid) updateNetworkConfig(modifiedBidders);
		}
	};

	return (
		<>
			<Table striped bordered hover condensed responsive>
				<thead>
					<tr>
						<th>Bidder Name</th>
						<th>Bids</th>
						<th>Bid Adjustment</th>
						<th>Relation</th>
						<th>Active Status</th>
					</tr>
				</thead>
				<tbody>
					{hbNetworks.map(network => (
						<tr>
							<td width="20%">{network.name}</td>
							<td width="20%">
								<CustomToggleSwitch
									layout="nolabel"
									className="u-margin-b4"
									checked={network.bids === 'net'}
									onChange={handleToggle}
									size="m"
									on="Net"
									off="Gross"
									disabled={!isBidderAdmin}
									defaultLayout
									name={`${network.id}-bids`}
									id={`js-bids-${network.id}`}
								/>
							</td>
							<td width="20%">
								<FieldGroup
									name={network.id}
									value={
										modifiedBidders[network.id]
											? modifiedBidders[network.id].revenueShare
											: network.revenueShare
									}
									type="number"
									onChange={handleChange}
									disabled={!isBidderAdmin}
									size={2}
									id={`bid-adjustment-${network.id}`}
									className="u-padding-v4 u-padding-h4"
								/>
							</td>
							<td width="20%">{network.isApRelation ? 'AdPushup' : 'Direct'}</td>
							<td width="20%">
								<CustomToggleSwitch
									layout="nolabel"
									className="u-margin-b4"
									checked={network.isActive}
									onChange={handleToggle}
									size="m"
									disabled={!isBidderAdmin}
									on="Yes"
									off="No"
									defaultLayout
									name={`${network.id}-isActive`}
									id={`js-isActive-${network.id}`}
								/>
							</td>
						</tr>
					))}
				</tbody>
				<tbody />
			</Table>
			{isBidderAdmin && (
				<CustomButtom variant="primary" className="pull-right" onClick={onSave}>
					Save
				</CustomButtom>
			)}
		</>
	);
};

export default BidderSettings;
