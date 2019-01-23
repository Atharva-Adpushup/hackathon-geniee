import React from 'react';
import { Row, Col } from 'react-bootstrap';

const Filters = props => {
	return (
		<Row className="filters">
			<Col xs={3}>
				<Col xs={8} className="pdLR-0">
					<input type="text" placeholder="Enter site id" className="input-field" />
				</Col>
				<Col xs={4} className="pdLR-0">
					<button className="btn btn-lightBg btn-default ">Get</button>
				</Col>
			</Col>
			<Col xs={3}>
				<button className="btn btn-lightBg btn-default" onClick={props.fetchAllSites}>
					Generate Full Mapping
				</button>
			</Col>
		</Row>
	);
};

export default Filters;
