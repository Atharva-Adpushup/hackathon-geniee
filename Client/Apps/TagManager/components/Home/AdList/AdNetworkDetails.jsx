import React, { Component } from 'react';
import NetworkOptions from '../../../../Editor/components/shared/networkOptions/NetworkOptions.jsx';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
		this.submitHanlder = this.submitHanlder.bind(this);
	}

	submitHanlder(networkInfo) {
		const { ad } = this.props,
			dataObject = {
				network: networkInfo.network,
				networkData: ad.network == networkInfo.network
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
		const { ad, onSubmit, onCancel, networkConfig } = this.props;

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
