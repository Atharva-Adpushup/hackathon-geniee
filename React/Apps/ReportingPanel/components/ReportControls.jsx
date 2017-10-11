import React, { Component } from 'react';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import config from '../lib/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedPageGroup: null,
			selectedPlatform: null,
			selectedStartDate: moment(),
			selectedEndDate: moment()
		};
		this.pageGroupChanged = this.pageGroupChanged.bind(this);
		this.platformChanged = this.platformChanged.bind(this);
		this.startDateUpdated = this.startDateUpdated.bind(this);
		this.endDateUpdated = this.endDateUpdated.bind(this);
	}

	pageGroupChanged(selectedPageGroup) {
		this.setState({ selectedPageGroup });
	}

	platformChanged(selectedPlatform) {
		this.setState({ selectedPlatform });
	}

	startDateUpdated(date) {
		this.setState({ selectedStartDate: date });
	}

	endDateUpdated(date) {
		this.setState({ selectedEndDate: date });
	}

	render() {
		const pageGroups = window.pageGroups,
			{ platforms } = config,
			{ state } = this;

		return (
			<div className="report-controls-wrapper">
				<div className="container-fluid">
					<Row>
						<Col sm={2} smOffset={2}>
							<SelectBox
								value={state.selectedPageGroup}
								label="Select PageGroup"
								onChange={this.pageGroupChanged}
							>
								{pageGroups.map((pageGroup, index) => (
									<option key={index} value={index}>
										{pageGroup}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<SelectBox
								value={state.selectedPlatform}
								label="Select Platform"
								onChange={this.platformChanged}
							>
								{platforms.map((platform, index) => (
									<option key={index} value={index}>
										{platform}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<DatePicker
								placeholderText="Select Start Date"
								selected={state.selectedStartDate}
								onChange={this.startDateUpdated}
							/>
						</Col>
						<Col sm={2}>
							<DatePicker
								placeholderText="Select End Date"
								selected={state.selectedEndDate}
								onChange={this.endDateUpdated}
							/>
						</Col>
						<Col sm={2}>
							<button className="btn btn-lightBg btn-default">Generate Report</button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default ReportControls;
