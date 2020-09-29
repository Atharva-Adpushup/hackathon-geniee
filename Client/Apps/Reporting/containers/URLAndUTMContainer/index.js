import { connect } from 'react-redux';
import { updateGlobalURLReportsMetaData } from '../../../../actions/globalActions';
import { showNotification } from '../../../../actions/uiActions';
import URLReports from '../../components/URLAndUTMReporting';
import { URL_UTM_DIMENSIONS } from '../../configs/commonConsts';

const mapStateToProps = (state, ownProps) => {
	const {
		urlreport: { global: globalReportMetaData },
		sites,
		user
	} = state.global;

	const urlUTMReportingMeta = globalReportMetaData;
	urlUTMReportingMeta.data.dimension = URL_UTM_DIMENSIONS;

	const userSites = sites.fetched ? sites.data : {};

	const urlReportingSites = Object.values(userSites)
		.filter(site => !!site.urlReporting)
		.map(site => site.siteId);

	return {
		...ownProps,
		urlUTMReportingMeta,
		userSites,
		urlReportingSites,
		user,
		isHB: false
	};
};

const mapDispatchToProps = dispatch => {
	const updateReportMetaData = updateGlobalURLReportsMetaData;

	const computedObject = {
		updateReportMetaData: params => dispatch(updateReportMetaData(params)),
		showNotification: data => dispatch(showNotification(data))
	};

	return computedObject;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(URLReports);
