import React, { Component } from 'react';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import config from '../lib/config';
import 'react-dates/initialize';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			startDate: moment(),
			endDate: moment()
		};

		this.onDatesChange = this.onDatesChange.bind(this);
		this.onFocusChange = this.onFocusChange.bind(this);
	}

	onDatesChange({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	onFocusChange(focusedInput) {
		this.setState({ focusedInput });
	}

	render() {
		const { focusedInput, startDate, endDate } = this.state;

		return (
			<div>
				<DateRangePicker
					onDatesChange={this.onDatesChange}
					onFocusChange={this.onFocusChange}
					focusedInput={focusedInput}
					startDate={startDate}
					endDate={endDate}
				/>
			</div>
		);
	}
}

export default ReportControls;
