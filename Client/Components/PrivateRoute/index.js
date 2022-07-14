import React, { Suspense, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';
import SendGAPageViewEvent from '../SendGAPageViewEvent';
import LoadComponent from '../LoadComponent';
import ShellContainer from '../../Containers/ShellContainer';
import Loader from '../Loader';
import MixpanelContainer from '../../Containers/MixpanelContainer';

export default ({ component: Component, title = '', ...rest }) => {
	const customProps = rest.customProps || null;
	const [showPaymentStatusBar, setShowPaymentStatusBar] = useState(false);

	if (!authService.isLoggedin())
		return <Redirect to={{ pathname: '/login', state: { from: rest.location } }} />;

	return (
		<>
			{/* Added style instead of className here as sometimes it appears that css file may get delayed loading css styles and
			the statys bar appears without css */}
			{showPaymentStatusBar && (
				<div
					style={{
						backgroundColor: '#ea585c',
						textAlign: 'center',
						color: 'white',
						padding: '5px 2px 5px 2px',
						boxShadow: '0 3px 6px rgb(0 0 0 / 16%), 0 3px 6px rgb(0 0 0 / 23%)'
					}}
				>
					Payments Error - Please complete your Payment Profile, for timely payments.{' '}
					<a
						href="/payment"
						style={{
							color: 'white',
							fontWeight: 600,
							textDecoration: 'underline',
							textUnderlinePosition: 'under'
						}}
					>
						Go to payments
					</a>
				</div>
			)}
			<MixpanelContainer {...rest} />
			<ShellContainer showPaymentStatusBar={setShowPaymentStatusBar} {...rest}>
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
