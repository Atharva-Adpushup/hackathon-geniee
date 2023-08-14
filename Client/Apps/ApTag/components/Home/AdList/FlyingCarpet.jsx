import React, { Component } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { Col, Row } from '@/Client/helpers/react-bootstrap-imports';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import { defaultFlyingCarpetConfig } from './constants';
import { PLATFORMS } from '../../../../../constants/apTag';

class FlyingCarpet extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const hasFlyingCarpet = hasAd && ad.flyingCarpetEnabled;
		const hasFlyingCarpetConfig = hasAd && ad.flyingCarpetConfig;

		this.state = {
			flyingCarpetEnabled: hasFlyingCarpet ? ad.flyingCarpetEnabled : false,
			flyingCarpetConfig: hasFlyingCarpetConfig ? ad.flyingCarpetConfig : defaultFlyingCarpetConfig
		};
	}

	handleFCConfig = selectedOptions => {
		const updatedConfig = {};

		PLATFORMS.forEach(platform => {
			const isPlatformSelected = selectedOptions.find(item => item.value === platform);
			updatedConfig[platform] = { enabled: !!isPlatformSelected };
		});

		this.setState({
			flyingCarpetConfig: updatedConfig
		});
	};

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const { flyingCarpetEnabled, flyingCarpetConfig } = this.state;
		const { onSubmit, onCancel } = this.props;

		const flyingCarpetObj = {
			flyingCarpetEnabled
		};
		if (flyingCarpetEnabled) {
			flyingCarpetObj.flyingCarpetConfig = flyingCarpetConfig;
		}
		onSubmit(flyingCarpetObj);
		return onCancel();
	};

	getSelectedPlatform = () => {
		const selectedPlatform = [];
		const { flyingCarpetConfig = {} } = this.state;
		Object.keys(flyingCarpetConfig).forEach(platform => {
			if (flyingCarpetConfig[platform]?.enabled) {
				selectedPlatform.push({ label: platform, value: platform });
			}
		});
		return selectedPlatform;
	};

	getSelectOptions = () => {
		const options = PLATFORMS?.map(platform => ({ label: platform, value: platform }));

		return options;
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

				{flyingCarpetEnabled && (
					<div className="u-margin-t5 u-margin-b5">
						<Row className="text-center u-padding-3">
							<b>Additional Settings</b>
						</Row>
						<div>
							<Col xs={6}>
								<b>Device</b>
							</Col>
							<Col xs={6}>
								<MultiSelect
									className="u-margin-b3"
									options={this.getSelectOptions()}
									value={this.getSelectedPlatform()}
									onChange={this.handleFCConfig}
									labelledBy="Select"
								/>
							</Col>
						</div>
					</div>
				)}

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
