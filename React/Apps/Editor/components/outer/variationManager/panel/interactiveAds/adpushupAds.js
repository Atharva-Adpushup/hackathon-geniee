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

		const isFormatDataPresent = this.props.section && this.props.section.formatData;
		const formatData = isFormatDataPresent ? this.props.section.formatData : false;

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

			case 'scroll':
				return this.renderInput(
					'Scroll percentage',
					'scrollPrecentage',
					'number',
					this.state.eventData.value,
					leftWidth,
					rightWidth
				);
				break;

			case 'DOMContentLoaded':
			case 'scriptLoaded':
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
		const { networkConfig, fromEditSection, showNotification } = this.props;
		return (
			<Row className="mT-15">
				<Col xs={leftWidth} className={fromEditSection ? 'u-padding-r10px' : ''}>
					<strong>Network</strong>
				</Col>
				<Col xs={rightWidth} className={fromEditSection ? 'u-padding-l10px' : ''}>
					<NetworkOptions
						onSubmit={this.submitHandler}
						onCancel={() => {}}
						buttonType={2}
						fromPanel={true}
						showNotification={showNotification}
						reset={this.state.reset}
						isInsertMode={true}
						networkConfig={networkConfig}
					/>
				</Col>
			</Row>
		);
	}

	submitHandler(networkInfo) {
		const { css, event, format, size, eventData, showButtons, type, placement } = this.state;
		const { showNetworkOptions, showNotification, submitHandler } = this.props;
		let parsedCss;

		try {
			parsedCss = typeof css === 'string' && css.length ? JSON.parse(css) : Object.keys(css).length ? css : {};
		} catch (e) {
			console.log('CSS parsing in Interactive Ad failed');
			parsedCss = {};
		}
		const majorPropertiesWrong = !event || !format || !size; // Checking if any of ad's event, format, size is missing
		const eventDataWrong = (event === 'scroll' || event === 'onMills') && !eventData.value.trim().length; // this check is not valid now because we have removed these events
		const networkDataWrong =
			showNetworkOptions && !showButtons && (!networkInfo.network || !networkInfo.networkData); // if demand assignment is allowed but network & networkData is missing then true
		const videoDataWrong = format == 'videoCustom' && !eventData.value.trim().length; // deprecated
		if (majorPropertiesWrong || eventDataWrong || networkDataWrong || videoDataWrong) {
			showNotification({
				mode: 'error',
				title: 'Invalid Values',
				message: 'Please check entered details'
			});
			return false;
		}
		const sectionPayload = {
				formatData: {
					event: event,
					eventData: eventData,
					type: type,
					placement: placement
				},
				type: 3
			},
			sizes = size.split('x'),
			adPayload = {
				width: Number(sizes[0]),
				height: Number(sizes[1]),
				css: parsedCss
			};

		showNetworkOptions && networkInfo
			? ((adPayload.networkData = networkInfo.networkData), (adPayload.network = networkInfo.network))
			: null;

		if (format == 'videoCustom') {
			adPayload.network = 'custom';
			adPayload.networkData = {
				adCode: '',
				forceByPass: true
			};
			sectionPayload.xpath = eventData.value.trim();
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
			() => submitHandler(sectionPayload, adPayload)
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
		const { fromEditSection, showNetworkOptions } = this.props;
		const { event, showButtons, format } = this.state;
		const parentStyle = { padding: fromEditSection ? '0px 0px' : '20px 0px' };
		const colStyle = { padding: fromEditSection ? '0px 0px' : '' };
		const overAllWidth = fromEditSection ? 12 : 7;
		const leftWidth = fromEditSection ? 4 : 5;
		const rightWidth = fromEditSection ? 8 : 7;

		return (
			<div style={parentStyle}>
				<Col xs={overAllWidth} style={colStyle}>
					<Row>
						<Col xs={leftWidth} className={fromEditSection ? 'u-padding-r10px' : ''}>
							<strong>Event</strong>
						</Col>
						<Col xs={rightWidth} className={fromEditSection ? 'u-padding-l10px' : ''}>
							<div className="interactiveAdsRow">
								<SelectBox value={event} label="Event" onChange={this.eventChangeHandler}>
									{interactiveAds.events.map((item, index) => (
										<option key={index} value={item}>
											{item.toUpperCase()}
										</option>
									))}
								</SelectBox>
							</div>
						</Col>
					</Row>
					{event ? this.renderEventOptions(leftWidth, rightWidth) : null}
					{event ? this.renderFormatSelect(leftWidth, rightWidth) : null}
					{event && format ? this.renderFormatOptions(leftWidth, rightWidth) : null}
					{showNetworkOptions && !showButtons ? this.renderNetwork(leftWidth, rightWidth) : null}
					{showButtons || showButtons ? this.renderButtons(leftWidth, rightWidth) : null}
				</Col>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

export default AdPushupAds;
