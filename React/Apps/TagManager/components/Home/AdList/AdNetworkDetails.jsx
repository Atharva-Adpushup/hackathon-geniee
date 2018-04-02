import React, { Component } from 'react';
import NetworkOptions from '../../../../Editor/components/shared/networkOptions/NetworkOptions.jsx';

class AdNetworkDetails extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { ad, onSubmit, onCancel } = this.props;

		return (
			<NetworkOptions
				onSubmit={onSubmit.bind(null, ad.id)}
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
