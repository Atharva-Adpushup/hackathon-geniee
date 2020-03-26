import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class FluidEdit extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasFluidData = hasAd && ad.fluid;

		this.state = {
			fluid: hasFluidData ? ad.fluid : false
		};
	}

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSelect = val => this.setState({ refreshInterval: val });

	handleSave = () => {
		const { fluid } = this.state;
		const { onSubmit, onCancel } = this.props;

		onSubmit({
			fluid
		});
		return onCancel();
	};

	render() {
		const { fluid } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Fluid"
					className="u-margin-b3"
					checked={fluid}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`fluid-${ad.id}`}
					id={`js-fluid-switch-${ad.id}`}
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

export default FluidEdit;
