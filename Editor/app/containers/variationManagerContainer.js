import { connect } from 'react-redux';
import VariationManager from 'variationManager/variationManager.jsx';
import { addVariation, copyVariation, deleteVariation, setActiveVariation } from 'actions/variationActions';
import { getActiveChannelId } from 'selectors/channelSelectors';
import { getActiveChannelVariationsWithAds, getActiveChannelActiveVariation } from 'selectors/variationSelectors';

const mapStateToProps = (state) => ({
		variations: getActiveChannelVariationsWithAds(state),
		activeVariation: getActiveChannelActiveVariation(state),
		activeChannelId: getActiveChannelId(state)
	}),
	noop = () => ({ type: 'test' }),
	mapDispatchToProps = (dispatch) => ({
		deleteVariation: (variationId) => {
			dispatch(deleteVariation(variationId));
		},
		copyVariation: (variationId, newName, channelId) => {
			dispatch(copyVariation(variationId, newName, channelId));
		},
		setActiveVariation: (variationId, channelId) => {
			dispatch(setActiveVariation(variationId, channelId));
		},
		renameVariation: (variationId) => {
			dispatch(noop(variationId));
		},
		createVariation: (payload, channelId) => {
			dispatch(addVariation(payload, channelId));
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(VariationManager);
