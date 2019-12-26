import React, { Component } from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';

import { REFRESH_INTERVALS, DEFAULT_REFRESH_INTERVAL } from '../../../configs/commonConsts';
import SelectBox from '../../../../../Components/SelectBox/index';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasNetworkData = hasAd && ad.network && ad.networkData;

		this.state = {
			headerBidding: hasNetworkData ? ad.networkData.headerBidding : false,
			refreshSlot: hasNetworkData ? ad.networkData.refreshSlot : false,
			refreshInterval: hasNetworkData ? ad.networkData.refreshInterval : DEFAULT_REFRESH_INTERVAL
		};
	}

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSelect = val => this.setState({ refreshInterval: val });

	handleSave = () => {
		const { headerBidding, refreshSlot, refreshInterval } = this.state;
		const { ad, onSubmit, onCancel } = this.props;

		onSubmit({
			networkData: {
				...ad.networkData,
				headerBidding,
				refreshSlot,
				refreshInterval: refreshInterval || DEFAULT_REFRESH_INTERVAL
			}
		});
		return onCancel();
	};

	render() {
		const { headerBidding, refreshSlot, refreshInterval } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Header Bidding"
					className="u-margin-b3"
					checked={headerBidding}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`headerBidding-${ad.id}`}
					id={`js-header-bidding-switch-${ad.id}`}
				/>
				<CustomToggleSwitch
					labelText="Refresh Slot"
					className="u-margin-b3"
					checked={refreshSlot}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`refreshSlot-${ad.id}`}
					id={`js-refresh-slot-switch-${ad.id}`}
				/>
				<Row>
					<Col xs={6}>
						<strong>Select Refresh Interval</strong>
					</Col>
					<Col xs={6}>
						<SelectBox
							selected={refreshInterval}
							options={REFRESH_INTERVALS}
							onSelect={this.handleSelect}
							id={`refresh-interval-select-${ad.id}`}
							title="Select Refresh Interval"
							wrapperClassName="u-margin-b3"
						/>
					</Col>
				</Row>
				<CustomButton className="u-margin-r3" onClick={this.handleSave}>
					Save
				</CustomButton>
				<CustomButton variant="secondary" onClick={onCancel}>
					Cancel
				</CustomButton>
			</div>
		);
	}
}

export default AdNetworkDetails;
