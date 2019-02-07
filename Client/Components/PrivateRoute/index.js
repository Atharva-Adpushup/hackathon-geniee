import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';

export default ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={props =>
			authService.isLoggedin() ? (
				<Component {...props} />
			) : (
				<Redirect to={{ pathname: '/login', state: { from: props.location } }} />
			)
		}
	/>
);
