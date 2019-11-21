import { connect } from 'react-redux';
import { hideCopiedNotification } from '../actions/uiActions';
import CopiedNotification from '../Components/CopiedNotification';

const mapStateToProps = state => {
	const {
		global: {
			ui: {
				copiedNotification: { isVisible, message, autoHideTime }
			}
		}
	} = state;

	return { isVisible, message, autoHideTime };
};

const mapDispatchToProps = { hideCopiedNotification };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CopiedNotification);
