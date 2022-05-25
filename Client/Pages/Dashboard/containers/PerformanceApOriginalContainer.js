import { connect } from 'react-redux';
import PerformanceApOriginal from '../components/PerformanceApOriginal';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { site, metrics }
	} = reportsMeta;

	return {
		...ownProps,
		site,
		metrics
	};
};

export default connect(mapStateToProps)(PerformanceApOriginal);
