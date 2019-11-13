/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component, Fragment } from 'react';
import { Form, FormControl } from 'react-bootstrap';
import memoize from 'memoize-one';

import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup';
import {
	// TABLET_LAYOUT_OPTIONS,
	PAGEGROUP_DEVICE_OPTIONS
} from '../../../../configs/commonConsts';
import { domanize } from '../../../../../../helpers/commonFunctions';

const DEFAULT_STATE = {
	pagegroupName: '',
	forceUrl: '',
	sampleUrl: '',
	device: [],
	tabletLayout: null
};

class Creation extends Component {
	state = DEFAULT_STATE;

	getPagegroups = memoize(channels => [
		...new Set(
			channels.map(channel => {
				const pagegroup = channel.split(':')[1];
				return pagegroup;
			})
		)
	]);

	handleSelectChange = (value, key = 'device') => {
		this.setState({
			[key]: value
		});
	};

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];
		this.setState({
			[name]: value
		});
	};

	handleChange = e => {
		// eslint-disable-next-line prefer-const
		const { name, value } = e.target;
		let computedValue = value;
		if (name === 'pagegroupName') computedValue = value.toUpperCase();

		this.setState({
			[name]: computedValue
		});
	};

	handleSave = e => {
		e.preventDefault();
		const { site, showNotification, createChannels, updateView } = this.props;
		// const { pagegroupName, forceUrl, sampleUrl, device, tabletLayout } = this.state;
		const { pagegroupName, forceUrl, sampleUrl, device } = this.state;
		const { siteDomain, channels, siteId } = site;
		const notificationData = {
			mode: 'error',
			title: 'Operation Failed',
			autoDismiss: 5,
			message: ''
		};
		const sampleUrlError =
			!sampleUrl ||
			!sampleUrl.trim().length ||
			(!forceUrl && domanize(sampleUrl).match(new RegExp(domanize(siteDomain), 'ig')) === null);
		const pagegroupNameError = !pagegroupName;
		const deviceError = !device || !device.length;
		// const tabletPagegroupAlreadyExists = channels.some(
		// 	channel => channel === `TABLET:${pagegroupName}`
		// );
		// const tabletLayoutError =
		// 	device &&
		// 	device.length &&
		// 	!tabletPagegroupAlreadyExists &&
		// 	device.indexOf('tablet') === -1 &&
		// 	!tabletLayout;
		let duplicateError = false;

		if (!deviceError && !pagegroupNameError) {
			let i;
			for (i = 0; i < device.length; i += 1) {
				const currentDevice = device[i];
				if (channels.indexOf(`${currentDevice.toUpperCase()}:${pagegroupName}`) !== -1) {
					notificationData.message = `Channel ${currentDevice.toUpperCase()}:${pagegroupName} already exists`;
					duplicateError = true;
					break;
				}
			}
		}

		// Add tabletLayoutError when uncommenting the above tabletError condition
		const hasError = sampleUrlError || pagegroupNameError || deviceError || duplicateError;

		if (hasError) {
			if (duplicateError) {
				notificationData.message = notificationData.message;
			} else if (pagegroupNameError) {
				notificationData.message = 'Invalid Pagegroup name';
			} else if (sampleUrlError) {
				notificationData.message =
					'Invalid Sample Url. Please make sure it is a valid url and domain should be same as site domain';
			} else if (deviceError) {
				notificationData.message = 'Invalid Device';
			}
			// else if (tabletLayoutError) {
			// 	notificationData.message = 'Invalid Tablet Layout';
			// }

			return showNotification(notificationData);
		}

		return createChannels(siteId, {
			device,
			common: {
				pageGroupName: pagegroupName,
				sampleUrl,
				forceSampleUrl: forceUrl ? 'on' : 'off',
				siteId
				// tabletLayout
			}
		}).then(response => {
			const {
				failed = {
					channels: []
				}
			} = response;
			let reset = null;
			if (!failed.channels.length) {
				reset = DEFAULT_STATE;
				return this.setState(reset, () => updateView());
			}
			return true;
		});
	};

	render() {
		const { site, updateView } = this.props;
		const { siteId, siteDomain, channels } = site;
		const { forceUrl, sampleUrl, device, pagegroupName } = this.state;
		// const { forceUrl, sampleUrl, device, tabletLayout, pagegroupName } = this.state;
		const exisitingPagegroups = this.getPagegroups(channels);

		return (
			<Fragment>
				<CustomButton
					variant="secondary"
					className="pull-right u-margin-b3"
					data-view="list"
					onClick={updateView}
				>
					Pagegroup List
				</CustomButton>
				<Form style={{ clear: 'both' }}>
					<div className="u-padding-v4">
						<label htmlFor="pagegroupName" className="u-margin-b3">
							Pagegroup Name
						</label>
						<FormControl
							type="text"
							name="pagegroupName"
							value={pagegroupName}
							onChange={this.handleChange}
							list={`pagegroups-list-${siteId}-${siteDomain}`}
							placeholder="Pagegroup Name"
						/>
						{exisitingPagegroups.length ? (
							<datalist id={`pagegroups-list-${siteId}-${siteDomain}`}>
								{exisitingPagegroups.map(pagegroup => (
									<option key={pagegroup} value={pagegroup} />
								))}
							</datalist>
						) : null}
					</div>
					<FieldGroup
						name="sampleUrl"
						value={sampleUrl}
						type="text"
						label="Sample Url"
						onChange={this.handleChange}
						size={6}
						id={`sampleUrl-input-${siteId}-${siteDomain}`}
						placeholder="Sample Url"
						className="u-padding-v3 u-padding-h3"
					/>
					<CustomToggleSwitch
						labelText="Force Sample Url"
						className="u-margin-b4 negative-toggle"
						checked={forceUrl}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`forceUrl-${siteId}-${siteDomain}`}
						id={`js-forceUrl-${siteId}-${siteDomain}`}
					/>
					<FieldGroup
						name="device"
						value={device}
						type="toggle-button-group"
						label="Device"
						toggleGroupType="checkbox"
						onChange={this.handleSelectChange}
						size={6}
						dataKey="device"
						itemCollection={PAGEGROUP_DEVICE_OPTIONS}
						id={`device-select-${siteId}-${siteDomain}`}
						placeholder="Device"
						className="u-padding-v3 u-padding-h3"
					/>
					{/* {device.indexOf('tablet') === -1 && (
						<FieldGroup
							name="tabletLayout"
							value={tabletLayout}
							type="toggle-dropdown-button"
							label="Tablet Layout"
							onChange={this.handleSelectChange}
							size={6}
							dataKey="tabletLayout"
							itemCollection={TABLET_LAYOUT_OPTIONS}
							id={`tablet-layout-${siteId}-${siteDomain}`}
							placeholder="Tablet Layout"
							className="u-padding-v3 u-padding-h3"
						/>
					)} */}
					<CustomButton
						variant="primary"
						type="submit"
						className="pull-right u-margin-b2"
						onClick={this.handleSave}
					>
						Create
					</CustomButton>
				</Form>
			</Fragment>
		);
	}
}

export default Creation;
