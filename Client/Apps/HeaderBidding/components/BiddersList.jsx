/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Button } from '@/Client/helpers/react-bootstrap-imports';
import Card from '../../../Components/Layout/Card';

function getBidderJSX(bidderType, bidderObj, bidderKey, openAddManageBidderView) {
	let { name, isApRelation, isPaused, isActive, isAmpActive = 'false' } = bidderObj;

	/*
		converting the isAmpActive value to boolean since the select box used to 
		show this field doesn't support the boolean values

		NOTE: this conversion is also done when saving the data to the database
		where 'true' is considered as true rest everything as false
	*/
	if (typeof isAmpActive === 'boolean') {
		isAmpActive = isAmpActive ? 'true' : 'false';
	}

	return (
		<Card
			key={bidderKey}
			type="primary"
			rootClassName={`bidders-list-card u-margin-r4 u-margin-b4 u-cursor-pointer ${
				bidderType === 'NOT_ADDED' ? 'not-added-bidder-card' : 'added-bidder-card'
			}${bidderType === 'ADDED' && !isActive ? ' disabled' : ''}`}
			bodyClassName="card-body"
			bodyChildren={
				<div className="text-img">
					{bidderType === 'ADDED' && (
						<span className="top-right-text">{isApRelation ? 'AP' : 'Direct'}</span>
					)}
					<span className="text">{name}</span>
				</div>
			}
			footerClassName="card-footer u-padding-0"
			// eslint-disable-next-line react/jsx-no-bind
			onClick={openAddManageBidderView.bind(
				null,
				bidderType === 'NOT_ADDED' ? 'addBidder' : 'manageBidder',
				bidderKey,
				{ ...bidderObj, isAmpActive }
			)}
			footerChildren={
				<div className="aligner aligner--row">
					{bidderType === 'NOT_ADDED' && (
						<Button className="aligner aligner-item aligner--hCenter u-padding-3 u-cursor-pointer">
							Add Bidder
						</Button>
					)}

					{bidderType === 'ADDED' && (
						<React.Fragment>
							<span className="aligner aligner-item u-padding-3 aligner--hCenter">
								Status: {isPaused ? 'Paused' : 'Active'}
							</span>
							<Button className="aligner aligner-item u-padding-3 aligner--hCenter u-cursor-pointer">
								Manage
							</Button>
						</React.Fragment>
					)}
				</div>
			}
		/>
	);
}

const BiddersList = ({ bidders: { notAddedBidders, addedBidders }, openAddManageBidderView }) => {
	const notAddedBiddersJSX = [];
	const addedBiddersJSX = [];

	for (const bidderKey in notAddedBidders) {
		// eslint-disable-next-line no-prototype-builtins
		if (notAddedBidders.hasOwnProperty(bidderKey)) {
			notAddedBiddersJSX.push(
				getBidderJSX('NOT_ADDED', notAddedBidders[bidderKey], bidderKey, openAddManageBidderView)
			);
		}
	}

	for (const bidderKey in addedBidders) {
		// eslint-disable-next-line no-prototype-builtins
		if (addedBidders.hasOwnProperty(bidderKey)) {
			addedBiddersJSX.push(
				getBidderJSX('ADDED', addedBidders[bidderKey], bidderKey, openAddManageBidderView)
			);
		}
	}

	return (
		<div className="options-wrapper hb-bidders-list">
			{!!addedBiddersJSX.length && (
				<div className="added-bidders">
					<h3 className="heading">Added Bidders</h3>
					<div className="aligner aligner--row aligner--wrap">{addedBiddersJSX}</div>
				</div>
			)}
			{!!notAddedBiddersJSX.length && (
				<div md={12} className="not-added-bidders">
					<h3 className="heading">Available Bidders</h3>
					<div className="aligner aligner--row aligner--wrap">{notAddedBiddersJSX}</div>
				</div>
			)}
		</div>
	);
};

export default BiddersList;
