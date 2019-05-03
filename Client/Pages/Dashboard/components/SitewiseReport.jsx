import React from 'react';
import Selectbox from '../../../Components/Selectbox/index';
import { getDateRange } from '../helpers/utils';
import { Row, Col } from 'react-bootstrap';
import { quickDates, sites } from '../configs/commonConsts';
import Datatable from 'react-bs-datatable';
import { Link } from 'react-router-dom';
import reportService from '../../../services/reportService';
class SitewiseReport extends React.Component {
	state = {
		quickDates: quickDates,
		selectedDate: quickDates[0].value,
		tableHeader: []
	};
	componentDidMount() {
		this.getGraphData();
	}
	getGraphData() {
		let { selectedDate } = this.state,
			params = getDateRange(selectedDate),
			{ path } = this.props;
		reportService.getWidgetData(path, params).then(response => {
			if (response.status == 200) {
				let data = response.data && response.data.data ? response.data.data : [];
				this.computeTableData(data);
			}
		});
	}
	computeTableData = data => {
		let { result, columns } = data,
			tableHeader = [],
			{ metrics } = this.props;
		columns.forEach(col => {
			if (metrics[col])
				tableHeader.push({
					title: metrics[col]['display_name'],
					prop: col,
					position: metrics[col]['position'] + 1
				});
		});
		tableHeader.push({
			title: 'Website',
			prop: 'siteName',
			position: 1
		});
		tableHeader.sort(function(a, b) {
			return a.position - b.position;
		});
		this.setState({ tableHeader, tableBody: result });
	};
	renderControl() {
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="sitewisereport-date"
						wrapperClassName="display-inline"
						isClearable={false}
						isSearchable={false}
						selected={this.state.selectedDate}
						options={this.state.quickDates}
						onSelect={selectedDate => {
							this.setState({ selectedDate }, this.getGraphData);
						}}
					/>
				</div>
			</div>
		);
	}
	renderTable() {
		let { tableBody, tableHeader } = this.state;
		return (
			<Datatable
				tableHeader={tableHeader}
				tableBody={tableBody}
				rowsPerPageOption={[]}
				keyName="reportTable"
			/>
		);
	}
	render() {
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>{this.renderTable()}</Col>
				<Col sm={12}>
					<Link to="/reports" className="float-right">
						View Reports
					</Link>
				</Col>
			</Row>
		);
	}
}

export default SitewiseReport;
