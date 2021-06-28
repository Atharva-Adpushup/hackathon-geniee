import { connect } from 'react-redux';
import MySites from '../components/index';
import { addNewSite, deleteSite } from '../../../actions/siteActions';
import { updateAccountReportMetaData } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	const {
		data: { sites, isSuperUser }
	} = user;

	const {
		reports: { account: accountReportMetaData },
		sites: { data: globalSites }
	} = state.global;

	return {
		sites,
		user: user.data,
		reportsMeta: accountReportMetaData,
		globalSites,
		isSuperUser,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateSiteData: siteObj => dispatch(addNewSite(siteObj)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params)),
	deleteSite: (siteId, dataForAuditLogs) => dispatch(deleteSite(siteId, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MySites);
