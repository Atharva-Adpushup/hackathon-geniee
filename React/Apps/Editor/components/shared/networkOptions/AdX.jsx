import React, { Component } from 'react';
import CodeBox from 'shared/codeBox';
import { Row, Col, Button } from 'react-bootstrap';
import Form from './commonForm';

class AdX extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			adunitId: this.props.code.adunitId || '',
			adCode: this.props.code.adCode || ''
		};
		this.checkAdX = this.checkAdX.bind(this);
		this.getAdUnitId = this.getAdUnitId.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.inputChange = this.inputChange.bind(this);
	}

	checkAdX(value) {
		if (value.indexOf('pagead2.googlesyndication.com') == -1) {
			alert('Only AdX code allowed');
			return this.setState({ error: true });
		}
		let adunitId = this.getAdUnitId(value);
		this.setState({ error: false, adunitId: adunitId, adCode: value });
	}

	getAdUnitId(value) {
		let matchedItems = value.match(/([A-Z])\w+/g),
			adunitId = matchedItems.length ? matchedItems[0] : '';

		console.log(matchedItems, adunitId);
		return adunitId;
	}

	submitHandler(value) {
		this.props.submitHandler({
			adCode: value,
			adunitId: this.state.adunitId
		});
	}

	inputChange(ev) {
		this.setState({ adunitId: ev.target.value });
	}

	render() {
		return (
			<Form
				adunitId={this.state.adunitId}
				inputChange={this.inputChange}
				adCode={this.state.adCode}
				onCodeBoxChange={this.checkAdX}
				onCancel={this.props.onCancel}
				onSubmit={this.submitHandler}
				showButtons={this.props.showButtons || false}
				codeBoxSize="small"
			/>
		);
	}
}

export default AdX;
