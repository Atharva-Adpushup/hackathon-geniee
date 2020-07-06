/* eslint-disable react/require-render-return */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import HeaderBiddingRule from './HeaderBiddingRule';
import HeaderBiddingRulesList from './HeaderBiddingRulesList';
import { Button } from '@/Client/helpers/react-bootstrap-imports';

class OptimizationTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'list',
			selectedRuleIndex: null
		};
	}

	handleEditRule(index) {
		this.setState({
			activeKey: 'rule',
			selectedRuleIndex: index
		});
	}

	componentDidMount() {
		const { siteId, fetchHBRulesAction } = this.props;
		fetchHBRulesAction(siteId);
	}

	changeActiveKey(activeKey) {
		this.setState({
			activeKey
		});
	}

	render() {
		const { activeKey, selectedRuleIndex } = this.state;

		return (
			<div className="white-tab-container hb-optimization">
				{activeKey === 'list' && (
					<>
						<h3 className="u-margin-t0">Advanced Configuration</h3>
						<p className="u-margin-b4">
							Can result in drastic performance issues. Please contact support if you do not
							understand what this means.
						</p>
						<HeaderBiddingRulesList
							{...this.props}
							onEditRule={index => this.handleEditRule(index)}
						/>
						<div className="control">
							<Button className="btn-primary" onClick={() => this.changeActiveKey('rule')}>
								Add New Rule
							</Button>
						</div>
					</>
				)}

				{activeKey === 'rule' && (
					<HeaderBiddingRule
						{...this.props}
						selectedRuleIndex={selectedRuleIndex}
						showRulesList={() => this.changeActiveKey('list')}
					/>
				)}
			</div>
		);
	}
}

export default OptimizationTab;
