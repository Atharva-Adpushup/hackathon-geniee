import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class FlyingCarpet extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasFlyingCarpet = hasAd && ad.flyingCarpetEnabled;

		this.state = {
			flyingCarpetEnabled: hasFlyingCarpet ? ad.flyingCarpetEnabled : false
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
		const { flyingCarpetEnabled } = this.state;
		const { onSubmit, onCancel } = this.props;

		onSubmit({
			flyingCarpetEnabled
		});
		return onCancel();
	};

	render() {
		const { flyingCarpetEnabled } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Flying Carpet"
					className="u-margin-b3"
					checked={flyingCarpetEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`flyingCarpetEnabled-${ad.id}`}
					id={`js-flyingCarpetEnabled-switch-${ad.id}`}
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

export default FlyingCarpet;
