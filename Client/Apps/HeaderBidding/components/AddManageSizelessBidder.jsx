/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, FormGroup } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../Components/CustomButton';
import getCommonBidderFields from '../config/commonBidderFields';
import BidderFormFields from './BidderFormFields';
import formValidator from '../../../helpers/formValidator';
import getValidationSchema from '../helpers/getValidationSchema';
import { filterValidationSchema, getDefaultBidderParamsByRelation } from '../helpers/commonHelpers';

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

	bidderFormFieldsMeta = {
		fieldsToHide: {},
		fieldsToDisable: {}
	};

	componentDidMount() {
		const { formType, isSuperUser } = this.props;
		switch (formType) {
			case 'add': {
				const {
					bidderConfig: {
						key,
						name,
						sizeLess,
						reusable,
						isApRelation,
						params,
						isAmpActive,
						isS2SActive,
						isS2S
					}
				} = this.props;

				// disable the AMP status if not isS2S
				if (!isS2S) {
					this.bidderFormFieldsMeta.fieldsToDisable = {
						isAmpActive: 'bidderConfig.isAmpActive',
						isS2SActive: 'bidderConfig.isS2SActive'
					};
				}

				const formFields = {
					bidderConfig: getCommonBidderFields(isApRelation && isSuperUser),
					params
				};

				if (Object.keys(formFields).length) {
					this.setState(() => {
						const newState = { formFields, bidderConfig: {}, params: {} };

						for (const paramKey in formFields.bidderConfig) {
							newState.bidderConfig[paramKey] =
								(isApRelation && formFields.bidderConfig[paramKey].defaultValue) ||
								(formFields.bidderConfig[paramKey] === 'number' ? null : '');
						}

						const formFieldsParams = {
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
						};

						for (const paramKey in formFieldsParams) {
							if (
								!formFieldsParams[paramKey].visible &&
								formFieldsParams[paramKey].value !== undefined
							) {
								newState.params[paramKey] = formFieldsParams[paramKey].value;

								// eslint-disable-next-line no-continue
								continue;
							}

							newState.params[paramKey] =
								(isApRelation && formFieldsParams[paramKey].defaultValue) ||
								(formFieldsParams[paramKey].dataType === 'number' ? null : '');
						}

						newState.bidderConfig = {
							key,
							name,
							sizeLess,
							reusable,
							isAmpActive,
							isS2SActive,
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
						revenueShare,
						isAmpActive,
						isS2SActive,
						isS2S
					}
				} = this.props;

				// disable the AMP and S2S status if not isS2S
				if (!isS2S) {
					this.bidderFormFieldsMeta.fieldsToDisable = {
						isAmpActive: 'bidderConfig.isAmpActive',
						isS2SActive: 'bidderConfig.isS2SActive'
					};
				}
				const formFields = {
					bidderConfig: getCommonBidderFields(isApRelation && isSuperUser, {
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
								case 'isAmpActive':
									value = isAmpActive;
									break;
								case 'isS2SActive':
									value = isS2SActive;
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
							isAmpActive,
							isS2SActive,
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
		const isDirectRelation = bidderConfig.relation === 'direct';

		const validationResult = formValidator.validate(
			{ ...bidderConfig, ...params },
			isDirectRelation ? validationSchema : filterValidationSchema(validationSchema, ['bids'])
		);

		if (validationResult.isValid) {
			this.setState({ errors: {} });

			if (typeof bidderConfig.isAmpActive !== 'undefined') {
				/*
					-	convert the value to boolean before saving to the database
					-	the value will be converted back to the corresponding value like
					true -> 'true' and false -> 'false' when received from the database
					-	this was to be done due to the SelectBox not accepting boolean values
					
					NOTE: this is also being done in the AddManageNonResponsiveBidder
				*/
				bidderConfig.isAmpActive = bidderConfig.isAmpActive === 'true';
			}

			if (typeof bidderConfig.isS2SActive !== 'undefined') {
				bidderConfig.isS2SActive = bidderConfig.isS2SActive === 'true';
			}

			// eslint-disable-next-line no-unused-expressions
			(onBidderAdd && onBidderAdd(bidderConfig, params)) ||
				(onBidderUpdate && onBidderUpdate(bidderConfig, params));
		} else {
			this.setState({ errors: validationResult.errors });
		}
	};

	setFormFieldValueInState = (stateKey, paramKey, value) => {
		const {
			bidderConfig: { params, paramsFormFields }
		} = this.props;

		const { adUnitLevel, global, siteLevel } = params || paramsFormFields;
		const paramsFromNetworkTree = { ...adUnitLevel, ...global, ...siteLevel };

		this.setState(state => {
			const newState = {
				[stateKey]: {
					...state[stateKey],
					[paramKey]:
						state[stateKey][paramKey] === null || typeof state[stateKey][paramKey] === 'number'
							? parseFloat(value)
							: value
				}
			};
			if (paramKey === 'bids' && value === 'net') newState[stateKey].revenueShare = '';

			if (paramKey === 'relation') {
				newState.params = getDefaultBidderParamsByRelation(
					value,
					state.params,
					paramsFromNetworkTree
				);
			}

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

	getFormFieldsToRender = (formFields, isDirectRelation, isGrossBid) => {
		const computedFormFields = {
			bidderConfig: {},
			params: {
				...formFields.params.global,
				...formFields.params.siteLevel,
				...formFields.params.adUnitLevel
			}
		};

		if (!isDirectRelation) {
			const { bids, revenueShare, ...rest } = formFields.bidderConfig;
			computedFormFields.bidderConfig = rest;
			return computedFormFields;
		}

		if (isDirectRelation && !isGrossBid) {
			const { revenueShare, ...rest } = formFields.bidderConfig;
			computedFormFields.bidderConfig = rest;
			return computedFormFields;
		}

		computedFormFields.bidderConfig = formFields.bidderConfig;
		return computedFormFields;
	};

	onDeleteBidder = () => {
		const { onBidderDelete, bidderConfig } = this.props;
		onBidderDelete(bidderConfig.key);
	};

	render() {
		const { openBiddersListView, formType, isSuperUser } = this.props;
		const {
			formFields,
			bidderConfig: { bids, relation },
			errors
		} = this.state;

		return (
			<React.Fragment>
				{!!Object.keys(formFields).length && (
					<Form horizontal onSubmit={this.onSubmit}>
						<BidderFormFields
							formFields={this.getFormFieldsToRender(
								formFields,
								relation === 'direct',
								bids === 'gross'
							)}
							formType={formType}
							setFormFieldValueInState={this.setFormFieldValueInState}
							getCurrentFieldValue={this.getCurrentFieldValue}
							errors={errors}
							meta={this.bidderFormFieldsMeta}
						/>
						<FormGroup>
							<Col md={12} className="u-margin-t4">
								<CustomButton type="submit" variant="primary" className="u-margin-r3">
									{formType === 'add' ? 'Add' : 'Update'}
								</CustomButton>
								<CustomButton type="button" variant="secondary" onClick={openBiddersListView}>
									Cancel
								</CustomButton>
								{formType !== 'add' && (
									<CustomButton
										type="button"
										variant="secondary"
										className="u-margin-l3"
										onClick={this.onDeleteBidder}
									>
										Remove Bidder
									</CustomButton>
								)}
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
