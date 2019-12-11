import React from 'react';
import { Row, Col } from 'react-bootstrap';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
import AdsSettings from './AdsSettings.jsx';
import SelectorSettings from './SelectorSettings.jsx';
import Select from 'react-select';
import '../style.scss';
import Codemirror from 'react-codemirror';
import 'codemirror/addon/display/autorefresh.js';
import cssbeautify from 'cssbeautify';
import CleanCSS from 'clean-css';
class PageGroupSettings extends React.Component {
	constructor(props) {
		super(props);
		let options = {
			indent: '  ',
			openbrace: 'separate-line',
			autosemicolon: true
		};
		let { siteId, channel } = props,
			ampSettings = channel.ampSettings || {},
			social = ampSettings.social || { include: false, apps: [] },
			ads = ampSettings.ads || [],
			imgConfig = ampSettings.imgConfig || { widthLimit: 100, heightLimit: 100 },
			customCSS = {
				value: ampSettings.customCSS && ampSettings.customCSS.value
					? cssbeautify(ampSettings.customCSS.value, options)
					: ''
			},
			{
				selectors = {},
				toDelete,
				beforeJs,
				afterJs,
				siteName,
				template,
				adNetwork,
				pubId,
				isEnabled,
				reconversion,
				reconversionFrequency,
				convertLinksToAmpLinks
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
			reconversionFrequency,
			convertLinksToAmpLinks: convertLinksToAmpLinks || false,
			isEnabled: isEnabled || false,
			selectors,
			reconversion: reconversion || { unit: 'min', value: '' },
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
			afterJs,
			isVisible: false
		};
	}

	handleButtonClick = () => {
		this.setState({ isVisible: !this.state.isVisible });
	};

