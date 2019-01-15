import React, { Component } from 'react';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';
import { CustomButton } from '../../shared/index';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);

		const hasAd = this.props.ad;
		const hasNetworkData = hasAd && this.props.ad.network && this.props.ad.networkData;

		this.state = {
			headerBidding: hasNetworkData ? this.props.ad.networkData.headerBidding : false,
			refreshSlot: hasNetworkData ? this.props.ad.networkData.refreshSlot : false
		};
	}

	render() {
		const { headerBidding, refreshSlot } = this.state;
		const { ad, onSubmit, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Header Bidding"
					className="mB-10"
					checked={headerBidding}
					onChange={val => this.setState({ headerBidding: !!val })}
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
					className="mB-10"
					checked={refreshSlot}
					onChange={val => this.setState({ refreshSlot: !!val })}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`refreshSlot-${ad.id}`}
					id={`js-refresh-slot-switch-${ad.id}`}
				/>
				<CustomButton label="Cancel" handler={onCancel} />
				<CustomButton
					label="Save"
					handler={() => {
						onSubmit({
							networkData: {
								...ad.networkData,
								headerBidding,
								refreshSlot,
								logWritten: false
							}
						});
						return onCancel();
					}}
				/>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

export default AdNetworkDetails;
