import React, { Component } from 'react';
import NetworkOptions from '../../../../Editor/components/shared/networkOptions/NetworkOptions.jsx';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
		this.submitHanlder = this.submitHanlder.bind(this);
	}

	submitHanlder(networkInfo) {
		const { ad } = this.props;

		this.props.onSubmit(ad.id, {
			network: networkInfo.network,
			networkData:
				ad.network == networkInfo.network
					? { ...ad.networkData, ...networkInfo.networkData }
					: networkInfo.networkData
		});
		this.props.onCancel();
	}

	render() {
		const { ad, onSubmit, onCancel } = this.props;

		return (
			<NetworkOptions
				onSubmit={this.submitHanlder}
				onCancel={onCancel}
				ad={ad}
				buttonType={2}
				fromPanel={false}
				id={ad.id}
				showNotification={() => {}}
			/>
		);
	}
}

export default AdNetworkDetails;
