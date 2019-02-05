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
import Personalization from './personalization';
import KeyValuesPanel from './keyValuesPanel';
import InteractiveAds from './interactiveAds/index';

class VariationPanel extends React.Component {
	constructor(props) {
		super(props);
		this.renderKeyValuesOptions = this.renderKeyValuesOptions.bind(this);
	}

	renderKeyValuesOptions() {
		let { channelId, variation, sections, ui } = this.props,
			toShow = window.isGeniee && window.gcfg.upkv ? true : !window.isGeniee,
			label = isGeniee ? 'Geniee Key Values' : 'ADP Key Values';

		return toShow
			? <div tabTitle={label}>
					<KeyValuesPanel channelId={channelId} variation={variation} sections={sections} ui={ui} />
				</div>
			: null;
		// if (window.isGeniee) {
		// 	if (window.gcfg.upkv) {
		// 		return (
		// 			<div tabTitle="Geniee Key Values">
		// 				<KeyValuesPanel channelId={channelId} variation={variation} sections={sections} ui={ui} />
		// 			</div>
		// 		);
		// 	}
		// } else {
		// 	return (
		// 		<div tabTitle="ADP Key Values">
		// 			<KeyValuesPanel channelId={channelId} variation={variation} sections={sections} ui={ui} />
		// 		</div>
		// 	);
		// }
	}

	render() {
		const {
			variation,
			channelId,
			sections,
			ui,
			reporting,
			onUpdateContentSelector,
			disabledVariationsCount,
			controlVariationsCount,
			zonesData,
			networkConfig
		} = this.props,
			// Geniee UI access before/after js feature visibility condition
			isBeforeAfterJSHide = !!(window.isGeniee &&
				window.gcfg &&
				window.gcfg.hasOwnProperty('ubajf') &&
				!window.gcfg.ubajf);

		return (
			<div className="variation-settings">
				<VariationBar panelCssSelector=".variation-settings" expanded={ui.variationPanel.expanded} />
				<TabPanel tabPosition="left">
					<div tabTitle="Sections">
						<VariationSections
							variation={variation}
							sections={sections}
							ui={ui}
							reporting={reporting}
							platform={this.props.activeChannel.platform}
							networkConfig={networkConfig}
						/>
					</div>
					<div tabTitle="Info">
						<VariationOptions
							onUpdateContentSelector={onUpdateContentSelector}
							channelId={channelId}
							variation={variation}
							disabledVariationsCount={disabledVariationsCount}
							controlVariationsCount={controlVariationsCount}
						/>
					</div>
					<div tabTitle="Add Incontent Variation">
						<IncontentAdder
							activeChannel={this.props.activeChannel}
							channelId={channelId}
							variation={variation}
							zonesData={zonesData}
						/>
					</div>
					{isBeforeAfterJSHide
						? null
						: <div tabTitle="Before/After JS">
								<BeforeAfterJsPanel channelId={channelId} variation={variation} ui={ui} />
							</div>}
					{this.renderKeyValuesOptions()}
					<div tabTitle="Interactive Ads">
						<InteractiveAds
							channelId={channelId}
							variation={variation}
							sections={sections}
							ui={ui}
							platform={this.props.activeChannel.platform}
						/>
					</div>
					<div tabTitle="Personalization">
						<Personalization channelId={channelId} variation={variation} />
					</div>
				</TabPanel>
			</div>
		);
	}
}

export default VariationPanel;
