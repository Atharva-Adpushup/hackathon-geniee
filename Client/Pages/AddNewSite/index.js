import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import OnboardingWrap from '../../Components/OnboardingWrap';

const AddNewSite = () => (
	<Fragment>
		<DocumentTitle title="Add New Website" />

		<OnboardingWrap isOnboarding={false} />
	</Fragment>
);

export default AddNewSite;
