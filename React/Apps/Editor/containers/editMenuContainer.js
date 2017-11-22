import { connect } from 'react-redux';
import EditMenu from 'editMenu/index';
import { hideEditMenu as hideMenu } from 'actions/uiActions';
import { getEditMenuState } from 'selectors/uiSelectors';
import { getSectionWithAds } from 'selectors/sectionSelectors';
import { messengerCommands } from 'consts/commonConsts';
import { updatePartnerData } from 'actions/sectionActions';
import { showNotification } from 'actions/uiActions';

const mapStateToProps = state => {
		const json = getEditMenuState(state);
		return { ...json, section: getSectionWithAds(state, { sectionId: json.sectionId }) };
	},
	mapDispatchToProps = dispatch => ({
		hideMenu: () => {
			dispatch(hideMenu());
		},
		updateSettings: (sectionId, adId, partnerData) => {
			dispatch(updatePartnerData(sectionId, adId, partnerData));
		},
		showNotification: params => dispatch(showNotification(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(EditMenu);
