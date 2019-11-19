/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import history from '../../../helpers/history';
import UserChange from './UserChange';
import config from '../../../config/config';

const Header = ({ sidebarToggle, logout, user, switchUser, findUsers, hasUnsavedChanges }) => {
	function handleLogout() {
		if (hasUnsavedChanges) {
			// eslint-disable-next-line no-alert
			const confirmed = window.confirm(config.HB_MSGS.UNSAVED_CHANGES);
			if (!confirmed) return;
		}

		logout()
			.then(() => history.push('/login'))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
			});
	}

	return (
		<header className='ap-page-header'>
			<span onClick={sidebarToggle} className='nav-toggle'>
				<FontAwesomeIcon icon='bars' />
			</span>
			<span className='ap-logo'>
				<img src='/assets/images/adpushup-logo-small.png' alt='AdPushup' />
			</span>

			<div className='header-nav'>
				{user.isSuperUser ? <UserChange switchUser={switchUser} findUsers={findUsers} /> : null}

				<DropdownButton pullRight title={`Hello ${user.firstName || ''}`} id='dropdown-button'>
					{/* <MenuItem eventKey="1">Profile</MenuItem> */}
					{/* <MenuItem eventKey="2">Settings</MenuItem> */}
					<MenuItem
						eventKey='3'
						href='https://support.adpushup.com/portal/home'
						target='_blank'
						rel='noopener noreferrer'
					>
						Support
					</MenuItem>
					<MenuItem eventKey='4' onClick={handleLogout}>
						Logout
					</MenuItem>
				</DropdownButton>
			</div>
		</header>
	);
};

export default Header;
