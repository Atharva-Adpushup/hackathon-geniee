import { connect } from 'react-redux';
import Chart from '../../components/HBAnalytics/Chart';
import { checkReportTypeGlobal } from '../../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const { isForOps, isHB } = ownProps;
	const {
		hbanalytics: { account: accountReportMetaData, global: globalHBAnalyticsMetaData }
	} = state.global;
	const hbAnalyticsMeta = globalHBAnalyticsMetaData;

	const {
		data: { filter, metrics, dimension, site }
	} = hbAnalyticsMeta;
	return {
		isHB,
		filter,
		metrics,
		dimension,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Chart);
