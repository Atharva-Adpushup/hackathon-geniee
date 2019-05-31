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
import { fetchInventorySizes } from '../../../services/hbService';
import SizewiseParamsFormFields from './SizewiseParamsFormFields';

class AddManageNonResponsiveBidder extends React.Component {
	state = {
		formFields: {},
		validationSchema: {},
		bidderConfig: {},
		params: {},
		sizes: [],
		errors: {},
		fetchingSizes: true
	};

	componentDidMount() {
		const { formType, siteId } = this.props;

		fetchInventorySizes(siteId)
			.then(({ data: sizes }) => {
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
								const newState = { formFields, fetchingSizes: false, params: {}, sizes };

								newState.bidderConfig = {};
								for (const paramKey in formFields.bidderConfig) {
									newState.bidderConfig[paramKey] = '';
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
								const newState = {
									formFields,
									fetchingSizes: false,
									sizes: [...new Set([...sizes, ...Object.keys(params)])]
								};

								for (const collectionKey in formFields) {
									newState[collectionKey] = {};

									if (collectionKey === 'params') {
										newState[collectionKey] = params;

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
									...formFields.params
								});

								return newState;
							});
						}

						break;
					}

					default:
				}
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
			});
	}

	addNewSizeInState = adSize => {
		this.setState(state => ({ sizes: [...state.sizes, adSize] }));
	};

	onSubmit = e => {
		e.preventDefault();

		const { onBidderAdd, onBidderUpdate } = this.props;
		const { bidderConfig, params, validationSchema } = this.state;

		const validationResult = formValidator.validate({ ...bidderConfig }, validationSchema);

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
			const newState = {
				[stateKey]: {
					...state[stateKey],
					[paramKey]: value
				}
			};

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

	render() {
		const { openBiddersListView, formType } = this.props;
		const { formFields, errors, fetchingSizes, validationSchema, sizes, params } = this.state;

		return (
			<React.Fragment>
				{!fetchingSizes && (
					<Form horizontal onSubmit={this.onSubmit}>
						<BidderFormFields
							formFields={{ bidderConfig: formFields.bidderConfig }}
							formType={formType}
							setFormFieldValueInState={this.setFormFieldValueInState}
							getCurrentFieldValue={this.getCurrentFieldValue}
							errors={errors}
						/>

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
						<FormGroup>
							<Col>
								<CustomButton type="submit" variant="primary">
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
