import React, { Component } from 'react';
import { OverlayTrigger, Tooltip, Button, Row, Col } from 'react-bootstrap';
import { makeFirstLetterCapitalize } from '../../lib/helpers';

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
		const { ads, deleteAd } = this.state;
		return (
			<ul className="section-list row" style={{ margin: '20px 0px' }}>
				{ads.map((ad, key) => (
					<div key={key} className="col-sm-6">
						<li className="section-list-item" key={ad.id}>
							<OverlayTrigger
								placement="bottom"
								overlay={<Tooltip id="delete-ad-tooltip">Delete Ad</Tooltip>}
							>
								<Button className="btn-close" type="submit">
									{/* onClick={deleteAd.bind(null, props.ad.id)} */}
									x
								</Button>
							</OverlayTrigger>
							<Col xs={4} className="ad-image">
								<img
									src={`/assets/images/tagManager/types/${ad.formatData.platform}/${
										ad.formatData.type
									}${ad.formatData.placement ? `-${ad.formatData.placement}` : ''}.png`}
								/>
							</Col>
							<Col xs={8} className="ad-details">
								<p>
									Ad Id: <strong>{ad.id}</strong>
								</p>
								<p>
									Platform: <strong>{makeFirstLetterCapitalize(ad.formatData.platform)}</strong>
								</p>
								<p>
									Type:{' '}
									<strong>
										{makeFirstLetterCapitalize(ad.formatData.type)}
										{ad.formatData.placement
											? ' ' + makeFirstLetterCapitalize(ad.formatData.placement)
											: ''}
									</strong>
								</p>
								<p>
									Size:{' '}
									<strong>
										{ad.width}x{ad.height}
									</strong>
								</p>
							</Col>
						</li>
					</div>
				))}
			</ul>
		);
	}
}

export default AdList;
