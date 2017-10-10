import React from 'react';
import TabPanel from 'react-tab-panel';
import $ from 'jquery';
import 'react-tab-panel/index.css';
import './variationPanel.scss';
import IncontentAdder from './incontentSectionAdder/index';
import VariationOptions from './variationOptions';
import VariationSections from './variationSections/index';
import VariationBar from './variationBar';
import BeforeAfterJsPanel from './beforeAfterJsPanel';

class VariationPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = { reporting: false };
	}

	componentDidMount() {
		$.ajax({
			method: 'POST',
			url: '/user/reports/generate',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				select: ['total_xpath_miss', 'total_impressions', 'total_cpm'],
				where: {
					siteid: 28822,
					pagegroup: 'MIC', // this.props.activeChannel.pageGroup
					variation: '2e68228f-84da-415e-bfcf-bfcf67c87570' // this.props.variation.id
					// device_type: this.props.activeChannel.platform
				},
				groupBy: ['section']
			}),
			contentType: 'json',
			dataType: 'json',
			success: response => {
				console.log(response);
			}
		});
	}

	render() {
		const { variation, channelId, sections, ui } = this.props;
		return (
			<div className="variation-settings">
				<VariationBar panelCssSelector=".variation-settings" expanded={ui.variationPanel.expanded} />
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
