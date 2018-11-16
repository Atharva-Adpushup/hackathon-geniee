import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { adCode, adCodeVideo, ampMessage } from '../../../configs/commonConsts';
import Edit from '../../shared/Edit.jsx';
import { CustomButton } from '../../shared/index.jsx';
import AdNetworkDetails from './AdNetworkDetails.jsx';
import AdEventDetails from './AdEventDetails.jsx';
import LazyLoadSettings from './LazyLoadSettings.jsx';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showEventDetails: false,
			showLazyload: false,
			editName: false,
			isActive: props.ad.isActive || true
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
	}

	toggleHandler(property) {
		this.setState({
			[property]: !this.state[property]
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

	getAMPAdCode(ad) {
		return ad.formatData.network && ad.formatData.networkData && ad.formatData.networkData.adCode
			? ad.formatData.networkData.adCode
			: ampMessage;
	}

	renderAdDetails() {
		const { ad, updateAd } = this.props,
			isAMP = ad.formatData.type == 'amp' ? true : false;

		let code = isAMP ? this.getAMPAdCode(ad) : adCode;
		code = code ? code.replace(/__AD_ID__/g, ad.id) : null;

		if (this.state.showNetworkDetails) {
			return (
				<AdNetworkDetails
					ad={ad}
					onCancel={this.toggleHandler.bind(null, 'showNetworkDetails')}
					onSubmit={updateAd}
				/>
			);
		} else if (this.state.showEventDetails) {
			return (
				<AdEventDetails
					ad={ad}
					onCancel={this.toggleHandler.bind(null, 'showEventDetails')}
					onSubmit={updateAd}
				/>
			);
		} else if (this.state.editName) {
			return (
				<Edit
					label="Ad Name"
					name={`name-${ad.id}`}
					value={ad.name ? ad.name : `Ad-${ad.id}`}
					onSave={updateAd.bind(null, ad.id)}
					onCancel={this.toggleHandler.bind(null, 'editName')}
					leftSize={3}
					rightSize={9}
				/>
			);
		} else if (this.state.showLazyload) {
			return (
				<LazyLoadSettings
					checked={ad.enableLazyLoading}
					id={ad.id}
					changeHandler={updateAd.bind(null, ad.id)}
					cancelHandler={this.toggleHandler.bind(null, 'showLazyload')}
				/>
			);
		} else {
			return (
				<div key={'adDetails' + ad.id}>
					<p>
						Id: <strong>{ad.id}</strong>
					</p>
					<p>
						Name: <strong>{ad.name ? ad.name : `Ad-${ad.id}`}</strong>{' '}
						{window.isSuperUser ? (
							<OverlayTrigger
								placement="bottom"
								overlay={<Tooltip id="ad-name-edit">Edit Ad Name</Tooltip>}
							>
								<span
									className="adDetails-icon"
									onClick={this.toggleHandler.bind(null, 'editName')}
									style={{ cursor: 'pointer' }}
								>
									<i className="btn-icn-edit" />
								</span>
							</OverlayTrigger>
						) : null}
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
							{ad.width == 'responsive'
								? makeFirstLetterCapitalize(ad.width)
								: `${ad.width}x${ad.height}`}
						</strong>
					</p>
					{window.isSuperUser ? (
						<p>
							Network :{' '}
							<strong>{ad.network && ad.networkData ? ad.network.toUpperCase() : 'Not Set'}</strong>
						</p>
					) : null}
					{window.isSuperUser ? (
						<p>
							Status : <strong>{ad.isActive ? 'Active' : 'Archived'}</strong>
						</p>
					) : null}
					<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
					{window.isSuperUser ? (
						<div>
							<CustomButton
								label="Network Details"
								handler={this.toggleHandler.bind(null, 'showNetworkDetails')}
							/>
							<CustomButton
								label="Lazyload Settings"
								handler={this.toggleHandler.bind(null, 'showLazyload')}
							/>
						</div>
					) : null}
					{!isAMP ? <CustomButton label="Copy Adcode" handler={copyToClipBoard.bind(null, code)} /> : null}
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
					<img src={`/assets/images/tagManager/${ad.formatData.type}.png`} />
				</Col>
				<Col xs={9} className="ad-details">
					{this.renderAdDetails()}
				</Col>
				<div style={{ clear: 'both' }} />
			</div>
		);
	}
}

export default AdElement;
