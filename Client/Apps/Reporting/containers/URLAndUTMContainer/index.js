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

	const userSites = sites.fetched ? sites.data : {};

	const urlReportingSites = Object.values(userSites)
		.filter(site => !!site.urlReporting)
		.map(site => site.siteId);

	const utmReportingSites = Object.values(userSites)
		.filter(site => !!site.utmReporting)
		.map(site => site.siteId);

	const urlUTMReportingMeta = globalReportMetaData;
	// if utm reporting is not enabled for any site of the publisher
	// then remove UTM option from reporting
	if (!utmReportingSites.length) {
		delete URL_UTM_DIMENSIONS.utm;
	}

	// temp change - api is breaking for monthly interval
	if (
		urlUTMReportingMeta.fetched &&
		urlUTMReportingMeta.data &&
		urlUTMReportingMeta.data.interval &&
		urlUTMReportingMeta.data.interval.monthly
	) {
		delete urlUTMReportingMeta.data.interval.monthly;
	}

	urlUTMReportingMeta.data.dimension = URL_UTM_DIMENSIONS;

	return {
		...ownProps,
		urlUTMReportingMeta,
		userSites,
		urlReportingSites,
		utmReportingSites,
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
