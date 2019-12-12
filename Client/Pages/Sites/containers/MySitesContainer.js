import { connect } from 'react-redux';
import MySites from '../components/index';
import { addNewSite, deleteSite } from '../../../actions/siteActions';
import { updateAccountReportMetaData } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: {
			data: { sites, isSuperUser }
		},
		reports: { account: accountReportMetaData },
		sites: { data: globalSites }
	} = state.global;

	return {
		sites,
		reportsMeta: accountReportMetaData,
		globalSites,
		isSuperUser,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateSiteData: siteObj => dispatch(addNewSite(siteObj)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params)),
	deleteSite: siteId => dispatch(deleteSite(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MySites);
