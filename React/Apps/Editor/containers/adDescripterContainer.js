import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AdsDescriptor from 'editMenu/adDescriptor.jsx';
import { updateCss, updateAdCode, updateNetwork } from '../actions/adActions';
import { showNotification } from '../actions/uiActions';
import { resetErrors } from 'actions/uiActions';
import {
	deleteSection,
	updateXPath,
	updateOperation,
	sectionAllXPaths,
	validateXPath,
	renameSection,
	updateType,
	updateFormatData,
	toggleLazyLoad
} from 'actions/sectionActions.js';

export default connect(
	(state, ownProps) => ({ ...ownProps, ui: state.ui }),
	dispatch =>
		bindActionCreators(
			{
				deleteSection: deleteSection,
				updateCss: updateCss,
				updateAdCode: updateAdCode,
				updateNetwork: updateNetwork,
				onUpdateXPath: updateXPath,
				onUpdateOperation: updateOperation,
				onSectionAllXPaths: sectionAllXPaths,
				onValidateXPath: validateXPath,
				onResetErrors: resetErrors,
				onRenameSection: renameSection,
				onSetSectionType: updateType,
				onFormatDataUpdate: updateFormatData,
				showNotification: showNotification,
				onToggleLazyLoad: toggleLazyLoad
			},
			dispatch
		)
)(AdsDescriptor);
