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
			size: null
		};
		this.renderPlatformOptions = this.renderPlatformOptions.bind(this);
		this.renderTypeOptions = this.renderTypeOptions.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.selectPlatform = this.selectPlatform.bind(this);
		this.selectType = this.selectType.bind(this);
		this.selectSize = this.selectSize.bind(this);
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

	render() {
		return (
			<Row className="options-wrapper">
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={this.state.progress} />
				</div>
				{this.renderPlatformOptions()}
				{this.state.progress >= 25 ? this.renderTypeOptions() : null}
				{this.state.progress >= 50 ? this.renderSizes() : null}
			</Row>
		);
	}
}

export default AdCodeGenerator;
