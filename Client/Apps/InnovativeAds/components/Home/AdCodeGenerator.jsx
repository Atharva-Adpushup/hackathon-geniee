/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from 'react';

import { Row, Col, ProgressBar } from '@/Client/helpers/react-bootstrap-imports';
import CustomList from './CustomList';
import { Docked, Default, InView, StickyTop, ChainedDocked } from './Formats/index';
import { PLATFORMS, FORMATS, SIZES, displayAdMessage } from '../../configs/commonConsts';
import CustomMessage from '../../../../Components/CustomMessage/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader';
import { pagegroupFiltering } from '../../lib/helpers';
import ActionCard from '../../../../Components/ActionCard';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import CodeBox from '../../../../Components/CodeBox/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';

const getAdsByType = (ads, type) => ads.filter(ad => ad.formatData.type === type);

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
			fluid: true,
			showCloseButton: false,
			closeButtonCss: '',
			closeButtonText: '',
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
		this.cssChangeHandler = this.cssChangeHandler.bind(this);
		this.handleToggle = this.handleToggle.bind(this);
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleToggle(value, event) {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value,
			progress: name === 'fluid' ? 30 : 60
		});
	}

	selectPlatform(platform) {
		this.setState({
			progress: 10,
			platform,
			format: '',
			size: null,
			pagegroups: []
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

	generateAdData(data) {
		const { match } = this.props;
		const {
			size,
			format,
			pagegroups,
			platform,
			fluid,
			showCloseButton,
			closeButtonText
		} = this.state;
		const sizesArray = size.split('x');
		const width = sizesArray[0];
		const height = sizesArray[1];

		let typeAndPlacement = [];
		let type = null;
		let placement = null;

		if (format === 'chainedDocked') {
			type = format;
			placement = 'default';
		} else if (format === 'inView') {
			type = format;
			placement = 'top';
		} else {
			typeAndPlacement = format.split(/^([^A-Z]+)/);

			typeAndPlacement.shift();

			type = typeAndPlacement[0] ? typeAndPlacement[0].toLowerCase() : null;
			placement = typeAndPlacement[1] ? typeAndPlacement[1].toLowerCase() : 'default';
		}

		return {
			siteId: match.params.siteId,
			ad: {
				width,
				height,
				pagegroups: pagegroups || [],
				network: 'adpTags',
				fluid: format !== 'interstitial' ? fluid : false,
				showCloseButton,
				closeButtonText,
				closeButtonCss: data.closeButtonCss,
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
				css:
					format !== 'interstitial'
						? {
								display: 'block',
								'text-align': 'center',
								...data.css
						  }
						: {},
				blocklist: [],
				isActive: true,
				isInnovativeAd: true,
				// name: `Ad-${platform}-${format}-${width}x${height}-${+new Date()}`,
				...data.adData
			}
		};
	}

	selectPagegroups(pagegroup) {
		const { pagegroups } = this.state;
		const updatePagegroups = pagegroups.concat([]);

		if (updatePagegroups.includes(pagegroup)) {
			updatePagegroups.splice(updatePagegroups.indexOf(pagegroup), 1);
		} else {
			updatePagegroups.push(pagegroup);
		}
		let progress;
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

	cssChangeHandler(closeButtonCss) {
		this.setState({ closeButtonCss: window.btoa(closeButtonCss) });
	}

	selectFormat(format) {
		this.setState({
			format,
			size: null,
			progress: 20,
			pagegroups: []
		});
	}

	saveHandler(data) {
		const { createAd, dataForAuditLogs } = this.props;
		const { closeButtonCss } = this.state;
		let code = {};

		if (closeButtonCss && closeButtonCss.trim().length) {
			try {
				code = JSON.parse(window.atob(closeButtonCss));
				if (!code) {
					throw new Error('Invalid Close Button CSS');
				}
			} catch (e) {
				return window.alert('Invalid Close Button CSS');
			}
		}

		return this.setState(
			{
				progress: 100,
				loading: true
			},
			() =>
				createAd(this.generateAdData({ ...data, closeButtonCss: code }), dataForAuditLogs)
					.then(() => this.setState({ progress: 0, loading: false }))
					.catch(() => this.setState({ progress: 0, loading: false }))
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
				fluid: true
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
		const { meta, channels } = this.props;
		const { platform, format, pagegroups } = this.state;
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

	renderFluidToggleSubComponent = () => (
		<div>
			<i style={{ fontSize: '14px', color: '#cf474b' }}>
				The slot height may increase or decrease depending on the rendered ad size
			</i>
		</div>
	);

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
						subText="Enable this option to display ADX Native Ads"
						subComponent={this.renderFluidToggleSubComponent()}
					/>
				</Col>
				<Col md={7} />
			</Row>
		);
	}

	renderCloseButtonToggle() {
		const { match } = this.props;
		const { siteId } = match.params;
		const { showCloseButton } = this.state;
		return (
			<Row>
				<Col md={5}>
					<CustomToggleSwitch
						labelText="Show Close Button"
						className="u-margin-b4 negative-toggle closeButton-Toggle"
						checked={showCloseButton}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`showCloseButton-${siteId}`}
						id={`js-showCloseButton-${siteId}`}
						subText="Enable this option to have a close button on Sticky Ads"
					/>
				</Col>
				<Col md={7} />
			</Row>
		);
	}

	renderCustomCSSInput() {
		const { closeButtonCss, closeButtonText } = this.state;
		return (
			<>
				<Col md={3} />

				<Col md={9} className="u-padding-l5 u-padding-r3 u-margin-b4 close-button-fields">
					<FieldGroup
						label="Close Button Text"
						name="closeButtonText"
						value={closeButtonText}
						type="text"
						onChange={this.handleChange}
						size={4}
						id="closeButtonText-input"
						placeholder="You can type any name you want for a close button, Eg. Close, Clear etc. Default value is X"
						className="button-text"
					/>
					<label htmlFor="closeButtonCss">Custom CSS for Close Button</label>

					<CodeBox
						name="closeButtonCss"
						showButtons={false}
						code={closeButtonCss}
						onChange={this.cssChangeHandler}
						className="closebutton-css"
					/>
				</Col>
			</>
		);
	}

	renderIndividualFormat() {
		const { ads, match } = this.props;
		const { siteId } = match.params;
		const { format, pagegroups } = this.state;
		const save = {
			renderFn: this.renderButton,
			label: 'Create Ad',
			handler: this.saveHandler
		};
		const dockedAds = getAdsByType(ads, 'docked');
		const inviewAds = getAdsByType(ads, 'inView');
		const chainedDockedAds = getAdsByType(ads, 'chainedDocked');

		switch (format) {
			case 'stickyTop':
				return <StickyTop save={save} />;
			case 'inView':
				return <InView save={save} currentInviewAds={inviewAds} selectedPagegroups={pagegroups} />;
			case 'docked':
				return <Docked save={save} currentDockedAds={dockedAds} selectedPagegroups={pagegroups} />;
			case 'chainedDocked':
				return (
					<ChainedDocked
						save={save}
						currentChainedDockedAds={chainedDockedAds}
						selectedPagegroups={pagegroups}
						siteId={siteId}
					/>
				);
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
		const { progress, pagegroupsPresent, format, showCloseButton } = this.state;
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
						{progress >= 20 && format !== 'interstitial' ? this.renderFluidToggle() : null}
						{progress >= 20 ? this.renderSizes() : null}
						{progress >= 45 && format !== 'interstitial' ? this.renderPagegroups() : null}
						{format.includes('sticky') && format !== 'interstitial' && progress >= 60
							? this.renderCloseButtonToggle()
							: null}
						{format !== 'interstitial' &&
						format.includes('sticky') &&
						showCloseButton &&
						progress >= 60
							? this.renderCustomCSSInput()
							: null}
						{progress >= 60 && format !== 'interstitial' && pagegroupsPresent
							? this.renderFormatDetails()
							: null}
						{progress >= 45 && format === 'interstitial'
							? this.renderButton('Create Ad', this.saveHandler)
							: null}
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
