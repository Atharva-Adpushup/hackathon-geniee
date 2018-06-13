import React from 'react';
import ActionCard from '../../../Components/ActionCard.jsx';
import InputControl from './helper/InputControl.jsx';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/customToggleSwitch.jsx';
import Dropdown from './helper/Dropdown.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
//import '../styles.scss';
import { Grid, Row, Col, Alert, Button } from 'react-bootstrap';
class AmpSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			channels: []
		};
		this.fetchAmpSettings = this.fetchAmpSettings.bind(this);
		this.renderSelectors = this.renderSelectors.bind(this);
		this.renderSocialApps = this.renderSocialApps.bind(this);
		this.renderPageGroup = this.renderPageGroup.bind(this);
		this.saveSiteSettings = this.saveSiteSettings.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
	}
	fetchAmpSettings() {
		ajax({
			method: 'GET',
			url: '/user/site/16425/ampSettingsData'
		})
			.then(res => {
				this.setState({
					channels: res.channels
				});
			})
			.catch(res => {
				console.log(res);
			});
	}
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
		console.log(name, value);
	}

	renderSelectors(selectors) {
		return Object.keys(commonConsts.selectors).map(key => {
			let selectorValue = selectors[key] || '';
			return (
				<InputControl
					label={commonConsts.selectors[key].alias}
					handleOnChange={e => this.handleOnChange(e)}
					key={key}
					value={selectorValue}
					name={key}
				/>
			);
		});
	}
	saveSiteSettings() {
		console.log('jjjj');
	}
	saveChannelSettings(event) {
		event.preventDefault();
		console.log(this.state);
		// const data = new FormData(event.target);
		// console.log(event.target.template);
		// ajax({
		// 	method: 'POST',
		// 	url: '/user/site/16425/pagegroup/saveAmpSettings',
		// 	data: {
		// 		platform: 'DESKTOP',
		// 		pageGroup,
		// 		ampData
		// 	}
		// })
		// 	.then(res => {
		// 		console.log(res);
		// 	})
		// 	.catch(res => {
		// 		console.log(res);
		// 	});
	}
	renderSocialApps(socialApps) {
		return Object.keys(commonConsts.socialApps).map(key => {
			let selectedApp = socialApps.indexOf(key) > -1 ? true : false;
			return (
				<Col sm={4} key={key}>
					<input
						name={key}
						type="checkbox"
						placeholder="Logo"
						style={{ width: 'auto' }}
						checked={selectedApp}
					/>
					<label> {commonConsts.socialApps[key].alias}</label>
				</Col>
			);
		});
	}
	renderPageGroup(channel) {
		let ampSettings = channel.ampSettings || {},
			social = ampSettings.social || {},
			customCSS = ampSettings['customCSS'] ? ampSettings['customCSS'].value : '',
			{ include, placement, apps = [] } = social,
			{ selectors = {}, toDelete, beforeJs, siteName, template, adNetwork, pubId } = ampSettings;
		return (
			<CollapsePanel title={channel.pageGroup} key={channel.pageGroup} bold={true}>
				<form
					onSubmit={e => {
						this.saveChannelSettings(e);
					}}
				>
					<Heading title="Selectors Settings" />
					{this.renderSelectors(selectors)}
					<hr />
					<Heading title="Custom CSS" />
					<textarea placeholder="Enter Custom CSS here" name="customCss" value={customCSS} />
					<hr />
					<Heading title="Delete Selector" />
					<textarea placeholder="Enter Custom CSS here" name="toDelete" value={toDelete} />
					<hr />
					<Heading title="Social Settings" />

					<CustomToggleSwitch
						labelText="Include"
						className="mB-0"
						defaultLayout
						checked={include}
						name="includeSocial"
						layout="horizontal"
						size="m"
						id="js-force-sample-url"
						on="On"
						off="Off"
					/>
					<RowColSpan label="Placement">
						<select className="form-control" value={placement}>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
						</select>
					</RowColSpan>
					<RowColSpan label="Apps">{this.renderSocialApps(apps)}</RowColSpan>
					<hr />
					<Heading title="Before JS" />
					<textarea placeholder="Enter Custom CSS here" name="beforeJs" value={beforeJs} />
					<hr />
					<Heading title="Other Settings" />
					<InputControl label="Site Name" value={siteName} name="siteName" />
					<InputControl label="Template" value={template} name="template" />
					<RowColSpan label="Ad Network">
						<select className="form-control" value={adNetwork}>
							<option value="adsense">Adsense</option>
							<option value="adx">AdX</option>
						</select>
					</RowColSpan>
					<Row>
						<Col sm={5}>
							<div>Settings</div>
						</Col>
						<Col sm={7}>
							<input
								onChange={this.handleOnChange}
								className="form-control"
								type="text"
								placeholder="Settings"
								name="settings"
							/>
						</Col>
					</Row>
					{/* <InputControl label="Pub Id" value={pubId} name="pubId" /> */}
					<button className="btn-success">Save</button>
				</form>
			</CollapsePanel>
		);
	}
	componentDidMount() {
		this.fetchAmpSettings();
	}
	render() {
		return (
			<Row>
				<ActionCard title="AMP settings">
					<div className="settings-pane">
						<Row>
							<Col sm={6}>
								<form onSubmit={this.saveSiteSettings}>
									<Heading title="Site Level Settings" />
									<Row>
										<Col sm={5}>
											<div>Settings</div>
										</Col>
										<Col sm={7}>
											<input
												onChange={this.handleOnChange}
												className="form-control"
												type="text"
												placeholder="Settings"
												name="settings"
											/>
										</Col>
									</Row>
									{/* <InputControl label="Settings" /> */}
									<Button className="btn-success" type="submit">
										Save
									</Button>
								</form>
							</Col>
							<Col sm={6}>
								<Heading title="Channel Level Settings" />
								{this.state.channels.map(this.renderPageGroup)}
							</Col>
						</Row>
					</div>
				</ActionCard>
			</Row>
		);
	}
}

export default AmpSettings;
