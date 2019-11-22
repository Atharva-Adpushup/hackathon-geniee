import { connect } from 'react-redux';
import CopyButtonWrapper from '../Components/CopyButtonWrapper';
import { showCopiedNotification } from '../actions/uiActions';

const mapDispatchToProps = { showCopiedNotification };

export default connect(
	null,
	mapDispatchToProps
)(CopyButtonWrapper);
