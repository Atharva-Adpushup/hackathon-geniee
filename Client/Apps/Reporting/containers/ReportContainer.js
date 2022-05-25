import { connect } from 'react-redux';
import {
	updateGlobalReportMetaData,
	updateAccountReportMetaData,
	updateSuperUserAccountReportMetaData
} from '../../../actions/globalActions';
import { showNotification } from '../../../actions/uiActions';
import { overrideOpsPanelUniqueImpValue } from '../../../actions/userActions';
import Report from '../components/Report';
import { checkReportTypeGlobal, getReportsMeta } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const { sites, user } = state.global;
	const reportsMeta = getReportsMeta(state, ownProps);

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

	let updateReportMetaData = null;

	if (isForOps && isReportTypeGlobal) {
		updateReportMetaData = updateGlobalReportMetaData;
	} else if (isForOps && !isReportTypeGlobal) {
		updateReportMetaData = updateSuperUserAccountReportMetaData;
	} else {
		updateReportMetaData = updateAccountReportMetaData;
	}

	const computedObject = {
		updateReportMetaData: params => dispatch(updateReportMetaData(params)),
		showNotification: data => dispatch(showNotification(data)),
		overrideOpsPanelUniqueImpValue: data => dispatch(overrideOpsPanelUniqueImpValue(data))
	};

	return computedObject;
};

export default connect(mapStateToProps, mapDispatchToProps)(Report);
