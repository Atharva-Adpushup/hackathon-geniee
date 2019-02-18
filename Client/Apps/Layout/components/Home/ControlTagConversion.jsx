import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import SplitScreen from '../../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import { CONTROL_CONVERSION_NETWORKS } from '../../constants/index';
import { getRandomString, getEncodedData, getCompiledTemplate } from '../../lib/helpers';
import { copyToClipBoard } from '../../../ApTag/lib/helpers';

class ControlTagConversion extends Component {
	constructor(props) {
		super(props);
		this.state = this.getDefaultState();
	}

	getDefaultState() {
		return {
			adControlType: 1,
			siteId: '',
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

	getConvertedAdCode() {
		const { adControlType, siteId, inputCode } = this.state;
		const {
			medianet: { adId, adWidth, adHeight, crId, versionId, cId }
		} = this.state;
		// Check for ad network toggle UI selection ('All ad networks' or 'Medianet')
		const isAllAdNetworksSelection = !!(Number(adControlType) === 1);
		const isMedianetNetworkSelection = !!(Number(adControlType) === 2);

		const isValidAllNetworksData = !!(siteId && inputCode);
		const isValidMedianetNetworkData = !!(adId && adWidth && adHeight && crId && versionId && cId);

		if (isAllAdNetworksSelection && !isValidAllNetworksData) {
			window.alert('Please fill All networks related UI fields');
			return false;
		}

		if (isMedianetNetworkSelection && !isValidMedianetNetworkData) {
			window.alert('Please fill Medianet network related UI fields');
			return false;
		}

		const template = CONTROL_CONVERSION_NETWORKS[adControlType].template;
		const parameterCollection = isAllAdNetworksSelection
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

	handleInputChangeHandler(elementType, inputParam) {
		const elementTypeArray = ['siteId', 'inputCode', 'adNetworkToggle'];
		const isInputParam = !!inputParam;
		const isElement = !!(isInputParam && inputParam.target);
		const isInputParamInElementTypeArray = !!(
			isInputParam &&
			!isElement &&
			elementTypeArray.includes(elementType)
		);
		const isValue = !!((isElement && inputParam.target.value) || isInputParamInElementTypeArray);

		if (isValue) {
			const value = isInputParamInElementTypeArray ? inputParam : inputParam.target.value;
			const { medianet } = this.state;

			switch (elementType) {
				case 'siteId':
					this.setState({ siteId: value });
					break;

				case 'inputCode':
					this.setState({ inputCode: value });
					break;

				case 'adNetworkToggle':
					this.setState({ adControlType: Number(value) });
					break;

				case 'adId':
					medianet.adId = value;
					this.setState({ medianet });
					break;

				case 'adWidth':
					medianet.adWidth = Number(value);
					this.setState({ medianet });
					break;

				case 'adHeight':
					medianet.adHeight = Number(value);
					this.setState({ medianet });
					break;

				case 'crId':
					medianet.crId = Number(value);
					this.setState({ medianet });
					break;

				case 'versionId':
					medianet.versionId = Number(value);
					this.setState({ medianet });
					break;

				case 'cId':
					medianet.cId = Number(value);
					this.setState({ medianet });
					break;

				default:
					break;
			}
		}
	}

	handleButtonClickHandler(buttonType) {
		let convertedAdCode;

		switch (buttonType) {
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

	renderMedianetNetworkUI() {
		const {
			medianet: { adId, adWidth, adHeight, crId, versionId, cId }
		} = this.state;

		return (
			<div className="clearfix">
				<FieldGroup
					id="input-text-adId"
					label="Enter ad incremental id"
					type="text"
					placeholder="Random alphanumeric values of 5 digits like 12wsa, 6hw5n etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'adId')}
					value={adId}
				/>

				<FieldGroup
					id="input-number-adWidth"
					label="Enter ad width"
					type="number"
					placeholder="For example 728, 300, 320, 480, 160, 900 etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'adWidth')}
					value={adWidth}
				/>

				<FieldGroup
					id="input-number-adHeight"
					label="Enter ad height"
					type="number"
					placeholder="For example 60, 200, 250, 600 etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'adHeight')}
					value={adHeight}
				/>

				<FieldGroup
					id="input-number-crId"
					label="Enter ad customer relationship id (crid)"
					type="number"
					placeholder="For example 12345678 etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'crId')}
					value={crId}
				/>

				<FieldGroup
					id="input-number-versionId"
					label="Enter ad version id (versionId)"
					type="number"
					placeholder="For example 87654321 etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'versionId')}
					value={versionId}
				/>

				<FieldGroup
					id="input-number-cId"
					label="Enter ad customer id (cId)"
					type="number"
					placeholder="For example 12348765 etc."
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'cId')}
					value={cId}
				/>
			</div>
		);
	}

	renderAllAdNetworksUI() {
		const { siteId, inputCode } = this.state;

		return (
			<div className="clearfix">
				<FieldGroup
					id="input-number-siteId"
					label="Enter site id"
					type="number"
					placeholder="For example 25019, 31000"
					className=""
					onChange={this.handleInputChangeHandler.bind(this, 'siteId')}
					value={siteId}
				/>

				<FieldGroup
					id="textarea-input-code"
					label="Enter code"
					placeholder="For example (function() { console.log('Example code'); }());"
					rows="10"
					cols="10"
					className=""
					componentClass="textarea"
					onChange={this.handleInputChangeHandler.bind(this, 'inputCode')}
					value={inputCode}
				/>
			</div>
		);
	}

	renderControlConversionLeftPanel() {
		const buttonToggle = [
			{
				value: 1,
				text: [CONTROL_CONVERSION_NETWORKS[1].name]
			},
			{
				value: 2,
				text: [CONTROL_CONVERSION_NETWORKS[2].name]
			}
		];
		const { adControlType } = this.state;
		const isAllAdNetworksSelection = !!(Number(adControlType) === 1);

		return (
			<div className="clearfix">
				<FieldGroup
					id="toggle-button-group"
					label="Select control ad type"
					type="toggle-button-group"
					buttonToggle={buttonToggle}
					onChange={this.handleInputChangeHandler.bind(this, 'adNetworkToggle')}
				/>

				{isAllAdNetworksSelection ? this.renderAllAdNetworksUI() : this.renderMedianetNetworkUI()}

				<CustomButton
					variant="primary"
					className=""
					onClick={this.handleButtonClickHandler.bind(this, 'convertButton')}
				>
					Convert
				</CustomButton>
				<CustomButton
					variant="secondary"
					className="u-margin-l3"
					onClick={this.handleButtonClickHandler.bind(this, 'resetButton')}
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
				<h4 className="u-margin-t3 u-margin-b4">Converted Code Output</h4>

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
			<SplitScreen
				rootClassName="u-padding-h4 u-padding-v5"
				leftChildren={this.renderControlConversionLeftPanel()}
				rightChildren={this.renderControlConversionRightPanel()}
			/>
		);
	}
}

export default ControlTagConversion;
