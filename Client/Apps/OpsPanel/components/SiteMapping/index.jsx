import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { Glyphicon, Row } from 'react-bootstrap';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index.jsx';
import Loader from '../../../../Components/Loader/index';
import { copyToClipBoard } from '../../../../helpers/commonFunctions';
import CustomIcon from '../../../../Components/CustomIcon/index';

class SiteMapping extends Component {
	state = {
		data: [],
		filteredData: [],
		isLoading: false,
		selectAll: false,
		checked: [],
		selectedData: []
	};

	componentDidMount() {
		this.setState({ isLoading: true });
		return axiosInstance
			.get('/ops/allSitesStats')
			.then(res => {
				const { data } = res.data;
				this.setState({ data, filteredData: data, isLoading: false });
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false });
			});
	}

	handleChange = () => {
		const { filteredData } = this.state;
		const checkedCopy = [];
		const selectAll = !this.state.selectAll;
		this.setState({ selectAll });
		filteredData.forEach(() => {
			checkedCopy.push(selectAll);
		});
		this.setState({
			checked: checkedCopy,
			selectedData: filteredData
		});
	};

	handleSingleCheckboxChange = index => {
		// const { filteredData } = this.state;
		const checkedCopy = this.state.checked;
		checkedCopy[index] = !this.state.checked[index];
		if (checkedCopy[index] === false) {
			this.setState({ selectAll: false });
		}

		this.setState({
			checked: checkedCopy
			// selectedData: filteredData[index]
		});
	};

	getFilterBoxValues = key => {
		const { data } = this.state;
		const values = [...new Set([...data].map(data => data[key]))];

		return values.map(value => ({ name: value }));
	};

	handleFilters = filters => {
		const { data } = this.state;
		let filteredData = [...data];

		for (const prop in filters) {
			const filter = filters[prop];
			// eslint-disable-next-line no-continue
			if (filter.values.length)
				filteredData = filteredData.filter(value => filter.values.indexOf(value[prop]) !== -1);
		}

		this.setState({ filteredData });
	};

	filteredDataWithICcon = () => {
		const { filteredData } = this.state;
		const newObj = {};
		const newArray = [];
		filteredData.map(val => {
			for (const key in val) {
				newObj[key] =
					val[key] === 'N/A' ? (
						<span>{val[key]}</span>
					) : (
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
					);
			}
			newArray.push(newObj);
		});
		return newArray;
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

	exportData = () => (
		<a
			style={{
				height: 33,
				paddingTop: 8
			}}
			className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r2 u-margin-t5"
		>
			<Glyphicon glyph="download-alt u-margin-r2" />
			Export Report
		</a>
	);

	render() {
		const { isLoading, filteredData } = this.state;
		const columns = [
			{
				Header: (
					<input type="checkbox" onChange={this.handleChange} checked={this.state.selectAll} />
				),
				Cell: row => (
					<input
						type="checkbox"
						defaultChecked={this.state.checked[row.index]}
						checked={this.state.checked[row.index]}
						onChange={() => this.handleSingleCheckboxChange(row.index)}
					/>
				),
				sortable: false,
				filterable: false,
				width: 50,
				maxWidth: 50,
				minWidth: 50
			},

			{
				Header: 'Site ID',
				accessor: 'siteId',
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				Header: 'Domain',
				accessor: 'domain'
			},
			{
				Header: 'Owner Email',
				accessor: 'accountEmail'
			},
			{
				Header: 'Onboarding Status',
				accessor: 'onboardingStatus',
				width: 200,
				maxWidth: 200,
				minWidth: 200
			},
			{
				Header: 'Active Status',
				accessor: 'activeStatus',
				width: 120,
				maxWidth: 120,
				minWidth: 120
			},
			{
				Header: 'Date Created',
				accessor: 'dateCreated',
				width: 120,
				maxWidth: 120,
				minWidth: 120
			},
			{
				Header: 'Active Products',
				accessor: 'activeProducts',
				width: 150,
				maxWidth: 150,
				minWidth: 150
			},
			{
				Header: 'Active Bidders',
				accessor: 'activeBidders',
				width: 150,
				maxWidth: 150,
				minWidth: 150
			},
			{
				Header: 'Inactive Bidders',
				accessor: 'inactiveBidders',
				width: 150,
				maxWidth: 150,
				minWidth: 150
			},
			{
				Header: 'Rev Share',
				accessor: 'revenueShare'
			},
			{
				Header: 'Publisher Id',
				accessor: 'publisherId'
			},
			{
				Header: 'Auth Email',
				accessor: 'authEmail'
			},
			{
				Header: 'Ad Manager',
				accessor: 'adManager'
			}
		];

		if (isLoading) return <Loader height="600px" classNames="u-margin-v3" />;

		return (
			<React.Fragment>
				<Row>
					<div className="col-md-10">{this.renderFilterComponent()}</div>
					<div className="col-md-2">{this.exportData()}</div>
				</Row>
				{!filteredData || filteredData.length === 0 ? (
					<Empty message=" No Data found " />
				) : (
					<ReactTable
						columns={columns}
						data={this.filteredDataWithICcon()}
						filterable={false}
						showPaginationTop
						showPaginationBottom={false}
						className="u-padding-h3 u-padding-v2 site-mapping"
					/>
				)}
				{/* {this.filteredDataWithICcon()}; */}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
