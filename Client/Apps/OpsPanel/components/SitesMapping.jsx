/* eslint-disable no-console */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable no-alert */
import React, { Component } from 'react';
// import _ from 'lodash';
// import clipboard from 'clipboard-polyfill';
// import moment from 'moment';
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Datatable from 'react-bs-datatable';
import { copyToClipBoard, formatDate } from '../../../helpers/commonFunctions';

// import '../../../ReportingPanel/styles.scss';
import { SITES_MAPPING } from '../configs/commonConsts';
// import Badges from '../../../../Components/Badges.jsx';
// import SelectBox from '../../../../Components/SelectBox/index.jsx';
import SelectBox from '../../../Components/Selectbox/index';
import axiosInstance from '../../../helpers/axiosInstance';

import Loader from '../../../Components/Loader';
import Empty from '../../../Components/Empty/index';
import Tags from '../../../Components/Tags/index';

const { LABELS, HEADERS, MODES, STATUSES } = SITES_MAPPING;

class SitesMapping extends Component {
	state = {
		fetched: false,
		tableConfig: {},
		sites: [],
		error: false,
		// hasSites: loaded,
		mode: undefined,
		status: undefined,
		totalSites: undefined
	};

	componentDidMount() {
		const { fetched } = this.state;

		if (!fetched) {
			axiosInstance
				.get('/ops/getAllSites')
				.then(response => {
					const { data } = response;
					this.setState({
						sites: data
					});
				})
				.catch(err => {
					console.log(err);
					this.setState({
						error: true
					});
				});
		}
	}

	generateStatus = step => {
		let className = 'pre-onboarding';
		let label = 'Pre Onboarding';

		if (step >= 1 && step < 3) {
			className = 'onboarding';
			label = 'Onboarding';
		} else if (step >= 3) {
			className = 'onboarded';
			label = 'Onboarded';
		}
		return <Tags labels={[label]} classNames={className} />;
	};

	generateMode = mode => {
		let className = 'draft';
		let label = 'Draft';

		if (mode === 1) {
			className = 'live';
			label = 'Live';
		}
		return <Tags labels={[label]} classNames={className} />;
	};

	clickHandler = e => {
		const ele = e.target;
		const type = ele.getAttribute('data-type');
		const value = ele.getAttribute('data-value');
		const extra = ele.getAttribute('data-extra');

		let toCopy = 'Ha Ha Ha!';

		if (type === 'site') {
			toCopy = `site::${value}`;
		} else if (type === 'pagegroup') {
			toCopy = `chnl::${extra}:${value}`;
		} else if (type === 'email') {
			toCopy = `user::${value}`;
		}

		copyToClipBoard(toCopy);
		return window.alert(`Text Copied: ${toCopy}`);
	};

	generateClickableSpan = (type, value, clickHandler) => (
		<span
			onClick={clickHandler}
			data-type={type}
			data-value={value}
			className="pointer"
			role="button"
		>
			{value}
		</span>
	);

	modeChangeHandler(mode = 0) {
		const siteMode = mode === null ? 0 : mode;

		const { sites: sitesFromState } = this.state;
		const sites =
			siteMode === 0 ? sitesFromState : sitesFromState.filter(site => site.apConfigs.mode === mode);

		this.setState({
			tableConfig: this.generateTableData(sites),
			mode
		});
	}

	// statusChangeHandler(status = 0) {
	// 	status = status == null ? 0 : status;
	// 	let sites;
	// 	if (status === 0) {
	// 		sites = this.props.sites;
	// 	} else if (status === 1) {
	// 		// Pre onboarding
	// 		sites = this.props.sites.filter(site => !site.step);
	// 	} else if (status === 2) {
	// 		// Onboarding
	// 		sites = this.props.sites.filter(site => site.step >= 1 && site.step < 3);
	// 	} else {
	// 		// Onboarded
	// 		sites = this.props.sites.filter(site => site.step >= 3);
	// 	}
	// 	this.setState({
	// 		tableConfig: this.generateTableData(sites),
	// 		status
	// 	});
	// }

	generateTableData(sites) {
		const tableConfig = {
			headers: HEADERS,
			data: []
		};
		tableConfig.data = sites.map(site => {
			const rs =
				site.adNetworkSettings && site.adNetworkSettings.revenueShare
					? site.adNetworkSettings.revenueShare
					: false;
			return {
				[LABELS.siteId]: this.generateClickableSpan('site', site.siteId, this.clickHandler),
				[LABELS.siteDomain]: (
					<Link
						to={{
							pathname: `/ops/settings/${site.siteId}`,
							state: {
								rs
							}
						}}
					>
						{site.siteDomain}
					</Link>
				),
				[LABELS.ownerEmail]: this.generateClickableSpan(
					'email',
					site.ownerEmail,
					this.clickHandler
				),
				[LABELS.mode]: this.generateMode(site.apConfigs.mode),
				[LABELS.channels]:
					site.channels && site.channels.length ? (
						<Tags
							labels={site.channels}
							classNames="channels pointer"
							clickHandler={this.clickHandler}
							additionalProps={{
								type: 'pagegroup',
								'data-site-id': site.siteId
							}}
						/>
					) : (
						'No channels'
					),
				[LABELS.pubId]: site.pubId || 'Oauth not present',
				[LABELS.adsenseEmail]: site.adsenseEmail || 'Oauth not present',
				[LABELS.step]: this.generateStatus(site.step),
				[LABELS.dateCreated]: formatDate(site.dateCreated)
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

	renderData() {
		const { sites } = this.state;
		if (!sites.length) return <Empty />;

		const tableConfig = this.generateTableData(sites);
		return (
			<Datatable
				tableHeader={tableConfig.headers}
				tableBody={tableConfig.data}
				keyName="reportTable"
				rowsPerPage={20}
				rowsPerPageOption={[10, 15, 20, 25, 30, 35, 40, 45, 50]}
			/>
		);
	}

	render() {
		const { fetched } = this.state;

		if (!fetched) {
			return <Loader />;
		}

		return (
			<div className="report-table">
				{/* <Row className="pdAll-10">
					{this.renderAggregatedData()}
					{this.renderFilters()}
				</Row> */}
				{this.renderData()}
			</div>
		);
	}
}

export default SitesMapping;
