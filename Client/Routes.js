import React, { lazy } from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import history from './helpers/history';
import PublicOnlyRoute from './Components/PublicOnlyRoute';
import PrivateRoute from './Components/PrivateRoute';
import authService from './services/authService';
import routeConfig from './routeConfig';
import PageNotFound from './Pages/404Page';

const ErrorPage = lazy(() => import(/* webpackChunkName: "error" */ './Pages/ErrorPage/index'));

const Routes = () => (
	<Router history={history}>
		<Switch>
			{/* Public Routes */}
			<Route
				exact
				path="/"
				render={() =>
					authService.isLoggedin() ? <Redirect to="/dashboard" /> : <Redirect to="/login" />
				}
			/>
			<Route exact name="Error" path="/error" render={() => <ErrorPage />} />
			{routeConfig.public.map(route => {
				const { name, ...rest } = route;
				return <PublicOnlyRoute {...rest} key={name} />;
			})}
			{/* Private Routes */}
			{routeConfig.private.map(route => {
				const { name, ...rest } = route;
				return <PrivateRoute key={name} {...rest} />;
			})}
			<Route component={() => <PageNotFound message="Sorry, this page doesn't exist" />} />
		</Switch>
	</Router>
);

export default Routes;
