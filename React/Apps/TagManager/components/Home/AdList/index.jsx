import React, { Component } from 'react';
import AdElement from './AdElement.jsx';
import { CustomButton, EmptyState } from '../../shared/index.jsx';

class AdList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			hasAds: false,
			ads: this.props.ads || []
		};
	}

	componentDidMount() {
		this.props.loading ? this.props.fetchAds({ siteId: window.siteId }) : null;
	}

	render() {
		const { loading, ads, masterSave, updateAd } = this.props,
			customStyle = window.isSuperUser ? { minHeight: '520px' } : { minHeight: '420px' };

		if (loading) {
			// Add Loader
			return <div>Loading</div>;
		} else if (!ads.length) {
			return <EmptyState message="Seems kind of empty here" />;
		}
		return (
			<ul className="section-list row" style={{ margin: '20px 0px' }}>
				{window.isSuperUser ? (
					<div>
						<CustomButton label="Master Save" handler={masterSave.bind(null, window.siteId)} />
						<div style={{ clear: 'both' }}>&nbsp;</div>
					</div>
				) : null}
				{ads.map((ad, key) => {
					return !ad.hasOwnProperty('isActive') || ad.isActive ? (
						<div key={key} className="col-sm-6">
							<li className="section-list-item" key={ad.id} style={customStyle}>
								<AdElement ad={ad} updateAd={updateAd} />
							</li>
						</div>
					) : null;
				})}
			</ul>
		);
	}
}

export default AdList;
