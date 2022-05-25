import { connect } from 'react-redux';
import Control from '../components/Control';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { filter, metrics, dimension, interval, site, hbMetrics }
	} = reportsMeta;

	return {
		filter,
		metrics,
		dimension,
		hbMetrics,
		interval,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
