import React from 'react';
import SiteWidgets from '../../Dashboard/containers/index';
import '../../../scss/pages/dashboard/index.scss';
import { siteWidgets } from '../constants/index';

const QuickSnapshot = props => {
	const { siteId } = props;
	return <SiteWidgets reportType="site" siteId={siteId} widgetsList={siteWidgets} />;
};

export default QuickSnapshot;
