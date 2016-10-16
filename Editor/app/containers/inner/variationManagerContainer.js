import { connect } from 'react-redux';
import VariationManger from '../../components/inner/variationManger.jsx';
import { sendMessage } from '../../scripts/inner/messengerHelper.js';
import { messengerCommands } from '../../consts/commonConsts.js';

export default connect(
	({ variation }) => ({
		id: variation.id,
		sections: variation.sections
	}),
	() => ({
		onXpathMiss: (id) => { sendMessage(messengerCommands.SECTION_XPATH_MISSING, { sectionId: id }); },
		onAdClick: (sectionId, id) => { sendMessage(messengerCommands.REMOVE_AD, { adId: id, sectionId }); }
	})
)(VariationManger);
