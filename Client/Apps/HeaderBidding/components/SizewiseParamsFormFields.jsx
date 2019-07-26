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
import CustomIcon from '../../../Components/CustomIcon';

class SizewiseParamsFormFields extends React.Component {
	state = {
		activeKey: '',
		tempParams: {},
		tempParamsErrors: {}
	};

	componentDidMount() {
		const { sizes, formFields, savedParams } = this.props;

		this.setState(() => {
			const newState = {
				activeKey: (!!sizes.length && sizes[0].downwardIABSize) || '',
				tempParams: {}
			};

			for (const { downwardIABSize: adSize } of sizes) {
				const params = {};

				for (const paramKey in formFields.params.siteLevel) {
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

			for (const paramKey in formFields.params.siteLevel) {
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

		for (const { downwardIABSize: size, originalSize } of sizes) {
			tabsJSX.push(
				<NavItem key={size} eventKey={size}>
					{`${size} (${originalSize})`}
					{tempParams[size] && tempParams[size].saved ? <CustomIcon icon="check" /> : ''}
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
			const filteredAdSizes = getFilteredAdSizes(
				allAdSizes,
				sizes.map(({ downwardIABSize: size }) => size)
			);

			return (
				<React.Fragment>
					<AdSizeSelector filteredAdSizes={filteredAdSizes} addNewSize={this.addNewSize} />
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<BidderFormFields
					formFields={{ params: formFields.params.siteLevel }}
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
			<Row className="clearfix non-sizeless-params u-margin-v5">
				<Col sm={2} className="size-tabs">
					<Nav bsStyle="pills" stacked activeKey={activeKey} onSelect={this.handleNavSelect}>
						{this.renderTabs()}
					</Nav>
				</Col>
				<Col sm={10} className="size-tab-content">
					{this.renderTabContent()}
				</Col>
			</Row>
		);
	}
}

export default SizewiseParamsFormFields;
