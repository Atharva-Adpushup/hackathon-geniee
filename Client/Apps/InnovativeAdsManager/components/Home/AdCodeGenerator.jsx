import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList';
import { Docked, Default, InView, StickyTop } from './Formats/index';
import { PLATFORMS, FORMATS, SIZES, displayAdMessage } from '../../configs/commonConsts';
import { CustomMessage, CustomButton } from '../shared/index';
import Loader from '../../../../Components/Loader';
import { pagegroupFiltering } from '../../lib/helpers';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			platform: '',
			format: '',
			size: null,
			loading: false,
			pagegroups: [],
			isLayoutSetupPresent: !!(window.iam && window.iam.channels && window.iam.channels.length)
		};
		this.selectPlatform = this.selectPlatform.bind(this);
		this.selectFormat = this.selectFormat.bind(this);
		this.selectSize = this.selectSize.bind(this);
		this.selectPagegroups = this.selectPagegroups.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
		this.formatCheck = this.formatCheck.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		this.renderPlatformOptions = this.renderPlatformOptions.bind(this);
		this.renderPagegroups = this.renderPagegroups.bind(this);
		this.renderFormats = this.renderFormats.bind(this);
		this.renderSizes = this.renderSizes.bind(this);
		this.renderFormatDetails = this.renderFormatDetails.bind(this);
		this.renderIndividualFormat = this.renderIndividualFormat.bind(this);
		this.renderMainContent = this.renderMainContent.bind(this);
		this.renderFormatOrSave = this.renderFormatOrSave.bind(this);
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
		this.generateAdData = this.generateAdData.bind(this);
	}

	selectPlatform(platform) {
		this.setState({
			progress: 15,
			platform,
			format: '',
			size: null,
			pagegroups: []
		});
	}

	selectFormat(format) {
		this.setState({
			format,
			size: null,
			progress: 30,
			pagegroups: []
		});
	}

	selectSize(size) {
		let progress = 80;
		if (this.state.progress > 80) {
			progress = this.state.progress;
		} else if (this.state.isLayoutSetupPresent) {
			progress = 45;
		} else if (this.formatCheck()) {
			progress = 60;
		}
		this.setState({
			size,
			progress,
			pagegroups: []
		});
	}

	selectPagegroups(pagegroup) {
		const pagegroups = this.state.pagegroups.concat([]);
		let progress;

		if (pagegroups.includes(pagegroup)) {
			pagegroups.splice(pagegroups.indexOf(pagegroup), 1);
		} else {
			pagegroups.push(pagegroup);
		}
		if (pagegroups.length) {
			if (this.formatCheck()) {
				progress = 60;
			} else {
				progress = 80;
			}
		} else {
			progress = 45;
		}
		return this.setState({ pagegroups, progress });
	}

	generateAdData(data) {
		const sizesArray = this.state.size.split('x');
		const width = sizesArray[0];
		const height = sizesArray[1];

		let typeAndPlacement = [];
		let type = null;
		let placement = null;

		if (this.state.format.indexOf('inView') === -1) {
			typeAndPlacement = this.state.format.split(/^([^A-Z]+)/);

			typeAndPlacement.shift();

			type = typeAndPlacement[0] ? typeAndPlacement[0].toLowerCase() : null;
			placement = typeAndPlacement[1] ? typeAndPlacement[1].toLowerCase() : 'default';
		} else {
			type = this.state.format;
			placement = 'top';
		}

		return {
			siteId: window.siteId,
			ad: {
				width,
				height,
				pagegroups: this.state.pagegroups ? this.state.pagegroups : [],
				network: 'adpTags',
				networkData: {
					isResponsive: false,
					headerBidding: false,
					refreshSlot: false,
					overrideActive: false,
					overrideSizeTo: null,
					logWritten: false,
					isBackwardCompatibleSizes: true,
					keyValues: {
						FP_S_A: 0
					},
					multipleAdSizes: []
				},
				formatData: {
					platform: this.state.platform,
					format: this.state.format,
					type,
					placement,
					...data.formatData
				},
				type: data.type,
				css: {
					display: 'block',
					'text-align': 'center',
					...data.css
				},
				blocklist: [],
				isActive: true,
				isInnovativeAd: true,
				name: `Ad-${this.state.platform}-${this.state.format}-${width}x${height}-${+new Date()}`,
				...data.adData
			}
		};
	}

	saveHandler(data) {
		this.setState(
			{
				progress: 100,
				loading: true
			},
			() => this.props.createAd(this.generateAdData(data))
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

	formatCheck() {
		return this.state.format && ['DOCKED', 'STICKYTOP'].includes(this.state.format.toUpperCase());
	}

	renderButton = (label, handler) => (
		<CustomButton
			label={label}
			handler={handler}
			style={{ float: 'right', minWidth: '200px', margin: '10px 10px 0px 0px' }}
		/>
	);

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

	renderFormats() {
		return (
			<CustomList
				options={FORMATS[this.state.platform.toUpperCase()]}
				heading="Select Ad Format"
				subHeading="AdpPushup supports varied high value ad formats"
				onClick={this.selectFormat}
				leftSize={3}
				rightSize={9}
				toMatch={this.state.format}
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
					format={this.state.format}
					simpleList
					options={SIZES[this.state.platform.toUpperCase()][this.state.format.toUpperCase()]}
					onClick={this.selectSize}
				/>
			</div>
		);
	}

	renderPagegroups() {
		/*
			platform - desktop
			format - stickyLeft
			pagegroup - ??
				- home or post
				Conditions:
					1. stickyLeft should not be already created
					2. stickyRight or docked should not be already created
		*/

		const { filteredPagegroupsByPlatform, disabled } = pagegroupFiltering(
			window.iam.channels,
			this.state.platform,
			this.state.format,
			this.props.meta,
			false
		);

		return (
			<CustomList
				multiSelect
				simpleList
				heading="Select Pagegroup(s)"
				subHeading="Please select pagegroup(s) on which you want to run the ad"
				leftSize={3}
				rightSize={9}
				toMatch={this.state.pagegroups}
				options={[...filteredPagegroupsByPlatform]}
				onClick={this.selectPagegroups}
				disabled={!!disabled.size}
				toDisable={[...disabled]}
				message="Seems like you have reached the limt to create ad for this format. Please delete/modify an existing ad"
			/>
		);
	}

	renderIndividualFormat() {
		const save = {
			renderFn: this.renderButton,
			label: 'Create Ad',
			handler: this.saveHandler
		};
		switch (this.state.format) {
			case 'stickyTop':
				return <StickyTop save={save} />;
			case 'inView':
				return <InView save={save} />;
			case 'docked':
				return <Docked save={save} />;
			default:
				return <Default save={save} />;
		}
	}

	renderFormatDetails() {
		return (
			<div>
				<Col md={3} className="list-heading br-0">
					<h3>Format Settings</h3>
					<h4>Please fill the necessary details</h4>
				</Col>
				<Col md={9}>{this.renderIndividualFormat()}</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}

	renderGeneratedAdcode() {
		return (
			<Col xs={12}>
				<CustomMessage
					header="Ad Creation Successful. Please ensure the following"
					type="info"
					message={displayAdMessage}
				/>
				<CustomButton label="Create More Ads" handler={this.resetHandler} />
			</Col>
		);
	}

	renderFormatOrSave() {
		if (this.state.progress && this.state.progress >= 60) {
			return this.renderFormatDetails();
			// return this.formatCheck() ? this.renderFormatDetails() : this.renderButton('Create Ad', this.saveHandler);
		}
		return null;
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
						{this.renderPlatformOptions()}
						{this.state.progress >= 15 ? this.renderFormats() : null}
						{this.state.progress >= 30 ? this.renderSizes() : null}
						{this.state.progress >= 45 && this.state.isLayoutSetupPresent ? this.renderPagegroups() : null}
						{this.renderFormatOrSave()}
						{/* {this.state.progress >= 80 ? this.renderButton('Generate AdCode', this.saveHandler) : null} */}
					</div>
				)}
			</div>
		);
	}

	renderLoader = () => (
		<div style={{ position: 'relative', 'min-height': '200px' }}>
			<Loader />
		</div>
	);

	render() {
		return (
			<Row className="options-wrapper">
				{this.state.loading && !this.props.codeGenerated ? this.renderLoader() : this.renderMainContent()}
			</Row>
		);
	}
}

export default AdCodeGenerator;
