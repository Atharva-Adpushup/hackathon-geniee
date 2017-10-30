import React from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import './style.scss';
import { Row, Col, Button } from 'react-bootstrap';

const Filters = props => {
	return (
		<Row className="mb-20">
			<Col xs={6}>
				{/* <input
					placeholder="Enter section name"
					ref="sectionName"
					type="text"
					className="inputMinimal"
					style={{ padding: '14px 10px' }}
				/> */}
			</Col>
			<Col xs={6}>
				<Col xs={7}>
					<DateRangePicker
						onDatesChange={props.onDatesChange}
						onFocusChange={props.onFocusChange}
						focusedInput={props.focusedInput}
						startDate={props.startDate}
						endDate={props.endDate}
						showDefaultInputIcon={props.showDefaultInputIcon}
						hideKeyboardShortcutsPanel={props.hideKeyboardShortcutsPanel}
						showClearDates={props.showClearDates}
						displayFormat={props.displayFormat}
						isOutsideRange={() => {}}
					/>
				</Col>
				<Col xs={5}>
					<Button className="btn-lightBg btn-block" onClick={props.generateReport} type="submit">
						<i className="fa fa-bar-chart" />Generate
					</Button>
				</Col>
			</Col>
		</Row>
	);
};

export default Filters;
