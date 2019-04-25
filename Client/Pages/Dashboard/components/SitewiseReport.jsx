import React from 'react';
import { convertObjToArr } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { Row, Col } from 'react-bootstrap';
import { quickDates, sites } from '../configs/commonConsts';
import Datatable from 'react-bs-datatable';
let dates = Object.assign({}, quickDates);
console.log(dates);
class SitewiseReport extends React.Component {
	state = {
		quickDates: quickDates,
		selectedDate: quickDates[0].value
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
						selected={this.state.selectedDate || this.state.quickDates[0]}
						options={this.state.quickDates}
						onSelect={selectedDate => {
							this.setState({ selectedDate });
						}}
					/>
				</div>
			</div>
		);
	}
	renderTable() {
		return (
			<Datatable
				tableHeader={data.tableHeader}
				tableBody={data.tableBody}
				rowsPerPage={10}
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
			</Row>
		);
	}
}

export default SitewiseReport;
