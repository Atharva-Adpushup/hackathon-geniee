import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { logoutAction } from '../../../actions/userActions';
import history from '../../../helpers/history';

const Header = ({ sidebarToggle, logoutAction }) => (
	<header className="ap-page-header">
		<span onClick={sidebarToggle} className="nav-toggle">
			<FontAwesomeIcon icon="bars" />
		</span>
		<span className="ap-logo">
			<img src="https://console.adpushup.com/assets/images/logo.png" alt="AdPushup" />
		</span>

		<DropdownButton pullRight title="Hello Arun" id="dropdown-button">
			<MenuItem eventKey="1">Profile</MenuItem>
			<MenuItem eventKey="2">Settings</MenuItem>
			<MenuItem eventKey="3">Support</MenuItem>
			<MenuItem
				eventKey="4"
				onClick={() =>
					logoutAction()
						.then(() => history.push('/login'))
						.catch(() => {
							// handling error in action
						})
				}
			>
				Logout
			</MenuItem>
		</DropdownButton>
	</header>
);

export default connect(
	null,
	{ logoutAction }
)(Header);
