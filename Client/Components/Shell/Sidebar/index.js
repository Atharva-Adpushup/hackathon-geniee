import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ show }) => (
	<aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
		<ul className="sb-nav primary-nav">
			<NavLink to="/dashboard" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">Dashboard</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="tachometer-alt" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>

			<NavLink to="/sites" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">My Sites</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="list" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>

			<NavLink to="/reporting" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">Reporting</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="chart-area" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>

			<NavLink to="/byodPanel" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">BYOD Panel</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="desktop" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>
		</ul>

		<div className="cta-btn-wrap">
			<NavLink to="/onboarding" className="cta-btn" activeClassName="active">
				<span className="cta-btn-txt-wrap">
					<span className="cta-btn-text">Add New Website</span>
				</span>
				<FontAwesomeIcon icon="plus" className="cta-btn-icon" />
			</NavLink>
		</div>

		<ul className="sb-nav secondary-nav">
			<NavLink to="/adsTxtManagement" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">Ads.txt Management</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="align-center" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>
			<NavLink to="/payment" className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">Payments</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon="dollar-sign" className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>
			<NavLink to="/paymentHistory" className="clearfix u-margin-l4" activeClassName="active">
				<li className="u-list-style-type-none">
					<span className="link-text-wrap">
						<span className="link-text">Payment History</span>
					</span>
				</li>
			</NavLink>
		</ul>
	</aside>
);

export default Sidebar;
