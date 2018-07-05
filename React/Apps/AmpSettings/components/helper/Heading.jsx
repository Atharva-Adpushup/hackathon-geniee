import React from 'react';
import { Row, Col } from 'react-bootstrap';
const Heading = props => {
	return (
		<Row>
			<Col sm={12}>
				<h4 style={{ marginBottom: '10px' }}>{props.title}</h4>
			</Col>
		</Row>
	);
};

export default Heading;
