/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
// import BidderRules from './BidderRules';
import HeaderBiddingRules from './HeaderBiddingRules';

class OptimizationTab extends React.Component {
	render() {
		// const { siteId, showNotification, ...rest } = this.props;
		return (
			<div className="options-wrapper white-tab-container hb-optimization">
				<h3 className="u-margin-t0">Advanced Configuration</h3>
				<p className="u-margin-b4">
					Can result in drastic performance issues. Please contact support if you do not understand
					what this means.
				</p>
				<HeaderBiddingRules {...this.props} />
				{/* <BidderRules siteId={siteId} showNotification={showNotification} {...rest} /> */}
			</div>
		);
	}
}

export default OptimizationTab;
