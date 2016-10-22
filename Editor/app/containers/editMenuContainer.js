import { connect } from 'react-redux';
import EditMenu from 'editMenu/index';
import { hideMenu } from 'actions/editMenuActions';
import { getEditMenuState } from 'selectors/uiSelectors';
import { getSectionWithAds } from 'selectors/sectionSelectors';
import { messengerCommands } from 'consts/commonConsts';

const mapStateToProps = (state) => {
		const json = getEditMenuState(state);
		return { ...json, section: getSectionWithAds(state, { sectionId: json.sectionId }) };
	},
	mapDispatchToProps = (dispatch) => ({
		hideMenu: () => {
			dispatch(hideMenu());
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(EditMenu);

