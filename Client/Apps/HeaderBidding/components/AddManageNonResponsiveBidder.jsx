/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React from 'react';
import PropTypes from 'prop-types';
import difference from 'lodash/difference';
import { Col, Form, FormGroup } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../Components/CustomButton';
import getCommonBidderFields from '../config/commonBidderFields';
import BidderFormFields from './BidderFormFields';
import formValidator from '../../../helpers/formValidator';
import getValidationSchema from '../helpers/getValidationSchema';
import SizewiseParamsFormFields from './SizewiseParamsFormFields';
import { filterValidationSchema, getDefaultBidderParamsByRelation } from '../helpers/commonHelpers';

class AddManageNonResponsiveBidder extends React.Component {
	state = {
		formFields: {},
		validationSchema: {},
		bidderConfig: {},
		globalParams: {},
		params: {},
		sizes: [],
		errors: {},
		formError: '',
		sizesNotAddedOnBidderCard: []
	};

	bidderFormFieldsMeta = {
		fieldsToHide: {},
		fieldsToDisable: {}
	};

	componentDidMount() {
		const { formType, isSuperUser, activeAdUnitSizes } = this.props;

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
						isS2S,
						enableFormatWiseParams
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
					bidderConfig: getCommonBidderFields(isApRelation, isSuperUser, null, isS2S),
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
								(isApRelation && formFields.bidderConfig[paramKey].defaultValue) ||
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
								(isApRelation && formFields.params.global[globalParamKey].defaultValue) ||
								(formFields.params.global[globalParamKey].dataType === 'number' ? null : '');
						}

						newState.bidderConfig = {
							key,
							name,
							sizeLess,
							reusable,
							enableFormatWiseParams,
							...newState.bidderConfig
						};
						newState.validationSchema = getValidationSchema({
							...formFields.bidderConfig,
							...formFields.params.global,
							...formFields.params.siteLevel,
							...formFields.params.adUnitLevel
						});

						newState.sizesNotAddedOnBidderCard = activeAdUnitSizes;

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
						isS2S,
						enableFormatWiseParams
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
					bidderConfig: getCommonBidderFields(
						isApRelation,
						isSuperUser,
						{
							values: {
								relation,
								bids,
								revenueShare,
								isAmpActive,
								isS2SActive
							},
							newFields: { isPaused }
						},
						isS2S
					),
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

