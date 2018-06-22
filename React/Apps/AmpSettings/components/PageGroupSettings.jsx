import React from 'react';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/customToggleSwitch.jsx';
import Dropdown from './helper/Dropdown.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
class PageGroupSettings extends React.Component {
	constructor(props) {
		super(props);
		let channel = props.channel,
			ampSettings = channel.ampSettings || {},
			social = ampSettings.social || {},
			customCSS = ampSettings['customCSS'] ? ampSettings['customCSS'].value : '',
			{ include, placement, apps = [] } = social,
			{ selectors = {}, toDelete, beforeJs, siteName, template, adNetwork, pubId } = ampSettings;
		this.state = {
			...selectors,
			toDelete: toDelete && toDelete.toString(),
			beforeJs,
			siteName,
			template,
			adNetwork,
			pubId,
			include,
			placement,
			apps,
			customCSS
		};
		this.renderSelectors = this.renderSelectors.bind(this);
		this.renderSocialApps = this.renderSocialApps.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
		this.saveChannelSettings = this.saveChannelSettings.bind(this);
		this.parseFormData = this.parseFormData.bind(this);
		this.handleSocialAppChange = this.handleSocialAppChange.bind(this);
	}
	parseFormData() {
		let settings = this.state,
			data = {
				selectors: {},
				social: {
					apps: [],
					include: false
				},
				customCSS: {
					value: ''
				},
				toDelete: []
			};
		for (let key in settings) {
			if (settings[key]) {
				if (commonConsts.selectors[key]) {
					data.selectors[key] = settings[key];
				} else if (key == 'apps') {
					data.social.apps = settings[key];
				} else if (key == 'include' && settings[key]) data.social.include = true;
				else if (key == 'placement') data.social.placement = settings[key];
				else if (key == 'customCSS') data.customCSS.value = settings[key];
				else if (key == 'toDelete') {
					data.toDelete = settings[key] ? settings[key].split(',') : [];
				} else data[key] = settings[key];
			}
		}
		return data;
	}
	renderSelectors(selectors) {
		return Object.keys(commonConsts.selectors).map(key => {
			let selectorValue = this.state[key];
			return this.renderInputControl(commonConsts.selectors[key].alias, key, selectorValue);
		});
	}
	renderInputControl(label, name, value) {
		return (
			<Row>
				<Col sm={5}>
					<div>{label}</div>
				</Col>
				<Col sm={7}>
					<input
						onChange={this.handleOnChange}
						className="form-control"
						type="text"
						placeholder={label}
						name={name}
						value={value}
					/>
				</Col>
			</Row>
		);
	}
	saveChannelSettings(event) {
		event.preventDefault();
		console.log(this.parseFormData());
		let ampData = this.parseFormData(),
			pageGroup = this.props.channel.pageGroup;
		// const data = new FormData(event.target);
		// console.log(event.target.template);
		ajax({
			method: 'POST',
			url: '/user/site/16425/pagegroup/saveAmpSettings',
			data: JSON.stringify({
				platform: 'DESKTOP',
				pageGroup,
				ampData
			})
		})
			.then(res => {
				console.log(res);
			})
			.catch(res => {
				console.log(res);
			});
	}
	handleSocialAppChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.checked;
		let apps = this.state.apps;
		//this.setState({ [name]: value });
		if (value == true) {
			apps.push(name);
		} else {
			let index = apps.indexOf(name);
			if (index > -1) {
				apps.splice(index, 1);
			}
		}
		this.setState({
			apps
		});
	}
	renderSocialApps() {
		return Object.keys(commonConsts.socialApps).map(key => {
			let selectedApp = this.state.apps.indexOf(key) > -1 ? true : false;
			return (
				<Col sm={4} key={key}>
					<input
						name={key}
						type="checkbox"
						placeholder="Logo"
						style={{ width: 'auto' }}
						onChange={this.handleSocialAppChange}
						checked={selectedApp}
					/>
					<label> {commonConsts.socialApps[key].alias}</label>
				</Col>
			);
		});
	}
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
		console.log(name, value);
	}

	render() {
		const { props } = this,
			channel = props.channel;
		return (
			<CollapsePanel title={channel.pageGroup} bold={true}>
				<form onSubmit={this.saveChannelSettings}>
					<Heading title="Selectors Settings" />
					{this.renderSelectors()}
					<hr />
					<Heading title="Custom CSS" />
					<textarea
						placeholder="Enter Custom CSS here"
						name="customCSS"
						value={this.state.customCSS}
						onChange={this.handleOnChange}
					/>
					<hr />
					<Heading title="Delete Selector" />
					<textarea
						placeholder="Enter Custom CSS here"
						name="toDelete"
						value={this.state.toDelete}
						onChange={this.handleOnChange}
					/>
					<hr />
					<Heading title="Social Settings" />

					<CustomToggleSwitch
						labelText="Include"
						className="mB-0"
						defaultLayout
						checked={this.state.include}
						onChange={value => {
							this.setState({ include: value });
						}}
						name="includeSocial"
						layout="horizontal"
						size="m"
						id="js-force-sample-url"
						on="On"
						off="Off"
					/>
					<RowColSpan label="Placement">
						<select
							className="form-control"
							name="placement"
							value={this.state.placement}
							onChange={this.handleOnChange}
						>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
						</select>
					</RowColSpan>
					<RowColSpan label="Apps">{this.renderSocialApps()}</RowColSpan>
					<hr />
					<Heading title="Before JS" />
					<textarea
						placeholder="Enter Custom CSS here"
						name="beforeJs"
						value={this.state.beforeJs}
						onChange={this.handleOnChange}
					/>
					<hr />
					<Heading title="Other Settings" />
					{this.renderInputControl('Site Name', 'siteName', this.state.siteName)}
					{this.renderInputControl('Template', 'template', this.state.template)}
					<RowColSpan label="Ad Network">
						<select
							className="form-control"
							value={this.state.adNetwork}
							name="adNetwork"
							onChange={this.handleOnChange}
						>
							<option value="adsense">Adsense</option>
							<option value="adx">AdX</option>
						</select>
					</RowColSpan>
					{this.renderInputControl('Pub Id', 'pubId', this.state.pubId)}
					<button className="btn-success">Save</button>
				</form>
			</CollapsePanel>
		);
	}
}

export default PageGroupSettings;
