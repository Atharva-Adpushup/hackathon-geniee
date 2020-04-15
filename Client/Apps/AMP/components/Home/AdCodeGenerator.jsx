import React, { Component } from 'react';
import { Row, Col, ProgressBar } from '@/Client/helpers/react-bootstrap-imports';
import CustomList from './CustomList';
import {
	TYPES,
	SIZES,
	CUSTOM_FIELDS,
	CUSTOM_FIELD_DEFAULT_VALUE,
	DISPLAY_AD_MESSAGE,
	AMP_MESSAGE,
	DISPLAYADCODE,
	STICKYADCODE
} from '../../configs/commonConsts';
import CopyButtonWrapperContainer from '../../../../Containers/CopyButtonWrapperContainer';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import ActionCard from '../../../../Components/ActionCard/index';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import { computeDownWardCompatibleSizes } from '../../lib/helpers';
import { refreshIntervals } from '../../../../constants/visualEditor';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: 'mobile',
			type: '',
			size: '',
			customFields: {},
			loading: false,
			isRefreshEnabled: true,
			refreshInterval: 30,
			isMultiSize: false
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

	// eslint-disable-next-line react/sort-comp
	selectPlatform(platform) {
		this.setState({
			platform,
			size: platform === 'responsive' ? 'responsive' : '',
			progress: platform === 'responsive' ? 75 : 50
		});
	}

	selectType(type) {
		this.setState({
			type,
			platform: 'mobile',
			size: '',
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
			isRefreshEnabled,
			isMultiSize,
			refreshInterval
		} = this.state;

		// terminate if Custom Fields are invalid
		const isCustomFieldsValid = !Object.keys(customFields).find(
			customFieldKey => !customFields[customFieldKey].isValid
		);
		if (!isCustomFieldsValid) return;

		const { createAd, siteId } = this.props;
		const isResponsive = size === 'responsive';
		const sizesArray = isResponsive ? 'responsive' : size.split('x');
		const width = isResponsive ? 'responsive' : sizesArray[0];
		const height = isResponsive ? 'responsive' : sizesArray[1];
		const typeAndPlacement = type.split(/^([^A-Z]+)/);
		typeAndPlacement.shift();

		const ad = {
			width,
			height,
			type,
			isMultiSize,
			isRefreshEnabled,
			networkData: {
				dfpAdunitCode: null,
				dfpAdunit: null
			},
			hbConfig: {
				formats: ['display']
			},

			isActive: true
		};

		if (isRefreshEnabled) ad.refreshInterval = refreshInterval;

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
		resetCurrentAd(siteId);
		this.setState({
			progress: 0,
			platform: 'mobile',
			type: '',
			size: '',
			customFields: {},
			loading: false,
			isRefreshEnabled: true,
			refreshInterval: 30,
			isMultiSize: false
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

	renderSizes() {
		const { size, platform, type } = this.state;

		return (
			<div>
				<CustomList
					heading="Select Ad Size"
					subHeading="AdpPushup supports varied ad sizes"
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
		const { type, size, isRefreshEnabled, refreshInterval, isMultiSize } = this.state;
		const { networkCode } = this.props;
		const adType = type ? type : this.props.type;
		const availableSizes = SIZES[adType.toUpperCase()].MOBILE;
		const downwardCompatibleSizes = computeDownWardCompatibleSizes(availableSizes, size);
		const sizesArray = size.split('x');
		const width = sizesArray[0];
		const height = sizesArray[1];
		const { adId, maxHeight, siteId } = this.props;
		const isDisplayAd = type !== 'amp';
		const customAttributes = maxHeight ? ` max-height="${maxHeight}"` : '';
		const refresh = isRefreshEnabled ? `data-enable-refresh="${refreshInterval}"` : '';
		const multiSize = isMultiSize ? `data-multi-size='${downwardCompatibleSizes}'` : '';
		const ADCODE = type === 'display' ? DISPLAYADCODE : STICKYADCODE;
		const code = isDisplayAd
			? ADCODE.replace(/__AD_ID__/g, adId)
					.replace(/__REFRESH_INTERVAL__/, refresh)
					.replace(/__MULTI_SIZE__/, multiSize)
					.replace(/__WIDTH__/, width)
					.replace(/__HEIGHT__/, height)
					.replace(/__NETWORK_CODE__/, networkCode)
					.trim()
			: null;
		const message = isDisplayAd ? DISPLAY_AD_MESSAGE.replace(/__SITE_ID__/g, siteId) : AMP_MESSAGE;
		return (
			<Col xs={12}>
				{/* {isDisplayAd ? <pre>{code}</pre> : null} */}
				<CustomMessage header="Information" type="info" message={message} />
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={() => this.resetHandler()}
				>
					Create More Tags
				</CustomButton>
				{/* {isDisplayAd ? (
					<CopyButtonWrapperContainer content={code}>
						<CustomButton variant="secondary" className="u-margin-t3 u-margin-r3 pull-right">
							Copy Adcode
						</CustomButton>
					</CopyButtonWrapperContainer>
				) : null} */}
			</Col>
		);
	}

	renderMainContent() {
		const { progress } = this.state;
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
						{progress >= 75 ? this.renderRefreshToggle() : null}
						{progress >= 75 ? this.renderMultiSizeToggle() : null}
						{progress >= 75 ? this.renderButton('Create Tag', this.saveHandler) : null}
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

	renderMultiSizeToggle() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { isMultiSize } = this.state;
		return (
			<Row>
				<Col md={5}>
					<CustomToggleSwitch
						labelText="Multi Size"
						className="u-margin-b4 negative-toggle toggle"
						checked={isMultiSize}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`isMultiSize-${siteId}`}
						id={`js-isMultiSize-${siteId}`}
					/>
				</Col>
				<Col md={7} />
			</Row>
		);
	}

	renderRefreshToggle() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { isRefreshEnabled } = this.state;
		return (
			<Row>
				<Col md={5}>
					<CustomToggleSwitch
						labelText="Refresh"
						className="u-margin-b4 negative-toggle toggle"
						checked={isRefreshEnabled}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`isRefreshEnabled-${siteId}`}
						id={`js-isRefreshEnabled-${siteId}`}
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
