import React, { Component, Fragment } from 'react';
import { Row } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import { XPATH_MODE_URL } from '../../configs/commonConsts';

import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';

class TopXPathMissAndModeURL extends Component {
	constructor(props) {
		super(props);

		const { devices, modes } = XPATH_MODE_URL;

		this.state = {
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
			focusedInput: null,
			isLoading: false
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleReset = () => {
		this.setState({
			siteId: '',
			topURLCount: '',
			emailId: '',
			pageGroups: '',
			errorCode: '',
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day'),
			currentSelectedDevice: null,
			currentSelectedMode: null
		});
	};

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
			.post('/ops/xpathmiss', {
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
			.catch((err, res) => {
				console.log(err);
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: res.data,
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
			<Row className="row">
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
						isOutsideRange={() => {}}
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
						onSelect={currentSelectedDevice => {
							this.setState({ currentSelectedDevice });
						}}
						id="select-device"
						title="Select Device"
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
						onSelect={currentSelectedMode => {
							this.setState({ currentSelectedMode });
						}}
						id="select-mode"
						title="Select Mode"
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
			</Row>
		);
	}
}

export default TopXPathMissAndModeURL;
