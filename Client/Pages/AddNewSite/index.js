import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import OnboardingWrap from '../../Components/OnboardingWrap';

const AddNewSite = () => (
	<Fragment>
		<Helmet>
			<title>Add New Website</title>
		</Helmet>

		<OnboardingWrap isOnboarding={false} />
	</Fragment>
);

export default AddNewSite;
