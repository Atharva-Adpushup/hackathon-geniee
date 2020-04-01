import React, { Component } from 'react';
import { Col, ProgressBar } from '@/Client/helpers/react-bootstrap-imports';
import CustomList from './CustomList';
import { Docked, Default, InView, StickyTop } from './Formats/index';
import { PLATFORMS, FORMATS, SIZES, displayAdMessage } from '../../configs/commonConsts';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import { pagegroupFiltering } from '../../lib/helpers';
import ActionCard from '../../../../Components/ActionCard';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index.jsx';
import { Row } from 'react-bootstrap';

class AdCodeGenerator extends Component {
	constructor(props) {
		super(props);
		const { channels } = props;
		this.state = {
			progress: 0,
			platform: '',
			format: '',
			size: null,
			loading: false,
			pagegroups: [],
			fluid: false,
			pagegroupsPresent: !!(channels && channels.length)
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
		this.renderGeneratedAdcode = this.renderGeneratedAdcode.bind(this);
		this.generateAdData = this.generateAdData.bind(this);
	}

	selectPlatform(platform) {
		this.setState({
			progress: 10,
			platform,
			format: '',
			size: null,
			pagegroups: [],
			fluid: false
		});
	}

	selectFormat(format) {
		this.setState({
			format,
			size: null,
			progress: 20,
			pagegroups: [],
			fluid: false
		});
	}

	selectSize(size) {
		const { progress, pagegroupsPresent } = this.state;
		let updateProgress = 80;
		if (progress > 80) {
			updateProgress = progress;
		} else if (pagegroupsPresent) {
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
		const { match } = this.props;
		const { size, format, pagegroups, platform, fluid } = this.state;
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
			siteId: match.params.siteId,
			ad: {
				width,
				height,
				pagegroups: pagegroups || [],
				network: 'adpTags',
				fluid,
				networkData: {
					isResponsive: false,
					headerBidding: false,
					refreshSlot: false,
					overrideActive: false,
					overrideSizeTo: null,
					logWritten: false,
					formats: ['display'],
					isBackwardCompatibleSizes: true,
					keyValues: {
						FP_S_A: 0
					}
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
				// name: `Ad-${platform}-${format}-${width}x${height}-${+new Date()}`,
				...data.adData
			}
		};
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value,
			progress: 30
		});
	};

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
		const { resetCurrentAd, siteId } = this.props;
		this.setState(
			{
				progress: 0,
				platform: '',
				size: null,
				loading: false,
				fluid: false
			},
			() => resetCurrentAd(siteId)
		);
	}

	formatCheck() {
		const { format } = this.state;
		return format && ['DOCKED', 'STICKYTOP'].includes(format.toUpperCase());
	}

	renderButton = (label, handler) => (
		<CustomButton
			variant="primary"
			className="u-margin-t4 u-margin-r3 pull-right"
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
		const { meta, channels } = this.props;
		const { filteredPagegroupsByPlatform, disabled } = pagegroupFiltering(
			channels,
			platform,
			format,
			meta.content,
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
					/>
				</Col>
				<Col md={7} />
			</Row>
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
			<React.Fragment>
				<Col md={3} className="list-heading br-0">
					<h3>Format Settings</h3>
					<h4>Please fill the necessary details</h4>
				</Col>
				<Col md={9} className="u-padding-l5 u-padding-r3">
					{this.renderIndividualFormat()}
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</React.Fragment>
		);
	}

	renderGeneratedAdcode() {
		const { match } = this.props;
		return (
			<Col xs={12}>
				<CustomMessage
					header="Ad Creation Successful. Please ensure the following"
					type="info"
					message={displayAdMessage.replace(/__SITE_ID__/gi, match.params.siteId)}
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

	renderMainContent() {
		const { codeGenerated } = this.props;
		const { progress, pagegroupsPresent } = this.state;
		return (
			<React.Fragment>
				<div className="progress-wrapper">
					<ProgressBar striped active bsStyle="success" now={progress} />
				</div>
				{codeGenerated ? (
					this.renderGeneratedAdcode()
				) : (
					<div>
						{this.renderPlatformOptions()}
						{progress >= 10 ? this.renderFormats() : null}
						{progress >= 20 ? this.renderFluidToggle() : null}
						{progress >= 20 ? this.renderSizes() : null}
						{progress >= 45 ? this.renderPagegroups() : null}
						{progress >= 60 && pagegroupsPresent ? this.renderFormatDetails() : null}
					</div>
				)}
			</React.Fragment>
		);
	}

	render() {
		const { codeGenerated } = this.props;
		const { loading } = this.state;
		return (
			<ActionCard className="options-wrapper">
				{loading && !codeGenerated ? <Loader height="300px" /> : this.renderMainContent()}
			</ActionCard>
		);
	}
}

export default AdCodeGenerator;
