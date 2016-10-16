import { connect } from 'react-redux';
import InsertMenu from 'contextMenu/insertMenu.jsx';
import { hideMenu } from 'actions/insertMenuActions';
import { createSection } from 'actions/sectionActions';
import { getActiveChannelId } from 'selectors/channelSelectors';
import { getActiveChannelActiveVariationId } from 'selectors/variationSelectors';
import { getInsertMenuState } from 'selectors/insertMenuSelectors';
import { sendMessage } from '../scripts/messengerHelper';
import { messengerCommands } from '../consts/commonConsts';

const mapStateToProps = (state) => {
		const json = getInsertMenuState(state);
		return { ...json, variationId: getActiveChannelActiveVariationId(state), channelId: getActiveChannelId(state) };
	},
	mapDispatchToProps = (dispatch) => ({
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

