import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NewChannelMenu from 'outer/newChannelMenu/index';
import { getNewChannelMenuState } from 'selectors/uiSelectors';
import { getClosedChannels } from 'selectors/channelSelectors';
import { hideNewChannelInsertMenu as hideMenu } from 'actions/uiActions';
import { openChannel } from 'actions/channelActions';

const mapStateToProps = (state) => {
		const json = getNewChannelMenuState(state);
		return { ...json, channels: getClosedChannels(state) };
	},
	mapDispatchToProps = (dispatch) => bindActionCreators({ hideMenu, openChannel }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(NewChannelMenu);

