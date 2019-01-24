import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownButton, MenuItem } from 'react-bootstrap';

const Header = ({ sidebarToggle }) => (
  <header className="ap-page-header">
    <span onClick={sidebarToggle} className="nav-toggle">
      <FontAwesomeIcon icon="bars" />
    </span>
    <span className="ap-logo">AdPushup</span>

    <DropdownButton pullRight title="Howdy Arun" id="dropdown-button">
      <MenuItem eventKey="1">Profile</MenuItem>
      <MenuItem eventKey="2">Settings</MenuItem>
      <MenuItem eventKey="3">Support</MenuItem>
      <MenuItem eventKey="4">Logout</MenuItem>
    </DropdownButton>
  </header>
);

export default Header;
