import { connect } from 'react-redux';
import AfterSaveModal from 'channelManager/afterSaveModal.jsx';
import { getAfterSaveLoaderState } from '../selectors/siteSelectors';

const mapStateToProps = (state) => ({
		status: getAfterSaveLoaderState(state)
	}),
	mapDispatchToProps = () => ({}),

	AfterSaveLoaderContainer = connect(
		mapStateToProps,
		mapDispatchToProps
	)(AfterSaveModal);

export default AfterSaveLoaderContainer;
