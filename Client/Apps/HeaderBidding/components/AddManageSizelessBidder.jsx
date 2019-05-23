/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, FormGroup } from 'react-bootstrap';
import CustomButton from '../../../Components/CustomButton';
import getCommonBidderFields from '../config/commonBidderFields';
import BidderFormFields from './BidderFormFields';

class AddManageSizelessBidder extends React.Component {
	state = {
		formFields: {},
		bidderConfig: {},
		params: {}
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
					params
				};

				if (formFields && Object.keys(formFields).length) {
					this.setState(() => {
						const newState = { formFields };

						for (const collectionKey in formFields) {
							newState[collectionKey] = {};

							for (const paramKey in formFields[collectionKey]) {
								const { value } = formFields[collectionKey][paramKey];
								newState[collectionKey][paramKey] = value || '';
							}
						}

						newState.bidderConfig = { key, name, sizeLess, reusable, ...newState.bidderConfig };
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
		const { bidderConfig, params } = this.state;

		// eslint-disable-next-line no-unused-expressions
		(onBidderAdd && onBidderAdd(bidderConfig, params)) ||
			(onBidderUpdate && onBidderUpdate(bidderConfig, params));
	};

	setFormFieldValueInState = (stateKey, paramKey, value) => {
		this.setState(state => ({ [stateKey]: { ...state[stateKey], [paramKey]: value } }));
	};

	getCurrentFieldValue = (stateKey, paramKey) => {
		const {
			[stateKey]: { [paramKey]: currValue }
		} = this.state;

		return currValue;
	};

	render() {
		const { openBiddersListView, formType } = this.props;
		const { formFields } = this.state;

		return (
			<Form horizontal onSubmit={this.onSubmit}>
				<BidderFormFields
					formFields={formFields}
					formType={formType}
					setFormFieldValueInState={this.setFormFieldValueInState}
					getCurrentFieldValue={this.getCurrentFieldValue}
				/>
				<FormGroup>
					<Col>
						<CustomButton type="submit" variant="primary">
							{formType === 'add' ? 'Add' : 'Update'}
						</CustomButton>
						{formType === 'add' && (
							<CustomButton type="button" variant="secondary" onClick={openBiddersListView}>
								Cancel
							</CustomButton>
						)}
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
