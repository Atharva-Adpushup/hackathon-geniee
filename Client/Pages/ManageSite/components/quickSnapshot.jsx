import React, { Fragment } from 'react';
import SiteWidgets from '../../Dashboard/containers/index';
import '../../../scss/pages/dashboard/index.scss';

const QuickSnapshot = props => {
	const { siteId } = props;
	return (
		<Fragment>
			<SiteWidgets reportType="site" siteId={siteId} />
		</Fragment>
	);
};

export default QuickSnapshot;
