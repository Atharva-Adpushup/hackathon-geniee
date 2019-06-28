import React from 'react';
import Empty from '../../../../../Components/Empty/index';

class Pagegroups extends React.Component {
	render() {
		const { site } = this.props;
		const { apConfigs: { pageGroupPattern = {} } = {} } = site;
		const keys = Object.keys(pageGroupPattern);

		if (!keys.length) return <Empty message="Seems like you haven't created any pagegroups yet" />;

		return 'Pagegroups';
	}
}

export default Pagegroups;
