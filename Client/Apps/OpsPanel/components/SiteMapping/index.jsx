/* eslint-disable guard-for-in */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import ReactTable from 'react-table';
import clonedeep from 'lodash/cloneDeep';
import 'react-table/react-table.css';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSVLink } from 'react-csv';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index';
import Loader from '../../../../Components/Loader/index';
import { copyToClipBoard } from '../../../../helpers/commonFunctions';
import CustomIcon from '../../../../Components/CustomIcon/index';
import CustomButton from '../../../../Components/CustomButton';
import CustomError from '../../../../Components/CustomError/index';
import { SITE_MAPPING_COLUMNS, SITE_MAPPING_FILTER_COLUMNS } from '../../configs/commonConsts';

const DEFAULT_WIDTH = {
	width: 50,
	maxWidth: 50,
	minWidth: 50
};

class SiteMapping extends Component {
	state = {
		data: [],
		filteredData: [],
		isLoading: false,
		isError: false,
		selectAll: false,
		checked: [],
		selectedData: []
	};

	componentDidMount() {
		this.setState({ isLoading: true });
		return axiosInstance
			.get('/ops/allSitesStats')
			.then(res => {
				const { data = [] } = res.data;
				this.setState({ data, filteredData: data, isLoading: false });
			})
			.catch(() => this.setState({ isLoading: false, isError: true }));
	}

	handleChange = () => {
		const { filteredData, selectAll } = this.state;
		const checkedCopy = [];
		this.setState({ selectAll: !selectAll }, () => {
			const { selectAll } = this.state;
			filteredData.forEach(() => {
				checkedCopy.push(selectAll);
			});
			this.setState({
				checked: checkedCopy,
				selectedData: this.state.selectAll ? [...filteredData] : []
			});
		});
	};

	handleSingleCheckboxChange = (index, e) => {
		const { checked, selectedData, filteredData } = this.state;
		const checkedCopy = checked;
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
		const values = [...new Set(data.map(val => val[key]))];

		return values.map(value => ({ name: value }));
	};

	handleFilterValues = arr => {
		let array = [];
		arr.map(({ name, prop }) => {
			array.push({ name, prop, values: this.getFilterBoxValues(prop) });
		});
		return array;
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

	filteredDataWithIcon = data => {
		const keysWithoutCopyIcon = ['onboardingStatus', 'dateCreated', 'activeStatus', 'revenueShare'];
		data.forEach(val => {
			for (const key in val) {
				const showCopyIcon = !!(val[key] === 'N/A' || keysWithoutCopyIcon.includes(key));
				// eslint-disable-next-line no-prototype-builtins
				if (val.hasOwnProperty(key)) {
					val[key] = showCopyIcon ? (
						<span> {val[key]}</span>
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
			}
		});
		return data;
	};

	getDefaultPageSize = () => {
		const { filteredData: { length = 0 } = {} } = this.state;

		if (length <= 5) return 5;
		else if (length <= 10) return 10;
		else if (length <= 20) return 20;
		else if (length <= 50) return 50;
		return 50;
	};

	renderContent = () => {
		const { filteredData, isError, selectAll, checked } = this.state;
		const dataWithIcon = clonedeep(filteredData);
		const columns = [
			// {
			// 	Header: <input type="checkbox" onChange={this.handleChange} checked={selectAll} />,
			// 	Cell: row => (
			// 		<input
			// 			type="checkbox"
			// 			checked={checked[row.index]}
			// 			onChange={e => this.handleSingleCheckboxChange(row.index, e)}
			// 		/>
			// 	),
			// 	sortable: false,
			// 	filterable: false,
			// 	...DEFAULT_WIDTH
			// },

			...SITE_MAPPING_COLUMNS
		];

		if (isError) return <CustomError />;
		else if (!filteredData.length) return <Empty message=" No Data found " />;

		return (
			<ReactTable
				columns={columns}
				data={this.filteredDataWithIcon(dataWithIcon)}
				filterable={false}
				showPaginationTop
				showPaginationBottom={false}
				className="u-padding-h3 u-padding-v2 site-mapping"
				pageSize={this.getDefaultPageSize()}
				pageSizeOptions={[50, 100, 150, 200, 250]}
			/>
		);
	};

	handleExport = () => {
		setTimeout(() => {
			this.setState({ checked: [], selectedData: [], selectAll: false });
		}, 0);
	};

	sendMail = () => {
		const { selectedData } = this.state;
		const { showNotification } = this.props;

		if (!selectedData.length) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Please select atleast 1 entry',
				autoDismiss: 5
			});
		}
		const message = 'Are you sure you want to send the bulk mail ?';
		!window.confirm(message)
			? console.log('You have selected no')
			: console.log('we are sending the bulk mail for you');

		this.setState({ checked: [], selectedData: [], selectAll: false });
	};

	render() {
		const { isLoading, filteredData, selectedData } = this.state;
		if (isLoading) return <Loader height="600px" classNames="u-margin-v3" />;
		let csvData;
		try {
			csvData = !selectedData.length ? filteredData : selectedData;
		} catch (e) {
			alert('csv data corrupted');
		}
		return (
			<React.Fragment>
				<FilterBox
					onFilter={this.onFilter}
					availableFilters={this.handleFilterValues(SITE_MAPPING_FILTER_COLUMNS)}
					handleFilters={this.handleFilters}
					className="u-margin-v5 u-margin-h4 site-stats"
				/>
				<Row>
					{csvData ? (
						<CSVLink data={csvData} filename={'site-stats.csv'}>
							<CustomButton
								variant="primary"
								className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3 u-margin-b4 "
							>
								<FontAwesomeIcon size="1x" icon="download" className="u-margin-r3" />
								Export Report
							</CustomButton>
						</CSVLink>
					) : null}

					{/* <CustomButton
						variant="secondary"
						className=" pull-right u-margin-r3 u-margin-b4 "
						onClick={this.sendMail}
					>
						<FontAwesomeIcon size="1x" icon="mail-bulk" className="u-margin-r3" />
						Send Custom Mail
					</CustomButton> */}
				</Row>
				{this.renderContent()}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
