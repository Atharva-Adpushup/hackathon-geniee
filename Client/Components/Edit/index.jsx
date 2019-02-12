import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import { CustomButton } from './index.jsx';

class EditBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};
		this.changeHandler = this.changeHandler.bind(this);
	}

	changeHandler(e) {
		this.setState({
			value: e.target.value
		});
	}

	render() {
		const {
			leftSize,
			rightSize,
			label,
			classNames,
			type,
			name,
			placeholder,
			onSave,
			onCancel
		} = this.props;
		const { value } = this.state;
		return (
			<div>
				<Col md={leftSize}>
					<h4>{label}</h4>
				</Col>
				<Col md={rightSize}>
					<input
						className={`inputMinimal ${classNames}`}
						type={type}
						style={{ width: '100%' }}
						name={name}
						value={value}
						placeholder={placeholder}
						onChange={this.changeHandler}
					/>
					<CustomButton label="Cancel" handler={onCancel} />
					<CustomButton
						label="Save"
						handler={() => {
							onSave({
								name: value
							});
							return onCancel();
						}}
					/>
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

EditBox.propTypes = {
	leftSize: PropTypes.string,
	rightSize: PropTypes.string,
	label: PropTypes.string,
	classNames: PropTypes.string,
	type: PropTypes.string,
	placeholder: PropTypes.string,
	name: PropTypes.string.isRequired,
	onSave: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
};

EditBox.defaultProps = {
	leftSize: 3,
	rightSize: 9,
	label: 'Label',
	classNames: '',
	type: 'text',
	placeholder: 'Enter value here'
};

module.exports = EditBox;
