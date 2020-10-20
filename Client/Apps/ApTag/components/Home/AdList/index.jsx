/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import AdElement from './AdElement';
import CustomButton from '../../../../../Components/CustomButton/index';
import Empty from '../../../../../Components/Empty/index';
import Loader from '../../../../../Components/Loader';
import ActionCard from '../../../../../Components/ActionCard';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';

class AdList extends Component {
	componentDidMount() {
		const { loading, fetchAds, siteId } = this.props;
		if (loading) fetchAds({ siteId });
	}

	handleBulkFluidToggle = state => {
		const { ads, updateAllAds, siteId } = this.props;
		const adsWithFluidToggle = ads.map(ad => ({ ...ad, fluid: state }));
		return updateAllAds(siteId, adsWithFluidToggle);
	};

	render() {
		const {
			loading,
			ads = [],
			masterSave,
			updateAd,
			modifyAdOnServer,
			user,
			networkConfig,
			siteId
		} = this.props;
		const customStyle = user.isSuperUser ? { minHeight: '540px' } : { minHeight: '440px' };
		const isBulkFluidEnabled = ads.every(ad => ad.fluid);
		if (loading) {
			return <Loader />;
		}
		if (!ads.length) {
			return <Empty message="Seems kind of empty here" />;
		}
		return (
			<ActionCard>
				<ul className="section-list row">
					{user.isSuperUser ? (
						<div>
							<div>
								<CustomButton
									variant="primary"
									className="u-margin-t3 u-margin-r2 pull-right"
									onClick={() => masterSave(siteId, user.isSuperUser)}
								>
									Master Save
								</CustomButton>
								<div style={{ clear: 'both' }}>&nbsp;</div>
							</div>
							<CustomToggleSwitch
								layout="horizontal"
								className="u-margin-b4"
								checked={isBulkFluidEnabled}
								onChange={this.handleBulkFluidToggle}
								labelText="Enable or Disable Fluid on all units"
								labelBold
								on="Enable"
								off="Disable"
								defaultLayout
								name="toggle-fluid"
								id="toggle-fluid"
							/>
						</div>
					) : null}
					{ads.map((ad, key) =>
						!Object.prototype.hasOwnProperty.call(ad, 'isActive') ||
						ad.isActive ||
						user.isSuperUser ? (
							<div key={key} className="col-sm-6">
								<li className="section-list-item" key={ad.id} style={customStyle}>
									<AdElement
										ad={ad}
										user={user}
										updateAd={updateAd}
										modifyAdOnServer={modifyAdOnServer}
										networkConfig={networkConfig}
										siteId={siteId}
									/>
								</li>
							</div>
						) : null
					)}
				</ul>
			</ActionCard>
		);
	}
}

export default AdList;
