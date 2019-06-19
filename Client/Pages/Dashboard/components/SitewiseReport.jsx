import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Datatable from 'react-bs-datatable';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Selectbox from '../../../Components/Selectbox/index';
import { getDateRange } from '../helpers/utils';
import { dates } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';
import { numberWithCommas } from '../helpers/utils';

class SitewiseReport extends React.Component {
	state = {
		quickDates: dates,
		selectedDate: dates[0].value,
		tableHeader: [],
		isLoading: true,
		startDate: moment()
			.startOf('day')
			.subtract(7, 'days')
			.format('YYYY-MM-DD'),
		endDate: moment()
			.startOf('day')
			.subtract(1, 'day')
			.format('YYYY-MM-DD')
	};

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate } = this.state;
		const params = getDateRange(selectedDate);
		const { path, site, reportType, siteId } = this.props;
		const siteIds = Object.keys(site);
		if (reportType === 'site') params.siteid = siteId;
		else {
			params.siteid = siteIds.toString();
			params.interval = 'cumulative';
			params.dimension = 'siteid';
		}
		this.setState({ isLoading: true, startDate: params['fromDate'], endDate: params['toDate'] });
		reportService.getWidgetData({ path, params }).then(response => {
			if (response.status == 200 && response.data) {
				this.computeTableData(response.data);
			}
		});
	}

	formatTableData = tableBody => {
		const { metrics } = this.props;
		tableBody.forEach(row => {
			for (let col in row) {
				if (metrics[col]) {
					let num = row[col];
					row[col] =
						metrics[col]['valueType'] == 'money'
							? '$' + numberWithCommas(num.toFixed(2))
							: numberWithCommas(num);
				}
			}
		});
		return tableBody;
	};

	computeTableData = data => {
		const { result, columns } = data;
		const tableHeader = [];
		const { metrics, site, reportType } = this.props;
		columns.forEach(col => {
			if (metrics[col])
				tableHeader.push({
					title: metrics[col].display_name,
					prop: col,
					position: metrics[col].position + 1
				});
		});
		if (reportType === 'site')
			tableHeader.push({
				title: 'Date',
				prop: 'date',
				position: 1
			});
		else
			tableHeader.push({
				title: 'Website',
				prop: 'siteName',
				position: 1
			});
		tableHeader.sort((a, b) => a.position - b.position);
		result.forEach(row => {
			const { siteid } = row;
			row.siteName = site[siteid] ? site[siteid].siteName : 'Not Found';
		});
		let tableBody = this.formatTableData(result);
		this.setState({ tableHeader, tableBody: result, isLoading: false });
	};

	renderControl() {
		const { selectedDate, quickDates } = this.state;
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					{/* eslint-disable */}
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="sitewisereport-date"
						wrapperClassName="display-inline"
						isClearable={false}
						isSearchable={false}
						selected={selectedDate}
						options={quickDates}
						onSelect={date => {
							this.setState({ selectedDate: date }, this.getGraphData);
						}}
					/>
					{/* eslint-enable */}
				</div>
			</div>
		);
	}

	renderTable() {
		const { tableBody, tableHeader } = this.state;
		return (
			<Datatable
				tableHeader={tableHeader}
				tableBody={tableBody}
				rowsPerPage={10}
				rowsPerPageOption={[20, 30, 40, 50]}
				keyName="reportTable"
			/>
		);
	}

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%' }}>
			<Loader height="20vh" />
		</div>
	);

	render() {
		const { isLoading, startDate, endDate } = this.state;
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>{isLoading ? this.renderLoader() : this.renderTable()}</Col>
				<Col sm={12}>
					<Link
						to={`/reports?dimension=siteid&interval=cumulative&fromDate=${startDate}&toDate=${endDate}`}
						className="u-link-reset aligner aligner-item float-right"
					>
						<Button className="aligner-item aligner aligner--vCenter">
							View Reports
							<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
						</Button>
					</Link>
				</Col>
			</Row>
		);
	}
}

export default SitewiseReport;
