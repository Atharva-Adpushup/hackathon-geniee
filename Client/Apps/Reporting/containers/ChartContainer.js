import { connect } from 'react-redux';
import Chart from '../components/Chart';
import { getReportsMeta } from '../../../helpers/commonFunctions';
import CustomError from '../../../Components/CustomError/index';

const mapStateToProps = (state, ownProps) => {
	const { isHB } = ownProps;
	if (!isHB) {
		const reportsMeta = getReportsMeta(state, ownProps);

		const {
			data: { filter, metrics, dimension, site }
		} = reportsMeta;

		return {
			filter,
			metrics,
			dimension,
			site,
			...ownProps
		};
	}
	const {
		hbanalytics: { global: globalHBAnalyticsMetaData }
	} = state.global;
	const hbAnalyticsMeta = globalHBAnalyticsMetaData;

	const {
		data: { filter, metrics, dimension, site }
	} = hbAnalyticsMeta;

	if (!dimension) {
		const err = 'dimension undefined';
		throw new CustomError(err, { hbAnalyticsMeta, globalHBAnalyticsMetaData });
	}

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
