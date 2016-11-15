import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChannelMenu from 'outer/channelManager/channelMenu/index';
import { getChannelMenuState } from 'selectors/uiSelectors';
import { getPartner } from 'selectors/siteSelectors';
import { getAllChannels, getActiveChannel, getActiveChannelId } from 'selectors/channelSelectors';
import { hideChannelMenu as hideMenu } from 'actions/uiActions';
import { saveSampleUrl } from 'actions/channelActions';

const mapStateToProps = (state) => {
		const json = getChannelMenuState(state);
		return { ...json, 
			channel: getActiveChannel(state),
			partner: getPartner(state),
			allChannels: getAllChannels(state),
			activeChannelId: getActiveChannelId(state)
		};
	},
	mapDispatchToProps = (dispatch) => bindActionCreators({ hideMenu, saveSampleUrl }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMenu);
