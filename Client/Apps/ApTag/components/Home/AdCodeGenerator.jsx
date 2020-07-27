import React, { Component } from 'react';
import {
	Row,
	Col,
	ProgressBar,
	FormControl,
	FormGroup,
	ControlLabel
} from '@/Client/helpers/react-bootstrap-imports';
import CustomList from './CustomList';
import {
	TYPES,
	SIZES,
	CUSTOM_FIELDS,
	CUSTOM_FIELD_DEFAULT_VALUE,
	DISPLAY_AD_MESSAGE,
	AMP_MESSAGE,
	ADCODE
} from '../../configs/commonConsts';
import CopyButtonWrapperContainer from '../../../../Containers/CopyButtonWrapperContainer';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import ActionCard from '../../../../Components/ActionCard/index';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup.jsx';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: '',
			type: '',
			rewardText: '',
			rewardValue: '',
			size: null,
			customFields: {},
			loading: false,
			fluid: true,
			automaticTrigger: true,
			customJsSnippet: '',
			rewardTriggerFunction: ''
		};
		this.selectPlatform = this.selectPlatform.bind(this);
		this.selectType = this.selectType.bind(this);
		this.selectSize = this.selectSize.bind(this);
		this.setCustomField = this.setCustomField.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		this.renderTypeOptions = this.renderTypeOptions.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.renderMainContent = this.renderMainContent.bind(this);
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
		this.getCustomFields = this.getCustomFields.bind(this);
	}

	selectType(type) {
		this.setState({
			type,
			platform: '',
			size: null,
			progress: 50,
			customFields: {}
		});
	}

	selectSize(size) {
		const { progress } = this.state;
		this.setState({
			size,
			progress: progress > 75 ? progress : 75
		});
	}

	setCustomField({ target, target: { name, value, type, checkValidity, required } }) {
		let defaultValue;
		switch (type) {
			case 'number': {
				defaultValue = CUSTOM_FIELD_DEFAULT_VALUE.NUMBER;
				// eslint-disable-next-line no-param-reassign
				value = parseFloat(value) || defaultValue;
				break;
			}

			default: {
				defaultValue = CUSTOM_FIELD_DEFAULT_VALUE.STRING;
			}
		}

		this.setState(state => ({
			customFields: {
				...state.customFields,
				[name]: {
					value,
					isValid: (!required && value === defaultValue) || checkValidity.call(target)
				}
			}
		}));
	}

	getCustomFields() {
		const { customFields } = this.state;
		const customFieldsConfig = CUSTOM_FIELDS;

		return customFieldsConfig.map(customFieldConfig => {
			const { key } = customFieldConfig;
			const customField = customFields[key] || {};
			const { value = CUSTOM_FIELD_DEFAULT_VALUE.STRING, isValid = null } = customField;

			return { ...customFieldConfig, value, isValid };
		});
	}

	saveHandler() {
		const {
			type,
			platform,
			size,
			customFields,
			fluid,
			progress,
			automaticTrigger,
			rewardText,
			rewardValue,
			customJsSnippet,
			rewardTriggerFunction,
			modalText
		} = this.state;

		const { showNotification } = this.props;

		if (
			type === 'rewardedAds' &&
			(!modalText || !rewardText || !rewardValue || !rewardTriggerFunction)
		) {
			return showNotification({
				mode: 'error',
				title: 'Error',
				message: 'All the fields are mandatory',
				autoDismiss: 5
			});
		}

		// terminate if Custom Fields are invalid
		const isCustomFieldsValid = !Object.keys(customFields).find(
			customFieldKey => !customFields[customFieldKey].isValid
		);
		if (!isCustomFieldsValid) return;

		const { createAd, siteId } = this.props;
		const isResponsive = size === 'responsive';
		let width = 1,
			height = 1;

		if (type !== 'rewardedAds') {
			const sizesArray = isResponsive ? 'responsive' : size.split('x');
			width = isResponsive ? 'responsive' : sizesArray[0];
			height = isResponsive ? 'responsive' : sizesArray[1];
		}
		const typeAndPlacement = type.split(/^([^A-Z]+)/);
		typeAndPlacement.shift();

		const ad = {
			width,
			height,
			isManual: true,
			fluid,
			network: 'adpTags',
			networkData: {
				isResponsive: !!(width === 'responsive'),
				formats: ['display']
			},
			formatData: {
				platform, // DESKTOP, MOBILE
				type // DISPLAY, NATIVE, AMP, LINK
			},
			type: 1, // STRUCTURAL
			css: {
				display: 'block',
				margin: '0 auto',
				'text-align': 'center'
			},
			isActive: true
		};

		if (type === 'rewardedAds') {
			delete ad.fluid;

			ad.isRewarded = true;
			ad.networkData.headerBidding = false;
			ad.modalText = modalText;
			ad.rewardText = rewardText;
			ad.rewardValue = rewardValue;
			ad.automaticTrigger = automaticTrigger;
			!ad.automaticTrigger ? (ad.customScript = btoa(customJsSnippet)) : null;
			ad.rewardTriggerFunction = btoa(rewardTriggerFunction);
		}

		// Add Custom Fields in ad obj
		Object.keys(customFields).forEach(customFieldKey => {
			ad[customFieldKey] = customFields[customFieldKey].value;
		});

		this.setState(
			{
				progress: 100,
				loading: true
			},
			() =>
				createAd({
					siteId,
					ad
				})
		);
	}

	resetHandler() {
		const { resetCurrentAd, siteId } = this.props;
		this.setState(
			{
				progress: 0,
				platform: '',
				type: '',
				size: null,
				customFields: {},
				loading: false
			},
			() => resetCurrentAd(siteId)
		);
	}

	renderButton = (label, handler) => (
		<Row style={{ margin: '0px' }}>
			<CustomButton
				variant="primary"
				className="u-margin-t2 u-margin-r3 pull-right"
				onClick={handler}
			>
				{label}
			</CustomButton>
		</Row>
	);

	renderGeneratedAdcode() {
		const { type } = this.state;
		const { adId, maxHeight, siteId } = this.props;
		const isDisplayAd = type !== 'amp';
		const isRewarded = type === 'rewardedAds';
		const customAttributes = maxHeight ? ` max-height="${maxHeight}"` : '';
		const code =
			isDisplayAd && !isRewarded
				? ADCODE.replace(/__AD_ID__/g, adId)
						.replace(/__CUSTOM_ATTRIBS__/, customAttributes)
						.trim()
				: null;
		const message = isDisplayAd ? DISPLAY_AD_MESSAGE.replace(/__SITE_ID__/g, siteId) : AMP_MESSAGE;
		return (
			<Col xs={12}>
				{isDisplayAd && !isRewarded ? <pre>{code}</pre> : null}
				<CustomMessage header="Information" type="info" message={message} />
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={() => this.resetHandler()}
				>
					Create More Ads
				</CustomButton>
				{isDisplayAd && !isRewarded ? (
					<CopyButtonWrapperContainer content={code}>
						<CustomButton variant="secondary" className="u-margin-t3 u-margin-r3 pull-right">
							Copy Adcode
						</CustomButton>
					</CopyButtonWrapperContainer>
				) : null}
			</Col>
		);
	}

	renderMainContent() {
		const { progress, type, automaticTrigger } = this.state;
		const { codeGenerated } = this.props;
		return (
			<div>
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={progress} />
				</div>
				{codeGenerated ? (
					this.renderGeneratedAdcode()
				) : (
					<div>
						{this.renderTypeOptions()}
						{progress >= 50 ? this.renderSizes() : null}

						{type !== 'rewardedAds' ? (progress >= 75 ? this.renderFluidToggle() : null) : null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderModalText() : null}

						{type === 'rewardedAds' && progress >= 75 ? this.renderRewardInput() : null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderAutomaticTriggerToggle() : null}
						{type === 'rewardedAds' && progress >= 75 && !automaticTrigger
							? this.renderCustomScriptInput()
							: null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderRewardTriggerFunction() : null}
						{progress >= 75 ? this.renderButton('Generate AdCode', this.saveHandler) : null}
					</div>
				)}
			</div>
		);
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value,
			progress: 90
		});
	};

	renderSizes() {
		const { size, platform, type } = this.state;

		return (
			<div>
				<CustomList
					heading={type === 'rewardedAds' ? `Select Platform` : `Select Ad Size`}
					subHeading={
						type === 'rewardedAds'
							? 'It only supports mobile Platform'
							: 'AdpPushup supports varied ad sizes'
					}
					leftSize={3}
					rightSize={9}
					toMatch={size}
					platform={platform}
					type={type}
					tabbedList={{
						allowed: SIZES[type.toUpperCase()] ? SIZES[type.toUpperCase()].ALLOWED : [],
						list: {
							responsive: {
								header: 'Responsive',
								key: 'responsive',
								options: false,
								customFields: this.getCustomFields()
							},
							desktop: {
								header: 'Desktop',
								key: 'desktop',
								options: SIZES[type.toUpperCase()][platform.toUpperCase()]
							},
							mobile: {
								header: 'Mobile',
								key: 'mobile',
								options: SIZES[type.toUpperCase()][platform.toUpperCase()]
							}
						}
					}}
					selectPlatform={this.selectPlatform}
					onClick={this.selectSize}
					onCustomFieldValueChange={this.setCustomField}
				/>
			</div>
		);
	}

	// eslint-disable-next-line react/sort-comp
	selectPlatform(platform) {
		const { type } = this.state;
		this.setState({
			platform,
			size: platform === 'responsive' ? 'responsive' : null,
			progress: platform === 'responsive' || type === 'rewardedAds' ? 75 : 50
		});
	}

	renderTypeOptions() {
		const { type } = this.state;
		return (
			<CustomList
				options={TYPES}
				heading="Select Ad Type"
				subHeading="AdpPushup supports varied ad types"
				onClick={this.selectType}
				leftSize={3}
				rightSize={9}
				toMatch={type}
			/>
		);
	}

	renderFluidToggleSubComponent = () => {
		return (
			<div>
				<i style={{ fontSize: '14px', color: '#cf474b' }}>
					The slot height may increase or decrease depending on the rendered ad size
				</i>
			</div>
		);
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	renderModalText = () => {
		const { modalText } = this.state;

		return (
			<React.Fragment>
				<Col md={3} className="modalLabel">
					Modal Text
				</Col>
				<Col md={9} className="modal-form-group">
					<FieldGroup
						name="modalText"
						value={modalText}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="modalText-input"
						placeholder=" Enter Modal Text"
						className="u-padding-v4 u-padding-h4 u-margin-b4 modalText"
					/>
				</Col>
			</React.Fragment>
		);
	};

	renderRewardInput() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { rewardText, rewardValue } = this.state;
		return (
			<div className="Reward">
				<Col md={3} className="rewardLabel">
					Reward Text
				</Col>
				<Col md={9}>
					<FieldGroup
						name="rewardText"
						value={rewardText}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="rewardText-input"
						placeholder=" Enter Reward Text"
						className="u-padding-v4 u-padding-h4 rewardText"
					/>
				</Col>
				<Col md={3} className="rewardLabel u-margin-t4">
					Reward Value
				</Col>
				<Col md={9} className="u-margin-t4">
					<FieldGroup
						name="rewardValue"
						value={rewardValue}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="rewardValue-input"
						placeholder=" Enter Reward Value"
						className="u-padding-v4 u-padding-h4 rewardText"
					/>
				</Col>
			</div>
		);
	}

	renderAutomaticTriggerToggle() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { automaticTrigger } = this.state;
		return (
			<Row>
				<Col md={5}>
					<CustomToggleSwitch
						labelText="Trigger Automatically"
						className="u-margin-b4 u-margin-t4 negative-toggle fluid-Toggle"
						checked={automaticTrigger}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`automaticTrigger-${siteId}`}
						id={`js-automaticTrigger-${siteId}`}
						subText="If this option is enabled, the ad will be triggered whereever the AP Tag is placed.Otherwise one of the conditional triggeres would be used"
					/>
				</Col>
				<Col md={7} />
			</Row>
		);
	}

	renderCustomScriptInput = () => {
		const { customJsSnippet } = this.state;
		return (
			<div className="u-margin-t4 beforeJs">
				<FormGroup controlId="beforeJsSnippet-input">
					<Col md={3}>
						<ControlLabel className="scriptLabel">Custom Script</ControlLabel>
						<small style={{ display: 'block', fontSize: '14px' }}>
							<i> Please call triggerRewardedAd function in your custom script</i>
						</small>
					</Col>
					<Col md={9}>
						<FormControl
							componentClass="textarea"
							placeholder="Custom Script"
							name="customJsSnippet"
							onChange={this.handleChange}
							value={customJsSnippet}
							className="u-padding-v4 u-padding-h4 u-margin-b4 scriptTextArea"
						/>
					</Col>
				</FormGroup>
			</div>
		);
	};

	renderRewardTriggerFunction = () => {
		const { rewardTriggerFunction } = this.state;
		return (
			<div className="u-margin-t4 rewardTriggerFunction">
				<FormGroup controlId="beforeJsSnippet-input">
					<Col md={3}>
						<ControlLabel className="scriptLabel">Post Rewarded Custom Script</ControlLabel>
					</Col>
					<Col md={9}>
						<FormControl
							componentClass="textarea"
							placeholder="Enter script"
							name="rewardTriggerFunction"
							onChange={this.handleChange}
							value={rewardTriggerFunction}
							className="u-padding-v4 u-padding-h4 u-margin-b4 scriptTextArea"
						/>
					</Col>
				</FormGroup>
			</div>
		);
	};

	renderFluidToggle() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { fluid } = this.state;
		return (
			<Row>
				<Col md={5}>
					<CustomToggleSwitch
						labelText="Fluid"
						className="u-margin-b4 negative-toggle fluid-Toggle"
						checked={fluid}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`fluid-${siteId}`}
						id={`js-fluid-${siteId}`}
						subText="Enable this option to display ADX Native Ads"
						subComponent={this.renderFluidToggleSubComponent()}
					/>
				</Col>
				<Col md={7} />
			</Row>
		);
	}

	render() {
		const { loading } = this.state;
		const { codeGenerated } = this.props;
		return (
			<ActionCard className="options-wrapper">
				{loading && !codeGenerated ? <Loader /> : this.renderMainContent()}
			</ActionCard>
		);
	}
}

export default AdCodeGenerator;
