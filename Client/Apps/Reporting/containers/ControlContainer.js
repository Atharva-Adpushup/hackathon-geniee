import { connect } from 'react-redux';
import Control from '../components/Control';
import { getReportsMeta } from '../../../helpers/commonFunctions';
import { showReportingDelayPopup } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const reportsMeta = getReportsMeta(state, ownProps);
	const {
		data: { filter, metrics, dimension, interval, site, hbMetrics }
	} = reportsMeta;

	return {
		filter,
		metrics,
		dimension,
		hbMetrics,
		interval,
		site,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => {
	const computedObject = {
		showReportingDelayPopup: time => dispatch(showReportingDelayPopup(time))
	};

	return computedObject;
};

export default connect(mapStateToProps, mapDispatchToProps)(Control);