						const sizesNotAddedOnBidderCard = difference(activeAdUnitSizes, paramSizes);
						newState.sizesNotAddedOnBidderCard = sizesNotAddedOnBidderCard;

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
										case 'isAmpActive':
											value = isAmpActive;
											break;
										case 'isS2SActive':
											value = isS2SActive;
											break;
										default:
									}
								}

								newState[collectionKey][paramKey] = value;
							}
						}

						newState.bidderConfig = {
							key,
							name,
							sizeLess,
							reusable,
							enableFormatWiseParams,
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

	addNewSizeInState = adSize => {
		this.setState(state => ({
			sizes: [...state.sizes, adSize]
		}));
	};

	removeSize = adSize => {
		this.setState(state => {
			const { sizes = [], params = {} } = state || {};
			const newSizes = sizes.filter(size => size !== adSize);
			const newParams = { ...params };
			delete newParams[adSize];
			return {
				sizes: newSizes,
				params: newParams
			};
		});
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

	getUniqueInventorySizes = () => {
		const { inventories } = this.props;
		const uniqueInventorySizes = [...new Set(inventories.map(inventory => inventory.size))];
		return uniqueInventorySizes;
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

			let mergedParams = {};

			const siteLevelParamsKeys = Object.keys(formFields.params.siteLevel);
			const siteLevelParamsCount = siteLevelParamsKeys.length;
			const uniqueInventorySizes = this.getUniqueInventorySizes();

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

				if (!visibleParamsCount && hiddenParamsCount && !uniqueInventorySizes.length) {
					this.setState({
						formError: 'No inventory found. Please create inventories first.'
					});
					return;
				}

				// if visible params exists and sizes not added
				if (visibleParamsCount && !sizes.length) {
					this.setState({
						formError: 'No inventory found. Please create inventories (or add sizes) first.'
					});
					return;
				}

				/**
				 * # if only hidden params
				 * # if optionalVisible siteLevel params and inventory found or sizes added by publisher then add all sizes
				 */
				if (
					((!visibleParamsCount && hiddenParamsCount) ||
						(optionalVisibleParamsCount &&
							Object.keys(globalParams).length &&
							!Object.keys(params).length)) &&
					(sizes.length || uniqueInventorySizes.length)
				) {
					// add sizes in params if not exist and setState
					const newParams = { ...params };
					const newSizes = sizes.length ? [...sizes] : [...uniqueInventorySizes];

					for (const size of newSizes) {
						if (!params[size]) newParams[size] = {};
					}

					mergedParams = { ...newParams };
					this.setState({ params: newParams });
				}
			}

			if (!siteLevelParamsCount && !uniqueInventorySizes.length) {
				this.setState({
					formError: 'No inventory found. Please create inventories first.'
				});
				return;
			}

			if (!siteLevelParamsCount && uniqueInventorySizes.length) {
				const newParams = { ...params };

				for (const size of uniqueInventorySizes) {
					if (!params[size]) newParams[size] = {};
				}

				mergedParams = { ...newParams };
				this.setState({ params: newParams });
			}

			if (!Object.keys(mergedParams).length) mergedParams = { ...params };

			if (Object.keys(mergedParams).length) {
				for (const [size, paramsObj] of Object.entries(mergedParams)) {
					mergedParams[size] = { ...paramsObj, ...globalParams };
				}
			} else {
				sizes.forEach(size => {
					mergedParams[size] = globalParams;
				});
			}

			if (typeof bidderConfig.isAmpActive !== 'undefined') {
				/*
					-	convert the value to boolean before saving to the database
					-	the value will be converted back to the corresponding value like true -> 'true' and false -> 'false' when received from the database
					-	this was to be done due to the SelectBox not accepting boolean values
					
					NOTE: this is also being done in the AddManageSizelessBidder
				*/
				bidderConfig.isAmpActive = bidderConfig.isAmpActive === 'true';
			}
			if (typeof bidderConfig.isS2SActive !== 'undefined') {
				bidderConfig.isS2SActive = bidderConfig.isS2SActive === 'true';
			}
			// eslint-disable-next-line no-unused-expressions
			(onBidderAdd && onBidderAdd(bidderConfig, mergedParams)) ||
				(onBidderUpdate && onBidderUpdate(bidderConfig, mergedParams));
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
					[paramKey]: value
				}
			};

			if (paramKey === 'bids' && value === 'net') newState[stateKey].revenueShare = '';

			if (paramKey === 'relation') {
				newState.globalParams = getDefaultBidderParamsByRelation(
					value,
					state.globalParams,
					paramsFromNetworkTree
				);
			}

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

	onDeleteBidder = () => {
		const { onBidderDelete } = this.props;
		const { bidderConfig } = this.state;
		onBidderDelete(bidderConfig.key);
	};

	render() {
		const { openBiddersListView, formType, activeAdUnitSizes } = this.props;
		const {
			formFields,
			bidderConfig: { bids, relation, key: bidderKey },
			errors,
			formError,
			validationSchema,
			sizes,
			params,
			sizesNotAddedOnBidderCard
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
							meta={this.bidderFormFieldsMeta}
							bidderKey={bidderKey}
						/>

						{!!(
							formFields &&
							formFields.params &&
							Object.keys(formFields.params.siteLevel).filter(
								param => formFields.params.siteLevel[param].visible
							).length
						) && (
							<SizewiseParamsFormFields
								bidderKey={bidderKey}
								sizes={sizes}
								formFields={{ params: formFields.params }}
								savedParams={params}
								formType={formType}
								setFormFieldValueInState={this.setFormFieldValueInState}
								saveNonSizelessParams={this.saveNonSizelessParams}
								getCurrentFieldValue={this.getCurrentFieldValue}
								validationSchema={validationSchema}
								addNewSizeInState={this.addNewSizeInState}
								removeSize={this.removeSize}
								errors={errors}
								relation={relation}
								activeAdUnitSizes={activeAdUnitSizes}
								sizesNotAddedOnBidderCard={sizesNotAddedOnBidderCard}
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
