import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { adCode, adCodeVideo, ampMessage } from '../../../configs/commonConsts';
import Edit from '../../shared/Edit.jsx';
import { CustomButton } from '../../shared/index.jsx';
import AdNetworkDetails from './AdNetworkDetails.jsx';
import AdEventDetails from './AdEventDetails.jsx';
import LazyLoadSettings from './LazyLoadSettings.jsx';
import Tags from '../../../../../Components/Tags';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showEventDetails: false,
			showLazyload: false,
			editName: false,
			isActive: props.ad.hasOwnProperty('isActive') ? props.ad.isActive : true
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
		this.updateWrapper = this.updateWrapper.bind(this);
	}

	toggleHandler(property) {
		this.setState({
			[property]: !this.state[property]
		});
	}

	disableAd() {
		const { ad, updateAd, modifyAdOnServer } = this.props;
		const message = this.state.isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (confirm(message)) {
			this.setState(
				{
					isActive: !this.state.isActive
				},
				() =>
					(window.isSuperUser
						? updateAd(ad.id, {
								isActive: this.state.isActive,
								archivedOn: +new Date()
							})
						: modifyAdOnServer(ad.id, {
								isActive: this.state.isActive,
								archivedOn: +new Date()
							}))
			);
		}
	}

	getAMPAdCode(ad) {
		return ad.formatData.network && ad.formatData.networkData && ad.formatData.networkData.adCode
			? ad.formatData.networkData.adCode
			: ampMessage;
	}

	renderInformation(label, value) {
		return (
			<p>
				{label}: <strong>{value}</strong>
			</p>
		);
	}

	updateWrapper(data) {
		return window.isSuperUser
			? this.props.updateAd(this.props.ad.id, data)
			: this.props.modifyAdOnServer(this.props.ad.id, data);
	}

	renderAdDetails() {
		const { ad, updateAd, networkConfig } = this.props;
		const isAMP = ad.formatData.type == 'amp';

		let code = isAMP ? this.getAMPAdCode(ad) : adCode;
		code = code ? code.replace(/__AD_ID__/g, ad.id) : null;

		if (this.state.showNetworkDetails) {
			return (
				<AdNetworkDetails
					ad={ad}
					onCancel={this.toggleHandler.bind(null, 'showNetworkDetails')}
					onSubmit={updateAd}
					networkConfig={networkConfig}
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
					onSave={this.updateWrapper}
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
		}
		return (
			<div key={`adDetails${ad.id}`}>
				{window.isSuperUser && !this.state.isActive
					? <Tags labels={['Archived']} labelClasses="custom-label" />
					: null}
				{this.renderInformation('Id', ad.id)}
				<p>
					Name: <strong>{ad.name ? ad.name : `Ad-${ad.id}`}</strong>{' '}
					<OverlayTrigger placement="bottom" overlay={<Tooltip id="ad-name-edit">Edit Ad Name</Tooltip>}>
						<span
							className="adDetails-icon"
							onClick={this.toggleHandler.bind(null, 'editName')}
							style={{ cursor: 'pointer' }}
						>
							<i className="btn-icn-edit" />
						</span>
					</OverlayTrigger>
				</p>
				{this.renderInformation('Platform', makeFirstLetterCapitalize(ad.formatData.platform))}
				{this.renderInformation(
					'Type',
					`${makeFirstLetterCapitalize(ad.formatData.type)} ${ad.formatData.placement ? makeFirstLetterCapitalize(ad.formatData.placement) : ''}`
				)}
				{this.renderInformation(
					'Size',
					ad.width === 'responsive' ? makeFirstLetterCapitalize(ad.width) : `${ad.width}x${ad.height}`
				)}
				{window.isSuperUser
					? <div>
							{this.renderInformation(
								'Network',
								ad.network && ad.networkData ? ad.network.toUpperCase() : 'Not Set'
							)}
							{this.renderInformation('Status', ad.isActive ? 'Active' : 'Archived')}
						</div>
					: null}
				<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
				{window.isSuperUser
					? <div>
							<CustomButton
								label="Network Details"
								handler={this.toggleHandler.bind(null, 'showNetworkDetails')}
							/>
							<CustomButton
								label="Lazyload Settings"
								handler={this.toggleHandler.bind(null, 'showLazyload')}
							/>
						</div>
					: null}
				{!isAMP ? <CustomButton label="Copy Adcode" handler={copyToClipBoard.bind(null, code)} /> : null}
			</div>
		);
	}

	render() {
		const { ad } = this.props;

		return (
			<div key={`adELement-${ad.id}`}>
				<OverlayTrigger
					placement="bottom"
					overlay={
						<Tooltip id="delete-ad-tooltip">{this.state.isActive ? 'Archive Ad' : 'Unarchive Ad'}</Tooltip>
					}
				>
					<Button className="btn-close" onClick={this.disableAd}>
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
