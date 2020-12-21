import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Datatable from 'react-bs-datatable';
import {
	Col,
	Row,
	Checkbox,
	Label,
	Glyphicon,
	DropdownButton,
	InputGroup
} from '@/Client/helpers/react-bootstrap-imports';
import 'react-table/react-table.css';
import '../../../../Components/Tags/styles.scss';
import CustomButton from '../../../../Components/CustomButton/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import axiosInstance from '../../../../helpers/axiosInstance';
import Loader from '../../../../Components/Loader';

const DashboardNotifications = ({ showNotification }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [notificationText, setNotificationText] = useState('');
	const [actionUrlValue, setActionUrlValue] = useState('');
	const [allAccountEmails, setAccountEmails] = useState([]);
	const [filteredList, setFilteredList] = useState([]);
	const [selectedEmails, setSelectedEmails] = useState({});
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectBoxLabelText, setSelectBoxLabelText] = useState(0);
	const [tableConfig, setTableConfig] = useState({});

	const onSort = {
		Date: value => moment(value, 'dd MMM YYYY').valueOf()
	};

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
			const allAccounts = [];
			const filteredListData = [];
			const { data } = response.data;
			const accountDetails = data.users;
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
			const { data } = response.data;
			const allNotificationsArray = data;

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

			const tableBody = [];
			Object.keys(notificationsData).map(groupId => {
				const notification = notificationsData[groupId];
				if (!notification) {
					return;
				}

				const receipient = notification.allUser
					? 'All Users'
					: notification.userNotification && notification.userNotification.join();

				const row = {
					Date: notification.dateCreated,
					Recepients: receipient,
					Notification: notification.message,
					actionUrl: notification.actionUrl
				};

				tableBody.push(row);
			});

			tableBody.sort((a, b) => b.Date.toString().localeCompare(a.Date.toString()));

			const tableBodyData = tableBody.map((dataValue, index) => {
				const dataValues = { ...dataValue };
				dataValues.Sno = index + 1;
				dataValues.Date = moment(dataValues.Date).format('MMM DD YYYY');
				return dataValues;
			});

			const headers = [
				{ title: 'Sno', prop: 'Sno', sortable: true },
				{ title: 'Date', prop: 'Date', sortable: true },
				{ title: 'Recepients', prop: 'Recepients', sortable: true },
				{ title: 'Notification', prop: 'Notification', sortable: true },
				{ title: 'Action Url', prop: 'actionUrl', sortable: true }
			];
			const tableData = { headers, body: tableBodyData };
			setTableConfig(tableData);
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
		let recentlySelected= 0;
		filteredList.forEach(email => {
			if(!tempValues[email]){
				tempValues[email] = true;
				recentlySelected++;
			}
		});
		setSelectedEmails(tempValues);
		setSelectBoxLabelText(selectBoxLabelText+recentlySelected);
	};

	const selectNoEmails = () => {
		const tempValues = { ...selectedEmails };
		let recentlyDeSelected = 0;
		filteredList.forEach(email => {
			if(tempValues[email]){
				tempValues[email] = false;
				recentlyDeSelected++;
			}
		});
		setSelectedEmails(tempValues);
		setSelectBoxLabelText(selectBoxLabelText-recentlyDeSelected);
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

	const customLabels = {
		first: '<<',
		last: '>>',
		prev: '<',
		next: '>',
		show: 'Show',
		entries: 'rows',
		noResults: 'There is no data to be displayed'
	};

	return (
		<>
			{!allAccountEmails.length ? (
				<>
					<Loader />
				</>
			) : (
				<>
					<Row className="mb-3">
						<Col md={12}>
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
						<Col md={12}>
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
						<Col md={10}>
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
						<Col md={2}>
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

					<Row className="u-margin-t3">
						<Col md={12}>
							<h4>
								<b>Sent Notifications</b>
							</h4>
						</Col>
						<Col md={12} className="report-table pt-3 mt-3">
							<Datatable
								tableHeader={tableConfig.headers}
								tableBody={tableConfig.body}
								rowsPerPage={20}
								rowsPerPageOption={[20, 30, 40, 50]}
								onSort={onSort}
								paginationButtonGroup={false}
								labels={customLabels}
							/>
						</Col>
					</Row>
				</>
			)}
		</>
	);
};

export default DashboardNotifications;
