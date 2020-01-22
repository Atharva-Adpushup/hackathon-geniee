import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import ApLite from '../components/Settings/SiteBody/ApLite/index';

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
	{ showNotification }
)(ApLite);
