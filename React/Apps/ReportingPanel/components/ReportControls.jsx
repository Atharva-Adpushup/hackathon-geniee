import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import config from '../lib/config';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageGroup: null,
			platform: null,
			startDate: props.startDate,
			endDate: props.endDate
		};
		this.pageGroupUpdated = this.pageGroupUpdated.bind(this);
		this.platformUpdated = this.platformUpdated.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
	}

	pageGroupUpdated(pageGroup) {
		this.setState({ pageGroup });
	}

	platformUpdated(platform) {
		this.setState({ platform });
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	render() {
		const { state, props } = this,
			{ PLATFORMS, PAGEGROUPS } = config;

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
								{PAGEGROUPS.map((pageGroup, index) => (
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
								{PLATFORMS.map((platform, index) => (
									<option key={index} value={index}>
										{platform}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={4}>
							<DateRangePicker
								onDatesChange={this.datesUpdated}
								onFocusChange={this.focusUpdated}
								focusedInput={state.focusedInput}
								startDate={state.startDate}
								endDate={state.endDate}
								showDefaultInputIcon={true}
								hideKeyboardShortcutsPanel={true}
								showClearDates={true}
								displayFormat={'DD-MM-YYYY'}
								isOutsideRange={() => {}}
							/>
						</Col>
						<Col sm={2}>
							<button
								className="btn btn-lightBg btn-default"
								onClick={props.generateButtonHandler}
								disabled={props.disableGenerateButton}
							>
								Generate Report
							</button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

ReportControls.propTypes = {
	startDate: PropTypes.object.isRequired,
	endDate: PropTypes.object.isRequired,
	disableGenerateButton: PropTypes.bool.isRequired,
	generateButtonHandler: PropTypes.func.isRequired
};

export default ReportControls;
