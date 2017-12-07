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
		if (
			value.indexOf('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') == -1 ||
			value.indexOf('data-ad-client') == -1 ||
			value.indexOf('data-ad-slot') == -1
		) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid Adcode',
				message: 'Only AdX adCode is allowed'
			});
			return this.setState({ error: true });
		}
		let adunitId = this.getAdUnitId(value);
		this.setState({ error: false, adunitId: adunitId, adCode: value });
	}

	getAdUnitId(value) {
		let matchedItems = value.match(/([A-Z])\w+/g),
			adunitId = matchedItems.length ? matchedItems[0] : '';
		return adunitId;
	}

	submitHandler(value) {
		if (!value || !value.trim().length || value == '') {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid AdCode',
				message: 'AdCode cannot be left blank'
			});
			return false;
		}

		if (this.state.error) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid AdCode',
				message: 'Invalid AdCode inserted'
			});
			return false;
		}

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
