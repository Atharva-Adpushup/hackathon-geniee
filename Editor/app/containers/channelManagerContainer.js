import { connect } from 'react-redux';
import * as channelActions from 'actions/channelActions';
import { showNewChannelMenu } from '../actions/uiActions';
import { afterSaveLoaderStatusPending } from 'actions/siteActions';
import { status } from 'consts/commonConsts';
import ChannelManager from 'channelManager/channelManager.jsx';
import { getAllChannels, getOpenChannels, getActiveChannelId } from '../selectors/channelSelectors';

const noop = () => ({ type: 'Test' }),
	mapStateToProps = (state) => ({
		channels: getAllChannels(state),
		openChannels: getOpenChannels(state),
		activeChannelId: getActiveChannelId(state),
		siteMode: 1
	}),
	mapDispatchToProps = (dispatch) => ({
		toggleEditorMode: () => {
			dispatch(noop(arguments));
		},
		showPublisherHelper: () => {
			dispatch(noop(arguments));
		},
		showNewChannelMenu: (position) => {
			dispatch(showNewChannelMenu(position));
		},
		masterSave: () => {
			dispatch(afterSaveLoaderStatusPending(status.PENDING));
		},
		showOptionsMenu: () => {
			dispatch(noop(arguments));
		},
		setActiveChannel: (channelId) => {
			dispatch(channelActions.setActiveChannel(channelId));
		}
	}),

	ChannelManagerContainer = connect(
		mapStateToProps,
		mapDispatchToProps
	)(ChannelManager);

export default ChannelManagerContainer;
