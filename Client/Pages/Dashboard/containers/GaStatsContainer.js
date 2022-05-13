import { connect } from 'react-redux';
import GaStats from '../components/GaStats';
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
		data: { metrics, dimension, site }
	} = reportsMeta;

	return {
		...ownProps,
		dimension,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(GaStats);
