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
			variation: null,
			startDate: props.startDate,
			endDate: props.endDate
		};
		this.pageGroupUpdated = this.pageGroupUpdated.bind(this);
		this.platformUpdated = this.platformUpdated.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
	}

	pageGroupUpdated(pageGroup) {
		const reportLevel = pageGroup !== null ? 'pageGroup' : 'site',
			pageGroupName = pageGroup !== null ? config.PAGEGROUPS[pageGroup] : null;

		this.setState({ pageGroup });
		this.props.reportParamsUpdateHandler({ pageGroup: pageGroupName, reportLevel });
	}

	platformUpdated(platform) {
		const platformName = config.PLATFORMS[platform];
		this.setState({ platform });
		this.props.reportParamsUpdateHandler({ platform: platformName });
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
		this.props.reportParamsUpdateHandler({ startDate, endDate });
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
						<Col sm={2}>
							<SelectBox
								value={state.pageGroup}
								label="Select PageGroup"
								onChange={this.pageGroupUpdated}
							>
								{PAGEGROUPS.map((pageGroup, index) => (
									<option key={index} value={index}>
										{pageGroup}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<SelectBox value={state.platform} label="Select Platform" onChange={this.platformUpdated}>
								{PLATFORMS.map((platform, index) => (
									<option key={index} value={index}>
										{platform}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<SelectBox
								value={state.pageGroup}
								label="Select Variation"
								onChange={this.pageGroupUpdated}
								disabled
							>
								{PAGEGROUPS.map((pageGroup, index) => (
									<option key={index} value={index}>
										{pageGroup}
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
	generateButtonHandler: PropTypes.func.isRequired,
	reportParamsUpdateHandler: PropTypes.func.isRequired
};

export default ReportControls;
