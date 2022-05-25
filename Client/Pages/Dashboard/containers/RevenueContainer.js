import { connect } from 'react-redux';
import Revenue from '../components/Revenue';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { site, metrics, filter }
	} = reportsMeta;

	return {
		...ownProps,
		site,
		metrics,
		filter
	};
};

export default connect(mapStateToProps)(Revenue);
