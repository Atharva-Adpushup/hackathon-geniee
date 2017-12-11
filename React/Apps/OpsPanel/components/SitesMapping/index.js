import React, { Component } from 'react';
import _ from 'lodash';
import clipboard from 'clipboard-polyfill';
import moment from 'moment';
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Datatable from 'react-bs-datatable';
import '../../../ReportingPanel/styles.scss';
import { siteMapping } from '../../configs/commonConsts';
import { ajax } from '../../../../common/helpers';
import ActionCard from '../../../../Components/ActionCard.jsx';
import Badges from '../../../../Components/Badges.jsx';
import SelectBox from '../../../../Components/SelectBox/index.jsx';

const { labels, headers, modes, statuses } = siteMapping;
class SitesMapping extends Component {
	constructor(props) {
		super(props);
		let loaded = this.props.sites && this.props.sites.length ? true : false;
		this.state = {
			loaded: loaded,
			tableConfig: loaded ? this.generateTableData(this.props.sites) : null,
			hasSites: loaded,
			mode: null,
			status: null,
			totalSites: loaded ? this.props.sites.length : 0
		};
		this.generateStatus = this.generateStatus.bind(this);
		this.generateClickableSpan = this.generateClickableSpan.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.modeChangeHandler = this.modeChangeHandler.bind(this);
		this.statusChangeHandler = this.statusChangeHandler.bind(this);
	}

	componentDidMount() {
		this.state.loaded ? null : this.props.fetchSites();
	}

	componentWillReceiveProps(nextProps) {
		let hasSites = nextProps.sites && nextProps.sites.length ? true : false,
			tableConfig = hasSites ? this.generateTableData(nextProps.sites) : {},
			totalSites = hasSites ? nextProps.sites.length : 0;

		this.setState({ loaded: true, hasSites, tableConfig, totalSites });
	}

	generateStatus(step) {
		let className = 'pre-onboarding',
			label = 'Pre Onboarding';
		if (step >= 1 && step < 3) {
			className = 'onboarding';
			label = 'Onboarding';
		} else if (step >= 3) {
			className = 'onboarded';
			label = 'Onboarded';
		}
		return <Badges iterable={[label]} labelClasses={className} />;
	}

	generateMode(mode) {
		let className = 'draft',
			label = 'Draft';
		if (mode == 1) {
			className = 'live';
			label = 'Live';
		}
		return <Badges iterable={[label]} labelClasses={className} />;
	}

	clickHandler(e) {
		let ele = e.target,
			type = ele.getAttribute('data-type'),
			value = ele.getAttribute('data-value'),
			extra = ele.getAttribute('data-extra'),
			toCopy = 'Ha Ha Ha!';

		if (type == 'site') {
			toCopy = `site::${value}`;
		} else if (type == 'pagegroup') {
			toCopy = `chn::${extra}:${value}`;
		} else if (type == 'email') {
			toCopy = `user::${value}`;
		}

		clipboard.writeText(toCopy);
		alert('Text Copied: ' + toCopy);
	}

	generateClickableSpan(type, value, clickHandler) {
		return (
			<span onClick={clickHandler} data-type={type} data-value={value} className="pointer">
				{value}
			</span>
		);
	}

	modeChangeHandler(mode = 0) {
		mode = mode == null ? 0 : mode;
		let sites = mode == 0 ? this.props.sites : this.props.sites.filter(site => site.apConfigs.mode == mode);
		this.setState({
			tableConfig: this.generateTableData(sites),
			mode: mode
		});
	}

	statusChangeHandler(status = 0) {
		status = status == null ? 0 : status;
		let sites;
		if (status == 0) {
			sites = this.props.sites;
		} else if (status == 1) {
			// Pre onboarding
			sites = this.props.sites.filter(site => !site.step);
		} else if (status == 2) {
			// Onboarding
			sites = this.props.sites.filter(site => site.step >= 1 && site.step < 3);
		} else {
			// Onboarded
			sites = this.props.sites.filter(site => site.step >= 3);
		}
		this.setState({
			tableConfig: this.generateTableData(sites),
			status: status
		});
	}

	generateTableData(sites) {
		let tableConfig = {
			headers: headers,
			data: []
		};
		tableConfig.data = _.map(sites, site => {
			let rs =
				site.adNetworkSettings && site.adNetworkSettings.revenueShare
					? site.adNetworkSettings.revenueShare
					: false;
			return {
				[labels['siteId']]: this.generateClickableSpan('site', site.siteId, this.clickHandler),
				[labels['siteDomain']]: (
					<Link
						to={{
							pathname: `/ops/settings/${site.siteId}`,
							state: {
								rs: rs
							}
						}}
					>
						{site.siteDomain}
					</Link>
				),
				[labels['ownerEmail']]: this.generateClickableSpan('email', site.ownerEmail, this.clickHandler),
				[labels['mode']]: this.generateMode(site.apConfigs.mode),
				[labels['channels']]:
					site.channels && site.channels.length ? (
						<Badges
							iterable={site.channels}
							labelClasses="channels pointer"
							clickHandler={this.clickHandler}
							type="pagegroup"
							extra={site.siteId}
						/>
					) : (
						'No channels'
					),
				[labels['pubId']]: site.pubId || 'Oauth not present',
				[labels['adsenseEmail']]: site.adsenseEmail || 'Oauth not present',
				[labels['step']]: this.generateStatus(site.step),
				[labels['dateCreated']]: moment(site.dateCreated).format('DD-MM-YYYY')
			};
		});
		return tableConfig;
	}

	renderAggregatedData() {
		return this.state.tableConfig.data ? (
			<div>
				<Breadcrumb>
					<Breadcrumb.Item>Total Sites : {this.state.totalSites}</Breadcrumb.Item>
					<Breadcrumb.Item>Current Records : {this.state.tableConfig.data.length}</Breadcrumb.Item>
				</Breadcrumb>
			</div>
		) : (
			''
		);
	}

	renderSelect(value, label, changeHandler, array, disabled) {
		return (
			<div>
				<p>{label}</p>
				<SelectBox
					value={value}
					label={label}
					onChange={changeHandler}
					onClear={changeHandler}
					disabled={disabled}
				>
					{array.map((ele, index) => (
						<option key={index} value={ele.value}>
							{ele.name}
						</option>
					))}
				</SelectBox>
			</div>
		);
	}

	renderFilters() {
		return (
			<div>
				<Col xs={3}>
					{this.renderSelect(
						this.state.mode,
						'Select Mode',
						this.modeChangeHandler,
						modes,
						this.state.status
					)}
				</Col>
				<Col xs={3}>
					{this.renderSelect(
						this.state.status,
						'Select Status',
						this.statusChangeHandler,
						statuses,
						this.state.mode
					)}
				</Col>
			</div>
		);
	}

	render() {
		return (
			<ActionCard title="Sites Mapping">
				{this.state.loaded ? (
					this.state.hasSites ? (
						<div className="report-table">
							<Row className="pdAll-10">
								{this.renderAggregatedData()}
								{this.renderFilters()}
							</Row>
							<Datatable
								tableHeader={this.state.tableConfig.headers}
								tableBody={this.state.tableConfig.data}
								keyName="reportTable"
								rowsPerPage={20}
								rowsPerPageOption={[10, 15, 20, 25, 30, 35, 40, 45, 50]}
							/>
						</div>
					) : (
						'Not sites Available'
					)
				) : (
					'Loading Data...'
				)}
			</ActionCard>
		);
	}
}

export default SitesMapping;
