import { connect } from 'react-redux';
import Table from '../components/Table';
import { getReportsMeta } from '../../../helpers/commonFunctions';
import { findUsers } from '../../../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { metrics, dimension, site }
	} = reportsMeta;
	const {
		global: { user, findUsers }
	} = state;

	return {
		metrics,
		dimension,
		site,
		...ownProps,
		memoizedAggregation: {},
		user: user.data,
		findUsersData: findUsers.data
	};
};

export default connect(mapStateToProps)(Table);
