import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const Sidebar = ({ show }) => (
	<aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
		<ul className="sb-nav primary-nav">
			<li>
				<Link to="/dashboard" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">Dashboard</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="tachometer-alt" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
			<li>
				<Link to="/sites" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">My Sites</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="list" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
			<li>
				<Link to="/reporting" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">Reporting</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="chart-area" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
			<li>
				<Link to="/byodPanel" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">BYOD Panel</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="desktop" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
		</ul>

		<div className="cta-btn-wrap">
			<Link to="/addSite" className="cta-btn">
				<span className="cta-btn-txt-wrap">
					<span className="cta-btn-text">Add New Website</span>
				</span>
				<FontAwesomeIcon icon="plus" className="cta-btn-icon" />
			</Link>
		</div>

		<ul className="sb-nav secondary-nav">
			<li>
				<Link to="/adsTxtManagement" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">Ads.txt Management</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="align-center" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
			<li>
				<Link to="/payment" className="clearfix">
					<span className="link-text-wrap">
						<span className="link-text">Payments</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="dollar-sign" className="sb-nav-icon" />
					</span>
				</Link>
			</li>
		</ul>
	</aside>
);

export default Sidebar;
