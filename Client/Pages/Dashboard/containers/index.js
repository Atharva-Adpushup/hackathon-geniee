import { connect } from 'react-redux';
import Dashboard from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: {
				dashboard: { widget: widget }
			}
		}
	} = state.global;
	return {
		...ownProps,
		widget
	};
};

export default connect(
	mapStateToProps,
	null
)(Dashboard);
