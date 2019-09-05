/* eslint-disable guard-for-in */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import ReactTable from 'react-table';
import clonedeep from 'lodash/cloneDeep';
import 'react-table/react-table.css';
import { Glyphicon, Row } from 'react-bootstrap';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index';
import Loader from '../../../../Components/Loader/index';
import { copyToClipBoard } from '../../../../helpers/commonFunctions';
import CustomIcon from '../../../../Components/CustomIcon/index';
import { REPORT_DOWNLOAD_ENDPOINT } from '../../../Reporting/configs/commonConsts';
import { SITE_MAPPING_COLUMNS } from '../../configs/commonConsts';

class SiteMapping extends Component {
	constructor() {
		super();
		this.state = {
			data: [],
			filteredData: [],
			isLoading: false,
			selectAll: false,
			checked: [],
			selectedData: [],
			fileName: 'sites-stats'
		};
	}

	componentDidMount() {
		this.setState({ isLoading: true });
		return axiosInstance
			.get('/ops/allSitesStats')
			.then(res => {
				const { data = [] } = res.data;
				this.setState({ data, filteredData: data, isLoading: false });
			})
			.catch(() => {
				this.setState({ isLoading: false });
			});
	}

	handleChange = () => {
		const { filteredData } = this.state;
		const checkedCopy = [];
		this.setState({ selectAll: !this.state.selectAll }, () => {
			filteredData.forEach(() => {
				checkedCopy.push(this.state.selectAll);
			});
			this.setState({
				checked: checkedCopy,
				selectedData: this.state.selectAll ? [...filteredData] : []
			});
		});
	};

	handleSingleCheckboxChange = (index, e) => {
		const { checked, selectedData } = this.state;
		const checkedCopy = checked;
		// const select = selectedData;
		const { filteredData } = this.state;
		if (e.target.checked) {
			checkedCopy[index] = e.target.checked;
			selectedData.push(filteredData[index]);
		} else {
			checkedCopy[index] = e.target.checked;
			selectedData.splice(selectedData.indexOf(filteredData[index]), 1);
		}
		this.setState({
			checked: checkedCopy,
			selectedData,
			selectAll: selectedData.length === filteredData.length ? true : false
		});
	};

	getFilterBoxValues = key => {
		const { data } = this.state;
		const values = [...new Set([...data].map(val => val[key]))];

		return values.map(value => ({ name: value }));
	};

	handleFilters = filters => {
		const { data } = this.state;
		let filteredData = [...data];

		for (const prop in filters) {
			const filter = filters[prop];
			// eslint-disable-next-line no-prototype-builtins
			if (filters.hasOwnProperty(prop) && filter.values.length) {
				// eslint-disable-next-line no-continue

				filteredData = filteredData.filter(value => filter.values.indexOf(value[prop]) !== -1);
			}

			this.setState({
				filteredData,
				selectedData: [],
				checked: [],
				selectAll: false
			});
		}
	};

	filteredDataWithICcon = data => {
		data.forEach(val => {
			for (const key in val) {
				// eslint-disable-next-line no-prototype-builtins
				if (val.hasOwnProperty(key)) {
					val[key] === 'N/A' ||
					(key === 'onboardingStatus' ||
						key === 'dateCreated' ||
						key === 'activeStatus' ||
						key === 'revenueShare')
						? (val[key] = <span> {val[key]}</span>)
						: (val[key] = (
								<span>
									{val[key]}
									<CustomIcon
										icon="copy"
										onClick={copyToClipBoard}
										toReturn={val[key]}
										className="u-text-red u-margin-l3 u-cursor-pointer site-mapping-copy"
										title="copy content"
									/>
								</span>
						  ));
				}
			}
		});
		return data;
	};

	getDefaultPageSize = () => {
		const { filteredData: { length = 0 } = {} } = this.state;

		if (length < 5) return 5;
		if (length < 10) return 10;
		if (length < 20) return 20;
		if (length < 50) return 50;
		return 50;
	};

