/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import AdElement from './AdElement';
import CustomButton from '../../../../../Components/CustomButton/index';
import Empty from '../../../../../Components/Empty/index';
import Loader from '../../../../../Components/Loader';
import ActionCard from '../../../../../Components/ActionCard';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';
import { NETWORK_MAPPINGS } from '../../../configs/commonConsts';

class AdList extends Component {
	state = {
		dfpMessage: 'click on master save to start dfp syncing'
	};

	componentDidMount() {
		const { loading, fetchAds, siteId } = this.props;
		if (loading) fetchAds({ siteId });
	}

	handleBulkFluidToggle = state => {
		const { ads, updateAllAds, siteId } = this.props;
		const adsWithFluidToggle = ads.map(ad => ({ ...ad, fluid: state }));
		return updateAllAds(siteId, adsWithFluidToggle);
	};

	onBulkAssignAdpTagNetwork = () => {
		const { ads = [], siteId, replaceAds } = this.props;
		const adsWithAdpTags = ads.map(ad => {
			if (ad.network === NETWORK_MAPPINGS.ADPTAGS) return ad;
			return {
				...ad,
				network: NETWORK_MAPPINGS.ADPTAGS,
				networkData: {
					dfpAdUnitId: '',
					headerBidding: false,
					isResponsive: false,
					keyValues: { FP_S_A: 0 },
					overrideActive: false,
					overrideSizeTo: null,
					refreshInterval: 30,
					refreshSlot: false
				}
			};
		});
		replaceAds(siteId, adsWithAdpTags);
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
			siteId,
			siteDomain,
			networkCode,
			customProps
		} = this.props;
		const { dfpMessage } = this.state;
		const customStyle = user.isSuperUser ? { minHeight: '540px' } : { minHeight: '440px' };
		const isBulkFluidEnabled = ads.every(ad => ad.fluid);
		const doesAllAdsHaveAdpTagNetwork = ads.every(ad => ad.network === NETWORK_MAPPINGS.ADPTAGS);

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

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
							<CustomButton
								variant="primary"
								className="u-margin-t3 u-margin-r2 pull-right"
								onClick={() => {
									masterSave(siteId, dataForAuditLogs);
									this.setState({
										dfpMessage:
											'DFP Sync service is running. Code will be available here once it is completed.'
									});
								}}
							>
								Master Save
							</CustomButton>
							<CustomButton
								variant="primary"
								className="u-margin-t3 u-margin-r2 pull-right"
								onClick={this.onBulkAssignAdpTagNetwork}
								disabled={doesAllAdsHaveAdpTagNetwork}
							>
								Bulk Assign AdpTags network
							</CustomButton>
							<div style={{ clear: 'both' }}>&nbsp;</div>
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
										siteDomain={siteDomain}
										dfpMessage={dfpMessage}
										networkCode={networkCode}
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
