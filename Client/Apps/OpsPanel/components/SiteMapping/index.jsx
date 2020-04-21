/* eslint-disable guard-for-in */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import clonedeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';

import { Row } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSVLink } from 'react-csv';
import moment from 'moment';

import axiosInstance from '../../../../helpers/axiosInstance';
import FilterBox from '../../../../Components/FilterBox';
import Empty from '../../../../Components/Empty/index';
import Loader from '../../../../Components/Loader/index';
import CustomIcon from '../../../../Components/CustomIcon/index';
import CustomButton from '../../../../Components/CustomButton';
import CustomError from '../../../../Components/CustomError/index';
import { SITE_MAPPING_COLUMNS } from '../../configs/commonConsts';
import CopyButtonWrapperContainer from '../../../../Containers/CopyButtonWrapperContainer';
import CustomReactTable from '../../../../Components/CustomReactTable/index';

import GlobalSearch from './GlobalSearch';

class SiteMapping extends Component {
	state = {
		data: [],
		filteredData: [],
		filterCopyForSeach: [],
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
				this.setState({ data, filteredData: data.result, isLoading: false });
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
			selectAll: selectedData.length === filteredData.length
		});
	};

	getFilterBoxValues = (key, filters) => {
		let values;

		if (Array.isArray(filters)) {
			values = filters;
		} else {
			const {
				data: { result: tableRows },
				filteredData
			} = this.state;

			values = [...new Set(filteredData.map(val => val[key]))];
		}

		return values.map(value => ({ name: value }));
	};

	handleFilterValues = () => {
		const {
			data: { columns }
		} = this.state;

		if (!columns) return [];

		return columns.map(({ name, key: prop, filters }) => ({
			name,
			prop,
			values: this.getFilterBoxValues(prop, filters)
		}));
	};

	handleFilters = filters => {
		const {
			data: { columns: columnsMeta, result }
		} = this.state;
		const columnsMetaObj = this.convertColumnsMetaArrToObj(columnsMeta);
		let filteredData = [...result];

		for (const prop in filters) {
			const filter = filters[prop];
			// eslint-disable-next-line no-prototype-builtins
			if (filters.hasOwnProperty(prop) && filter.values.length) {
				filteredData = filteredData.filter(row => {
					let rowFound = false;

					for (const filterValue of filter.values) {
						if (columnsMetaObj[prop].isMultiValue && filterValue === 'N/A') {
							rowFound = !row[prop].length;
						} else if (columnsMetaObj[prop].isMultiValue) {
							rowFound = row[prop].indexOf(filterValue) !== -1;
						} else {
							rowFound = row[prop] === filterValue;
						}

						if (rowFound) return true;
					}

					return rowFound;
				});
			}

			this.setState({
				filteredData,
				filterCopyForSeach: filteredData,
				selectedData: [],
				checked: [],
				selectAll: false
			});
		}
	};

	convertColumnsMetaArrToObj = columnsMetaArr =>
		columnsMetaArr.reduce((obj, column) => {
			const { key, ...value } = column;
			obj[key] = value;
			return obj;
		}, {});

	getTableBody = (data, columnsMeta) => {
		const columnsMetaObj = this.convertColumnsMetaArrToObj(columnsMeta);

		return data.map(row => {
			const rowCopy = clonedeep(row);
			for (const columnKey in rowCopy) {
				let cellValue = '';
				if (columnsMetaObj[columnKey].isMultiValue && Array.isArray(rowCopy[columnKey])) {
					cellValue = rowCopy[columnKey].reduce((accumulatedString, value) => {
						let stringVal = '';

						switch (typeof value) {
							case 'string':
								stringVal = value;
								break;

							case 'number':
								stringVal = value.toString();
								break;

							default:
								return stringVal;
						}

						return !accumulatedString ? stringVal : `${accumulatedString}, ${stringVal}`;
					}, '');
				} else {
					cellValue = rowCopy[columnKey];
				}

				if (!cellValue && cellValue !== 0) {
					cellValue = 'N/A';
				}

				const showCopyIcon = cellValue !== 'N/A' && columnsMetaObj[columnKey].showCopyBtn;

				cellValue = (
					<span title={cellValue}>
						{cellValue}
						{!!showCopyIcon && (
							<CopyButtonWrapperContainer content={cellValue}>
								<CustomIcon icon="copy" className="u-text-red u-margin-l3 site-mapping-copy" />
							</CopyButtonWrapperContainer>
						)}
					</span>
				);

				rowCopy[columnKey] = cellValue;
			}

			return rowCopy;
		});
	};

	getTableHeaders = columns => {
		const sortedColumns = sortBy(clonedeep(columns), ['position']);

		return sortedColumns.map(column => {
			const { name: Header, key: accessor, width = 150, maxWidth = 150, minWidth = 150 } = column;
			const commonProps = { accessor, width, maxWidth, minWidth };

			if (column.key === 'activeProducts')
				return {
					Header: () => (
						<span>
							{Header}

							<FontAwesomeIcon
								size="1x"
								icon="info-circle"
								className="u-margin-r3"
								style={{ marginLeft: '5' }}
								className="info"
								title="This would not match with Mysites>>sitename.com>>Manage Apps active products
										as this data comes from reporting data"
							/>
						</span>
					),
					...commonProps
				};
			if (column.key !== 'activeStatus') return { Header, ...commonProps };
			return {
				Header,

				getProps: (state, rowInfo, column) => ({
					style: {
						color:
							rowInfo && rowInfo.row.activeStatus.props.children.includes('Active')
								? 'green'
								: 'red'
					}
				}),
				...commonProps
			};
		});
	};

	renderContent = () => {
		const {
			data: { columns: columnsMeta },
			filteredData,
			isError
		} = this.state;
		const filteredDataCopy = clonedeep(filteredData);

		if (isError) return <CustomError />;
		if (!filteredData.length) return <Empty message=" No Data found " />;

		return (
			<CustomReactTable
				columns={this.getTableHeaders(columnsMeta)}
				data={this.getTableBody(filteredDataCopy, columnsMeta)}
				filterable={false}
				showPaginationTop
				showPaginationBottom={false}
				defaultPageSize={50}
				pageSizeOptions={[50, 100, 150, 200, 250]}
				minRows={0}
				sortable
				defaultSortMethod={this.sortMethod}
			/>
		);
	};

	handleExport = () => {
		setTimeout(() => {
			this.setState({ checked: [], selectedData: [], selectAll: false });
		}, 0);
	};

	handleSetFilteredData = filteredData => {
		this.setState({ filteredData });
	};

	handleSetSearchInput = searchInput => {
		this.setState({ searchInput });
	};

	sortMethod = (firstNode, secondNode, desc) => {
		if (!firstNode || !secondNode) return 0;
		const { title: first } = firstNode.props || {};
		const { title: second } = secondNode.props || {};
		const dateFormat = 'Do MMM YYYY';
		if (typeof first === 'number' && typeof second === 'number') {
			if (first > second) return -1;
			if (second > first) return 1;
			return 0;
		}
		if (typeof first === 'string' && typeof second === 'string') {
			if (moment(first, dateFormat).isValid() && moment(second, dateFormat).isValid()) {
				// both the strings are dates. Sort differently.
				const firstDate = moment(first, dateFormat);
				const secondDate = moment(Second, dateFormat);

				const diff = firstDate.diff(secondDate);
				if (diff < 0) return 1;
				else return -1;
			}
			return first.localeCompare(second);
		}
		return 0;
	};

	render() {
		const {
			isLoading,
			filteredData,
			selectedData,
			data: { result },
			filterCopyForSeach
		} = this.state;
		if (isLoading) return <Loader height="600px" classNames="u-margin-v3" />;
		const csvData = !selectedData.length ? filteredData : selectedData;

		return (
			<React.Fragment>
				<GlobalSearch
					data={!filterCopyForSeach.length ? result : filterCopyForSeach}
					columns={SITE_MAPPING_COLUMNS}
					handleSetFilteredData={this.handleSetFilteredData}
					handleSetSearchInput={this.handleSetSearchInput}
					className="u-margin-v5 u-margin-h4 site-stats"
				/>
				<FilterBox
					availableFilters={this.handleFilterValues()}
					handleFilters={this.handleFilters}
					className="u-margin-v5 u-margin-h4 site-stats"
				/>
				<Row>
					{csvData ? (
						<CSVLink data={csvData} filename="site-stats.csv">
							<CustomButton
								variant="primary"
								className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3 u-margin-b4 "
							>
								<FontAwesomeIcon size="1x" icon="download" className="u-margin-r3" />
								Export Report
							</CustomButton>
						</CSVLink>
					) : null}
				</Row>
				{this.renderContent()}
			</React.Fragment>
		);
	}
}

export default SiteMapping;
