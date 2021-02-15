import React, { Suspense } from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';
import ShellContainer from '../../Containers/ShellContainer';
import Loader from '../Loader';
import MixpanelContainer from '../../Containers/MixpanelContainer';
import MixpanelHelper from '../../helpers/mixpanel';

export default ({ component: Component, title = '', ...rest }) => {
	const customProps = rest.customProps || null;

	if (!authService.isLoggedin())
		return <Redirect to={{ pathname: '/login', state: { from: rest.location } }} />;

	const initTime = new Date().getTime();
	const logTimeTaken = finalTime => {
		const { name: componentName } = rest;
		const timeTaken = finalTime - initTime;
		const properties = { ComponentName: componentName, componentLoadTime: timeTaken };
		MixpanelHelper.trackEvent('Performance', properties);
	};

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
								{logTimeTaken(new Date().getTime())}
								<Component customProps={customProps} title={title} {...props} />
							</SendGAPageViewEvent>
						)}
					/>
				</Suspense>
			</ShellContainer>
		</>
	);
};
