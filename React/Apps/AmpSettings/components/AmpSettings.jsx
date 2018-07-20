import React from 'react';
import ActionCard from '../../../Components/ActionCard.jsx';
import Loader from '../../../Components/Loader.jsx';
import Heading from './helper/Heading.jsx';
import PageGroupSettings from './PageGroupSettings.jsx';
import SendAmpData from './SendAmpData.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import commonConsts from '../lib/commonConsts';
import { ajax } from '../../../common/helpers';
import { Row, Col, Button } from 'react-bootstrap';
class AmpSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			channels: [],
			blockList: [],
			isLoading: true,
			selectedAnalytics: 'google_analytics'
		};
		this.fetchAmpSettings = this.fetchAmpSettings.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.renderInputControl = this.renderInputControl.bind(this);
		this.renderBlockList = this.renderBlockList.bind(this);
		this.saveSiteSettings = this.saveSiteSettings.bind(this);
		this.renderAnalyticsFields = this.renderAnalyticsFields.bind(this);
	}
	fetchAmpSettings() {
		let arr = window.location.href.split('/'), siteId = arr[arr.length - 2];
		ajax({
			method: 'GET',
			url: '/user/site/' + siteId + '/ampSettingsData'
		})
			.then(res => {
				console.log(res);
				this.setState({
					siteId: res.siteId,
					siteDomain: res.siteDomain,
					channels: res.channels || [],
					blockList: res.ampSettings.blockList || [],
					samplingPercent: res.ampSettings.samplingPercent,
					isLoading: false,
					analytics: res.ampSettings.analytics || []
				});
			})
			.catch(res => {
				console.log(res);
				alert('Some Error Occurred In fetching amp settings!');
			});
	}
	handleOnChange(e) {
		const target = e.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value });
	}
	renderBlockList() {
		let linkViews = new Array(this.state.blockList);
		const listItems = this.state.blockList.map((linkView, index) => {
			return (
				<div key={index}>
					<input
						onChange={e => {
							let blockList = this.state.blockList;
							blockList[index] = e.target.value;
							this.setState({
								blockList
							});
						}}
						style={{ width: 'auto' }}
						type="text"
						placeholder="URL or RegExp"
						name="name"
						value={this.state.blockList[index]}
					/> <i
						style={{ width: 'auto', cursor: 'pointer', float: 'right' }}
						className="fa fa-trash fa-2x col-sm-2"
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
		return (
			<Col sm={7}>
				{listItems}
			</Col>
		);
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
						value={value || ''}
					/>
				</Col>
			</Row>
		);
	}
	componentDidMount() {
		this.fetchAmpSettings();
	}
	saveSiteSettings(event) {
		event.preventDefault();
		let { siteId } = this.state;
		ajax({
			method: 'POST',
			url: '/user/site/' + siteId + '/saveAmpSettings',
			data: JSON.stringify({
				samplingPercent: this.state.samplingPercent,
				blockList: this.state.blockList,
				analytics: this.state.analytics
			})
		})
			.then(res => {
				alert('Settings Saved Successfully!');
			})
			.catch(res => {
				alert('Some Error Occurred!');
			});
	}
	renderAnalyticsFields() {
		let fields = commonConsts.analytics[this.state.selectedAnalytics];
		if (this.state.selectedAnalytics)
			return Object.keys(fields).map((field, index) => {
				let alias = fields[field].alias;
				return (
					<input
						type="text"
						placeholder={alias}
						key={index}
						value={this.state.analytics.length > 0 ? this.state.analytics[0][field] : ''}
						onChange={e => {
							let analytics = [{ name: this.state.selectedAnalytics, [field]: e.target.value }];
							this.setState({
								analytics
							});
						}}
					/>
				);
			});
		else return '';
	}
	render() {
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
										<Row>
											<Col sm={5}>
												<span>BlockList</span>
												<button
													style={{ width: 'auto', marginLeft: 10 }}
													className="btn-primary"
													type="button"
													onClick={() => {
														let blockList = this.state.blockList;
														blockList.push('');
														this.setState({ blockList });
													}}
												>
													+ Add
												</button>
											</Col>
											{this.renderBlockList()}
										</Row>
										<RowColSpan label="Analytics">
											<Col sm={6}>
												<select
													className="form-control"
													name="selectedAnalytics"
													value={this.state.selectedAnalytics}
													onChange={e => {
														let selectedAnalytics = this.state.selectedAnalytics;
														selectedAnalytics = e.target.value;
														this.setState({ selectedAnalytics });
													}}
												>
													<option value="">Select Type</option>
													{Object.keys(commonConsts.analytics).map((analytic, index) => {
														//let field = commonConsts.analytics[analytic];
														return (
															<option value={analytic} key={index}>
																{analytic}
															</option>
														);
													})}
												</select>
											</Col>
											<Col sm={6}>
												{this.renderAnalyticsFields()}
											</Col>
										</RowColSpan>
										<Button className="btn-success" type="submit">
											Save
										</Button>
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
											<PageGroupSettings
												channel={channel}
												siteId={this.state.siteId}
												key={channel.pageGroup}
											/>
										);
									})}
								</Col>
							</Row>
						</div>
					</ActionCard>
				</Row>
			);
	}
}

export default AmpSettings;
