import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChannelMenu from 'outer/channelManager/channelMenu/index';
import { getChannelMenuState } from 'selectors/uiSelectors';
import { getActiveChannelVariationsTrafficDistributions } from 'selectors/variationSelectors';
import { getPartner } from 'selectors/siteSelectors';
import { getActiveChannel, getActiveChannelId } from 'selectors/channelSelectors';
import { hideChannelMenu as hideMenu } from 'actions/uiActions';
import { saveSampleUrl, closeChannel, changeContentSelector, updateAutoptimize } from 'actions/channelActions';
import { editTrafficDistribution } from 'actions/variationActions';

const mapStateToProps = state => {
		const json = getChannelMenuState(state);
		return {
			...json,
			channel: getActiveChannel(state),
			allTrafficDistributions: getActiveChannelVariationsTrafficDistributions(state),
			partner: getPartner(state),
			activeChannelId: getActiveChannelId(state)
		};
	},
	mapDispatchToProps = dispatch =>
		bindActionCreators(
			{
				hideMenu,
				saveSampleUrl,
				closeChannel,
				editTrafficDistribution,
				changeContentSelector,
				updateAutoptimize
			},
			dispatch
		);

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChannelMenu);
