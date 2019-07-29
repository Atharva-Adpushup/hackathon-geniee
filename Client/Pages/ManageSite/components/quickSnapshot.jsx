import React from 'react';
import { Row } from 'react-bootstrap';

import SiteWidgets from '../../Dashboard/containers/index';
import '../../../scss/pages/dashboard/index.scss';
import { siteWidgets } from '../constants/index';

const QuickSnapshot = props => {
	const { siteId } = props;
	return (
		<Row className="u-padding-h3 u-padding-v4">
			<SiteWidgets reportType="site" siteId={siteId} widgetsList={siteWidgets} />
		</Row>
	);
};

export default QuickSnapshot;
