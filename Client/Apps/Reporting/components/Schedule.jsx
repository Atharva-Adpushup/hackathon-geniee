import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
	Form,
	FormControl,
	ControlLabel,
	Panel,
	Button
} from '@/Client/helpers/react-bootstrap-imports';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import SelectBox from '../../../Components/SelectBox/index';
import { getReportScheduleIntervals } from '../helpers/utils';

const Schedule = ({
	name,
	startDate,
	endDate,
	reportInterval,
	isUpdating,
	onReportSave,
    onReportUpdate,
    onReportDelete,
	showNotification
}) => {
	const [reportName, setReportName] = useState(name || '');
	const [interval, setInterval] = useState(reportInterval || null);
	const [dates, setDates] = useState({
		startDate: startDate || null,
		endDate: endDate || null
	});

	useEffect(() => setReportName(name), [name]);
	useEffect(() => setDates({ startDate, endDate }), [startDate, endDate]);
	useEffect(() => setInterval(reportInterval), [reportInterval]);

	const onReportScheduleSelect = value => setInterval(value);

	const onReportNameChanged = e => setReportName(e.target.value);

	const saveReportHandler = () => {
		const scheduleOptions = {};

		if (interval && dates.startDate && dates.endDate) {
			scheduleOptions.interval = interval;
			scheduleOptions.startDate = dates.startDate;
			scheduleOptions.endDate = dates.endDate;
		}

		if (!reportName || !reportName.length) {
			showNotification({
				mode: 'error',
				title: 'Save report failed',
				message: 'Failed to save report. Report name is required',
				autoDismiss: 5
			});
			return;
		}
		if (isUpdating) onReportUpdate(scheduleOptions, reportName);
		else onReportSave(scheduleOptions, reportName);
	};

	return (
		<Panel defaultExpanded className="reports-schedule u-margin-t4">
			<Panel.Title toggle>+ Save and Schedule Options</Panel.Title>
			<Panel.Collapse>
				<Panel.Body>
					<div className="aligner aligner--wrap u-margin-l4">
						<Form>
							<ControlLabel>Name for the saved report</ControlLabel>
							<FormControl
								type="text"
								placeholder="Report Name"
								onChange={onReportNameChanged}
								value={reportName}
								name="reportName"
							/>
						</Form>
					</div>
					<div className="aligner aligner--wrap u-margin-t4 u-margin-l4">
						<div>
							{/* eslint-disable */}
									<label className="u-text-normal">Schedule</label>
									{/* eslint-disable */}
									<SelectBox
										id="schedule"
										key="schedule"
										isClearable={false}
										isSearchable={false}
										wrapperClassName="custom-select-box-wrapper"
										reset={false}
										selected={interval}
										options={getReportScheduleIntervals()}
										onSelect={onReportScheduleSelect}
									/>
								</div>
								<div className="u-margin-l2">
									<label className="u-text-normal">From</label>
									<PresetDateRangePicker
										startDate={moment(dates.startDate)}
										endDate={moment(dates.endDate)}
										datesUpdated={({ startDate, endDate }) => setDates({startDate, endDate})}
										isOutsideRange={day => day.isBefore(moment()) }
										autoFocus
									/>
								</div>
							</div>
							<div className="u-margin-t4">
                                <Button onClick={saveReportHandler} bsStyle="primary" className="u-margin-l4">{isUpdating ? "Update Report" : "Save Report"}</Button>
                                {isUpdating && 	<Button onClick={onReportDelete} className="u-margin-l4">Delete Report</Button>}
							</div>
						</Panel.Body>
					</Panel.Collapse>
				</Panel>
    )

}

export default Schedule;