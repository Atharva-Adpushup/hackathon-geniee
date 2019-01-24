import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = ({ show }) => (
  <aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
    <ul className="sb-nav primary-nav">
      <li>
        Dashboard
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        My Sites
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        Add New Website
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        Reporting
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        BYOD Panel
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
    </ul>

    <ul className="sb-nav secondary-nav">
      <li>
        Ads.txt Management
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        Payments
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
      <li>
        Payments Settings
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
      </li>
    </ul>
  </aside>
);

export default Sidebar;
