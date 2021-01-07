import { connect } from 'react-redux';
import { updateGlobalHBAnalyticMetaData } from '../../../actions/globalActions';
import { showNotification } from '../../../actions/uiActions';
import HBAnalytic from '../components/HBAnalytic';

const mapStateToProps = (state, ownProps) => {
	const {
		hbanalytics: { global: globalHBAnalyticsMetaData },
		sites,
		user
	} = state.global;
	const hbAnalyticsMeta = globalHBAnalyticsMetaData;
	// isForOps || isReportTypeGlobal ? { ...globalHBAnalyticsMetaData } : { ...accountReportMetaData };

	return {
		...ownProps,
		hbAnalyticsMeta,
		userSites: sites.fetched ? sites.data : {},
		user,
		isHB: true
	};
};

const mapDispatchToProps = dispatch => {
	const updateReportMetaData = updateGlobalHBAnalyticMetaData;

	const computedObject = {
		updateReportMetaData: params => dispatch(updateReportMetaData(params)),
		showNotification: data => dispatch(showNotification(data))
	};

	return computedObject;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HBAnalytic);
