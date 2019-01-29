import React, { Component } from 'react';
import { CustomButton } from '../../shared/index';
import CustomList from '../CustomList';
import { pagegroupFiltering } from '../../../lib/helpers';

class PagegroupTrafficEdit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagegroups: this.props.ad.pagegroups
		};
		this.selectPagegroups = this.selectPagegroups.bind(this);
	}

	selectPagegroups(pagegroup) {
		// const pagegroups = this.state.pagegroups.concat([]);
		// if (pagegroups.includes(pagegroup)) {
		// 	pagegroups.splice(pagegroups.indexOf(pagegroup), 1);
		// } else {
		// 	pagegroups.push(pagegroup);
		// }

		// Now only one pagegroup is allowed per ad
		return pagegroup
			? this.setState({
					pagegroups: [pagegroup]
			  })
			: window.alert('Atleast one pagegroup is required for ads to run.');
	}

	render() {
		const { ad, updateTraffic, updateWrapper, onCancel, isSuperUser } = this.props;
		const { pagegroups } = this.state;

		const { filteredPagegroupsByPlatform, disabled } = pagegroupFiltering(
			window.iam.channels,
			ad.formatData.platform,
			ad.formatData.format,
			this.props.meta,
			true,
			ad.pagegroups
		);

		return (
			<div className="options-wrapper" id="edit-traffic-pagegroups">
				<CustomList
					// multiSelect
					simpleList
					leftSize={0}
					rightSize={12}
					toMatch={pagegroups[0]}
					options={filteredPagegroupsByPlatform}
					disabled={!!disabled.size}
					toDisable={[...disabled]}
					message="Seems like you have reached the limt to create ad for this format. Please delete/modify an existing ad"
					onClick={this.selectPagegroups}
				/>
				<CustomButton label="Cancel" handler={onCancel} />
				<CustomButton
					label="Save"
					handler={() => {
						if (this.state.pagegroups.length) {
							if (ad.isActive) {
								updateTraffic(
									ad.id,
									{
										platform: ad.formatData.platform,
										format: ad.formatData.format,
										pagegroups: this.state.pagegroups,
										networkData: {
											...ad.networkData,
											logWritten: false
										}
									},
									isSuperUser
								);
							} else {
								updateWrapper({
									networkData: {
										...ad.networkData,
										logWritten: false
									},
									pagegroups: this.state.pagegroups
								});
							}
							return onCancel();
						}
						return window.alert('Please select at least one pagegroup');
					}}
				/>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

export default PagegroupTrafficEdit;
