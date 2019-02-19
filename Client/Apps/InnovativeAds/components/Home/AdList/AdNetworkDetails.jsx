import React, { Component } from 'react';
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
			refreshSlot: hasNetworkData ? ad.networkData.refreshSlot : false
		};
	}

	render() {
		const { headerBidding, refreshSlot } = this.state;
		const { ad, onSubmit, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Header Bidding"
					className="u-margin-b3"
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
					className="u-margin-b3"
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
				<CustomButton
					className="u-margin-r3"
					onClick={() => {
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
				>
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
