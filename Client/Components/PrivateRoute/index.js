import React, { Suspense } from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';
import ShellContainer from '../../Containers/ShellContainer';
import Loader from '../Loader';

export default ({ component: Component, ...rest }) => {
	const customProps = rest.customProps || null;

	if (!authService.isLoggedin())
		return <Redirect to={{ pathname: '/login', state: { from: rest.location } }} />;

	return (
		<ShellContainer {...rest}>
			<Suspense fallback={<Loader height="100vh" />}>
				<Route
					{...rest}
					render={props => (
						<SendGAPageViewEvent
							path={props.history.location.pathname}
							isSuperUser={authService.isOps()}
						>
							<Component customProps={customProps} {...props} />
						</SendGAPageViewEvent>
					)}
				/>
			</Suspense>
		</ShellContainer>
	);
};
