import { connect } from 'react-redux';
import PerformanceOverview from '../components/PerformanceOverview';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { site, metrics }
	} = reportsMeta;

	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(PerformanceOverview);
