/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import CustomButton from '../CustomButton/index';
import InputBox from '../InputBox/index';

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
			onCancel,
			extras
		} = this.props;
		const { value } = this.state;
		return (
			<div className={classNames}>
				<Col md={leftSize}>
					<p className="u-text-bold">{label}</p>
				</Col>
				<Col md={rightSize}>
					<InputBox
						type={type}
						name={name}
						value={value}
						placeholder={placeholder}
						onChange={this.changeHandler}
					/>
					<CustomButton variant="secondary" className="u-margin-t4 pull-right" onClick={onCancel}>
						Cancel
					</CustomButton>
					<CustomButton
						variant="primary"
						className="u-margin-r3 u-margin-t4 pull-right"
						onClick={() => {
							onSave({
								name: value,
								extras
							});
							return onCancel();
						}}
					>
						Save
					</CustomButton>
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

EditBox.propTypes = {
	leftSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	rightSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	label: PropTypes.string,
	classNames: PropTypes.string,
	type: PropTypes.string,
	placeholder: PropTypes.string,
	extras: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
		PropTypes.object,
		PropTypes.bool
	]),
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
	placeholder: 'Enter value here',
	extras: null
};

export default EditBox;
