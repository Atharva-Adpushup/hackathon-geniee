import React, { Component } from 'react';
import { Row, Col, ProgressBar } from '@/Client/helpers/react-bootstrap-imports';
import CustomList from './CustomList';
import { TYPES, SIZES, AD_MESSAGE } from '../../configs/commonConsts';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import ActionCard from '../../../../Components/ActionCard/index';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: 'mobile',
			type: '',
			size: '',
			loading: false,
			isRefreshEnabled: true,
			refreshInterval: 30
		};
		this.selectPlatform = this.selectPlatform.bind(this);
		this.selectType = this.selectType.bind(this);
		this.selectSize = this.selectSize.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		this.renderTypeOptions = this.renderTypeOptions.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.renderMainContent = this.renderMainContent.bind(this);
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
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
			isRefreshEnabled: true
		});
	}

	selectSize(size) {
		const { progress } = this.state;
		this.setState({
			size,
			progress: progress > 75 ? progress : 75,
			isRefreshEnabled: true
		});
	}

	saveHandler() {
		const { type, size, isRefreshEnabled, refreshInterval } = this.state;

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
			fluid: true,
			networkData: {
				headerBidding: true,
				refreshSlot: true,
				dfpAdunitCode: null,
				dfpAdunit: null,
				formats: ['display']
			},
			formatData: {
				platform: 'mobile',
				type
			},
			isActive: true
		};

		if (isRefreshEnabled) ad.networkData.refreshInterval = refreshInterval;

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
			loading: false,
			isRefreshEnabled: true,
			refreshInterval: 30
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
							mobile: {
								header: 'Mobile',
								key: 'mobile',
								options: SIZES[type.toUpperCase()][platform.toUpperCase()]
							}
						}
					}}
					selectPlatform={this.selectPlatform}
					onClick={this.selectSize}
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
		const { siteId } = this.props;

		const message = AD_MESSAGE.replace(/__SITE_ID__/g, siteId);
		return (
			<Col xs={12}>
				<CustomMessage header="Information" type="info" message={message} />
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={() => this.resetHandler()}
				>
					Create More Tags
				</CustomButton>
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
						{progress >= 75 ? this.renderButton('Create Tag', this.saveHandler) : null}
					</div>
				)}
			</div>
		);
	}

	// eslint-disable-next-line react/sort-comp
	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value,
			progress: 90
		});
	};

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
