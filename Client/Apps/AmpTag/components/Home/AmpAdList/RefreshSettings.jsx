import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class RefreshSettings extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasRefreshData = hasAd && ad.isRefreshEnabled;

		this.state = {
			isRefreshEnabled: hasRefreshData ? ad.isRefreshEnabled : false
		};
	}

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const { isRefreshEnabled } = this.state;
		const { onSubmit, onCancel, ad } = this.props;
		ad.isRefreshEnabled = isRefreshEnabled;
		ad.networkData.refreshSlot = isRefreshEnabled;
		onSubmit(ad);
		return onCancel();
	};

	render() {
		const { isRefreshEnabled } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Edit Refresh"
					className="u-margin-b3"
					checked={isRefreshEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`isRefreshEnabled-${ad.id}`}
					id={`js-isRefreshEnabled-switch-${ad.id}`}
				/>

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

export default RefreshSettings;
