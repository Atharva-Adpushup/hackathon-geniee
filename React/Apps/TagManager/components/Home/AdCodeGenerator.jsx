import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList.jsx';
import { PLATFORMS, TYPES, SIZES, displayAdMessage, interactiveAdMessage } from '../../configs/commonConsts';
import { CustomMessage } from '../shared/index.jsx';
class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: null,
			type: null,
			size: null,
			loading: false,
			codeGenerated: false,
			adId: null
		};
		this.selectPlatform = this.selectPlatform.bind(this);
		this.selectType = this.selectType.bind(this);
		this.selectSize = this.selectSize.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		this.renderPlatformOptions = this.renderPlatformOptions.bind(this);
		this.renderTypeOptions = this.renderTypeOptions.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.renderMainContent = this.renderMainContent.bind(this);
		this.renderLoadingScreen = this.renderLoadingScreen.bind(this);
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			loading: nextProps.currentAd ? false : true,
			codeGenerated: nextProps.currentAd ? true : false,
			error: nextProps.createAdError,
			adId: nextProps.currentAd
		});
	}

	selectPlatform(platform) {
		this.setState({
			platform,
			type: null,
			progress: 25
		});
	}

	selectType(type) {
		this.setState({
			type,
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
		let sizesArray = this.state.size.split('x'),
			width = sizesArray[0],
			height = sizesArray[1],
			typeAndPlacement = this.state.type.split(/^([^A-Z]+)/);

		typeAndPlacement.shift();

		this.setState(
			{
				progress: 100,
				loading: true
			},
			() =>
				this.props.createAd({
					siteId: this.props.match.params.siteId,
					ad: {
						width,
						height,
						formatData: {
							event: null,
							eventData: { value: null },
							platform: this.state.platform, // DESKTOP, MOBILE
							type: typeAndPlacement[0].toLowerCase(), // DISPLAY, VIDEO, STICKY
							placement: typeAndPlacement[1] ? typeAndPlacement[1].toLowerCase() : null // BOTTOM, LEFT, RIGHT, NULL
						},
						type:
							typeAndPlacement[0].toLowerCase() == 'display' ||
							typeAndPlacement[0].toLowerCase() == 'video'
								? 5
								: 3, // STRUCTURAL, INTERACTIVE
						css: {}
					}
				})
		);
	}

	resetHandler() {
		this.setState({
			progress: 0,
			platform: null,
			type: null,
			size: null,
			loading: false,
			codeGenerated: false
		});
	}

	renderPlatformOptions() {
		return (
			<CustomList
				options={PLATFORMS}
				heading="Select Platform"
				subHeading="Device for which you want to show ads"
				onClick={this.selectPlatform}
				leftSize={3}
				rightSize={9}
				toMatch={this.state.platform}
			/>
		);
	}

	renderTypeOptions() {
		return (
			<CustomList
				options={TYPES[this.state.platform.toUpperCase()]}
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
			<CustomList
				options={SIZES[this.state.platform.toUpperCase()][this.state.type.toUpperCase()]}
				heading="Select Ad Size"
				subHeading="AdpPushup supports varied ad sizes"
				onClick={this.selectSize}
				leftSize={3}
				rightSize={9}
				toMatch={this.state.size}
				simpleList={true}
			/>
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
		const adCode = `
<div id="${this.state.adId}">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(funtion() {
			adpushup.triggerAd('${this.state.adId}');
		})
	</script>
</div>
		`,
			typeAndPlacement = this.state.type.split(/^([^A-Z]+)/);

		typeAndPlacement.shift();

		const isDisplay = typeAndPlacement[0] == 'display' ? true : false,
			message = isDisplay ? displayAdMessage : interactiveAdMessage;
		return (
			<Col xs={12}>
				{isDisplay ? <pre>{adCode.trim()}</pre> : null}
				<CustomMessage header="Information" type="info" message={message} />
				{this.renderButton('Generate More', this.resetHandler)}
			</Col>
		);
	}

	renderLoadingScreen() {
		return <div>Loading</div>;
	}

	renderMainContent() {
		return (
			<div>
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={this.state.progress} />
				</div>
				{this.state.codeGenerated ? (
					this.renderGeneratedAdcode()
				) : (
					<div>
						{this.renderPlatformOptions()}
						{this.state.progress >= 25 ? this.renderTypeOptions() : null}
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
				{this.state.loading ? this.renderLoadingScreen() : this.renderMainContent()}
			</Row>
		);
	}
}

export default AdCodeGenerator;
