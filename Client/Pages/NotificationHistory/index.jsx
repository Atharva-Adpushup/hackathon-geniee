/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import config from '../../config/config';
import Empty from '../../Components/Empty/index';
import '../../scss/pages/notificationhistory.scss';

const NotificationHistory = ({ notifications = [] }) => {
	const extractDate = timestamp => {
		const date = new Date(timestamp);
		return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
	};

	const extractTime = timestamp => {
		const date = new Date(timestamp);
		return `${date.getHours()}:${date.getMinutes()}`;
	};

	const onNotificationClick = id => {
		const notification = notifications.filter(notif => notif.id === id)[0];
		const newPageUrl = `${config.NOTIFICATION_SERVICE.HOST}/notification/click/${id}?actionUrl=${notification.actionUrl}`;
		if (notification.actionUrl) {
			window.open(newPageUrl, '_blank');
		}
	};

	const notificationsByDate = notifications.reduce((result, notification) => {
		const date = extractDate(notification.dateCreated);
		const currentDateNotifications = result[date] || [];
		return {
			...result,
			[date]: [...currentDateNotifications, notification]
		};
	}, {});

	const notificationBatchLength = Object.keys(notificationsByDate).length - 1;

	if (!Object.keys(notificationsByDate).length) {
		return <Empty message="You don't have any notifications yet" />;
	}

	return (
		<>
			{Object.keys(notificationsByDate).map((date, idx) => {
				const notificationsForDate = notificationsByDate[date] || [];
				const notificationsLength = notificationsForDate.length - 1;
				return (
					<div className="notification-history-list">
						<p className="notification-date">{date}</p>
						<div className="notification-history-item">
							{notificationBatchLength !== idx && <div className="notification-link" />}
							<div className="notification-card u-margin-l4 u-margin-v4">
								{notificationsForDate.map((notification, index) => (
									<div
										onClick={() => onNotificationClick(notification.id)}
										className="card-item hover"
									>
										<p>{notification.message}</p>
										<p className="pull-right">{extractTime(notification.dateCreated)}</p>
										{index !== notificationsLength && <hr className="divider" />}
									</div>
								))}
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
};
export default NotificationHistory;
