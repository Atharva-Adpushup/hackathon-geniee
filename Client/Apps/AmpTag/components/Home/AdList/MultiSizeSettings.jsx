import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class MultiSizeSettings extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasMultiSizeData = hasAd && ad.isMultiSize;

		this.state = {
			isMultiSize: hasMultiSizeData ? ad.isMultiSize : false
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
		const { isMultiSize } = this.state;
		const { onSubmit, onCancel, ad } = this.props;
		ad.isMultiSize = isMultiSize;
		onSubmit({
			ad
		});
		return onCancel();
	};

	render() {
		const { isMultiSize } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Edit Multi Size"
					className="u-margin-b3"
					checked={isMultiSize}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`isMultiSize-${ad.id}`}
					id={`js-isMultiSize-switch-${ad.id}`}
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

export default MultiSizeSettings;
