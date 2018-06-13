import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
class RowColSpan extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { props } = this;

		return (
			<Row>
				<Col sm={5}>
					<div>{this.props.label}</div>
				</Col>
				<Col sm={7}>{this.props.children}</Col>
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
