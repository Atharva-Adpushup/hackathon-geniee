import { connect } from 'react-redux';
import {
	updateAccountReportMetaData,
	updateGlobalReportMetaData
} from '../../../actions/globalActions';
import Panel from '../components/Panel';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData },
		sites,
		user
	} = state.global;
	const reportsMeta = isReportTypeGlobal
		? { ...globalReportMetaData }
		: { ...accountReportMetaData };

	return {
		...ownProps,
		reportsMeta,
		userSites: sites.fetched ? sites.data : {},
		user
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const updateReportMetaData = isReportTypeGlobal
		? updateGlobalReportMetaData
		: updateAccountReportMetaData;
	const computedObject = {
		updateReportMetaData: params => dispatch(updateReportMetaData(params))
	};

	return computedObject;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Panel);
