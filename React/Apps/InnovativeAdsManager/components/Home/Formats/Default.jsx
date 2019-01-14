/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/href-no-hash */
import React, { Component } from 'react';
import CodeBox from '../../../../../Components/CodeEditor';
import { TYPE_OF_ADS } from '../../../configs/commonConsts';

class Default extends Component {
	constructor(props) {
		super(props);
		this.state = {
			css: ''
		};
		this.saveHandler = this.saveHandler.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	saveHandler() {
		const { css } = this.state;
		if (css && css.trim().length) {
			try {
				const code = JSON.parse(window.atob(css));
				if (!code || !Object.keys(code).length) {
					throw new Error('Invalid CSS');
				}
			} catch (e) {
				console.log(e);
				return window.alert('Invalid CSS');
			}
		}
		return this.props.save.handler({
			formatData: {
				event: 'scriptLoaded',
				eventData: {
					value: this.state.css
				}
			},
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	handleChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	render() {
		return (
			<div>
				<label htmlFor="css">Custom CSS</label>
				<CodeBox name="css" showButtons={false} onChange={this.handleChange} code={this.state.css} />
				{this.props.save.renderFn(this.props.save.label, this.saveHandler)}
			</div>
		);
	}
}

export default Default;
