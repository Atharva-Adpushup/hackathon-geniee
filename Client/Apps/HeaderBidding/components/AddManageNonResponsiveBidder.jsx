/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, FormGroup } from 'react-bootstrap';
import CustomButton from '../../../Components/CustomButton';
import getCommonBidderFields from '../config/commonBidderFields';
import BidderFormFields from './BidderFormFields';
import formValidator from '../../../helpers/formValidator';
import getValidationSchema from '../helpers/getValidationSchema';
import { fetchInventorySizes } from '../../../services/hbService';
import SizewiseParamsFormFields from './SizewiseParamsFormFields';

class AddManageNonResponsiveBidder extends React.Component {
	state = {
		formFields: {},
		validationSchema: {},
		bidderConfig: {},
		globalParams: {},
		params: {},
		sizes: [],
		errors: {},
		fetchingSizes: true
	};

	componentDidMount() {
		const { formType, siteId, showNotification } = this.props;

		fetchInventorySizes(siteId)
			.then(({ data: sizes }) => {
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
								const newState = {
									bidderConfig: {},
									globalParams: {},
									params: {},
									formFields,
									sizes,
									fetchingSizes: false
								};

								for (const paramKey in formFields.bidderConfig) {
									newState.bidderConfig[paramKey] = '';
								}

								for (const globalParamKey in formFields.params.global) {
									newState.globalParams[globalParamKey] = '';
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
								// move global params from params obj  to globalParams obj

								const newState = {
									formFields,
									fetchingSizes: false,
									sizes: [...new Set([...sizes, ...Object.keys(params)])],
									params: {},
									globalParams: {}
								};

								for (const collectionKey in formFields) {
									newState[collectionKey] = {};

									if (collectionKey === 'params') {
										// remove globalParams from params obj
										const newParams = JSON.parse(JSON.stringify(params));
										for (const [size, paramsObj] of Object.entries(newParams)) {
											for (const paramKey of Object.keys(formFields[collectionKey].global)) {
												newState.globalParams[paramKey] = paramsObj[paramKey];
												delete newParams[size][paramKey];
											}
										}

										newState[collectionKey] = newParams;

										// eslint-disable-next-line no-continue
										continue;
									}

									for (const paramKey in formFields[collectionKey]) {
										let value;

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

										newState[collectionKey][paramKey] = value;
									}
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

					default:
				}
			})
			.catch(() => {
				this.setState({ fetchingSizes: false }, () => {
					showNotification({
						mode: 'error',
						title: 'Error',
						message: 'Unable to fetch inventory sizes',
						autoDismiss: 5
					});
				});
			});
	}

	addNewSizeInState = adSize => {
		this.setState(state => ({ sizes: [...state.sizes, adSize] }));
	};

	onSubmit = e => {
		e.preventDefault();

		const { onBidderAdd, onBidderUpdate } = this.props;
		const { bidderConfig, globalParams, params, validationSchema, sizes } = this.state;

		const validationResult = formValidator.validate(
			{ ...bidderConfig, ...globalParams },
			validationSchema
		);

		if (validationResult.isValid) {
			const mergedParams = { ...params };

			this.setState({ errors: {} });

			if (Object.keys(mergedParams).length) {
				for (const [size, paramsObj] of Object.entries(mergedParams)) {
					mergedParams[size] = { ...paramsObj, ...globalParams };
				}
			} else {
				sizes.forEach(size => {
					mergedParams[size] = globalParams;
				});
			}

			// eslint-disable-next-line no-unused-expressions
			(onBidderAdd && onBidderAdd(bidderConfig, mergedParams)) ||
				(onBidderUpdate && onBidderUpdate(bidderConfig, mergedParams));
		} else {
			this.setState({ errors: validationResult.errors });
		}
	};

	setFormFieldValueInState = (stateKey, paramKey, value) => {
		this.setState(state => {
			const newState = {
				[stateKey]: {
					...state[stateKey],
					[paramKey]: value
				}
			};

			if (paramKey === 'bids' && value === 'net') newState[stateKey].revenueShare = '';

			const newErrors = { ...state.errors };

			const error = newErrors[paramKey];
			const { validationSchema } = state;

			const validationResult = formValidator.validate({ [paramKey]: value }, validationSchema);

			if (validationResult.isValid && error) {
				delete newErrors[paramKey];
			}

			if (!validationResult.isValid) {
				newErrors[paramKey] = validationResult.errors[paramKey];
			}

			newState.errors = newErrors;

			return newState;
		});
	};

	saveNonSizelessParams = (adSize, params) => {
		this.setState(state => ({ params: { ...state.params, [adSize]: params } }));
	};

	getCurrentFieldValue = (stateKey, paramKey, adSize) => {
		if (adSize) {
			const {
				[stateKey]: {
					[adSize]: { [paramKey]: currValue }
				}
			} = this.state;

			return currValue;
		}

		const {
			[stateKey]: { [paramKey]: currValue }
		} = this.state;

		return currValue;
	};

	getFormFieldsToRender = (formFields, isGrossBid) => {
		const computedFormFields = {
			bidderConfig: {},
			globalParams: formFields.params.global
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
			errors,
			fetchingSizes,
			validationSchema,
			sizes,
			params
		} = this.state;

		return (
			<React.Fragment>
				{!fetchingSizes && (
					<Form horizontal onSubmit={this.onSubmit}>
						<BidderFormFields
							formFields={this.getFormFieldsToRender(formFields, bids === 'gross')}
							formType={formType}
							setFormFieldValueInState={this.setFormFieldValueInState}
							getCurrentFieldValue={this.getCurrentFieldValue}
							errors={errors}
						/>

						{!!(
							formFields &&
							formFields.params &&
							Object.keys(formFields.params.siteLevel).filter(
								param => formFields.params.siteLevel[param].visible
							).length
						) && (
							<SizewiseParamsFormFields
								sizes={sizes}
								formFields={{ params: formFields.params }}
								savedParams={params}
								formType={formType}
								setFormFieldValueInState={this.setFormFieldValueInState}
								saveNonSizelessParams={this.saveNonSizelessParams}
								getCurrentFieldValue={this.getCurrentFieldValue}
								validationSchema={validationSchema}
								addNewSizeInState={this.addNewSizeInState}
								errors={errors}
							/>
						)}
						<FormGroup>
							<Col md={12} className="footer-btns">
								<CustomButton type="submit" variant="primary" className="u-margin-r3">
									{formType === 'add' ? 'Add Bidder' : 'Update Bidder'}
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

AddManageNonResponsiveBidder.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	bidderConfig: PropTypes.object.isRequired,
	openBiddersListView: PropTypes.func.isRequired,
	onBidderAdd: PropTypes.func,
	onBidderUpdate: PropTypes.func,
	formType: PropTypes.oneOf(['add', 'manage']).isRequired
};

AddManageNonResponsiveBidder.defaultProps = {
	onBidderAdd: () => {},
	onBidderUpdate: () => {}
};

export default AddManageNonResponsiveBidder;
