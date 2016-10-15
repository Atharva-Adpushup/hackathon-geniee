import { connect } from 'react-redux';
import VariationManager from 'VariationManager/variationManager.jsx';
import { addVariation, copyVariation, deleteVariation, setActiveVariation } from 'actions/variationActions';
import { getActiveChannelId } from 'selectors/channelSelectors';
import { getActiveChannelVariations, getActiveChannelActiveVariation } from 'selectors/variationSelectors';

const mapStateToProps = (state) => ({
		variations: getActiveChannelVariations(state),
		activeVariation: getActiveChannelActiveVariation(state),
		activeChannelId: getActiveChannelId(state)
	}),
	noop = () => ({ type: 'test' }),
	mapDispatchToProps = (dispatch) => ({
		deleteVariation: (variationId) => {
			dispatch(deleteVariation(variationId));
		},
		copyVariation: (variationId) => {
			dispatch(copyVariation(variationId));
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
