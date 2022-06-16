import { connect } from 'react-redux';
import Table from '../components/Table';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { metrics, dimension, site }
	} = reportsMeta;
	return {
		metrics,
		dimension,
		site,
		...ownProps,
		memoizedAggregation: {}
	};
};

export default connect(mapStateToProps)(Table);
