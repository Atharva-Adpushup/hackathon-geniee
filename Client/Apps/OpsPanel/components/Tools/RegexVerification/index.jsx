import React from 'react';
import SelectBox from '../../../../../Components/Selectbox/index';

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
			sites: options
		};
	}

	render() {
		const { currentSite, sites } = this.state;

		return (
			<SelectBox
				selected={currentSite}
				options={sites}
				onSelect={() => {}}
				id="regex-verification-select-site"
				title="Select Site"
			/>
		);
	}
}

export default RegexVerification;
