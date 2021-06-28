import { connect } from 'react-redux';
import Home from '../components/Home/index';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { global: { user: { data = {} } = {} } = {} } = state;
	const { siteId } = getAdsAndGlobal(state, ownProps);

	return {
		user: data,
		siteId,
		...ownProps
	};
};

const mapDispatchToProps = () => {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
