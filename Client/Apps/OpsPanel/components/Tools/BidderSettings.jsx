import React, { useState, useEffect } from 'react';
import { Table } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton';

// Function to check if a bidder should be disabled
const isDisabled = (isNetBid, isActive, isAdmin) => {
	return isNetBid || !isActive || !isAdmin;
};

const BidderSettings = ({
	networks = {},
	updateNetworkConfig,
	showNotification,
	dataForAuditLogs,
	user
}) => {
	// Create an array of HB (Header Bidding) networks
	const hbNetworks = Object.keys(networks)
		.map(networkKey => ({ id: networkKey, ...networks[networkKey] }))
		.filter(network => typeof network.isHb === 'boolean' && network.isHb);
	// State for modified bidders
	const [modifiedBidders, setModifiedBidders] = useState(() => {
		const initialState = {};
		hbNetworks.forEach(network => {
			const isNetBid = network.bids === 'net';
			initialState[network.id] = {
				bids: isNetBid ? 'net' : 'gross',
				revenueShare: isNetBid ? 0 : network.revenueShare,
				disabled: isDisabled(isNetBid, network.isActive, user.isBidderAdmin)
			};
		});
		return initialState;
	});
	// State for active status of bidders
	const [activeStatus, setActiveStatus] = useState(() => {
		const initialState = {};
		hbNetworks.forEach(network => {
			initialState[network.id] = network.isActive;
		});
		return initialState;
	});
	// Effect to update modified bidders when active status changes
	useEffect(() => {
		const updatedBidders = {};
		hbNetworks.forEach(network => {
			const isNetBid = modifiedBidders[network.id].bids === 'net';
			updatedBidders[network.id] = {
				...modifiedBidders[network.id],
				disabled: isDisabled(isNetBid, activeStatus[network.id], user.isBidderAdmin)
			};
		});
		setModifiedBidders(updatedBidders);
	}, [activeStatus]);

	// Handle toggle event for bid and active status
	const handleToggle = (value, event) => {
		const { name: fieldKey } = event.target;
		const [bidder, field] = fieldKey.split('-');

		if (field === 'bids') {
			handleBidsToggle(bidder, value);
		} else if (field === 'isActive') {
			handleActiveToggle(bidder, value);
		}
	};
	// Update modified bidders state
	const updateModifiedBidders = (bidder, updatedBidder) => {
		const updatedBidders = {
			...modifiedBidders,
			[bidder]: updatedBidder
		};
		setModifiedBidders(updatedBidders);
	};
	// Handle bids toggle event
	const handleBidsToggle = (bidder, value) => {
		const fieldValue = value ? 'net' : 'gross';
		const isActive = activeStatus[bidder];
		const currentBidder = modifiedBidders[bidder];

		const newRevenueShare = fieldValue === 'gross' && isActive ? currentBidder.revenueShare : 0;

		const updatedBidder = {
			...currentBidder,
			bids: fieldValue,
			revenueShare: newRevenueShare,
			disabled: isDisabled(
				fieldValue === 'net',
				!isActive || (fieldValue === 'gross' && !isActive),
				!user.isBidderAdmin
			)
		};

		updateModifiedBidders(bidder, updatedBidder);
	};
	// Handle active toggle event
	const handleActiveToggle = (bidder, value) => {
		const updatedActiveStatus = {
			...activeStatus,
			[bidder]: value
		};
		setActiveStatus(updatedActiveStatus);
	};
	// Handle change event for bid adjustment
	const handleChange = e => {
		const { name: bidder, value } = e.target;
		const isNetBid = modifiedBidders[bidder].bids === 'net';
		const isActive = activeStatus[bidder];
		const updatedBidder = {
			...modifiedBidders[bidder],
			revenueShare: isNetBid || !isActive ? 0 : parseFloat(value) || '',
			disabled: isDisabled(isNetBid, isActive, user.isBidderAdmin)
		};
		updateModifiedBidders(bidder, updatedBidder);
	};
	// Handle save event
	const onSave = () => {
		if (Object.keys(modifiedBidders).length) {
			let isValid = true;
			Object.keys(modifiedBidders).forEach(bidderKey => {
				const bidder = modifiedBidders[bidderKey];
				if (
					bidder.bids === 'gross' &&
					(bidder.revenueShare === 0 || bidder.revenueShare === '') &&
					activeStatus[bidderKey]
				) {
					isValid = false;
					showNotification({
						mode: 'error',
						title: 'Error',
						message: `Please provide a non-zero revenue share for ${bidderKey} since bidder is a gross bidder with active status "Yes"`,
						autoDismiss: 5
					});
				}
			});
			if (isValid) {
				updateNetworkConfig(modifiedBidders, dataForAuditLogs);
			}
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
					{hbNetworks.map(network => {
						const bidIsNet = modifiedBidders[network.id].bids === 'net';
						const bidDisabled = bidIsNet || !activeStatus[network.id] || !user.isBidderAdmin;

						return (
							<tr key={network.id}>
								<td width="20%">{network.name}</td>
								<td width="20%">
									<CustomToggleSwitch
										layout="nolabel"
										className="u-margin-b4"
										checked={bidIsNet}
										onChange={handleToggle}
										size="m"
										on="Net"
										off="Gross"
										disabled={!user.isBidderAdmin}
										defaultLayout
										name={`${network.id}-bids`}
										id={`js-bids-${network.id}`}
									/>
								</td>
								<td width="20%">
									<FieldGroup
										name={network.id}
										value={
											modifiedBidders[network.id].disabled
												? 0
												: modifiedBidders[network.id].revenueShare
										}
										type="number"
										onChange={handleChange}
										disabled={bidDisabled}
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
										checked={activeStatus[network.id]}
										onChange={handleToggle}
										size="m"
										disabled={!user.isBidderAdmin}
										on="Yes"
										off="No"
										defaultLayout
										name={`${network.id}-isActive`}
										id={`js-isActive-${network.id}`}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
			{user.isBidderAdmin && (
				<CustomButton variant="primary" className="pull-right" onClick={onSave}>
					Save
				</CustomButton>
			)}
		</>
	);
};

export default BidderSettings;
