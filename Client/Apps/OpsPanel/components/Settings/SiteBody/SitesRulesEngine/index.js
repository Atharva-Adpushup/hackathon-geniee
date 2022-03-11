import React, { Component } from 'react';
import { Panel, PanelGroup } from '@/Client/helpers/react-bootstrap-imports';
import RulesEngineMain from './RulesEngineMain';

class SiteRulesEngine extends Component {
	state = {
		activeKey: ''
	};

	handlePanelSelect = activeKey => this.setState({ activeKey });

	renderView = () => {
		const { site: { apConfigs: { rules = [] } = {} } = {} } = this.props;

		return (
			<div className="size-mapping">
				<RulesEngineMain rules={rules} {...this.props} />
			</div>
		);
	};

	render() {
		const { activeKey } = this.state;
		const { site } = this.props;
		const { siteId, siteDomain } = site;

		return (
			<div className="u-margin-t2">
				<PanelGroup
					accordion
					id={`rules-engine-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handlePanelSelect}
				>
					<Panel eventKey="rules-engine">
						<Panel.Heading>
							<Panel.Title toggle>Rules Engine</Panel.Title>
						</Panel.Heading>
						{activeKey === 'rules-engine' ? (
							<Panel.Body collapsible>{this.renderView()}</Panel.Body>
						) : null}
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default SiteRulesEngine;
