import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import InputBox from '../../../../Components/InputBox/index';
import CustomButton from '../../../../Components/CustomButton/index';

class Account extends Component {
	render() {
		const adsensePubId = null;
		const thirdparthAdX = null;
		return (
			<Col xs={12} style={{ margin: '0 auto' }}>
				<FieldGroup
					name="adsensePubId"
					value={adsensePubId}
					type="text"
					label="Adsense Pub Id"
					onChange={this.handleChange}
					size={6}
					id="adsensePubId-input"
					placeholder="AdPushup Percentage"
					className="u-padding-v4 u-padding-h4"
				/>
				<FieldGroup
					name="adsensePubId"
					value={adsensePubId}
					type="text"
					label="Adsense Pub Id"
					onChange={this.handleChange}
					size={6}
					id="adsensePubId-input"
					placeholder="AdPushup Percentage"
					className="u-padding-v4 u-padding-h4"
				/>
				<CustomToggleSwitch
					labelText="Third Party AdX"
					className="u-margin-t4 u-margin-b4 negative-toggle"
					checked={thirdparthAdX}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="thirdparthAdX"
					id="js-thirdparthAdX"
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</Col>
		);
	}
}

export default Account;
