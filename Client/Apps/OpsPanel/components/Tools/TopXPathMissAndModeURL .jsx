import React, { Component, Fragment } from 'react';
import { Row } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import FieldGroup from '../../../../Components/Layout/FieldGroup';
import { XPATH_MODE_URL } from '../../configs/commonConsts';
import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';

const { devices, modes } = XPATH_MODE_URL;

const DEFAULT_STATE = {
	siteId: '',
	topURLCount: '',
	emailId: '',
	pageGroups: '',
	devices,
	modes,
	currentSelectedDevice: null,
	currentSelectedMode: null,
	errorCode: '',
	startDate: moment()
		.subtract(7, 'days')
		.startOf('day'),
	endDate: moment()
		.startOf('day')
		.subtract(1, 'day'),
	focusedInput: null
};
class TopXPathMissAndModeURL extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			...DEFAULT_STATE
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSelect = (value, key) => {
		this.setState({ [key]: value });
	};

	handleReset = () => this.setState(DEFAULT_STATE);

	handleGenerate = () => {
		const {
			siteId,
			topURLCount,
			emailId,
			pageGroups,
			currentSelectedDevice,
			currentSelectedMode,
			errorCode,
			startDate,
			endDate
		} = this.state;

		const isValid = !!(
			siteId &&
			topURLCount &&
			emailId &&
			pageGroups &&
			currentSelectedDevice &&
			currentSelectedMode &&
			errorCode &&
			startDate &&
			endDate
		);

		const { showNotification } = this.props;

		if (!isValid) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Missing or Incorrect params',
				autoDismiss: 5
			});
		}
		this.setState({ isLoading: true });

		return axiosInstance
			.post('/ops/xpathEmailNotifier', {
				siteId,
				topURLCount,
				emailId,
				pageGroups,
				currentSelectedDevice,
				currentSelectedMode,
				errorCode,
				startDate,
				endDate
			})
			.then(() => {
				showNotification({
					mode: 'success',
					title: 'Success',
					message: `Email will be sent to ${emailId}`,
					autoDismiss: 5
				});
				this.setState({ isLoading: false }, this.handleReset);
			})
			.catch(err => {
				const { data = {} } = err.response;
				const {
					data: { message = 'Something went Wrong. Please contact AdPushup Support.' } = {}
				} = data;
				const errResponse = message.split('.')[1];
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: errResponse,
					autoDismiss: 5
				});

				this.setState({ isLoading: false });
			});
	};

	datesUpdated = ({ startDate, endDate }) => {
		this.setState({ startDate, endDate });
	};

	focusUpdated = focusedInput => {
		this.setState({ focusedInput });
	};

	render() {
		const {
			siteId,
			topURLCount,
			emailId,
			devices,
			currentSelectedDevice,
			currentSelectedMode,
			pageGroups,
			modes,
			errorCode,
			startDate,
			endDate,
			isLoading,
			focusedInput
		} = this.state;

		return (
			<Fragment>
				<FieldGroup
					name="siteId"
					value={siteId}
					type="number"
					label="Site Id"
					onChange={this.handleChange}
					size={6}
					id="siteId-input"
					placeholder="Site Id"
					className="u-padding-v4 u-padding-h4"
				/>

				<FieldGroup
					name="topURLCount"
					value={topURLCount}
					type="number"
					label="Top URL Count"
					onChange={this.handleChange}
					size={6}
					id="topURLCount-input"
					placeholder="Top URL Count"
					className="u-padding-v4 u-padding-h4"
				/>

				<Fragment>
					<p className="u-text-bold">Dates</p>

					<DateRangePicker
						startDate={startDate}
						endDate={endDate}
						onDatesChange={this.datesUpdated}
						focusedInput={focusedInput}
						onFocusChange={this.focusUpdated}
						showDefaultInputIcon
						hideKeyboardShortcutsPanel
						showClearDates
						minimumNights={0}
						displayFormat="DD-MM-YYYY"
						isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
					/>
				</Fragment>

				<div className="u-margin-t4">
					<FieldGroup
						name="emailId"
						value={emailId}
						type="text"
						label="Email Id"
						onChange={this.handleChange}
						size={6}
						id="emailId-input"
						placeholder="Email Id"
						className="u-padding-v4 u-padding-h4"
					/>
				</div>

				<Fragment>
					<p className="u-text-bold">Device</p>
					<SelectBox
						selected={currentSelectedDevice}
						options={devices}
						onSelect={this.handleSelect}
						id="select-device"
						title="Select Device"
						dataKey="currentSelectedDevice"
						reset
					/>
				</Fragment>
				<div className="u-margin-t4">
					<FieldGroup
						name="pageGroups"
						value={pageGroups}
						type="text"
						label="Page Groups"
						onChange={this.handleChange}
						size={6}
						id="pageGroups-input"
						placeholder="Page Groups"
						className="u-padding-v4 u-padding-h4"
					/>
				</div>

				<Fragment>
					<p className="u-text-bold">Mode</p>
					<SelectBox
						selected={currentSelectedMode}
						options={modes}
						onSelect={this.handleSelect}
						id="select-mode"
						title="Select Mode"
						dataKey="currentSelectedMode"
						reset
					/>
				</Fragment>

				<div className="u-margin-t4">
					<FieldGroup
						name="errorCode"
						value={errorCode}
						type="number"
						label="Error Code"
						onChange={this.handleChange}
						size={6}
						id="erroCode-input"
						placeholder="Error Code"
						className="u-padding-v4 u-padding-h4"
					/>
				</div>

				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleGenerate}
					showSpinner={isLoading}
				>
					Generate
				</CustomButton>

				<CustomButton
					variant="secondary"
					className="pull-right u-margin-r3"
					onClick={this.handleReset}
				>
					Reset
				</CustomButton>
			</Fragment>
		);
	}
}

export default TopXPathMissAndModeURL;
