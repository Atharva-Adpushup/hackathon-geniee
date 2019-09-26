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
import SizewiseParamsFormFields from './SizewiseParamsFormFields';
import { filterValidationSchema } from '../helpers/commonHelpers';

class AddManageNonResponsiveBidder extends React.Component {
	state = {
		formFields: {},
		validationSchema: {},
		bidderConfig: {},
		globalParams: {},
		params: {},
		sizes: [],
		errors: {},
		formError: ''
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
						const newState = {
							bidderConfig: {},
							globalParams: {},
							params: {},
							formFields
						};

						for (const paramKey in formFields.bidderConfig) {
							newState.bidderConfig[paramKey] =
								formFields.bidderConfig[paramKey].defaultValue ||
								(formFields.bidderConfig[paramKey].dataType === 'number' ? null : '');
						}

						for (const globalParamKey in formFields.params.global) {
							if (
								!formFields.params.global[globalParamKey].visible &&
								formFields.params.global[globalParamKey].value !== undefined
							) {
								newState.globalParams[globalParamKey] =
									formFields.params.global[globalParamKey].value;

								// eslint-disable-next-line no-continue
								continue;
							}

							newState.globalParams[globalParamKey] =
								formFields.params.global[globalParamKey].defaultValue ||
								(formFields.params.global[globalParamKey].dataType === 'number' ? null : '');
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
							params: {},
							globalParams: {}
						};

						const paramSizes = Object.keys(params);
						newState.sizes = paramSizes;

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
	}

	addNewSizeInState = adSize => {
		this.setState(state => ({
			sizes: [...state.sizes, adSize]
		}));
	};

	getSiteLevelParamsCountByType = siteLevelParams => {
		const siteLevelParamsKeys = Object.keys(siteLevelParams);
		const siteLevelParamsCount = siteLevelParamsKeys.length;
		const paramsCountByType = {
			hiddenParamsCount: 0,
			requiredVisibleParamsCount: 0
		};

		for (const paramKey of siteLevelParamsKeys) {
			if (siteLevelParams[paramKey].visible === false) {
				// eslint-disable-next-line no-plusplus
				paramsCountByType.hiddenParamsCount++;
			}

			if (siteLevelParams[paramKey].visible && siteLevelParams[paramKey].isRequired) {
				// eslint-disable-next-line no-plusplus
				paramsCountByType.requiredVisibleParamsCount++;
			}
		}

		paramsCountByType.visibleParamsCount =
			siteLevelParamsCount - paramsCountByType.hiddenParamsCount;
		paramsCountByType.optionalVisibleParamsCount =
			paramsCountByType.visibleParamsCount - paramsCountByType.requiredVisibleParamsCount;

		return paramsCountByType;
	};

	onSubmit = e => {
		e.preventDefault();

		const { onBidderAdd, onBidderUpdate } = this.props;
		const { formFields, bidderConfig, globalParams, params, validationSchema, sizes } = this.state;
		const isDirectRelation = bidderConfig.relation === 'direct';

		const validationResult = formValidator.validate(
			{ ...bidderConfig, ...globalParams },
			isDirectRelation ? validationSchema : filterValidationSchema(validationSchema, ['bids'])
		);

		if (validationResult.isValid) {
			this.setState({ errors: {}, formError: '' });

			const siteLevelParamsKeys = Object.keys(formFields.params.siteLevel);
			const siteLevelParamsCount = siteLevelParamsKeys.length;
			if (siteLevelParamsCount) {
				const {
					requiredVisibleParamsCount,
					visibleParamsCount,
					hiddenParamsCount,
					optionalVisibleParamsCount
				} = this.getSiteLevelParamsCountByType(formFields.params.siteLevel);

				// if required visible siteLevel params exist and
				// not added for all sizes then show error
				if (requiredVisibleParamsCount && Object.keys(params).length < sizes.length) {
					this.setState({ formError: 'Please fill params for all sizes.' });
					return;
				}

				// if only hidden siteLevel params exist and inventory doesn't exist then show error
				if (!visibleParamsCount && hiddenParamsCount && !sizes.length) {
					this.setState({
						formError: 'No inventory found. Please create inventories first.'
					});
					return;
				}

				if (visibleParamsCount && !sizes.length) {
					this.setState({
						formError: 'No inventory found. Please create inventories (or add sizes) first.'
					});
					return;
				}

				// if only hidden or optionalVisible siteLevel params and inventory found or sizes added by publisher then add all sizes
				if (
					((!visibleParamsCount && hiddenParamsCount) ||
						(optionalVisibleParamsCount &&
							Object.keys(globalParams).length &&
							!Object.keys(params).length)) &&
					sizes.length
				) {
					// add sizes in params if not exist and setState
					const newParams = { ...params };
					for (const size of sizes) {
						if (!params[size]) newParams[size] = {};
					}
					this.setState({ params: newParams });
				}
			}

			if (!siteLevelParamsCount && !sizes.length) {
				this.setState({
					formError: 'No inventory found. Please create inventories first.'
				});
				return;
			}

			const mergedParams = { ...params };

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

	getFormFieldsToRender = (formFields, isDirectRelation, isGrossBid) => {
		const computedFormFields = {
			bidderConfig: {},
			globalParams: formFields.params.global
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

	render() {
		const { openBiddersListView, formType } = this.props;
		const {
			formFields,
			bidderConfig: { bids, relation },
			errors,
			formError,
			validationSchema,
			sizes,
			params
		} = this.state;

		return (
			<React.Fragment>
				{Object.keys(formFields).length && (
					<Form horizontal onSubmit={this.onSubmit}>
						{!!formError && <span className="u-text-error">{formError}</span>}

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
