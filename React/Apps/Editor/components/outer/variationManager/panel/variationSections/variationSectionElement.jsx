import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import LabelWithButton from 'components/shared/labelWithButton.jsx';
import { floats, networks } from 'consts/commonConsts';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import $ from 'jquery';

const errorBorder = {
	border: '1px solid #eb575c',
	boxShadow: 'inset 0px 0px 1px 1px #eb575c'
};

class variationSectionElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			float: this.props.section.float,
			network: this.props.section.ads[0].network,
			priceFloor:
				this.props.section.ads[0].networkData &&
				this.props.section.ads[0].networkData.hasOwnProperty('priceFloor')
					? this.props.section.ads[0].networkData.priceFloor
					: 0,
			headerBidding:
				this.props.section.ads[0].networkData &&
				this.props.section.ads[0].networkData.hasOwnProperty('headerBidding')
					? this.props.section.ads[0].networkData.headerBidding
					: true,
			adCode: this.props.section.ads[0].adCode || ''
		};

		this.onFloatSelectChange = this.onFloatSelectChange.bind(this);
		this.onPartnerDataUpdate = this.onPartnerDataUpdate.bind(this);
		this.renderNetworkOptions = this.renderNetworkOptions.bind(this);
		this.renderSwitch = this.renderSwitch.bind(this);
		this.onSelectChange = this.onSelectChange.bind(this);
		this.onAdCodeChange = this.onAdCodeChange.bind(this);
		this.updateNetworkWrapper = this.updateNetworkWrapper.bind(this);
		this.onToggleChange = this.onToggleChange.bind(this);
	}

	componentWillMount() {
		this.props.section.isIncontent
			? null
			: this.props.onSectionXPathValidate(this.props.section.id, this.props.section.xpath);
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

	onAdCodeChange(adCode) {
		this.props.updateAdCode(this.props.section.ads[0].id, adCode, this.state.network);
		this.setState({ adCode: adCode });
	}

	onSelectChange = network => {
		this.setState({
			network: network
		});
	};

	onToggleChange = value => {
		this.setState({
			headerBidding: value
		});
	};

	updateNetworkWrapper = () => {
		let priceFloor = ReactDOM.findDOMNode(this.refs.priceFloor).value || 0;
		this.setState({ priceFloor: priceFloor });
		this.props.updateNetwork(
			this.props.section.ads[0].id,
			priceFloor,
			this.state.network,
			this.state.headerBidding
		);
	};

	renderNetworkOptions = CodeBoxField => {
		let networkDropdownItems = networks;
		return (
			<Row>
				<Col>
					<Row>
						<Col className="u-padding-l10px" xs={12}>
							<SelectBox
								value={this.state.network}
								label="Select Network"
								showClear={false}
								onChange={this.onSelectChange}
							>
								{networkDropdownItems.map((item, index) => (
									<option key={index} value={item}>
										{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
									</option>
								))}
							</SelectBox>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	};

	renderSwitch = (field, headerBidding, onToggleChange, id) => {
		return (
			<CustomToggleSwitch
				labelText={field.label}
				className="mT-10 mB-10"
				labelSize={5}
				componentSize={7}
				customComponentClass="u-padding-r10px"
				checked={headerBidding}
				name={`headerBiddingSwitch-${id}`}
				layout="horizontal"
				size="m"
				id={`js-header-bidding-switch-${id}`}
				on="Yes"
				off="No"
				customComponentClass="u-padding-0px"
				labelBold={false}
				onChange={onToggleChange}
				{...field.input}
			/>
		);
	};

	render() {
		const props = this.props,
			adsObject = props.section.ads[0],
			isPartnerData = !!(props.section && props.section.partnerData),
			isCustomZoneId = !!(
				isPartnerData &&
				Object.keys(props.section.partnerData).length &&
				props.section.partnerData.customZoneId &&
				adsObject.network === 'geniee'
			),
			customZoneId = isCustomZoneId ? props.section.partnerData.customZoneId : '',
			customZoneIdText = isCustomZoneId ? 'Zone ID' : '';

		return (
			<li
				className="section-list-item"
				key={props.section.id}
				style={
					props.section.error
						? errorBorder
						: { ...errorBorder, border: '1px solid #d9d9d9', boxShadow: 'none' }
				}
			>
				<OverlayTrigger
					placement="bottom"
					overlay={<Tooltip id="delete-section-tooltip">Delete Section</Tooltip>}
				>
					{/*`section.ads[0].id` is temporarily added as 3rd argument to accomodate
                        * one section and one ad creation/deletion
                        * TODO: Remove `section.ads[0].id` hard-coded check and remove all ads inside
                        * a section using its `ads` array
                    */}
					<Button
						className="btn-close"
						onClick={props.onDeleteSection.bind(
							null,
							props.section.id,
							props.variation.id,
							props.section.ads[0].id
						)}
						type="submit"
					>
						x
					</Button>
				</OverlayTrigger>
				<Row>
					{props.section.isIncontent ? (
						<label className="section-label section-incontent">
							<i className="fa fa-object-group" />
							<span>In-Content</span>
						</label>
					) : (
						<label className="section-label section-structural">
							<i className="fa fa-object-ungroup" />
							<span>Structural {props.section.error}</span>
						</label>
					)}
					{isCustomZoneId ? (
						<label className="u-margin-l5px section-label section-incontent">
							<i className="fa fa-pencil" />
							<span>{customZoneIdText}</span>
						</label>
					) : null}
					{props.section.error ? (
						<label className="section-label section-error">
							<i className="fa fa-exclamation-triangle" />
							<span>Invalid XPath</span>
						</label>
					) : (
						''
					)}
					<Col className="u-padding-r10px section-name-ie" xs={12}>
						<InlineEdit
							validate
							value={props.section.name}
							submitHandler={props.onRenameSection.bind(null, props.section, props.variation.id)}
							text="Section Name"
							errorMessage="Section Name cannot be blank"
						/>
					</Col>
				</Row>
				<Row>
					{/* Read only Fields starts from here */}
					<Col xs={6}>
						<Row>
							<Col className="u-padding-r10px" xs={12}>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Size
									</Col>
									<Col xs={5}>
										<strong>
											{props.section.ads[0].width} x {props.section.ads[0].height}
										</strong>
									</Col>
								</Row>
							</Col>
						</Row>
						{props.section.isIncontent ? (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Section No.
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{props.section.sectionNo}</strong>
									</Col>
								</Row>
							</div>
						) : (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Operation
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{props.section.operation}</strong>
									</Col>
								</Row>
							</div>
						)}
						{Object.keys(props.reporting).length &&
						Object.keys(props.reporting.sections).length &&
						props.reporting.sections[props.section.id] ? (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total Impressions
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>
											{props.reporting.sections[props.section.id].aggregate.total_impressions}
										</strong>
									</Col>
								</Row>
								{window.isSuperUser ? (
									<Row>
										<Col className="u-padding-r10px" xs={7}>
											Total XPath Misses
										</Col>
										<Col className="u-padding-l10px" xs={5}>
											<strong>
												{props.reporting.sections[props.section.id].aggregate.total_xpath_miss}
											</strong>
										</Col>
									</Row>
								) : null}
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total CPM
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>
											{props.reporting.sections[props.section.id].aggregate.total_cpm}
										</strong>
									</Col>
								</Row>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total Revenue
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>
											{props.reporting.sections[props.section.id].aggregate.total_revenue}
										</strong>
									</Col>
								</Row>
							</div>
						) : null}
						{!props.section.isIncontent ? (
							<Row>
								<Col className="u-padding-t10px">
									<label
										className="section-label section-select-ad"
										onClick={props.onScrollSectionIntoView.bind(null, props.section.ads[0].id)}
									>
										<i className="fa fa-eye" aria-hidden="true" />
										<span>Select Ad</span>
									</label>
								</Col>
							</Row>
						) : null}
					</Col>
					{/* Editable Fields starts from here */}
					<Col xs={6}>
						{isCustomZoneId ? (
							<Col>
								<Row>
									<Col className="u-padding-r10px" xs={4}>
										Zone Id
									</Col>
									<Col className="u-padding-l10px" xs={8}>
										<InlineEdit
											type="number"
											compact
											validate
											value={customZoneId}
											submitHandler={this.onPartnerDataUpdate}
											text="Custom Zone Id"
											errorMessage="Custom zone id cannot be blank"
										/>
									</Col>
								</Row>
							</Col>
						) : null}
						{props.section.isIncontent ? (
							<div>
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
								<Row style={{ marginTop: 10 }}>
									<Col className="u-padding-r10px" xs={4}>
										Network
									</Col>
									<Col style={{ padding: 0 }} xs={8}>
										{this.renderNetworkOptions()}
									</Col>
								</Row>
								<Row style={{ marginTop: 10 }}>
									{this.state.network ? (
										this.state.network == 'adpTags' ? (
											<div>
												<div className="clearfix" style={{ marginBottom: 10 }}>
													<Col className="u-padding-r10px" xs={4}>
														Price Floor
													</Col>
													<Col className="u-padding-l10px" xs={8}>
														<input
															placeholder="Please enter price floor"
															ref="priceFloor"
															type="text"
															className="inputMinimal"
															defaultValue={this.state.priceFloor}
														/>
													</Col>
												</div>
												<div>
													<Col>
														{this.renderSwitch(
															{
																label: 'Header Bidding',
																name: 'headerBidding'
															},
															this.state.headerBidding,
															this.onToggleChange,
															props.section.id
														)}
													</Col>
												</div>
												<div className="mT-10">
													<Col>
														<Button
															className="btn-lightBg btn-save btn-block"
															onClick={this.updateNetworkWrapper}
															type="submit"
														>
															Save
														</Button>
													</Col>
												</div>
											</div>
										) : (
											<div>
												<Row>
													<Col className="u-padding-r10px" xs={4}>
														Ad Code
													</Col>
													<Col className="u-padding-l10px" xs={8}>
														<InlineEdit
															compact
															validate
															showTextarea
															adCode
															value={this.state.adCode}
															submitHandler={this.onAdCodeChange}
															text="Ad Code"
															errorMessage="Ad Code cannot be blank"
														/>
													</Col>
												</Row>
											</div>
										)
									) : null}
								</Row>
							</div>
						) : (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={4}>
										XPath
									</Col>
									<Col className="u-padding-l10px" xs={8}>
										<InlineEdit
											compact
											validate
											cancelEditHandler={props.onResetErrors.bind(null, props.section.id)}
											customError={props.ui.errors.xpath ? props.ui.errors.xpath.error : false}
											dropdownList={props.section.allXpaths}
											value={props.section.xpath}
											keyUpHandler={props.onValidateXPath.bind(null, props.section.id)}
											submitHandler={props.onUpdateXPath.bind(null, props.section.id)}
											editClickHandler={props.onSectionAllXPaths.bind(
												null,
												props.section.id,
												props.section.xpath
											)}
											text="XPath"
											errorMessage={
												props.ui.errors.xpath && props.ui.errors.xpath.error
													? props.ui.errors.xpath.message
													: 'XPath cannot be blank'
											}
										/>
									</Col>
								</Row>
							</div>
						)}
					</Col>
				</Row>
			</li>
		);
	}
}

export default variationSectionElement;
