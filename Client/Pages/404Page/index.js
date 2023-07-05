import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import authService from '../../services/authService';
import CustomError from '../../Components/CustomError';

const PageNotFound = ({ message }) => {
	const pageName = authService.isLoggedin() ? 'Reports' : 'Login Page';
	const pageUrl = authService.isLoggedin() ? '/reports' : '/login';
	return (
		<Fragment>
			<DocumentTitle title={message} />
			<div className="NotFoundPage">
				<CustomError message={message} imgSrc="/assets/images/404-error.svg" />
				<p className="notFoundMessage">
					{`To go back to ${pageName}, please click `}
					<a href={pageUrl} title="AdPushup Reports">
						here
					</a>
					.
				</p>
			</div>
		</Fragment>
	);
};

export default PageNotFound;
