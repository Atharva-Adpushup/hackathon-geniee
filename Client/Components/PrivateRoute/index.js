import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';

export default ({ component: Component, ...rest }) => {
	const customProps = rest.customProps || null;

	return (
		<Route
			{...rest}
			render={props =>
				authService.isLoggedin() ? (
					<SendGAPageViewEvent
						path={props.history.location.pathname}
						isSuperUser={authService.isOps()}
					>
						<Component customProps={customProps} {...props} />
					</SendGAPageViewEvent>
				) : (
					<Redirect to={{ pathname: '/login', state: { from: props.location } }} />
				)
			}
		/>
	);
};
