import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { adCode, adCodeVideo } from '../../../configs/commonConsts';
import { CustomButton } from '../../shared/index.jsx';
import AdNetworkDetails from './AdNetworkDetails.jsx';
import AdEventDetails from './AdEventDetails.jsx';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showEventDetails: false,
			isActive: props.ad.isActive || true
		};
		this.toggleNetworkDetails = this.toggleNetworkDetails.bind(this);
		this.toggleEventDetails = this.toggleEventDetails.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
	}

	toggleNetworkDetails() {
		this.setState({
			showNetworkDetails: !this.state.showNetworkDetails
		});
	}

	toggleEventDetails() {
		this.setState({
			showEventDetails: !this.state.showEventDetails
		});
	}

	disableAd(ad) {
		if (confirm('Are you sure you want to archive this ad?')) {
			this.setState(
				{
					isActive: !this.state.isActive
				},
				() => {
					this.props.updateAd(ad.id, {
						isActive: this.state.isActive,
						archivedOn: +new Date()
					});
				}
			);
		}
	}

	renderAdDetails() {
		const { ad, updateAd } = this.props,
			showAdCode = ad.formatData.type == 'display' || ad.formatData.type == 'video' ? true : false;

		let code = showAdCode ? (ad.formatData.type == 'display' ? adCode : adCodeVideo) : null;
		code = code ? code.replace(/__AD_ID__/g, ad.id) : null;

		if (this.state.showNetworkDetails) {
			return <AdNetworkDetails ad={ad} onCancel={this.toggleNetworkDetails} onSubmit={updateAd} />;
		} else if (this.state.showEventDetails) {
			return <AdEventDetails ad={ad} onCancel={this.toggleEventDetails} onSubmit={updateAd} />;
		} else {
			return (
				<div key={'adDetails' + ad.id}>
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
							{ad.formatData.placement ? ' ' + makeFirstLetterCapitalize(ad.formatData.placement) : ''}
						</strong>
					</p>
					<p>
						Size:{' '}
						<strong>
							{this.ad.width == 'responsive'
								? makeFirstLetterCapitalize(ad.width)
								: `${ad.width}x${ad.height}`}
						</strong>
					</p>
					{showAdCode ? <pre>{code}</pre> : null}
					{window.isSuperUser ? (
						<CustomButton label="Network Details" handler={this.toggleNetworkDetails} />
					) : null}
					{/* {window.isSuperUser && ad.formatData.type == 'sticky' ? (
						<CustomButton label="Ad Event Details" handler={this.toggleEventDetails} />
					) : null} */}
					{showAdCode ? (
						<CustomButton label="Copy Adcode" handler={copyToClipBoard.bind(null, code)} />
					) : null}
				</div>
			);
		}
	}

	render() {
		const { ad } = this.props;

		return (
			<div key={`adELement-${ad.id}`}>
				<OverlayTrigger placement="bottom" overlay={<Tooltip id="delete-ad-tooltip">Archive Ad</Tooltip>}>
					<Button className="btn-close" onClick={this.disableAd.bind(null, ad)}>
						x
					</Button>
				</OverlayTrigger>
				<Col xs={3} className="ad-image">
					<img src={`/assets/images/tagManager/types/${ad.formatData.type}.png`} />
				</Col>
				<Col xs={9} className="ad-details">
					{this.renderAdDetails()}
				</Col>
			</div>
		);
	}
}

export default AdElement;
