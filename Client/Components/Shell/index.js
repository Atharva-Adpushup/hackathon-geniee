import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Breadcrumbs from 'react-router-dynamic-breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Loader from '../Loader/index';
import { domanize } from '../../helpers/commonFunctions';
import { ROUTES } from '../../constants/others';

class Shell extends React.Component {
	state = { isSidebarOpen: true };

	componentDidMount() {
		console.log(this.props);
		const { userFetched, reportsFetched, fetchGlobalData } = this.props;
		if (!reportsFetched || !userFetched) fetchGlobalData();
	}

	sidebarToggle = () => {
		this.setState(state => ({ isSidebarOpen: !state.isSidebarOpen }));
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);

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

		return collection.reduce((accumulator, value) => {
			const { path } = value.props;
			let { name } = value.props;

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
	};

	render() {
		const { isSidebarOpen } = this.state;
		const { children, userFetched, reportsFetched, user, location } = this.props;
		const routes = this.getRoutes(children, location, user);

		return (
			<Grid fluid>
				<Row>
					<Col>
						<Header sidebarToggle={this.sidebarToggle} />
					</Col>
				</Row>
				<Row className="sidebar-main-wrap">
					<Sidebar show={isSidebarOpen} />
					<main className="main-content">
						{routes ? <Breadcrumbs mappedRoutes={routes} /> : null}
						{reportsFetched && userFetched ? children : this.renderLoader()}
					</main>
				</Row>
			</Grid>
		);
	}
}
export default Shell;
