import React, { Component } from 'react';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);

		const hasAd = this.props.ad;
		const hasNetworkData = hasAd && this.props.ad.network && this.props.ad.networkData;

		this.state = {
			headerBidding: hasNetworkData ? this.props.ad.networkData.headerBidding : false,
			refreshSlot: hasNetworkData ? this.props.ad.networkData.refreshSlot : false
		};
		this.submitHanlder = this.submitHanlder.bind(this);
	}

	submitHanlder(networkInfo) {
		const { ad } = this.props,
			dataObject = {
				network: networkInfo.network,
				networkData:
					ad.network == networkInfo.network
						? { ...ad.networkData, ...networkInfo.networkData }
						: networkInfo.networkData
			},
			networkData = dataObject.networkData,
			isMultipleAdSizes = !!(networkData && networkData.multipleAdSizes && networkData.multipleAdSizes.length);

		if (isMultipleAdSizes) {
			dataObject.multipleAdSizes = networkData.multipleAdSizes.concat([]);
		}

		delete networkData.multipleAdSizes;
		delete networkData.isBackwardCompatibleSizes;

		this.props.onSubmit(ad.id, dataObject);
		this.props.onCancel();
	}

	render() {
		const { ad, onCancel } = this.props;

		return (
			<CustomToggleSwitch
				labelText="Header Bidding"
				className="mB-10"
				checked={this.state.headerBidding}
				onChange={val => {
					this.setState({ headerBidding: !!val });
				}}
				layout="horizontal"
				size="m"
				on="Yes"
				off="No"
				defaultLayout={false}
				name={`headerBidding-${ad.id}`}
				id={`js-header-bidding-switch-${ad.id}`}
				customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
			/>
		);
	}
}

export default AdNetworkDetails;
