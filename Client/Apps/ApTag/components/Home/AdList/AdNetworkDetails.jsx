import React, { Component } from 'react';
import NetworkOptions from '../../../../Editor/components/shared/networkOptions/NetworkOptions.jsx';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
		this.submitHanlder = this.submitHanlder.bind(this);
	}

	submitHanlder(networkInfo) {
		const { ad, onSubmit, onCancel } = this.props;
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
		if (isMultipleAdSizes) {
			dataObject.multipleAdSizes = networkData.multipleAdSizes.concat([]);
		}
		delete networkData.multipleAdSizes;
		delete networkData.isBackwardCompatibleSizes;
		onSubmit(ad.id, dataObject);
		onCancel();
	}

	render() {
		const { ad, networkConfig, onCancel } = this.props;

		return (
			<NetworkOptions
				onSubmit={this.submitHanlder}
				onCancel={onCancel}
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
