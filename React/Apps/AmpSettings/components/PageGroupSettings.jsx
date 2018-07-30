import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
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
	generateAdCode = ad => {
		let adNetwork = ad.type, adCode = commonConsts.ads.sampleAds[adNetwork] || '';
		if (adCode) {
			adCode = adCode.replace('dWidth', ad.width);
			adCode = adCode.replace('dHeight', ad.height);
			for (let field in ad.data) {
				adCode = adCode.replace(field, ad.data[field]);
			}
		}
		return adCode;
	};
	parseFormData = ampData => {
		let finalData = ampData, dataLinks = finalData.menu.links, dataAds = finalData.ads;
		let ads = [], links = [];
		for (let i = 0; i < dataLinks.length; i++) {
			if (dataLinks[i].name && dataLinks[i].link) links.push(dataLinks[i]);
		}
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
		finalData.menu.links = links;
		return finalData;
	};
	saveChannelSettings = event => {
		event.preventDefault();
		let ampData = this.parseFormData(JSON.parse(JSON.stringify(this.state))),
			pageGroup = this.props.channel.pageGroup;
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
	handleSocialAppChange = e => {
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
	};
	renderSocialApps = () => {
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
	renderLinks = () => {
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
	};
	renderNetworkInputs = index => {
		let selectedAd = this.state.ads[index],
			selectedNetwork = selectedAd.type,
			adsTypeFieldConf = commonConsts.ads.type[selectedNetwork];
		return selectedNetwork && adsTypeFieldConf
			? Object.keys(adsTypeFieldConf).map((field, fieldIndex) => (
					<RowColSpan label={field} key={fieldIndex}>
						<input
							type="text"
							placeholder={field}
							name={field}
							className="form-control"
							value={selectedAd.data[field] || ''}
							onChange={e => {
								let data = { ...selectedAd.data, [field]: e.target.value };
								//data[field] = e.target.value;
								let adCode = this.generateAdCode({ ...selectedAd, data });
								this.setAds(index, {
									data,
									adCode
								});
								//this.setState({ ads });
							}}
						/>
					</RowColSpan>
				))
			: null;
	};

	deleteAd = adIndex => {
		let ads = this.state.ads;
		ads.splice(adIndex, 1);
		this.setState({ ads });
	};

	insertNewAd = () => {
		let ads = this.state.ads;
		ads.push({ width: 100, height: 100, operations: 'INSERTBEFORE' });
		this.setState({ ads });
	};

	setAds = (index, partialAd) => {
		let ads = this.state.ads;
		ads[index] = Object.assign(ads[index], partialAd);
		let adCode = this.generateAdCode(ads[index]);
		ads[index].adCode = adCode;
		this.setState({ ads });
	};

	renderAds = () => {
		const deleteAdBtnStyle = {
			position: 'absolute',
			right: '-8px',
			top: '-8px',
			cursor: 'pointer'
		},
			adContainerStyle = {
				background: '#f9f9f9',
				padding: '20px 10px 10px',
				margin: 10,
				borderRadius: 4,
				border: '1px solid #e9e9e9',
				position: 'relative'
			};
		return (
			<div>
				<Heading title="Ad Settings" />
				{this.state.ads.map((ad, index) => {
					return (
						<div key={index} style={adContainerStyle}>
							<div
								style={deleteAdBtnStyle}
								className="fa fa-times-circle fa-2x"
								onClick={() => this.deleteAd(index)}
								title="Delete This Ad"
							/>
							<RowColSpan label="Selector">
								<input
									onChange={e => {
										this.setAds(index, { selector: e.target.value });
									}}
									type="text"
									placeholder="Selector"
									name="selector"
									className="form-control"
									value={ad.selector || ''}
								/>
							</RowColSpan>
							<RowColSpan label="Width">
								<input
									onChange={e => {
										this.setAds(index, { width: e.target.value });
									}}
									type="number"
									placeholder="Width"
									name="width"
									className="form-control"
									value={ad.width}
								/>
							</RowColSpan>
							<RowColSpan label="Height">
								<input
									onChange={e => {
										this.setAds(index, { height: e.target.value });
									}}
									type="number"
									placeholder="Height"
									name="height"
									className="form-control"
									value={ad.height}
								/>
							</RowColSpan>
							<RowColSpan label="Operation">
								<select
									className="form-control"
									name="operation"
									value={ad.operation || 'INSERTAFTER'}
									onChange={e => {
										this.setAds(index, { operation: e.target.value });
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
							<RowColSpan label="Type">
								<select
									className="form-control"
									name="type"
									value={ad.type || ''}
									onChange={e => {
										let partialAd = {}, type = e.target.value, adFields = commonConsts.ads.type;

										partialAd.type = type;
										if (ad.type === 'custom') {
											partialAd.adCode = '';
										}
										if (adFields[type]) {
											partialAd.data = {};
										}
										this.setAds(index, partialAd);
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
							{ad.type &&
								<RowColSpan label="AdCode">
									<textarea
										style={{ resize: 'both', overflow: 'auto' }}
										onChange={e => {
											this.setAds(index, { adCode: e.target.value });
										}}
										placeholder="AdCode"
										name="adCode"
										className="form-control"
										value={ad.adCode}
										disabled={ad.type != 'custom'}
									/>
								</RowColSpan>}
						</div>
					);
				})}
				<Row>
					<Col sm={12}>
						<button className="btn-primary" type="button" onClick={this.insertNewAd}>
							+ Add New Ad
						</button>
					</Col>
				</Row>
			</div>
		);
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
					{this.renderAds()}
					<button className="btn-success">Save</button>
				</form>
			</CollapsePanel>
		);
	};
}

export default PageGroupSettings;
