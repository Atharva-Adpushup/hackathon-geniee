/* eslint-disable guard-for-in */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import ReactTable from 'react-table';
import clonedeep from 'lodash/cloneDeep';
import 'react-table/react-table.css';
import { Glyphicon, Row } from 'react-bootstrap';
import { faMailBulk } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index';
import Loader from '../../../../Components/Loader/index';
import { copyToClipBoard } from '../../../../helpers/commonFunctions';
import CustomIcon from '../../../../Components/CustomIcon/index';
import CustomButton from '../../../../Components/CustomButton';
import CustomError from '../../../../Components/CustomError/index';
import { REPORT_DOWNLOAD_ENDPOINT } from '../../../Reporting/configs/commonConsts';
import { SITE_MAPPING_COLUMNS, SITE_MAPPING_FILTER_COLUMNS } from '../../configs/commonConsts';

library.add(faMailBulk);

class SiteMapping extends Component {
	constructor() {
		super();
		this.state = {
			data: [],
			filteredData: [],
			isLoading: false,
			isError: false,
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
			.catch(() => this.setState({ isLoading: false, isError: true }));
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
		data.forEach(val => {
			for (const key in val) {
				const showCopyIcon = !!(
					val[key] === 'N/A' ||
					(key === 'onboardingStatus' ||
						key === 'dateCreated' ||
						key === 'activeStatus' ||
						key === 'revenueShare')
				);
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

		if (length < 5) return 5;
		if (length < 10) return 10;
		if (length < 20) return 20;
		if (length < 50) return 50;
		return 50;
	};

	renderContent = () => {
		const { filteredData, isError, selectAll, checked } = this.state;
		const dataWithIcon = clonedeep(filteredData);
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
		if (isError) {
			return <CustomError />;
		}
		if (filteredData.length === 0) {
			return <Empty message=" No Data found " />;
		}
		return (
			<ReactTable
				columns={columns}
				data={this.filteredDataWithIcon(dataWithIcon)}
				filterable={false}
				showPaginationTop
				showPaginationBottom={false}
				className="u-padding-h3 u-padding-v2 site-mapping"
				defaultPageSize={this.getDefaultPageSize()}
				pageSizeOptions={[5, 10, 20, 25, 50, 100]}
			/>
		);
	};

	sendMail = () => {
		const { selectedData, filteredData } = this.state;
		const message = 'Are you sure you want to send the bulk mail ?';
		if (window.confirm(message)) {
			console.log('we are sending the bulk mail for you');
		}
	};

	render() {
		const { isLoading, filteredData, selectedData, fileName } = this.state;
		let csvData, downloadLink;
		try {
			csvData =
				selectedData.length === 0
					? btoa(JSON.stringify(filteredData))
					: btoa(JSON.stringify(selectedData));
			downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${csvData}&fileName=${fileName}`;
		} catch (e) {
			console.lof('Invalid input');
		}

		if (isLoading) return <Loader height="600px" classNames="u-margin-v3" />;

		return (
			<React.Fragment>
				<FilterBox
					onFilter={this.onFilter}
					availableFilters={this.handleFilterValues(SITE_MAPPING_FILTER_COLUMNS)}
					handleFilters={this.handleFilters}
					className="u-margin-v5 u-margin-h4 "
				/>
				<Row>
					<CustomButton
						variant="primary"
						href={downloadLink}
						className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3 u-margin-b4 "
					>
						<Glyphicon glyph="download-alt u-margin-r2" />
						Export Report
					</CustomButton>

					<CustomButton
						variant="secondary"
						className=" pull-right u-margin-r3 u-margin-b4 "
						onClick={this.sendMail}
					>
						<FontAwesomeIcon size="1x" icon={faMailBulk} className="u-margin-r3" />
						Send Custom Mail
					</CustomButton>
				</Row>
				{this.renderContent()}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
