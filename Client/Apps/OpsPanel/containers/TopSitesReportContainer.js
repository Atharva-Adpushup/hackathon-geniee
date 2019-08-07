import { connect } from 'react-redux';
import TopSitesReport from '../components/InfoPanel/TopSitesReport';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { metrics }
		}
	} = state.global;

	return {
		...ownProps,
		metrics
	};
};

export default connect(mapStateToProps)(TopSitesReport);
