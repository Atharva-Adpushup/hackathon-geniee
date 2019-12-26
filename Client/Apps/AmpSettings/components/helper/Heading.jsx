import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import '../../style.scss';
const Heading = props => {
	return (
		<Row>
			<Col sm={12}>
				<h4 className="header">{props.title}</h4>
			</Col>
		</Row>
	);
};

export default Heading;
