import React, { useState, useEffect } from 'react';
import { Form, FormControl, Panel, Button } from '@/Client/helpers/react-bootstrap-imports';

const Schedule = ({
	name,
	isUpdating,
	onReportSave,
	onReportUpdate,
	onReportDelete,
	showNotification,
	updateReportName
}) => {
	const [reportName, setReportName] = useState(name || '');

	useEffect(() => setReportName(name), [name]);

	const onReportNameChanged = e => {
		const newReportName = e.target.value;
		updateReportName(newReportName);
	};

	const saveReportHandler = () => {
		const scheduleOptions = {};

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
			<Panel.Title toggle>+ Save Options</Panel.Title>
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
						<div className="schedule-buttons">
							<Button onClick={saveReportHandler} className="u-margin-l4 btn--secondary">
								{isUpdating ? 'Rename Report' : 'Add Report'}
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
