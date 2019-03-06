import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Breadcrumbs from 'react-router-dynamic-breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Loader from '../Loader/index';
import { getTruthyArray } from '../../helpers/commonFunctions';

class Shell extends React.Component {
	state = { isSidebarOpen: true };

	componentDidMount() {
		const { fetched, fetchGlobalData } = this.props;
		if (!fetched) fetchGlobalData();
	}

	sidebarToggle = () => {
		this.setState(state => ({ isSidebarOpen: !state.isSidebarOpen }));
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);

	getRoutes = collection => {
		const dynamicParamsArray = [':siteId'];

		return collection.reduce((accumulator, value) => {
			const { path } = value.props;
			let { name } = value.props;

			dynamicParamsArray.forEach(param => {
				const isParamInPath = !!path.match(param);

				if (!isParamInPath) {
					return true;
				}

				name = `${name} ${param}`;
				return true;
			});

			accumulator[path] = name;
			return accumulator;
		}, {});
	};

	render() {
		const { isSidebarOpen } = this.state;
		const { children, fetched } = this.props;
		const routes = this.getRoutes(children);

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
						<Breadcrumbs mappedRoutes={routes} />
						{fetched ? children : this.renderLoader()}
					</main>
				</Row>
			</Grid>
		);
	}
}

export default Shell;
