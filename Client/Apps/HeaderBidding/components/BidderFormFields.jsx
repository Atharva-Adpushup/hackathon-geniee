/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import Selectbox from '../../../Components/Selectbox';
import InputBox from '../../../Components/InputBox';

class BidderFormFields extends React.Component {
	getBidderInputField = (
		/* paramConfig */ { inputType, options, dataType },
		paramKey,
		stateKey
	) => {
		const {
			setFormFieldValueInState,
			setParamInTempState,
			getCurrentFieldValue,
			getCurrentParamValue,
			adSize
		} = this.props;

		if (!inputType || !paramKey) return false;

		let currValue;
		if (adSize) {
			currValue = getCurrentParamValue ? getCurrentParamValue(adSize, paramKey) : '';
		} else {
			currValue = getCurrentFieldValue ? getCurrentFieldValue(stateKey, paramKey, adSize) : '';
		}

		switch (inputType) {
			case 'selectBox': {
				return (
					<Selectbox
						key={adSize}
						id={`hb-${paramKey}`}
						wrapperClassName="hb-input"
						selected={currValue}
						options={options}
						onSelect={value => {
							if (adSize) {
								setParamInTempState(adSize, paramKey, value);
							} else {
								setFormFieldValueInState(stateKey, paramKey, value, adSize);
							}
						}}
					/>
				);
			}

			case 'text': {
				return (
					<InputBox
						type={dataType === 'number' ? 'number' : 'text'}
						name={`hb-${paramKey}`}
						classNames="hb-input"
						value={currValue || ''}
						onChange={({ target: { value } }) => {
							if (adSize) {
								setParamInTempState(adSize, paramKey, value);
							} else {
								setFormFieldValueInState(stateKey, paramKey, value, adSize);
							}
						}}
					/>
				);
			}

			default:
				return false;
		}
	};

	renderErrorMsg = (collectionKey, fieldKey, errors, adSize) => {
		if (
			adSize &&
			typeof errors === 'object' &&
			errors !== null &&
			errors[adSize] &&
			errors[adSize][fieldKey]
		) {
			return <HelpBlock>{errors[adSize][fieldKey]}</HelpBlock>;
		}

		if (!adSize && typeof errors === 'object' && errors !== null && errors[fieldKey]) {
			return <HelpBlock>{errors[fieldKey]}</HelpBlock>;
		}

		return false;
	};

	renderFormFields = () => {
		const formFieldsJSX = [];

		const { formFields, errors, tempParamsErrors, adSize } = this.props;

		for (const collectionKey in formFields) {
			const collection = formFields[collectionKey];
			for (const fieldKey in collection) {
				if (!fieldKey) return;
				const fieldConfig = collection[fieldKey];

				formFieldsJSX.push(
					<FormGroup key={fieldKey} controlId={`hb-${fieldKey}`}>
						<Col componentClass={ControlLabel} sm={4}>
							{fieldConfig.name + (!fieldConfig.isRequired ? ' (optional)' : '')}
						</Col>
						<Col sm={8}>{this.getBidderInputField(fieldConfig, fieldKey, collectionKey)}</Col>
						{this.renderErrorMsg(
							collectionKey,
							fieldKey,
							adSize ? tempParamsErrors : errors,
							adSize
						)}
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
	setFormFieldValueInState: PropTypes.func,
	setParamInTempState: PropTypes.func,
	getCurrentFieldValue: PropTypes.func,
	getCurrentParamValue: PropTypes.func,
	// eslint-disable-next-line react/no-unused-prop-types
	formType: PropTypes.oneOf(['add', 'manage']).isRequired,
	adSize: PropTypes.string
};

BidderFormFields.defaultProps = {
	setFormFieldValueInState: () => {},
	setParamInTempState: () => {},
	getCurrentFieldValue: () => {},
	getCurrentParamValue: () => {},
	adSize: ''
};

export default BidderFormFields;
