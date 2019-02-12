import React, { Component } from 'react';
import { Col, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { ADCODE, AMP_MESSAGE } from '../../../configs/commonConsts';
// import Edit from '../../shared/Edit';
import { CustomButton } from '../../shared/index';
import AdNetworkDetails from './AdNetworkDetails';
// import AdEventDetails from './AdEventDetails';
// import LazyLoadSettings from './LazyLoadSettings';
import Tags from '../../../../../Components/Tags/index';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showEventDetails: false,
			showLazyload: false,
			editName: false,
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive')
				? props.ad.isActive
				: true
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
		this.updateWrapper = this.updateWrapper.bind(this);
	}

	getAMPAdCode = ({ formatData }) =>
		formatData.network && formatData.networkData && formatData.networkData.adCode
			? formatData.networkData.adCode
			: AMP_MESSAGE;

	disableAd() {
		const { ad, updateAd, modifyAdOnServer } = this.props;
		const { isActive } = this.state;
		const message = isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (window.confirm(message)) {
			this.setState(
				{
					isActive: !isActive
				},
				() =>
					window.isSuperUser
						? updateAd(ad.id, { isActive, archivedOn: +new Date() })
						: modifyAdOnServer(ad.id, { isActive, archivedOn: +new Date() })
			);
		}
	}

	toggleHandler(property) {
		this.setState(state => ({ [property]: !state[property] }));
	}

	updateWrapper(data) {
		const { updateAd, modifyAdOnServer, ad } = this.props;
		return window.isSuperUser ? updateAd(ad.id, data) : modifyAdOnServer(ad.id, data);
	}

	renderInformation = (label, value) => (
		<p>
			{label}: <strong>{value}</strong>
		</p>
	);

	renderAdDetails() {
		const { ad, updateAd, networkConfig } = this.props;
		const { showEventDetails, showLazyload, showNetworkDetails, editName, isActive } = this.state;
		const isAMP = ad.formatData.type === 'amp';

		let code = isAMP ? this.getAMPAdCode(ad) : ADCODE;
		code = code ? code.replace(/__AD_ID__/g, ad.id) : null;

		if (showNetworkDetails) {
			return (
				<AdNetworkDetails
					ad={ad}
					onCancel={() => this.toggleHandler('showNetworkDetails')}
					onSubmit={updateAd}
					networkConfig={networkConfig}
				/>
			);
		}
		if (showEventDetails) {
			// return (
			// 	<AdEventDetails
			// 		ad={ad}
			// 		onCancel={() => this.toggleHandler('showEventDetails')}
			// 		onSubmit={updateAd}
			// 	/>
			// );
		} else if (editName) {
			// return (
			// 	<Edit
			// 		label="Ad Name"
			// 		name={`name-${ad.id}`}
			// 		value={ad.name ? ad.name : `Ad-${ad.id}`}
			// 		onSave={this.updateWrapper}
			// 		onCancel={() => this.toggleHandler('editName')}
			// 		leftSize={3}
			// 		rightSize={9}
			// 	/>
			// );
		} else if (showLazyload) {
			// return (
			// 	<LazyLoadSettings
			// 		checked={ad.enableLazyLoading}
			// 		id={ad.id}
			// 		changeHandler={payload => updateAd(ad.id, payload)}
			// 		cancelHandler={() => this.toggleHandler('showLazyLoad')}
			// 	/>
			// );
		}
		return (
			<div key={`adDetails${ad.id}`}>
				{window.isSuperUser && !isActive ? (
					<Tags labels={['Archived']} labelClasses="custom-label" />
				) : null}
				{this.renderInformation('Id', ad.id)}
				<p>
					Name: <strong>{ad.name ? ad.name : `Ad-${ad.id}`}</strong>{' '}
					<OverlayTrigger
						placement="bottom"
						overlay={<Tooltip id="ad-name-edit">Edit Ad Name</Tooltip>}
					>
						<span
							className="adDetails-icon"
							onClick={() => this.toggleHandler('editName')}
							style={{ cursor: 'pointer' }}
						>
							<i className="btn-icn-edit" />
						</span>
					</OverlayTrigger>
				</p>
				{this.renderInformation('Platform', makeFirstLetterCapitalize(ad.formatData.platform))}
				{this.renderInformation(
					'Type',
					`${makeFirstLetterCapitalize(ad.formatData.type)} ${
						ad.formatData.placement ? makeFirstLetterCapitalize(ad.formatData.placement) : ''
					}`
				)}
				{this.renderInformation(
					'Size',
					ad.width === 'responsive'
						? makeFirstLetterCapitalize(ad.width)
						: `${ad.width}x${ad.height}`
				)}
				{window.isSuperUser ? (
					<div>
						{this.renderInformation(
							'Network',
							ad.network && ad.networkData ? ad.network.toUpperCase() : 'Not Set'
						)}
						{this.renderInformation('Status', ad.isActive ? 'Active' : 'Archived')}
					</div>
				) : null}
				<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
				{window.isSuperUser || true ? (
					<div>
						<CustomButton
							label="Network Details"
							handler={() => this.toggleHandler('showNetworkDetails')}
						/>
						<CustomButton
							label="Lazyload Settings"
							handler={() => this.toggleHandler('showLazyload')}
						/>
					</div>
				) : null}
				{!isAMP ? <CustomButton label="Copy Adcode" handler={() => copyToClipBoard(code)} /> : null}
			</div>
		);
	}

	render() {
		const { ad } = this.props;
		const { isActive } = this.state;

		return (
			<div key={`adElement-${ad.id}`}>
				<OverlayTrigger
					placement="bottom"
					overlay={
						<Tooltip id="delete-ad-tooltip">{isActive ? 'Archive Ad' : 'Unarchive Ad'}</Tooltip>
					}
				>
					<Button className="btn-close" onClick={this.disableAd}>
						x
					</Button>
				</OverlayTrigger>
				<Col xs={3} className="ad-image">
					<img src={`/assets/images/tagManager/${ad.formatData.type}.png`} alt="Ad Type" />
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
