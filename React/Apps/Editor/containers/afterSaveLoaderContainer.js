import { connect } from 'react-redux';
import AfterSaveModal from 'channelManager/afterSaveModal.jsx';
import { resetAfterSaveModal } from 'actions/uiActions';
import { getAfterSaveLoaderState } from '../selectors/uiSelectors';

const mapStateToProps = state => getAfterSaveLoaderState(state),
	mapDispatchToProps = dispatch => ({
		closeModal: () => {
			dispatch(resetAfterSaveModal());
		}
	}),
	AfterSaveLoaderContainer = connect(mapStateToProps, mapDispatchToProps)(AfterSaveModal);

export default AfterSaveLoaderContainer;
