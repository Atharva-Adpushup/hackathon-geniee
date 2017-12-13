import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import { showNotification } from 'actions/uiActions';
import { saveKeyValues } from 'actions/variationActions.js';
import { interactiveAds } from '../../../../../consts/commonConsts';

class KeyValuesPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event: false,
			eventData: {
				value: ''
			},
			type: false,
			placement: false,
			size: [],
			containsADP: true,
			adpKeyValues: this.props.variation.adpKeyValues || null
		};
		this.checkADP = this.checkADP.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.eventChangeHandler = this.eventChangeHandler.bind(this);
		this.renderEventOptions = this.renderEventOptions.bind(this);
		this.renderFormatOptions = this.renderFormatOptions.bind(this);
		this.renderInput = this.renderInput.bind(this);
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({
	// 		containsADP: this.checkADP(nextProps.sections),
	// 		adpKeyValues: nextProps.variation.adpKeyValues || null
	// 	});
	// }

	// componentWillMount() {
	// 	this.setState({
	// 		containsADP: this.checkADP(this.props.sections)
	// 	});
	// }

	eventChangeHandler(event) {
		this.setState({ event: load });
	}

	renderInput(label, name, value) {
		return (
			<Row>
				<Col xs={4}>
					<strong>{label}</strong>
				</Col>
				<Col xs={6}>
					<input
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

	renderEventOptions() {
		switch (this.state.event) {
			case 'onMills':
				return this.renderInput('Enter trigger time', 'onMillsTime', this.state.eventData.value);
				break;

			case 'scroll':
				return this.renderInput('Enter scroll percentage', 'scrollPrecentage', this.state.eventData.value);
				break;

			case 'load':
			case 'DOMContentLoaded':
			default:
				return <Row>&nbsp;</Row>;
				break;
		}
	}

	renderFormatOptions() {
		return (
			<Row>
				<Col xs={4}>
					<strong>Select Format : </strong>
				</Col>
				<Col xs={6}>
					<SelectBox value={this.state.event} label="Select Event" onChange={this.eventChangeHandler}>
						{interactiveAds.types.map((item, index) => (
							<option key={index} value={item}>
								{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
							</option>
						))}
					</SelectBox>
				</Col>
			</Row>
		);
	}

	checkADP(sections) {
		return sections
			? sections.some(section => {
					let ad = section.ads[0];
					if (ad.network && ad.network == 'adpTags') {
						return true;
					}
				})
			: false;
	}

	submitHandler(value) {
		try {
			value = JSON.parse(value);
		} catch (e) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Key values must be valid JSON'
			});
			return false;
		}
		this.props.saveKeyValues(this.props.variation, value);
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Key Values Updated'
		});
	}

	render() {
		return this.state.containsADP ? (
			<div>
				<h1 className="variation-section-heading">Interactive Ads</h1>
				<Col xs={8}>
					<Row>
						<Col xs={4}>
							<strong>Select Event : </strong>
						</Col>
						<Col xs={6}>
							<div className="interactiveAdsRow">
								<SelectBox
									value={this.state.event}
									label="Select Event"
									onChange={this.eventChangeHandler}
								>
									{interactiveAds.events.map((item, index) => (
										<option key={index} value={item}>
											{item.toUpperCase()}
										</option>
									))}
								</SelectBox>
							</div>
							{/* <CodeBox
							customId={`${this.props.variation.id}adpKeyValues`}
							showButtons
							textEdit
							parentExpanded={this.props.ui.variationPanel.expanded}
							textEditBtn="Save Key Values"
							code={this.state.adpKeyValues ? JSON.stringify(this.state.adpKeyValues) : '{}'}
							onSubmit={this.submitHandler}
						/> */}
						</Col>
					</Row>
					{this.state.event ? this.renderEventOptions() : null}
					{this.state.event ? this.renderFromatOptions() : null}
				</Col>
			</div>
		) : (
			<div>Variation must contain one ADP section in order to set Key-Values</div>
		);
	}
}

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				showNotification: showNotification,
				saveKeyValues: saveKeyValues
			},
			dispatch
		)
)(KeyValuesPanel);
