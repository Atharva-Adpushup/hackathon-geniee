import { connect } from 'react-redux';
import EditMenu from 'editMenu/index';
import { hideEditMenu as hideMenu } from 'actions/uiActions';
import { getActiveChannelId } from 'selectors/channelSelectors';
import { getEditMenuState } from 'selectors/uiSelectors';
import { getSectionWithAds } from 'selectors/sectionSelectors';
import { getNetworkConfig } from 'selectors/networkConfigSelector';
import { messengerCommands } from 'consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';
import { updatePartnerData } from 'actions/sectionActions';
import { showNotification } from 'actions/uiActions';

const mapStateToProps = state => {
	const json = getEditMenuState(state);
	return {
		...json,
		section: getSectionWithAds(state, { sectionId: json.sectionId }),
		channelId: getActiveChannelId(state),
		networkConfig: getNetworkConfig(state)
	};
},
	mapDispatchToProps = dispatch => ({
		hideMenu: () => {
			dispatch(hideMenu());
		},
		updateSettings: (sectionId, adId, partnerData) => {
			dispatch(updatePartnerData(sectionId, adId, partnerData));
		},
		updateAdSize: (channelId, adId, sizeObject) => {
			sendMessage(channelId, messengerCommands.UPDATE_AD_SIZE, { adId, sizeObject });
		},
		showNotification: params => dispatch(showNotification(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(EditMenu);
