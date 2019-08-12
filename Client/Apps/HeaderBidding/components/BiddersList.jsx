/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Button } from 'react-bootstrap';
import Card from '../../../Components/Layout/Card';

function getBidderJSX(bidderType, bidderObj, bidderKey, openAddManageBidderView) {
	const { name, isApRelation, isPaused, isActive } = bidderObj;

	return (
		<Card
			key={bidderKey}
			type="primary"
			rootClassName={`bidders-list-card u-margin-r4 u-margin-b4 ${
				bidderType === 'ADDED' && !isActive ? 'disabled' : ''
			}`}
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
			footerChildren={
				<div className="aligner aligner--row">
					{bidderType === 'NOT_ADDED' && (
						<Button
							className="aligner aligner-item aligner--hCenter u-padding-3 u-cursor-pointer"
							// eslint-disable-next-line react/jsx-no-bind
							onClick={openAddManageBidderView.bind(null, 'addBidder', bidderKey, bidderObj)}
						>
							Add Bidder
						</Button>
					)}

					{bidderType === 'ADDED' && (
						<React.Fragment>
							<span className="aligner aligner-item u-padding-3 aligner--hCenter">
								Status: {isPaused ? 'Paused' : 'Active'}
							</span>
							<Button
								className="aligner aligner-item u-padding-3 aligner--hCenter u-cursor-pointer"
								onClick={() => {
									openAddManageBidderView('manageBidder', bidderKey, bidderObj);
								}}
							>
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
