import { connect } from 'react-redux';
import EditMenu from 'editMenu/index';
import { hideEditMenu as hideMenu } from 'actions/uiActions';
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

