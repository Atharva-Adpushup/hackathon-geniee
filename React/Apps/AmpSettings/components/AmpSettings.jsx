import React from 'react';
import ActionCard from '../../../Components/ActionCard.jsx';
import Loader from '../../../Components/Loader.jsx';
import Heading from './helper/Heading.jsx';
import PageGroupSettings from './PageGroupSettings.jsx';
import SendAmpData from './SendAmpData.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import commonConsts from '../lib/commonConsts';
import Select from 'react-select';
import { ajax } from '../../../common/helpers';
import MenuSettings from './MenuSettings.jsx';
import FooterSettings from './FooterSettings.jsx';
import { Row, Col, Button } from 'react-bootstrap';
import '../style.scss';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import Menu from '../../Editor/components/shared/menu/menu.jsx';
import MenuItem from '../../Editor/components/shared/menu/menuItem.jsx';
import MarginEditor from './helper/marginEditor.jsx';
import ColorEditor from './helper/colorEditor.jsx';
class AmpSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			selectedAnalytics: [],
			selectors: {}
		};
	}
	fetchAmpSettings = () => {
		let arr = window.location.href.split('/'), siteId = arr[arr.length - 2];
		ajax({
			method: 'GET',
			url: '/user/site/' + siteId + '/ampSettingsData'
		})
			.then(res => {
				let { siteId, siteDomain, channels, ampSettings = {} } = res;
				let selectedAnalytics = [], fetchedAnalyticsData = ampSettings.analytics || [];
				for (let i = 0; i < fetchedAnalyticsData.length; i++) {
					let name = fetchedAnalyticsData[i].name, analyticData = fetchedAnalyticsData[i];
					delete analyticData.name;
					selectedAnalytics.push({ label: name, value: name, fields: analyticData });
				}
				this.setState({
					siteId: siteId,
					siteDomain: siteDomain,
					channels: channels || [],
					blockList: ampSettings.blockList || [],
					samplingPercent: ampSettings.samplingPercent,
					selectors: ampSettings.selectors || {},
					isLoading: false,
					selectedAnalytics,
					menu: ampSettings.menu || { links: [], include: false, position: 'right' },
					footer: ampSettings.footer || { include: false, label: 'AMP by AdPushUp' }
				});
			})
			.catch(res => {
				console.log(res);
				alert('Some Error Occurred In fetching amp settings!');
			});
	};
	handleOnChange = e => {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
	};
	renderBlockList = () => {
		let linkViews = new Array(this.state.blockList);
		const listItems = this.state.blockList.map((linkView, index) => {
			return (
				<div className="mB-5" key={index}>
					<input
						onChange={e => {
							let blockList = this.state.blockList;
							blockList[index] = e.target.value;
							this.setState({
								blockList
							});
						}}
						className="blockListInput"
						type="text"
						placeholder="URL or RegExp"
						name="name"
						value={this.state.blockList[index]}
					/> <button
						className="fa fa-trash blockListDelete mL-10"
						type="button"
						onClick={() => {
							let blockList = this.state.blockList;
							blockList.splice(index, 1);
							this.setState({
								blockList
							});
						}}
					/>
				</div>
			);
		});
		return <div>{listItems}</div>;
	};
	renderInputControl = (label, name, value) => {
		return (
			<RowColSpan label={label} className="mediumFontSize">
				<input
					onChange={this.handleOnChange}
					className="form-control"
					type="text"
					placeholder={label}
					name={name}
					value={value || ''}
				/>
			</RowColSpan>
		);
	};
	componentDidMount = () => {
		this.fetchAmpSettings();
	};
	saveSiteSettings = event => {
		event.preventDefault();
		let finalData = JSON.parse(JSON.stringify(this.state)),
			{ siteId, menu, selectedAnalytics, selectors } = finalData,
			dataLinks = menu.links,
			analytics = [];
		for (let i = dataLinks.length - 1; i >= 0; i--) {
			if (!dataLinks[i].name || !dataLinks[i].link) dataLinks.splice(i, 1);
		}
		for (let i = 0; i < selectedAnalytics.length; i++) {
			let analytic = { name: selectedAnalytics[i].value, ...selectedAnalytics[i].fields };
			analytics.push(analytic);
		}
		Object.keys(selectors).map(key => {
			if (typeof selectors[key] == 'object') {
				delete selectors[key].isVisible;
			}
		});
		ajax({
			method: 'POST',
			url: '/user/site/' + siteId + '/saveAmpSettings',
			data: JSON.stringify({
				samplingPercent: finalData.samplingPercent,
				blockList: finalData.blockList,
				analytics: analytics,
				menu: finalData.menu,
				footer: finalData.footer,
				selectors: finalData.selectors
			})
		})
			.then(res => {
				alert('Settings Saved Successfully!');
			})
			.catch(res => {
				alert('Some Error Occurred!');
			});
	};
	renderAnalyticsFields = () => {
		return this.state.selectedAnalytics.map((analytic, analyticIndex) => {
			let fields = commonConsts.analytics[analytic.value];
			return (
				<div key={analyticIndex} className="adContainerStyle">
					{Object.keys(fields).map((field, fieldIndex) => {
						let alias = fields[field].alias,
							value = this.state.selectedAnalytics[analyticIndex].fields[field];
						return (
							<RowColSpan label={alias} key={fieldIndex}>
								<input
									type="text"
									className="form-control"
									placeholder={alias}
									value={value || ''}
									required
									onChange={e => {
										let { selectedAnalytics } = this.state,
											selectedAnalytic = selectedAnalytics[analyticIndex];
										selectedAnalytic.fields[field] = e.target.value;
										this.setState({
											selectedAnalytics
										});
									}}
								/>
							</RowColSpan>
						);
					})}
				</div>
			);
		});
	};

	isAnalyticsSelected = analyticsName => {
		let { analytics } = this.state;
		for (let i = 0; i < analytics.length; i++) {
			if (analyticsName == analytics[i].name) return i;
		}
		return -1;
	};

	onSelectorGlassClick = key => {
		let selectors = this.state.selectors;
		selectors[key].isVisible = false;
		this.setState({
			selectors
		});
	};

	saveSelectorCss = ({ key, css }) => {
		let selectors = this.state.selectors;
		selectors[key].css = css;
		this.setState({
			selectors
		});
	};

	renderSelector = key => {
		let selectorConf = commonConsts.siteSelectors,
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
					className="fa fa-code blockListDelete mL-10"
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

	renderSelectors = () => {
		let selectorConf = commonConsts.siteSelectors;
		return Object.keys(selectorConf).map(key => {
			if (selectorConf[key].inputType == 'text') return this.renderSelector(key);
		});
	};

	render = () => {
		let analytics = Object.keys(commonConsts.analytics).map(function(key) {
			return { label: key, value: key, fields: {} };
		});

		if (this.state.isLoading) return <Loader />;
		else
			return (
				<Row>
					<ActionCard title="AMP settings">
						<div className="settings-pane">
							<Row>
								<Col sm={6}>
									<form onSubmit={this.saveSiteSettings}>
										<Heading title="Site Level Settings" />
										{this.renderInputControl(
											'Sampling Percentage',
											'samplingPercent',
											this.state.samplingPercent
										)}
										<RowColSpan label="BlockList" className="mediumFontSize">
											{this.renderBlockList()}
											<button
												className="btn-primary addButton"
												type="button"
												onClick={() => {
													let blockList = this.state.blockList;
													blockList.push('');
													this.setState({ blockList });
												}}
											>
												+ Add
											</button>
										</RowColSpan>

										<RowColSpan label="Analytics" className="mediumFontSize">
											<Select
												value={this.state.selectedAnalytics}
												isMulti={true}
												onChange={selectedAnalytics => {
													this.setState({
														selectedAnalytics
													});
												}}
												options={analytics}
												placeholder="Select Analytics"
											/>
										</RowColSpan>
										{this.renderAnalyticsFields()}
										<MenuSettings menu={this.state.menu} />
										<FooterSettings footer={this.state.footer} />
										<CollapsePanel
											title="Selectors Settings"
											className="mediumFontSize"
											noBorder={true}
										>
											{this.renderSelectors()}
										</CollapsePanel>
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
									<hr />

									<SendAmpData
										channels={this.state.channels}
										siteId={this.state.siteId}
										siteDomain={this.state.siteDomain}
									/>
								</Col>
								<Col sm={6}>
									<Heading title="Channel Level Settings" />
									{this.state.channels.map(channel => {
										return (
											<div key={channel.pageGroup}>
												<PageGroupSettings
													channel={channel}
													siteId={this.state.siteId}
													key={channel.pageGroup}
												/>
												<hr />
											</div>
										);
									})}
								</Col>
							</Row>
						</div>
					</ActionCard>
				</Row>
			);
	};
}

export default AmpSettings;
