/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Row, Col } from 'react-bootstrap';

const BiddersList = ({ bidders: { notAddedBidders, addedBidders }, openAddManageBidderView }) => {
	const notAddedBiddersJSX = [];
	const addedBiddersJSX = [];

	for (const bidderKey in notAddedBidders) {
		const { name } = notAddedBidders[bidderKey];

		notAddedBiddersJSX.push(
			<Col md={4} key={bidderKey}>
				<header>
					<h3>{name}</h3>
				</header>
				<main>img</main>
				<footer>
					<span
						onClick={openAddManageBidderView.bind(
							null,
							'addBidder',
							bidderKey,
							notAddedBidders[bidderKey]
						)}
					>
						Add Bidder
					</span>
				</footer>
			</Col>
		);
	}

	for (const bidderKey in addedBidders) {
		const { name, isApRelation, isPaused } = addedBidders[bidderKey];

		addedBiddersJSX.push(
			<Col md={4} key={bidderKey}>
				<header>
					<h3>{name}</h3>
					<span>{isApRelation ? 'AP' : 'Direct'}</span>
				</header>
				<main>img</main>
				<footer>
					<span>Status: {isPaused ? 'Paused' : 'Active'}</span>
					<span
						onClick={openAddManageBidderView.bind(
							null,
							'manageBidder',
							bidderKey,
							addedBidders[bidderKey]
						)}
					>
						Manage
					</span>
				</footer>
			</Col>
		);
	}

	return (
		<Row className="options-wrapper hb-bidders-list">
			{addedBiddersJSX}
			{notAddedBiddersJSX}
		</Row>
	);
};

export default BiddersList;
