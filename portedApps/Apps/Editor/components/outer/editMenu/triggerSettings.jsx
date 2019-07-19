import React, { Component } from 'react';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import { typeOfAds } from '../../../consts/commonConsts';

class TriggerSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			externalTrigger:
				this.props.section && this.props.section.type == typeOfAds.EXTERNAL_TRIGGER_AD ? true : false
		};
		this.renderContent = this.renderContent.bind(this);
	}

	renderContent() {
		return (
			<div>
				<pre>Creative code will be here</pre>
			</div>
		);
	}

	renderButton(text, handler) {
		return (
			<Col xs={6} xsPush={6} style={{ padding: '0px' }}>
				<Button className="btn-lightBg btn-block" onClick={handler}>
					{text}
				</Button>
			</Col>
		);
	}

	render() {
		return (
			<div>
				<Col xs={12} className="u-padding-0px">
					<CustomToggleSwitch
						labelText="DFP Trigger"
						className="mB-10"
						checked={this.state.externalTrigger}
						onChange={val => {
							this.setState({ externalTrigger: !!val }, () => {
								this.props.onSetSectionType(
									this.props.section.id,
									val ? typeOfAds.EXTERNAL_TRIGGER_AD : typeOfAds.STRUCTURAL
								);
							});
						}}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={this.props.fromPanel ? false : true}
						name={
							this.props.section && this.props.section.id
								? `externalTrigger-${this.props.section.id}`
								: 'externalTrigger'
						}
						id={
							this.props.section && this.props.section.id
								? `js-externalTrigger-switch-${this.props.section.id}`
								: 'js-externalTrigger-switch'
						}
						customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
					/>
					{this.state.externalTrigger ? this.renderContent() : null}
					{this.renderButton('Back', this.props.onCancel)}
				</Col>
			</div>
		);
	}
}

export default TriggerSettings;
