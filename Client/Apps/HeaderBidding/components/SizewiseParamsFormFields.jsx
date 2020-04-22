/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Row, Col, Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';
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
		const { sizes, formFields, savedParams, relation } = this.props;

		this.setState(() => {
			const newState = {
				activeKey: (!!sizes.length && sizes[0]) || '',
				tempParams: this.getDefaultTempParams(sizes, formFields, savedParams, relation)
			};

			for (const adSize of sizes) {
				const params = {};

				for (const paramKey in formFields.params.siteLevel) {
					if (savedParams[adSize]) {
						params[paramKey] = savedParams[adSize][paramKey];

						// eslint-disable-next-line no-continue
						continue;
					}

					if (
						!formFields.params.siteLevel[paramKey].visible &&
						formFields.params.siteLevel[paramKey].value !== undefined
					) {
						params[paramKey] = formFields.params.siteLevel[paramKey].value;

						// eslint-disable-next-line no-continue
						continue;
					}

					params[paramKey] =
						formFields.params.siteLevel[paramKey].defaultValue ||
						(formFields.params.siteLevel[paramKey].dataType === 'number' ? null : '');
				}

				newState.tempParams[adSize] = { ...params, saved: !!savedParams[adSize] };
			}

			return newState;
		});
	}

	componentDidUpdate(prevProps) {
		const { sizes, formFields, savedParams, relation } = this.props;
		if (relation !== prevProps.relation) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState(() => {
				const newState = {
					tempParams: this.getDefaultTempParams(sizes, formFields, savedParams, relation)
				};

				return newState;
			});
		}
	}

	getDefaultTempParams = (sizes, formFields, savedParams, relation) => {
		const tempParams = {};

		for (const adSize of sizes) {
			const params = {};

			for (const paramKey in formFields.params.siteLevel) {
				if (savedParams[adSize]) {
					params[paramKey] = savedParams[adSize][paramKey];

					// eslint-disable-next-line no-continue
					continue;
				}

				if (
					!formFields.params.siteLevel[paramKey].visible &&
					formFields.params.siteLevel[paramKey].value !== undefined
				) {
					params[paramKey] = formFields.params.siteLevel[paramKey].value;

					// eslint-disable-next-line no-continue
					continue;
				}

				if (relation === 'adpushup') {
					params[paramKey] =
						formFields.params.siteLevel[paramKey].defaultValue ||
						(formFields.params.siteLevel[paramKey].dataType === 'number' ? null : '');
				}

				if (relation === 'direct') {
					params[paramKey] =
						formFields.params.siteLevel[paramKey].dataType === 'number' ? null : '';
				}
			}

			tempParams[adSize] = { ...params, saved: !!savedParams[adSize] };
		}

		return tempParams;
	};

	addNewSize = adSize => {
		const { addNewSizeInState, formFields, relation, bidderKey } = this.props;

		this.setState(state => {
			const params = {};

			for (const paramKey in formFields.params.siteLevel) {
				if (
					!formFields.params.siteLevel[paramKey].visible &&
					formFields.params.siteLevel[paramKey].value !== undefined
				) {
					params[paramKey] = formFields.params.siteLevel[paramKey].value;

					// eslint-disable-next-line no-continue
					continue;
				}

				if (bidderKey === 'ix' && paramKey === 'size') {
					params[paramKey] = adSize.split('x').map(val => parseInt(val, 10));
				} else {
					params[paramKey] =
						(relation === 'adpushup' && formFields.params.siteLevel[paramKey].defaultValue) ||
						(formFields.params.siteLevel[paramKey].dataType === 'number' ? null : '');
				}
			}

			return {
				activeKey: adSize,
				tempParams: { ...state.tempParams, [adSize]: { ...params, saved: false } }
			};
		});

		addNewSizeInState(adSize);
	};

	deleteAdSize = adSize => {
		const { removeSize, sizes } = this.props;
		removeSize(adSize);
		const { tempParams } = this.state || {};
		const newTempParams = {
			...tempParams
		};
		delete newTempParams[adSize];
		this.setState(state => ({
			...state,
			activeKey: sizes[0] || '',
			tempParams: newTempParams
		}));
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
					<span className="iab-size">{size}</span>
					{tempParams[size] && tempParams[size].saved ? (
						<CustomIcon icon="check" className="check-icon" />
					) : (
						''
					)}
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

		if (!sizes.length) {
			return <p className="no-inventory-warning">Please add an Inventory size first</p>;
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
				<Row>
					<Col sm={12} className="tab-content-buttons-container">
						<CustomButton type="button" variant="primary" onClick={() => this.saveParams(adSize)}>
							{tempParams[adSize] && tempParams[adSize].saved ? 'Update Params' : 'Add Params'}
						</CustomButton>
						<CustomButton
							type="button"
							variant="secondary"
							onClick={() => this.deleteAdSize(adSize)}
							className="u-margin-l2"
						>
							Remove Size
						</CustomButton>
					</Col>
				</Row>
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
				<Col sm={3} className="size-tabs">
					<Nav bsStyle="pills" stacked activeKey={activeKey} onSelect={this.handleNavSelect}>
						{this.renderTabs()}
					</Nav>
				</Col>
				<Col sm={9} className="size-tab-content">
					{this.renderTabContent()}
				</Col>
			</Row>
		);
	}
}

export default SizewiseParamsFormFields;
