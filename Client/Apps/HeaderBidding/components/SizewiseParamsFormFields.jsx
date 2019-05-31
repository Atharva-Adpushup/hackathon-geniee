/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Row, Col, Nav, NavItem } from 'react-bootstrap';
import CustomButton from '../../../Components/CustomButton';
import BidderFormFields from './BidderFormFields';
import formValidator from '../../../helpers/formValidator';
import allAdSizes from '../constants/adSizes';
import AdSizeSelector from './AdSizeSelector';
import { getFilteredAdSizes } from '../helpers/commonHelpers';

class SizewiseParamsFormFields extends React.Component {
	state = {
		activeKey: '',
		tempParams: {},
		tempParamsErrors: {}
	};

	componentDidMount() {
		const { sizes, formFields, savedParams } = this.props;

		this.setState(() => {
			const newState = { activeKey: sizes[0], tempParams: {} };

			for (const adSize of sizes) {
				const params = {};

				for (const paramKey in formFields.params) {
					const value = savedParams[adSize] && savedParams[adSize][paramKey];
					params[paramKey] = value || '';
				}

				newState.tempParams[adSize] = { ...params, saved: !!savedParams[adSize] };
			}

			return newState;
		});
	}

	addNewSize = adSize => {
		const { addNewSizeInState, formFields } = this.props;

		this.setState(state => {
			const params = {};

			for (const paramKey in formFields.params) {
				params[paramKey] = '';
			}

			return {
				activeKey: adSize,
				tempParams: { ...state.tempParams, [adSize]: { ...params, saved: false } }
			};
		});

		addNewSizeInState(adSize);
	};

	setParamInTempState = (adSize, paramKey, value) => {
		this.setState(state => ({
			tempParams: {
				...state.tempParams,
				[adSize]: { ...state.tempParams[adSize], [paramKey]: value }
			}
		}));
	};

	getCurrentParamValue = (adSize, paramKey) => {
		const {
			tempParams: {
				[adSize]: { [paramKey]: currValue }
			}
		} = this.state;

		return currValue;
	};

	saveParams = adSize => {
		let {
			tempParams: { [adSize]: params }
		} = this.state;
		params = { ...params };
		delete params.saved;
		const { saveNonSizelessParams, validationSchema } = this.props;

		// first validate
		const validationResult = formValidator.validate({ ...params }, validationSchema);

		if (validationResult.isValid) {
			this.setState(state => {
				const newErrorsState = { ...state.tempParamsErrors };
				delete newErrorsState[adSize];

				return {
					tempParamsErrors: newErrorsState,
					tempParams: {
						...state.tempParams,
						[adSize]: { ...state.tempParams[adSize], saved: true }
					}
				};
			});

			saveNonSizelessParams(adSize, params);
		} else {
			this.setState(state => ({
				tempParamsErrors: {
					...state.tempParamsErrors,
					[adSize]: validationResult.errors
				}
			}));
		}
	};

	renderTabs = () => {
		const { sizes } = this.props;
		const { tempParams } = this.state;
		const tabsJSX = [];

		for (const size of sizes) {
			tabsJSX.push(
				<NavItem key={size} eventKey={size}>
					{size}
					{tempParams[size] && tempParams[size].saved ? ' [added]' : ''}
				</NavItem>
			);
		}

		tabsJSX.push(
			<NavItem key="add-size" eventKey="add-size">
				+ Add Size
			</NavItem>
		);

		return tabsJSX;
	};

	renderTabContent = () => {
		const { formFields, formType, sizes } = this.props;
		const { activeKey: adSize, tempParamsErrors, tempParams } = this.state;

		if (adSize === 'add-size') {
			const filteredAdSizes = getFilteredAdSizes(allAdSizes, sizes);

			return (
				<React.Fragment>
					<AdSizeSelector filteredAdSizes={filteredAdSizes} addNewSize={this.addNewSize} />
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<BidderFormFields
					formFields={{ params: formFields.params }}
					formType={formType}
					setParamInTempState={this.setParamInTempState}
					adSize={adSize}
					getCurrentParamValue={this.getCurrentParamValue}
					tempParamsErrors={tempParamsErrors}
				/>
				<CustomButton type="button" variant="secondary" onClick={() => this.saveParams(adSize)}>
					{tempParams[adSize] && tempParams[adSize].saved ? 'Update Params' : 'Add Params'}
				</CustomButton>
			</React.Fragment>
		);
	};

	handleNavSelect = value => {
		this.setState({ activeKey: value });
	};

	render() {
		const { activeKey } = this.state;
		return (
			<Row className="clearfix">
				<Col sm={4}>
					<Nav bsStyle="pills" stacked activeKey={activeKey} onSelect={this.handleNavSelect}>
						{this.renderTabs()}
					</Nav>
				</Col>
				<Col sm={8}>{this.renderTabContent()}</Col>
			</Row>
		);
	}
}

export default SizewiseParamsFormFields;
