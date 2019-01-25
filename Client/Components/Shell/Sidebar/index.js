import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const Sidebar = ({ show }) => (
  <aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
    <ul className="sb-nav primary-nav">
      <Link to="/dashboard" >
        <li>
            Dashboard
            <FontAwesomeIcon
              icon="tachometer-alt"
              pull="right"
              className="sb-nav-icon"
            />
        </li>
      </Link>
      <Link to="/sites" >
        <li>
          My Sites
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
      <Link to="/addSite" >
        <li>
          Add New Website
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
      <Link to="/reporting" >
        <li>
          Reporting
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
      <Link to="/byodPanel" >
        <li>
        BYOD Panel
        <FontAwesomeIcon
          icon="tachometer-alt"
          pull="right"
          className="sb-nav-icon"
        />
        </li>
      </Link>
    </ul>

    <ul className="sb-nav secondary-nav">
      <Link to="/adsTxtManagement" >
        <li>
          Ads.txt Management
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
      <Link to="/payment" >
        <li>
          Payments
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
      <Link to="/paymentSettings" >
        <li>
          Payments Settings
          <FontAwesomeIcon
            icon="tachometer-alt"
            pull="right"
            className="sb-nav-icon"
          />
        </li>
      </Link>
    </ul>
  </aside>
);

export default Sidebar;
