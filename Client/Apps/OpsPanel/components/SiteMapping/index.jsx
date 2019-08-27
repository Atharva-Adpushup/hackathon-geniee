import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Glyphicon, Row } from 'react-bootstrap';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index.jsx';
import Loader from '../../../../Components/Loader/index';

class SiteMapping extends Component {
	state = {
		data: [],
		filteredData: [],
		isLoading: false,
		selectAll: false,
		checked: [],
		selectedData : []
	};

	componentDidMount() {
		this.setState({ isLoading: true });
		return axiosInstance
			.get('https://jsonplaceholder.typicode.com/comments')
			.then(res => this.setState({ data: res.data, filteredData: res.data, isLoading: false }))
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false });
			});
	}

	handleChange = e => {
		const { data } = this.state;
		var selectAll = !this.state.selectAll;
		this.setState({ selectAll: selectAll });
		var checkedCopy = [];
		data.forEach(() => {
			checkedCopy.push(selectAll);
		});
		this.setState({
			checked: checkedCopy
		});
	};

	handleSingleCheckboxChange = index => {
		const  { data} = this.state;
		var checkedCopy = this.state.checked;
		checkedCopy[index] = !this.state.checked[index];
		if (checkedCopy[index] === false) {
			this.setState({ selectAll: false });
		}

		this.setState({
			checked: checkedCopy,
			selectedData : data[index] 

		});

		console.log(this.state.selectedData)
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
				Header: 'User ID',
				accessor: 'postId',
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				Header: 'ID',
				accessor: 'id',
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				Header: 'Title',
				accessor: 'name'
			},
			{
				Header: 'Content',
				accessor: 'body'
			},
			{
				Header: 'Email',
				accessor: 'email'
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
			</React.Fragment>
		);
	}
}

export default SiteMapping;
