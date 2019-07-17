import { connect } from 'react-redux';
import VariationManager from 'variationManager/variationManager.jsx';
import {
	addVariation,
	copyVariation,
	deleteVariation,
	setActiveVariation,
	updateContentSelector
} from 'actions/variationActions';
import { openVariationPanel, closeVariationPanel } from 'actions/uiActions';
import { getActiveChannelId, getActiveChannel } from 'selectors/channelSelectors';
import { getNetworkConfig } from 'selectors/networkConfigSelector';
import {
	getActiveChannelVariationsWithAds,
	getActiveChannelActiveVariation,
	getVariationSectionsWithAds,
	getZonesDataFromActiveVariation
} from 'selectors/variationSelectors';

const mapStateToProps = state => ({
	variations: getActiveChannelVariationsWithAds(state),
	activeVariation: getActiveChannelActiveVariation(state),
	zonesData: getZonesDataFromActiveVariation(state),
	activeChannelId: getActiveChannelId(state),
	activeChannel: getActiveChannel(state),
	activeVariationSections: getActiveChannelActiveVariation(state)
		? getVariationSectionsWithAds(state, { variationId: getActiveChannelActiveVariation(state).id }).sections
		: null,
	ui: state.ui,
	reporting: state.reporting,
	networkConfig: getNetworkConfig(state)
}),
	noop = () => ({ type: 'test' }),
	mapDispatchToProps = dispatch => ({
		deleteVariation: variationId => {
			dispatch(deleteVariation(variationId));
		},
		copyVariation: (variationId, newName, channelId) => {
			dispatch(copyVariation(variationId, newName, channelId));
		},
		updateContentSelector: (variationId, channelId, contentSelector) => {
			dispatch(updateContentSelector(variationId, channelId, contentSelector));
		},
		setActiveVariation: (variationId, channelId) => {
			dispatch(setActiveVariation(variationId, channelId));
		},
		openVariationPanel: () => {
			dispatch(openVariationPanel());
		},
		closeVariationPanel: () => {
			dispatch(closeVariationPanel());
		},
		renameVariation: variationId => {
			dispatch(noop(variationId));
		},
		createVariation: (payload, channelId) => {
			dispatch(addVariation(payload, channelId));
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(VariationManager);
