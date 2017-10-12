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
			startDate: moment().startOf('day'),
			endDate: moment()
				.add(6, 'days')
				.startOf('day')
		};

		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	render() {
		const { focusedInput, startDate, endDate } = this.state;

		return (
			<div>
				<DateRangePicker
					onDatesChange={this.datesUpdated}
					onFocusChange={this.focusUpdated}
					focusedInput={focusedInput}
					startDate={startDate}
					endDate={endDate}
					showDefaultInputIcon={true}
					hideKeyboardShortcutsPanel={true}
					showClearDates={true}
					displayFormat={'DD-MM-YYYY'}
					isOutsideRange={() => {}}
				/>
			</div>
		);
	}
}

export default ReportControls;
