/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, ControlLabel, HelpBlock } from '@/Client/helpers/react-bootstrap-imports';
import SelectBox from '../../../Components/SelectBox';
import InputBox from '../../../Components/InputBox';

class BidderFormFields extends React.Component {
	getBidderInputField = ({ inputType, options, dataType, isEditable }, paramKey, stateKey) => {
		const {
			setFormFieldValueInState,
			setParamInTempState,
			getCurrentFieldValue,
			getCurrentParamValue,
			adSize,
			isSuperUser = false
		} = this.props;

		if (!inputType || !paramKey) return false;

		let currValue;
		if (adSize) {
			currValue = getCurrentParamValue ? getCurrentParamValue(adSize, paramKey) : '';
		} else {
			currValue = getCurrentFieldValue ? getCurrentFieldValue(stateKey, paramKey, adSize) : '';
		}

		if (dataType === 'array' && currValue) currValue = currValue.toString();

		switch (inputType) {
			case 'selectBox': {
				return (
					<SelectBox
						key={adSize}
						id={`hb-${paramKey}`}
						wrapperClassName="hb-input"
						selected={currValue}
						options={options}
						disabled={!isEditable}
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
								setParamInTempState(
									adSize,
									paramKey,
									dataType === 'number' ? parseFloat(value) : value
								);
							} else {
								setFormFieldValueInState(
									stateKey,
									paramKey,
									dataType === 'number' ? parseFloat(value) : value,
									adSize
								);
							}
						}}
						disabled={isEditable === false}
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
			return <HelpBlock className="u-text-error">{errors[adSize][fieldKey]}</HelpBlock>;
		}

		if (!adSize && typeof errors === 'object' && errors !== null && errors[fieldKey]) {
			return <HelpBlock className="u-text-error">{errors[fieldKey]}</HelpBlock>;
		}

		return false;
	};

	renderFormFields = () => {
		const formFieldsJSX = [];

		const { formFields, errors, tempParamsErrors, adSize, meta = {} } = this.props;

		/*
			fieldsToHide
				-	this can be used to hide any fields
				-	make sure you handle the isRequired part if hiding anything
		*/
		const { fieldsToHide = {}, fieldsToDisable = {} } = meta;
		/*
			fieldsToHide
				-	It will be used to hide the complete field dynamically
				-	It will have the fields to be hidden with the collectionKey prepended
				-	Eg, to hide isAmpActive in bidderConfig, the fieldsToHide obj will look like this
						fieldsToHide = {
							isAmpActive: 'bidderConfig.isAmpActive'
						}
				-	This is done to ensure we can target the right fieldKey without hiding any other key with similar name

			fieldsToDisable
				-	It will be used to disable the fields dynamically
				-	It will have the fields to be hidden with the collectionKey prepended
			
		*/

		for (const collectionKey in formFields) {
			const collection = formFields[collectionKey];
			for (const fieldKey in collection) {
				const fieldConfig = collection[fieldKey];

				// eslint-disable-next-line no-continue
				if (fieldConfig.visible === false) continue;

				if (fieldKey in fieldsToHide) {
					const [collectionName, fieldName] = fieldsToHide[fieldKey].split('.');
					if (collectionName === collectionKey && fieldName === fieldKey) {
						continue;
					}
				}

				if (fieldKey in fieldsToDisable) {
					const [collectionName, fieldName] = fieldsToDisable[fieldKey].split('.');
					if (collectionName === collectionKey && fieldName === fieldKey) {
						fieldConfig.isEditable = false;
					}
				}

				formFieldsJSX.push(
					<FormGroup key={fieldKey} controlId={`hb-${fieldKey}`}>
						<Col componentClass={ControlLabel} sm={6}>
							{fieldConfig.name + (!fieldConfig.isRequired ? ' (optional)' : '')}
						</Col>
						<Col sm={6}>
							{this.getBidderInputField(fieldConfig, fieldKey, collectionKey)}
							{this.renderErrorMsg(
								collectionKey,
								fieldKey,
								adSize ? tempParamsErrors : errors,
								adSize
							)}
						</Col>
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
