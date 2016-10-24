import { connect } from 'react-redux';
import AfterSaveModal from 'channelManager/afterSaveModal.jsx';
import { getAfterSaveLoaderState } from '../selectors/siteSelectors';
import { afterSaveLoaderStatusReset } from 'actions/siteActions';

const mapStateToProps = (state) => ({
		status: getAfterSaveLoaderState(state)
	}),
	mapDispatchToProps = (dispatch) => ({
		closeModal: () => {
			dispatch(afterSaveLoaderStatusReset());
		}
	}),

	AfterSaveLoaderContainer = connect(
		mapStateToProps,
		mapDispatchToProps
	)(AfterSaveModal);

export default AfterSaveLoaderContainer;
