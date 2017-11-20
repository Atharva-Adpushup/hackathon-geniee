import React, { Component } from 'react';
import CodeBox from 'shared/codeBox';
import { Row, Col, Button } from 'react-bootstrap';
import Form from './commonForm';

class Adsense extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			adunitId: this.props.code.adunitId || '',
			adCode: this.props.code.adCode || ''
		};
		this.checkAdsense = this.checkAdsense.bind(this);
		this.getAdUnitId = this.getAdUnitId.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.inputChange = this.inputChange.bind(this);
	}

	checkAdsense(value) {
		if (value.indexOf('pagead2.googlesyndication.com') == -1) {
			alert('Only Adsense code allowed');
			return this.setState({ error: true });
		}
		let adunitId = this.getAdUnitId(value);
		this.setState({ error: false, adunitId: adunitId, adCode: value });
	}

	getAdUnitId(value) {
		let matchedItems = value.match(/data-ad-slot=\"\d+\"/gi),
			adunitId = matchedItems.length ? matchedItems[0].split('=')[1].replace(/\"/g, '') : '';
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
				onCodeBoxChange={this.checkAdsense}
				onCancel={this.props.onCancel}
				onSubmit={this.submitHandler}
				showButtons={this.props.showButtons || false}
				codeBoxSize="small"
			/>
		);
	}
}

export default Adsense;
