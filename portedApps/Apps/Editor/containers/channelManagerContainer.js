import { connect } from 'react-redux';
import * as channelActions from 'actions/channelActions';
import { showNewChannelMenu, showSiteModesPopover, showChannelMenu, setMode } from '../actions/uiActions';
import { masterSaveData } from 'actions/siteActions';
import ChannelManager from 'channelManager/channelManager.jsx';
import { getAllChannels, getOpenChannels, getActiveChannelId } from '../selectors/channelSelectors';
import { getMode } from '../selectors/siteSelectors';

const noop = () => ({ type: 'Test' }),
	mapStateToProps = state => ({
		channels: getAllChannels(state),
		openChannels: getOpenChannels(state),
		activeChannelId: getActiveChannelId(state),
		siteMode: getMode(state)
	}),
	mapDispatchToProps = dispatch => ({
		toggleEditorMode: e => {
			dispatch(setMode(e.target.value));
		},
		showPublisherHelper: position => {
			dispatch(showSiteModesPopover(position));
		},
		showNewChannelMenu: position => {
			dispatch(showNewChannelMenu(position));
		},
		showChannelMenu: position => {
			dispatch(showChannelMenu(position));
		},
		masterSave: () => {
			dispatch(masterSaveData());
		},
		showOptionsMenu: () => {
			dispatch(noop(arguments));
		},
		setActiveChannel: channelId => {
			dispatch(channelActions.setActiveChannel(channelId));
		}
	}),
	ChannelManagerContainer = connect(mapStateToProps, mapDispatchToProps)(ChannelManager);

export default ChannelManagerContainer;
