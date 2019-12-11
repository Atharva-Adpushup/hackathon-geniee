import { connect } from 'react-redux';
import Dashboard from '../components/index';
import { showNotification } from '../../../actions/uiActions';
import { updateAccountReportMetaData } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: { account: accountReportMetaData },
		user,
		sites
	} = state.global;
	return {
		...ownProps,
		reportsMeta: accountReportMetaData,
		// widget: reportingData.widget || {},
		user,
		// reportingSites: reportingData.site || {},
		sites: sites.fetched ? sites.data : {},
		reportType: ownProps.reportType || 'account'
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
