/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import AmpAdElement from './AmpAdElement';
import CustomButton from '../../../../../Components/CustomButton/index';
import Empty from '../../../../../Components/Empty/index';
import Loader from '../../../../../Components/Loader';
import ActionCard from '../../../../../Components/ActionCard';

class AmpAdList extends Component {
	state = {
		dfpMessage: 'click on master save to start dfp syncing',
		adIdsToUpdate: []
	};

	componentDidMount() {
		const { loading, fetchAmpAds, siteId } = this.props;
		if (loading) fetchAmpAds({ siteId });
	}

	adsToUpdate = id => {
		const { adIdsToUpdate } = this.state;
		if (!adIdsToUpdate.includes(id))
			this.setState({
				adIdsToUpdate: [...adIdsToUpdate, id]
			});
	};

	render() {
		const {
			loading,
			ads = [],
			masterSaveAmp,
			updateAmpAd,
			modifyAmpAdOnServer,
			user,
			siteId,
			networkCode,
			customProps
		} = this.props;

		const { adIdsToUpdate, dfpMessage } = this.state;
		const customStyle = user.isSuperUser ? { minHeight: '540px' } : { minHeight: '440px' };

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
									// replaced super user with dataForAuditLogs as it
									// was notbeing used in masterSave func
									masterSaveAmp(adIdsToUpdate, siteId, dataForAuditLogs);
									this.setState({
										adIdsToUpdate: [],
										dfpMessage:
											'DFP Sync service is running. Code will be available here once it is completed.'
									});
								}}
							>
								Master Save
							</CustomButton>
							<div style={{ clear: 'both' }}>&nbsp;</div>
						</div>
					) : null}
					{ads.map(ad =>
						!Object.prototype.hasOwnProperty.call(ad, 'isActive') ||
						ad.isActive ||
						user.isSuperUser ? (
							<div key={ad.id} className="col-sm-6">
								<li className="section-list-item" style={customStyle}>
									<AmpAdElement
										ad={ad}
										user={user}
										updateAmpAd={updateAmpAd}
										modifyAmpAdOnServer={modifyAmpAdOnServer}
										siteId={siteId}
										dataForAuditLogs={dataForAuditLogs}
										adsCount={ads.length}
										networkCode={networkCode}
										adsToUpdateOnMasterSave={this.adsToUpdate}
										dfpMessage={dfpMessage}
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

export default AmpAdList;