	renderFilterComponent() {
		return (
			<FilterBox
				onFilter={this.onFilter}
				availableFilters={[
					{
						name: 'Site Id',
						prop: 'siteId',
						values: this.getFilterBoxValues('siteId')
					},
					{
						name: 'Domain',
						prop: 'domain',
						values: this.getFilterBoxValues('domain')
					},
					{
						name: 'Owner Email',
						prop: 'accountEmail',
						values: this.getFilterBoxValues('accountEmail')
					},
					{
						name: 'Onboarding Status',
						prop: 'onboardingStatus',
						values: this.getFilterBoxValues('onboardingStatus')
					},
					{
						name: 'Active Status',
						prop: 'activeStatus',
						values: this.getFilterBoxValues('activeStatus')
					},
					{
						name: 'Date Created',
						prop: 'dateCreated',
						values: this.getFilterBoxValues('dateCreated')
					},
					{
						name: 'Active Products',
						prop: 'activeProducts',
						values: this.getFilterBoxValues('activeProducts')
					},
					{
						name: 'Active Bidders',
						prop: 'activeBidders',
						values: this.getFilterBoxValues('activeBidders')
					},
					{
						name: 'Inactive Bidders',
						prop: 'inactiveBidders',
						values: this.getFilterBoxValues('inactiveBidders')
					},
					{
						name: 'Rev Share',
						prop: 'revenueShare',
						values: this.getFilterBoxValues('revenueShare')
					},
					{
						name: 'Publisher Id',
						prop: 'publisherId',
						values: this.getFilterBoxValues('publisherId')
					},
					{
						name: 'Auth Email',
						prop: 'authEmail',
						values: this.getFilterBoxValues('authEmail')
					},
					{
						name: 'Ad Manager',
						prop: 'adManager',
						values: this.getFilterBoxValues('adManager')
					}
				]}
				handleFilters={this.handleFilters}
				className="u-margin-v5 u-margin-h4 "
			/>
		);
	}

	render() {
		const { isLoading, filteredData, selectedData, fileName, checked, selectAll } = this.state;
		let downloadLink;
		let csvData;
		const dataWithICon = clonedeep(filteredData);
		if (!selectedData || selectedData.length === 0) {
			csvData = btoa(JSON.stringify(filteredData));
			downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${csvData}&fileName=${fileName}`;
		} else {
			csvData = btoa(JSON.stringify(selectedData));
			downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${csvData}&fileName=${fileName}`;
		}

		const columns = [
			{
				Header: <input type="checkbox" onChange={this.handleChange} checked={selectAll} />,
				Cell: row => (
					<input
						type="checkbox"
						checked={checked[row.index]}
						onChange={e => this.handleSingleCheckboxChange(row.index, e)}
					/>
				),
				sortable: false,
				filterable: false,
				width: 50,
				maxWidth: 50,
				minWidth: 50
			},

			...SITE_MAPPING_COLUMNS
		];

		if (isLoading) return <Loader height="600px" classNames="u-margin-v3" />;

		return (
			<React.Fragment>
				<Row>
					<div className="col-md-10">{this.renderFilterComponent()}</div>
					<div className="col-md-2">
						<a
							href={downloadLink}
							style={{
								height: 33,
								paddingTop: 8
							}}
							className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r2 u-margin-t5"
						>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</a>
					</div>
				</Row>
				{!filteredData || filteredData.length === 0 ? (
					<Empty message=" No Data found " />
				) : (
					<ReactTable
						columns={columns}
						data={this.filteredDataWithICcon(dataWithICon)}
						filterable={false}
						showPaginationTop
						showPaginationBottom={false}
						className="u-padding-h3 u-padding-v2 site-mapping"
						defaultPageSize={this.getDefaultPageSize()}
						pageSizeOptions={[5, 10, 20, 25, 50, 100]}
					/>
				)}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
