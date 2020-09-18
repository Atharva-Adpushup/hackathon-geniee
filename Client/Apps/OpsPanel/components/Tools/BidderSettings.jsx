import React, { useState } from 'react';
import { Table } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButtom from '../../../../Components/CustomButton';

const BidderSettings = ({ networks = {}, updateNetworkConfig }) => {
	const hbNetworks = Object.keys(networks)
		.map(networkKey => ({ id: networkKey, ...networks[networkKey] }))
		.filter(network => typeof network.isHb === 'boolean' && network.isHb);
	const [modifiedBidders, setModifiedBidders] = useState({});

	const handleToggle = (value, event) => {
		const { name: bidder } = event.target;
		const bidders = {
			...modifiedBidders,
			[bidder]: {
				...modifiedBidders[bidder],
				bids: value ? 'net' : 'gross'
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
		if (Object.keys(modifiedBidders).length) updateNetworkConfig(modifiedBidders);
	};

	return (
		<>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Bidder Name</th>
						<th>Bids</th>
						<th>Bid Adjustment</th>
						<th>Relation</th>
					</tr>
				</thead>
				<tbody>
					{hbNetworks.map(network => (
						<tr>
							<td>{network.name}</td>
							<td>
								<CustomToggleSwitch
									layout="nolabel"
									className="u-margin-b4"
									checked={network.bids === 'net'}
									onChange={handleToggle}
									size="m"
									on="Net"
									off="Gross"
									defaultLayout
									name={network.id}
									id={`js-bids-${network.id}`}
								/>
							</td>
							<td>
								<FieldGroup
									name={network.id}
									value={
										modifiedBidders[network.id]
											? modifiedBidders[network.id].revenueShare || network.revenueShare
											: network.revenueShare
									}
									type="number"
									onChange={handleChange}
									size={2}
									id={`bid-adjustment-${network.id}`}
									className="u-padding-v4 u-padding-h4"
								/>
							</td>
							<td>{network.isPartner ? 'AdPushup' : 'N/A'}</td>
						</tr>
					))}
				</tbody>
				<tbody />
			</Table>
			<CustomButtom variant="primary" className="pull-right" onClick={onSave}>
				Save
			</CustomButtom>
		</>
	);
};

export default BidderSettings;
