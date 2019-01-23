import React, { Component } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import clipboard from 'clipboard-polyfill';
import moment from 'moment';
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import Datatable from 'react-bs-datatable';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import '../../../ReportingPanel/styles.scss';
import '../../styles.scss';
import { liveSites } from '../../configs/commonConsts';
import { ajax } from '../../../../common/helpers';
import ActionCard from '../../../../Components/ActionCard.jsx';
import PaneLoader from '../../../../Components/PaneLoader.jsx';

const { labels, headers } = liveSites;
class LiveSitesMapping extends Component {
	constructor(props) {
		super(props);
		let loaded = this.props.liveSites && this.props.liveSites.length ? true : false;
		this.state = {
			loaded: loaded,
			tableConfig: loaded ? this.generateTableData(this.props.liveSites) : null,
			hasSites: loaded,
			totalSites: loaded ? this.props.liveSites.length : 0,
			threshold: 0,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.generateClickableSpan = this.generateClickableSpan.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.renderAggregatedData = this.renderAggregatedData.bind(this);
		this.renderFilters = this.renderFilters.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.fetchLiveSites = this.fetchLiveSites.bind(this);
	}

	componentDidMount() {
		this.state.loaded
			? null
			: this.props.fetchLiveSites({
					threshold: this.state.threshold
				});
	}

	fetchLiveSites(reset = false) {
		this.setState({ loaded: false });
		this.props.fetchLiveSites({
			threshold: reset ? 0 : Number(this.state.threshold) < 0 ? 0 : Number(this.state.threshold),
			from: this.state.startDate,
			to: this.state.endDate
		});
		reset ? this.setState({ threshold: 0 }) : null;
	}

	componentWillReceiveProps(nextProps) {
		let hasSites = nextProps.liveSites && nextProps.liveSites.length ? true : false,
			tableConfig = hasSites ? this.generateTableData(nextProps.liveSites) : {},
			totalSites = hasSites ? nextProps.liveSites.length : 0;

		this.setState({ loaded: true, hasSites, tableConfig, totalSites });
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	clickHandler(e) {
		let ele = e.target,
			type = ele.getAttribute('data-type'),
			value = ele.getAttribute('data-value'),
			extra = ele.getAttribute('data-extra'),
			toCopy = 'Ha Ha Ha!';

		if (type == 'site') {
			toCopy = `site::${value}`;
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

	generateTableData(sites) {
		let tableConfig = {
			headers: headers,
			data: []
		};
		tableConfig.data = _.map(sites, site => {
			return {
				[labels['siteId']]: this.generateClickableSpan('site', site.siteid, this.clickHandler),
				[labels['name']]: <Link to={`/ops/settings/${site.siteid}`}>{site.name}</Link>,
				[labels['pageviews']]: site.pageviews,
				[labels['adpushup_impressions']]: site.adpushup_impressions,
				[labels['total_impressions']]: site.total_impressions,
				[labels['total_gross_revenue']]: site.total_gross_revenue,
				[labels['total_revenue']]: site.total_revenue
			};
		});
		return tableConfig;
	}

	renderAggregatedData() {
		return this.state.tableConfig.data ? (
			<div>
				<Breadcrumb>
					<Breadcrumb.Item>Total Sites : {this.state.totalSites}</Breadcrumb.Item>
					{/* <Breadcrumb.Item>Current Records : {this.state.tableConfig.data.length}</Breadcrumb.Item> */}
				</Breadcrumb>
			</div>
		) : (
			''
		);
	}

	renderFilters() {
		return (
			<div className="live-sites-filters">
				<Col xs={3}>
					<label style={{ display: 'block' }}>Minimum Pageviews</label>
					<input
						type="number"
						name="threshold"
						placeholder="0"
						value={this.state.threshold}
						onChange={ev => this.setState({ threshold: ev.target.value })}
						className="inputMinimal"
					/>
				</Col>
				<Col sm={4}>
					<label className="control-label" style={{ display: 'block' }}>
						Date Range
					</label>
					<DateRangePicker
						onDatesChange={this.datesUpdated}
						onFocusChange={this.focusUpdated}
						focusedInput={this.state.focusedInput}
						startDate={this.state.startDate}
						endDate={this.state.endDate}
						showDefaultInputIcon={true}
						hideKeyboardShortcutsPanel={true}
						showClearDates={true}
						minimumNights={0}
						displayFormat={'DD-MM-YYYY'}
						isOutsideRange={() => {}}
					/>
				</Col>
				<Col sm={5}>
					<label style={{ display: 'block' }}>&nbsp;</label>
					<button
						className="btn btn-lightBg btn-default btn-blue"
						style={{ minWidth: '30%' }}
						onClick={eve => this.fetchLiveSites()}
					>
						Generate
					</button>
					<button
						className="btn btn-lightBg btn-default"
						style={{ marginLeft: '10px', minWidth: '30%' }}
						onClick={this.fetchLiveSites.bind(null, true)}
					>
						Reset
					</button>
				</Col>
			</div>
		);
	}

	render() {
		return (
			<ActionCard title="Live Sites Mapping">
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
					<PaneLoader />
				)}
			</ActionCard>
		);
	}
}

export default LiveSitesMapping;
