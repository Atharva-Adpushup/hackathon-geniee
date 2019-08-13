import { connect } from 'react-redux';
import MySites from '../components/index';
import { addNewSite } from '../../../actions/siteActions';
import { fetchReportingMeta } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: {
			data: { sites, isSuperUser }
		},
		reports,
		sites: { data: globalSites }
	} = state.global;

	return {
		sites,
		reportsMeta: reports,
		globalSites,
		isSuperUser,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateSiteData: siteObj => dispatch(addNewSite(siteObj)),
	fetchReportingMeta: params => dispatch(fetchReportingMeta(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MySites);
