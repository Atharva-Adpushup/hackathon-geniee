import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SplitScreen from '../../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/Selectbox/index';
import { CONTROL_CONVERSION_NETWORKS, NETWORKS_COLLECTION } from '../../constants/index';
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

	getConvertedAdCode() {
		const { siteId, inputCode } = this.state;
		const {
			medianet: { adId, adWidth, adHeight, crId, versionId, cId }
		} = this.state;
		// Check for ad network toggle UI selection ('All ad networks' or 'Medianet')
		const isAllAdNetworksSelection = this.isNotMedianetNetworkSelection();
		const isMedianetNetworkSelection = this.isMedianetNetworkSelection();
		const isValidAllNetworksData = !!(siteId && inputCode);
		const isValidMedianetNetworkData = !!(adId && adWidth && adHeight && crId && versionId && cId);
		const computedNetworkNumber = isMedianetNetworkSelection ? 2 : 1;

		if (isAllAdNetworksSelection && !isValidAllNetworksData) {
			// eslint-disable-next-line no-alert
			window.alert('Please fill All networks related UI fields');
			return false;
		}

		if (isMedianetNetworkSelection && !isValidMedianetNetworkData) {
			// eslint-disable-next-line no-alert
			window.alert('Please fill Medianet network related UI fields');
			return false;
		}

		const {
			[computedNetworkNumber]: { template }
		} = CONTROL_CONVERSION_NETWORKS;
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

	isValidNetworkSelection() {
		const { selectedNetwork } = this.state;
		const isValid = !!selectedNetwork;

		return isValid;
	}

	isNotMedianetNetworkSelection() {
		const { selectedNetwork } = this.state;
		const isValid = !!(selectedNetwork && selectedNetwork !== 'medianet');

		return isValid;
	}

	isMedianetNetworkSelection() {
		const { selectedNetwork } = this.state;
		const isValid = !!(selectedNetwork && selectedNetwork === 'medianet');

		return isValid;
	}

	renderSelect = (value, label, changeHandler, array) => (
		<div className="u-margin-b4">
			<p className="u-margin-b3">{label}</p>
			<SelectBox
				selected={value}
				onSelect={changeHandler}
				title={label}
				id={label.toUpperCase()}
				options={array}
			/>
		</div>
	);

	handleSelectChangeHandler(value) {
		this.setState({ selectedNetwork: value });
	}

	handleInputChangeHandler(inputParam) {
		const isInputParam = !!inputParam;
		const isElement = !!(isInputParam && inputParam.target);
		const isValue = !!(isElement && inputParam.target.value);

		if (isValue) {
			const {
				target: { name, value }
			} = inputParam;
			const { medianet } = this.state;

			switch (name) {
				case 'inputCode':
					this.setState({ inputCode: value });
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
					name="adId"
					onChange={this.handleInputChangeHandler}
					value={adId}
				/>

				<FieldGroup
					id="input-number-adWidth"
					label="Enter ad width"
					type="number"
					placeholder="For example 728, 300, 320, 480, 160, 900 etc."
					className=""
					name="adWidth"
					onChange={this.handleInputChangeHandler}
					value={adWidth}
				/>

				<FieldGroup
					id="input-number-adHeight"
					label="Enter ad height"
					type="number"
					placeholder="For example 60, 200, 250, 600 etc."
					className=""
					name="adHeight"
					onChange={this.handleInputChangeHandler}
					value={adHeight}
				/>

				<FieldGroup
					id="input-number-crId"
					label="Enter ad customer relationship id (crid)"
					type="number"
					placeholder="For example 12345678 etc."
					className=""
					name="crId"
					onChange={this.handleInputChangeHandler}
					value={crId}
				/>

				<FieldGroup
					id="input-number-versionId"
					label="Enter ad version id (versionId)"
					type="number"
					placeholder="For example 87654321 etc."
					className=""
					name="versionId"
					onChange={this.handleInputChangeHandler}
					value={versionId}
				/>

				<FieldGroup
					id="input-number-cId"
					label="Enter ad customer id (cId)"
					type="number"
					placeholder="For example 12348765 etc."
					className=""
					name="cId"
					onChange={this.handleInputChangeHandler}
					value={cId}
				/>
			</div>
		);
	}

	renderAllAdNetworksUI() {
		const { siteId, inputCode } = this.state;

		return (
			<div className="clearfix">
				<FieldGroup id="input-number-siteId" label="AdPushup Site ID" value={siteId} isTextOnly />

				<FieldGroup
					id="textarea-input-code"
					label="Enter code"
					placeholder={`For example, AdSense ad code: 
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
	style="display:block"
	data-ad-client="ca-pub-XXXXXXXXXXXX"
	data-ad-slot="XXXXXXXX"
	data-full-width-responsive="true"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script> `}
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
		const isValidNetworkSelection = this.isValidNetworkSelection();
		const isMedianetNetworkSelection = this.isMedianetNetworkSelection();
		const isNotMedianetNetworkSelection = this.isNotMedianetNetworkSelection();
		let computedRenderUI;

		if (!isValidNetworkSelection || isNotMedianetNetworkSelection) {
			computedRenderUI = this.renderAllAdNetworksUI();
		} else if (isMedianetNetworkSelection) {
			computedRenderUI = this.renderMedianetNetworkUI();
		}

		return (
			<div className="clearfix">
				{this.renderSelect(
					selectedNetwork,
					'Select ad network type',
					this.handleSelectChangeHandler,
					NETWORKS_COLLECTION
				)}

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
			<SplitScreen
				rootClassName="u-padding-h4 u-padding-v5"
				leftChildren={this.renderControlConversionLeftPanel()}
				rightChildren={this.renderControlConversionRightPanel()}
			/>
		);
	}
}

ControlTagConversion.propTypes = {
	siteId: PropTypes.string.isRequired
};

export default ControlTagConversion;
