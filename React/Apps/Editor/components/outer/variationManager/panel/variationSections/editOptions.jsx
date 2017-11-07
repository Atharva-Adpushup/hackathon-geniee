import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import LabelWithButton from 'components/shared/labelWithButton.jsx';
import { floats, networks } from 'consts/commonConsts';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';

class EditOptions extends Component {
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
		// this.props.updateAdCode(this.props.section.ads[0].id, adCode, this.state.network);
		this.props.updateNetwork(this.props.section.ads[0].id, this.state.network, {
			adCode: adCode
		});
		this.setState({ adCode: adCode });
	}

	onSelectChange = network => this.setState({ network: network });

	onToggleChange = value => this.setState({ headerBidding: value });

	updateNetworkWrapper = () => {
		let priceFloor = ReactDOM.findDOMNode(this.refs.priceFloor).value || 0;
		this.setState({ priceFloor: priceFloor });
		this.props.updateNetwork(this.props.section.ads[0].id, this.state.network, {
			keyValues: {
				FP_SA: parseInt(priceFloor)
			},
			headerBidding: this.state.headerBidding
		});
	};

	renderNetworkOptions = () => {
		return (
			<Row>
				<Col className="u-padding-l10px" xs={12}>
					<SelectBox
						value={this.state.network}
						label="Select Network"
						showClear={false}
						onChange={this.onSelectChange}
					>
						{networks.map((item, index) => (
							<option key={index} value={item}>
								{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
							</option>
						))}
					</SelectBox>
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
				{!this.props.section.isIncontent ? (
					<Row>
						<Col className="u-padding-r10px" xs={4}>
							XPath
						</Col>
						<Col className="u-padding-l10px" xs={8}>
							<InlineEdit
								compact
								validate
								cancelEditHandler={this.props.onResetErrors.bind(null, this.props.section.id)}
								customError={this.props.ui.errors.xpath ? this.props.ui.errors.xpath.error : false}
								dropdownList={this.props.section.allXpaths}
								value={this.props.section.xpath}
								keyUpHandler={this.props.onValidateXPath.bind(null, this.props.section.id)}
								submitHandler={this.props.onUpdateXPath.bind(null, this.props.section.id)}
								editClickHandler={this.props.onSectionAllXPaths.bind(
									null,
									this.props.section.id,
									this.props.section.xpath
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
				) : (
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
				)}
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
											this.props.section.id
										)}
									</Col>
								</div>
								<div className="mT-5">
									<Col xs={8} xsPush={4} style={{ paddingRight: '0px' }}>
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
		);
	}
}

export default EditOptions;
