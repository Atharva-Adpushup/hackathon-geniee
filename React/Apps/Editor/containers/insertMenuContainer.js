import { connect } from 'react-redux';
import InsertMenu from 'insertMenu/index';
import { hideMenu } from 'actions/insertMenuActions';
import { createSection } from 'actions/sectionActions';
import { getActiveChannelId } from 'selectors/channelSelectors';
import { getPartner } from 'selectors/siteSelectors';
import { getActiveChannelActiveVariationId, getCustomAdCodeFromActiveVariation } from 'selectors/variationSelectors';
import { getInsertMenuState } from 'selectors/uiSelectors';
import { sendMessage } from '../scripts/messengerHelper';
import { messengerCommands } from '../consts/commonConsts';

const mapStateToProps = state => {
		const json = getInsertMenuState(state);
		return {
			...json,
			partner: getPartner(state),
			isCustomAdCodeInVariationAds: getCustomAdCodeFromActiveVariation(state),
			variationId: getActiveChannelActiveVariationId(state),
			channelId: getActiveChannelId(state)
		};
	},
	mapDispatchToProps = dispatch => ({
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
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(InsertMenu);
