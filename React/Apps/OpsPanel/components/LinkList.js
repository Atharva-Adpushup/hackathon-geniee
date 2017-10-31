import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';

const LinkList = props => {
	return (
		<Row className="ops-panel-links-container">
			<Col xs={6} xsOffset={3}>
				<ListGroup componentClass="ul">
					<Link to="ops/cbDocEditor">
						<ListGroupItem listItem>Couchbase Doc Editor</ListGroupItem>
					</Link>
					<Link to="ops/liveSitesMapping">
						<ListGroupItem listItem>Live Sites Mapping</ListGroupItem>
					</Link>
				</ListGroup>
			</Col>
		</Row>
	);
};

export default LinkList;
