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
		this.shouldProceed = this.shouldProceed.bind(this);
	}

	selectPagegroups(pagegroup) {
		const pagegroups = this.state.pagegroups.concat([]);
		if (pagegroups.includes(pagegroup)) {
			pagegroups.splice(pagegroups.indexOf(pagegroup), 1);
		} else {
			pagegroups.push(pagegroup);
		}

		if (pagegroups.length) {
			return this.setState({
				pagegroups
			});
		}
		return alert('Atleast one pagegroup is required for ads to run.');
	}

	shouldProceed(isActive, pagegroupsFromProps) {
		return !!isActive;
		// const areCurrentPagegroupsSelected = this.state.pagegroups.some(pg => pagegroupsFromProps.includes(pg));
		// return !!(isActive || !areCurrentPagegroupsSelected);
	}

	render() {
		const { ad, onSubmit, onCancel, isSuperUser } = this.props;
		const { pagegroups } = this.state;

		const { filteredPagegroupsByPlatform, disabled } = pagegroupFiltering(
			window.iam.channels,
			ad.formatData.platform,
			ad.formatData.format,
			this.props.meta,
			true,
			pagegroups
		);

		return (
			<div className="options-wrapper" id="edit-traffic-pagegroups">
				<CustomList
					multiSelect
					simpleList
					leftSize={0}
					rightSize={12}
					toMatch={pagegroups}
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
						if (this.shouldProceed(ad.isActive, ad.pagegroups)) {
							onSubmit(
								ad.id,
								{
									platform: ad.formatData.platform,
									format: ad.formatData.format,
									pagegroups: this.state.pagegroups
								},
								isSuperUser
							);
							return onCancel();
						}
						return alert('Cannot edit archived ads');
					}}
				/>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</div>
		);
	}
}

export default PagegroupTrafficEdit;
