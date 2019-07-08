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
					bidderConfig: { key, name, sizeLess, reusable, isApRelation, params }
				} = this.props;

				const formFields = {
					bidderConfig: getCommonBidderFields(isApRelation),
					params
				};

				if (Object.keys(formFields).length) {
					this.setState(() => {
						const newState = { formFields, bidderConfig: {}, params: {} };

						for (const paramKey in formFields.bidderConfig) {
							newState.bidderConfig[paramKey] = '';
						}

						for (const paramKey in {
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
						}) {
							newState.params[paramKey] = '';
						}

						newState.bidderConfig = { key, name, sizeLess, reusable, ...newState.bidderConfig };
						newState.validationSchema = getValidationSchema({
							...formFields.bidderConfig,
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
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
						const newState = { formFields, bidderConfig: {}, params: {} };
						const mergedParams = {
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
						};

						for (const paramKey in formFields.bidderConfig) {
							let value;
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

							newState.bidderConfig[paramKey] = value;
						}

						for (const paramKey in mergedParams) {
							newState.params[paramKey] = params[paramKey];
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
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
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
			if (paramKey === 'bids' && value === 'net') newState[stateKey].revenueShare = '';
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

	getFormFieldsToRender = (formFields, isGrossBid) => {
		const computedFormFields = {
			bidderConfig: {},
			params: {
				...formFields.params.global,
				...formFields.params.siteLevel,
				...formFields.params.adUnitLevel
			}
		};

		if (isGrossBid) {
			computedFormFields.bidderConfig = formFields.bidderConfig;
			return computedFormFields;
		}

		const { revenueShare, ...rest } = formFields.bidderConfig;
		computedFormFields.bidderConfig = rest;
		return computedFormFields;
	};

	render() {
		const { openBiddersListView, formType } = this.props;
		const {
			formFields,
			bidderConfig: { bids },
			errors
		} = this.state;

		return (
			<React.Fragment>
				{!!Object.keys(formFields).length && (
					<Form horizontal onSubmit={this.onSubmit}>
						<BidderFormFields
							formFields={this.getFormFieldsToRender(formFields, bids === 'gross')}
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
				)}
			</React.Fragment>
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
