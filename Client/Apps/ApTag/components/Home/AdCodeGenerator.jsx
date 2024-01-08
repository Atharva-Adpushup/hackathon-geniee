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
	ADCODE,
	INLINE_STYLE,
	INSTREAM_RESPONSIVE_PLATFORMS,
	INSTREAM_FORMAT_TYPES
} from '../../configs/commonConsts';
import CopyButtonWrapperContainer from '../../../../Containers/CopyButtonWrapperContainer';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import ActionCard from '../../../../Components/ActionCard/index';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup.jsx';
import SelectBox from '../../../../Components/SelectBox';
import siteService from '../../../../services/siteService';
import {
	getInstreamSectionIds,
	checkAndGetBvsSectionIds,
	checkAndGetCompanionSectionIds
} from '../../lib/helpers';

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
			rewardTriggerFunction: '',
			instreamSectionId: [],
			bvsSectionId: [],
			companionSectionId: [],
			selectedInstreamOption: null,
			responsivePlatform: null
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
		this.renderBvsSelectBox = this.renderBvsSelectBox.bind(this);
		this.renderFramerateCompanionSelectBox = this.renderFramerateCompanionSelectBox.bind(this);
	}

	selectType(type) {
		const isRewarded = type === 'rewardedAds';
		this.setState({
			type,
			platform: isRewarded ? 'mobile' : '',
			size: null,
			progress: isRewarded ? 75 : 50,
			customFields: {}
		});
		const isInstream = this.checkIfInstreamAd();

		if (isInstream) {
			this.resetCompanionSelectbox();
		}
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
			modalText,
			selectedOptionName,
			responsivePlatform
		} = this.state;

		const { showNotification, dataForAuditLogs } = this.props;

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
		let width = 1;

		let height = 1;

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

		if (type === INSTREAM_FORMAT_TYPES.FRAMERATE_BVS && selectedOptionName) {
			ad.instreamSectionId = selectedOptionName;
			// setting formatData.type===instream here as we use type===instream for reporting and we need instream as a common key for both Bvs and Companion.
			ad.formatData.type = INSTREAM_FORMAT_TYPES.INSTREAM;
			ad.formatData.subType = INSTREAM_FORMAT_TYPES.SUBTYPES.BVS;
		}
		if (type === INSTREAM_FORMAT_TYPES.FRAMERATE_BVS && responsivePlatform) {
			ad.formatData.responsivePlatform = responsivePlatform;
		}

		if (type === INSTREAM_FORMAT_TYPES.FRAMERATE_COMPANION && selectedOptionName) {
			ad.framerateCompanionAd = {
				framerateSectionId: selectedOptionName
			};
			// setting formatData.type===instream here as we use type===instream for reporting and we need instream as a common key for both Bvs and Companion.
			ad.formatData.type = INSTREAM_FORMAT_TYPES.INSTREAM;
			ad.formatData.subType = INSTREAM_FORMAT_TYPES.SUBTYPES.COMPANION;
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
					ad,
					dataForAuditLogs
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
		const { type, size } = this.state;
		const { adId, maxHeight, siteId } = this.props;
		const isDisplayAd = type !== 'amp';
		const isRewarded = type === 'rewardedAds';
		const isResponsive = !!(size === 'responsive');
		let customAttributes = '';
		if (!isRewarded && !isResponsive && size) {
			const [adWidth, adHeight] = size.split('x');
			const inlineCode = INLINE_STYLE.replace(/__AD_WIDTH__/, adWidth).replace(
				/__AD_HEIGHT__/,
				adHeight
			);
			customAttributes = maxHeight ? ` max-height="${maxHeight}"` : inlineCode;
		}
		if (isRewarded || isResponsive) {
			customAttributes = maxHeight ? ` max-height="${maxHeight}"` : '';
		}
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
		const { progress, type, automaticTrigger, selectedInstreamOption } = this.state;
		const { codeGenerated } = this.props;
		const canGenerateAdCode =
			type !== 'instream' || (type === 'instream' && selectedInstreamOption);

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
						{type === INSTREAM_FORMAT_TYPES.FRAMERATE_BVS && progress >= 75
							? this.renderBvsSelectBox()
							: null}
						{type === INSTREAM_FORMAT_TYPES.FRAMERATE_COMPANION && progress >= 75
							? this.renderFramerateCompanionSelectBox()
							: null}
						{type !== 'rewardedAds' ? (progress >= 75 ? this.renderFluidToggle() : null) : null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderModalText() : null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderRewardInput() : null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderAutomaticTriggerToggle() : null}
						{type === 'rewardedAds' && progress >= 75 && !automaticTrigger
							? this.renderCustomScriptInput()
							: null}
						{type === 'rewardedAds' && progress >= 75 ? this.renderRewardTriggerFunction() : null}
						{progress >= 75 && canGenerateAdCode
							? this.renderButton('Generate AdCode', this.saveHandler)
							: null}
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
		const { size, platform, type, responsivePlatform } = this.state;
		const options = INSTREAM_RESPONSIVE_PLATFORMS;
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
				{/* added a selectbox for selecting responsivePlatform since we create responsive units for both desktop and mobile. */}
				{type === INSTREAM_FORMAT_TYPES.FRAMERATE_BVS &&
					platform === INSTREAM_FORMAT_TYPES.PLATFORM && (
						<div className="instream-select-box">
							<Row>
								<Col md={3}>
									<div>Select BVS Platform</div>
								</Col>
								<Col md={9}>
									<div
										className="platform-select-box"
										style={{ width: '400px', marginLeft: '40px', marginBottom: '10px' }}
									>
										<SelectBox
											id="responsive-select"
											options={options}
											title="Select Option"
											wrapperClassName="select-box-wrapper"
											selected={responsivePlatform}
											onSelect={this.handleSelectPlatform}
										/>
									</div>
								</Col>
							</Row>
						</div>
					)}
			</div>
		);
	}

	checkIfInstreamAd() {
		const { type } = this.state;
		return (
			type === INSTREAM_FORMAT_TYPES.FRAMERATE_BVS ||
			type === INSTREAM_FORMAT_TYPES.FRAMERATE_COMPANION
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
		const isInstream = this.checkIfInstreamAd();

		if (isInstream) {
			this.resetCompanionSelectbox();
		}
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

	isSelectedBvsOptionPresent = (selectedInstreamSection, bvsSectionId) =>
		selectedInstreamSection && Object.values(bvsSectionId).includes(selectedInstreamSection.name);

	isSelectedCompanionOptionPresent = (selectedInstreamSection, companionSectionId, platform) =>
		selectedInstreamSection && companionSectionId[platform].includes(selectedInstreamSection.name);

	// finds if instream section ID is already present in the bvsSectionId object.
	isBvsMatchingSectionId = params => {
		const {
			selectedOptionName,
			selectedInstreamSection,
			bvsSectionId,
			responsivePlatform
		} = params;
		if (!selectedOptionName) {
			return false;
		}
		return this.isSelectedBvsOptionPresent(
			selectedInstreamSection,
			bvsSectionId,
			responsivePlatform
		);
	};

	isCompanionMatchingSectionId = isCompanionMatchingSectionId => {
		const {
			selectedOptionName,
			selectedInstreamSection,
			companionSectionId,
			platform
		} = isCompanionMatchingSectionId;
		if (!selectedOptionName) {
			return false;
		}
		return this.isSelectedCompanionOptionPresent(
			selectedInstreamSection,
			companionSectionId,
			platform
		);
	};

	findSelectedInstreamSection = (instreamSectionId, selectedInstreamOption) => {
		const selectedInstreamSection = instreamSectionId.find(
			item => item.value === selectedInstreamOption
		);
		return selectedInstreamSection;
	};

	handleSectionSelect = (selectedInstreamOption, sectionType) => {
		const {
			bvsSectionId,
			instreamSectionId,
			platform,
			responsivePlatform,
			companionSectionId
		} = this.state;
		let selectedOptionName = '';
		let showWarning = false;

		const selectedInstreamSection = this.findSelectedInstreamSection(
			instreamSectionId,
			selectedInstreamOption
		);

		if (!selectedInstreamSection) {
			return;
		}
		selectedOptionName = selectedInstreamSection.name;

		if (sectionType === INSTREAM_FORMAT_TYPES.SUBTYPES.BVS) {
			const bvsAdParams = {
				selectedOptionName,
				selectedInstreamSection,
				bvsSectionId,
				platform,
				responsivePlatform
			};
			showWarning = this.isBvsMatchingSectionId(bvsAdParams);
		} else if (sectionType === INSTREAM_FORMAT_TYPES.SUBTYPES.COMPANION) {
			const companionAdsParams = {
				selectedOptionName,
				selectedInstreamSection,
				companionSectionId,
				platform
			};
			showWarning = this.isCompanionMatchingSectionId(companionAdsParams);
		}

		this.setState({
			selectedInstreamOption,
			selectedOptionName,
			showWarning,
			matchingSectionName: selectedInstreamSection ? selectedInstreamSection.name : null
		});
	};

	handleBvsSectionSelect = selectedInstreamOption => {
		this.handleSectionSelect(selectedInstreamOption, INSTREAM_FORMAT_TYPES.SUBTYPES.BVS);
	};

	handleCompanionSectionSelect = selectedInstreamOption => {
		this.handleSectionSelect(selectedInstreamOption, INSTREAM_FORMAT_TYPES.SUBTYPES.COMPANION);
	};

	// handling selectbox for responsive platform options.
	handleSelectPlatform = selectedPlatformOption => {
		// resetting options for instream.
		this.setState({ responsivePlatform: selectedPlatformOption, selectedInstreamOption: null });
	};

	resetCompanionSelectbox() {
		this.setState({
			selectedInstreamOption: null,
			showWarning: false,
			matchingSectionName: null
		});
	}

	componentDidMount() {
		const { siteId } = this.props;

		// fetching instream config.
		siteService.getInstreamConfig(siteId).then(responseData => {
			const {
				data: {
					data: { config }
				}
			} = responseData;

			// extracting instream sectionId's to display on the selextbox.
			const instreamSectionId = getInstreamSectionIds(config);
			// getting the section Id's that already has bvs enabled.
			const bvsSectionId = checkAndGetBvsSectionIds(config);
			// getting the section Id's that already has companion ads enabled.
			const companionSectionId = checkAndGetCompanionSectionIds(config);
			this.setState({ instreamSectionId, bvsSectionId, companionSectionId });
		});
	}

	renderBvsSelectBox() {
		const {
			instreamSectionId,
			selectedInstreamOption,
			showWarning,
			matchingSectionName,
			platform,
			responsivePlatform
		} = this.state;

		const selectedPlatformToShow = platform === 'responsive' ? responsivePlatform : platform;
		return (
			<div>
				<Row>
					<Col md={3}>
						<div className="instream-section">
							<h3>Instream Section</h3>
						</div>
					</Col>
					<Col md={9}>
						<div className="instream-select-box" style={{ width: '400px', marginLeft: '40px' }}>
							<SelectBox
								id="empty-select"
								options={instreamSectionId}
								title="Select Option"
								wrapperClassName="select-box-wrapper"
								selected={selectedInstreamOption}
								onSelect={this.handleBvsSectionSelect}
							/>
							{showWarning && (
								<div className="warning-message" style={{ color: 'red', fontSize: '14px' }}>
									The section id {matchingSectionName} already has Bvs enabled on{' '}
									{selectedPlatformToShow}.
								</div>
							)}
						</div>
					</Col>
				</Row>
			</div>
		);
	}

	renderFramerateCompanionSelectBox() {
		const {
			instreamSectionId,
			selectedInstreamOption,
			showWarning,
			matchingSectionName,
			platform,
			responsivePlatform
		} = this.state;

		const selectedPlatformToShow =
			platform === INSTREAM_FORMAT_TYPES.PLATFORM ? responsivePlatform : platform;
		return (
			<div>
				<Row>
					<Col md={3}>
						<div className="framerate-companion-section">
							<h3>Framerate Companion Section</h3>
						</div>
					</Col>
					<Col md={9}>
						<div
							className="framerate-companion-select-box"
							style={{ width: '400px', marginLeft: '40px', marginTop: '15px' }}
						>
							<SelectBox
								id="empty-select"
								options={instreamSectionId}
								title="Select Option"
								wrapperClassName="select-box-wrapper"
								selected={selectedInstreamOption}
								onSelect={this.handleCompanionSectionSelect}
							/>
							{showWarning && (
								<div className="warning-message" style={{ color: 'red', fontSize: '14px' }}>
									The section id {matchingSectionName} already has Companion enabled on{' '}
									{selectedPlatformToShow}.
								</div>
							)}
						</div>
					</Col>
				</Row>
			</div>
		);
	}

	renderFluidToggleSubComponent = () => (
		<div>
			<i style={{ fontSize: '14px', color: '#cf474b' }}>
				The slot height may increase or decrease depending on the rendered ad size
			</i>
		</div>
	);

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
					Consent Popup Text
				</Col>
				<Col md={9} className="modal-form-group">
					<FieldGroup
						name="modalText"
						value={modalText}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="modalText-input"
						placeholder="Eg. You need 10 coins to proceed. Would you like to watch a rewarded ad and earn 10 coins?"
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
					Reward
				</Col>
				<Col md={9}>
					<FieldGroup
						name="rewardText"
						value={rewardText}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="rewardText-input"
						placeholder="What would the user earn after watching the ad? Eg. Coins, Credits, Lives etc."
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
						type="number"
						onChange={this.handleChange}
						size={4}
						id="rewardValue-input"
						placeholder="How much of the reward would be granted? If the user would earn 10 coins, enter '10' here."
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
						className="u-margin-b4 u-margin-t4 negative-toggle trigger-automatically-toggle"
						checked={automaticTrigger}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`automaticTrigger-${siteId}`}
						id={`js-automaticTrigger-${siteId}`}
						subText="If this option is enabled, the ad will be triggered whereever the AP Tag is placed."
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
