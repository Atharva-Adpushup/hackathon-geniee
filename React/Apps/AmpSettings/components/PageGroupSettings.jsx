import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/customToggleSwitch.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
class PageGroupSettings extends React.Component {
	constructor(props) {
		super(props);
		let { siteId, channel } = props,
			ampSettings = channel.ampSettings || {},
			social = ampSettings.social || { include: false },
			menu = ampSettings.menu || { links: [], include: false, position: 'right' },
			ads = ampSettings.ads || [],
			imgConfig = ampSettings.imgConfig || { widthLimit: 100, heightLimit: 100 },
			customCSS = { value: ampSettings.customCSS ? ampSettings.customCSS.value : '' },
			{
				selectors = {},
				toDelete,
				beforeJs,
				afterJs,
				siteName,
				template,
				adNetwork,
				pubId,
				isEnabled
			} = ampSettings;
		beforeJs = beforeJs ? atob(beforeJs) : '';
		afterJs = afterJs ? atob(afterJs) : '';
		for (let i = 0; i < ads.length; i++) {
			ads[i].adCode = ads[i].adCode ? atob(ads[i].adCode) : '';
		}
		this.state = {
			siteId,
			isEnabled: isEnabled || false,
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
		this.renderNetworkInputs = this.renderNetworkInputs.bind(this);
	}

	renderSelectors() {
		return Object.keys(commonConsts.selectors).map(key => {
			let selectorValue = this.state.selectors[key];
			if (commonConsts.selectors[key].inputType == 'text')
				return (
					<RowColSpan label={commonConsts.selectors[key].alias} key={key}>
						<input
							onChange={e => {
								let selectors = this.state.selectors;
								selectors[e.target.name] = e.target.value;
								this.setState({
									selectors
								});
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
							style={{ resize: 'auto' }}
							name={key}
							value={selectorValue}
							onChange={e => {
								let selectors = this.state.selectors, value = e.target.value.trim();
								selectors[e.target.name] = value.split(',');
								this.setState({
									selectors
								});
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
	generateAdCode(index) {
		let ad = this.state.ads[index], adNetwork = ad.type, adCode = commonConsts.ads.sampleAds[adNetwork];

		adCode = adCode.replace('dWidth', ad.width);
		adCode = adCode.replace('dHeight', ad.height);
		for (let field in ad.data) {
			adCode = adCode.replace(field, ad.data[field]);
		}
		return adCode;
	}
	parseFormData(ampData) {
		let finalData = ampData, dataLinks = finalData.menu.links, dataAds = finalData.ads;
		let ads = [], links = [];
		for (let i = 0; i < dataLinks.length; i++) {
			if (dataLinks[i].name && dataLinks[i].link) links.push(dataLinks[i]);
		}
		finalData.beforeJs = finalData.beforeJs ? btoa(finalData.beforeJs) : '';
		finalData.afterJs = finalData.afterJs ? btoa(finalData.afterJs) : '';
		for (let i = 0; i < dataAds.length; i++) {
			if (dataAds[i].selector && dataAds[i].adCode && dataAds[i].type) {
				let adType = dataAds[i].type;
				if (!commonConsts.ads.type[adType]) delete dataAds[i].data;
				if ((commonConsts.ads.type[adType] && dataAds[i].data) || !commonConsts.ads.type[adType]) {
					let adCode = dataAds[i].adCode;
					dataAds[i].adCode = btoa(adCode);
					ads.push(dataAds[i]);
				}
			}
		}
		finalData.ads = ads;
		finalData.menu.links = links;
		return finalData;
	}
	saveChannelSettings(event) {
		event.preventDefault();
		let ampData = this.parseFormData(Object.assign({}, this.state)), pageGroup = this.props.channel.pageGroup;
		let { siteId } = this.state;
		if (!ampData.selectors.articleContent || !ampData.siteName || !ampData.template) {
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
			})
			.catch(res => {
				alert('Some Error Occurred!');
			});
	}
	handleSocialAppChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.checked;
		let social = this.state.social, apps = social.apps || [];
		//this.setState({ [name]: value });
		if (value == true) {
			apps.push(name);
		} else {
			let index = apps.indexOf(name);
			if (index > -1) {
				apps.splice(index, 1);
			}
		}
		social.apps = apps;
		this.setState({
			social
		});
	}
	renderSocialApps() {
		return Object.keys(commonConsts.socialApps).map(key => {
			let selectedApp = this.state.social.apps && this.state.social.apps.indexOf(key) > -1 ? true : false;
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
	}
	renderLinks() {
		const listLinks = this.state.menu.links.map((linkView, index) => {
			return (
				<div key={index}>
					<input
						className="col-sm-5"
						onChange={e => {
							let menu = this.state.menu, links = menu.links, link = links[index];
							link.name = e.target.value;
							this.setState({ menu });
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
							let menu = this.state.menu, links = menu.links, link = links[index];
							link.link = e.target.value;
							this.setState({ menu });
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
							let menu = this.state.menu, links = menu.links;
							links.splice(index, 1);
							this.setState({ menu });
						}}
					/>
				</div>
			);
		});
		return <Col sm={8}>{listLinks}</Col>;
	}
	renderNetworkInputs(index) {
		let selectedAd = this.state.ads[index], selectedNetwork = selectedAd.type;
		return selectedNetwork && commonConsts.ads.type[selectedNetwork]
			? Object.keys(commonConsts.ads.type[selectedNetwork]).map((field, fieldIndex) => (
					<RowColSpan label={field} key={fieldIndex}>
						<input
							type="text"
							placeholder={field}
							name={field}
							className="form-control"
							value={selectedAd.data[field] || ''}
							onChange={e => {
								let ads = this.state.ads, ad = ads[index], data = ad.data;
								data[field] = e.target.value;
								this.setState({ ads });
							}}
						/>
					</RowColSpan>
				))
			: '';
	}

	renderAds() {
		const listAds = this.state.ads.map((linkView, index) => {
			return (
				<div
					key={index}
					style={{
						background: 'aliceblue',
						padding: 5,
						margin: 5
					}}
				>
					<div
						style={{
							textAlign: 'right',
							cursor: 'pointer',
							paddingRight: 0,
							margin: '-10px 10px 5px'
						}}
						className="fa fa-times-circle fa-2x col-sm-12"
						onClick={() => {
							let ads = this.state.ads;
							ads.splice(index, 1);
							this.setState({ ads });
						}}
					/>
					<RowColSpan label="Selector">
						<input
							onChange={e => {
								let ads = this.state.ads, ad = ads[index];
								ad.selector = e.target.value;
								this.setState({ ads });
							}}
							type="text"
							placeholder="Selector"
							name="selector"
							className="form-control"
							value={linkView.selector || ''}
						/>
					</RowColSpan>
					<RowColSpan label="Width">
						<input
							onChange={e => {
								let ads = this.state.ads, ad = ads[index];
								ad.width = e.target.value;
								this.setState({ ads });
							}}
							type="number"
							placeholder="Width"
							name="width"
							className="form-control"
							value={linkView.width || 100}
						/>
					</RowColSpan>
					<RowColSpan label="Height">
						<input
							onChange={e => {
								let ads = this.state.ads, ad = ads[index];
								ad.height = e.target.value;
								this.setState({ ads });
							}}
							type="number"
							placeholder="Height"
							name="height"
							className="form-control"
							value={linkView.height || 100}
						/>
					</RowColSpan>
					<RowColSpan label="Operation">
						<select
							className="form-control"
							name="operation"
							value={linkView.operation || 'INSERTAFTER'}
							onChange={e => {
								let ads = this.state.ads, ad = ads[index];
								ad.operation = e.target.value;
								this.setState({ ads });
							}}
						>
							<option value="">Select Operation</option>
							{commonConsts.ads.operations.map((operation, index) => (
								<option value={operation} key={index}>
									{operation}
								</option>
							))}
						</select>

					</RowColSpan>
					<RowColSpan label="AdCode">
						<textarea
							style={{ resize: 'both', overflow: 'auto' }}
							onChange={e => {
								let ads = this.state.ads, ad = ads[index];
								ad.adCode = e.target.value;
								this.setState({ ads });
							}}
							placeholder="AdCode"
							name="adCode"
							className="form-control"
							value={
								this.state.ads[index].type && this.state.ads[index].type != 'custom'
									? this.generateAdCode(index)
									: linkView.adCode
							}
							disabled={this.state.ads[index].type && this.state.ads[index].type != 'custom'}
						/>
					</RowColSpan>
					<RowColSpan label="Type">
						<select
							className="form-control"
							name="type"
							value={linkView.type || ''}
							onChange={e => {
								let ads = this.state.ads, ad = ads[index], adFields = commonConsts.ads.type;
								ad.type = e.target.value;
								if (adFields[ad.type]) ad.data = {};
								this.setState({ ads });
							}}
						>
							<option value="">Select Type</option>
							{Object.keys(commonConsts.ads.type).map((type, index) => (
								<option value={type} key={index}>
									{type}
								</option>
							))}
							<option value="custom">Custom</option>
						</select>
					</RowColSpan>
					{this.renderNetworkInputs(index)}
				</div>
			);
		});
		return listAds;
	}

	render() {
		const { props } = this, channel = props.channel;
		return (
			<CollapsePanel title={channel.pageGroup} bold={true}>
				<form onSubmit={this.saveChannelSettings}>
					<CustomToggleSwitch
						labelText="IsEnabled"
						className="mB-0"
						defaultLayout
						checked={this.state.isEnabled}
						onChange={value => {
							this.setState({ isEnabled: value });
						}}
						name="IsEnabled"
						layout="horizontal"
						size="m"
						id="js-force-sample-url"
						on="On"
						off="Off"
					/>
					<Heading title="Selectors Settings" />
					{this.renderSelectors()}
					<hr />
					<Heading title="Image Configuration" />
					<RowColSpan label="Width Limit">
						<input
							onChange={e => {
								let imgConfig = this.state.imgConfig;
								imgConfig.widthLimit = parseFloat(e.target.value);
								this.setState({
									imgConfig
								});
							}}
							className="form-control"
							type="number"
							placeholder="Width Limit"
							name="widthLimit"
							value={this.state.imgConfig.widthLimit}
						/>
					</RowColSpan>
					<RowColSpan label="Height Limit">
						<input
							onChange={e => {
								let imgConfig = this.state.imgConfig;
								imgConfig.heightLimit = parseFloat(e.target.value);
								this.setState({
									imgConfig
								});
							}}
							className="form-control"
							type="number"
							placeholder="Height Limit"
							name="heightLimit"
							value={this.state.imgConfig.heightLimit}
						/>
					</RowColSpan>
					<hr />
					<Heading title="Social Settings" />

					<CustomToggleSwitch
						labelText="Include"
						className="mB-0"
						defaultLayout
						checked={this.state.social.include}
						onChange={value => {
							let social = this.state.social;
							social.include = value;
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
							value={this.state.social.placement}
							onChange={e => {
								let social = this.state.social;
								social.placement = e.target.value;
								this.setState({ social });
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
						checked={this.state.menu.include}
						onChange={value => {
							let menu = this.state.menu;
							menu.include = value;
							this.setState({ menu });
						}}
						name="includeMenu"
						layout="horizontal"
						size="m"
						id="js-force-sample-url"
						on="On"
						off="Off"
					/>
					<RowColSpan label="Position">
						<select
							className="form-control"
							name="position"
							value={this.state.menu.position}
							onChange={e => {
								let menu = this.state.menu;
								menu.position = e.target.value;
								this.setState({ menu });
							}}
						>
							<option value="left">Left</option>
							<option value="right">Right</option>
						</select>
					</RowColSpan>
					<Row>
						<Col sm={4}>
							<span>Links</span>
							<button
								style={{ width: 'auto', marginLeft: 10 }}
								className="btn-primary"
								type="button"
								onClick={() => {
									let menu = this.state.menu, links = menu.links;
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
							value={this.state.customCSS.value}
							onChange={e => {
								let customCSS = this.state.customCSS;
								customCSS.value = e.target.value;
								this.setState({ customCSS });
							}}
						/>
					</RowColSpan>
					<RowColSpan label="Delete Selector">
						<textarea
							name="toDelete"
							value={this.state.toDelete || ''}
							style={{ resize: 'auto' }}
							onChange={e => {
								let toDelete = this.state.toDelete, value = e.target.value.trim();
								toDelete = value.split(',');
								this.setState({
									toDelete
								});
							}}
						/>
					</RowColSpan>
					<RowColSpan label="Before JS">
						<textarea
							name="beforeJs"
							style={{ resize: 'both', overflow: 'auto' }}
							value={this.state.beforeJs || ''}
							onChange={this.handleOnChange}
						/>
					</RowColSpan>
					<RowColSpan label="After JS">
						<textarea
							name="afterJs"
							value={this.state.afterJs || ''}
							onChange={this.handleOnChange}
							style={{ resize: 'both', overflow: 'auto' }}
						/>
					</RowColSpan>
					{this.renderInputControl({
						label: 'Site Name',
						name: 'siteName',
						value: this.state.siteName || '',
						type: 'text'
					})}
					{this.renderInputControl({
						label: 'Template',
						name: 'template',
						value: this.state.template || '',
						type: 'text'
					})}
					<RowColSpan label="Ad Network">
						<select
							className="form-control"
							value={this.state.adNetwork || ''}
							name="adNetwork"
							onChange={this.handleOnChange}
						>
							<option value="adsense">Adsense</option>
							<option value="adx">AdX</option>
						</select>
					</RowColSpan>
					<RowColSpan label="Ads">
						<button
							className="btn-primary"
							type="button"
							onClick={() => {
								let ads = this.state.ads;
								ads.push({ width: 100, height: 100, operations: 'INSERTBEFORE' });
								this.setState({ ads });
							}}
						>
							+ Add
						</button>
					</RowColSpan>
					{this.renderAds()}
					{this.renderInputControl({ label: 'Pub Id', name: 'pubId', value: this.state.pubId, type: 'text' })}
					<button className="btn-success">Save</button>
				</form>
			</CollapsePanel>
		);
	}
}

export default PageGroupSettings;
