import { connect } from 'react-redux';
import { fetchGlobalMetricCharts } from '../actions/globalMetricChartsActions';
import ModuleWrapper from '../components/ModuleWrapper.jsx';

const mapStateToProps = (state, ownProps) => ({
		charts: state.charts
	}),
	mapDispatchToProps = dispatch => ({
		fetchGlobalMetricCharts: params => dispatch(fetchGlobalMetricCharts(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleWrapper);
