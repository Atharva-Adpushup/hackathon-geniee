import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import CustomList from './CustomList';
import { Docked, Default, InView, StickyTop } from './Formats/index';
import { PLATFORMS, FORMATS, SIZES, displayAdMessage } from '../../configs/commonConsts';
// import { CustomMessage, CustomButton } from '../shared/index';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import { pagegroupFiltering } from '../../libs/helpers';

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
		const { progress, isLayoutSetupPresent } = this.state;
		let updateProgress = 80;
		if (progress > 80) {
			updateProgress = progress;
		} else if (isLayoutSetupPresent) {
			updateProgress = 45;
		} else if (this.formatCheck()) {
			updateProgress = 60;
		}
		this.setState({
			size,
			progress: updateProgress,
			pagegroups: []
		});
	}

	selectPagegroups(pagegroup) {
		const { pagegroups } = this.state;
		const updatePagegroups = pagegroups.concat([]);
		let progress;

		if (updatePagegroups.includes(pagegroup)) {
			updatePagegroups.splice(updatePagegroups.indexOf(pagegroup), 1);
		} else {
			updatePagegroups.push(pagegroup);
		}
		if (updatePagegroups.length) {
			if (this.formatCheck()) {
				progress = 60;
			} else {
				progress = 80;
			}
		} else {
			progress = 45;
		}
		return this.setState({ pagegroups: updatePagegroups, progress });
	}

	generateAdData(data) {
		const { size, format, pagegroups, platform } = this.state;
		const sizesArray = size.split('x');
		const width = sizesArray[0];
		const height = sizesArray[1];

		let typeAndPlacement = [];
		let type = null;
		let placement = null;

		if (format.indexOf('inView') === -1) {
			typeAndPlacement = format.split(/^([^A-Z]+)/);

			typeAndPlacement.shift();

			type = typeAndPlacement[0] ? typeAndPlacement[0].toLowerCase() : null;
			placement = typeAndPlacement[1] ? typeAndPlacement[1].toLowerCase() : 'default';
		} else {
			type = format;
			placement = 'top';
		}

		return {
			siteId: window.siteId,
			ad: {
				width,
				height,
				pagegroups: pagegroups || [],
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
					platform,
					format,
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
				name: `Ad-${platform}-${format}-${width}x${height}-${+new Date()}`,
				...data.adData
			}
		};
	}

	saveHandler(data) {
		const { createAd } = this.props;
		this.setState(
			{
				progress: 100,
				loading: true
			},
			() => createAd(this.generateAdData(data))
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

	formatCheck() {
		const { format } = this.state;
		return format && ['DOCKED', 'STICKYTOP'].includes(format.toUpperCase());
	}

	renderButton = (label, handler) => (
		<CustomButton
			variant="primary"
			className="u-margin-t2 u-margin-r3 pull-right"
			onClick={handler}
		>
			{label}
		</CustomButton>
	);

	renderPlatformOptions() {
		const { platform } = this.state;
		return (
			<CustomList
				options={PLATFORMS}
				heading="Select Platform"
				subHeading="Device for which you want to show ads"
				onClick={this.selectPlatform}
				leftSize={3}
				rightSize={9}
				toMatch={platform}
			/>
		);
	}

	renderFormats() {
		const { platform, format } = this.state;
		return (
			<CustomList
				options={FORMATS[platform.toUpperCase()]}
				heading="Select Ad Format"
				subHeading="AdpPushup supports varied high value ad formats"
				onClick={this.selectFormat}
				leftSize={3}
				rightSize={9}
				toMatch={format}
			/>
		);
	}

	renderSizes() {
		const { platform, format, size } = this.state;
		return (
			<div>
				<CustomList
					heading="Select Ad Size"
					subHeading="AdpPushup supports varied ad sizes"
					leftSize={3}
					rightSize={9}
					toMatch={size}
					platform={platform}
					format={format}
					simpleList
					options={SIZES[platform.toUpperCase()][format.toUpperCase()]}
					onClick={this.selectSize}
				/>
			</div>
		);
	}

	renderPagegroups() {
		const { platform, format, pagegroups } = this.state;
		const { meta } = this.props;
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
			platform,
			format,
			meta,
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
				toMatch={pagegroups}
				options={[...filteredPagegroupsByPlatform]}
				onClick={this.selectPagegroups}
				disabled={!!disabled.size}
				toDisable={[...disabled]}
				message="Seems like you have reached the limt to create ad for this format. Please delete/modify an existing ad"
			/>
		);
	}

	renderIndividualFormat() {
		const { format } = this.state;
		const save = {
			renderFn: this.renderButton,
			label: 'Create Ad',
			handler: this.saveHandler
		};
		switch (format) {
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
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={() => this.resetHandler()}
				>
					Create More Ads
				</CustomButton>
			</Col>
		);
	}

	renderFormatOrSave() {
		const { progress } = this.state;
		if (progress && progress >= 60) {
			return this.renderFormatDetails();
		}
		return null;
	}

	renderMainContent() {
		const { codeGenerated } = this.props;
		const { progress, isLayoutSetupPresent } = this.state;
		return (
			<div>
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={progress} />
				</div>
				{codeGenerated ? (
					this.renderGeneratedAdcode()
				) : (
					<div>
						{this.renderPlatformOptions()}
						{progress >= 15 ? this.renderFormats() : null}
						{progress >= 30 ? this.renderSizes() : null}
						{progress >= 45 && isLayoutSetupPresent ? this.renderPagegroups() : null}
						{this.renderFormatOrSave()}
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
		const { codeGenerated } = this.props;
		const { loading } = this.state;
		return (
			<Row className="options-wrapper">
				{loading && !codeGenerated ? this.renderLoader() : this.renderMainContent()}
			</Row>
		);
	}
}

export default AdCodeGenerator;
