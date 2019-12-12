import { connect } from 'react-redux';
import EstimatedEarnings from '../components/EstimatedEarnings';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData }
	} = state.global;
	const reportsMeta = isReportTypeGlobal
		? { ...globalReportMetaData }
		: { ...accountReportMetaData };
	const {
		data: { site }
	} = reportsMeta;

	return {
		...ownProps,
		site
	};
};

export default connect(mapStateToProps)(EstimatedEarnings);
