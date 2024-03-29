import React from 'react';
import { Grid, Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import Breadcrumbs from 'react-router-dynamic-breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Loader from '../Loader/index';
import { domanize } from '../../helpers/commonFunctions';
import { ROUTES } from '../../constants/others';

import routeConfig from '../../routeConfig';

function shouldWeOpenSidebar(location = { pathname: false }) {
	if (!location.pathname) return true;
	return !ROUTES.SIDEBAR_CLOSE.some(route => route.test(location.pathname));
}

class Shell extends React.Component {
	state = {};

	componentDidMount() {
		const { userFetched, fetchGlobalData } = this.props;
		if (!userFetched) fetchGlobalData();
	}

	sidebarToggle = () => {
		this.setState(state => ({ isSidebarOpen: !state.isSidebarOpen }));
	};

	isBlackListedRoute = path => {
		const { BLACK_LIST: blackListedArray } = ROUTES;
		const isValid = !!(blackListedArray.indexOf(path) > -1);

		return isValid;
	};

	getRoutes = (collection, location, user) => {
		const { DYNAMIC_PARAMS: dynamicParamsArray } = ROUTES;
		const userSites = user && user.sites;
		const { pathname } = location;
		const isBlackListedRoute = this.isBlackListedRoute(pathname);

		if (isBlackListedRoute) {
			return false;
		}

		const allRoutesMapping = collection.reduce((accumulator, value) => {
			const { path } = value;
			let { name } = value;

			dynamicParamsArray.forEach(param => {
				const isParamInPath = !!path.match(param);
				const siteIdInEndMatch = pathname.match('/[0-9]{1,10}$');
				const siteIdInBetweenMatch = pathname.match('/[0-9]{1,10}/');

				if (!isParamInPath) {
					return true;
				}

				if (siteIdInEndMatch) {
					const siteId = pathname.substring(siteIdInEndMatch.index + 1);
					const siteName = userSites && user.sites[siteId] && user.sites[siteId].domain;

					if (siteName) {
						name = domanize(siteName);
					}
				}

				if (siteIdInBetweenMatch) {
					const siteId = siteIdInBetweenMatch[0].replace(/\//g, '');
					const siteName = userSites && user.sites[siteId] && user.sites[siteId].domain;

					if (siteName) {
						const domanizedSiteName = domanize(siteName);
						const paramRegex = `${param}`;

						name = name.replace(new RegExp(paramRegex, 'g'), domanizedSiteName);
					}
				}

				return true;
			});

			accumulator[path] = name;
			return accumulator;
		}, {});
		return allRoutesMapping;
	};

	render() {
		const { isSidebarOpen } = this.state;
		const {
			children,
			userFetched,
			user,
			associatedAccounts,
			sites,
			location,
			logout,
			switchUser,
			impersonateCurrentUser,
			findUsers,
			findUsersAction,
			hasUnsavedChanges,
			showPaymentStatusBar
		} = this.props;
		const routes = this.getRoutes(routeConfig.private, location, user);
		const sidebarOpen = isSidebarOpen !== undefined ? isSidebarOpen : shouldWeOpenSidebar(location);
		if (
			userFetched &&
			!user.isPaymentDetailsComplete &&
			!window.location.pathname.includes('payment')
		) {
			showPaymentStatusBar(true);
		}

		return (
			<Grid fluid>
				<Row style={{ zIndex: 1 }}>
					<Col>
						<Header
							sidebarToggle={this.sidebarToggle}
							user={user}
							associatedAccounts={associatedAccounts}
							logout={logout}
							switchUser={switchUser}
							impersonateCurrentUser={impersonateCurrentUser}
							findUsers={findUsers}
							findUsersAction={findUsersAction}
							hasUnsavedChanges={hasUnsavedChanges}
						/>
					</Col>
				</Row>
				<Row className="sidebar-main-wrap">
					<Sidebar show={sidebarOpen} user={user} sites={sites} />
					<main className="main-content">
						{routes ? <Breadcrumbs mappedRoutes={routes} /> : null}
						{userFetched ? <div>{children}</div> : <Loader />}
					</main>
				</Row>
			</Grid>
		);
	}
}
export default Shell;
