import React from 'react';
import TabPanel from 'react-tab-panel';
import 'react-tab-panel/index.css';
import './variationPanel.scss';
import IncontentAdder from './incontentSectionAdder/index';
import VariationOptions from './variationOptions';
import VariationSections from './variationSections/index';
import VariationBar from './variationBar';
import BeforeAfterJsPanel from './beforeAfterJsPanel';

class VariationPanel extends React.Component {
	render() {
		const { variation, channelId, sections, ui } = this.props;
		return (
			<div className="variation-settings">
				<VariationBar panelCssSelector=".variation-settings" expanded={ui.variationPanelExpansion.expanded} />
				<TabPanel tabPosition="left">
					<div tabTitle="Info">
						<VariationOptions channelId={channelId} variation={variation} />
					</div>
					<div tabTitle="Sections">
						<VariationSections variation={variation} sections={sections} ui={ui} />
					</div>
					<div tabTitle="Add Incontent Variation">
						<IncontentAdder
							activeChannel={this.props.activeChannel}
							channelId={channelId}
							variation={variation}
						/>
					</div>
					<div tabTitle="Before/After JS">
						<BeforeAfterJsPanel channelId={channelId} variation={variation} ui={ui} />
					</div>
				</TabPanel>
			</div>
		);
	}
}

export default VariationPanel;