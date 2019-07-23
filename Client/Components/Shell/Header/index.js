/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import history from '../../../helpers/history';
import UserChange from './UserChange';

const Header = ({ sidebarToggle, logout, user, switchUser, findUsers }) => (
	<header className="ap-page-header">
		<span onClick={sidebarToggle} className="nav-toggle">
			<FontAwesomeIcon icon="bars" />
		</span>
		<span className="ap-logo">
			<img src="https://console.adpushup.com/assets/images/logo.png" alt="AdPushup" />
		</span>

		<div className="header-nav">
			{user.isSuperUser ? <UserChange switchUser={switchUser} findUsers={findUsers} /> : null}

			<DropdownButton pullRight title={`Hello ${user.firstName || ''}`} id="dropdown-button">
				{/* <MenuItem eventKey="1">Profile</MenuItem> */}
				{/* <MenuItem eventKey="2">Settings</MenuItem> */}
				<MenuItem
					eventKey="3"
					href="https://support.adpushup.com/portal/home"
					target="_blank"
					rel="noopener noreferrer"
				>
					Support
				</MenuItem>
				<MenuItem
					eventKey="4"
					onClick={() =>
						logout()
							.then(() => history.push('/login'))
							.catch(() => {
								// handling error in action
							})
					}
				>
					Logout
				</MenuItem>
			</DropdownButton>
		</div>
	</header>
);

export default Header;
