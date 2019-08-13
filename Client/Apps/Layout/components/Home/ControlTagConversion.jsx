import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SplitScreen from '../../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import ActionCard from '../../../../Components/ActionCard/index';

import {
	CONTROL_CONVERSION_NETWORKS,
	NETWORK_COLLECTION,
	NETWORKS_NAME,
	NETWORK_PLACEHOLDERS,
	NETWORK_MEDIANET_INPUT_CODE_REGEXES
} from '../../constants/index';
import { getRandomString, getEncodedData, getCompiledTemplate } from '../../lib/helpers';
import { copyToClipBoard } from '../../../ApTag/lib/helpers';

class ControlTagConversion extends Component {
	constructor(props) {
		super(props);
		this.state = this.getDefaultState();
		this.handleInputChangeHandler = this.handleInputChangeHandler.bind(this);
		this.handleSelectChangeHandler = this.handleSelectChangeHandler.bind(this);
		this.handleButtonClickHandler = this.handleButtonClickHandler.bind(this);
	}

	getDefaultState() {
		const { siteId } = this.props;
		return {
			selectedNetwork: '',
			siteId,
			inputCode: '',
			convertedCode: '',
			medianet: {
				adId: getRandomString(5),
				adWidth: '',
				adHeight: '',
				crId: '',
				versionId: '',
				cId: ''
			}
		};
	}

	setDefaultState() {
		const defaultState = this.getDefaultState();

		this.setState(defaultState);
	}

