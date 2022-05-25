import { connect } from 'react-redux';
import SitewiseReport from '../components/SitewiseReport';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);
	const {
		data: { metrics, site }
	} = reportsMeta;

	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(SitewiseReport);
