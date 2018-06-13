import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
class InputControl extends React.Component {
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
				<Col sm={7}>
					<input
						onChange={props.handleOnChange}
						className="form-control"
						type="text"
						placeholder={this.props.label}
						name={this.props.name}
						value={this.props.value}
					/>
				</Col>
			</Row>
		);
	}
}

InputControl.propTypes = {
	label: PropTypes.string
};

InputControl.defaultProps = {
	label: 'This is the default title'
};

export default InputControl;
