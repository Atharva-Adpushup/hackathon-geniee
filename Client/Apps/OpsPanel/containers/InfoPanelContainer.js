import { connect } from 'react-redux';
import InfoPanel from '../components/InfoPanel/index';
import { showNotification } from '../../../actions/uiActions';
import {
	updateGlobalReportMetaData,
	updateAccountReportMetaData,
	updateSuperUserAccountReportMetaData
} from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			global: globalReportMetaData,
			account: accountReportMetaDta,
			accountForSuperUser: accountForSuperUserReportMetaData
		},
		user,
		sites,
		associatedAccounts
	} = state.global;

	let associatedSites = [];
	if (associatedAccounts.data.length) {
		associatedSites = associatedAccounts.data.reduce(
			(acc, account) => acc.concat(account.siteIds),
			[]
		);
	}

	return {
		...ownProps,
		user,
		sites: sites.fetched ? sites.data : [],
		reportType: ownProps.reportType,
		globalReportMetaData,
		accountReportMetaDta,
		accountForSuperUserReportMetaData,
		associatedSites
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateGlobalReportMetaData: params => dispatch(updateGlobalReportMetaData(params)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params)),
	updateSuperUserAccountReportMetaData: params =>
		dispatch(updateSuperUserAccountReportMetaData(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoPanel);
