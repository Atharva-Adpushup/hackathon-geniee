import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import SiteLevelBeforeJS from '../components/Settings/SiteBody/SiteLevelBeforeJS/index';

const mapStateToProps = (state, ownProps) => {
	return {
		...ownProps
	};
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(SiteLevelBeforeJS);
