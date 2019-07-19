/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import BidderRules from './BidderRules';

class OptimizationTab extends React.Component {
	render() {
		const { siteId, showNotification } = this.props;
		return (
			<div className="options-wrapper hb-optimization">
				<BidderRules siteId={siteId} showNotification={showNotification} />
			</div>
		);
	}
}

export default OptimizationTab;
