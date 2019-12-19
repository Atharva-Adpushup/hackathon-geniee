import React, { Suspense } from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';
import Loader from '../Loader';

export default ({ component: Component, ...rest }) => {
	const customProps = rest.customProps || null;

	return (
		<Suspense fallback={<Loader height="100vh" />}>
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
		</Suspense>
	);
};
