import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';

export default ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={props =>
			!authService.isLoggedin() ? (
				<SendGAPageViewEvent
					path={props.history.location.pathname}
					isSuperUser={authService.isOps()}
				>
					<Component {...props} />
				</SendGAPageViewEvent>
			) : (
				<Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />
			)
		}
	/>
);