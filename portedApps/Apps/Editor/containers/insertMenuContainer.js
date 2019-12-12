import { connect } from 'react-redux';
import InsertMenu from 'insertMenu/index';
import { hideMenu } from 'actions/insertMenuActions';
import { createSection } from 'actions/sectionActions';
import { getActiveChannelId, getActiveChannel } from 'selectors/channelSelectors';
import { getPartner, getCustomSizes } from 'selectors/siteSelectors';
import {
	getActiveChannelActiveVariationId,
	getCustomAdCodeFromActiveVariation,
	getZonesDataFromActiveVariation
} from 'selectors/variationSelectors';
import { getInsertMenuState } from 'selectors/uiSelectors';
import { getNetworkConfig } from 'selectors/networkConfigSelector';
import { sendMessage } from '../scripts/messengerHelper';
import { messengerCommands } from '../consts/commonConsts';
import { showNotification } from 'actions/uiActions';

const mapStateToProps = state => {
		const json = getInsertMenuState(state);
		const channel = state.channelData.activeChannel
			? getActiveChannel(state)
			: { id: null, platform: null, pageGroup: null };
		return {
			...json,
			customSizes: getCustomSizes(state),
			partner: getPartner(state),
			isCustomAdCodeInVariationAds: getCustomAdCodeFromActiveVariation(state),
			variationId: getActiveChannelActiveVariationId(state),
			channelId: channel.id,
			zonesData: getZonesDataFromActiveVariation(state),
			networkConfig: getNetworkConfig(state),
			namingData: {
				platform: channel.platform,
				pagegroup: channel.pageGroup,
				service: 'L'
			}
		};
	},
	mapDispatchToProps = (dispatch, props) => ({
		hideMenu: () => {
			dispatch(hideMenu());
		},
		createSectionAndAd: (sectionPayload, adPayload, variationId) => {
			dispatch(createSection(sectionPayload, adPayload, variationId));
		},
		selectInnerElement: (xpath, channelId) => {
			sendMessage(channelId, messengerCommands.SELECT_ELEMENT, { xpath });
		},
		highlightInnerElement: (xpath, channelId) => {
			sendMessage(channelId, messengerCommands.HIGHLIGHT_ELEMENT, { xpath });
		},
		showNotification: params => dispatch(showNotification(params))
	});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(InsertMenu);
