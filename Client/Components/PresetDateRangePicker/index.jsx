import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';
import 'react-dates/initialize'; // required by DateRangePicker to work
import Select from 'react-select';
import 'react-dates/lib/css/_datepicker.css';

import { DateRangePicker, DateRangePickerShape, isSameDay } from 'react-dates';
import { DateRangePickerPhrases } from './lib/defaultPhrases';

const propTypes = {
	autoFocus: PropTypes.bool,
	autoFocusEndDate: PropTypes.bool,
	initialStartDate: momentPropTypes.momentObj,
	initialEndDate: momentPropTypes.momentObj,
	presets: PropTypes.arrayOf(
		PropTypes.shape({
			text: PropTypes.string,
			start: momentPropTypes.momentObj,
			end: momentPropTypes.momentObj
		})
	),
	datesUpdated: PropTypes.func,

	...omit(DateRangePickerShape, [
		'startDate',
		'endDate',
		'onDatesChange',
		'focusedInput',
		'onFocusChange'
	])
};

const defaultProps = {
	// example props for the demo
	autoFocus: false,
	autoFocusEndDate: false,
	initialStartDate: null,
	initialEndDate: null,
	presets: [],

	// input related props
	startDateId: 'startDate',
	startDatePlaceholderText: 'Start Date',
	endDateId: 'endDate',
	endDatePlaceholderText: 'End Date',
	disabled: false,
	required: false,
	screenReaderInputMessage: '',
	showClearDates: false,
	showDefaultInputIcon: false,
	customInputIcon: null,
	customArrowIcon: null,
	customCloseIcon: null,

	// calendar presentation and interaction related props
	orientation: 'horizontal',
	anchorDirection: 'left',
	horizontalMargin: 0,
	withPortal: false,
	withFullScreenPortal: false,
	initialVisibleMonth: null,
	numberOfMonths: 2,
	keepOpenOnDateSelect: false,
	reopenPickerOnClearDates: false,
	isRTL: false,

	// navigation related props
	navPrev: null,
	navNext: null,
	onPrevMonthClick() {},
	onNextMonthClick() {},
	onClose() {},

	// day presentation and interaction related props
	minimumNights: 0,
	enableOutsideDays: false,
	isDayBlocked: () => false,
	isOutsideRange: day => false,
	isDayHighlighted: () => false,

	// internationalization
	displayFormat: () => moment.localeData().longDateFormat('ll'),
	monthFormat: 'MMMM YYYY',
	phrases: DateRangePickerPhrases
};

class DateRangePickerWrapper extends React.Component {
	constructor(props) {
		super(props);

		const focusedInput = null;

		this.state = {
			focusedInput,
			startDate: moment(props.startDate),
			endDate: moment(props.endDate)
		};

		this.onDatesChange = this.onDatesChange.bind(this);
		this.onFocusChange = this.onFocusChange.bind(this);
		this.renderDatePresets = this.renderDatePresets.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { startDate, endDate } = this.props;
		if (
			moment(startDate).format('YYYY-MM-DD') !== nextProps.startDate ||
			moment(endDate).format('YYYY-MM-DD') !== nextProps.endDate
		) {
			this.setState({ startDate: moment(nextProps.startDate), endDate: moment(nextProps.endDate) });
		}
	}

	onDatesChange({ startDate, endDate }) {
		this.props.datesUpdated({
			startDate: moment(startDate).format('YYYY-MM-DD'),
			endDate: moment(endDate).format('YYYY-MM-DD')
		});
		this.setState({ startDate, endDate });
	}

	onFocusChange(focusedInput) {
		this.setState({ focusedInput });
	}

	renderDatePresets() {
		const { presets, getPresetDropdownItems = [] } = this.props;
		const { startDate, endDate } = this.state;
		return (
			<ul className="PresetDateRangePicker_ui">
				{presets.map(({ text, start, end }) => {
					const isSelected = isSameDay(start, startDate) && isSameDay(end, endDate);
					return (
						<li>
							<button
								key={text}
								className="PresetDateRangePicker_button"
								type="button"
								onClick={() => {
									this.onDatesChange({ startDate: start, endDate: end });
									this.onFocusChange();
								}}
							>
								{text}
							</button>
						</li>
					);
				})}
				{getPresetDropdownItems.length ? (
					<li>
						<Select
							options={getPresetDropdownItems}
							onChange={({ value }) => {
								this.onDatesChange({
									startDate: value.start,
									endDate: value.end
								});
								this.onFocusChange();
							}}
							isSearchable
							isClearable
							placeholder="Select Duration"
							className="saved-reports-select custom-select-box-wrapper presetDropdown"
						/>
					</li>
				) : (
					''
				)}
			</ul>
		);
	}

	render() {
		const { focusedInput, startDate, endDate } = this.state;
		const { showClearDates = true, displayFormat = 'll' } = this.props;

		// autoFocus, autoFocusEndDate, initialStartDate and initialEndDate are helper props for the
		// example wrapper but are not props on the SingleDatePicker itself and
		// thus, have to be omitted.
		const props = omit(this.props, [
			'autoFocus',
			'autoFocusEndDate',
			'initialStartDate',
			'initialEndDate',
			'presets'
		]);

		return (
			<div>
				<DateRangePicker
					{...props}
					renderCalendarInfo={this.renderDatePresets}
					onDatesChange={this.onDatesChange}
					onFocusChange={this.onFocusChange}
					focusedInput={focusedInput}
					startDate={startDate}
					endDate={endDate}
					showDefaultInputIcon
					hideKeyboardShortcutsPanel
					showClearDates={showClearDates}
					minimumNights={0}
					displayFormat={displayFormat}
				/>
			</div>
		);
	}
}

DateRangePickerWrapper.propTypes = propTypes;
DateRangePickerWrapper.defaultProps = defaultProps;

export default DateRangePickerWrapper;
