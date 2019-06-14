/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import BidderRules from './BidderRules';

class OptimizationTab extends React.Component {
	render() {
		const { siteId } = this.props;
		return <BidderRules siteId={siteId} />;
	}
}

export default OptimizationTab;
