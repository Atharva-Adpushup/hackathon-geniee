import React, { Suspense } from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';
import LoadComponent from '../LoadComponent';
import ShellContainer from '../../Containers/ShellContainer';
import Loader from '../Loader';
import MixpanelContainer from '../../Containers/MixpanelContainer';

export default ({ component: Component, title = '', ...rest }) => {
	const customProps = rest.customProps || null;

	if (!authService.isLoggedin())
		return <Redirect to={{ pathname: '/login', state: { from: rest.location } }} />;

	return (
		<>
			<MixpanelContainer {...rest} />
			<ShellContainer {...rest}>
				<Suspense fallback={<Loader height="100vh" />}>
					<Route
						{...rest}
						render={props => (
							<SendGAPageViewEvent
								path={props.history.location.pathname}
								isSuperUser={authService.isOps()}
							>
								<LoadComponent
									component={Component}
									componentName={rest.name}
									customProps={customProps}
									title={title}
									{...props}
								/>
							</SendGAPageViewEvent>
						)}
					/>
				</Suspense>
			</ShellContainer>
		</>
	);
};
