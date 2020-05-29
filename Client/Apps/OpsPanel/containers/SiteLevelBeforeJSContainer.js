import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import SiteLevelBeforeJS from '../components/Settings/SiteBody/SiteLevelBeforeJS/index';

const mapStateToProps = (state, ownProps) => {
	const {
		sites: { data }
	} = state.global;
	return {
		sitesData: data,
		...ownProps
	};
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(SiteLevelBeforeJS);
