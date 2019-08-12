import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import CodeBox from '../CodeBox/index';
import CustomToggleSwitch from '../CustomToggleSwitch/index';
import SelectBox from '../SelectBox/index';
import { refreshIntervals } from '../../constants/visualEditor';

class OtherNetworks extends Component {
	constructor(props) {
		super(props);
		const { code } = props;
		this.state = {
			adCode: code.adCode || '',
			refreshSlot: !!code.refreshSlot,
			refreshInterval: code.refreshInterval
		};
		this.onCodeBoxChange = this.onCodeBoxChange.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.toggleRefreshSlot = this.toggleRefreshSlot.bind(this);
	}

	onCodeBoxChange(value) {
		this.setState({ adCode: window.btoa(value) });
	}

	submitHandler(value) {
		const { showNotification, submitHandler } = this.props;
		const { refreshInterval, refreshSlot } = this.state;
		if (!value || !value.trim().length) {
			showNotification({
				mode: 'error',
				title: 'Invalid AdCode',
				message: 'AdCode cannot be left blank'
			});
			return false;
		}
		submitHandler({
			adCode: value,
			refreshSlot,
			refreshInterval
		});
		return true;
	}

	toggleRefreshSlot(value) {
		this.setState({
			refreshSlot: !!value
		});
	}

	render() {
		const { networkConfig, id, showButtons, onCancel } = this.props;
		const { refreshSlot, refreshInterval, adCode } = this.state;
		return (
			<div>
				{networkConfig && networkConfig.enableRefreshSlot ? (
					<div>
						<Row>
							<Col xs={12}>
								<CustomToggleSwitch
									labelText="Refresh Ad"
									className="mB-10 mT-10"
									checked={refreshSlot}
									onChange={this.toggleRefreshSlot}
									layout="horizontal"
									size="m"
									on="Yes"
									off="No"
									defaultLayout
									name="Refresh Ad"
									id={id ? `js-refresh-slot-switch-${id}` : 'js-refresh-slot-switch'}
								/>
							</Col>
						</Row>
						<Row>
							<Col xs={6}>
								<strong>Refresh Interval</strong>
							</Col>
							<Col xs={6}>
								<SelectBox
									id="refresh-selection"
									title="Select Refresh Interval"
									onSelect={val => {
										this.setState({ refreshInterval: val });
									}}
									options={refreshIntervals.map(item => ({
										name: item,
										value: item
									}))}
									selected={refreshInterval || refreshIntervals[0]}
								/>
							</Col>
						</Row>
					</div>
				) : null}
				<div className="mT-10">
					<CodeBox
						showButtons={showButtons || true}
						onCancel={onCancel}
						onSubmit={this.submitHandler}
						onChange={this.onCodeBoxChange}
						code={adCode}
						size="small"
					/>
				</div>
			</div>
		);
	}
}

export default OtherNetworks;
