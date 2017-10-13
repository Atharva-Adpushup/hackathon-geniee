import React, { Component } from 'react';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import config from '../lib/config';
import 'react-dates/initialize';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import DefaultTheme from 'react-dates/lib/theme/DefaultTheme';
import { withStyles } from 'react-with-styles';

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageGroup: null,
			platform: null,
			startDate: moment().startOf('day'),
			endDate: moment()
				.add(6, 'days')
				.startOf('day')
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
		const { state } = this,
			pageGroups = window.pageGroups,
			{ platforms } = config;

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
							<button className="btn btn-lightBg btn-default">Generate Report</button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default withStyles(() => ({
	...DefaultTheme,
	color: {
		...DefaultTheme.color,
		highlighted: {
			backgroundColor: '#50a4e2',
			backgroundColor_active: '#50a4e2',
			backgroundColor_hover: '#50a4e2',
			color: '#50a4e2',
			color_active: '#50a4e2',
			color_hover: '#50a4e2'
		}
	}
}))(ReportControls);
