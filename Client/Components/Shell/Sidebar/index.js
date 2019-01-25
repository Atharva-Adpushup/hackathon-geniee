import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Sidebar = ({ show }) => (
	<aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
		<ul className="sb-nav primary-nav">
			<li>
				<Link to="/dashboard">
					Dashboard
					<FontAwesomeIcon icon="tachometer-alt" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
			<li>
				<Link to="/sites">
					My Sites
					<FontAwesomeIcon icon="list" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
			<li>
				<Link to="/reporting">
					Reporting
					<FontAwesomeIcon icon="chart-area" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
			<li>
				<Link to="/byodPanel">
					BYOD Panel
					<FontAwesomeIcon icon="desktop" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
		</ul>

		<div className="cta-btn-wrap">
			<Link to="/addSite" className="cta-btn">
				Add New Website
			</Link>
		</div>

		<ul className="sb-nav secondary-nav">
			<li>
				<Link to="/adsTxtManagement">
					Ads.txt Management
					<FontAwesomeIcon icon="align-center" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
			<li>
				<Link to="/payment">
					Payments
					<FontAwesomeIcon icon="dollar-sign" pull="right" className="sb-nav-icon" />
				</Link>
			</li>
		</ul>
	</aside>
);

export default Sidebar;
