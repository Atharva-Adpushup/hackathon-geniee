import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList.jsx';
import {
	PLATFORMS,
	TYPES,
	SIZES,
	displayAdMessage,
	ampMessage,
	interactiveAdMessage
} from '../../configs/commonConsts';
import { copyToClipBoard } from '../../lib/helpers';
import { CustomMessage, CustomButton } from '../shared/index.jsx';
import { adCode, adCodeVideo } from '../../configs/commonConsts';
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
		// this.renderPlatformOptions = this.renderPlatformOptions.bind(this);
		this.renderTypeOptions = this.renderTypeOptions.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.renderMainContent = this.renderMainContent.bind(this);
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
	}

	selectPlatform(platform) {
		this.setState({
			platform,
			size: platform == 'responsive' ? 'responsive' : null,
			progress: platform == 'responsive' ? 75 : 50
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
		this.setState({
			size,
			progress: this.state.progress > 75 ? this.state.progress : 75
		});
	}

	saveHandler() {
		let isResponsive = this.state.size == 'responsive',
			sizesArray = isResponsive ? 'responsive' : this.state.size.split('x'),
			width = isResponsive ? 'responsive' : sizesArray[0],
			height = isResponsive ? 'responsive' : sizesArray[1],
			typeAndPlacement = this.state.type.split(/^([^A-Z]+)/);

		typeAndPlacement.shift();

		this.setState(
			{
				progress: 100,
				loading: true
			},
			() =>
				this.props.createAd({
					siteId: window.siteId,
					ad: {
						width,
						height,
						isManual: true,
						networkData: {
							isResponsive: !!(width === 'responsive')
						},
						formatData: {
							platform: this.state.platform, // DESKTOP, MOBILE
							type: this.state.type, // DISPLAY, NATIVE, AMP, LINK

							// Setting for backward compatibility
							event: null,
							placement: null,
							eventData: {
								value: null
							}
						},
						type: 3, // STRUCTURAL
						css: {
							display: 'block',
							margin: '10px auto',
							'text-align': 'center',
							'clear': 'both'
						},
						isActive: true
					}
				})
		);
	}

	resetHandler() {
		this.setState(
			{
				progress: 0,
				platform: '',
				type: '',
				size: null,
				loading: false
			},
			() => this.props.resetCurrentAd()
		);
	}

	// renderPlatformOptions() {
	// 	return (
	// 		<CustomList
	// 			options={PLATFORMS}
	// 			heading="Select Platform"
	// 			subHeading="Device for which you want to show ads"
	// 			onClick={this.selectPlatform}
	// 			leftSize={3}
	// 			rightSize={9}
	// 			toMatch={this.state.platform}
	// 		/>
	// 	);
	// }

	renderTypeOptions() {
		return (
			<CustomList
				options={TYPES}
				heading="Select Ad Type"
				subHeading="AdpPushup supports varied ad types"
				onClick={this.selectType}
				leftSize={3}
				rightSize={9}
				toMatch={this.state.type}
			/>
		);
	}

	renderSizes() {
		return (
			<div>
				<CustomList
					heading="Select Ad Size"
					subHeading="AdpPushup supports varied ad sizes"
					leftSize={3}
					rightSize={9}
					toMatch={this.state.size}
					platform={this.state.platform}
					type={this.state.type}
					tabbedList={{
						allowed: SIZES[this.state.type.toUpperCase()]
							? SIZES[this.state.type.toUpperCase()]['ALLOWED']
							: [],
						list: {
							responsive: {
								header: 'Responsive',
								key: 'responsive',
								options: false
							},
							desktop: {
								header: 'Desktop',
								key: 'desktop',
								options: SIZES[this.state.type.toUpperCase()][this.state.platform.toUpperCase()]
							},
							mobile: {
								header: 'Mobile',
								key: 'mobile',
								options: SIZES[this.state.type.toUpperCase()][this.state.platform.toUpperCase()]
							}
						}
					}}
					selectPlatform={this.selectPlatform}
					onClick={this.selectSize}
				/>
			</div>
		);
	}

	renderButton(label, handler) {
		return (
			<Row style={{ margin: '0px' }}>
				<div
					className="btn btn-lightBg btn-default"
					style={{ float: 'right', minWidth: '200px', margin: '10px 10px 0px 0px' }}
					onClick={handler}
				>
					{label}
				</div>
			</Row>
		);
	}

	renderGeneratedAdcode() {
		const showAdCode = this.state.type == 'amp' ? false : true,
			code = showAdCode ? adCode : null,
			message = showAdCode ? displayAdMessage : ampMessage;
		return (
			<Col xs={12}>
				{showAdCode ? <pre>{code.replace(/__AD_ID__/g, this.props.adId).trim()}</pre> : null}
				<CustomMessage header="Information" type="info" message={message} />
				<CustomButton label="Create More Ads" handler={this.resetHandler} />
				{showAdCode ? (
					<CustomButton
						label="Copy Adcode"
						handler={copyToClipBoard.bind(null, code.replace(/__AD_ID__/g, this.props.adId))}
					/>
				) : null}
			</Col>
		);
	}

	renderMainContent() {
		return (
			<div>
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={this.state.progress} />
				</div>
				{this.props.codeGenerated ? (
					this.renderGeneratedAdcode()
				) : (
					<div>
						{/* {this.renderPlatformOptions()} */}
						{this.renderTypeOptions()}
						{this.state.progress >= 50 ? this.renderSizes() : null}
						{this.state.progress >= 75 ? this.renderButton('Generate AdCode', this.saveHandler) : null}
					</div>
				)}
			</div>
		);
	}

	render() {
		return (
			<Row className="options-wrapper">
				{this.state.loading && !this.props.codeGenerated ? <Loader /> : this.renderMainContent()}
			</Row>
		);
	}
}

export default AdCodeGenerator;
