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
import '../style.scss';
import Codemirror from 'react-codemirror';
import 'codemirror/addon/display/autorefresh.js';
import Menu from '../../Editor/components/shared/menu/menu.jsx';
import MenuItem from '../../Editor/components/shared/menu/menuItem.jsx';
import MarginEditor from './helper/marginEditor.jsx';
import ColorEditor from './helper/colorEditor.jsx';
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
			afterJs,
			isVisible: false
		};
	}

	handleButtonClick = () => {
		console.log('called');
		this.setState({ isVisible: !this.state.isVisible });
	};

	onSelectorGlassClick = key => {
		let selectors = this.state.selectors;
		selectors[key].isVisible = false;
		this.setState({
			selectors
		});
	};

	saveSelectorCss = ({ key, css }) => {
		let selectors = this.state.selectors, selectorCss = selectors[key].css || '';
		selectorCss += css;
		selectors[key].css = selectorCss;
		this.setState({
			selectors
		});
	};
	onSelectorArrayGlassClick = (key, index) => {
		let selectors = this.state.selectors;
		selectors[key][index].isVisible = false;
		this.setState({
			selectors
		});
	};

	saveSelectorArrayCss = ({ key, css, index }) => {
		let selectors = this.state.selectors, selectorCss = css;
		selectors[key][index].css = selectorCss;
		this.setState({
			selectors
		});
	};

	renderSelector = key => {
		let selectorConf = commonConsts.pagegroupSelectors,
			selectorValue = (this.state.selectors[key] && this.state.selectors[key].value) || '';
		return (
			<RowColSpan label={selectorConf[key].alias} key={key}>
				<input
					onChange={e => {
						let selectors = this.state.selectors;
						selectors[e.target.name] = selectors[e.target.name] || {};
						selectors[e.target.name].value = e.target.value;
						this.setState({
							selectors
						});
					}}
					className="blockListInput"
					type="text"
					name={key}
					defaultValue={selectorValue}
				/>
				<button
					className="fa fa-code blockListDelete"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key] = selectors[key] || {};
						selectors[key].isVisible = true;
						this.setState({
							selectors
						});
					}}
				/>
				{this.state.selectors[key] && this.state.selectors[key].isVisible
					? <Menu
							id="channelMenu"
							position={{ top: 43 }}
							arrow="none"
							onGlassClick={() => this.onSelectorGlassClick(key)}
						>
							<MenuItem icon={'fa fa-th'} contentHeading="" key={1}>
								<MarginEditor
									css={this.state.selectors[key] && this.state.selectors[key].css}
									onCancel={() => this.onSelectorGlassClick(key)}
									handleSubmit={css => this.saveSelectorCss({ key, css })}
								/>
							</MenuItem>
							<MenuItem icon={'fa fa-pencil'} contentHeading="" key={2}>
								<ColorEditor
									css={this.state.selectors[key] && this.state.selectors[key].css}
									onCancel={() => this.onSelectorGlassClick(key)}
									handleSubmit={css => this.saveSelectorCss({ key, css })}
								/>
							</MenuItem>

						</Menu>
					: ''}

			</RowColSpan>
		);
	};

	renderArraySelector = (key, index) => {
		let selectorConf = commonConsts.pagegroupSelectors,
			selectorValue = (this.state.selectors[key][index] && this.state.selectors[key][index].value) || '';
		return (
			<div key={index}>
				<input
					onChange={e => {
						let selectors = this.state.selectors;
						selectors[key][index].value = e.target.value;
						this.setState({
							selectors
						});
					}}
					className="selectorInput"
					type="text"
					name={key}
					defaultValue={selectorValue}
				/>
				<button
					className="fa fa-code selectorDelete"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key][index].isVisible = true;
						this.setState({
							selectors
						});
					}}
				/>
				<button
					className="fa fa-trash selectorDelete"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key].splice(index, 1);
						this.setState({
							selectors
						});
					}}
				/>

				{this.state.selectors[key] && this.state.selectors[key][index].isVisible
					? <Menu
							id="channelMenu"
							position={{ top: 43 }}
							arrow="none"
							onGlassClick={() => this.onSelectorArrayGlassClick(key, index)}
						>
							<MenuItem icon={'fa fa-th'} contentHeading="" key={1}>
								<MarginEditor
									css={this.state.selectors[key][index] && this.state.selectors[key][index].css}
									onCancel={() => this.onSelectorArrayGlassClick(key, index)}
									handleSubmit={css => this.saveSelectorArrayCss({ key, css, index })}
								/>
							</MenuItem>
							<MenuItem icon={'fa fa-pencil'} contentHeading="" key={2}>
								<ColorEditor
									css={this.state.selectors[key][index] && this.state.selectors[key][index].css}
									onCancel={() => this.onSelectorArrayGlassClick(key, index)}
									handleSubmit={css => this.saveSelectorArrayCss({ key, css, index })}
								/>
							</MenuItem>

						</Menu>
					: ''}

			</div>
		);
	};

	renderSelectors = () => {
		let selectorConf = commonConsts.pagegroupSelectors;
		return Object.keys(selectorConf).map(key => {
			if (selectorConf[key].inputType == 'text') return this.renderSelector(key);
			else {
				return (
					<RowColSpan label={selectorConf[key].alias} key={key}>
						{this.state.selectors[key] &&
							this.state.selectors[key].map((value, index) => this.renderArraySelector(key, index))}
						<button
							className="btn-primary addButton"
							type="button"
							onClick={() => {
								let selectors = this.state.selectors;
								selectors[key] = selectors[key] || [];
								selectors[key].push({});
								this.setState({ selectors });
							}}
						>
							+ Add
						</button>
					</RowColSpan>
				);
			}
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
			alert('Article Content, SiteName and Template are required');
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
					<CollapsePanel title="Selector Setting" className="mediumFontSize" noBorder={true}>
						{this.renderSelectors()}
					</CollapsePanel>
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