	setMedianetParamsData(state) {
		const { inputCode } = state;
		const { height, width, versionId, cid, crid } = NETWORK_MEDIANET_INPUT_CODE_REGEXES;
		let heightMatch = inputCode.match(height);
		let widthMatch = inputCode.match(width);
		let versionIdMatch = inputCode.match(versionId);
		let cidMatch = inputCode.match(cid);
		let cridMatch = inputCode.match(crid);
		const isValidMatches = !!(
			heightMatch &&
			heightMatch.length &&
			widthMatch &&
			widthMatch.length &&
			versionIdMatch &&
			versionIdMatch.length &&
			cidMatch &&
			cidMatch.length &&
			cridMatch &&
			cridMatch.length
		);

		if (isValidMatches) {
			heightMatch = heightMatch[0].split(' = ')[1].replace(/"/g, '');
			widthMatch = widthMatch[0].split(' = ')[1].replace(/"/g, '');
			versionIdMatch = versionIdMatch[0].split(' = ')[1].replace(/"/g, '');
			cidMatch = cidMatch[0].split('=')[1].replace(/"/g, '');
			cridMatch = cridMatch[0].split(' = ')[1].replace(/"/g, '');
		}

		const computedState = {
			...state,
			medianet: {
				...state.medianet,
				adHeight: heightMatch,
				adWidth: widthMatch,
				versionId: versionIdMatch,
				cId: cidMatch,
				crId: cridMatch
			}
		};

		this.setState(computedState);
	}

	getConvertedAdCode() {
		const { siteId, inputCode, selectedNetwork } = this.state;
		const {
			medianet: { adId, adWidth, adHeight, crId, versionId, cId }
		} = this.state;
		// Check for ad network toggle UI selection ('All ad networks' or 'Medianet')
		const isValidNetworkSelection = this.isValidNetworkSelection();
		const isNotMedianetNetworkSelection = this.isNotMedianetNetworkSelection();
		const isMedianetNetworkSelection = this.isMedianetNetworkSelection();
		const isValidAllNetworksData = !!(siteId && inputCode);
		const isValidMedianetNetworkData = !!(adId && adWidth && adHeight && crId && versionId && cId);
		const computedNetworkNumber = isMedianetNetworkSelection ? 2 : 1;

		if (!isValidNetworkSelection) {
			// eslint-disable-next-line no-alert
			window.alert('Please select the ad network type to transform code');
			return false;
		}

		if (isNotMedianetNetworkSelection && !isValidAllNetworksData) {
			// eslint-disable-next-line no-alert
			window.alert(`Please enter ${selectedNetwork} ad code`);
			return false;
		}

		if (isMedianetNetworkSelection && !isValidMedianetNetworkData) {
			// eslint-disable-next-line no-alert
			window.alert(`Please enter ${selectedNetwork} ad code as per mentioned format in textbox`);
			return false;
		}

		const {
			[computedNetworkNumber]: { template }
		} = CONTROL_CONVERSION_NETWORKS;
		const parameterCollection = isNotMedianetNetworkSelection
			? [
					{ replacee: '_CODE_', replacer: getEncodedData(inputCode) },
					{ replacee: '_SITEID_', replacer: siteId },
					{ replacee: '_STRING_', replacer: getRandomString(5) }
			  ]
			: [
					{ replacee: /___ADID__/g, replacer: `_${adId}` },
					{ replacee: /__WIDTH__/g, replacer: adWidth },
					{ replacee: /__HEIGHT__/g, replacer: adHeight },
					{ replacee: /__CRID__/g, replacer: crId },
					{ replacee: /__VERSIONID__/g, replacer: versionId },
					{ replacee: /__CID__/g, replacer: cId }
			  ];
		const compiledTemplate = getCompiledTemplate(template, parameterCollection);

		return compiledTemplate;
	}

	isValidNetworkSelection() {
		const { selectedNetwork } = this.state;
		const isValid = !!selectedNetwork;

		return isValid;
	}

	isNotMedianetNetworkSelection() {
		const { selectedNetwork } = this.state;
		const { MEDIANET } = NETWORKS_NAME;
		const isValid = !!(selectedNetwork && selectedNetwork !== MEDIANET);

		return isValid;
	}

	isMedianetNetworkSelection(network) {
		const { selectedNetwork } = this.state;
		const computedNetworkValue = network || selectedNetwork;
		const { MEDIANET } = NETWORKS_NAME;
		const isValid = !!(computedNetworkValue && computedNetworkValue === MEDIANET);

		return isValid;
	}

	isAdSenseNetworkSelection() {
		const { selectedNetwork } = this.state;
		const { ADSENSE } = NETWORKS_NAME;
		const isValid = !!(selectedNetwork && selectedNetwork === ADSENSE);

		return isValid;
	}

	isAdXNetworkSelection() {
		const { selectedNetwork } = this.state;
		const { ADX } = NETWORKS_NAME;
		const isValid = !!(selectedNetwork && selectedNetwork === ADX);

		return isValid;
	}

	isDFPNetworkSelection() {
		const { selectedNetwork } = this.state;
		const { DFP } = NETWORKS_NAME;
		const isValid = !!(selectedNetwork && selectedNetwork === DFP);

		return isValid;
	}

	handleSelectChangeHandler(value) {
		const { medianet, inputCode } = this.state;
		const isMedianetNetworkSelected = this.isMedianetNetworkSelection(value);
		const isValidMedianetData = !!(isMedianetNetworkSelected && inputCode);

		if (isValidMedianetData) {
			this.setMedianetParamsData({ selectedNetwork: value, inputCode, medianet });
			return false;
		}

		this.setState({ selectedNetwork: value });
		return false;
	}

	handleInputChangeHandler(inputParam) {
		const isInputParam = !!inputParam;
		const isElement = !!(isInputParam && inputParam.target);
		const isMedianetNetworkSelected = this.isMedianetNetworkSelection();
		const computedStateObject = {};

		if (isElement) {
			const {
				target: { name, value }
			} = inputParam;
			const { medianet } = this.state;

			switch (name) {
				case 'inputCode':
					if (isMedianetNetworkSelected) {
						this.setMedianetParamsData({ inputCode: value, medianet });
						break;
					}

					computedStateObject.inputCode = value;
					this.setState(computedStateObject);
					break;

				default:
					break;
			}
		}
	}

	handleButtonClickHandler(inputParam) {
		let convertedAdCode;
		const isInputParam = !!inputParam;
		const isElement = !!(isInputParam && inputParam.target);
		const name = isElement && inputParam.target.name;

		switch (name) {
			case 'convertButton':
				convertedAdCode = this.getConvertedAdCode();

				if (!convertedAdCode) {
					return false;
				}

				this.setState({ convertedCode: convertedAdCode });
				break;

			case 'resetButton':
				this.setDefaultState();
				break;

			default:
				break;
		}

		return false;
	}

	renderAllAdNetworksUI() {
		const { siteId, inputCode } = this.state;
		const isAdSenseNetworkSelected = this.isAdSenseNetworkSelection();
		const isDFPNetworkSelected = this.isDFPNetworkSelection();
		const isAdXNetworkSelected = this.isAdXNetworkSelection();
		const isMedianetNetworkSelected = this.isMedianetNetworkSelection();
		let computedPlaceholder = '';

		if (isAdSenseNetworkSelected) {
			computedPlaceholder = NETWORK_PLACEHOLDERS.ADSENSE;
		} else if (isDFPNetworkSelected) {
			computedPlaceholder = NETWORK_PLACEHOLDERS.DFP;
		} else if (isAdXNetworkSelected) {
			computedPlaceholder = NETWORK_PLACEHOLDERS.ADX;
		} else if (isMedianetNetworkSelected) {
			computedPlaceholder = NETWORK_PLACEHOLDERS.MEDIANET;
		}

		return (
			<div className="clearfix">
				<FieldGroup id="input-number-siteId" label="AdPushup Site ID" value={siteId} isTextOnly />

				<FieldGroup
					id="textarea-input-code"
					label="Enter code"
					placeholder={computedPlaceholder}
					rows="12"
					cols="10"
					className=""
					componentClass="textarea"
					name="inputCode"
					onChange={this.handleInputChangeHandler}
					value={inputCode}
				/>
			</div>
		);
	}

	renderControlConversionLeftPanel() {
		const { selectedNetwork } = this.state;
		const computedRenderUI = this.renderAllAdNetworksUI();

		return (
			<div className="clearfix">
				<FieldGroup
					id="toggle-dropdown-button"
					label="Select ad network type"
					type="toggle-dropdown-button"
					onChange={this.handleSelectChangeHandler}
					value={selectedNetwork}
					itemCollection={NETWORK_COLLECTION}
				/>

				{computedRenderUI}

				<CustomButton
					variant="primary"
					className=""
					name="convertButton"
					onClick={this.handleButtonClickHandler}
				>
					Convert
				</CustomButton>
				<CustomButton
					variant="secondary"
					className="u-margin-l3"
					name="resetButton"
					onClick={this.handleButtonClickHandler}
				>
					Reset
				</CustomButton>
			</div>
		);
	}

	renderControlConversionRightPanel() {
		const { convertedCode } = this.state;
		return (
			<div className="clearfix">
				<h4 className="u-margin-t3 u-margin-b4">Transformed Code Output</h4>

				{convertedCode ? (
					<Row>
						<Col sm={6} md={12} lg={12} className="u-padding-0 u-margin-b4">
							<CustomButton
								variant="secondary"
								className=""
								onClick={() => copyToClipBoard(convertedCode)}
							>
								Copy to Clipboard
							</CustomButton>
						</Col>
						<Col sm={6} md={12} lg={12} className="u-padding-0">
							<pre>{convertedCode}</pre>
						</Col>
					</Row>
				) : null}
			</div>
		);
	}

	render() {
		return (
			<ActionCard>
				<SplitScreen
					rootClassName="u-padding-h4 u-padding-v4"
					leftChildren={this.renderControlConversionLeftPanel()}
					rightChildren={this.renderControlConversionRightPanel()}
				/>
			</ActionCard>
		);
	}
}

ControlTagConversion.propTypes = {
	siteId: PropTypes.string.isRequired
};

export default ControlTagConversion;
