import { connect } from 'react-redux';
import { fetchNetworkWiseData, fetchMetricsData, fetchModeWiseTrafficData } from '../actions/globalMetricChartsActions';
import ModuleWrapper from '../components/ModuleWrapper.jsx';

const mapStateToProps = (state, ownProps) => ({
		charts: state.globalMetricCharts
	}),
	mapDispatchToProps = dispatch => ({
		fetchNetworkWiseData: params => dispatch(fetchNetworkWiseData(params)),
		fetchMetricsData: params => dispatch(fetchMetricsData(params)),
		fetchModeWiseTrafficData: params => dispatch(fetchModeWiseTrafficData(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleWrapper);
