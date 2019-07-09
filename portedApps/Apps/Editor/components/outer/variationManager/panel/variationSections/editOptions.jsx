import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Utils from 'libs/utils';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import { floats, networks, iabSizes } from 'consts/commonConsts';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';
import AdDetails from '../../../editMenu/AdDetails';
import AdPushupAds from '../interactiveAds/adpushupAds';

class EditOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			float: this.props.section.float,
			editNetwork: false,
			editInteractiveAdData: false,
			toggleCustomCSSEditor: false,
			toggleNotNearCSSEditor: false
		};

		this.onFloatSelectChange = this.onFloatSelectChange.bind(this);
		this.onPartnerDataUpdate = this.onPartnerDataUpdate.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.toggleNetworkEditor = this.toggleNetworkEditor.bind(this);
		this.toggleCustomCSSEditor = this.toggleCustomCSSEditor.bind(this);
		this.toggleNotNearCSSEditor = this.toggleNotNearCSSEditor.bind(this);
		this.toggleEditInteractiveAd = this.toggleEditInteractiveAd.bind(this);
		this.adpushupSubmitHandler = this.adpushupSubmitHandler.bind(this);
		this.customCSSEditorSubmit = this.customCSSEditorSubmit.bind(this);
		this.notNearEditorSubmit = this.notNearEditorSubmit.bind(this);
	}

	onFloatSelectChange(float) {
		this.setState({ float });

		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id;
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
		const { section } = this.props;
		const [ad] = section.ads;

		Utils.updateMultipleAdSizes(ad, networkData, iabSizes, this);
		this.props.updateNetwork(ad.id, networkData);
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

	toggleCustomCSSEditor() {
		this.setState({ toggleCustomCSSEditor: !this.state.toggleCustomCSSEditor });
	}

	toggleNotNearCSSEditor() {
		this.setState({ toggleNotNearCSSEditor: !this.state.toggleNotNearCSSEditor });
	}

	customCSSEditorSubmit(adId, customCSS) {
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Ad custom CSS saved successfully'
		});
		this.props.onUpdateCustomCss(adId, customCSS);
		this.toggleCustomCSSEditor();
	}

	notNearEditorSubmit(sectionId, notNear) {
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Section not near saved successfully'
		});
		this.props.onUpdateInContentNotNear(sectionId, notNear);
		this.toggleNotNearCSSEditor();
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

	renderIncontentData() {
		const {
				props: { section },
				state
			} = this,
			{ toggleCustomCSSEditor, toggleNotNearCSSEditor } = state,
			{ isIncontent, ads, id, notNear, minDistanceFromPrevAd } = section,
			isInContentAds = !!(isIncontent && ads && ads.length),
			adProps = isInContentAds && ads[0],
			isInContentCustomCSS = !!(isInContentAds && ads[0] && ads[0].customCSS),
			defaultCustomCSS = {
				'margin-top': '0px',
				'margin-right': '0px',
				'margin-bottom': '0px',
				'margin-left': '0px'
			},
			inContentAdCustomCSS = isInContentCustomCSS ? ads[0].customCSS : defaultCustomCSS,
			computedNotNear = notNear && notNear.length ? notNear : [];
		let computedCustomCSSElem = toggleCustomCSSEditor ? (
			<CssEditor
				compact
				css={inContentAdCustomCSS}
				onSave={this.customCSSEditorSubmit.bind(null, adProps.id)}
				onCancel={this.toggleCustomCSSEditor}
			/>
		) : (
			<pre id="adDetails">
				<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-custom-css">Edit Custom CSS</Tooltip>}>
					<span className="adDetails-icon" onClick={this.toggleCustomCSSEditor}>
						<i className="btn-icn-edit" />
					</span>
				</OverlayTrigger>
				{Object.keys(inContentAdCustomCSS).map((propertyKey, key) => {
					const propertyValue = inContentAdCustomCSS[propertyKey];

					return (
						<p key={key} style={{ margin: 0, fontWeight: 'bold' }}>
							{propertyKey} : {propertyValue}
						</p>
					);
				})}
			</pre>
		);
		let computedNotNearElem = toggleNotNearCSSEditor ? (
			<CssEditor
				compact
				css={computedNotNear}
				onSave={this.notNearEditorSubmit.bind(null, id)}
				onCancel={this.toggleNotNearCSSEditor}
			/>
		) : (
			<pre id="adDetails">
				<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-not-near">Edit Not Near</Tooltip>}>
					<span className="adDetails-icon" onClick={this.toggleNotNearCSSEditor}>
						<i className="btn-icn-edit" />
					</span>
				</OverlayTrigger>
				{computedNotNear.map((object, key) => {
					const propertyKey = Object.keys(object)[0];
					const propertyValue = object[propertyKey];

					return (
						<p key={key} style={{ margin: 0, fontWeight: 'bold' }}>
							{propertyKey} : {propertyValue}
						</p>
					);
				})}
			</pre>
		);

		computedCustomCSSElem = (
			<div>
				<Row>
					<Col className="u-padding-0px mB-5 mT-5" xs={12}>
						Custom CSS
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-0px mB-10" xs={12}>
						{computedCustomCSSElem}
					</Col>
				</Row>
			</div>
		);
		computedNotNearElem = (
			<div>
				<Row>
					<Col className="u-padding-0px mB-5 mT-5" xs={12}>
						Not Near
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-0px mB-10" xs={12}>
						{computedNotNearElem}
					</Col>
				</Row>
			</div>
		);

		return (
			<div>
				<Row>
					<Col className="u-padding-0px mB-5" xs={12}>
						Min distance from previous ad
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-0px mB-5" xs={12}>
						<InlineEdit
							validate
							cancelEditHandler={this.props.onResetErrors.bind(null, id)}
							value={minDistanceFromPrevAd.toString()}
							submitHandler={this.props.onUpdateInContentMinDistanceFromPrevAd.bind(null, id)}
							editClickHandler={this.props.onUpdateInContentMinDistanceFromPrevAd.bind(null, id)}
							text="minDistanceFromPrevAd"
							errorMessage={'minDistanceFromPrevAd cannot be blank'}
						/>
					</Col>
				</Row>
				{computedCustomCSSElem}
				{computedNotNearElem}
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
			</div>
		);
	}

	render() {
		const sectionProps = this.props.section;

		return (
			<div>
				{this.props.isCustomZoneId ? (
					<Row>
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
				) : null}
				{!sectionProps.isIncontent ? (
					sectionProps.type != 3 ? (
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								XPath
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<InlineEdit
									compact
									validate
									cancelEditHandler={this.props.onResetErrors.bind(null, sectionProps.id)}
									customError={this.props.ui.errors.xpath ? this.props.ui.errors.xpath.error : false}
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
					) : null
				) : (
					this.renderIncontentData()
				)}
				<div className="mT-10">{this.renderContent()}</div>
			</div>
		);
	}
}

export default EditOptions;
