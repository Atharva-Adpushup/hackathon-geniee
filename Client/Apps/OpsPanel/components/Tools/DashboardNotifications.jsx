import React, { useState, useEffect } from 'react';
import { Col, Row, Checkbox, Button, Table } from '@/Client/helpers/react-bootstrap-imports';
// import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch';
import CustomButton from '../../../../Components/CustomButton/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import axiosInstance from '../../../../helpers/axiosInstance';
// import Table from '../../../Reporting/components/Table';

const DashboardNotifications = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [notificationText, setNotificationText] = useState('');
	const [actionUrl, setActionUrl] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [allAccountEmails, setAccountEmails] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedEmails, setSelectedEmails] = useState({});
	const [allNotifications, setAllNotifications] = useState([]);

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
			setAllNotifications(allNotificationsArray);
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
		notificationObject.actionUrl = actionUrl;
		notificationObject.notificationText = notificationText;

		axiosInstance
			.post('/ops/sendNotification', { notificationData: notificationObject })
			.then(response => {
				setIsLoading(false);
			})
			.catch(error => {
				setIsLoading(false);
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
				<div>Please Wait</div>
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
								setActionUrl(e.target.value);
							}}
							value={actionUrl}
						/>
					</div>

					<div className="react-select-box-off-screen-1" aria-hidden="true">
						<FieldGroup
							name="Search"
							type="text"
							label="Search Emails"
							id="search"
							onChange={handleSearchTextChange}
							value={filterValue}
						/>

						<Row>
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
										<th>Notification Text</th>
										<th>Action Url</th>
									</tr>
								</thead>
								<tbody>
									{allNotifications.map((data, index) => (
										<tr>
											<td>{index + 1}</td>
											<td>{data.dateCreated}</td>
											<td>{data.message}</td>
											<td>{data.actionUrl}</td>
										</tr>
									))}
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
