import React from 'react';
import SelectBox from '../../../../../Components/Selectbox/index';
import Content from './Content';

class BackupAds extends React.Component {
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
		const { sites, showNotification } = this.props;
		const site = currentSite ? sites[currentSite] : null;

		return (
			<React.Fragment>
				<SelectBox
					selected={currentSite}
					options={options}
					onSelect={this.handleSelect}
					id="regex-verification-select-site"
					title="Select Site"
				/>
				{site !== null ? <Content site={site} showNotification={showNotification} /> : null}
			</React.Fragment>
		);
	}
}

export default BackupAds;
