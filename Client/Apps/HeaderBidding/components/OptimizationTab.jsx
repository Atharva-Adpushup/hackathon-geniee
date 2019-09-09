/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import BidderRules from './BidderRules';

class OptimizationTab extends React.Component {
	render() {
		const { siteId, showNotification } = this.props;
		return (
			<div className="options-wrapper white-tab-container hb-optimization">
				<h3 className="u-margin-t0">Advanced Configuration</h3>
				<p className="u-margin-b4">
					Can result in drastic performance issues. Please contact support if you do not understand
					what this means.
				</p>
				<BidderRules siteId={siteId} showNotification={showNotification} />
			</div>
		);
	}
}

export default OptimizationTab;
