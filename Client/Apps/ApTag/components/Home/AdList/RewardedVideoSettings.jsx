import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import { FormControl, FormGroup, ControlLabel } from '@/Client/helpers/react-bootstrap-imports';

class RewardedVideoSettings extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasAutomaticTrigger = hasAd && ad.automaticTrigger;
		const customScript = hasAd && ad.customScript;

		this.state = {
			automaticTrigger: hasAutomaticTrigger ? ad.automaticTrigger : false,
			customJsSnippet: customScript ? atob(ad.customScript) : ''
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

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSave = () => {
		const { automaticTrigger, customJsSnippet } = this.state;
		const { onSubmit, onCancel } = this.props;

		onSubmit({
			automaticTrigger,
			customScript: btoa(customJsSnippet)
		});
		return onCancel();
	};

	render() {
		const { automaticTrigger, customJsSnippet } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Trigger Automatically"
					className="u-margin-b4 u-margin-t4 negative-toggle fluid-Toggle"
					checked={automaticTrigger}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`automaticTrigger-${ad.id}`}
					id={`js-automaticTrigger-${ad.id}`}
				/>

				{!automaticTrigger ? (
					<div className="u-margin-t4 ">
						<FormGroup controlId="beforeJsSnippet-input">
							<ControlLabel>Custom Script</ControlLabel>
							<FormControl
								componentClass="textarea"
								placeholder="Custom Script"
								name="customJsSnippet"
								onChange={this.handleChange}
								value={customJsSnippet}
								className="u-padding-v4 u-padding-h4"
							/>
						</FormGroup>
					</div>
				) : null}

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

export default RewardedVideoSettings;
