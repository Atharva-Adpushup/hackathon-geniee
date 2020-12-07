import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
	Col,
	Row,
	Checkbox,
	Table,
	Label,
	Glyphicon,
	DropdownButton,
	InputGroup
} from '@/Client/helpers/react-bootstrap-imports';
// import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import CustomButton from '../../../../Components/CustomButton/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import axiosInstance from '../../../../helpers/axiosInstance';
import Loader from '../../../../Components/Loader';
// import Table from '../../../Reporting/components/Table';

const DashboardNotifications = ({ showNotification }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [notificationText, setNotificationText] = useState('');
	const [actionUrlValue, setActionUrlValue] = useState('');
	const [allAccountEmails, setAccountEmails] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedEmails, setSelectedEmails] = useState({});
	const [allNotifications, setAllNotifications] = useState({});
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectBoxLabelText, setSelectBoxLabelText] = useState(0);

	const handleSearchTextChange = e => {
		let currentList = [];

		let newList = [];

		if (e.target.value !== '') {
			currentList = allAccountEmails;

			newList = currentList.filter(email => {
				if (email) {
					const lc = email.toLowerCase();

					const filter = e.target.value.toLowerCase();

					return lc.includes(filter);
				}
				return false;
			});
		} else {
			newList = allAccountEmails;
		}

		setFilteredList(newList);
	};

	useEffect(() => {
		axiosInstance.get('/user/findUsers').then(response => {
			// const { allNotifications } = response;
			const allAccounts = [];
			const filteredListData = [];
			const accountDetails = response.data.data.users;
			const selectedEmailsData = { ...selectedEmails };
			Object.keys(accountDetails).forEach(accountData => {
				const accountEmail = accountDetails[accountData].email;
				if (!allAccounts.includes(accountEmail)) {
					allAccounts.push(accountEmail);
					filteredListData.push(accountEmail);
					selectedEmailsData[accountEmail] = false;
				}
			});
			setAccountEmails(allAccounts);
			setFilteredList(filteredListData);
			setSelectedEmails(selectedEmailsData);
		});

		axiosInstance.get('/ops/getAllNotifications').then(response => {
			const { data } = response;
			const allNotificationsArray = data.data;

			const notificationsData = {};
			allNotificationsArray.forEach(notification => {
				const { userEmail, message, actionUrl, notificationMeta, dateCreated } = notification;
				const groupId = notificationMeta && notificationMeta.groupId;
				if (!groupId) {
					return;
				}
				const allUser = notificationMeta.allUser ? notificationMeta.allUser : false;
				if (!notificationsData[groupId]) {
					notificationsData[groupId] = {
						dateCreated,
						message,
						actionUrl,
						allUser,
						userNotification: []
					};
				}
				notificationsData[groupId].userNotification.push(userEmail);
			});

			setAllNotifications(notificationsData);
		});
	}, []);

	const sendNotification = () => {
		setIsLoading(true);
		const notificationObject = {};
		const selectedEmailsList = [];
		let allUserStatus = false;
		Object.keys(selectedEmails).forEach(email => {
			if (selectedEmails[email]) {
				selectedEmailsList.push(email);
			}
		});
		if (Object.keys(selectedEmails).length === selectedEmailsList.length) {
			allUserStatus = true;
		}
		notificationObject.emails = selectedEmailsList;
		notificationObject.actionUrl = actionUrlValue;
		notificationObject.notificationText = notificationText;

		if (!notificationText) {
			setIsLoading(false);
			return showNotification({
				mode: 'error',
				title: 'Send Notification Failed',
				message: 'Notification Text is Mandatory',
				autoDismiss: 5
			});
		}

		if (
			actionUrlValue &&
			!(actionUrlValue.includes('https://') || actionUrlValue.includes('http://'))
		) {
			setIsLoading(false);
			return showNotification({
				mode: 'error',
				title: 'Send Notification Failed',
				message: 'Please Add Valid Action Url. It must include http:// or https://',
				autoDismiss: 5
			});
		}

		if (selectBoxLabelText === 0) {
			setIsLoading(false);
			return showNotification({
				mode: 'error',
				title: 'Send Notification Failed',
				message: 'Please select atleast 1 email',
				autoDismiss: 5
			});
		}

		axiosInstance
			.post('/ops/sendNotification', { notificationData: notificationObject, allUserStatus })
			.then(() => {
				setIsLoading(false);
				return showNotification({
					mode: 'success',
					title: 'Operation Successful',
					message: 'Notification Sent successfully',
					autoDismiss: 5
				});
			})
			.catch(() => {
				setIsLoading(false);
				return showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Failed to send notification',
					autoDismiss: 5
				});
			});
		return false;
	};

	const setSelectBoxLabelTextCompute = () => {
		const finalFilteredList = filteredList.filter(email => selectedEmails[email] === true);
		setSelectBoxLabelText(finalFilteredList.length);
	};

	const handleFilterValueSelect = (e, email) => {
		// {value, name, checked} = e.target;
		const tempValues = { ...selectedEmails };
		tempValues[email] = e.target.checked;
		const value = selectBoxLabelText;

		if (tempValues[email]) {
			setSelectBoxLabelText(value + 1);
		} else {
			setSelectBoxLabelText(value - 1);
		}
		setSelectedEmails(tempValues);
	};

	const selectAllEmails = () => {
		const tempValues = { ...selectedEmails };
		filteredList.forEach(email => {
			tempValues[email] = true;
		});
		setSelectedEmails(tempValues);
		setSelectBoxLabelTextCompute();
	};

	const selectNoEmails = () => {
		const tempValues = { ...selectedEmails };
		filteredList.forEach(email => {
			tempValues[email] = false;
		});
		setSelectedEmails(tempValues);
		setSelectBoxLabelTextCompute();
	};

	const dropdownToggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const selectBoxLabels = (
		<Label
			bsStyle="info"
			className="u-margin-r2"
			style={{ height: '19px' }}
			key="select_emails_labels"
		>
			{`${selectBoxLabelText} Emails Selected`}
			<Glyphicon glyph="remove" className="u-margin-l1" onClick={selectNoEmails} />
		</Label>
	);

	return (
		<>
			{!allAccountEmails.length ? (
				<>
					<Loader />
				</>
			) : (
				<>
					<Row className="mb-3">
						<Col md="12">
							<FieldGroup
								name="notificationText"
								type="text"
								label="Notification Text"
								id="notification-text-input"
								placeholder="Notification Text"
								className="u-padding-h4"
								onChange={e => {
									setNotificationText(e.target.value);
								}}
								value={notificationText}
								required
							/>
						</Col>
						<Col md="12">
							<FieldGroup
								name="clickThroughUrl"
								type="text"
								label="Clickthrough URL"
								id="click-through-input"
								placeholder="https://adpushup.com"
								className="u-padding-v4 u-padding-h4"
								onChange={e => {
									setActionUrlValue(e.target.value);
								}}
								value={actionUrlValue}
							/>
						</Col>
						<Col md="10">
							<InputGroup>
								<InputGroup.Addon>Email Filter</InputGroup.Addon>
								<div className="custom-select-box-wrapper">
									<DropdownButton
										open={menuOpen}
										onToggle={dropdownToggleMenu}
										id="async-group-select-dropdown"
										className=" custom-select-box u-padding-l2 "
										aria-hidden="true"
										title={
											<div className="aligner aligner--hStart  aligner--wrap">
												{selectBoxLabels}
											</div>
										}
									>
										<div className="react-select-box-off-screen-1" aria-hidden="true">
											<input
												type="text"
												className="input inputSearch"
												placeholder="Search..."
												onChange={handleSearchTextChange}
												onSelect={e => e.stopPropagation()}
											/>
											<div>
												<a
													onClick={selectAllEmails}
													style={{ cursor: 'pointer' }}
													className="u-margin-l3 u-margin-r2"
												>
													Select All
												</a>
												<a onClick={selectNoEmails} style={{ cursor: 'pointer' }}>
													None
												</a>
											</div>

											{filteredList && filteredList.length > 0 ? (
												<div className="filterValues" style={{ overflow: 'auto' }}>
													{filteredList.map(email => (
														<Checkbox
															className="col-sm-12"
															key={email}
															type="checkbox"
															onChange={e => {
																handleFilterValueSelect(e, email);
															}}
															checked={
																selectedEmails[email] !== null ? selectedEmails[email] : false
															}
														>
															{email}
														</Checkbox>
													))}
												</div>
											) : (
												<div className="inputSearch text-center">No Value Found</div>
											)}
										</div>
									</DropdownButton>
								</div>
							</InputGroup>
						</Col>
						<Col md="2">
							<CustomButton
								variant="primary"
								className="pull-right"
								showSpinner={isLoading}
								onClick={sendNotification}
							>
								Send Notification
							</CustomButton>
						</Col>
					</Row>

					<Row className="u-margin-t2">
						<Col md="12">
							<h4>
								<b>Sent Notifications</b>
							</h4>
						</Col>
						<Col md="12" className="pt-3 mt-3">
							<Table striped bordered hover condensed responsive>
								<thead>
									<tr>
										<th>S no</th>
										<th>Date Sent</th>
										<th>Receipient</th>
										<th>Notification Text</th>
										<th>Action Url</th>
									</tr>
								</thead>
								<tbody>
									{Object.keys(allNotifications).map((groupId, index) => {
										const notification = allNotifications[groupId];
										return (
											<tr>
												<td>{index + 1}</td>
												<td>{moment(notification.dateCreated).format('DD/MM/YYYY')}</td>
												<td>
													{notification.allUser
														? 'All Users'
														: notification.userNotification && notification.userNotification.join()}
												</td>
												<td>{notification.message}</td>
												<td>{notification.actionUrl}</td>
											</tr>
										);
									})}
								</tbody>
							</Table>
						</Col>
					</Row>
				</>
			)}
		</>
	);
};

export default DashboardNotifications;
