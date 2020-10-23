import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Form, FormControl, Panel, Button } from '@/Client/helpers/react-bootstrap-imports';
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
	const [interval, setReportInterval] = useState(reportInterval || null);
	const [dates, setDates] = useState({
		startDate,
		endDate
	});

	useEffect(() => setReportName(name), [name]);
	useEffect(() => setDates({ startDate, endDate }), [startDate, endDate]);
	useEffect(() => setReportInterval(reportInterval), [reportInterval]);

	const onReportScheduleSelect = value => setReportInterval(value);

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
		<Panel className="reports-schedule u-margin-t4">
			<Panel.Title toggle>+ Save and Schedule Options</Panel.Title>
			<Panel.Collapse>
				<Panel.Body>
					<div className="aligner aligner--wrap u-margin-l4">
						<Form>
							<p>Name of saved report</p>
							<FormControl
								type="text"
								placeholder="Report Name"
								onChange={onReportNameChanged}
								value={reportName}
								name="reportName"
							/>
						</Form>
						<div className="u-margin-l4">
							{/* eslint-disable */}
							<p className="u-text-normal">Schedule</p>
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
						{interval && (
							<div className="u-margin-l2">
								<p className="u-text-normal">From</p>
								<PresetDateRangePicker
									startDate={dates.startDate || moment().add(1, 'days')}
									endDate={dates.endDate|| moment().add(2, 'days')}
									datesUpdated={({ startDate, endDate }) => setDates({ startDate, endDate })}
									isOutsideRange={day => day.isBefore(moment())}
									autoFocus
								/>
							</div>
						)}
						<div className="schedule-buttons">
							<Button onClick={saveReportHandler} bsStyle="primary" className="u-margin-l4">
								{isUpdating ? 'Update Report' : 'Save Report'}
							</Button>
							{isUpdating && (
								<Button onClick={onReportDelete} className="u-margin-l4">
									Delete Report
								</Button>
							)}
						</div>
					</div>
				</Panel.Body>
			</Panel.Collapse>
		</Panel>
	);
};

export default Schedule;
