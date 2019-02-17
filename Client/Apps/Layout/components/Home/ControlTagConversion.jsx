import React, { Component } from 'react';
import SplitScreen from '../../../../Components/Layout/SplitScreen';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import { CONTROL_CONVERSION_NETWORKS } from '../../constants/index';
import { getRandomString, getEncodedData, getCompiledTemplate } from '../../lib/helpers';
import { copyToClipBoard } from '../../../ApTag/lib/helpers';
import { Row, Col } from 'react-bootstrap';
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
			convertedCode: ''
		};
	}

	setDefaultState() {
		const defaultState = this.getDefaultState();

		this.setState(defaultState);
	}

	handleInputChangeHandler(elementType, inputParam) {
		const elementTypeArray = ['siteId', 'inputCode', 'adNetworkToggle'],
			isInputParam = !!inputParam,
			isElement = !!(isInputParam && inputParam.target),
			isInputParamInElementTypeArray = !!(
				isInputParam &&
				!isElement &&
				elementTypeArray.includes(elementType)
			),
			isValue = !!((isElement && inputParam.target.value) || isInputParamInElementTypeArray);

		if (isValue) {
			const value = isInputParamInElementTypeArray ? inputParam : inputParam.target.value;

			switch (elementType) {
				case 'siteId':
					console.log(`siteid value: ${value}`);
					this.setState({ siteId: value });
					break;

				case 'inputCode':
					console.log(`inputCode value: ${value}`);
					this.setState({ inputCode: value });
					break;

				case 'adNetworkToggle':
					console.log(`control ad: ${value}`);
					this.setState({ adControlType: Number(value) });
					break;
			}
		}
	}

	getConvertedAdCode() {
		const { adControlType, siteId, inputCode } = this.state;
		const template = CONTROL_CONVERSION_NETWORKS[adControlType].template;
		const encodedData = getEncodedData(inputCode);
		const parameterCollection = [
			{ replacee: '_CODE_', replacer: encodedData },
			{ replacee: '_SITEID_', replacer: siteId },
			{ replacee: '_STRING_', replacer: getRandomString(5) }
		];
		const compiledTemplate = getCompiledTemplate(template, parameterCollection);

		return compiledTemplate;
	}

	handleButtonClickHandler(buttonType) {
		switch (buttonType) {
			case 'convertButton':
				const convertedAdCode = this.getConvertedAdCode();
				console.log(convertedAdCode);
				this.setState({ convertedCode: convertedAdCode });
				break;

			case 'resetButton':
				this.setDefaultState();
				break;
		}
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
			],
			{ siteId, inputCode } = this.state;

		return (
			<div className="clearfix">
				<FieldGroup
					id="toggle-button-group"
					label="Select control ad type"
					type="toggle-button-group"
					buttonToggle={buttonToggle}
					onChange={this.handleInputChangeHandler.bind(this, 'adNetworkToggle')}
				/>

				<FieldGroup
					id="input-text-siteId"
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
				<h4 className="u-margin-t3 u-margin-b4">Output</h4>

				{convertedCode ? (
					<Row>
						<Col sm={6} md={12} lg={12} className="u-padding-0">
							<pre>{convertedCode}</pre>
						</Col>
						<Col sm={6} md={12} lg={12} className="u-padding-0">
							<CustomButton
								variant="secondary"
								className=""
								onClick={() => copyToClipBoard(convertedCode)}
							>
								Copy to Clipboard
							</CustomButton>
						</Col>
					</Row>
				) : null}
			</div>
		);
	}

	render() {
		return (
			<SplitScreen
				leftChildren={this.renderControlConversionLeftPanel()}
				rightChildren={this.renderControlConversionRightPanel()}
			/>
		);
	}
}

export default ControlTagConversion;
