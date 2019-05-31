/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Row, Col, Panel } from 'react-bootstrap';

const BiddersList = ({ bidders: { notAddedBidders, addedBidders }, openAddManageBidderView }) => {
	const notAddedBiddersJSX = [];
	const addedBiddersJSX = [];

	for (const bidderKey in notAddedBidders) {
		const { name } = notAddedBidders[bidderKey];

		notAddedBiddersJSX.push(
			<Col md={4} key={bidderKey}>
				<Panel>
					<Panel.Heading className="aligner aligner--hSpaceBetween">
						<Panel.Title componentClass="h3" className="aligner-item--vSelfStart">
							{name}
						</Panel.Title>
					</Panel.Heading>
					<Panel.Body>img</Panel.Body>
					<Panel.Footer className="u-padding-0">
						<span
							className="u-block text-center u-padding-3 u-cursor-pointer"
							onClick={openAddManageBidderView.bind(
								null,
								'addBidder',
								bidderKey,
								notAddedBidders[bidderKey]
							)}
						>
							Add Bidder
						</span>
					</Panel.Footer>
				</Panel>
			</Col>
		);
	}

	for (const bidderKey in addedBidders) {
		const { name, isApRelation, isPaused } = addedBidders[bidderKey];

		addedBiddersJSX.push(
			<Col md={4} key={bidderKey}>
				<Panel>
					<Panel.Heading className="aligner aligner--hSpaceBetween">
						<Panel.Title componentClass="h3" className="aligner-item--vSelfStart">
							{name}
						</Panel.Title>
						<span className="aligner-item--vSelfEnd">{isApRelation ? 'AP' : 'Direct'}</span>
					</Panel.Heading>
					<Panel.Body>img</Panel.Body>
					<Panel.Footer className="u-padding-0">
						<Row>
							<Col md={6} className="u-padding-3">
								Status: {isPaused ? 'Paused' : 'Active'}
							</Col>
							<Col
								md={6}
								className="u-padding-3 text-right u-cursor-pointer"
								onClick={() => {
									openAddManageBidderView('manageBidder', bidderKey, addedBidders[bidderKey]);
								}}
							>
								Manage
							</Col>
						</Row>
					</Panel.Footer>
				</Panel>
			</Col>
		);
	}

	return (
		<div className="options-wrapper hb-bidders-list">
			{!!addedBiddersJSX.length && (
				<Row>
					<Col md={12} className="added-bidders">
						<h3>Added Bidders</h3>
						<Row>{addedBiddersJSX}</Row>
					</Col>
				</Row>
			)}
			{!!notAddedBiddersJSX.length && (
				<Row>
					<Col md={12} className="not-added-bidders">
						<h3>Available Bidders</h3>
						<Row>{notAddedBiddersJSX}</Row>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default BiddersList;