	isDuplicateSlotId = ads => {
		let adsenseUniqueIds = [], adpTagUniqueIds = [], found = false;
		for (let ad of ads) {
			let slotId = ad.data ? ad.data.slotId : '', { type } = ad;
			if (
				(type == 'adsense' && adsenseUniqueIds.indexOf(slotId) != -1) ||
				(type == 'adpTags' && adpTagUniqueIds.indexOf(slotId) != -1)
			) {
				found = true;
			} else {
				if (type == 'adsense') {
					adsenseUniqueIds.push(slotId);
				} else if (type == 'adpTags') {
					adpTagUniqueIds.push(slotId);
				}
			}
		}
		return found;
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
	parseFormData = () => {
		let finalData = JSON.parse(JSON.stringify(this.state)),
			dataAds = finalData.ads,
			dataSocial = finalData.social,
			dataSelectors = finalData.selectors,
			reconversion = finalData.reconversion;
		let ads = [], activeSocialApps = [];
		if (dataSocial.include) {
			for (let i = 0; i < dataSocial.apps.length; i++)
				activeSocialApps.push(dataSocial.apps[i].value);
		}
		finalData.social.apps = activeSocialApps;
		finalData.beforeJs = finalData.beforeJs ? btoa(finalData.beforeJs) : '';
		finalData.afterJs = finalData.afterJs ? btoa(finalData.afterJs) : '';
		if (finalData.customCSS) {
			let value = new CleanCSS().minify(finalData.customCSS.value).styles;
			finalData.customCSS = { value };
		}
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

		Object.keys(dataSelectors).map(key => {
			if (Array.isArray(dataSelectors[key])) {
				let newSelectorList = dataSelectors[key].map(selector => ({
					css: selector.css,
					value: selector.value
				}));
				dataSelectors[key] = newSelectorList;
			} else if (typeof dataSelectors[key] == 'object') {
				delete dataSelectors[key].isVisible;
			}
		});
		if (reconversion && reconversion.value) {
			switch (reconversion.unit) {
				case 'min':
					finalData.reconversionFrequency = parseInt(reconversion.value) * 60 * 1000;
					break;
				case 'hrs':
					finalData.reconversionFrequency = parseInt(reconversion.value) * 60 * 60 * 1000;
					break;
				case 'days':
					finalData.reconversionFrequency = parseInt(reconversion.value) * 60 * 60 * 24 * 1000;
					break;
			}
		} else {
			finalData.reconversionFrequency = 0;
		}
		finalData.ads = ads;
		return finalData;
	};
	saveChannelSettings = event => {
		event.preventDefault();
		let ampData = this.parseFormData(), pageGroup = this.props.channel.pageGroup;
		let { siteId } = this.state, selectors = ampData.selectors;
		if (!selectors.articleContent || !ampData.siteName || !ampData.template) {
			alert('Article Content, SiteName and Template are required');
			return;
		}
		if (this.isDuplicateSlotId(ampData.ads)) {
			alert('Slot Ids should be unique!');
			return;
		}
		ajax({
			method: 'POST',
			url: '/api/site/' + siteId + '/pagegroup/saveAmpSettings',
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
	};
	handleOnChange = e => {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
	};
	render = () => {
		const { props } = this, channel = props.channel;
		const options = {
			lineNumbers: true,
			autoRefresh: true,
			theme: 'solarized',
			textAreaClassName: ['form-control'],
			style: {
				border: '1px solid #eee',
				height: 'auto'
			}
		};
		return (
			<CollapsePanel title={channel.pageGroup} className="h4FontSize" noBorder={true}>
				<form onSubmit={this.saveChannelSettings}>
					<CustomToggleSwitch
						labelText="IsEnabled"
						className="mB-0"
						defaultLayout
						checked={this.state.isEnabled}
						onChange={isEnabled => {
							this.setState({ isEnabled });
						}}
						name="isEnabled"
						layout="horizontal"
						size="m"
						id={'isEnabled' + channel.pageGroup}
						on="On"
						off="Off"
					/>
					<CustomToggleSwitch
						labelText="Convert Links To AmpLinks"
						className="mB-0"
						defaultLayout
						checked={this.state.convertLinksToAmpLinks}
						onChange={convertLinksToAmpLinks => {
							this.setState({ convertLinksToAmpLinks });
						}}
						name="convertLinksToAmpLinks"
						layout="horizontal"
						size="m"
						id={'convertLinksToAmpLinks' + channel.pageGroup}
						on="On"
						off="Off"
					/>

					<RowColSpan label="Reconversion Frequency">
						<select
							className="reConversionInput mL-10"
							name="placement"
							value={this.state.reconversion.unit}
							onChange={e => {
								let reconversion = this.state.reconversion;
								reconversion.unit = e.target.value;
								this.setState({
									reconversion
								});
							}}
						>
							<option value="min">Minutes</option>
							<option value="hrs">Hours</option>
							<option value="days">Days</option>
						</select>
						<input
							className="reConversionInput"
							type="number"
							onChange={e => {
								let reconversion = this.state.reconversion;
								reconversion.value = parseFloat(e.target.value);
								this.setState({
									reconversion
								});
							}}
							value={this.state.reconversion.value}
						/>
					</RowColSpan>
					<SelectorSettings selectors={this.state.selectors} />

					<hr />
					<CollapsePanel title="Image Configuration" className="mediumFontSize" noBorder={true}>
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
					</CollapsePanel>
					<hr />
					<CollapsePanel title="Social Settings" className="mediumFontSize" noBorder={true}>
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
							id={'includeSocial' + channel.pageGroup}
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
					</CollapsePanel>
					<hr />
					<CollapsePanel title="Other Settings" className="mediumFontSize" noBorder={true}>
						<RowColSpan label="Custom CSS">
							<Codemirror
								value={this.state.customCSS.value}
								onChange={value => {
									let customCSS = this.state.customCSS;
									customCSS.value = value;
									this.setState({ customCSS });
								}}
								options={options}
							/>
						</RowColSpan>
						<RowColSpan label="Delete Selector">
							<textarea
								name="toDelete"
								value={this.state.toDelete || ''}
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
							<Codemirror
								value={this.state.beforeJs || ''}
								onChange={beforeJs => {
									this.setState({
										beforeJs
									});
								}}
								options={options}
							/>
						</RowColSpan>
						<RowColSpan label="After JS">
							<Codemirror
								value={this.state.afterJs || ''}
								onChange={afterJs => {
									this.setState({
										afterJs
									});
								}}
								options={options}
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
					</CollapsePanel>
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
