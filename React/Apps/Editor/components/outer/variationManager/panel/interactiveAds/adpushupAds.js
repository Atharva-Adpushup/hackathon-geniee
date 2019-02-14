import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import { showNotification } from 'actions/uiActions';
import { saveKeyValues } from 'actions/variationActions.js';
import { interactiveAds } from '../../../../../consts/commonConsts';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';

class AdPushupAds extends Component {
	constructor(props) {
		super(props);
		let isFormatDataPresent = this.props.section && this.props.section.formatData,
			formatData = isFormatDataPresent ? this.props.section.formatData : false;
		this.state = {
			event: isFormatDataPresent ? formatData.event : false,
			eventData: {
				value: isFormatDataPresent ? formatData.eventData.value : ''
			},
			type: isFormatDataPresent ? formatData.type : false,
			placement: isFormatDataPresent ? formatData.placement : false,
			format: isFormatDataPresent
				? `${formatData.type}${formatData.placement.charAt(0).toUpperCase() + formatData.placement.slice(1)}`
				: false,
			size: this.props.ad ? `${this.props.ad.width}x${this.props.ad.height}` : false,
			css: this.props.ad ? this.props.ad.css : {},
			containsInteractiveAd: true,
			reset: false,
			showButtons: false
		};
		this.submitHandler = this.submitHandler.bind(this);
		this.eventChangeHandler = this.eventChangeHandler.bind(this);
		this.formatChangeHandler = this.formatChangeHandler.bind(this);
		this.sizeChangeHandler = this.sizeChangeHandler.bind(this);
		this.cssChangeHandler = this.cssChangeHandler.bind(this);
		this.renderEventOptions = this.renderEventOptions.bind(this);
		this.renderFormatSelect = this.renderFormatSelect.bind(this);
		this.renderFormatOptions = this.renderFormatOptions.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderNetwork = this.renderNetwork.bind(this);
		this.renderButtons = this.renderButtons.bind(this);
	}

	eventChangeHandler(event) {
		this.setState({ event });
	}

	sizeChangeHandler(size) {
		this.setState({ size });
	}

	formatChangeHandler(format) {
		let type = false,
			placement = false;
		if (format) {
			let typeAndPlacement = format.split(/^([^A-Z]+)/);
			typeAndPlacement.shift();
			type = typeAndPlacement[0].toLowerCase();
			placement = typeAndPlacement[1].toLowerCase();
		}
		this.setState({
			type: type,
			placement: placement,
			format: format,
			showButtons: format == 'videoCustom' ? true : false
		});
	}

	cssChangeHandler(css) {
		this.setState({ css });
	}

	renderInput(label, name, type, value, leftWidth, rightWidth) {
		return (
			<Row className="mT-15">
				<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
					<strong>{label}</strong>
				</Col>
				<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
					<input
						className="inputMinimal"
						type={type}
						style={{ width: '100%' }}
						name={name}
						value={value}
						onChange={ev => {
							this.setState({ eventData: { value: ev.target.value } });
						}}
					/>
				</Col>
			</Row>
		);
	}

	renderEventOptions(leftWidth, rightWidth) {
		switch (this.state.event) {
			case 'onMills':
				return this.renderInput(
					'Trigger time',
					'onMillsTime',
					'number',
					this.state.eventData.value,
					leftWidth,
					rightWidth
				);
				break;

			// case 'scroll':
			// 	return this.renderInput(
			// 		'Scroll percentage',
			// 		'scrollPrecentage',
			// 		'number',
			// 		this.state.eventData.value,
			// 		leftWidth,
			// 		rightWidth
			// 	);
			// 	break;

			case 'DOMContentLoaded':
			case 'scriptLoaded':
			case 'scroll':
				return this.renderInput(
					'Xpath (optional)',
					'xpath',
					'string',
					this.state.eventData.value,
					leftWidth,
					rightWidth
				);
				break;

			default:
				return <Row>&nbsp;</Row>;
				break;
		}
	}

