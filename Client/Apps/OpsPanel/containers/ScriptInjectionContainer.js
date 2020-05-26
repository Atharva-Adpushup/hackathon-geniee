import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import ScriptInjectionTool from '../components/Settings/SiteBody/ScriptInjectionTool/index';

const mapStateToProps = (state, ownProps) => {
	return {
		...ownProps
	};
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(ScriptInjectionTool);
