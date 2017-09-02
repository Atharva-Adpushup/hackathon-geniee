import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AdsDescriptor from 'editMenu/adDescriptor.jsx';
import { updateCss, updateAdCode, updateNetwork } from '../actions/adActions';
import { resetErrors } from 'actions/uiActions';
import { deleteSection, updateXPath, sectionAllXPaths, validateXPath } from 'actions/sectionActions.js';

export default connect(
	(state, ownProps) => ({ ...ownProps, ui: state.ui }),
	(dispatch) => bindActionCreators({
		deleteSection: deleteSection,
		updateCss: updateCss,
		updateAdCode: updateAdCode,
		updateNetwork: updateNetwork,
		onUpdateXPath: updateXPath,
		onSectionAllXPaths: sectionAllXPaths,
		onValidateXPath: validateXPath,
		onResetErrors: resetErrors,
	}, dispatch)
)(AdsDescriptor);