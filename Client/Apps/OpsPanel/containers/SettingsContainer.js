import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import { updateAppStatus } from '../../../actions/siteActions';

import Settings from '../components/Settings/SiteBody/Settings.jsx';

const mapStateToProps = (state, ownProps) => {
	const {
		user: { data }
	} = state.global;

	return {
		...ownProps,
		userData: data
	};
};

export default connect(
	mapStateToProps,
	{ showNotification, updateAppStatus }
)(Settings);
