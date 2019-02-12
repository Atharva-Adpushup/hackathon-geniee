import React, { Component } from 'react';
import AdElement from './AdElement';
import { CustomButton, EmptyState } from '../../shared/index';
import Loader from '../../../../../Components/Loader';

class AdList extends Component {
	componentDidMount() {
		const { loading, fetchAds, location } = this.props;
		if (loading) fetchAds({ siteId: 1 });
	}

	render() {
		const { loading, ads = [], masterSave, updateAd, modifyAdOnServer, networkConfig } = this.props;
		const customStyle = window.isSuperUser ? { minHeight: '520px' } : { minHeight: '420px' };

		if (loading) {
			return (
				<div style={{ height: '600px' }}>
					<Loader />
				</div>
			);
		}
		if (!ads.length) {
			return <EmptyState message="Seems kind of empty here" />;
		}
		return (
			<ul className="section-list row">
				{window.isSuperUser ? (
					<div>
						<CustomButton
							label="Master Save"
							handler={() => masterSave(window.siteId, window.isSuperUser)}
							classNames="mr-10"
						/>
						<div style={{ clear: 'both' }}>&nbsp;</div>
					</div>
				) : null}
				{ads.map((ad, key) =>
					!Object.prototype.hasOwnProperty.call(ad, 'isActive') ||
					ad.isActive ||
					window.isSuperUser ? (
						<div key={key} className="col-sm-6">
							<li className="section-list-item" key={ad.id} style={customStyle}>
								<AdElement
									ad={ad}
									updateAd={updateAd}
									modifyAdOnServer={modifyAdOnServer}
									networkConfig={networkConfig}
								/>
							</li>
						</div>
					) : null
				)}
			</ul>
		);
	}
}

export default AdList;
