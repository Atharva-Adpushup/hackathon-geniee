import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Col, Row, Checkbox, Button, Table } from '@/Client/helpers/react-bootstrap-imports';
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
	const [filterValue, setFilterValue] = useState('');
	const [allAccountEmails, setAccountEmails] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedEmails, setSelectedEmails] = useState({});
	const [allNotifications, setAllNotifications] = useState({});

	const handleSearchTextChange = e => {
		setFilterValue(e.target.value);
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
			// allNotificationsArray.push({
			// 	dateSent: 1605732425855,
			// 	recipients: [''],
			// 	notificationText: 'oka test',
			// 	actionUrl: 'google.com'
			// });

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
		Object.keys(selectedEmails).forEach(email => {
			if (selectedEmails[email]) {
				selectedEmailsList.push(email);
			}
		});
		notificationObject.emails = selectedEmailsList;
		notificationObject.actionUrl = actionUrlValue;
		notificationObject.notificationText = notificationText;

		// showNotification({
		// 	mode: 'error',
		// 	title: 'Notification Sent Successfully',
		// 	message: 'Failed to send notification',
		// 	autoDismiss: 5
		// });

		axiosInstance
			.post('/ops/sendNotification', { notificationData: notificationObject })
			.then(() => {
				setIsLoading(false);
				return showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Notification Sent',
					autoDismiss: 5
				});
			})
			.catch(() => {
				setIsLoading(false);
				return showNotification({
					mode: 'error',
					title: 'Send Notification Failed',
					message: 'Failed to send notification',
					autoDismiss: 5
				});
			});
		return false;
	};

	const handleFilterValueSelect = (e, email) => {
		// {value, name, checked} = e.target;
		const tempValues = { ...selectedEmails };
		tempValues[email] = e.target.checked;
		setSelectedEmails(tempValues);
	};

	const selectAllEmails = () => {
		const tempValues = { ...selectedEmails };
		filteredList.forEach(email => {
			tempValues[email] = true;
		});
		setSelectedEmails(tempValues);
	};

	const selectNoEmails = () => {
		const tempValues = { ...selectedEmails };
		Object.keys(tempValues).forEach(email => {
			tempValues[email] = false;
		});
		setSelectedEmails(tempValues);
	};

	return (
		<>
			{!allAccountEmails.length ? (
				<>
					<Loader />
				</>
			) : (
				<>
					<div>
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
						<FieldGroup
							name="clickThroughUrl"
							type="text"
							label="Clickthrough URL"
							id="click-through-input"
							placeholder="Click Through URL"
							className="u-padding-v4 u-padding-h4"
							onChange={e => {
								setActionUrlValue(e.target.value);
							}}
							value={actionUrlValue}
						/>
					</div>

					<div className="react-select-box-off-screen-1" aria-hidden="true">
						<Row>
							<Col className="mt-2">
								<FieldGroup
									name="Search"
									type="text"
									placeholder="Seach Emails"
									id="search"
									onChange={handleSearchTextChange}
									value={filterValue}
								/>
							</Col>
							<Col>
								<Button onClick={selectAllEmails} style={{ cursor: 'pointer' }}>
									Select All
								</Button>
								<Button
									onClick={selectNoEmails}
									className="u-padding-h4 u-margin-l3"
									style={{ cursor: 'pointer' }}
								>
									None
								</Button>
							</Col>
						</Row>

						<div className="filterValues">
							{filteredList.map(email => (
								<Checkbox
									className="col-sm-12"
									key={email}
									type="checkbox"
									onChange={e => {
										handleFilterValueSelect(e, email);
									}}
									checked={selectedEmails[email] !== null ? selectedEmails[email] : false}
								>
									{email}
								</Checkbox>
							))}
						</div>
					</div>

					<Row>
						<Col>
							<CustomButton
								variant="primary"
								className="pull-right u-margin-t3"
								showSpinner={isLoading}
								onClick={sendNotification}
							>
								Send Notification
							</CustomButton>
						</Col>
					</Row>

					<Row>
						<Col>
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
