import { connect } from 'react-redux';
import {
	fetchNetworkWiseData,
	fetchMetricsData,
	fetchModeWiseTrafficData,
	fetchTop10CountriesData,
	fetchTop10SitesData,
	fetchLostAndFoundLiveSitesData
} from '../actions/globalMetricChartsActions';
import ModuleWrapper from '../components/ModuleWrapper.jsx';

const mapStateToProps = (state, ownProps) => ({
		charts: state.globalMetricCharts
	}),
	mapDispatchToProps = dispatch => ({
		fetchNetworkWiseData: params => dispatch(fetchNetworkWiseData(params)),
		fetchMetricsData: params => dispatch(fetchMetricsData(params)),
		fetchModeWiseTrafficData: params => dispatch(fetchModeWiseTrafficData(params)),
		fetchTop10CountriesData: params => dispatch(fetchTop10CountriesData(params)),
		fetchTop10SitesData: params => dispatch(fetchTop10SitesData(params)),
		fetchLostAndFoundLiveSitesData: params => dispatch(fetchLostAndFoundLiveSitesData(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleWrapper);
