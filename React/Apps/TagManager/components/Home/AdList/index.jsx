import React, { Component } from 'react';
import AdElement from './AdElement.jsx';

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
		const { ads } = this.state;
		return (
			<ul className="section-list row" style={{ margin: '20px 0px' }}>
				{ads.map((ad, key) => (
					<div key={key} className="col-sm-6">
						<li className="section-list-item" key={ad.id}>
							<AdElement ad={ad} />
						</li>
					</div>
				))}
			</ul>
		);
	}
}

export default AdList;
