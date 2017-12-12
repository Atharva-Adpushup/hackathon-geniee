import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';

const title = (
    <h3>Useful links</h3>
);

const LinkList = props => {
	return (
        <ActionCard title={title}>
			<ListGroup className="ops-panel-links-container" componentClass="ul">
				{/* <Link to="/ops/cbDocEditor">
							<ListGroupItem listItem>Couchbase Doc Editor</ListGroupItem>
						</Link> */}
				<Link to="/ops/sitesMapping">
					<ListGroupItem listItem>Sites Mapping</ListGroupItem>
				</Link>
				<Link to="/ops/liveSitesMapping">
					<ListGroupItem listItem>Live Sites Mapping</ListGroupItem>
				</Link>
			</ListGroup>
        </ActionCard>
	);
};

export default LinkList;
