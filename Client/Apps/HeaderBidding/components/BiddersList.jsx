/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Row, Col } from 'react-bootstrap';

const BiddersList = ({ bidders: { notAddedBidders: bidders }, openAddBidderView }) => {
	const biddersJSX = [];

	for (const bidderKey in bidders) {
		const { name } = bidders[bidderKey];

		biddersJSX.push(
			<Col md={4} key={bidderKey}>
				<header>
					<h3>{name}</h3>
				</header>
				<main>img</main>
				<footer>
					<span onClick={openAddBidderView.bind(null, bidders[bidderKey])}>Add Bidder</span>
				</footer>
			</Col>
		);
	}

	return <Row className="options-wrapper hb-bidders-list">{biddersJSX}</Row>;
};

export default BiddersList;
