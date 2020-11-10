import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import socketIo from 'socket.io-client';
import { Dropdown, MenuItem } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import authService from '../../../services/authService';
import config from '../../../config/config';
import NotificationItem from './NotificationItem';
import CustomButton from '../../CustomButton';

import '../../../scss/shared/shell/notification.scss';

const Notification = props => {
	const {
		notifications = [],
		sites = {},
		replaceUnseenNotifications,
		addUnseenNotification
	} = props;

	useEffect(() => {
		const io = socketIo(config.NOTIFICATION_SERVICE.HOST, {
			query: {
				authToken: authService.getAuthToken()
			},
			timeout: 5000
		});
		io.on('prevNotifications', payload => {
			const { notifications: prevNotifications } = payload;
			if (prevNotifications)
				prevNotifications.forEach(notification => io.emit('notificationReceived', notification.id));
			// for (const notification of notifications) io.emit('notificationReceived', notification.id);
			replaceUnseenNotifications(prevNotifications);
		});

		io.on('newNotification', notification => {
			io.emit('notificationReceived', notification.id);
			addUnseenNotification(notification);
		});

		return () => io.disconnect();
	}, []);

	const onNotificationClick = id => {
		const notification = notifications.filter(notif => notif.id === id)[0];
		const newPageUrl = `${config.NOTIFICATION_SERVICE.HOST}/notification/click/${id}?actionUrl=${notification.actionUrl}`;
		if (notification.actionUrl) {
			window.open(newPageUrl, '_blank');
		}
	};

	const notificationCount = notifications.length;
	const isNotificationsEmpty = notificationCount === 0;

	return (
		<Dropdown pullRight className="u-margin-r3 u-margin-l3" id="notification">
			<Dropdown.Toggle>
				<FontAwesomeIcon icon="bell" />
				<span className="notification-bell">{notificationCount || null}</span>
			</Dropdown.Toggle>
			<Dropdown.Menu className="notifications-list">
				{!isNotificationsEmpty &&
					notifications.map((notification, index) => (
						<>
							<NotificationItem
								notification={notification}
								site={sites[notification.siteId]}
								onClick={onNotificationClick}
							/>
							{index !== notificationCount - 1 && <MenuItem divider />}
						</>
					))}
				{isNotificationsEmpty && (
					<>
						<div className="notification-empty u-margin-v3">No unread notifications pending</div>
					</>
				)}
				<div className="notification-action u-margin-t2">
					<div className="divider" />
					<NavLink to="/notifications">
						<CustomButton variant="secondary" className="all-notifications">
							See all notifications
						</CustomButton>
					</NavLink>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
export default Notification;
