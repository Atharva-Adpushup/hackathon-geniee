import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { CustomButton } from './index';

class Edit extends Component {
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
			leftSize = 3,
			rightSize = 9,
			label,
			classNames = '',
			type = 'text',
			name,
			placeholder = 'Enter value here',
			onSave,
			onCancel
		} = this.props;
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
						value={this.state.value}
						placeholder={placeholder}
						onChange={this.changeHandler}
					/>
					<CustomButton label="Cancel" handler={onCancel} />
					<CustomButton
						label="Save"
						handler={() => {
							onSave({
								name: this.state.value
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

module.exports = Edit;
