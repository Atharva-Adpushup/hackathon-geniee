import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
class RowColSpan extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { props } = this;

		return (
			<Row className="rowMargin">
				<Col sm={5}>
					<div className={props.className}>{props.label}</div>
				</Col>
				<Col sm={7}>{props.children}</Col>
			</Row>
		);
	}
}

RowColSpan.propTypes = {
	label: PropTypes.string
};

RowColSpan.defaultProps = {
	label: 'This is the default title'
};

export default RowColSpan;
