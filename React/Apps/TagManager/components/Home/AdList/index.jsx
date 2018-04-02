import React, { Component } from 'react';
import AdElement from './AdElement.jsx';
import { CustomButton } from '../../shared/index.jsx';

class AdList extends Component {
	constructor(props) {
		super(props);
		const loaded = this.props.ads && this.props.ads.length ? true : false;
		this.state = {
			loaded: loaded,
			hasAds: loaded,
			ads: this.props.ads || []
		};
	}

	componentDidMount() {
		!this.state.loaded ? this.props.fetchAds({ siteId: this.props.match.params.siteId }) : null;
	}

	componentWillReceiveProps(nextProps) {
		const hasAds = nextProps.ads && nextProps.ads.length ? true : false;
		this.setState({ loaded: true, hasAds, ads: nextProps.ads });
	}

	render() {
		const { ads } = this.state,
			customStyle = window.isSuperUser ? { minHeight: '520px' } : { minHeight: '420px' };

		return (
			// set up empty ads list graphic
			<ul className="section-list row" style={{ margin: '20px 0px' }}>
				{window.isSuperUser ? (
					<div>
						<CustomButton
							label="Master Save"
							handler={this.props.masterSave.bind(null, this.props.match.params.siteId)}
						/>
						<div style={{ clear: 'both' }}>&nbsp;</div>
					</div>
				) : null}
				{ads.map((ad, key) => (
					<div key={key} className="col-sm-6">
						<li className="section-list-item" key={ad.id} style={customStyle}>
							<AdElement ad={ad} updateAd={this.props.updateAd} />
						</li>
					</div>
				))}
			</ul>
		);
	}
}

export default AdList;
