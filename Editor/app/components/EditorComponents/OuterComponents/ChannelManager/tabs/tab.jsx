import {Tooltip, Button, OverlayTrigger } from 'react-bootstrap';
import React, {PropTypes} from 'react';
import TabSiteOptions from './tabSiteOptions.jsx';

const empyScreen = () => (<div className="tabContentbg"></div>),
	// eslint-disable-next-line react/no-multi-comp
	Tab = (props) => (
		<div className="tabAreaWrap">
			<div className="tabArea">
				<div className="borderBot"></div>
				<div className="tabBar">
				<OverlayTrigger placement="right" overlay={<Tooltip id="goToDashboard">Goto Dashboard</Tooltip>}>
				<Button className="btn btn-sm btn-flat" href="/user/dashboard"><i className="fa fa-arrow-left"></i></Button>
				</OverlayTrigger>
					<ul>
						<OverlayTrigger placement="right" overlay={<Tooltip id="createLoadPageGroup" >Create/Load PageGroup</Tooltip>}>
							<li className={props.children.length === 0 ? 'pulseAnimate' : null}>
								<a id="adNewChannel" href="#" onClick={props.handleNewChannelMenu} className="addnew">+</a>
							</li>
						</OverlayTrigger>
						{props.children.map((tabPane) => (
							<OverlayTrigger key={`trig_${tabPane.key}`} placement="bottom" overlay={<Tooltip id="pageGroupOptionsTooltip">Click for Page Group options</Tooltip>}>
								<li key={`tab_${tabPane.key}`} onClick={tabPane.props.handleClick.bind(null, tabPane)} id={'tab_' + tabPane.key}>
									<a className={props.activeKey === tabPane.key ? 'active' : 'null'} href="#">{tabPane.props.title}
										<i className="fa fa-angle-down"></i>
									</a>
								</li>
							</OverlayTrigger>
						))}
					</ul>
				<TabSiteOptions {...props} />
				</div>
			</div>
			<div className="tabContent">
				{props.children.length.length === 0 ? empyScreen() : props.children.map((tabPane) => (
					React.cloneElement(tabPane, {
						key: `tab_content_${tabPane.key}`,
						id: `tab_content_${tabPane.key}`,
						selected: (props.activeKey === tabPane.key)
					})
				))}
			</div>
		</div>
	);

Tab.propTypes = {
	handleNewChannelMenu: PropTypes.func.isRequired,
	activeKey: PropTypes.string,
	children: React.PropTypes.arrayOf(React.PropTypes.element)
};

export default Tab;
