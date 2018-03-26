import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList.jsx';
import { PLATFORMS, TYPES, SIZES } from '../../configs/commonConsts';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: null,
			type: null,
			size: null,
			loading: false,
			codeGenerated: false
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
		let that = this;
		this.setState(
			{
				progress: 100,
				loading: true,
				codeGenerated: true
			},
			() => {
				setTimeout(() => {
					that.setState(
						{
							loading: false
						},
						5000
					);
				});
			}
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
		let adCode = `
<div id="f55b61a2-466c-41d0-9a1c-2fedfa3d8307" data-size="${this.state.size}">
	<script>
		window.adpushup = window.adpushup || {};
		window.adpushup.que = window.adpushup.que || [];
		window.adpushup.que.push(funtion() {
			window.adpushup.externalTrigger('f55b61a2-466c-41d0-9a1c-2fedfa3d8307');
		})
	</script>
</div>
		`;
		return (
			<Col xs={12}>
				<pre>{adCode.trim()}</pre>
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
