import { connect } from 'react-redux';
import EstimatedEarnings from '../components/EstimatedEarnings';
import { getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);

	const {
		data: { site }
	} = reportsMeta;

	return {
		...ownProps,
		site
	};
};

export default connect(mapStateToProps)(EstimatedEarnings);
