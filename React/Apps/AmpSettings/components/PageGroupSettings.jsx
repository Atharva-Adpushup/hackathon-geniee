import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
import AdsSettings from './AdsSettings.jsx';
import Select from 'react-select';
class PageGroupSettings extends React.Component {
	constructor(props) {
		super(props);
		let { siteId, channel } = props,
			ampSettings = channel.ampSettings || {},
			social = ampSettings.social || { include: false, apps: [] },
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
		for (let i = 0; i < social.apps.length; i++) {
			let name = social.apps[i], app = { value: name, label: name };
			social.apps[i] = app;
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
			ads,
			customCSS,
			afterJs
		};
	}

	renderSelectors = () => {
		let selectorConf = commonConsts.selectors;
		return Object.keys(selectorConf).map(key => {
			let selectorValue = this.state.selectors[key];
			if (selectorConf[key].inputType == 'text')
				return (
					<RowColSpan label={selectorConf[key].alias} key={key}>
						<input
							onChange={e => {
								let selectors = this.state.selectors;
								selectors[e.target.name] = e.target.value;
								this.setState({
									selectors
								});
							}}
							className="form-control"
							type={selectorConf[key].inputType}
							placeholder={selectorConf[key].alias}
							name={key}
							defaultValue={selectorValue}
						/>
					</RowColSpan>
				);
			else
				return (
					<RowColSpan label={selectorConf[key].alias} key={key}>
						<textarea
							placeholder={selectorConf[key].alias}
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
	};
	renderInputControl = ({ label, name, value, type }) => {
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
	};
	parseFormData = ampData => {
		let finalData = ampData, dataAds = finalData.ads, dataSocial = finalData.social;
		let ads = [], activeSocialApps = [];
		if (dataSocial.include) {
			for (let i = 0; i < dataSocial.apps.length; i++)
				activeSocialApps.push(dataSocial.apps[i].value);
		}
		finalData.social.apps = activeSocialApps;
		finalData.beforeJs = finalData.beforeJs ? btoa(finalData.beforeJs) : '';
		finalData.afterJs = finalData.afterJs ? btoa(finalData.afterJs) : '';
		for (let i = 0; i < dataAds.length; i++) {
			if (dataAds[i].selector && dataAds[i].adCode && dataAds[i].type) {
				let adType = dataAds[i].type, adTypeFieldConf = commonConsts.ads.type[adType];
				if (!adTypeFieldConf) delete dataAds[i].data;
				if ((adTypeFieldConf && dataAds[i].data) || !adTypeFieldConf) {
					let adCode = dataAds[i].adCode;
					dataAds[i].adCode = btoa(adCode);
					ads.push(dataAds[i]);
				}
			}
		}
		finalData.ads = ads;
		return finalData;
	};
	saveChannelSettings = event => {
		event.preventDefault();
		let ampData = this.parseFormData(Object.assign({}, this.state)), pageGroup = this.props.channel.pageGroup;
		let { siteId } = this.state, selectors = ampData.selectors;
		if (!selectors.articleContent || !ampData.siteName || !ampData.template) {
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
	};
	handleSocialAppChange = apps => {
		let social = this.state.social;
		social.apps = apps || [];
		this.setState({
			social
		});
	};
	renderSocialApps = () => {
		return (
			<Select
				value={this.state.social.apps || []}
				isMulti={true}
				onChange={this.handleSocialAppChange}
				options={commonConsts.socialApps}
				placeholder="Select Apps"
			/>
		);
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
	};
	handleOnChange = e => {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
	};
	render = () => {
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
					<hr />
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
					<hr />
					<AdsSettings ads={this.state.ads} />
					<hr />
					<div className="row settings-btn-pane">
						<div className="col-sm-4">
							<button className="btn-success">Save Settings</button>
						</div>
						<div className="col-sm-2">
							<button type="button" className="btn-default">Cancel</button>
						</div>
					</div>
				</form>
			</CollapsePanel>
		);
	};
}

export default PageGroupSettings;
