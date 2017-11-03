import React, { Component } from 'react';
import _ from 'lodash';
import clipboard from 'clipboard-polyfill';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import '../../../ReportingPanel/styles.scss';
import Datatable from 'react-bs-datatable';
import { labels, headers } from '../../configs/commonConsts';
import { ajax } from '../../../../common/helpers';
import ActionCard from '../../../../Components/ActionCard.jsx';
import Badges from '../../../../common/Badges';

class SitesMapping extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			tableConfig: null,
			hasSites: this.props.sites.length ? true : false
		};
		this.generateStatus = this.generateStatus.bind(this);
		this.generateClickableSpan = this.generateClickableSpan.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
	}

	componentDidMount() {
		this.state.loaded ? null : this.props.fetchSites();
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

	generateTableData(sites) {
		let tableConfig = {
			headers: headers,
			data: []
		};
		tableConfig.data = _.map(sites, site => {
			return {
				[labels['siteId']]: this.generateClickableSpan('site', site.siteId, this.clickHandler),
				[labels['siteDomain']]: site.siteDomain,
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

	componentWillReceiveProps(nextProps) {
		let hasSites = nextProps.sites && nextProps.sites.length ? true : false,
			tableConfig = hasSites ? this.generateTableData(nextProps.sites) : {};

		this.setState({ loaded: true, hasSites: hasSites, tableConfig: tableConfig });
	}

	render() {
		return (
			<ActionCard title="Sites Mapping">
				{this.state.loaded ? (
					this.state.hasSites ? (
						<div className="report-table">
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
