import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import ApLite from '../components/Settings/SiteBody/ApLite/index';
import { fetchHBInitDataAction } from '../../../actions/apps/headerBidding/hbActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: { data }
	} = state.global;
	const {
		headerBidding: { sites = {} }
	} = state.apps;

	return {
		...ownProps,
		headerBiddingData: sites,
		userData: data
	};
};

export default connect(
	mapStateToProps,
	{ showNotification, fetchHBInitDataAction }
)(ApLite);
