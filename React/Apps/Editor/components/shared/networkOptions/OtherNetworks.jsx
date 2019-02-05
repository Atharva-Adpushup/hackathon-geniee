import React, { Component } from 'react';
import CodeBox from '../codeBox';
import { Row, Col, Button } from 'react-bootstrap';
import CustomToggleSwitch from '../customToggleSwitch.jsx';
class OtherNetworks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			adCode: this.props.code.adCode || '',
			refreshSlot: !!this.props.code.refreshSlot
		};
		this.onCodeBoxChange = this.onCodeBoxChange.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.toggleRefreshSlot = this.toggleRefreshSlot.bind(this);
	}

	onCodeBoxChange(value) {
		this.setState({ adCode: btoa(value) });
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
			adCode: value,
			refreshSlot: this.state.refreshSlot
		});
	}

	toggleRefreshSlot(value) {
		this.setState({
			refreshSlot: !!value
		});
	}

	render() {
		return (
			<div>
				{this.props.networkConfig && this.props.networkConfig.enableRefreshSlot
					? <Row>
							<Col xs={12}>
								<CustomToggleSwitch
									labelText="Refresh Ad"
									className="mB-10 mT-10"
									checked={this.state.refreshSlot}
									onChange={this.toggleRefreshSlot}
									layout="horizontal"
									size="m"
									on="Yes"
									off="No"
									defaultLayout={true}
									name="Refresh Ad"
									id={
										this.props.id
											? `js-refresh-slot-switch-${this.props.id}`
											: 'js-refresh-slot-switch'
									}
								/>
							</Col>
						</Row>
					: null}
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
			</div>
		);
	}
}

export default OtherNetworks;
