import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Sidebar = ({ show }) => {
	const getNavItem = (name, link, icon, showTooltip, tooltipText) => {
		const navItem = (
			<NavLink to={link} className="clearfix" activeClassName="active">
				<li>
					<span className="link-text-wrap">
						<span className="link-text">{name}</span>
					</span>
					<span className="sb-nav-icon-wrap">
						<FontAwesomeIcon icon={icon} className="sb-nav-icon" />
					</span>
				</li>
			</NavLink>
		);

		if (showTooltip) {
			const tooltip = (
				<Tooltip id={`${link.slice(1)}tooltip`} className="u-padding-v2 u-padding-h2">
					<strong>{tooltipText || name}</strong>
				</Tooltip>
			);

			return (
				<OverlayTrigger placement="right" overlay={tooltip}>
					{navItem}
				</OverlayTrigger>
			);
		}

		return navItem;
	};

	const ctaBtn = (
		<NavLink to="/addSite" className="cta-btn" activeClassName="active">
			<span className="cta-btn-txt-wrap">
				<span className="cta-btn-text">Add New Website</span>
			</span>
			<FontAwesomeIcon icon="plus" className="cta-btn-icon" />
		</NavLink>
	);

	return (
		<aside className={`sidebar ${show ? 'sb-show' : 'sb-hide'}`}>
			<ul className="sb-nav primary-nav">
				{getNavItem('Dashboard', '/dashboard', 'tachometer-alt', !show)}
				{getNavItem('My Sites', '/sites', 'list', !show)}
				{getNavItem('Reports', '/reports', 'chart-area', !show)}
				{getNavItem('Integrations', '/integrations', 'desktop', !show)}
				{getNavItem('Ops Panel', '/ops-panel', 'tools', !show)}
			</ul>

			<div className="cta-btn-wrap">
				{show ? (
					ctaBtn
				) : (
					<OverlayTrigger
						placement="right"
						overlay={
							<Tooltip id="addSiteTooltip">
								<strong>Add New Website</strong>
							</Tooltip>
						}
					>
						{ctaBtn}
					</OverlayTrigger>
				)}
			</div>

			<ul className="sb-nav secondary-nav">
				{getNavItem('Ads.txt Management', '/adsTxtManagement', 'align-center', !show)}
				{getNavItem('Payments', '/payment', 'dollar-sign', !show)}
			</ul>
		</aside>
	);
};

export default Sidebar;
