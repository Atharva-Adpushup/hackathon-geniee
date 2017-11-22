import React, { Component } from 'react';
import CodeBox from 'shared/codeBox';
import { Row, Col, Button } from 'react-bootstrap';
class OtherNetworks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			adCode: this.props.code.adCode || ''
		};
		this.onCodeBoxChange = this.onCodeBoxChange.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	onCodeBoxChange(value) {
		this.setState({ adCode: value });
	}

	submitHandler(value) {
		if (!value || !value.trim().length) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid AdCode',
				message: 'AdCode cannot be left blank'
			});
			return false;
		}
		this.props.submitHandler({
			adCode: value
		});
	}

	render() {
		return (
			<div className="mT-10">
				<CodeBox
					showButtons={this.props.showButtons || true}
					onCancel={this.props.onCancel}
					onSubmit={this.submitHandler}
					onChange={this.onCodeBoxChange}
					code={this.state.adCode}
					size="small"
				/>
			</div>
		);
	}
}

export default OtherNetworks;
