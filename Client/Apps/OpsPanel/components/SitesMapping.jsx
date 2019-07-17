import React, { Component } from 'react';

import axiosInstance from '../../../helpers/axiosInstance';
import Loader from '../../../Components/Loader';
import Empty from '../../../Components/Empty/index';
import Tags from '../../../Components/Tags/index';
import CustomTable from '../../../Components/CustomTable/index';

import { SITES_MAPPING } from '../configs/commonConsts';

const { LABELS } = SITES_MAPPING;

class SitesMapping extends Component {
	state = {
		fetched: false,
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
						fetched: true,
						error: false,
						sites: data.data
					});
				})
				.catch(err => {
					console.log(err);
					this.setState({
						fetched: true,
						error: true
					});
				});
		}
	}

	renderData() {
		const { sites } = this.state;
		if (!sites.length) return <Empty />;
		const body = ['1', '2'];

		return <CustomTable headers={LABELS} body={body} />;
	}

	render() {
		const { fetched } = this.state;

		if (!fetched) {
			return <Loader />;
		}

		return <div className="report-table">{this.renderData()}</div>;
	}
}

export default SitesMapping;
