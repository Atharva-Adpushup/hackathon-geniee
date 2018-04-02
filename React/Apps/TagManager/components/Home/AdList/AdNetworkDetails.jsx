import React, { Component } from 'react';
import NetworkOptions from '../../../../Editor/components/shared/networkOptions/NetworkOptions.jsx';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { ad } = this.props;

		return (
			<NetworkOptions
				onSubmit={() => {}}
				onCancel={() => {}}
				ad={ad}
				buttonType={2}
				fromPanel={true}
				id={ad.id}
				showNotification={() => {}}
			/>
		);
	}
}

export default AdNetworkDetails;
