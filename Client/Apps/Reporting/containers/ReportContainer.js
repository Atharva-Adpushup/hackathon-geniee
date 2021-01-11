import { connect } from 'react-redux';
import {
	updateAccountReportMetaData,
	updateGlobalReportMetaData
} from '../../../actions/globalActions';
import { showNotification } from '../../../actions/uiActions';
import { overrideOpsPanelUniqueImpValue } from '../../../actions/userActions';
import Report from '../components/Report';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const { isForOps } = ownProps;
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData },
		sites,
		user
	} = state.global;
	const reportsMeta =
		isForOps || isReportTypeGlobal ? { ...globalReportMetaData } : { ...accountReportMetaData };

	return {
		...ownProps,
		reportsMeta,
		userSites: sites.fetched ? sites.data : {},
		user
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const { isForOps } = ownProps;

	const updateReportMetaData =
		isForOps || isReportTypeGlobal ? updateGlobalReportMetaData : updateAccountReportMetaData;
	const computedObject = {
		updateReportMetaData: params => dispatch(updateReportMetaData(params)),
		showNotification: data => dispatch(showNotification(data)),
		overrideOpsPanelUniqueImpValue: data => dispatch(overrideOpsPanelUniqueImpValue(data))
	};

	return computedObject;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Report);
