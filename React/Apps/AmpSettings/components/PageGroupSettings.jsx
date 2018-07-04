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
			social = ampSettings.social || { include: false },
			menu = ampSettings.menu || { links: [], include: false },
			ads = ampSettings.ads || [],
			imgConfig = ampSettings.imgConfig || { widthLimit: 100, heightLimit: 100 },
			customCSS = { value: ampSettings['customCSS'] ? ampSettings['customCSS'].value : '' },
			{ selectors = {}, toDelete, beforeJs, afterJs, siteName, template, adNetwork, pubId } = ampSettings;
		beforeJs = beforeJs ? atob(beforeJs) : '';
		afterJs = afterJs ? atob(afterJs) : '';
		for (let i = 0; i < ads.length; i++) {
			ads[i]['adCode'] = ads[i]['adCode'] ? atob(ads[i]['adCode']) : '';
		}
		this.state = {
			selectors,
			toDelete: toDelete,
			imgConfig,
			beforeJs,
			siteName,
			template,
			adNetwork,
			pubId,
			social,
			menu,
			ads,
			customCSS,
			afterJs
		};
		this.renderSelectors = this.renderSelectors.bind(this);
		this.renderSocialApps = this.renderSocialApps.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
		this.saveChannelSettings = this.saveChannelSettings.bind(this);
		this.parseFormData = this.parseFormData.bind(this);
		this.handleSocialAppChange = this.handleSocialAppChange.bind(this);
		this.renderLinks = this.renderLinks.bind(this);
		this.renderAds = this.renderAds.bind(this);
	}

	renderSelectors() {
		return Object.keys(commonConsts.selectors).map(key => {
			let selectorValue = this.state.selectors[key];
			if (commonConsts.selectors[key].inputType == 'text')
				return (
					<RowColSpan label={commonConsts.selectors[key].alias} key={key}>
						<input
							onChange={e => {
								if (e.target.value) {
									let selectors = this.state.selectors;
									selectors[e.target.name] = e.target.value;
									this.setState({
										selectors
									});
								}
							}}
							className="form-control"
							type={commonConsts.selectors[key].inputType}
							placeholder={commonConsts.selectors[key].alias}
							name={key}
							defaultValue={selectorValue}
						/>
					</RowColSpan>
				);
			else
				return (
					<RowColSpan label={commonConsts.selectors[key].alias} key={key}>
						<textarea
							placeholder={commonConsts.selectors[key].alias}
							name={key}
							value={selectorValue}
							onChange={e => {
								if (e.target.value) {
									let selectors = this.state.selectors;
									selectors[e.target.name] = e.target.value.split(',');
									this.setState({
										selectors
									});
								}
							}}
						/>
					</RowColSpan>
				);
		});
	}
	renderInputControl({ label, name, value, type }) {
		return (
			<Row>
				<Col sm={5}>
					<div>{label}</div>
				</Col>
				<Col sm={7}>
					<input
						onChange={this.handleOnChange}
						className="form-control"
						type={type}
						placeholder={label}
						name={name}
						value={value}
					/>
				</Col>
			</Row>
		);
	}
	parseFormData(ampData) {
		let finalData = ampData;
		let ads = [],
			links = [];
		for (let i = 0; i < finalData.menu['links'].length; i++) {
			if (finalData.menu['links'][i]['name'] && finalData.menu['links'][i]['link'])
				links.push(finalData.menu['links'][i]);
		}
		finalData['beforeJs'] = finalData['beforeJs'] ? btoa(finalData['beforeJs']) : '';
		finalData['afterJs'] = finalData['afterJs'] ? btoa(finalData['afterJs']) : '';
		for (let i = 0; i < finalData.ads.length; i++) {
			if (finalData.ads[i]['adCode']) {
				ads.push({ adCode: btoa(finalData.ads[i]['adCode']), selector: finalData.ads[i]['selector'] });
			}
		}
		finalData.ads = ads;
		finalData.menu['links'] = links;
		return finalData;
	}
	saveChannelSettings(event) {
		event.preventDefault();
		let ampData = this.parseFormData(Object.assign({}, this.state)),
			pageGroup = this.props.channel.pageGroup;
		let arr = window.location.href.split('/'),
			siteId = arr[arr.length - 2];
		if (!ampData.selectors['articleContent'] || !ampData.siteName || !ampData.template) {
			alert('Artical Content, SiteName and Template are required');
			return;
		}
		ajax({
			method: 'POST',
			url: '/user/site/' + siteId + '/pagegroup/saveAmpSettings',
			data: JSON.stringify({
				platform: 'MOBILE',
				pageGroup,
				ampData
			})
		})
			.then(res => {
				alert('Settings Saved Successfully!');
				console.log(res);
			})
			.catch(res => {
				alert('Some Error Occurred!');
				console.log(res);
			});
	}
	handleSocialAppChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.checked;
		let social = this.state.social,
			apps = social['apps'];
		//this.setState({ [name]: value });
		if (value == true) {
			apps.push(name);
		} else {
			let index = apps.indexOf(name);
			if (index > -1) {
				apps.splice(index, 1);
			}
		}
		social['apps'] = apps;
		this.setState({
			social
		});
	}
	renderSocialApps() {
		return Object.keys(commonConsts.socialApps).map(key => {
			let selectedApp = this.state.social['apps'] && this.state.social['apps'].indexOf(key) > -1 ? true : false;
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
		if (value) this.setState({ [name]: value });
	}
	renderLinks() {
		const listLinks = this.state.menu['links'].map((linkView, index) => {
			return (
				<div key={index}>
					<input
						className="col-sm-5"
						onChange={e => {
							let menu = this.state.menu,
								links = menu['links'],
								link = links[index];
							link['name'] = e.target.value;
							if (e.target.value) this.setState({ menu });
						}}
						style={{ width: 'auto' }}
						type="text"
						placeholder="Name"
						name="name"
						value={linkView.name}
					/>
					<input
						className="col-sm-5"
						onChange={e => {
							let menu = this.state.menu,
								links = menu['links'],
								link = links[index];
							link['link'] = e.target.value;
							if (e.target.value) this.setState({ menu });
						}}
						style={{ width: 'auto' }}
						type="text"
						placeholder="Link"
						name="link"
						value={linkView.link}
					/>{' '}
					<i
						style={{ width: 'auto', cursor: 'pointer' }}
						className="fa fa-trash fa-2x col-sm-2"
						onClick={() => {
							let menu = this.state.menu,
								links = menu['links'];
							links.splice(index, 1);
							this.setState({ menu });
						}}
					/>
				</div>
			);
		});
		return <Col sm={8}>{listLinks}</Col>;
	}

	renderAds() {
		const listAds = this.state.ads.map((linkView, index) => {
			return (
				<div key={index}>
					<input
						className="col-sm-5"
						onChange={e => {
							let ads = this.state.ads,
								ad = ads[index];
							ad['selector'] = e.target.value;
							if (e.target.value) this.setState({ ads });
						}}
						style={{ width: 'auto' }}
						type="text"
						placeholder="Selector"
						name="selector"
						value={linkView.selector}
					/>
					<input
						className="col-sm-5"
						onChange={e => {
							let ads = this.state.ads,
								ad = ads[index];
							ad['adCode'] = e.target.value;
							if (e.target.value) this.setState({ ads });
						}}
						style={{ width: 'auto' }}
						type="text"
						placeholder="AdCode"
						name="adCode"
						value={linkView.adCode}
					/>
					<i
						style={{ width: 'auto', cursor: 'pointer' }}
						className="fa fa-trash fa-2x col-sm-2"
						onClick={() => {
							let ads = this.state.ads;
							ads.splice(index, 1);
							this.setState({ ads });
						}}
					/>
				</div>
			);
		});
		return <Col sm={8}>{listAds}</Col>;
	}

	render() {
		const { props } = this,
			channel = props.channel;
		return (
			<CollapsePanel title={channel.pageGroup} bold={true}>
				<form onSubmit={this.saveChannelSettings}>
					<div style={{ float: 'right' }}>
						<input type="checkbox" style={{ width: 'auto', marginRight: '10px' }} />
						<span>Include</span>
					</div>
					<Heading title="Selectors Settings" />
					{this.renderSelectors()}
					<hr />
					<Heading title="Image Configuration" />
					<RowColSpan label="Width Limit">
						<input
							onChange={e => {
								let imgConfig = this.state.imgConfig;
								imgConfig['widthLimit'] = parseFloat(e.target.value);
								if (e.target.value)
									this.setState({
										imgConfig
									});
							}}
							className="form-control"
							type="number"
							placeholder="Width Limit"
							name="widthLimit"
							value={this.state.imgConfig['widthLimit']}
						/>
					</RowColSpan>
					<RowColSpan label="Height Limit">
						<input
							onChange={e => {
								let imgConfig = this.state.imgConfig;
								imgConfig['heightLimit'] = parseFloat(e.target.value);
								if (e.target.value)
									this.setState({
										imgConfig
									});
							}}
							className="form-control"
							type="number"
							placeholder="Height Limit"
							name="heightLimit"
							value={this.state.imgConfig['heightLimit']}
						/>
					</RowColSpan>
					<hr />
					<Heading title="Social Settings" />

					<CustomToggleSwitch
						labelText="Include"
						className="mB-0"
						defaultLayout
						checked={this.state.social['include']}
						onChange={value => {
							let social = this.state.social;
							social['include'] = value;
							this.setState({ social });
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
							value={this.state.social['placement']}
							onChange={e => {
								let social = this.state.social;
								social['placement'] = e.target.value;
								if (e.target.value) this.setState({ social });
							}}
						>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
						</select>
					</RowColSpan>
					<RowColSpan label="Apps">{this.renderSocialApps()}</RowColSpan>
					<hr />
					<Heading title="Menu Settings" />

					<CustomToggleSwitch
						labelText="Include"
						className="mB-0"
						defaultLayout
						checked={this.state.menu['include']}
						onChange={value => {
							let menu = this.state.menu;
							menu['include'] = value;
							this.setState({ menu });
						}}
						name="includeMenu"
						layout="horizontal"
						size="m"
						id="js-force-sample-url"
						on="On"
						off="Off"
					/>
					<Row>
						<Col sm={4}>
							<span>Links</span>
							<button
								style={{ width: 'auto', marginLeft: 10 }}
								className="btn-success"
								type="button"
								onClick={() => {
									let menu = this.state.menu,
										links = menu['links'];
									links.push({ name: '', link: '' });
									this.setState({ menu });
								}}
							>
								+ Add
							</button>
						</Col>
						{this.renderLinks()}
					</Row>
					<hr />
					<Heading title="Other Settings" />
					<RowColSpan label="Custom CSS">
						<textarea
							placeholder="Enter Custom CSS here"
							name="customCSS"
							style={{ resize: 'both', overflow: 'auto' }}
							value={this.state.customCSS['value']}
							onChange={e => {
								let customCSS = this.state.customCSS;
								customCSS['value'] = e.target.value;
								if (e.target.value) this.setState({ customCSS });
							}}
						/>
					</RowColSpan>
					<RowColSpan label="Delete Selector">
						<textarea
							name="toDelete"
							value={this.state.toDelete}
							onChange={e => {
								let toDelete = this.state.toDelete;
								toDelete = e.target.value.split(',');
								if (e.target.value)
									this.setState({
										toDelete
									});
							}}
						/>
					</RowColSpan>
					<RowColSpan label="Before JS">
						<textarea name="beforeJs" value={this.state.beforeJs} onChange={this.handleOnChange} />
					</RowColSpan>
					<RowColSpan label="After JS">
						<textarea
							name="afterJs"
							value={this.state.afterJs}
							onChange={this.handleOnChange}
							style={{ resize: 'both', overflow: 'auto' }}
						/>
					</RowColSpan>
					{this.renderInputControl({
						label: 'Site Name',
						name: 'siteName',
						value: this.state.siteName,
						type: 'text'
					})}
					{this.renderInputControl({
						label: 'Template',
						name: 'template',
						value: this.state.template,
						type: 'text'
					})}
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
					<Row>
						<Col sm={4}>
							<span>Ads</span>
							<button
								style={{ width: 'auto', marginLeft: 10 }}
								className="btn-success"
								type="button"
								onClick={() => {
									let ads = this.state.ads;
									ads.push({ selector: '', adCode: '' });
									this.setState({ ads });
								}}
							>
								+ Add
							</button>
						</Col>
						{this.renderAds()}
					</Row>
					{this.renderInputControl({ label: 'Pub Id', name: 'pubId', value: this.state.pubId, type: 'text' })}
					<button className="btn-success">Save</button>
				</form>
			</CollapsePanel>
		);
	}
}

export default PageGroupSettings;
