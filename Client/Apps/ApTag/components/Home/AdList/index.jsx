import React, { Component } from 'react';
import AdElement from './AdElement.jsx';
import { CustomButton, EmptyState } from '../../shared/index.jsx';
import Loader from '../../../../../Components/Loader';

class AdList extends Component {
	componentDidMount() {
		this.props.loading ? this.props.fetchAds({ siteId: window.siteId }) : null;
	}

	render() {
		const { loading, ads, masterSave, updateAd, modifyAdOnServer, networkConfig } = this.props,
			customStyle = window.isSuperUser ? { minHeight: '520px' } : { minHeight: '420px' };

		if (loading) {
			return (
				<div style={{ height: '600px' }}>
					<Loader />
				</div>
			);
		} else if (!ads.length) {
			return <EmptyState message="Seems kind of empty here" />;
		}
		return (
			<ul className="section-list row" style={{ margin: '20px 0px' }}>
				{window.isSuperUser
					? <div>
							<CustomButton
								label={'Master Save'}
								handler={masterSave.bind(null, window.siteId, window.isSuperUser)}
								classNames="mr-10"
							/>
							<div style={{ clear: 'both' }}>&nbsp;</div>
						</div>
					: null}
				{ads.map((ad, key) => {
					return !ad.hasOwnProperty('isActive') || ad.isActive || window.isSuperUser
						? <div key={key} className="col-sm-6">
								<li className="section-list-item" key={ad.id} style={customStyle}>
									<AdElement
										ad={ad}
										updateAd={updateAd}
										modifyAdOnServer={modifyAdOnServer}
										networkConfig={networkConfig}
									/>
								</li>
							</div>
						: null;
				})}
			</ul>
		);
	}
}

export default AdList;
