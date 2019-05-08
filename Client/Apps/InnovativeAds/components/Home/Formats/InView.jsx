/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import CodeBox from '../../../../../Components/CodeBox/index';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CustomInput from '../../shared/index';

class InView extends Component {
	constructor(props) {
		super(props);
		const { ad = false } = this.props;
		const hasFormatData = !!(ad && ad.formatData);
		this.state = {
			xpath: hasFormatData && ad.formatData.eventData ? ad.formatData.eventData.value : '',
			css: ad && ad.css ? window.btoa(JSON.stringify(ad.css)) : ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	handleCodeChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath, css } = this.state;
		const { save } = this.props;
		let parsedCSS = {};
		if (!xpath) {
			return window.alert('Xpath is mandatory field');
		}
		if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
			formatData: {
				event: EVENTS.SCROLL,
				eventData: {
					value: xpath
				}
			},
			css: parsedCSS,
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel } = this.props;
		const { xpath, css } = this.state;
		return (
			<form action="#" method="POST">
				<CustomInput
					name="xpath"
					value={xpath}
					type="text"
					label="Enter Xpath"
					handler={this.handleChange}
					size={12}
					id="xpath-input"
				/>
				<Col md={12} style={{ paddingLeft: '0px' }}>
					<label htmlFor="css">Custom CSS</label>
					<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={css} />
				</Col>
				{save.renderFn(save.label, this.saveHandler)}
				{cancel ? cancel.renderFn(cancel.label, cancel.handler, 'secondary') : null}
			</form>
		);
	}
}

export default InView;
