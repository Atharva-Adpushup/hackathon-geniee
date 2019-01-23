import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';

const Sidebar = ({ show }) => (
  <aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
    <ul className="sb-nav primary-nav">
      <li>Dashboard</li>
      <li>My Sites</li>
      <li>Add New Website</li>
      <li>Reporting</li>
      <li>BYOD Panel</li>
    </ul>

    <ul className="sb-nav secondary-nav">
      <li>Ads.txt Management</li>
      <li>Payments</li>
      <li>Payments Settings</li>
    </ul>
  </aside>
);

export default Sidebar;
