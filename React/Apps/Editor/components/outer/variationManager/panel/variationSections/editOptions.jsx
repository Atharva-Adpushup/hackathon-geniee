import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import { floats, networks } from 'consts/commonConsts';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';
import AdDetails from '../../../editMenu/AdDetails';
import AdPushupAds from '../interactiveAds/adpushupAds';

class EditOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			float: this.props.section.float,
			editNetwork: false,
			editInteractiveAdData: false
		};

		this.onFloatSelectChange = this.onFloatSelectChange.bind(this);
		this.onPartnerDataUpdate = this.onPartnerDataUpdate.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.toggleNetworkEditor = this.toggleNetworkEditor.bind(this);
		this.toggleEditInteractiveAd = this.toggleEditInteractiveAd.bind(this);
		this.adpushupSubmitHandler = this.adpushupSubmitHandler.bind(this);
		this.customCSSEditorSubmit = this.customCSSEditorSubmit.bind(this);
	}

	onFloatSelectChange(float) {
		this.setState({ float });

		const sectionId = this.props.section.id, adId = this.props.section.ads[0].id;
		this.props.onIncontentFloatUpdate(sectionId, adId, float);
	}

	onPartnerDataUpdate(customZoneId) {
		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id,
			partnerData = $.extend(true, {}, this.props.section.partnerData);

		partnerData.customZoneId = customZoneId;
		this.props.onUpdatePartnerData(sectionId, adId, partnerData);
	}

	submitHandler = networkData => {
		this.props.updateNetwork(this.props.section.ads[0].id, networkData);
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Section Updated'
		});
		this.toggleNetworkEditor();
	};

	adpushupSubmitHandler = (sectionPayload, adPayload) => {
		console.log(sectionPayload, adPayload);
		this.props.updateSection(this.props.section.id, sectionPayload);
		this.props.updateAd(this.props.section.ads[0].id, adPayload);
		this.toggleEditInteractiveAd();
	};

	toggleNetworkEditor() {
		this.setState({ editNetwork: !this.state.editNetwork });
	}

	toggleEditInteractiveAd() {
		this.setState({ editInteractiveAdData: !this.state.editInteractiveAdData });
	}

	customCSSEditorSubmit(adId, customCSS) {
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Ad custom CSS saved successfully'
		});
		this.props.onUpdateCustomCss(adId, customCSS);
	}

	renderContent() {
		if (this.state.editNetwork) {
			return (
				<NetworkOptions
					onSubmit={this.submitHandler}
					onCancel={this.toggleNetworkEditor}
					ad={this.props.section.ads[0]}
					buttonType={2}
					fromPanel={true}
					id={this.props.section.id}
					showNotification={this.props.showNotification}
					networkConfig={this.props.networkConfig}
				/>
			);
		}
		if (this.state.editInteractiveAdData) {
			return (
				<AdPushupAds
					userType={currentUser.userType || false}
					ad={this.props.section.ads[0]}
					ui={this.props.ui}
					section={this.props.section}
					variation={this.props.variation}
					submitHandler={this.adpushupSubmitHandler}
					onCancel={this.toggleEditInteractiveAd}
					showNetworkOptions={false}
					showButtons={true}
					fromEditSection={true}
					platform={this.props.platform}
				/>
			);
		}
		return (
			<AdDetails
				userType={currentUser.userType || false}
				ad={this.props.section.ads[0]}
				ui={this.props.ui}
				section={this.props.section}
				variationId={this.props.variation.id}
				editNetwork={this.toggleNetworkEditor}
				editInteractiveAd={this.toggleEditInteractiveAd}
				fromPanel={true}
				showEventData={this.props.section.type == 3 ? true : false}
				onUpdateOperation={this.props.onUpdateOperation}
				onSetSectionType={this.props.onSetSectionType}
				onFormatDataUpdate={this.props.onFormatDataUpdate}
				onToggleLazyLoad={this.props.onToggleLazyLoad}
			/>
		);
	}

	render() {
		const sectionProps = this.props.section,
			isInContentSection = !!sectionProps.isIncontent,
			isInContentMinDistanceFromPrevAd = !!(isInContentSection &&
				sectionProps.minDistanceFromPrevAd &&
				Number(sectionProps.minDistanceFromPrevAd) > -1),
			isInContentAds = !!(isInContentSection && sectionProps.ads && sectionProps.ads.length),
			adProps = isInContentAds && sectionProps.ads[0],
			isInContentCustomCSS = !!(isInContentAds && sectionProps.ads[0] && sectionProps.ads[0].customCSS),
			defaultCustomCSS = {
				'margin-top': '0px',
				'margin-right': '0px',
				'margin-bottom': '0px',
				'margin-left': '0px'
			};

		let inContentAdCustomCSS = isInContentCustomCSS ? sectionProps.ads[0].customCSS : defaultCustomCSS;

		return (
			<div>
				{this.props.isCustomZoneId
					? <Row>
							<Col className="u-padding-r10px" xs={4}>
								Zone Id
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<InlineEdit
									type="number"
									compact
									validate
									value={this.props.customZoneId}
									submitHandler={this.onPartnerDataUpdate}
									text="Custom Zone Id"
									errorMessage="Custom zone id cannot be blank"
								/>
							</Col>
						</Row>
					: null}
				{!sectionProps.isIncontent
					? sectionProps.type != 3
							? <Row>
									<Col className="u-padding-r10px" xs={4}>
										XPath
									</Col>
									<Col className="u-padding-l10px" xs={8}>
										<InlineEdit
											compact
											validate
											cancelEditHandler={this.props.onResetErrors.bind(null, sectionProps.id)}
											customError={
												this.props.ui.errors.xpath ? this.props.ui.errors.xpath.error : false
											}
											dropdownList={sectionProps.allXpaths}
											value={sectionProps.xpath}
											keyUpHandler={this.props.onValidateXPath.bind(null, sectionProps.id)}
											submitHandler={this.props.onUpdateXPath.bind(null, sectionProps.id)}
											editClickHandler={this.props.onSectionAllXPaths.bind(
												null,
												sectionProps.id,
												sectionProps.xpath
											)}
											text="XPath"
											errorMessage={
												this.props.ui.errors.xpath && this.props.ui.errors.xpath.error
													? this.props.ui.errors.xpath.message
													: 'XPath cannot be blank'
											}
										/>
									</Col>
								</Row>
							: null
					: <div>
							<Row>
								<Col className="u-padding-0px mB-5" xs={12}>
									Min distance from previous ad
								</Col>
							</Row>
							<Row>
								<Col className="u-padding-0px mB-5" xs={12}>
									<InlineEdit
										validate
										cancelEditHandler={this.props.onResetErrors.bind(null, sectionProps.id)}
										value={sectionProps.minDistanceFromPrevAd.toString()}
										submitHandler={this.props.onUpdateInContentMinDistanceFromPrevAd.bind(
											null,
											sectionProps.id
										)}
										editClickHandler={this.props.onUpdateInContentMinDistanceFromPrevAd.bind(
											null,
											sectionProps.id
										)}
										text="minDistanceFromPrevAd"
										errorMessage={'minDistanceFromPrevAd cannot be blank'}
									/>
								</Col>
							</Row>
							<Row>
								<Col className="u-padding-0px mB-5 mT-5" xs={12}>
									Custom CSS
								</Col>
							</Row>
							<Row>
								<Col className="u-padding-0px mB-10" xs={12}>
									<CssEditor
										compact
										css={inContentAdCustomCSS}
										onSave={this.customCSSEditorSubmit.bind(null, adProps.id)}
										onCancel={() => {}}
									/>
								</Col>
							</Row>

							<Row>
								<Col className="u-padding-r10px" xs={4}>
									Float
								</Col>
								<Col className="u-padding-l10px" xs={8}>
									<SelectBox
										value={this.state.float}
										label="Select Float"
										onChange={this.onFloatSelectChange}
										showClear={false}
									>
										{floats.map((float, index) => (
											<option key={index} value={float}>
												{float}
											</option>
										))}
									</SelectBox>
								</Col>
							</Row>
						</div>}
				<div className="mT-10">{this.renderContent()}</div>
			</div>
		);
	}
}

export default EditOptions;
