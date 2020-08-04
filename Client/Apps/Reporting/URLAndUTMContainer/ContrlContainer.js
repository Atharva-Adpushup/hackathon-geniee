import { connect } from 'react-redux';
import Control from '../../components/URLAndUTMReporting/Control';
import { checkReportTypeGlobal } from '../../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const { isForOps } = ownProps;
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData }
	} = state.global;
	const urlMeta =
		isForOps || isReportTypeGlobal ? { ...globalReportMetaData } : { ...accountReportMetaData };
	const {
		data: { filter, metrics, dimension, interval, site, urlMetrics }
	} = urlMeta;

	return {
		filter,
		metrics,
		dimension,
		urlMetrics,
		interval,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
