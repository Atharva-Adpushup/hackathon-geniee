import { connect } from 'react-redux';
import InfoPanel from '../components/InfoPanel/index';
import { showNotification } from '../../../actions/uiActions';
import {
	updateAccountReportMetaData,
	updateGlobalReportMetaData
} from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData },
		user,
		sites
	} = state.global;

	return {
		...ownProps,
		user,
		sites: sites.fetched ? sites.data : [],
		reportType: ownProps.reportType,
		accountReportMetaData,
		globalReportMetaData
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params)),
	updateGlobalReportMetaData: params => dispatch(updateGlobalReportMetaData(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(InfoPanel);
