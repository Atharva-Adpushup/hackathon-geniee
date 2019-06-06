import React, { Component } from 'react';
import { Panel, PanelGroup, Table, Form } from 'react-bootstrap';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import { TABLET_LAYOUT_OPTIONS, PAGEGROUP_DEVICE_OPTIONS } from '../../../configs/commonConsts';

const DEFAULT_STATE = {
	view: 'list',
	pagegroupName: '',
	forceUrl: '',
	sampleUrl: '',
	device: [],
	tabletLayout: null,
	activeKey: null
};

class Pagegroups extends Component {
	state = DEFAULT_STATE;

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

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
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSave = e => {
		e.preventDefault();
		console.log('Save Called');
	};

	updateView = e => {
		this.setState({
			view: e.target.getAttribute('data-view')
		});
	};

	renderPagegroupList = () => {
		const { site } = this.props;
		return (
			<React.Fragment>
				<CustomButton
					variant="secondary"
					className="pull-right u-margin-b3"
					data-view="create"
					onClick={this.updateView}
				>
					Create Pagegroup
				</CustomButton>

				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Name</th>
							<th>Platform</th>
							<th>Variations</th>
							<th>Regex Pattern</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Post</td>
							<td>Desktop</td>
							<td>3</td>
							<td>www.rentdigs.com</td>
							<td>Delete | Editor</td>
						</tr>
					</tbody>
				</Table>
			</React.Fragment>
		);
	};

	renderPagegroupCreate = () => {
		const { site } = this.props;
		const { siteId, siteDomain, channels = [] } = site;
		const { forceUrl, sampleUrl, device, tabletLayout, pagegroupName } = this.state;

		let pagegroups = [
			...new Set(
				channels.map(channel => {
					const pagegroup = channel.split(':')[0];
					return pagegroup;
				})
			)
		];

		pagegroups = pagegroups.map(pg => ({
			name: pg,
			value: pg
		}));

		return (
			<div>
				<CustomButton
					variant="secondary"
					className="pull-right u-margin-b3"
					data-view="list"
					onClick={this.updateView}
				>
					Pagegroup List
				</CustomButton>
				<Form style={{ clear: 'both' }}>
					{pagegroups.length ? (
						<FieldGroup
							name="pagegroupName"
							value={pagegroupName}
							type="toggle-dropdown-button"
							label="Pagegroup Name"
							onChange={this.handleSelectChange}
							size={6}
							dataKey="pagegroupName"
							itemCollection={pagegroups}
							id={`pagegroupName-${siteId}-${siteDomain}`}
							placeholder="Pagegroup Name"
							className="u-padding-v3 u-padding-h3"
						/>
					) : (
						<FieldGroup
							name="pagegroupName"
							value={pagegroupName}
							type="text"
							label="Pagegroup Name"
							onChange={this.handleChange}
							size={6}
							dataKey="pagegroupName"
							itemCollection={TABLET_LAYOUT_OPTIONS}
							id={`pagegroupName-${siteId}-${siteDomain}`}
							placeholder="Pagegroup Name"
							className="u-padding-v3 u-padding-h3"
						/>
					)}
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
					{device.indexOf('tablet') !== -1 && (
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
					)}
					<CustomButton
						variant="primary"
						type="submit"
						className="pull-right u-margin-b2"
						onClick={this.handleSave}
					>
						Create
					</CustomButton>
				</Form>
			</div>
		);
	};

	renderView = () => {
		const { view } = this.state;
		switch (view) {
			default:
			case 'list':
				return this.renderPagegroupList();
			case 'create':
				return this.renderPagegroupCreate();
		}
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { activeKey } = this.state;
		return (
			<div className="u-margin-t4">
				<PanelGroup
					accordion
					id={`pagegroup-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Panel eventKey="pagegroups">
						<Panel.Heading>
							<Panel.Title toggle>Pagegroups</Panel.Title>
						</Panel.Heading>
						<Panel.Body collapsible>{this.renderView()}</Panel.Body>
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default Pagegroups;
