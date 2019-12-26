import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import CustomError from '../../Components/CustomError/index';

const ErrorPage = () => (
	<Fragment>
		<DocumentTitle title="Not Found!" />

		<CustomError />
	</Fragment>
);

export default ErrorPage;
