import { connect } from 'react-redux';
import { fetchNetworkWiseData } from '../actions/globalMetricChartsActions';
import ModuleWrapper from '../components/ModuleWrapper.jsx';

const mapStateToProps = (state, ownProps) => ({
		charts: state.globalMetricCharts
	}),
	mapDispatchToProps = dispatch => ({
		fetchNetworkWiseData: params => dispatch(fetchNetworkWiseData(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleWrapper);
