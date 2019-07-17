import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import CustomError from '../../Components/CustomError/index';

const ErrorPage = () => (
	<Fragment>
		<Helmet>
			<title>Not Found!</title>
		</Helmet>

		<CustomError />
	</Fragment>
);

export default ErrorPage;
