import React from 'react';
import SelectBox from '../../../../../Components/SelectBox/index';
import Empty from '../../../../../Components/Empty/index';
import Pagegroups from './Pagegroups';

class RegexVerification extends React.Component {
	constructor(props) {
		super(props);
		const { sites = {} } = this.props;
		const siteIds = Object.keys(sites);
		const options = siteIds.map(siteId => {
			const current = sites[siteId];
			return {
				name: `${current.siteDomain} -- ${current.siteId}`,
				value: current.siteId
			};
		});

		this.state = {
			currentSite: null,
			options
		};
	}

	handleSelect = value => this.setState({ currentSite: value });

	render() {
		const { currentSite, options } = this.state;
		const { sites = {} } = this.props;
		const site = currentSite ? sites[currentSite] : null;
		const hasSites = !!Object.keys(sites).length;

		if (!hasSites) return <Empty message="Seems like you haven't added any website" />;

		return (
			<React.Fragment>
				<SelectBox
					selected={currentSite}
					options={options}
					onSelect={this.handleSelect}
					id="regex-verification-select-site"
					title="Select Site"
				/>
				{site !== null ? <Pagegroups site={site} /> : null}
			</React.Fragment>
		);
	}
}

export default RegexVerification;
