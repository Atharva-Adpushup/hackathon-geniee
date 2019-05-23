/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, ControlLabel } from 'react-bootstrap';
import Selectbox from '../../../Components/Selectbox';
import InputBox from '../../../Components/InputBox';

class BidderFormFields extends React.Component {
	getBidderInputField = (/* paramConfig */ { inputType, options }, paramKey, stateKey) => {
		const { setFormFieldValueInState, getCurrentFieldValue } = this.props;
		if (!inputType || !paramKey) return false;

		const currValue = getCurrentFieldValue(stateKey, paramKey);

		switch (inputType) {
			case 'selectBox': {
				return (
					<Selectbox
						id={`hb-${paramKey}`}
						wrapperClassName="hb-input"
						selected={currValue}
						options={options}
						onSelect={value => {
							setFormFieldValueInState(stateKey, paramKey, value);
						}}
					/>
				);
			}

			case 'text': {
				return (
					<InputBox
						type="text"
						name={`hb-${paramKey}`}
						classNames="hb-input"
						value={currValue || ''}
						onChange={({ target: { value } }) => {
							setFormFieldValueInState(stateKey, paramKey, value);
						}}
					/>
				);
			}

			default:
				return false;
		}
	};

	renderFormFields = () => {
		const formFieldsJSX = [];

		const { formFields } = this.props;

		for (const collectionKey in formFields) {
			const collection = formFields[collectionKey];
			for (const fieldKey in collection) {
				if (!fieldKey) return;
				const fieldConfig = collection[fieldKey];

				formFieldsJSX.push(
					<FormGroup key={fieldKey} controlId={`hb-${fieldKey}`}>
						<Col componentClass={ControlLabel} sm={4}>
							{fieldConfig.name}
						</Col>
						<Col sm={8}>{this.getBidderInputField(fieldConfig, fieldKey, collectionKey)}</Col>
					</FormGroup>
				);
			}
		}

		// eslint-disable-next-line consistent-return
		return formFieldsJSX;
	};

	render() {
		return <React.Fragment>{this.renderFormFields()}</React.Fragment>;
	}
}

BidderFormFields.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	formFields: PropTypes.object.isRequired,
	setFormFieldValueInState: PropTypes.func.isRequired,
	getCurrentFieldValue: PropTypes.func.isRequired,
	// eslint-disable-next-line react/no-unused-prop-types
	formType: PropTypes.oneOf(['add', 'manage']).isRequired
};

export default BidderFormFields;
