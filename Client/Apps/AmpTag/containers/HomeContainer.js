import { connect } from 'react-redux';
import Home from '../components/Home/index';

const mapStateToProps = (state, ownProps) => {
	const { global: { user: { data = {} } = {}, sites } = {} } = state;
	const { match } = ownProps;

	const siteId = match.params ? match.params.siteId : false;
	const site = siteId && sites.data[siteId] ? sites.data[siteId] : false;
	return {
		site,
		user: data,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
