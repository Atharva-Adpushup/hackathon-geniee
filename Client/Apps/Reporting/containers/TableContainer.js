import { connect } from 'react-redux';
import Table from '../components/Table';
import { checkDefaultReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkDefaultReportTypeGlobal(ownProps);
	const { isForOps, isHB } = ownProps;
	if (!isHB) {
		const {
			reports: { account: accountReportMetaData, global: globalReportMetaData }
		} = state.global;
		const reportsMeta =
			isForOps || isReportTypeGlobal ? { ...globalReportMetaData } : { ...accountReportMetaData };
		const {
			data: { metrics, dimension, site }
		} = reportsMeta;

		return {
			metrics,
			dimension,
			site,
			...ownProps
		};
	}
	const {
		hbanalytics: { account: accountReportMetaData, global: globalHBAnalyticsMetaData }
	} = state.global;
	const hbAnalyticsMeta = globalHBAnalyticsMetaData;

	const {
		data: { metrics, dimension, site }
	} = hbAnalyticsMeta;

	return {
		metrics,
		dimension,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Table);