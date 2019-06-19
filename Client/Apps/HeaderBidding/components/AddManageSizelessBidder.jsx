/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, FormGroup } from 'react-bootstrap';
import CustomButton from '../../../Components/CustomButton';
import getCommonBidderFields from '../config/commonBidderFields';
import BidderFormFields from './BidderFormFields';
import formValidator from '../../../helpers/formValidator';
import getValidationSchema from '../helpers/getValidationSchema';

class AddManageSizelessBidder extends React.Component {
	state = {
		formFields: {},
		validationSchema: {},
		bidderConfig: {},
		params: {},
		errors: {
			bidderConfig: {},
			params: {}
		}
	};

	componentDidMount() {
		const { formType } = this.props;
		switch (formType) {
			case 'add': {
				const {
					bidderConfig: {
						key,
						name,
						sizeLess,
						reusable,
						isApRelation,
						params: { global: globalParams, siteLevel: siteLevelParams }
					}
				} = this.props;

				const formFields = {
					bidderConfig: getCommonBidderFields(isApRelation),
					params: {
						...globalParams,
						...siteLevelParams
					}
				};

				if (Object.keys(formFields).length) {
					this.setState(() => {
						const newState = { formFields };

						for (const collectionKey in formFields) {
							newState[collectionKey] = {};

							for (const paramKey in formFields[collectionKey]) {
								newState[collectionKey][paramKey] = '';
							}
						}

						newState.bidderConfig = { key, name, sizeLess, reusable, ...newState.bidderConfig };
						newState.validationSchema = getValidationSchema({
							...formFields.bidderConfig,
							...formFields.params
						});

						return newState;
					});
				}

				break;
			}

			case 'manage': {
				const {
					bidderConfig: {
						key,
						name,
						sizeLess,
						reusable,
						isApRelation,
						config: params,
						paramsFormFields,
						isPaused,
						relation,
						bids,
						revenueShare
					}
				} = this.props;

				const formFields = {
					bidderConfig: getCommonBidderFields(isApRelation, {
						values: {
							relation,
							bids,
							revenueShare
						},
						newFields: { isPaused }
					}),
					params: paramsFormFields
				};

				if (formFields && Object.keys(formFields).length) {
					this.setState(() => {
						const newState = { formFields };

						for (const collectionKey in formFields) {
							newState[collectionKey] = {};

							for (const paramKey in formFields[collectionKey]) {
								let value;
								if (collectionKey === 'params') {
									value = params[paramKey];
								}
								if (collectionKey === 'bidderConfig') {
									switch (paramKey) {
										case 'relation':
											value = relation;
											break;
										case 'bids':
											value = bids;
											break;
										case 'revenueShare':
											value = revenueShare;
											break;
										case 'status':
											value = isPaused ? 'paused' : 'active';
											break;
										default:
									}
								}
								newState[collectionKey][paramKey] = value || '';
							}
						}

						newState.bidderConfig = {
							key,
							name,
							sizeLess,
							reusable,
							relation,
							bids,
							revenueShare,
							...newState.bidderConfig
						};
						newState.validationSchema = getValidationSchema({
							...formFields.bidderConfig,
							...formFields.params
						});

						return newState;
					});
				}

				break;
			}

			default:
		}
	}

	onSubmit = e => {
		e.preventDefault();

		const { onBidderAdd, onBidderUpdate } = this.props;
		const { bidderConfig, params, validationSchema } = this.state;

		const validationResult = formValidator.validate(
			{ ...bidderConfig, ...params },
			validationSchema
		);

		if (validationResult.isValid) {
			this.setState({ errors: {} });

			// eslint-disable-next-line no-unused-expressions
			(onBidderAdd && onBidderAdd(bidderConfig, params)) ||
				(onBidderUpdate && onBidderUpdate(bidderConfig, params));
		} else {
			this.setState({ errors: validationResult.errors });
		}
	};

	setFormFieldValueInState = (stateKey, paramKey, value) => {
		this.setState(state => {
			const newState = { [stateKey]: { ...state[stateKey], [paramKey]: value } };
			const newErrors = { ...state.errors };
			const error = newErrors[paramKey];
			const { validationSchema } = state;

			const validationResult = formValidator.validate({ [paramKey]: value }, validationSchema);

			if (validationResult.isValid) {
				if (error) {
					delete newErrors[paramKey];
				}
			} else {
				newErrors[paramKey] = validationResult.errors[paramKey];
			}

			newState.errors = newErrors;

			return newState;
		});
	};

	getCurrentFieldValue = (stateKey, paramKey) => {
		const {
			[stateKey]: { [paramKey]: currValue }
		} = this.state;

		return currValue;
	};

	render() {
		const { openBiddersListView, formType } = this.props;
		const { formFields, errors } = this.state;

		return (
			<Form horizontal onSubmit={this.onSubmit}>
				<BidderFormFields
					formFields={formFields}
					formType={formType}
					setFormFieldValueInState={this.setFormFieldValueInState}
					getCurrentFieldValue={this.getCurrentFieldValue}
					errors={errors}
				/>
				<FormGroup>
					<Col md={12} className="u-margin-t4">
						<CustomButton type="submit" variant="primary" className="u-margin-r3">
							{formType === 'add' ? 'Add' : 'Update'}
						</CustomButton>
						<CustomButton type="button" variant="secondary" onClick={openBiddersListView}>
							Cancel
						</CustomButton>
					</Col>
				</FormGroup>
			</Form>
		);
	}
}

AddManageSizelessBidder.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	bidderConfig: PropTypes.object.isRequired,
	openBiddersListView: PropTypes.func.isRequired,
	onBidderAdd: PropTypes.func,
	onBidderUpdate: PropTypes.func,
	formType: PropTypes.oneOf(['add', 'manage']).isRequired
};

AddManageSizelessBidder.defaultProps = {
	onBidderAdd: () => {},
	onBidderUpdate: () => {}
};

export default AddManageSizelessBidder;
