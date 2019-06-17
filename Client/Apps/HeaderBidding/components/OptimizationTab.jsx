/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import BidderRules from './BidderRules';

class OptimizationTab extends React.Component {
	render() {
		const { siteId } = this.props;
		return (
			<div className="options-wrapper hb-optimization">
				<BidderRules siteId={siteId} />
			</div>
		);
	}
}

export default OptimizationTab;
