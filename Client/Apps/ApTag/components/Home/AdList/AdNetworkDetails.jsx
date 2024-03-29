import React, { Component } from 'react';
import NetworkOptions from '../../../../../Components/NetworkOptions/index';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
		this.submitHanlder = this.submitHanlder.bind(this);
	}

	submitHanlder(networkInfo) {
		const { ad, onSubmit, onCancel, siteId } = this.props;
		const dataObject = {
			network: networkInfo.network,
			networkData:
				ad.network === networkInfo.network
					? { ...ad.networkData, ...networkInfo.networkData }
					: networkInfo.networkData
		};
		const { networkData } = dataObject;
		const isMultipleAdSizes = !!(
			networkData &&
			networkData.multipleAdSizes &&
			networkData.multipleAdSizes.length
		);
		delete networkData.multipleAdSizes;
		delete networkData.isBackwardCompatibleSizes;
		onSubmit(ad.id, siteId, dataObject);
		onCancel();
	}

	render() {
		const { ad, networkConfig, onCancel, user } = this.props;

		return (
			<NetworkOptions
				onSubmit={this.submitHanlder}
				onCancel={onCancel}
				user={user}
				ad={ad}
				buttonType={2}
				fromPanel={false}
				id={ad.id}
				showNotification={() => {}}
				networkConfig={networkConfig}
			/>
		);
	}
}

export default AdNetworkDetails;
