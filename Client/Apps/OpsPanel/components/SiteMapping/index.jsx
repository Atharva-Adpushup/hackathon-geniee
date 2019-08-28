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
			.get('/ops/allSitesData')
			.then(res => this.setState({ data: res.data, filteredData: res.data, isLoading: false }))
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false });
			});
	}

	handleChange = () => {
		const { filteredData } = this.state;
		var checkedCopy = [];
		var selectAll = !this.state.selectAll;
		this.setState({ selectAll: selectAll });
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
		var checkedCopy = this.state.checked;
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

	// filteredDataWithICcon = () => {
	// 	const { filteredData } = this.state;

	// 	return filteredData.map(value =>
	// 		Object.values(value).map(val => (
	// 			<span>
	// 				{val}
	// 				<CustomIcon
	// 					icon="copy"
	// 					className="u-text-red u-margin-l3 u-cursor-pointer"
	// 					title="copy content"
	// 				/>
	// 			</span>
	// 		))
	// 	);
	// };

	renderFilterComponent() {
		return (
			<FilterBox
				onFilter={this.onFilter}
				availableFilters={[
					{
						name: 'User ID',
						prop: 'postId',
						values: this.getFilterBoxValues('postId')
					},
					{
						name: 'ID',
						prop: 'id',
						values: this.getFilterBoxValues('id')
					},
					{
						name: 'Title',
						prop: 'name',
						values: this.getFilterBoxValues('name')
					},
					{
						name: 'Content',
						prop: 'body',
						values: this.getFilterBoxValues('body')
					},
					{
						name: 'Email',
						prop: 'email',
						values: this.getFilterBoxValues('email')
					}
				]}
				handleFilters={this.handleFilters}
				className="u-margin-v5 u-margin-h4 "
			/>
		);
	}

	exportData = () => {
		return (
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
	};
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
				width: 100,
				maxWidth: 100,
				minWidth: 100
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
				accessor: 'onboardingStatus'
			},
			{
				Header: 'Active Status',
				accessor: 'activeStatus',
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				Header: 'Date Created',
				accessor: 'dateCreated'
			},
			{
				Header: 'Active Products',
				accessor: 'activeProducts'
			},
			{
				Header: 'Active Bidders',
				accessor: 'activeBidders'
			},
			{
				Header: 'Rev Share',
				accessor: 'revenueShare',
				width: 100,
				maxWidth: 100,
				minWidth: 100
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

		if (isLoading) return <Loader height="800px" classNames="u-margin-v3" />;

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
						data={filteredData}
						filterable={false}
						showPaginationTop
						showPaginationBottom={false}
						className="u-padding-h3 u-padding-v2"
					/>
				)}
				{/* {this.filteredDataWithICcon()}; */}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
