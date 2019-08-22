import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { CSVLink, CSVDownload } from 'react-csv';

import axiosInstance from '../../../../helpers/axiosInstance';

class SiteMapping extends Component {
	state = {
		data: [],
		// downloadData: []
	};

	componentDidMount() {
		return axiosInstance
			.get('https://jsonplaceholder.typicode.com/comments')
			.then(res => this.setState({ data: res.data }));
	}

	// download = () => {
	// 	let downloadFilteredData = this.reactTable.getResolvedState().sortedData;
	// 	let filterdata = downloadFilteredData.map(
	// 		({ _original, _index, _subRows, _nestingLevel, ...downloadFilteredData }) =>
	// 			downloadFilteredData
	// 	);
	// 	this.setState({ downloadData: filterdata });
	// };

	render() {
		const { data } = this.state;
		const columns = [
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
				accessor: 'name',
				
			},
			{
				Header: 'Content',
				accessor: 'body',
				
			},
			{
				Header: 'Email',
				accessor: 'email',
			}
		];
	

		return (
			<div>
				{/* <button onClick={this.download} style={{ marginLeft: '10%', marginBottom: '10' }}>
					<CSVLink data={downloadData}>Download me</CSVLink>
				</button> */}

				<ReactTable
					ref={r => (this.reactTable = r)}
					columns={columns}
					data={data}
					filterable = {false}
					sortable ={false}
					showPaginationTop
					showPaginationBottom={false}
				/>
			</div>
		);
	}
}

export default SiteMapping;