	renderFormatSelect(leftWidth, rightWidth) {
		// let limit = this.props.platform == 'DESKTOP' ? interactiveAds.types.length : 1,
		let types = interactiveAds.types[this.props.platform.toUpperCase()];
		return (
			<Row className="mT-15">
				<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
					<strong>Format </strong>
				</Col>
				<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
					<SelectBox value={this.state.format} label="Select Format" onChange={this.formatChangeHandler}>
						{types.map((item, index) => (
							<option key={index} value={item}>
								{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
							</option>
						))}
					</SelectBox>
				</Col>
			</Row>
		);
	}

	renderFormatOptions(leftWidth, rightWidth) {
		return (
			<div>
				<Row className="mT-15">
					<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
						<strong>Size </strong>
					</Col>
					<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
						<SelectBox value={this.state.size} label="Select Size" onChange={this.sizeChangeHandler}>
							{interactiveAds.sizes[this.props.platform][this.state.type][this.state.placement].map(
								(item, index) => (
									<option key={index} value={item}>
										{item}
									</option>
								)
							)}
						</SelectBox>
					</Col>
				</Row>
				<Row className="mT-15">
					<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
						<strong>CSS </strong>
					</Col>
					<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
						<CodeBox
							customId={`${this.props.variation.id}interactiveAds`}
							showButtons={false}
							textEdit
							parentExpanded={this.props.ui.variationPanel.expanded}
							code={
								this.state.css
									? typeof this.state.css == 'object'
										? JSON.stringify(this.state.css)
										: JSON.parse(this.state.css)
									: {}
							}
							onChange={this.cssChangeHandler}
						/>
					</Col>
				</Row>
			</div>
		);
	}

	renderNetwork(leftWidth, rightWidth) {
		return (
			<Row className="mT-15">
				<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
					<strong>Network</strong>
				</Col>
				<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
					<NetworkOptions
						onSubmit={this.submitHandler}
						onCancel={() => {}}
						buttonType={2}
						fromPanel={true}
						showNotification={this.props.showNotification}
						reset={this.state.reset}
						isInsertMode={true}
					/>
				</Col>
			</Row>
		);
	}

	submitHandler(networkInfo) {
		let css =
			typeof this.state.css == 'string' && this.state.css.length
				? JSON.parse(this.state.css)
				: Object.keys(this.state.css).length
					? this.state.css
					: {};
		if (
			!this.state.event ||
			!this.state.format ||
			!this.state.size ||
			(this.props.showNetworkOptions &&
				(!networkInfo.network || !networkInfo.networkData) &&
				!this.state.showButtons) ||
			(this.state.format == 'videoCustom' && !this.state.eventData.value.trim().length)
		) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid Values',
				message: 'Please check entered details'
			});
			return false;
		}
		const sectionPayload = {
				formatData: {
					event: this.state.event,
					eventData: this.state.eventData,
					type: this.state.type,
					placement: this.state.placement
				},
				type: 3
			},
			sizes = this.state.size.split('x'),
			adPayload = {
				width: Number(sizes[0]),
				height: Number(sizes[1]),
				css: css
			};

		this.props.showNetworkOptions && networkInfo
			? ((adPayload.networkData = networkInfo.networkData), (adPayload.network = networkInfo.network))
			: null;

		if (this.state.format == 'videoCustom') {
			adPayload.network = 'custom';
			adPayload.networkData = {
				adCode: '',
				forceByPass: true
			};
			sectionPayload.xpath = this.state.eventData.value.trim();
			sectionPayload.operation = 'Append';
		}

		this.setState(
			{
				event: false,
				eventData: {
					value: ''
				},
				type: false,
				placement: false,
				format: false,
				size: false,
				css: {},
				reset: true,
				showButtons: false
			},
			() => this.props.submitHandler(sectionPayload, adPayload)
		);
	}

	renderButtons(leftWidth, rightWidth) {
		return (
			<Row className="mT-15">
				<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
					<Button className="btn-lightBg btn-save btn-block" onClick={this.submitHandler}>
						Save
					</Button>
				</Col>
				<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
					<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onCancel}>
						Cancel
					</Button>
				</Col>
			</Row>
		);
	}

	render() {
		let parentStyle = { padding: this.props.fromEditSection ? '0px 0px' : '20px 0px' },
			colStyle = { padding: this.props.fromEditSection ? '0px 0px' : '' },
			overAllWidth = this.props.fromEditSection ? 12 : 7,
			leftWidth = this.props.fromEditSection ? 4 : 5,
			rightWidth = this.props.fromEditSection ? 8 : 7;
		return (
			<div style={parentStyle}>
				<Col xs={overAllWidth} style={colStyle}>
					<Row>
						<Col xs={leftWidth} className={this.props.fromEditSection ? 'u-padding-r10px' : ''}>
							<strong>Event</strong>
						</Col>
						<Col xs={rightWidth} className={this.props.fromEditSection ? 'u-padding-l10px' : ''}>
							<div className="interactiveAdsRow">
								<SelectBox value={this.state.event} label="Event" onChange={this.eventChangeHandler}>
									{interactiveAds.events.map((item, index) => (
										<option key={index} value={item}>
											{item.toUpperCase()}
										</option>
									))}
								</SelectBox>
							</div>
						</Col>
					</Row>
					{this.state.event ? this.renderEventOptions(leftWidth, rightWidth) : null}
					{this.state.event ? this.renderFormatSelect(leftWidth, rightWidth) : null}
					{this.state.event && this.state.format ? this.renderFormatOptions(leftWidth, rightWidth) : null}
					{this.props.showNetworkOptions && !this.state.showButtons
						? this.renderNetwork(leftWidth, rightWidth)
						: null}
					{this.props.showButtons || this.state.showButtons
						? this.renderButtons(leftWidth, rightWidth)
						: null}
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

export default AdPushupAds;
