import React, { Component, Fragment } from 'react';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import { XPATH_MODE_URL } from '../../configs/commonConsts';
import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';
import OverlayToolTip from '../../../../Components/OverlayTooltip/index';

const { devices, modes } = XPATH_MODE_URL;
const modeToolTipText = `ADPUSHUP:1 , FALLBACK:2`;
const errorToolTipText = `NO_ERROR:1, PAGEGROUP_NOT_FOUND:2, FALLBACK_PLANNED:3, FALLBACK_FORCED:4, PAUSED_IN_EDITOR:5`;

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

library.add(faQuestionCircle);
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

	handleGenerate = e => {
		e.preventDefault();
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

		const isValid = !!(siteId && topURLCount && emailId && startDate && endDate);

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
					message: errResponse || message,
					autoDismiss: 5
				});

				this.setState({ isLoading: false });
			});
	};

	renderLabel = () => (
		<p className="u-text-bold">
			Error Code
			<OverlayToolTip id="tooltip-site-status-info" placement="top" tooltip={errorToolTipText}>
				<FontAwesomeIcon size="1x" icon={faQuestionCircle} className="u-margin-l2" />
			</OverlayToolTip>{' '}
		</p>
	);

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
			currentSelectedDevice,
			currentSelectedMode,
			pageGroups,
			errorCode,
			startDate,
			endDate,
			isLoading,
			focusedInput
		} = this.state;

		return (
			<form onSubmit={this.handleGenerate}>
				<FieldGroup
					name="siteId"
					value={siteId}
					type="number"
					label="Site Id *"
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
					label="Top URL Count *"
					onChange={this.handleChange}
					size={6}
					id="topURLCount-input"
					placeholder="Top URL Count"
					className="u-padding-v4 u-padding-h4"
				/>
				<Fragment>
					<p className="u-text-bold">Dates *</p>

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
						type="email"
						label="Email Id *"
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
					<p className="u-text-bold">
						Mode
						<OverlayToolTip id="tooltip-site-status-info" placement="top" tooltip={modeToolTipText}>
							<FontAwesomeIcon size="1x" icon={faQuestionCircle} className="u-margin-l2" />
						</OverlayToolTip>
					</p>
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
						label={this.renderLabel()}
						onChange={this.handleChange}
						size={6}
						id="erroCode-input"
						placeholder="Error Code"
						className="u-padding-v4 u-padding-h4"
					/>
				</div>
				<CustomButton
					type="submit"
					variant="primary"
					className="pull-right u-margin-r3"
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
			</form>
		);
	}
}

export default TopXPathMissAndModeURL;
