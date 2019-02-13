import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList';
import { TYPES, SIZES, DISPLAY_AD_MESSAGE, AMP_MESSAGE, ADCODE } from '../../configs/commonConsts';
import { copyToClipBoard } from '../../lib/helpers';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: '',
			type: '',
			size: null,
			loading: false
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

	selectPlatform(platform) {
		this.setState({
			platform,
			size: platform === 'responsive' ? 'responsive' : null,
			progress: platform === 'responsive' ? 75 : 50
		});
	}

	selectType(type) {
		this.setState({
			type,
			platform: '',
			size: null,
			progress: 50
		});
	}

	selectSize(size) {
		const { progress } = this.state;
		this.setState({
			size,
			progress: progress > 75 ? progress : 75
		});
	}

	saveHandler() {
		const { createAd, match } = this.props;
		const { type, platform, size } = this.state;
		const isResponsive = size === 'responsive';
		const sizesArray = isResponsive ? 'responsive' : size.split('x');
		const width = isResponsive ? 'responsive' : sizesArray[0];
		const height = isResponsive ? 'responsive' : sizesArray[1];
		const typeAndPlacement = type.split(/^([^A-Z]+)/);
		typeAndPlacement.shift();

		this.setState(
			{
				progress: 100,
				loading: true
			},
			() =>
				createAd({
					siteId: match.params.siteId,
					ad: {
						width,
						height,
						isManual: true,
						networkData: {
							isResponsive: !!(width === 'responsive')
						},
						formatData: {
							platform, // DESKTOP, MOBILE
							type // DISPLAY, NATIVE, AMP, LINK
						},
						type: 3, // STRUCTURAL
						css: {
							display: 'block',
							margin: '10px auto',
							'text-align': 'center'
						},
						isActive: true
					}
				})
		);
	}

	resetHandler() {
		const { resetCurrentAd } = this.props;
		this.setState(
			{
				progress: 0,
				platform: '',
				type: '',
				size: null,
				loading: false
			},
			() => resetCurrentAd()
		);
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
								options: false
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
		const { type } = this.state;
		const { adId } = this.props;
		const isDisplayAd = type !== 'amp';
		const code = isDisplayAd ? ADCODE : null;
		const message = isDisplayAd ? DISPLAY_AD_MESSAGE : AMP_MESSAGE;
		return (
			<Col xs={12}>
				{isDisplayAd ? <pre>{code.replace(/__AD_ID__/g, adId).trim()}</pre> : null}
				<CustomMessage header="Information" type="info" message={message} />
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={() => this.resetHandler()}
				>
					Create More Ads
				</CustomButton>
				{isDisplayAd ? (
					<CustomButton
						variant="secondary"
						className="u-margin-t3 u-margin-r3 pull-right"
						onClick={() => copyToClipBoard(code.replace(/__AD_ID__/g, adId))}
					>
						Copy Adcode
					</CustomButton>
				) : null}
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
						{progress >= 75 ? this.renderButton('Generate AdCode', this.saveHandler) : null}
					</div>
				)}
			</div>
		);
	}

	render() {
		const { loading } = this.state;
		const { codeGenerated } = this.props;
		return (
			<Row className="options-wrapper">
				{loading && !codeGenerated ? <Loader /> : this.renderMainContent()}
			</Row>
		);
	}
}

export default AdCodeGenerator;
