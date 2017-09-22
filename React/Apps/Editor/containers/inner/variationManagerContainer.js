import { connect } from 'react-redux';
import VariationManger from 'inner/variationManger.jsx';
import { sendMessage } from 'scripts/inner/messengerHelper.js';
import { setElementSelectorCords } from 'actions/inner/actions';
import { messengerCommands } from 'consts/commonConsts.js';

export default connect(
	({ variation }) => ({
		id: variation.id,
		sections: variation.sections
	}),
	dispatch => ({
		onXpathMiss: id => {
			sendMessage(messengerCommands.SECTION_XPATH_MISSING, { sectionId: id });
		},
		onAdClick: (variationId, sectionId, adId, position, adpVitals) => {
			sendMessage(messengerCommands.SHOW_EDIT_CONTEXTMENU, { adId, position, sectionId, variationId });
			dispatch(setElementSelectorCords(adpVitals));
		}
	})
)(VariationManger);
