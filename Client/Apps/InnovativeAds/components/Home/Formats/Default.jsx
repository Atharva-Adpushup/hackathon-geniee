/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/href-no-hash */
import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import CodeBox from '../../../../../Components/CodeBox/index';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';

class Default extends Component {
	constructor(props) {
		super(props);
		const { ad } = this.props;
		this.state = {
			css: ad && ad.css ? window.btoa(JSON.stringify(ad.css)) : ''
		};
		this.saveHandler = this.saveHandler.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	saveHandler() {
		const { save } = this.props;
		const { css } = this.state;
		let code = {};
		if (css && css.trim().length) {
			try {
				code = JSON.parse(window.atob(css));
				if (!code || !Object.keys(code).length) {
					throw new Error('Invalid CSS');
				}
			} catch (e) {
				console.log(e);
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
			formatData: {
				event: EVENTS.SCRIPT_LOADED,
				eventData: {
					value: ''
				}
			},
			css: code,
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	handleChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	render() {
		const { save, cancel } = this.props;
		const { css } = this.state;
		return (
			<div>
				<Col md={12} className="u-padding-l0">
					<label htmlFor="css">Custom CSS</label>
					<CodeBox name="css" showButtons={false} onChange={this.handleChange} code={css} />
				</Col>
				{save.renderFn(save.label, this.saveHandler)}
				{cancel ? cancel.renderFn(cancel.label, cancel.handler, 'secondary') : null}
			</div>
		);
	}
}

export default Default;
